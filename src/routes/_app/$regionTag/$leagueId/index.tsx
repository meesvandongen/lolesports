import { createFileRoute, notFound, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/$regionTag/$leagueId/")({
  loader: async ({ params, parentMatchPromise }) => {
    const { loaderData } = await parentMatchPromise;
    const tournament = loaderData?.tournaments[0];

    if (!tournament) {
      throw notFound();
    }

    throw redirect({
      to: "/$regionTag/$leagueId/$tournamentId/stages/$stageIndex/rankings",
      params: { ...params, tournamentId: tournament.id, stageIndex: "0" },
      replace: true,
    });
  },
});
