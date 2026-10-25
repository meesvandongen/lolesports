import { createServerFn } from "@tanstack/react-start";
import { api } from "./api.server";
import type { ScheduleEvent } from "./types";

// The lolesports API is only called from the Worker: it keeps the cache in one
// place and avoids depending on the API's CORS policy.

export const getLeagues = createServerFn({ method: "GET" }).handler(async () => {
  const { data } = await api.get("/getLeagues", {
    query: {
      hl: "en-US",
    },
  });

  return data.leagues;
});

export const getTournamentsForLeague = createServerFn({ method: "GET" })
  .validator((leagueId: string) => leagueId)
  .handler(async ({ data: leagueId }) => {
    const { data } = await api.get("/getTournamentsForLeague", {
      query: {
        leagueId,
        hl: "en-US",
      },
    });

    return data.leagues?.[0]?.tournaments ?? [];
  });

export const getStandingsV3 = createServerFn({ method: "GET" })
  .validator((tournamentId: string) => tournamentId)
  .handler(async ({ data: tournamentId }) => {
    const { data } = await api.get("/getStandingsV3", {
      query: {
        tournamentId: [tournamentId],
        hl: "en-US",
      },
    });

    return data.standings[0]?.stages;
  });

export const getStandings = createServerFn({ method: "GET" })
  .validator((tournamentId: string) => tournamentId)
  .handler(async ({ data: tournamentId }) => {
    const { data } = await api.get("/getStandings", {
      query: {
        tournamentId: [tournamentId],
        hl: "en-US",
      },
    });

    return data.standings[0]?.stages;
  });

// The schedule endpoint is paged by cursor, not by date, so ranges are found by
// walking pages from the newest one. A Workers Free invocation may make 50
// subrequests and each page costs up to three (cache match, fetch, cache put),
// so one call walks at most 12 pages and hands back the cursor to continue from.
const maxPagesPerCall = 12;

const getSchedulePages = createServerFn({ method: "GET" })
  .validator(
    (input: {
      leagueIds: string[];
      from: string;
      to: string;
      pageToken?: string;
      direction?: "older" | "newer";
    }) => input,
  )
  .handler(async ({ data: { leagueIds, from, to, pageToken, direction } }) => {
    const fromTime = Date.parse(from);
    const toTime = Date.parse(to);

    const fetchPage = async (pageToken?: string) => {
      const { data } = await api.get("/getSchedule", {
        query: {
          hl: "en-US",
          ...(leagueIds.length > 0 && { leagueId: leagueIds }),
          ...(pageToken && { pageToken }),
        },
      });
      return data.schedule;
    };

    const firstPage = await fetchPage(pageToken);
    let events = firstPage.events;
    let older = direction === "newer" ? null : firstPage.pages.older;
    let newer = direction === "older" ? null : firstPage.pages.newer;
    let pagesFetched = 1;

    const needsOlder = () => events.length === 0 || Date.parse(events[0].startTime) > fromTime;
    const needsNewer = () => events.length === 0 || Date.parse(events.at(-1)!.startTime) < toTime;

    while (older && needsOlder() && pagesFetched < maxPagesPerCall) {
      const page = await fetchPage(older);
      events = [...page.events, ...events];
      older = page.pages.older;
      pagesFetched += 1;
    }

    while (newer && needsNewer() && pagesFetched < maxPagesPerCall) {
      const page = await fetchPage(newer);
      events = [...events, ...page.events];
      newer = page.pages.newer;
      pagesFetched += 1;
    }

    const matches: ScheduleEvent[] = events.filter((event) => {
      const time = Date.parse(event.startTime);
      return event.type === "match" && time >= fromTime && time <= toTime;
    });

    return {
      events: matches,
      // Cursors to continue from, when the range is not covered yet.
      older: older && needsOlder() ? older : null,
      newer: newer && needsNewer() ? newer : null,
    };
  });

// Enough for about a year of every featured league.
const maxScheduleCalls = 6;

/** Loads all matches between `from` and `to` (ISO date-times). */
export async function getScheduleRange(range: { leagueIds: string[]; from: string; to: string }) {
  const first = await getSchedulePages({ data: range });
  let events = first.events;
  let { older, newer } = first;
  let calls = 1;

  while (older && calls < maxScheduleCalls) {
    const page = await getSchedulePages({
      data: { ...range, pageToken: older, direction: "older" },
    });
    events = [...page.events, ...events];
    older = page.older;
    calls += 1;
  }

  while (newer && calls < maxScheduleCalls) {
    const page = await getSchedulePages({
      data: { ...range, pageToken: newer, direction: "newer" },
    });
    events = [...events, ...page.events];
    newer = page.newer;
    calls += 1;
  }

  return { events, complete: !older && !newer };
}
