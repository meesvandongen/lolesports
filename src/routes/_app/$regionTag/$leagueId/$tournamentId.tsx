import { Tabs } from "@mantine/core";
import {
  Outlet,
  createFileRoute,
  notFound,
  useNavigate,
  useParams,
  useRouterState,
} from "@tanstack/react-router";
import { getStandingsV3 } from "@/api/lolesports";
import { NotFound } from "@/components/not-found";
import classes from "@/components/tournament.module.css";

export const Route = createFileRoute("/_app/$regionTag/$leagueId/$tournamentId")({
  loader: async ({ params: { tournamentId } }) => {
    const stages = await getStandingsV3(tournamentId);

    if (!stages) {
      throw notFound();
    }

    return { stages };
  },
  component: TournamentLayout,
  notFoundComponent: () => (
    <NotFound
      title="Tournament not found"
      description="Some tournaments cannot be found for some reason. Sadly nothing we can do about it. Unlikely it will ever be fixed."
    />
  ),
});

const rankingsRouteId = "/_app/$regionTag/$leagueId/$tournamentId/stages/$stageIndex/rankings";
const matchesRouteId = "/_app/$regionTag/$leagueId/$tournamentId/stages/$stageIndex/matches";

function useStageView() {
  return useRouterState({
    select: (state) => {
      const routeIds = state.matches.map((match) => match.routeId);
      if (routeIds.includes(matchesRouteId)) return "matches";
      if (routeIds.includes(rankingsRouteId)) return "rankings";
      return null;
    },
  });
}

function TournamentLayout() {
  const { stages } = Route.useLoaderData();
  const params = Route.useParams();
  const { stageIndex } = useParams({ strict: false });
  const view = useStageView();
  const navigate = useNavigate();

  const navigateTo = (stageIndex: string, view: "rankings" | "matches") =>
    navigate({
      to:
        view === "matches"
          ? "/$regionTag/$leagueId/$tournamentId/stages/$stageIndex/matches"
          : "/$regionTag/$leagueId/$tournamentId/stages/$stageIndex/rankings",
      params: { ...params, stageIndex },
    });

  return (
    <>
      <div className={classes.pageHeader}>
        <Tabs
          value={stageIndex ?? null}
          onChange={(value) => value !== null && navigateTo(value, view ?? "rankings")}
        >
          <Tabs.List className={classes.tabList}>
            {stages.map((stage, index) => (
              <Tabs.Tab key={stage.slug} value={index.toString()}>
                {stage.name}
              </Tabs.Tab>
            ))}
          </Tabs.List>
        </Tabs>
        <Tabs
          value={view}
          onChange={(value) =>
            (value === "rankings" || value === "matches") && navigateTo(stageIndex ?? "0", value)
          }
        >
          <Tabs.List className={classes.tabList}>
            <Tabs.Tab value="rankings">Rankings</Tabs.Tab>
            <Tabs.Tab value="matches">Matches</Tabs.Tab>
          </Tabs.List>
        </Tabs>
      </div>
      <div className={classes.pageWrapper}>
        <Outlet />
      </div>
    </>
  );
}
