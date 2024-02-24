import { api } from "@/api/api";
import { RedirectType, notFound, redirect } from "next/navigation";

export default async function LeagueIdPage({
  params: { regionTag, leagueId },
}: {
  params: {
    regionTag: string;
    leagueId: string;
  };
}) {
  const tournamentsResponse = await api.get("/getTournamentsForLeague", {
    query: {
      leagueId,
      hl: "en-US",
    },
  });

  const tournament = tournamentsResponse.data.leagues?.[0]?.tournaments?.[0];

  if (!tournament) {
    notFound();
  }

  redirect(
    `/${regionTag}/${leagueId}/${tournament.id}/stages/0/rankings`,
    RedirectType.replace
  );
}
