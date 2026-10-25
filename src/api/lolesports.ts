import { api } from "./api";
import type { EventGame, ScheduleEvent } from "./types";

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

// The schedule only goes back to the start of 2024; older matches have no dates.
const scheduleHistoryStart = "2024-01-01";
const maxTournamentSchedulePages = 24;

/**
 * A league's schedule from its newest page back to the start of a tournament.
 * This is where standings matches get their date, block ("Week 1") and format:
 * the standings themselves have none.
 */
export async function getTournamentSchedule({
  leagueId,
  startDate,
  endDate,
}: {
  leagueId: string;
  startDate: string;
  endDate: string;
}) {
  if (endDate < scheduleHistoryStart) {
    return [];
  }

  const fetchPage = async (pageToken?: string) => {
    const { data } = await api.get("/getSchedule", {
      query: {
        hl: "en-US",
        leagueId: [leagueId],
        ...(pageToken && { pageToken }),
      },
    });
    return data.schedule;
  };

  let page = await fetchPage();
  let events: ScheduleEvent[] = page.events;
  for (let pages = 1; pages < maxTournamentSchedulePages; pages++) {
    const earliest = page.events[0]?.startTime;
    if (!page.pages.older || (earliest !== undefined && earliest < startDate)) {
      break;
    }
    page = await fetchPage(page.pages.older);
    events = [...page.events, ...events];
  }
  return events;
}

/** A match's games, with their VODs. */
export async function getMatchGames(matchId: string): Promise<EventGame[]> {
  const { data } = await api.get("/getEventDetails", {
    query: {
      // The spec says number, but match ids are past Number.MAX_SAFE_INTEGER;
      // the id only ends up in the query string, so keep it a string.
      id: matchId as unknown as number,
      hl: "en-US",
    },
  });

  return data.event.match.games;
}
