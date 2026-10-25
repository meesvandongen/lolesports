import { Avatar, Badge, Group, Text } from "@mantine/core";
import kebabcase from "lodash.kebabcase";
import type { League, ScheduleEvent } from "@/api/types";
import { UnstyledButtonLink } from "../links";
import classes from "./calendar.module.css";

const timeFormat = new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" });

export function formatTime(startTime: string) {
  return timeFormat.format(new Date(startTime));
}

const leagueColors = [
  "blue",
  "teal",
  "grape",
  "orange",
  "pink",
  "cyan",
  "lime",
  "violet",
  "yellow",
  "red",
  "indigo",
  "green",
];

/** A stable color per league, so a league is recognizable across the calendar. */
export function leagueColor(slug: string) {
  let hash = 0;
  for (const char of slug) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }
  return leagueColors[hash % leagueColors.length];
}

export function LiveBadge({ event }: { event: ScheduleEvent }) {
  if (event.state === "inProgress") {
    return (
      <Badge color="red" size="xs" variant="filled">
        Live
      </Badge>
    );
  }
  return null;
}

/** Links to the league's page when the league is known. */
export function LeagueLink({
  league,
  children,
  className,
  style,
}: {
  league: League | undefined;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  if (!league) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }

  return (
    <UnstyledButtonLink
      to="/$regionTag/$leagueId"
      params={{ regionTag: kebabcase(league.region), leagueId: league.id }}
      className={className}
      style={style}
    >
      {children}
    </UnstyledButtonLink>
  );
}

export function MatchCard({
  event,
  league,
  highlightTeam,
}: {
  event: ScheduleEvent;
  league: League | undefined;
  highlightTeam: string | undefined;
}) {
  const live = event.state === "inProgress";
  const strategy = event.match.strategy;

  return (
    <LeagueLink
      league={league}
      className={classes.matchCard}
      style={{ borderLeftColor: `var(--mantine-color-${leagueColor(event.league.slug)}-6)` }}
    >
      <Text fz="xs" c={live ? "red.5" : "dimmed"} fw={live ? 700 : undefined} truncate>
        {live ? "● Live" : formatTime(event.startTime)}
      </Text>
      {event.match.teams.map((team) => {
        const won = team.result?.outcome === "win";
        return (
          <Group key={team.code} justify="space-between" gap={4} wrap="nowrap">
            <Group gap={6} wrap="nowrap" miw={0}>
              <img src={team.image} alt="" width={18} height={18} loading="lazy" />
              <Text
                fz="sm"
                truncate
                fw={won || team.code === highlightTeam ? 700 : 400}
                c={won ? "green.4" : undefined}
                title={team.name}
              >
                {team.code}
              </Text>
            </Group>
            {event.state !== "unstarted" && (
              <Text fz="sm" fw={won ? 700 : 400}>
                {team.result?.gameWins ?? 0}
              </Text>
            )}
          </Group>
        );
      })}
      <Group gap={4} wrap="nowrap">
        <Avatar src={league?.image} size={14} radius="xs" alt="" />
        <Text fz="xs" c="dimmed" truncate>
          {event.league.name}
          {event.blockName && ` · ${event.blockName}`}
          {strategy && ` · Bo${strategy.count}`}
        </Text>
      </Group>
    </LeagueLink>
  );
}
