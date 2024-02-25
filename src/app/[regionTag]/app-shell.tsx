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
import { getRegionsWithLeagues } from "@/regions-with-leagues";

const useStyles = createStyles((theme) => ({
  leaguesMenu: {
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
    flexShrink: 0,
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
}));

export function AppAppShell({
  allLeagues,
  regionTag,
  tournamentMenu,
  children,
}: {
  allLeagues: operations["getLeagues"]["responses"]["200"]["content"]["application/json"]["data"]["leagues"];
  tournamentMenu: React.ReactNode;
  regionTag: string;
  children: React.ReactNode;
}) {
  const { classes, cx } = useStyles();

  const regions = getRegionsWithLeagues(allLeagues);

  const leaguesLinks = regions.map((region) => {
    return (
      <div key={region.name} className="flex items-center gap-1">
        <Tooltip
          label={region.name}
          position="bottom"
          transitionProps={{ duration: 0 }}
        >
          <Link
            href={`/${region.tag}/${region.leagues[0].id}`}
            className={cx(classes.mainLink, {
              [classes.mainLinkActive]: region.tag === regionTag,
            })}
          >
            <Avatar src={region.leagues[0].image}></Avatar>
          </Link>
        </Tooltip>
        {region.leagues.length > 1 && (
          <Menu shadow="md" position="right" withArrow keepMounted>
            <Menu.Target>
              <ActionIcon>
                <IconChevronRight />
              </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown className="flex">
              <div className="grid grid-cols-3 gap-2 justify-center">
                {region.leagues
                  .slice(1, region.leagues.length)
                  .map((league) => (
                    <Tooltip
                      label={league.name}
                      position="right"
                      transitionProps={{ duration: 0 }}
                      key={league.name}
                    >
                      <Menu.Item
                        component={Link}
                        href={`/${region.tag}/${league.id}`}
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
      padding={0}
      header={<AppHeader />}
      navbarOffsetBreakpoint={"md"}
      navbar={
        <Navbar width={{ md: 400 }} hidden={!sideBarOpen} hiddenBreakpoint="md">
          <div className="flex flex-1 h-full">
            <ScrollArea className={classes.leaguesMenu}>{leaguesLinks}</ScrollArea>
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
