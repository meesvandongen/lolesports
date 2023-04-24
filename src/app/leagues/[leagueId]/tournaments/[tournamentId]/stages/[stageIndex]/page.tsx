import { api } from "@/api/api";
import { notFound } from "next/navigation";
import { MatchTable } from "./match-table";
import { RankingTable } from "./ranking-table";
import { Flex } from "@mantine/core";
import { BracketFlow } from "./bracket-flow";

export default async function StageIndexPage({
  params: { leagueId, tournamentId, stageIndex, sectionIndex },
}: {
  params: {
    leagueId: string;
    tournamentId: string;
    stageIndex: string;
    sectionIndex: string;
  };
}) {
  const { data } = await api.get("/getStandingsV3", {
    query: {
      tournamentId: [tournamentId],
      hl: "en-US",
    },
  });

  const sections = data.standings[0]?.stages[Number(stageIndex)]?.sections;

  if (!sections || sections.length === 0) {
    notFound();
  }

  const rankingSections = sections.filter(
    (section) => section.rankings.length > 0
  );
  const columnSections = sections.filter(
    (section) => section.columns.length > 0
  );

  return (
    <>
      {rankingSections.length > 0 && (
        <div className="grid grid-cols-2 gap-8">
          {rankingSections.map((section, index) => (
            <RankingTable
              data={section.rankings}
              key={index}
              title={section.name}
            />
          ))}
        </div>
      )}
      {columnSections.length > 0 && (
        <div className="grid grid-cols-2 gap-8">
          {columnSections.map((section, index) => (
            <BracketFlow
              data={section.columns}
              key={index}
              title={section.name}
              id={section.id}
            />
          ))}
        </div>
      )}
    </>
  );
}
