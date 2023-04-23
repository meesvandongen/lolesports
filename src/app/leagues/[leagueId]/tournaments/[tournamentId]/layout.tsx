import { api } from "@/api/api";
import { TournamentIdLayoutTabs } from "./tabs";
import { notFound } from "next/navigation";

export default async function TournamentIdLayout({
  children,
  params: { tournamentId },
}: {
  children: React.ReactNode;
  params: {
    leagueId: string;
    tournamentId: string;
    stageIndex: string;
  };
}) {
  const { data } = await api.get("/getStandingsV3", {
    query: {
      tournamentId: [tournamentId],
      hl: "en-US",
    },
  });

  const stages = data.standings[0]?.stages;

  if (!stages) {
    notFound();
  }

  return (
    <>
      <TournamentIdLayoutTabs stages={stages}></TournamentIdLayoutTabs>
      {children}
    </>
  );
}
