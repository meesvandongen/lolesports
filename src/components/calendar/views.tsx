import { Avatar, Group, Popover, Stack, Text, UnstyledButton } from "@mantine/core";
import dayjs, { type Dayjs } from "dayjs";
import type { League, ScheduleEvent } from "@/api/types";
import classes from "./calendar.module.css";
import { LeagueLink, LiveBadge, MatchCard, formatTime, leagueColor } from "./match-card";
import { eachDay, getVisibleRange, groupByDay } from "./range";

type ViewProps = {
  anchor: Dayjs;
  events: ScheduleEvent[];
  leaguesBySlug: Map<string, League>;
  highlightTeam: string | undefined;
  onSelectDay: (day: Dayjs) => void;
};

const maxEventsPerMonthCell = 3;

function DayNumber({ day, onSelectDay }: { day: Dayjs; onSelectDay: (day: Dayjs) => void }) {
  return (
    <UnstyledButton
      className={classes.dayNumber}
      data-today={day.isSame(dayjs(), "day") || undefined}
      onClick={() => onSelectDay(day)}
      aria-label={`Show the week of ${day.format("MMMM D")}`}
    >
      {day.date()}
    </UnstyledButton>
  );
}

function CompactMatch({ event, league }: { event: ScheduleEvent; league: League | undefined }) {
  const [team1, team2] = event.match.teams;

  return (
    <LeagueLink league={league} className={classes.compactMatch}>
      <span
        className={classes.leagueDot}
        style={{ backgroundColor: `var(--mantine-color-${leagueColor(event.league.slug)}-6)` }}
      />
      <Text
        span
        fz="xs"
        truncate
        title={`${formatTime(event.startTime)} · ${event.league.name}: ${team1?.name} vs ${team2?.name}`}
      >
        {team1?.code} – {team2?.code}{" "}
        <Text span inherit c="dimmed">
          {formatTime(event.startTime)}
        </Text>
      </Text>
    </LeagueLink>
  );
}

export function MonthView({
  anchor,
  events,
  leaguesBySlug,
  highlightTeam,
  onSelectDay,
}: ViewProps) {
  const { start, end } = getVisibleRange("month", anchor);
  const days = eachDay(start, end);
  const eventsByDay = groupByDay(events);

  return (
    <div className={classes.monthGrid}>
      {days.slice(0, 7).map((day) => (
        <div key={day.format("ddd")} className={classes.weekdayHeader}>
          {day.format("ddd")}
        </div>
      ))}
      {days.map((day) => {
        const dayEvents = eventsByDay.get(day.format("YYYY-MM-DD")) ?? [];
        const hiddenCount = dayEvents.length - maxEventsPerMonthCell;

        return (
          <div
            key={day.valueOf()}
            className={classes.monthCell}
            data-outside={!day.isSame(anchor, "month") || undefined}
          >
            <div className={classes.monthCellHeader}>
              <DayNumber day={day} onSelectDay={onSelectDay} />
              {dayEvents.length > 0 && (
                <span className={classes.mobileCount} aria-label={`${dayEvents.length} matches`}>
                  {dayEvents.length}
                </span>
              )}
            </div>
            <div className={classes.monthCellEvents}>
              {dayEvents.slice(0, maxEventsPerMonthCell).map((event) => (
                <CompactMatch
                  key={event.match.id}
                  event={event}
                  league={leaguesBySlug.get(event.league.slug)}
                />
              ))}
              {hiddenCount > 0 && (
                <Popover width={260} position="bottom" shadow="md" withArrow>
                  <Popover.Target>
                    <UnstyledButton className={classes.moreButton}>
                      +{hiddenCount} more
                    </UnstyledButton>
                  </Popover.Target>
                  <Popover.Dropdown>
                    <Text fw={700} fz="sm" mb="xs">
                      {day.format("dddd, MMMM D")}
                    </Text>
                    <Stack gap="xs" mah={400} style={{ overflowY: "auto" }}>
                      {dayEvents.map((event) => (
                        <MatchCard
                          key={event.match.id}
                          event={event}
                          league={leaguesBySlug.get(event.league.slug)}
                          highlightTeam={highlightTeam}
                        />
                      ))}
                    </Stack>
                  </Popover.Dropdown>
                </Popover>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function WeekView({ anchor, events, leaguesBySlug, highlightTeam, onSelectDay }: ViewProps) {
  const { start, end } = getVisibleRange("week", anchor);
  const eventsByDay = groupByDay(events);

  return (
    <div className={classes.weekGrid}>
      {eachDay(start, end).map((day) => {
        const dayEvents = eventsByDay.get(day.format("YYYY-MM-DD")) ?? [];

        return (
          <div key={day.valueOf()} className={classes.weekColumn}>
            <Group gap={6} className={classes.weekColumnHeader}>
              <Text fz="sm" c="dimmed">
                {day.format("ddd")}
              </Text>
              <DayNumber day={day} onSelectDay={onSelectDay} />
            </Group>
            <div className={classes.weekColumnEvents}>
              {dayEvents.length === 0 ? (
                <Text fz="xs" c="dimmed">
                  No matches
                </Text>
              ) : (
                dayEvents.map((event) => (
                  <MatchCard
                    key={event.match.id}
                    event={event}
                    league={leaguesBySlug.get(event.league.slug)}
                    highlightTeam={highlightTeam}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function ListView({ events, leaguesBySlug, highlightTeam }: ViewProps) {
  const eventsByDay = [...groupByDay(events)];

  return (
    <Stack gap="lg">
      {eventsByDay.map(([dayKey, dayEvents]) => {
        const day = dayjs(dayKey);
        return (
          <section key={dayKey}>
            <Text
              fw={700}
              mb="xs"
              className={classes.listDayHeader}
              data-today={day.isSame(dayjs(), "day") || undefined}
            >
              {day.format("dddd, MMMM D")}
            </Text>
            <Stack gap={4}>
              {dayEvents.map((event) => {
                const league = leaguesBySlug.get(event.league.slug);
                const showScore = event.state !== "unstarted";
                const [team1, team2] = event.match.teams;

                return (
                  <LeagueLink
                    key={event.match.id}
                    league={league}
                    className={classes.listRow}
                    style={{
                      borderLeftColor: `var(--mantine-color-${leagueColor(event.league.slug)}-6)`,
                    }}
                  >
                    <Text fz="sm" c="dimmed" className={classes.listTime}>
                      {formatTime(event.startTime)}
                    </Text>
                    <div className={classes.listTeams}>
                      <ListTeam team={team1} side="left" highlightTeam={highlightTeam} />
                      <Text fz="sm" fw={700} className={classes.listScore}>
                        {showScore
                          ? `${team1?.result?.gameWins ?? 0} – ${team2?.result?.gameWins ?? 0}`
                          : "vs"}
                      </Text>
                      <ListTeam team={team2} side="right" highlightTeam={highlightTeam} />
                    </div>
                    <Group gap={6} wrap="nowrap" className={classes.listLeague}>
                      <Avatar src={league?.image} size={18} radius="xs" alt="" />
                      <Text fz="xs" c="dimmed" truncate>
                        {event.league.name}
                        {event.blockName && ` · ${event.blockName}`}
                        {event.match.strategy && ` · Bo${event.match.strategy.count}`}
                      </Text>
                      <LiveBadge event={event} />
                    </Group>
                  </LeagueLink>
                );
              })}
            </Stack>
          </section>
        );
      })}
    </Stack>
  );
}

function ListTeam({
  team,
  side,
  highlightTeam,
}: {
  team: ScheduleEvent["match"]["teams"][number] | undefined;
  side: "left" | "right";
  highlightTeam: string | undefined;
}) {
  if (!team) {
    return <div />;
  }

  const won = team.result?.outcome === "win";
  const logo = <img src={team.image} alt="" width={22} height={22} loading="lazy" />;

  return (
    <Group gap={6} wrap="nowrap" justify={side === "left" ? "flex-end" : "flex-start"} miw={0}>
      {side === "right" && logo}
      <Text
        fz="sm"
        truncate
        fw={won || team.code === highlightTeam ? 700 : 400}
        c={won ? "green.4" : undefined}
        title={team.name}
      >
        <span className={classes.teamName}>{team.name}</span>
        <span className={classes.teamCode}>{team.code}</span>
      </Text>
      {side === "left" && logo}
    </Group>
  );
}
