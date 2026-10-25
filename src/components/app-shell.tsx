import {
  ActionIcon,
  AppShell,
  Avatar,
  Burger,
  Group,
  Menu,
  ScrollArea,
  SimpleGrid,
  Tooltip,
} from "@mantine/core";
import { IconCalendar, IconChevronRight } from "@tabler/icons-react";
import { Link, useParams, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import type { League } from "@/api/types";
import { getRegionsWithLeagues } from "@/regions-with-leagues";
import { ActionIconLink, ButtonLink, MenuItemLink, TextLink } from "./links";
import classes from "./app-shell.module.css";

export function AppAppShell({
  allLeagues,
  tournamentMenu,
  children,
}: {
  allLeagues: League[];
  tournamentMenu: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { regionTag } = useParams({ strict: false });

  // The mobile sidebar closes on navigation: it is only open on the page it was opened on.
  const [sideBarOpenedOn, setSideBarOpenedOn] = useState<string>();
  const sideBarOpen = sideBarOpenedOn === pathname;

  const regions = getRegionsWithLeagues(allLeagues);

  const leaguesLinks = regions.map((region) => (
    <Group key={region.name} gap={4} wrap="nowrap">
      <Tooltip label={region.name} position="bottom" transitionProps={{ duration: 0 }}>
        <Link
          to="/$regionTag/$leagueId"
          params={{ regionTag: region.tag, leagueId: region.leagues[0].id }}
          className={classes.mainLink}
          data-active={region.tag === regionTag || undefined}
        >
          <Avatar src={region.leagues[0].image} alt={region.name} />
        </Link>
      </Tooltip>
      {region.leagues.length > 1 && (
        <Menu shadow="md" position="right" withArrow>
          <Menu.Target>
            <ActionIcon variant="subtle" color="gray" aria-label={`More ${region.name} leagues`}>
              <IconChevronRight />
            </ActionIcon>
          </Menu.Target>

          <Menu.Dropdown>
            <SimpleGrid cols={3} spacing="xs">
              {region.leagues.slice(1).map((league) => (
                <Tooltip
                  label={league.name}
                  position="right"
                  transitionProps={{ duration: 0 }}
                  key={league.id}
                >
                  <MenuItemLink
                    to="/$regionTag/$leagueId"
                    params={{ regionTag: region.tag, leagueId: league.id }}
                    className={classes.mainLink}
                  >
                    <Avatar src={league.image} alt={league.name} />
                  </MenuItemLink>
                </Tooltip>
              ))}
            </SimpleGrid>
          </Menu.Dropdown>
        </Menu>
      )}
    </Group>
  ));

  return (
    <AppShell
      padding={0}
      header={{ height: { base: 50, md: 70 } }}
      navbar={{
        // Without a league selected (e.g. on the calendar) only the region rail is shown.
        width: tournamentMenu ? 400 : 110,
        breakpoint: "md",
        collapsed: { mobile: !sideBarOpen },
      }}
    >
      <AppShell.Header>
        <div className={classes.header}>
          <Burger
            opened={sideBarOpen}
            onClick={() => setSideBarOpenedOn(sideBarOpen ? undefined : pathname)}
            hiddenFrom="md"
            size="sm"
            color="gray.6"
            aria-label="Toggle navigation"
          />
          <TextLink
            to="/"
            variant="gradient"
            gradient={{ from: "#00C9FF", to: "#30d38f", deg: 90 }}
            className={classes.logo}
            ta="center"
            fz={{ base: "md", sm: "xl" }}
          >
            LOLMATH ESPORTS
          </TextLink>
          <ButtonLink
            to="/calendar"
            variant="subtle"
            color="gray"
            ml="auto"
            leftSection={<IconCalendar size={18} />}
            visibleFrom="sm"
          >
            Calendar
          </ButtonLink>
          <ActionIconLink
            to="/calendar"
            variant="subtle"
            color="gray"
            ml="auto"
            hiddenFrom="sm"
            aria-label="Calendar"
          >
            <IconCalendar size={20} />
          </ActionIconLink>
        </div>
      </AppShell.Header>
      <AppShell.Navbar>
        <div className={classes.navbarInner}>
          <ScrollArea className={classes.leaguesMenu}>
            <div className={classes.leaguesList}>{leaguesLinks}</div>
          </ScrollArea>
          {tournamentMenu}
        </div>
      </AppShell.Navbar>
      <AppShell.Main className={classes.main}>{children}</AppShell.Main>
    </AppShell>
  );
}
