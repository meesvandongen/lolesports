import { Outlet, createFileRoute, notFound } from "@tanstack/react-router";
import { getTournamentsForLeague } from "@/api/lolesports";

export const Route = createFileRoute("/_app/$regionTag/$leagueId")({
  loader: async ({ params: { leagueId }, parentMatchPromise }) => {
    const [{ loaderData: leagues = [] }, tournaments] = await Promise.all([
      parentMatchPromise,
      getTournamentsForLeague({ data: leagueId }),
    ]);

    const league = leagues.find((league) => league.id === leagueId);

    if (!league) {
      throw notFound();
    }

    return { league, tournaments };
  },
  head: ({ loaderData }) => ({
    meta: loaderData ? [{ title: `${loaderData.league.name} - lolmath esports` }] : [],
  }),
  component: Outlet,
});
