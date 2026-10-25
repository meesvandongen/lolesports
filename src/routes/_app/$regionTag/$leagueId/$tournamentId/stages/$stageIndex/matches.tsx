import { createFileRoute, notFound } from "@tanstack/react-router";
import { getStandings, getTournamentSchedule, getTournamentsForLeague } from "@/api/lolesports";
import { MatchSchedule } from "@/components/match-schedule/match-schedule";
import { scheduleMatches } from "@/components/match-schedule/schedule";

export const Route = createFileRoute(
  "/_app/$regionTag/$leagueId/$tournamentId/stages/$stageIndex/matches",
)({
  validateSearch: (search: Record<string, unknown>): { team?: string; section?: string } => ({
    team: typeof search.team === "string" ? search.team : undefined,
    section: typeof search.section === "string" ? search.section : undefined,
  }),
  loader: async ({ params: { leagueId, tournamentId, stageIndex } }) => {
    // The standings have no dates, so they are joined with the league's
    // schedule, fetched back to the start of the tournament.
    const [stages, events] = await Promise.all([
      getStandings(tournamentId),
      getTournamentsForLeague(leagueId).then((tournaments) => {
        const tournament = tournaments.find((candidate) => candidate.id === tournamentId);
        return tournament
          ? getTournamentSchedule({
              leagueId,
              startDate: tournament.startDate,
              endDate: tournament.endDate,
            })
          : [];
      }),
    ]);
    const sections = stages?.[Number(stageIndex)]?.sections;

    if (!sections || sections.length === 0) {
      throw notFound();
    }

    return {
      matches: scheduleMatches(
        sections.filter((section) => section.matches.length > 0),
        events,
      ),
      sections: sections
        .filter((section) => section.matches.length > 0)
        .map((section) => section.name),
    };
  },
  component: MatchesPage,
});

function MatchesPage() {
  const { matches, sections } = Route.useLoaderData();
  const search = Route.useSearch();
  const navigate = Route.useNavigate();

  return (
    <MatchSchedule
      matches={matches}
      sections={sections}
      // Filters live in the URL, so a filtered list can be shared.
      section={search.section && sections.includes(search.section) ? search.section : undefined}
      team={search.team}
      onSectionChange={(section) =>
        navigate({ search: (previous) => ({ ...previous, section }), replace: true })
      }
      onTeamChange={(team) =>
        navigate({ search: (previous) => ({ ...previous, team }), replace: true })
      }
    />
  );
}
