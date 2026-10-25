import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { getRegionsWithLeagues } from "@/regions-with-leagues";

export const Route = createFileRoute("/_app/$regionTag/")({
  loader: async ({ params: { regionTag }, parentMatchPromise }) => {
    const { loaderData: leagues = [] } = await parentMatchPromise;
    const region = getRegionsWithLeagues(leagues).find((region) => region.tag === regionTag);

    if (!region) {
      throw notFound();
    }

    throw redirect({
      to: "/$regionTag/$leagueId",
      params: { regionTag, leagueId: region.leagues[0].id },
      replace: true,
    });
  },
});
