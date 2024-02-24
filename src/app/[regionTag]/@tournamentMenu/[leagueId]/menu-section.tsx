"use client";

import { components, operations } from "@/api/generated";
import {
  UnstyledButton,
  Text,
  createStyles,
  getStylesRef,
  rem,
  Title,
  ScrollArea,
} from "@mantine/core";
import upperCase from "lodash.uppercase";
import Link from "next/link";
import { useParams } from "next/navigation";

const useStyles = createStyles((theme) => ({
  link: {
    ...theme.fn.focusStyles(),
    display: "flex",
    alignItems: "center",
    textDecoration: "none",
    fontSize: theme.fontSizes.sm,
    color:
      theme.colorScheme === "dark"
        ? theme.colors.dark[1]
        : theme.colors.gray[7],
    padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
    borderRadius: theme.radius.sm,
    fontWeight: 500,

    "&:hover": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[6]
          : theme.colors.gray[0],
      color: theme.colorScheme === "dark" ? theme.white : theme.black,

      [`& .${getStylesRef("icon")}`]: {
        color: theme.colorScheme === "dark" ? theme.white : theme.black,
      },
    },
  },

  linkActive: {
    "&, &:hover": {
      backgroundColor: theme.fn.variant({
        variant: "light",
        color: theme.primaryColor,
      }).background,
      color: theme.fn.variant({ variant: "light", color: theme.primaryColor })
        .color,
      [`& .${getStylesRef("icon")}`]: {
        color: theme.fn.variant({ variant: "light", color: theme.primaryColor })
          .color,
      },
    },
  },

  tournaments: {
    backgroundColor:
      theme.colorScheme === "dark"
        ? theme.colors.dark[6]
        : theme.colors.gray[0],
    paddingRight: theme.spacing.md,
    paddingLeft: theme.spacing.xs,
    flex: 1,
  },

  extraPadding: {
    paddingTop: theme.spacing.xs,
    paddingBottom: theme.spacing.xs,
  },

  title: {
    boxSizing: "border-box",
    fontFamily: `Greycliff CF, ${theme.fontFamily}`,
    // marginBottom: theme.spacing.xl,
    backgroundColor:
      theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.white,
    padding: theme.spacing.md,
    borderBottom: `${rem(1)} solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.colors.gray[3]
    }`,
  },
}));

export function MenuSection({
  tournaments,
  league,
}: {
  tournaments: components["schemas"]["tournament"][];
  league: operations["getLeagues"]["responses"]["200"]["content"]["application/json"]["data"]["leagues"][number];
}) {
  const { classes, cx } = useStyles();
  const { tournamentId, regionTag, leagueId } = useParams();

  return (
    <div className="flex flex-col h-full flex-1">
      <Title order={4} className={classes.title}>
        {league.name}
      </Title>
      <ScrollArea className={classes.tournaments}>
        <div className={classes.extraPadding}>
          {tournaments.map((tournament) => {
            return (
              <UnstyledButton
                component={Link}
                className={cx(classes.link, {
                  [classes.linkActive]: tournament.id === tournamentId,
                })}
                href={`/${regionTag}/${leagueId}/${tournament.id}/stages/0/rankings`}
                key={tournament.slug}
              >
                <Text>{upperCase(tournament.slug)}</Text>
              </UnstyledButton>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
