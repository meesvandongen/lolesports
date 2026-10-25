import {
  Badge,
  Button,
  Group,
  Loader,
  Menu,
  Paper,
  SegmentedControl,
  Select,
  Switch,
  Text,
  Title,
  UnstyledButton,
} from "@mantine/core";
import {
  IconBrandTwitch,
  IconBrandYoutube,
  IconChevronDown,
  IconLanguage,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import { Suspense, use, useState } from "react";
import { getMatchGames } from "@/api/lolesports";
import type { EventGame, StandingsMatchTeam, Vod } from "@/api/types";
import classes from "./match-schedule.module.css";
import { type ScheduledMatch, groupByBlock, isTbd, teamRecord, teamsOf } from "./schedule";
import { gameMinutes, languageName, preferredVod, vodUrl } from "./vods";

const timeFormat = new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" });

const hideResultsKey = "lolesports:hide-results";

/** A per-browser preference, so it survives reloads; storage may be unavailable. */
function useHideResults() {
  const [hidden, setHidden] = useState(() => {
    try {
      return localStorage.getItem(hideResultsKey) === "true";
    } catch {
      return false;
    }
  });
  const update = (value: boolean) => {
    setHidden(value);
    try {
      localStorage.setItem(hideResultsKey, String(value));
    } catch {
      // Not remembered, but still applied.
    }
  };
  return [hidden, update] as const;
}

export function MatchSchedule({
  matches,
  sections,
  section,
  team,
  onSectionChange,
  onTeamChange,
}: {
  matches: ScheduledMatch[];
  sections: string[];
  section: string | undefined;
  team: string | undefined;
  onSectionChange: (section: string | undefined) => void;
  onTeamChange: (team: string | undefined) => void;
}) {
  const [hideResults, setHideResults] = useHideResults();

  const inSection = matches.filter((scheduled) => !section || scheduled.section === section);
  const visible = inSection.filter(
    (scheduled) => !team || teamsOf(scheduled.match).some((candidate) => candidate.code === team),
  );
  const blocks = groupByBlock(visible);
  const live = visible.find((scheduled) => scheduled.match.state === "inProgress");
  const upNext = visible.find(
    (scheduled) => scheduled.match.state === "unstarted" && scheduled.startTime,
  );

  const teams = new Map<string, StandingsMatchTeam>();
  for (const scheduled of inSection) {
    for (const candidate of teamsOf(scheduled.match)) {
      if (!isTbd(candidate)) teams.set(candidate.code, candidate);
    }
  }
  const teamOptions = [...teams.values()]
    .map((candidate) => ({ value: candidate.code, label: candidate.name }))
    .toSorted((a, b) => a.label.localeCompare(b.label));
  const selectedTeam = team ? teams.get(team) : undefined;

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div className={classes.root}>
      <div className={classes.toolbar}>
        {sections.length > 1 && (
          <SegmentedControl
            size="xs"
            value={section ?? ""}
            onChange={(value) => onSectionChange(value || undefined)}
            data={[
              { value: "", label: "All" },
              ...sections.map((name) => ({ value: name, label: name })),
            ]}
          />
        )}
        <Select
          size="xs"
          placeholder="All teams"
          aria-label="Team"
          data={teamOptions}
          value={team ?? null}
          onChange={(value) => onTeamChange(value ?? undefined)}
          searchable
          clearable
          className={classes.teamSelect}
        />
        <Switch
          size="sm"
          label="Hide results"
          checked={hideResults}
          onChange={(event) => setHideResults(event.currentTarget.checked)}
          className={classes.spoilers}
        />
      </div>

      {selectedTeam && (
        <TeamSummary team={selectedTeam} matches={visible} hideResults={hideResults} />
      )}

      {(blocks.length > 1 || live || upNext) && (
        <Group gap={6} mb="md" className={classes.jumps}>
          {live && (
            <Button
              size="compact-xs"
              color="red"
              onClick={() => scrollTo(`match-${live.match.id}`)}
            >
              Live now
            </Button>
          )}
          {!live && upNext && (
            <Button size="compact-xs" onClick={() => scrollTo(`match-${upNext.match.id}`)}>
              Up next
            </Button>
          )}
          {blocks.length > 1 &&
            blocks.map((block, index) => (
              <Button
                key={block.name}
                size="compact-xs"
                variant="default"
                onClick={() => scrollTo(`block-${index}`)}
              >
                {block.name}
              </Button>
            ))}
        </Group>
      )}

      {blocks.length === 0 && (
        <Text c="dimmed" ta="center" py="xl">
          No matches.
        </Text>
      )}

      {blocks.map((block, index) => (
        <section key={block.name} id={`block-${index}`} className={classes.block}>
          <div className={classes.blockHeader}>
            <Title order={3}>{block.name}</Title>
            <Text fz="sm" c="dimmed">
              {block.dated && dateRange(block.matches)}
              {block.dated && " · "}
              {block.matches.length} {block.matches.length === 1 ? "match" : "matches"}
            </Text>
          </div>
          {block.dated ? (
            [...groupByDay(block.matches)].map(([day, dayMatches]) => (
              <div key={day} className={classes.day}>
                <Text
                  fz="sm"
                  fw={700}
                  className={classes.dayHeader}
                  data-today={dayjs(day).isSame(dayjs(), "day") || undefined}
                >
                  {dayjs(day).format("dddd, MMMM D")}
                </Text>
                {dayMatches.map((scheduled) => (
                  <MatchRow
                    key={scheduled.match.id}
                    scheduled={scheduled}
                    showSection={sections.length > 1 && !section}
                    hideResults={hideResults}
                    team={team}
                    upNext={scheduled === upNext}
                  />
                ))}
              </div>
            ))
          ) : (
            <div className={classes.day}>
              {block.matches.map((scheduled) => (
                <MatchRow
                  key={scheduled.match.id}
                  scheduled={scheduled}
                  showSection={sections.length > 1 && !section}
                  hideResults={hideResults}
                  team={team}
                  upNext={false}
                />
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}

function groupByDay(matches: ScheduledMatch[]) {
  const days = new Map<string, ScheduledMatch[]>();
  for (const scheduled of matches) {
    const key = dayjs(scheduled.startTime).format("YYYY-MM-DD");
    days.set(key, [...(days.get(key) ?? []), scheduled]);
  }
  return days;
}

function dateRange(matches: ScheduledMatch[]) {
  const first = dayjs(matches[0].startTime);
  const last = dayjs(matches.at(-1)!.startTime);
  if (first.isSame(last, "day")) return first.format("MMM D, YYYY");
  if (first.isSame(last, "month")) return `${first.format("MMM D")} – ${last.format("D, YYYY")}`;
  if (first.isSame(last, "year")) return `${first.format("MMM D")} – ${last.format("MMM D, YYYY")}`;
  return `${first.format("MMM D, YYYY")} – ${last.format("MMM D, YYYY")}`;
}

function TeamSummary({
  team,
  matches,
  hideResults,
}: {
  team: StandingsMatchTeam;
  matches: ScheduledMatch[];
  hideResults: boolean;
}) {
  const { series, games } = teamRecord(matches, team.code);
  const played = series.wins + series.losses;
  return (
    <Paper p="sm" mb="md" className={classes.summary}>
      <img src={team.image} alt="" width={40} height={40} />
      <div>
        <Text fw={700}>{team.name}</Text>
        <Text fz="sm" c="dimmed">
          {hideResults
            ? `${played} series played`
            : `${series.wins}–${series.losses} in series · ${games.wins}–${games.losses} in games`}
        </Text>
      </div>
    </Paper>
  );
}

function MatchRow({
  scheduled,
  showSection,
  hideResults,
  team,
  upNext,
}: {
  scheduled: ScheduledMatch;
  showSection: boolean;
  hideResults: boolean;
  team: string | undefined;
  upNext: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const { match, startTime, bestOf, section } = scheduled;
  const [team1, team2] = teamsOf(match);
  const played = match.state === "completed";
  const live = match.state === "inProgress";
  const showScore = (played || live) && !hideResults;

  return (
    <div
      id={`match-${match.id}`}
      className={classes.match}
      data-state={match.state}
      data-up-next={upNext || undefined}
    >
      <UnstyledButton
        className={classes.matchRow}
        onClick={() => setExpanded(!expanded)}
        disabled={!played}
        aria-expanded={played ? expanded : undefined}
      >
        <div className={classes.time}>
          {live ? (
            <Badge color="red" size="sm" variant="filled">
              Live
            </Badge>
          ) : startTime ? (
            timeFormat.format(new Date(startTime))
          ) : (
            "—"
          )}
          {upNext && (
            <Badge size="xs" variant="light">
              Up next
            </Badge>
          )}
        </div>
        <TeamName team={team1} side="left" showOutcome={showScore} focused={team1.code === team} />
        <div className={classes.score}>
          {showScore ? (
            <>
              <span data-won={team1.result?.outcome === "win" || undefined}>
                {team1.result?.gameWins ?? 0}
              </span>
              <span className={classes.scoreDash}>–</span>
              <span data-won={team2.result?.outcome === "win" || undefined}>
                {team2.result?.gameWins ?? 0}
              </span>
            </>
          ) : (
            <span className={classes.versus}>vs</span>
          )}
        </div>
        <TeamName team={team2} side="right" showOutcome={showScore} focused={team2.code === team} />
        <div className={classes.meta}>
          {bestOf && <span>Bo{bestOf}</span>}
          {showSection && <span>{section}</span>}
        </div>
        <div className={classes.chevron}>
          {played && <IconChevronDown size={16} data-expanded={expanded || undefined} />}
        </div>
      </UnstyledButton>
      {expanded && (
        <div className={classes.games}>
          <Suspense
            fallback={
              <Group gap="xs">
                <Loader size="xs" />
                <Text fz="sm" c="dimmed">
                  Loading games…
                </Text>
              </Group>
            }
          >
            <Games matchId={match.id} hideResults={hideResults} />
          </Suspense>
        </div>
      )}
    </div>
  );
}

function TeamName({
  team,
  side,
  showOutcome,
  focused,
}: {
  team: StandingsMatchTeam;
  side: "left" | "right";
  showOutcome: boolean;
  focused: boolean;
}) {
  const tbd = isTbd(team);
  const logo = tbd ? null : <img src={team.image} alt="" width={24} height={24} loading="lazy" />;
  return (
    <div
      className={classes.team}
      data-side={side}
      data-outcome={showOutcome ? (team.result?.outcome ?? undefined) : undefined}
      data-focused={focused || undefined}
    >
      {side === "right" && logo}
      <span className={classes.teamName} title={team.name}>
        <span className={classes.fullName}>{tbd ? "TBD" : team.name}</span>
        <span className={classes.code}>{team.code}</span>
      </span>
      {side === "left" && logo}
    </div>
  );
}

// Each match's games are fetched once, when it is first expanded.
const gamesByMatch = new Map<string, Promise<EventGame[] | Error>>();

function loadGames(matchId: string) {
  let games = gamesByMatch.get(matchId);
  if (!games) {
    games = getMatchGames(matchId).catch((error: unknown) =>
      error instanceof Error ? error : new Error(String(error)),
    );
    gamesByMatch.set(matchId, games);
  }
  return games;
}

function Games({ matchId, hideResults }: { matchId: string; hideResults: boolean }) {
  const games = use(loadGames(matchId));
  // How many games were played gives the series away, so they wait for a click.
  const [revealed, setRevealed] = useState(false);

  if (games instanceof Error) {
    return (
      <Text fz="sm" c="dimmed">
        The games could not be loaded.
      </Text>
    );
  }
  if (hideResults && !revealed) {
    return (
      <Button size="compact-sm" variant="default" onClick={() => setRevealed(true)}>
        Show games and VODs
      </Button>
    );
  }

  const played = games.filter((game) => game.state === "completed");
  if (played.length === 0) {
    return (
      <Text fz="sm" c="dimmed">
        No games recorded.
      </Text>
    );
  }

  return (
    <div className={classes.gameList}>
      {played.map((game) => (
        <Game key={game.id} game={game} />
      ))}
    </div>
  );
}

function Game({ game }: { game: EventGame }) {
  const vods: Vod[] = game.vods;
  const languages = typeof navigator === "undefined" ? [] : navigator.languages;
  const vod = preferredVod(vods, languages);
  const minutes = gameMinutes(vods);
  const others = vods.filter((candidate) => candidate !== vod && vodUrl(candidate));

  return (
    <div className={classes.game}>
      <Text fz="sm" fw={600}>
        Game {game.number}
      </Text>
      {minutes !== undefined && (
        <Text fz="sm" c="dimmed">
          {minutes} min
        </Text>
      )}
      {vod ? (
        <Group gap={4} wrap="nowrap" className={classes.vodLinks}>
          <Button
            component="a"
            href={vodUrl(vod)}
            target="_blank"
            rel="noopener noreferrer"
            size="compact-sm"
            variant="light"
            leftSection={<ProviderIcon vod={vod} />}
          >
            Watch · {languageName(vod)}
          </Button>
          {others.length > 0 && (
            <Menu position="bottom-end" withinPortal>
              <Menu.Target>
                <Button
                  size="compact-sm"
                  variant="subtle"
                  color="gray"
                  aria-label="Other languages"
                  title="Other languages"
                  leftSection={<IconLanguage size={14} />}
                >
                  {others.length}
                </Button>
              </Menu.Target>
              <Menu.Dropdown>
                {others.map((other) => (
                  <Menu.Item
                    key={other.id ?? `${other.provider}-${other.parameter}-${other.locale}`}
                    component="a"
                    href={vodUrl(other)}
                    target="_blank"
                    rel="noopener noreferrer"
                    leftSection={<ProviderIcon vod={other} />}
                  >
                    {languageName(other)}
                  </Menu.Item>
                ))}
              </Menu.Dropdown>
            </Menu>
          )}
        </Group>
      ) : (
        <Text fz="sm" c="dimmed">
          No VOD
        </Text>
      )}
    </div>
  );
}

function ProviderIcon({ vod }: { vod: Vod }) {
  return vod.provider === "twitch" ? <IconBrandTwitch size={14} /> : <IconBrandYoutube size={14} />;
}
