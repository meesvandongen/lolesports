import { Paper, Title } from "@mantine/core";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { Bracket } from "@/components/bracket/bracket";
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
      bracketSections: sections.filter((section) =>
        section.columns.some((column) => column.cells.some((cell) => cell.matches.length > 0)),
      ),
    };
  },
  component: RankingsPage,
});

function RankingsPage() {
  const { rankingSections, bracketSections } = Route.useLoaderData();

  return (
    <>
      {rankingSections.length > 0 && (
        <div className={classes.sections} data-columns={rankingSections.length === 1 ? 1 : 2}>
          {rankingSections.map((section) => (
            <RankingTable data={section.rankings} key={section.id} title={section.name} />
          ))}
        </div>
      )}
      {bracketSections.length > 0 && (
        // Brackets take their natural width, so small ones sit side by side.
        <div className={classes.brackets}>
          {bracketSections.map((section) => (
            <Paper p={{ base: "xs", sm: "sm" }} key={section.id} className={classes.bracket}>
              <Title order={3} mb="xs">
                {section.name}
              </Title>
              <Bracket section={section} />
            </Paper>
          ))}
        </div>
      )}
    </>
  );
}
