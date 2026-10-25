import { readFileSync, readdirSync } from "node:fs";
import { describe, expect, it } from "vite-plus/test";
import type { StandingsSection } from "@/api/types";
import {
  CARD_HEIGHT,
  CARD_WIDTH,
  type Layout,
  describeOrigin,
  layoutSection,
  swissRoundCount,
} from "./layout";

// Real standings, trimmed to their bracket sections.
const fixturesDirectory = new URL("./fixtures/", import.meta.url);

type Fixture = { stages: { name: string; sections: StandingsSection[] }[] };

function load(name: string): Fixture {
  return JSON.parse(readFileSync(new URL(`${name}.json`, fixturesDirectory), "utf8"));
}

function section(name: string, stage?: string) {
  const fixture = load(name);
  return (stage ? fixture.stages.find((candidate) => candidate.name === stage)! : fixture.stages[0])
    .sections[0];
}

const fixtureNames = readdirSync(fixturesDirectory).map((file) => file.replace(/\.json$/, ""));

function nodeByLabel(layout: Layout, label: string) {
  return layout.nodes.find((node) => node.label === label)!;
}

/** Cards other than its own two that a link's horizontal runs pass through. */
function cardsCrossedBy(layout: Layout, edge: Layout["edges"][number]) {
  const crossed: string[] = [];
  edge.points.slice(1).forEach(([x, y], index) => {
    const [previousX, previousY] = edge.points[index];
    if (previousY !== y) return;
    const [left, right] = [Math.min(previousX, x), Math.max(previousX, x)];
    for (const node of layout.nodes) {
      const id = node.match.structuralId;
      if (id === edge.from || id === edge.to) continue;
      if (node.x < right && node.x + CARD_WIDTH > left && node.y < y && node.y + CARD_HEIGHT > y) {
        crossed.push(node.label);
      }
    }
  });
  return crossed;
}

describe("every fixture", () => {
  for (const name of fixtureNames) {
    for (const stage of load(name).stages) {
      for (const standingsSection of stage.sections) {
        it(`${name} / ${stage.name} / ${standingsSection.name} has no overlapping cards`, () => {
          const layout = layoutSection(standingsSection);
          const matchCount = standingsSection.columns
            .flatMap((column) => column.cells)
            .reduce((count, cell) => count + cell.matches.length, 0);
          expect(layout.nodes).toHaveLength(matchCount);

          for (const node of layout.nodes) {
            expect(node.x).toBeGreaterThanOrEqual(0);
            expect(node.y).toBeGreaterThanOrEqual(0);
            expect(node.x + CARD_WIDTH).toBeLessThanOrEqual(layout.width);
            expect(node.y + CARD_HEIGHT).toBeLessThanOrEqual(layout.height);
          }
          for (const edge of layout.edges.filter((edge) => !edge.hidden)) {
            const crossed = cardsCrossedBy(layout, edge);
            expect(crossed, `${edge.id} runs through ${crossed.join(", ")}`).toEqual([]);
          }
          layout.nodes.forEach((a, index) => {
            for (const b of layout.nodes.slice(index + 1)) {
              const overlaps =
                Math.abs(a.x - b.x) < CARD_WIDTH && Math.abs(a.y - b.y) < CARD_HEIGHT;
              expect(overlaps, `${a.label} overlaps ${b.label}`).toBe(false);
            }
          });
        });
      }
    }
  }
});

describe("Swiss", () => {
  it("groups a first-to-3 stage in progress into record pools", () => {
    const layout = layoutSection(section("worlds-2026", "Swiss"));
    expect(layout.kind).toBe("swiss");

    const poolsByRound = new Map<string, string[]>();
    for (const pool of layout.pools) {
      const [round, record] = pool.key.split(":");
      poolsByRound.set(round, [...(poolsByRound.get(round) ?? []), record]);
    }
    expect([...poolsByRound.values()]).toEqual([
      ["0-0"],
      ["1-0", "0-1"],
      ["2-0", "1-1", "0-2"],
      ["2-1", "1-2"],
      ["2-2"],
    ]);

    // Nobody is done yet, so the results are all still to be decided.
    expect(layout.outcomes.map((group) => [group.key, group.status, group.slots])).toEqual([
      ["3-0", "advanced", 2],
      ["3-1", "advanced", 3],
      ["3-2", "advanced", 3],
      ["2-3", "eliminated", 3],
      ["1-3", "eliminated", 3],
      ["0-3", "eliminated", 2],
    ]);
    expect(layout.outcomes.every((group) => group.teams.length === 0)).toBe(true);
  });

  it("finds a first-to-4 stage over seven rounds", () => {
    const layout = layoutSection(section("emea-masters-summer-2026-swiss"));
    expect(swissRoundCount(section("emea-masters-summer-2026-swiss"))).toBe(7);
    expect(layout.outcomes.map((group) => `${group.key} ${group.status}`)).toEqual([
      "4-0 advanced",
      "4-1 advanced",
      "4-2 advanced",
      "4-3 advanced",
      "3-4 eliminated",
      "2-4 eliminated",
      "1-4 eliminated",
      "0-4 eliminated",
    ]);
    expect(layout.outcomes.reduce((count, group) => count + group.teams.length, 0)).toBe(32);
  });

  it("recognises first-to-3 with uneven pools from the final records", () => {
    const layout = layoutSection(section("lcp-split-3-2026-swiss"));
    expect(layout.outcomes.every((group) => group.status !== "final")).toBe(true);
  });

  it("keeps the decider after the Swiss rounds connected to its sources", () => {
    const layout = layoutSection(section("lcs-split-1-2026-swiss"));
    expect(swissRoundCount(section("lcs-split-1-2026-swiss"))).toBe(3);
    const decider = layout.nodes.find((node) => node.cellName === "Round 4")!;
    expect(layout.edges.filter((edge) => edge.to === decider.match.structuralId)).toHaveLength(2);
  });

  it("does not treat a fixed schedule pairing winners with losers as Swiss", () => {
    expect(swissRoundCount(section("lta-north-split-3-2025-round-1"))).toBe(0);
    expect(layoutSection(section("lta-north-split-3-2025-round-1")).kind).toBe("bracket");
  });

  it("does not treat rounds of new teams as Swiss", () => {
    expect(swissRoundCount(section("lpl-knights-rivals-2026"))).toBe(0);
  });
});

describe("brackets", () => {
  it("separates the lower bracket and names the grand final", () => {
    const layout = layoutSection(section("worlds-2026", "Play-Ins"));
    expect(
      layout.titles.filter((title) => title.variant === "band").map((title) => title.text),
    ).toEqual(["Upper bracket", "Lower bracket"]);
    expect(layout.titles.some((title) => title.text === "Grand Finals")).toBe(true);

    const upperFinal = nodeByLabel(layout, "Upper Final");
    const lowerFinal = nodeByLabel(layout, "Lower Final");
    expect(lowerFinal.y).toBeGreaterThan(upperFinal.y);
    // Losers dropping to the lower bracket are only drawn while following a team.
    expect(
      layout.edges.filter((edge) => edge.outcome === "loser").every((edge) => edge.hidden),
    ).toBe(true);
  });

  it("puts an unprefixed round that feeds the lower bracket in the lower band", () => {
    const layout = layoutSection(section("lec-summer-2025-playoffs"));
    const lowerTitle = layout.titles.find((title) => title.text === "Lower bracket")!;
    const roundOne = layout.nodes.filter((node) => node.cellName === "Round 1");
    expect(roundOne).toHaveLength(2);
    expect(roundOne.every((node) => node.y > lowerTitle.y)).toBe(true);
  });

  it("centres matches on the matches that feed them", () => {
    const layout = layoutSection(section("worlds-2026", "Knockouts"));
    const final = nodeByLabel(layout, "Final");
    const semifinals = [nodeByLabel(layout, "Semifinal 1"), nodeByLabel(layout, "Semifinal 2")];
    expect(final.y).toBe((semifinals[0].y + semifinals[1].y) / 2);
  });

  it("describes where undecided teams come from", () => {
    const layout = layoutSection(section("worlds-2026", "Knockouts"));
    const nodes = new Map(layout.nodes.map((node) => [node.match.structuralId, node]));
    const semifinal = nodeByLabel(layout, "Semifinal 1");
    expect(semifinal.match.teams.map((team) => describeOrigin(team, nodes))).toEqual([
      "Winner of Quarterfinal 1",
      "Winner of Quarterfinal 2",
    ]);
  });

  it("draws a gauntlet as a line, with the separate match out of its way", () => {
    const layout = layoutSection(section("lck-road-to-msi-2026"));
    const line = layout.nodes.filter((node) => node.label !== "Round 3");
    expect(new Set(line.map((node) => node.y)).size).toBe(1);
    expect(nodeByLabel(layout, "Round 3").y).not.toBe(line[0].y);
  });

  it("names a third place match fed by the semifinal losers", () => {
    const layout = layoutSection(section("arabian-league-summer-2025-playoffs"));
    expect(layout.nodes.map((node) => node.label).toSorted()).toEqual([
      "Final",
      "Semifinal 1",
      "Semifinal 2",
      "Third place match",
    ]);
  });
});
