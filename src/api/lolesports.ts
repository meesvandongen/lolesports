import { api } from "./api";
import type { ScheduleEvent } from "./types";

// The site is static, so the browser calls the lolesports API itself.

export async function getLeagues() {
  const { data } = await api.get("/getLeagues", {
    query: {
      hl: "en-US",
    },
  });

  return data.leagues;
}

export async function getTournamentsForLeague(leagueId: string) {
  const { data } = await api.get("/getTournamentsForLeague", {
    query: {
      leagueId,
      hl: "en-US",
    },
  });

  return data.leagues?.[0]?.tournaments ?? [];
}

export async function getStandingsV3(tournamentId: string) {
  const { data } = await api.get("/getStandingsV3", {
    query: {
      tournamentId: [tournamentId],
      hl: "en-US",
    },
  });

  return data.standings[0]?.stages;
}

export async function getStandings(tournamentId: string) {
  const { data } = await api.get("/getStandings", {
    query: {
      tournamentId: [tournamentId],
      hl: "en-US",
    },
  });

  return data.standings[0]?.stages;
}

// The schedule endpoint is paged by cursor, not by date, so ranges are found by
// walking pages from the newest one. A page covers about five days of every
// featured league, so this reaches about a year back.
const maxSchedulePages = 72;

/** Loads all matches between `from` and `to` (ISO date-times). */
export async function getScheduleRange({
  leagueIds,
  from,
  to,
}: {
  leagueIds: string[];
  from: string;
  to: string;
}) {
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

  const firstPage = await fetchPage();
  let events = firstPage.events;
  let { older, newer } = firstPage.pages;
  let pagesFetched = 1;

  const needsOlder = () => events.length === 0 || Date.parse(events[0].startTime) > fromTime;
  const needsNewer = () => events.length === 0 || Date.parse(events.at(-1)!.startTime) < toTime;

  while (older && needsOlder() && pagesFetched < maxSchedulePages) {
    const page = await fetchPage(older);
    events = [...page.events, ...events];
    older = page.pages.older;
    pagesFetched += 1;
  }

  while (newer && needsNewer() && pagesFetched < maxSchedulePages) {
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
    complete: !(older && needsOlder()) && !(newer && needsNewer()),
  };
}
