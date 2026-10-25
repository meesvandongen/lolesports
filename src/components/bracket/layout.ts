import type { StandingsSection } from "@/api/types";

// Lays out a standings section's matches for drawing. The API describes each
// section as columns of named cells holding matches, and says where every team
// in a match comes from (its `origin`):
// - `match`: the winner (slot 1) or loser (slot 2) of an earlier match,
// - `decisionPoint`: a pairing made by the organiser, such as a Swiss round or
//   seeding from an earlier stage,
// - `seeding`: a seed (slot) entering the bracket.
//
// Elimination brackets are drawn as trees following the winners, with lower
// bracket cells in a band of their own. Swiss stages are pairings by record, so
// their rounds are drawn as pools of teams with the same win-loss record.

export type Column = StandingsSection["columns"][number];
export type Cell = Column["cells"][number];
export type Match = Cell["matches"][number];
export type Team = Match["teams"][number];

export const CARD_WIDTH = 196;
export const ROW_HEIGHT = 30;
export const CARD_HEIGHT = ROW_HEIGHT * 2;
const COLUMN_GAP = 56;
const ROW_GAP = 16;
const SLOT = CARD_HEIGHT + ROW_GAP;
const TITLE_HEIGHT = 32;
const BAND_TITLE_HEIGHT = 28;
const BAND_GAP = 32;
export const POOL_PADDING = 8;
export const POOL_HEADER = 26;
const POOL_GAP = 20;
const POOL_WIDTH = CARD_WIDTH + POOL_PADDING * 2;
export const OUTCOME_ROW = 26;

export type Band = "upper" | "lower";

export interface MatchNode {
  match: Match;
  x: number;
  y: number;
  /** Name of the cell the match is in, e.g. "Upper Bracket - Semifinals". */
  cellName: string;
  /** Short name used in "Winner of …" labels, e.g. "Semifinal 2". */
  label: string;
}

export interface Edge {
  id: string;
  from: string;
  to: string;
  /** Index of the receiving team in the target match. */
  slot: number;
  outcome: "winner" | "loser";
  points: [number, number][];
  /** Drawn only while following a team: where the losers go. */
  hidden: boolean;
}

export interface Title {
  x: number;
  y: number;
  width: number;
  text: string;
  variant: "band" | "column";
}

export interface Pool {
  key: string;
  wins: number;
  losses: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface OutcomeGroup {
  key: string;
  wins: number;
  losses: number;
  status: "advanced" | "eliminated" | "final";
  teams: Team[];
  /** How many teams finish with this record; the rest are still to be decided. */
  slots: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Layout {
  kind: "bracket" | "swiss";
  width: number;
  height: number;
  nodes: MatchNode[];
  edges: Edge[];
  titles: Title[];
  pools: Pool[];
  poolLinks: { id: string; outcome: "winner" | "loser"; points: [number, number][] }[];
  outcomes: OutcomeGroup[];
}

export function bandOf(cellName: string): Band {
  return /^(lower|loser)/i.test(cellName) ? "lower" : "upper";
}

/** "Upper Bracket - Semifinals" → "Semifinals". */
export function shortCellName(cellName: string) {
  return cellName.replace(/^(upper|lower|winner's|loser's) bracket( - )?/i, "") || cellName;
}

export function isTbd(team: Team) {
  return team.code === "TBD" || team.id === "0";
}

function singular(name: string) {
  return name.replace(/(final)s$/i, "$1").replace(/s$/, "");
}

interface Entry {
  match: Match;
  cell: Cell;
  /** The cell name to show; differs from the API's for grand finals. */
  name: string;
  band: Band;
  column: number;
  order: number;
}

function collect(section: StandingsSection) {
  const entries: Entry[] = [];
  // Empty columns are dropped, so they leave no gap.
  const columns = section.columns.filter((column) =>
    column.cells.some((cell) => cell.matches.length > 0),
  );
  // With a lower bracket, the plain "Finals" cell is the grand final, not to be
  // confused with the upper and lower bracket finals.
  const doubleElimination = columns.some((column) =>
    column.cells.some((cell) => bandOf(cell.name) === "lower"),
  );
  columns.forEach((column, columnIndex) => {
    for (const cell of column.cells) {
      const name = doubleElimination && /^finals?$/i.test(cell.name) ? "Grand Finals" : cell.name;
      for (const match of cell.matches) {
        entries.push({
          match,
          cell,
          name,
          band: bandOf(cell.name),
          column: columnIndex,
          order: entries.length,
        });
      }
    }
  });

  // Cells without an upper or lower bracket prefix, like a "Round 1" before the
  // lower bracket, belong where their winners go.
  const prefixed = (entry: Entry) =>
    /^(upper|lower|winner's|loser's) bracket/i.test(entry.cell.name);
  for (const entry of entries.toReversed()) {
    if (prefixed(entry)) continue;
    const next = entries.filter((other) =>
      other.match.teams.some(
        (team) =>
          team.origin.type === "match" &&
          team.origin.slot === 1 &&
          team.origin.structuralId === entry.match.structuralId,
      ),
    );
    if (next.length > 0 && next.every((other) => other.band === "lower")) {
      entry.band = "lower";
    }
  }
  return { entries, columnCount: columns.length };
}

const isThirdPlace = (match: Match, name: string) =>
  /finals?$/i.test(name) &&
  match.teams.every((team) => team.origin.type === "match" && team.origin.slot === 2);

function labelFor(entry: Entry) {
  // A final between the semifinal losers.
  if (isThirdPlace(entry.match, entry.name)) {
    return "Third place match";
  }
  const short = shortCellName(entry.name);
  const prefix =
    entry.band === "lower" && /^(lower|loser)/i.test(entry.name)
      ? "Lower "
      : /^(upper|winner)/i.test(entry.name)
        ? "Upper "
        : "";
  const base = prefix + singular(short);
  const siblings = entry.cell.matches.filter((match) => !isThirdPlace(match, entry.name));
  if (siblings.length === 1) {
    return base;
  }
  return `${base} ${siblings.indexOf(entry.match) + 1}`;
}

function columnX(column: number) {
  return column * (CARD_WIDTH + COLUMN_GAP);
}

/** Elbow connector from the right of a card to a team row of another card. */
function connector(from: MatchNode, to: MatchNode, slot: number): [number, number][] {
  const startX = from.x + CARD_WIDTH;
  const startY = from.y + CARD_HEIGHT / 2;
  const endX = to.x;
  const endY = to.y + ROW_HEIGHT * slot + ROW_HEIGHT / 2;
  if (endX <= startX) {
    // Not left to right (does not happen in practice); draw a straight line.
    return [
      [startX, startY],
      [endX, endY],
    ];
  }
  const middleX = endX - COLUMN_GAP / 2;
  return [
    [startX, startY],
    [middleX, startY],
    [middleX, endY],
    [endX, endY],
  ];
}

function matchEdges(nodes: Map<string, MatchNode>) {
  const edges: Edge[] = [];
  for (const node of nodes.values()) {
    node.match.teams.forEach((team, slot) => {
      if (team.origin.type !== "match") {
        return;
      }
      const source = nodes.get(team.origin.structuralId);
      if (!source) {
        return;
      }
      edges.push({
        id: `${source.match.structuralId}-${node.match.structuralId}-${slot}`,
        from: source.match.structuralId,
        to: node.match.structuralId,
        slot,
        outcome: team.origin.slot === 2 ? "loser" : "winner",
        points: connector(source, node, slot),
        hidden: team.origin.slot === 2,
      });
    });
  }
  return edges;
}

// ---------------------------------------------------------------------------
// Elimination brackets

export function layoutBracket(section: StandingsSection): Layout {
  const { entries, columnCount } = collect(section);
  const byId = new Map(entries.map((entry) => [entry.match.structuralId, entry]));

  // The match a match's winner plays next, when it stays in the same band.
  const parent = new Map<string, string>();
  const children = new Map<string, { id: string; slot: number }[]>();
  for (const entry of entries) {
    entry.match.teams.forEach((team, slot) => {
      if (team.origin.type !== "match" || team.origin.slot !== 1) {
        return;
      }
      const source = byId.get(team.origin.structuralId);
      if (
        !source ||
        source.column >= entry.column ||
        source.band !== entry.band ||
        parent.has(source.match.structuralId)
      ) {
        return;
      }
      parent.set(source.match.structuralId, entry.match.structuralId);
      const list = children.get(entry.match.structuralId) ?? [];
      list.push({ id: source.match.structuralId, slot });
      children.set(entry.match.structuralId, list);
    });
  }

  const nodes = new Map<string, MatchNode>();
  const titles: Title[] = [];
  const bands = (["upper", "lower"] as const).filter((band) =>
    entries.some((entry) => entry.band === band),
  );
  let top = 0;

  for (const band of bands) {
    const bandEntries = entries.filter((entry) => entry.band === band);
    if (bands.length > 1) {
      titles.push({
        x: 0,
        y: top,
        width: columnX(columnCount) - COLUMN_GAP,
        text: band === "upper" ? "Upper bracket" : "Lower bracket",
        variant: "band",
      });
      top += BAND_TITLE_HEIGHT;
    }
    const bandTop = top + TITLE_HEIGHT;
    // Next free y per column, relative to the band.
    const bottoms = Array.from({ length: columnCount }, () => 0);

    const roots = bandEntries
      .filter((entry) => !parent.has(entry.match.structuralId))
      .toSorted((a, b) => a.column - b.column || a.order - b.order);

    for (const root of roots) {
      // Lay the tree out on its own: leaves one slot apart, parents centred on
      // their children.
      const local: { entry: Entry; y: number }[] = [];
      // Columns a link to the next match runs through, at the height it runs.
      const passes: { column: number; y: number }[] = [];
      let nextLeaf = 0;
      const place = (id: string): number => {
        const entry = byId.get(id)!;
        const kids = (children.get(id) ?? []).toSorted((a, b) => a.slot - b.slot);
        let y: number;
        if (kids.length === 0) {
          y = nextLeaf;
          nextLeaf += SLOT;
        } else {
          const ys = kids.map((kid) => {
            const kidY = place(kid.id);
            for (let column = byId.get(kid.id)!.column + 1; column < entry.column; column++) {
              passes.push({ column, y: kidY });
            }
            return kidY;
          });
          y = (ys[0] + ys.at(-1)!) / 2;
        }
        local.push({ entry, y });
        return y;
      };
      place(root.match.structuralId);

      // Then drop it into the band as high as its columns allow.
      const occupied = [...local.map(({ entry, y }) => ({ column: entry.column, y })), ...passes];
      const offset = Math.max(0, ...occupied.map(({ column, y }) => bottoms[column] - y));
      for (const { column, y } of occupied) {
        bottoms[column] = Math.max(bottoms[column], offset + y + SLOT);
      }
      for (const { entry, y } of local) {
        const finalY = offset + y;
        nodes.set(entry.match.structuralId, {
          match: entry.match,
          x: columnX(entry.column),
          y: bandTop + finalY,
          cellName: entry.name,
          label: labelFor(entry),
        });
      }
    }

    // Column titles: the cells of this band in each column.
    for (let column = 0; column < columnCount; column++) {
      const names = [
        ...new Set(
          bandEntries
            .filter((entry) => entry.column === column)
            .map((entry) => shortCellName(entry.name)),
        ),
      ];
      if (names.length > 0) {
        titles.push({
          x: columnX(column),
          y: top,
          width: CARD_WIDTH,
          text: names.join(" / "),
          variant: "column",
        });
      }
    }

    top = bandTop + Math.max(...bottoms) - ROW_GAP + BAND_GAP;
  }

  const nodeList = [...nodes.values()];
  return {
    kind: "bracket",
    width: columnX(columnCount) - COLUMN_GAP,
    height: Math.max(0, ...nodeList.map((node) => node.y + CARD_HEIGHT)),
    nodes: nodeList,
    edges: matchEdges(nodes),
    titles,
    pools: [],
    poolLinks: [],
    outcomes: [],
  };
}

// ---------------------------------------------------------------------------
// Swiss

type Record = { wins: number; losses: number };

/**
 * The number of leading columns that form a Swiss stage: rounds where every
 * team comes from a decision point (no direct match links), every known team
 * already played in round 1, and teams mostly meet teams with the same record.
 */
export function swissRoundCount(section: StandingsSection) {
  const columns = section.columns.filter((column) =>
    column.cells.some((cell) => cell.matches.length > 0),
  );
  const seen = new Set<string>();
  const records = new Map<string, Record>();
  let rounds = 0;
  let pairings = 0;
  let samePairings = 0;
  for (const [index, column] of columns.entries()) {
    const matches = column.cells.flatMap((cell) => cell.matches);
    const teams = matches.flatMap((match) => match.teams);
    if (teams.some((team) => team.origin.type === "match")) {
      break;
    }
    if (index > 0 && teams.some((team) => !isTbd(team) && !seen.has(team.code))) {
      break;
    }
    for (const match of matches) {
      const [a, b] = match.teams.map((team) => records.get(team.code));
      if (index > 0 && a && b) {
        pairings += 1;
        if (a.wins === b.wins && a.losses === b.losses) samePairings += 1;
      }
    }
    for (const team of teams) {
      seen.add(team.code);
      if (isTbd(team)) continue;
      const record = records.get(team.code) ?? { wins: 0, losses: 0 };
      if (team.result?.outcome === "win") record.wins += 1;
      if (team.result?.outcome === "loss") record.losses += 1;
      records.set(team.code, record);
    }
    rounds += 1;
  }
  // Round 2 has to re-pair round 1's teams by record for this to be Swiss.
  // Some pairings across pools happen when a pool has an odd number of teams.
  return rounds >= 2 && samePairings >= pairings * 0.75 ? rounds : 0;
}

const recordKey = ({ wins, losses }: Record) => `${wins}-${losses}`;
const byRecord = (a: Record, b: Record) => b.wins - a.wins || a.losses - b.losses;

/**
 * The pool sizes (in matches) of every round of a standard Swiss stage, where a
 * team stops playing once it reaches `threshold` wins or losses. Returns
 * undefined when that does not reproduce the actual match counts.
 */
function simulatePools(teamCount: number, matchCounts: number[], threshold: number) {
  let counts = new Map<string, Record & { teams: number }>([
    ["0-0", { wins: 0, losses: 0, teams: teamCount }],
  ]);
  const rounds: Map<string, number>[] = [];
  for (const matchCount of matchCounts) {
    const pools = new Map<string, number>();
    const next = new Map<string, Record & { teams: number }>();
    const add = (record: Record, teams: number) => {
      const key = recordKey(record);
      const current = next.get(key);
      next.set(key, { ...record, teams: (current?.teams ?? 0) + teams });
    };
    for (const pool of [...counts.values()].toSorted(byRecord)) {
      if (pool.wins >= threshold || pool.losses >= threshold || pool.teams < 2) {
        add(pool, pool.teams);
        continue;
      }
      const matches = Math.floor(pool.teams / 2);
      pools.set(recordKey(pool), matches);
      add({ wins: pool.wins + 1, losses: pool.losses }, matches);
      add({ wins: pool.wins, losses: pool.losses + 1 }, matches);
      add(pool, pool.teams - matches * 2);
    }
    const total = [...pools.values()].reduce((sum, count) => sum + count, 0);
    if (total !== matchCount) {
      return undefined;
    }
    rounds.push(pools);
    counts = next;
  }
  return { rounds, final: counts };
}

export function layoutSwiss(section: StandingsSection, roundCount: number): Layout {
  const { entries, columnCount } = collect(section);
  const rounds = Array.from({ length: roundCount }, (_, round) =>
    entries.filter((entry) => entry.column === round),
  );

  // Records before each round, from the results so far.
  const records = new Map<string, Record>();
  const recordsBefore: Map<string, Record>[] = [];
  for (const round of rounds) {
    recordsBefore.push(new Map([...records].map(([code, record]) => [code, { ...record }])));
    for (const { match } of round) {
      for (const team of match.teams) {
        if (isTbd(team)) continue;
        const record = records.get(team.code) ?? { wins: 0, losses: 0 };
        if (team.result?.outcome === "win") record.wins += 1;
        if (team.result?.outcome === "loss") record.losses += 1;
        records.set(team.code, record);
      }
    }
  }

  // Unplayed rounds have TBD teams, so their pools come from simulating the
  // format: first-to-N Swiss, or a fixed number of rounds for everyone.
  const teamCount = rounds[0].length * 2;
  const matchCounts = rounds.map((round) => round.length);
  const threshold = Math.ceil((roundCount + 1) / 2);
  const firstTo = simulatePools(teamCount, matchCounts, threshold);
  const everyone = simulatePools(teamCount, matchCounts, Infinity);
  // Only call teams advanced or eliminated when the match counts show that
  // teams stop playing at the threshold.
  const eliminates = firstTo !== undefined && everyone === undefined;
  const simulated = (eliminates ? firstTo : everyone)?.rounds;

  const pools: Pool[] = [];
  const nodes = new Map<string, MatchNode>();
  const titles: Title[] = [];
  const columnHeights: number[] = [];
  const roundPools: { record: Record; entries: Entry[] }[][] = [];

  rounds.forEach((round, roundIndex) => {
    const before = recordsBefore[roundIndex];
    const groups = new Map<string, { record: Record; entries: Entry[] }>();
    const unknown: Entry[] = [];
    for (const entry of round) {
      const known = entry.match.teams.filter((team) => !isTbd(team));
      const record =
        known.length > 0 ? (before.get(known[0].code) ?? { wins: 0, losses: 0 }) : undefined;
      if (!record) {
        unknown.push(entry);
        continue;
      }
      const key = recordKey(record);
      const group = groups.get(key) ?? { record, entries: [] };
      group.entries.push(entry);
      groups.set(key, group);
    }
    // TBD matches fill the simulated pools in order; the API lists a round's
    // matches from the best record to the worst.
    const expected = simulated?.[roundIndex];
    for (const entry of unknown) {
      const free = expected
        ? [...expected].find(([key, size]) => (groups.get(key)?.entries.length ?? 0) < size)
        : undefined;
      const key = free?.[0] ?? "?";
      const [wins, losses] = key === "?" ? [-1, -1] : key.split("-").map(Number);
      const group = groups.get(key) ?? { record: { wins, losses }, entries: [] };
      group.entries.push(entry);
      groups.set(key, group);
    }
    roundPools.push([...groups.values()].toSorted((a, b) => byRecord(a.record, b.record)));
  });

  // Each column's pools are stacked, then columns are centred on each other so
  // the stage reads as the usual diamond.
  const poolHeight = (matches: number) =>
    POOL_HEADER +
    POOL_PADDING +
    matches * CARD_HEIGHT +
    (matches - 1) * (ROW_GAP / 2) +
    POOL_PADDING;
  for (const columnPools of roundPools) {
    columnHeights.push(
      columnPools.reduce((sum, pool) => sum + poolHeight(pool.entries.length), 0) +
        (columnPools.length - 1) * POOL_GAP,
    );
  }

  // The result column: every team once the rounds are played, or the teams
  // that already reached the threshold while they are still going.
  const complete = rounds.every((round) => round.every(({ match }) => match.state === "completed"));
  const atThreshold = (record: Record) => record.wins >= threshold || record.losses >= threshold;
  // Formats the simulation cannot reproduce (odd pools) can still be first-to-N.
  const showsStatus =
    eliminates || (complete && everyone === undefined && [...records.values()].every(atThreshold));
  const exits = new Map<string, { record: Record; teams: Team[] }>();
  for (const round of rounds) {
    for (const { match } of round) {
      for (const team of match.teams) {
        const record = records.get(team.code);
        if (isTbd(team) || !record || !(complete || (eliminates && atThreshold(record)))) continue;
        const key = recordKey(record);
        const exit = exits.get(key) ?? { record, teams: [] };
        if (!exit.teams.some((other) => other.code === team.code)) {
          exit.teams.push(team);
        }
        exits.set(key, exit);
      }
    }
  }
  // A first-to-N stage in progress shows every record teams can finish with.
  if (eliminates && !complete) {
    for (const pool of firstTo.final.values()) {
      const key = recordKey(pool);
      if (atThreshold(pool) && !exits.has(key)) {
        exits.set(key, { record: pool, teams: [] });
      }
    }
  }
  const exitGroups = [...exits.values()]
    .map((group) => ({
      ...group,
      slots: Math.max(group.teams.length, firstTo?.final.get(recordKey(group.record))?.teams ?? 0),
    }))
    .toSorted((a, b) => byRecord(a.record, b.record));
  const outcomeHeight = (rows: number) => POOL_HEADER + rows * OUTCOME_ROW + POOL_PADDING;
  const outcomesHeight =
    exitGroups.reduce(
      (sum, group) => sum + outcomeHeight(eliminates ? group.slots : group.teams.length),
      0,
    ) +
    Math.max(0, exitGroups.length - 1) * POOL_GAP;

  const contentHeight = Math.max(...columnHeights, outcomesHeight);
  const poolColumnX = (round: number) => round * (POOL_WIDTH + COLUMN_GAP);

  roundPools.forEach((columnPools, round) => {
    let y = TITLE_HEIGHT + (contentHeight - columnHeights[round]) / 2;
    titles.push({
      x: poolColumnX(round),
      y: 0,
      width: POOL_WIDTH,
      text: shortCellName(rounds[round][0].name),
      variant: "column",
    });
    for (const pool of columnPools) {
      const height = poolHeight(pool.entries.length);
      const key = pool.record.wins < 0 ? "?" : recordKey(pool.record);
      pools.push({
        key: `${round}:${key}`,
        wins: pool.record.wins,
        losses: pool.record.losses,
        x: poolColumnX(round),
        y,
        width: POOL_WIDTH,
        height,
      });
      pool.entries.forEach((entry, index) => {
        nodes.set(entry.match.structuralId, {
          match: entry.match,
          x: poolColumnX(round) + POOL_PADDING,
          y: y + POOL_HEADER + POOL_PADDING + index * (CARD_HEIGHT + ROW_GAP / 2),
          cellName: entry.name,
          label:
            key === "?"
              ? labelFor(entry)
              : `${shortCellName(entry.name)} (${key.replace("-", "–")})`,
        });
      });
      y += height + POOL_GAP;
    }
  });

  // Winners move up a pool, losers down.
  const poolLinks: Layout["poolLinks"] = [];
  const poolAt = new Map(pools.map((pool) => [pool.key, pool]));
  for (let round = 0; round < roundPools.length - 1; round++) {
    for (const pool of pools.filter((pool) => pool.key.startsWith(`${round}:`))) {
      if (pool.wins < 0) continue;
      for (const outcome of ["winner", "loser"] as const) {
        const record =
          outcome === "winner"
            ? { wins: pool.wins + 1, losses: pool.losses }
            : { wins: pool.wins, losses: pool.losses + 1 };
        const target = poolAt.get(`${round + 1}:${recordKey(record)}`);
        if (!target) continue;
        const startY = pool.y + pool.height * (outcome === "winner" ? 0.3 : 0.7);
        const endY = target.y + Math.min(target.height / 2, POOL_HEADER + 20);
        poolLinks.push({
          id: `${pool.key}-${target.key}`,
          outcome,
          points: [
            [pool.x + pool.width, startY],
            [pool.x + pool.width + COLUMN_GAP / 2, startY],
            [pool.x + pool.width + COLUMN_GAP / 2, endY],
            [target.x, endY],
          ],
        });
      }
    }
  }

  // Columns after the Swiss rounds (deciders and the like) hang off the matches
  // that feed them.
  let nextX = poolColumnX(roundCount);
  for (let column = roundCount; column < columnCount; column++) {
    const columnEntries = entries.filter((entry) => entry.column === column);
    let floor = TITLE_HEIGHT;
    titles.push({
      x: nextX,
      y: 0,
      width: CARD_WIDTH,
      text: [...new Set(columnEntries.map((entry) => shortCellName(entry.name)))].join(" / "),
      variant: "column",
    });
    for (const entry of columnEntries) {
      const sources = entry.match.teams
        .map((team) =>
          team.origin.type === "match" ? nodes.get(team.origin.structuralId) : undefined,
        )
        .filter((node) => node !== undefined);
      const wanted =
        sources.length > 0
          ? sources.reduce((sum, node) => sum + node.y, 0) / sources.length
          : floor;
      const y = Math.max(floor, wanted);
      nodes.set(entry.match.structuralId, {
        match: entry.match,
        x: nextX,
        y,
        cellName: entry.name,
        label: labelFor(entry),
      });
      floor = y + SLOT;
    }
    nextX += CARD_WIDTH + COLUMN_GAP;
  }

  const outcomes: OutcomeGroup[] = [];
  if (exitGroups.length > 0) {
    let y = TITLE_HEIGHT + (contentHeight - outcomesHeight) / 2;
    titles.push({
      x: nextX,
      y: 0,
      width: POOL_WIDTH,
      text: showsStatus ? "Result" : "Records",
      variant: "column",
    });
    for (const group of exitGroups) {
      const slots = eliminates ? group.slots : group.teams.length;
      const height = outcomeHeight(slots);
      outcomes.push({
        key: recordKey(group.record),
        wins: group.record.wins,
        losses: group.record.losses,
        status: !showsStatus ? "final" : group.record.wins >= threshold ? "advanced" : "eliminated",
        teams: group.teams,
        slots,
        x: nextX,
        y,
        width: POOL_WIDTH,
        height,
      });
      y += height + POOL_GAP;
    }
    nextX += POOL_WIDTH + COLUMN_GAP;

    // Pools whose winners or losers reach the threshold feed a result group.
    // The links run along the gaps between pools, or are left out when every
    // way there crosses another pool.
    const boxes = [...pools, ...outcomes];
    const crosses = (y: number, fromX: number, toX: number, skip: object[]) =>
      boxes.some(
        (box) =>
          !skip.includes(box) &&
          box.x < toX &&
          box.x + box.width > fromX &&
          box.y - 4 < y &&
          box.y + box.height + 4 > y,
      );
    if (showsStatus) {
      for (const pool of pools) {
        if (pool.wins < 0) continue;
        for (const outcome of ["winner", "loser"] as const) {
          const record =
            outcome === "winner"
              ? { wins: pool.wins + 1, losses: pool.losses }
              : { wins: pool.wins, losses: pool.losses + 1 };
          const target = outcomes.find((group) => group.key === recordKey(record));
          if (!target || !atThreshold(record)) continue;
          const startX = pool.x + pool.width;
          const startY = pool.y + pool.height * (outcome === "winner" ? 0.3 : 0.7);
          const endY = target.y + Math.min(target.height / 2, POOL_HEADER + 20);
          const skip = [pool, target];
          const early = startX + COLUMN_GAP / 2;
          const late = target.x - COLUMN_GAP / 2;
          const points: [number, number][] | undefined = !crosses(endY, early, target.x, skip)
            ? [
                [startX, startY],
                [early, startY],
                [early, endY],
                [target.x, endY],
              ]
            : !crosses(startY, startX, late, skip)
              ? [
                  [startX, startY],
                  [late, startY],
                  [late, endY],
                  [target.x, endY],
                ]
              : undefined;
          if (points) {
            poolLinks.push({ id: `${pool.key}-result-${target.key}`, outcome, points });
          }
        }
      }
    }
  }

  const nodeList = [...nodes.values()];
  return {
    kind: "swiss",
    width: nextX - COLUMN_GAP,
    height: Math.max(TITLE_HEIGHT + contentHeight, ...nodeList.map((node) => node.y + CARD_HEIGHT)),
    nodes: nodeList,
    edges: matchEdges(nodes),
    titles,
    pools,
    poolLinks,
    outcomes,
  };
}

export function layoutSection(section: StandingsSection): Layout {
  const swissRounds = swissRoundCount(section);
  return swissRounds > 0 ? layoutSwiss(section, swissRounds) : layoutBracket(section);
}

/** "Winner of Semifinal 1", "Seed 3", or undefined when nothing is known. */
export function describeOrigin(team: Team, nodes: Map<string, MatchNode>) {
  if (team.origin.type === "match") {
    const source = nodes.get(team.origin.structuralId);
    if (source) {
      return `${team.origin.slot === 2 ? "Loser" : "Winner"} of ${source.label}`;
    }
  }
  if (team.origin.structuralId === "seeding") {
    return `Seed ${team.origin.slot}`;
  }
  return undefined;
}
