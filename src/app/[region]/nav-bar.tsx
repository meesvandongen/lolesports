"use client";

import React, { useState } from "react";
import {
  createStyles,
  Navbar,
  Title,
  rem,
  Tooltip,
  UnstyledButton,
  ScrollArea,
} from "@mantine/core";
import { components, operations } from "@/api/generated";
import { regions } from "@/data";
import { Avatar } from "@mantine/core";
import Link from "next/link";

const useStyles = createStyles((theme) => ({
  wrapper: {
    display: "flex",
  },

  region: {
    flex: `0 0 ${rem(60)}`,
    gap: theme.spacing.xs,
    backgroundColor:
      theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.white,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    borderRight: `${rem(1)} solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.colors.gray[3]
    }`,
    paddingTop: theme.spacing.md,
  },

  intraRegion: {
    flex: `0 0 ${rem(60)}`,
    gap: theme.spacing.xs,
    backgroundColor:
      theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.white,
    display: "flex",
    flexWrap: "wrap",
    flexDirection: "row",
    alignItems: "center",
    borderRight: `${rem(1)} solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.colors.gray[3]
    }`,
    paddingTop: theme.spacing.md,
  },

  league: {
    flex: 1,
    backgroundColor:
      theme.colorScheme === "dark"
        ? theme.colors.dark[6]
        : theme.colors.gray[0],
  },

  mainLink: {
    width: rem(44),
    height: rem(44),
    borderRadius: theme.radius.md,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color:
      theme.colorScheme === "dark"
        ? theme.colors.dark[0]
        : theme.colors.gray[7],

    "&:hover": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[5]
          : theme.colors.gray[0],
    },
  },

  mainLinkActive: {
    "&, &:hover": {
      backgroundColor: theme.fn.variant({
        variant: "light",
        color: theme.primaryColor,
      }).background,
      color: theme.fn.variant({ variant: "light", color: theme.primaryColor })
        .color,
    },
  },

  title: {
    boxSizing: "border-box",
    fontFamily: `Greycliff CF, ${theme.fontFamily}`,
    marginBottom: theme.spacing.xl,
    backgroundColor:
      theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.white,
    padding: theme.spacing.md,
    paddingTop: rem(18),
    borderBottom: `${rem(1)} solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.colors.gray[3]
    }`,
  },

  logo: {
    boxSizing: "border-box",
    width: "100%",
    display: "flex",
    justifyContent: "center",
    height: rem(60),
    paddingTop: theme.spacing.md,
    borderBottom: `${rem(1)} solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.colors.gray[3]
    }`,
    marginBottom: theme.spacing.xl,
  },

  link: {
    boxSizing: "border-box",
    display: "block",
    textDecoration: "none",
    borderTopRightRadius: theme.radius.md,
    borderBottomRightRadius: theme.radius.md,
    color:
      theme.colorScheme === "dark"
        ? theme.colors.dark[0]
        : theme.colors.gray[7],
    padding: `0 ${theme.spacing.md}`,
    fontSize: theme.fontSizes.sm,
    marginRight: theme.spacing.md,
    fontWeight: 500,
    height: rem(44),
    lineHeight: rem(44),

    "&:hover": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[5]
          : theme.colors.gray[1],
      color: theme.colorScheme === "dark" ? theme.white : theme.black,
    },
  },

  linkActive: {
    "&, &:hover": {
      borderLeftColor: theme.fn.variant({
        variant: "filled",
        color: theme.primaryColor,
      }).background,
      backgroundColor: theme.fn.variant({
        variant: "filled",
        color: theme.primaryColor,
      }).background,
      color: theme.white,
    },
  },
}));

export function DoubleNavbar({
  regionData,
  region,
  leagueMenu,
}: {
  regionData: operations["getLeagues"]["responses"]["200"]["content"]["application/json"]["data"]["leagues"];
  leagueMenu: React.ReactNode;
  region: string;
}) {
  const { classes, cx } = useStyles();

  const combinedData = regions.map((regionsItem) => {
    const leagues = regionData.filter(
      (regionDataItem) => regionDataItem.region === regionsItem.region
    );
    return {
      ...regionsItem,
      leagues,
    };
  });

  const selectedRegion = combinedData.find((item) => item.tag === region);

  const mainLinks = combinedData.map((combinedData) => (
    <Tooltip
      label={combinedData.region}
      position="right"
      withArrow
      transitionProps={{ duration: 0 }}
      key={combinedData.region}
    >
      <Link
        href={`/${combinedData.tag}`}
        className={cx(classes.mainLink, {
          [classes.mainLinkActive]: combinedData.tag === region,
        })}
      >
        <Avatar src={combinedData.leagues[0].image}></Avatar>
      </Link>
    </Tooltip>
  ));

  const links = selectedRegion?.leagues.map((league) => (
    <Tooltip
      label={league.name}
      position="right"
      withArrow
      transitionProps={{ duration: 0 }}
      key={league.name}
    >
      <Link
        href={`/${selectedRegion.tag}/${league.id}`}
        // className={cx(classes.mainLink, {
        //   [classes.mainLinkActive]: combinedData.tag === region,
        // })}
      >
        <Avatar src={league.image}></Avatar>
      </Link>
    </Tooltip>
  ));

  return (
    <Navbar width={{ sm: 300 }}>
      <Navbar.Section grow className={classes.wrapper}>
        <div className={classes.region}>{mainLinks}</div>
        <div>
          <div className={classes.intraRegion}>{links}</div>
          <div className={classes.league}>
            <Title order={4} className={classes.title}>
              {selectedRegion?.name}
            </Title>
          </div>
          <ScrollArea>{leagueMenu}</ScrollArea>
        </div>
      </Navbar.Section>
    </Navbar>
  );
}
