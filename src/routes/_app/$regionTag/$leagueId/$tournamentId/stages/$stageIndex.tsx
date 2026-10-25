import { Outlet, createFileRoute, notFound } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/$regionTag/$leagueId/$tournamentId/stages/$stageIndex")(
  {
    loader: async ({ params: { stageIndex }, parentMatchPromise }) => {
      const { loaderData } = await parentMatchPromise;
      const sections = loaderData?.stages[Number(stageIndex)]?.sections;

      if (!sections) {
        throw notFound();
      }

      return { sections };
    },
    component: Outlet,
  },
);
