import type {
  MatchesSection,
  ScheduleEvent,
  StandingsMatch,
  StandingsMatchTeam,
} from "@/api/types";

export interface ScheduledMatch {
  match: StandingsMatch;
  /** The standings section the match belongs to, e.g. "Group A". */
  section: string;
  startTime?: string;
  /** The schedule's block, e.g. "Week 3" or "Playoffs". */
  block?: string;
  bestOf?: number;
}

export interface Block {
  name: string;
  matches: ScheduledMatch[];
  /** False for the matches the schedule has no date for. */
  dated: boolean;
}

export const isTbd = (team: { code: string }) => team.code === "TBD";

/**
 * A match's teams with all their fields. The generated type intersects two team
 * array types, and TypeScript only merges their elements when indexing.
 */
export function teamsOf(match: StandingsMatch): StandingsMatchTeam[] {
  return [match.teams[0], match.teams[1]];
}

/**
 * The standings' matches with their date, block and format from the schedule,
 * in the order they were played. Matches the schedule does not know come last.
 */
export function scheduleMatches(sections: MatchesSection[], events: ScheduleEvent[]) {
  const eventsById = new Map(events.map((event) => [event.match.id, event]));
  const matches: ScheduledMatch[] = sections.flatMap((section) =>
    section.matches.map((match) => {
      const event = eventsById.get(match.id);
      return {
        match,
        section: section.name,
        startTime: event?.startTime,
        block: event?.blockName ?? undefined,
        bestOf: event?.match.strategy?.count,
      };
    }),
  );

  return matches.toSorted((a, b) => {
    if (a.startTime && b.startTime) return a.startTime.localeCompare(b.startTime);
    if (a.startTime) return -1;
    if (b.startTime) return 1;
    // Match ids grow over time.
    return a.match.id.localeCompare(b.match.id, undefined, { numeric: true });
  });
}

/** Chronological matches grouped by block, in the order the blocks started. */
export function groupByBlock(matches: ScheduledMatch[]): Block[] {
  const blocks = new Map<string, Block>();
  const undated: ScheduledMatch[] = [];
  for (const scheduled of matches) {
    if (!scheduled.startTime) {
      undated.push(scheduled);
      continue;
    }
    const name = scheduled.block ?? "Matches";
    const block = blocks.get(name) ?? { name, matches: [], dated: true };
    block.matches.push(scheduled);
    blocks.set(name, block);
  }
  const result = [...blocks.values()];
  if (undated.length > 0) {
    result.push({
      name: result.length > 0 ? "Date unknown" : "Matches",
      matches: undated,
      dated: false,
    });
  }
  return result;
}

/** A team's series and game record over the played matches. */
export function teamRecord(matches: ScheduledMatch[], code: string) {
  const record = { series: { wins: 0, losses: 0 }, games: { wins: 0, losses: 0 } };
  for (const { match } of matches) {
    if (match.state !== "completed") continue;
    const team = teamsOf(match).find((candidate) => candidate.code === code);
    const opponent = teamsOf(match).find((candidate) => candidate.code !== code);
    if (!team || !opponent) continue;
    if (team.result?.outcome === "win") record.series.wins += 1;
    if (team.result?.outcome === "loss") record.series.losses += 1;
    record.games.wins += team.result?.gameWins ?? 0;
    record.games.losses += opponent.result?.gameWins ?? 0;
  }
  return record;
}
