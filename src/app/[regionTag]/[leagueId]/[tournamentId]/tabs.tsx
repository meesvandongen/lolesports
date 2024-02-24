"use client";

import { components } from "@/api/generated";
import { Tabs, createStyles } from "@mantine/core";
import {
  useParams,
  useRouter,
  useSelectedLayoutSegments,
} from "next/navigation";

export function TournamentIdLayoutTabs({
  stages,
}: {
  stages: components["schemas"]["standing"]["stages"];
}) {
  const { stageIndex, leagueId, tournamentId, regionTag } = useParams();
  const router = useRouter();

  const segments = useSelectedLayoutSegments();
  const segment = segments[2];

  const { classes } = useStyles();

  return (
    <Tabs
      value={Array.isArray(stageIndex) ? stageIndex[0] : stageIndex}
      onTabChange={(value) => {
        router.push(
          `/${regionTag}/${leagueId}/${tournamentId}/stages/${value}/${
            segment ?? "rankings"
          }`
        );
      }}
    >
      <Tabs.List className={classes.tabList}>
        {stages.map((stage, index) => (
          <Tabs.Tab key={stage.slug} value={index.toString()}>
            {stage.name}
          </Tabs.Tab>
        ))}
      </Tabs.List>
    </Tabs>
  );
}

const useStyles = createStyles((theme) => ({
  tabList: {
    paddingLeft: theme.spacing.md,
  },
  pageWrapper: {
    paddingLeft: theme.spacing.md,
    paddingRight: theme.spacing.md,
    paddingTop: theme.spacing.md,
  },
  pageHeader: {
    paddingTop: theme.spacing.md,
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing.xs,
    backgroundColor:
      theme.colorScheme === "dark"
        ? theme.colors.dark[7]
        : theme.colors.gray[0],
  },
}));

export function RankingsMatchesTabs() {
  const { stageIndex, leagueId, tournamentId, regionTag } = useParams();
  const segments = useSelectedLayoutSegments();
  const segment = segments[2];

  const router = useRouter();

  const { classes } = useStyles();

  return (
    <Tabs
      value={segment}
      onTabChange={(value) => {
        router.push(
          `/${regionTag}/${leagueId}/${tournamentId}/stages/${stageIndex}/${value}`
        );
      }}
    >
      <Tabs.List className={classes.tabList}>
        {[
          { label: "Rankings", value: "rankings" },
          { label: "Matches", value: "matches" },
        ].map((stage, index) => (
          <Tabs.Tab key={stage.value} value={stage.value}>
            {stage.label}
          </Tabs.Tab>
        ))}
      </Tabs.List>
    </Tabs>
  );
}

export function PageWrapper({ children }: { children: React.ReactNode }) {
  const { classes } = useStyles();
  return <div className={classes.pageWrapper}>{children}</div>;
}

export function PageHeader({ children }: { children: React.ReactNode }) {
  const { classes } = useStyles();
  return <div className={classes.pageHeader}>{children}</div>;
}
