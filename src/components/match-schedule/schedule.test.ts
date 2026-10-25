import { describe, expect, it } from "vite-plus/test";
import type { MatchesSection, ScheduleEvent, Vod } from "@/api/types";
import { groupByBlock, scheduleMatches, teamRecord } from "./schedule";
import { gameMinutes, preferredVod, vodUrl } from "./vods";

const team = (code: string, gameWins: number, outcome: "win" | "loss" | null) => ({
  id: code,
  slug: code.toLowerCase(),
  name: code,
  code,
  image: "",
  result: { gameWins, outcome },
});

const match = (
  id: string,
  state: "completed" | "unstarted",
  a: ReturnType<typeof team>,
  b: ReturnType<typeof team>,
) => ({
  id,
  state,
  previousMatchIds: null,
  flags: null,
  teams: [a, b],
});

const sections = [
  {
    name: "Group A",
    rankings: [],
    matches: [
      match("3", "completed", team("G2", 2, "win"), team("FNC", 1, "loss")),
      match("1", "completed", team("FNC", 0, "loss"), team("KC", 2, "win")),
      match("9", "unstarted", team("G2", 0, null), team("KC", 0, null)),
    ],
  },
  {
    name: "Group B",
    rankings: [],
    matches: [match("5", "completed", team("VIT", 2, "win"), team("SK", 0, "loss"))],
  },
] as unknown as MatchesSection[];

const event = (id: string, startTime: string, blockName: string, count: 1 | 3 | 5 = 3) =>
  ({
    startTime,
    blockName,
    state: "completed",
    type: "match",
    league: { name: "LEC", slug: "lec" },
    match: { id, flags: [], teams: [], strategy: { type: "bestOf", count } },
  }) as unknown as ScheduleEvent;

const events = [
  event("1", "2026-07-24T15:00:00Z", "Week 1"),
  event("3", "2026-07-25T15:00:00Z", "Week 1"),
  event("9", "2026-08-01T15:00:00Z", "Week 2", 5),
];

describe("scheduleMatches", () => {
  it("puts matches in the order they were played, with undated ones last", () => {
    const scheduled = scheduleMatches(sections, events);
    expect(scheduled.map((item) => item.match.id)).toEqual(["1", "3", "9", "5"]);
    expect(scheduled[2]).toMatchObject({ block: "Week 2", bestOf: 5, section: "Group A" });
    expect(scheduled[3].startTime).toBeUndefined();
  });
});

describe("groupByBlock", () => {
  it("groups dated matches by block and collects the rest", () => {
    const blocks = groupByBlock(scheduleMatches(sections, events));
    expect(blocks.map((block) => [block.name, block.matches.length, block.dated])).toEqual([
      ["Week 1", 2, true],
      ["Week 2", 1, true],
      ["Date unknown", 1, false],
    ]);
  });

  it("calls everything just matches when nothing is dated", () => {
    const blocks = groupByBlock(scheduleMatches(sections, []));
    expect(blocks.map((block) => block.name)).toEqual(["Matches"]);
  });
});

describe("teamRecord", () => {
  it("counts series and games over played matches", () => {
    expect(teamRecord(scheduleMatches(sections, events), "FNC")).toEqual({
      series: { wins: 0, losses: 2 },
      games: { wins: 1, losses: 4 },
    });
  });
});

describe("VODs", () => {
  const vod = (locale: string, provider: "youtube" | "twitch", startMillis = 0): Vod =>
    ({
      parameter: `${provider}-${locale}`,
      locale,
      provider,
      offset: 0,
      startMillis,
      endMillis: startMillis + 33 * 60000,
    }) as Vod;
  const vods = [
    vod("de-DE", "youtube"),
    vod("en-GB", "youtube", 125_400),
    vod("fr-FR", "twitch", 3_723_000),
  ];

  it("prefers the viewer's language, then English", () => {
    expect(preferredVod(vods, ["fr-CA", "fr"])?.locale).toBe("fr-FR");
    expect(preferredVod(vods, ["nl-NL"])?.locale).toBe("en-GB");
  });

  it("links to where the game starts", () => {
    expect(vodUrl(vods[1])).toBe("https://www.youtube.com/watch?v=youtube-en-GB&t=125s");
    expect(vodUrl(vods[2])).toBe("https://www.twitch.tv/videos/twitch-fr-FR?t=1h2m3s");
    expect(gameMinutes(vods)).toBe(33);
  });
});
