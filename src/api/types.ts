import type { components, operations } from "./generated";

export type League =
  operations["getLeagues"]["responses"]["200"]["content"]["application/json"]["data"]["leagues"][number];

export type Tournament = components["schemas"]["tournament"];

export type StandingsStage = components["schemas"]["standing"]["stages"][number];

export type StandingsSection = StandingsStage["sections"][number];

export type MatchesSection = components["schemas"]["section"];

type RawScheduleEvent =
  operations["getSchedule"]["responses"]["200"]["content"]["application/json"]["data"]["schedule"]["events"][number];

export type ScheduleTeam = components["schemas"]["team"] & {
  result?: components["schemas"]["result"] & { outcome: components["schemas"]["outcome"] };
  record?: components["schemas"]["record"];
};

// The generated type intersects two team array types, which TypeScript does not
// merge into one element type, so spell the teams out.
export type ScheduleEvent = Omit<RawScheduleEvent, "match"> & {
  match: Omit<RawScheduleEvent["match"], "teams"> & { teams: ScheduleTeam[] };
};

export type EventGame =
  operations["getEventDetails"]["responses"]["200"]["content"]["application/json"]["data"]["event"]["match"]["games"][number];

// The API returns more than its documented VOD fields: where in the video the
// game starts and ends, and the language's name.
export type Vod = EventGame["vods"][number] & {
  id?: string;
  startMillis?: number;
  endMillis?: number;
  mediaLocale?: { englishName: string; translatedName: string };
};

export type StandingsMatch = MatchesSection["matches"][number];

export type StandingsMatchTeam = StandingsMatch["teams"][number];
