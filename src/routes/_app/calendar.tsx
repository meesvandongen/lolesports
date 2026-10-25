import {
  ActionIcon,
  Alert,
  Avatar,
  Button,
  Center,
  Group,
  Loader,
  MultiSelect,
  SegmentedControl,
  Select,
  Text,
  Title,
} from "@mantine/core";
import {
  IconCalendarMonth,
  IconChevronLeft,
  IconChevronRight,
  IconInfoCircle,
  IconLayoutColumns,
  IconList,
} from "@tabler/icons-react";
import { createFileRoute, useLoaderData, useRouterState } from "@tanstack/react-router";
import type { Dayjs } from "dayjs";
import { useMemo } from "react";
import { getScheduleRange } from "@/api/lolesports";
import type { League } from "@/api/types";
import classes from "@/components/calendar/calendar.module.css";
import {
  type CalendarView,
  defaultCalendarView,
  formatAnchorDate,
  formatRangeTitle,
  getVisibleRange,
  isCalendarView,
  parseAnchorDate,
  shiftAnchor,
} from "@/components/calendar/range";
import { ListView, MonthView, WeekView } from "@/components/calendar/views";
import { getRegionsWithLeagues } from "@/regions-with-leagues";

type CalendarSearch = {
  view?: CalendarView;
  date?: string;
  leagues?: string[];
  team?: string;
};

export const Route = createFileRoute("/_app/calendar")({
  validateSearch: (search: Record<string, unknown>): CalendarSearch => ({
    view: isCalendarView(search.view) ? search.view : undefined,
    date:
      typeof search.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(search.date)
        ? search.date
        : undefined,
    leagues: Array.isArray(search.leagues)
      ? search.leagues.filter((league) => typeof league === "string")
      : undefined,
    team: typeof search.team === "string" ? search.team : undefined,
  }),
  // The team filter runs in the browser, so it is not a loader dependency.
  loaderDeps: ({ search: { view, date, leagues } }) => ({ view, date, leagues }),
  loader: ({ deps: { view = defaultCalendarView, date, leagues = [] } }) => {
    const { start, end } = getVisibleRange(view, parseAnchorDate(date));

    // Fetch a day extra on each side, so the range covers every time zone.
    return getScheduleRange({
      leagueIds: leagues.toSorted(),
      from: start.subtract(1, "day").toISOString(),
      to: end.add(1, "day").toISOString(),
    });
  },
  // Client-only: matches are grouped by day in the viewer's time zone, which the
  // server does not know, and each schedule call is its own Worker invocation
  // instead of one invocation chaining them all against its subrequest limit.
  ssr: false,
  pendingComponent: () => (
    <Center p="xl">
      <Loader />
    </Center>
  ),
  head: () => ({
    meta: [{ title: "Calendar - lolmath esports" }],
  }),
  component: CalendarPage,
});

const viewOptions = [
  { value: "month", label: "Month", icon: IconCalendarMonth },
  { value: "week", label: "Week", icon: IconLayoutColumns },
  { value: "list", label: "List", icon: IconList },
] satisfies { value: CalendarView; label: string; icon: typeof IconList }[];

function CalendarPage() {
  const { events, complete } = Route.useLoaderData();
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const leagues = useLoaderData({ from: "/_app" });
  const loading = useRouterState({ select: (state) => state.status === "pending" });

  const view = search.view ?? defaultCalendarView;
  const anchor = parseAnchorDate(search.date);
  const { start, end } = getVisibleRange(view, anchor);

  const leaguesBySlug = useMemo(
    () => new Map(leagues.map((league) => [league.slug, league])),
    [leagues],
  );

  const leagueOptions = useMemo(
    () =>
      getRegionsWithLeagues(leagues).map((region) => ({
        group: region.name,
        items: region.leagues.map((league) => ({ value: league.id, label: league.name })),
      })),
    [leagues],
  );

  const leaguesById = useMemo(
    () => new Map(leagues.map((league) => [league.id, league])),
    [leagues],
  );

  const visibleEvents = events.filter((event) => {
    const time = new Date(event.startTime).getTime();
    return time >= start.valueOf() && time <= end.valueOf();
  });

  const teams = new Map<string, string>();
  for (const event of visibleEvents) {
    for (const team of event.match.teams) {
      if (team.code && team.code !== "TBD") {
        teams.set(team.code, team.name);
      }
    }
  }
  const teamOptions = [...teams]
    .map(([code, name]) => ({ value: code, label: `${name} (${code})` }))
    .toSorted((a, b) => a.label.localeCompare(b.label));

  const filteredEvents = search.team
    ? visibleEvents.filter((event) => event.match.teams.some((team) => team.code === search.team))
    : visibleEvents;

  // Derive from the latest search, so repeated clicks during a pending navigation add up.
  const moveAnchor = (direction: 1 | -1) =>
    navigate({
      search: (previous) => ({
        ...previous,
        date: formatAnchorDate(
          shiftAnchor(
            previous.view ?? defaultCalendarView,
            parseAnchorDate(previous.date),
            direction,
          ),
        ),
      }),
    });

  const viewProps = {
    anchor,
    events: filteredEvents,
    leaguesBySlug,
    highlightTeam: search.team,
    onSelectDay: (day: Dayjs) =>
      navigate({
        search: (previous) => ({ ...previous, view: "week", date: formatAnchorDate(day) }),
      }),
  };

  return (
    <div className={classes.page}>
      <div className={classes.toolbar}>
        <Group gap={4}>
          <ActionIcon variant="default" aria-label="Previous" onClick={() => moveAnchor(-1)}>
            <IconChevronLeft size={18} />
          </ActionIcon>
          <Button
            variant="default"
            size="xs"
            onClick={() => navigate({ search: (previous) => ({ ...previous, date: undefined }) })}
          >
            Today
          </Button>
          <ActionIcon variant="default" aria-label="Next" onClick={() => moveAnchor(1)}>
            <IconChevronRight size={18} />
          </ActionIcon>
        </Group>
        <Title order={3}>{formatRangeTitle(view, anchor)}</Title>
        {loading && <Loader size="xs" />}
        <SegmentedControl
          ml="auto"
          size="xs"
          value={view}
          onChange={(value) =>
            isCalendarView(value) &&
            navigate({ search: (previous) => ({ ...previous, view: value }) })
          }
          data={viewOptions.map(({ value, label, icon: Icon }) => ({
            value,
            label: (
              <Center style={{ gap: 6 }}>
                <Icon size={16} />
                <span>{label}</span>
              </Center>
            ),
          }))}
        />
      </div>
      <div className={classes.filters}>
        <MultiSelect
          size="xs"
          placeholder={search.leagues?.length ? undefined : "All featured leagues"}
          aria-label="Leagues"
          data={leagueOptions}
          value={search.leagues ?? []}
          onChange={(value) =>
            navigate({
              search: (previous) => ({
                ...previous,
                leagues: value.length > 0 ? value : undefined,
              }),
            })
          }
          renderOption={({ option }) => (
            <LeagueOption league={leaguesById.get(option.value)} label={option.label} />
          )}
          searchable
          clearable
          hidePickedOptions
        />
        <Select
          size="xs"
          placeholder="All teams"
          aria-label="Team"
          data={
            search.team && !teamOptions.some((option) => option.value === search.team)
              ? [{ value: search.team, label: search.team }, ...teamOptions]
              : teamOptions
          }
          value={search.team ?? null}
          onChange={(value) =>
            navigate({ search: (previous) => ({ ...previous, team: value ?? undefined }) })
          }
          nothingFoundMessage="No teams play in this period"
          searchable
          clearable
        />
      </div>
      {!complete && (
        <Alert variant="light" color="yellow" icon={<IconInfoCircle />} mb="md">
          Not all of this period could be loaded. Select fewer leagues to see older matches.
        </Alert>
      )}
      {view === "month" && <MonthView {...viewProps} />}
      {view === "week" && <WeekView {...viewProps} />}
      {view === "list" &&
        (filteredEvents.length > 0 ? (
          <ListView {...viewProps} />
        ) : (
          <Text c="dimmed" ta="center" py="xl">
            No matches in this period.
          </Text>
        ))}
    </div>
  );
}

function LeagueOption({ league, label }: { league: League | undefined; label: string }) {
  return (
    <Group gap="xs" wrap="nowrap">
      <Avatar src={league?.image} size={20} radius="xs" alt="" />
      <Text fz="sm">{label}</Text>
    </Group>
  );
}
