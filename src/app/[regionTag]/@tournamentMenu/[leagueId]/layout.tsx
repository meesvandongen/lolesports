import { api } from "@/api/api";
import { MenuSection } from "./menu-section";
import { notFound } from "next/navigation";

export default async function LeagueMenuLayout({
  params: { leagueId },
}: {
  children: React.ReactNode;
  params: {
    leagueId: string;
  };
}) {
  const [leaguesResponse, tournamentsResponse] = await Promise.all([
    api.get("/getLeagues", {
      query: {
        hl: "en-US",
      },
    }),
    api.get("/getTournamentsForLeague", {
      query: {
        leagueId,
        hl: "en-US",
      },
    }),
  ]);

  const tournaments = tournamentsResponse.data.leagues?.[0]?.tournaments;

  if (!tournaments) {
    return null;
  }

  tournaments.sort((a, b) => {
    const dateA = new Date(a.startDate);
    const dateB = new Date(b.startDate);

    return dateB.getTime() - dateA.getTime();
  });

  const league = leaguesResponse.data.leagues.find(
    (league) => league.id === leagueId
  );

  if (!league) {
    notFound();
  }

  return (
    <>
      <MenuSection tournaments={tournaments} league={league} />
    </>
  );
}
