import { api } from "@/api/api";
import { StageIndexLayoutTabs } from "./tabs";
import { notFound } from "next/navigation";

export default async function StageIndexLayout({
  children,
  params: { tournamentId, stageIndex },
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

  const sections = data.standings[0]?.stages[Number(stageIndex)]?.sections;

  if (!sections) {
    notFound();
  }

  return <>{children}</>;
}
