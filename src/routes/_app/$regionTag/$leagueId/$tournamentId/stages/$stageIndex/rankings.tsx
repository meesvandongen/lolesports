import { createFileRoute, notFound } from "@tanstack/react-router";
import { BracketFlow } from "@/components/bracket-flow";
import { RankingTable } from "@/components/ranking-table";
import classes from "@/components/tournament.module.css";

export const Route = createFileRoute(
  "/_app/$regionTag/$leagueId/$tournamentId/stages/$stageIndex/rankings",
)({
  loader: async ({ parentMatchPromise }) => {
    const { loaderData } = await parentMatchPromise;
    const sections = loaderData?.sections;

    if (!sections || sections.length === 0) {
      throw notFound();
    }

    return {
      rankingSections: sections.filter((section) => section.rankings.length > 0),
      columnSections: sections.filter((section) => section.columns.length > 0),
    };
  },
  component: RankingsPage,
});

function RankingsPage() {
  const { rankingSections, columnSections } = Route.useLoaderData();

  return (
    <>
      {rankingSections.length > 0 && (
        <div className={classes.sections} data-columns={rankingSections.length === 1 ? 1 : 2}>
          {rankingSections.map((section) => (
            <RankingTable data={section.rankings} key={section.id} title={section.name} />
          ))}
        </div>
      )}
      {columnSections.length > 0 && (
        <div className={classes.sections} data-columns={columnSections.length === 1 ? 1 : 2}>
          {columnSections.map((section) => (
            <BracketFlow data={section.columns} key={section.id} id={section.id} />
          ))}
        </div>
      )}
    </>
  );
}
