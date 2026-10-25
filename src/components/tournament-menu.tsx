import { ScrollArea, Title } from "@mantine/core";
import { IconCalendar } from "@tabler/icons-react";
import { useParams } from "@tanstack/react-router";
import upperCase from "lodash.uppercase";
import type { League, Tournament } from "@/api/types";
import { NavLinkLink } from "./links";
import classes from "./tournament-menu.module.css";

export function TournamentMenu({
  tournaments,
  league,
  regionTag,
}: {
  tournaments: Tournament[];
  league: League;
  regionTag: string;
}) {
  const { tournamentId } = useParams({ strict: false });

  const sortedTournaments = tournaments.toSorted(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
  );

  return (
    <div className={classes.root}>
      <Title order={4} className={classes.title}>
        {league.name}
      </Title>
      <ScrollArea className={classes.tournaments}>
        <div className={classes.extraPadding}>
          <NavLinkLink
            to="/calendar"
            search={{ leagues: [league.id] }}
            label="Schedule"
            leftSection={<IconCalendar size={16} />}
            className={classes.link}
          />
          {sortedTournaments.map((tournament) => (
            <NavLinkLink
              to="/$regionTag/$leagueId/$tournamentId/stages/$stageIndex/rankings"
              params={{
                regionTag,
                leagueId: league.id,
                tournamentId: tournament.id,
                stageIndex: "0",
              }}
              active={tournament.id === tournamentId}
              label={upperCase(tournament.slug)}
              className={classes.link}
              key={tournament.id}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
