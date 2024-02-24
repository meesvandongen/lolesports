import { api } from "@/api/api";
import { notFound } from "next/navigation";
import { MatchTable } from "./match-table";

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
  const { data } = await api.get("/getStandings", {
    query: {
      tournamentId: [tournamentId],
      hl: "en-US",
    },
  });

  const sections = data.standings[0]?.stages[Number(stageIndex)]?.sections;

  if (!sections || sections.length === 0) {
    notFound();
  }

  const matchesSections = sections.filter(
    (section) => section.matches.length > 0
  );

  return (
    <>
      {matchesSections.length > 0 && (
        <div
          className={`grid gap-8 ${
            matchesSections.length === 1 ? "grid-cols-1" : "grid-cols-2"
          }`}
        >
          {matchesSections.map((section, index) => (
            <MatchTable
              key={section.name}
              data={section.matches}
              title={section.name}
            />
          ))}
        </div>
      )}
    </>
  );
}
