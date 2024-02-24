import { api } from "@/api/api";
import { MenuSection } from "./menu-section";

export default async function LeagueMenuLayout({
  params: { leagueId },
}: {
  children: React.ReactNode;
  params: {
    leagueId: string;
  };
}) {
  const { data } = await api.get("/getTournamentsForLeague", {
    query: {
      leagueId,
      hl: "en-US",
    },
  });

  const tournaments = data.leagues?.[0]?.tournaments;

  if (!tournaments) {
    return null;
  }

  tournaments.sort((a, b) => {
    const dateA = new Date(a.startDate);
    const dateB = new Date(b.startDate);

    return dateB.getTime() - dateA.getTime();
  });

  return (
    <>
      <MenuSection tournaments={tournaments} />
    </>
  );
}
