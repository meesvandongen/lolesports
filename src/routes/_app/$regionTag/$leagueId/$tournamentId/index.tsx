import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/$regionTag/$leagueId/$tournamentId/")({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/$regionTag/$leagueId/$tournamentId/stages/$stageIndex/rankings",
      params: { ...params, stageIndex: "0" },
      replace: true,
    });
  },
});
