import { createFileRoute, notFound } from "@tanstack/react-router";
import { getStandings } from "@/api/lolesports";
import { MatchTable } from "@/components/match-table";
import classes from "@/components/tournament.module.css";

export const Route = createFileRoute(
  "/_app/$regionTag/$leagueId/$tournamentId/stages/$stageIndex/matches",
)({
  loader: async ({ params: { tournamentId, stageIndex } }) => {
    const stages = await getStandings(tournamentId);
    const sections = stages?.[Number(stageIndex)]?.sections;

    if (!sections || sections.length === 0) {
      throw notFound();
    }

    return {
      matchesSections: sections.filter((section) => section.matches.length > 0),
    };
  },
  component: MatchesPage,
});

function MatchesPage() {
  const { matchesSections } = Route.useLoaderData();

  if (matchesSections.length === 0) {
    return null;
  }

  return (
    <div className={classes.sections} data-columns={matchesSections.length === 1 ? 1 : 2}>
      {matchesSections.map((section) => (
        <MatchTable key={section.name} data={section.matches} title={section.name} />
      ))}
    </div>
  );
}
