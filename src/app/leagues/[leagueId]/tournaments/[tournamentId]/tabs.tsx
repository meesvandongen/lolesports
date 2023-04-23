"use client";

import { components } from "@/api/generated";
import { Tabs } from "@mantine/core";
import { useParams, useRouter } from "next/navigation";

export function TournamentIdLayoutTabs({
  stages,
}: {
  stages: components["schemas"]["standing"]["stages"];
}) {
  const { stageIndex, leagueId, tournamentId } = useParams();
  const router = useRouter();
  return (
    <Tabs
      variant="outline"
      value={stageIndex}
      onTabChange={(value) => {
        router.push(
          `/leagues/${leagueId}/tournaments/${tournamentId}/stages/${value}`
        );
      }}
    >
      <Tabs.List>
        {stages.map((stage, index) => (
          <Tabs.Tab key={stage.slug} value={index.toString()}>
            {stage.name}
          </Tabs.Tab>
        ))}
      </Tabs.List>
    </Tabs>
  );
}
