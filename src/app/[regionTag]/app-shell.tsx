"use client";

import React from "react";
import {
  createStyles,
  Navbar,
  rem,
  Tooltip,
  ScrollArea,
  Menu,
  ActionIcon,
  AppShell,
} from "@mantine/core";
import { operations } from "@/api/generated";
import { Avatar } from "@mantine/core";
import Link from "next/link";
import { IconChevronRight } from "@tabler/icons-react";
import { AppHeader } from "./header";
import { useSideBarOpen } from "./providers";
import { combineLeaguesWithRegions } from "@/combine-data";

const useStyles = createStyles((theme) => ({
  wrapper: {
    display: "flex",
  },

  leaguesMenu: {
    flex: `0 0 ${rem(60)}`,
    gap: theme.spacing.xs,
    backgroundColor:
      theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.white,
    display: "flex",
    flexDirection: "column",
    alignItems: "start",
    borderRight: `${rem(1)} solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.colors.gray[3]
    }`,
    paddingTop: theme.spacing.md,
    paddingInline: theme.spacing.xs,
  },

  league: {
    flex: 1,
    backgroundColor:
      theme.colorScheme === "dark"
        ? theme.colors.dark[6]
        : theme.colors.gray[0],
    overflow: "scroll",
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
    // marginBottom: theme.spacing.xl,
    backgroundColor:
      theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.white,
    padding: theme.spacing.md,
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

export function AppAppShell({
  allLeagues,
  regionTag,
  tournamentMenu,
  children,
}: {
  allLeagues: operations["getLeagues"]["responses"]["200"]["content"]["application/json"]["data"]["leagues"];
  leagueMenu: React.ReactNode;
  tournamentMenu: React.ReactNode;
  regionTag: string;
  children: React.ReactNode;
}) {
  const { classes, cx } = useStyles();

  const combinedData = combineLeaguesWithRegions(allLeagues);

  const leaguesLinks = combinedData.map((combinedData) => {
    return (
      <div key={combinedData.region} className="flex items-center gap-1">
        <Tooltip
          label={combinedData.region}
          position="bottom"
          transitionProps={{ duration: 0 }}
        >
          <Link
            href={`/${combinedData.tag}/${combinedData.leagues[0].id}`}
            className={cx(classes.mainLink, {
              [classes.mainLinkActive]: combinedData.tag === regionTag,
            })}
          >
            <Avatar src={combinedData.leagues[0].image}></Avatar>
          </Link>
        </Tooltip>
        {combinedData.leagues.length > 1 && (
          <Menu shadow="md" position="right" withArrow>
            <Menu.Target>
              <ActionIcon>
                <IconChevronRight />
              </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown className="flex">
              <div className="grid grid-cols-3 gap-2 justify-center">
                {combinedData.leagues
                  .slice(1, combinedData.leagues.length)
                  .map((league) => (
                    <Tooltip
                      label={league.name}
                      position="right"
                      transitionProps={{ duration: 0 }}
                      key={league.name}
                    >
                      <Menu.Item
                        component={Link}
                        href={`/${combinedData.tag}/${league.id}`}
                        className={cx(classes.mainLink)}
                      >
                        <Avatar src={league.image}></Avatar>
                      </Menu.Item>
                    </Tooltip>
                  ))}
              </div>
            </Menu.Dropdown>
          </Menu>
        )}
      </div>
    );
  });

  const { sideBarOpen } = useSideBarOpen();

  return (
    <AppShell
      padding="md"
      header={<AppHeader />}
      navbarOffsetBreakpoint={"md"}
      navbar={
        <Navbar width={{ md: 400 }} hidden={!sideBarOpen} hiddenBreakpoint="md">
          <div className="flex flex-1 h-full">
            <div className={classes.leaguesMenu}>{leaguesLinks}</div>
            {tournamentMenu}
          </div>
        </Navbar>
      }
      styles={(theme) => ({
        main: {
          backgroundColor:
            theme.colorScheme === "dark"
              ? theme.colors.dark[8]
              : theme.colors.gray[0],
        },
      })}
    >
      {children}
    </AppShell>
  );
}
