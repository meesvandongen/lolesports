import { Outlet, createFileRoute, useMatch } from "@tanstack/react-router";
import { getLeagues } from "@/api/lolesports";
import { AppAppShell } from "@/components/app-shell";
import { TournamentMenu } from "@/components/tournament-menu";

export const Route = createFileRoute("/_app")({
  loader: () => getLeagues(),
  component: AppLayout,
});

function AppLayout() {
  const leagues = Route.useLoaderData();
  const leagueMatch = useMatch({ from: "/_app/$regionTag/$leagueId", shouldThrow: false });

  return (
    <AppAppShell
      allLeagues={leagues}
      tournamentMenu={
        leagueMatch?.loaderData && (
          <TournamentMenu
            league={leagueMatch.loaderData.league}
            tournaments={leagueMatch.loaderData.tournaments}
            regionTag={leagueMatch.params.regionTag}
          />
        )
      }
    >
      <Outlet />
    </AppAppShell>
  );
}
