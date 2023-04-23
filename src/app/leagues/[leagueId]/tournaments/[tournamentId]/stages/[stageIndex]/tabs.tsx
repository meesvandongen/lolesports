"use client";

import { components } from "@/api/generated";
import { Tabs } from "@mantine/core";
import { useParams, useRouter } from "next/navigation";

export function StageIndexLayoutTabs({
  children,
  sections,
}: {
  children: React.ReactNode;
  sections: components["schemas"]["standing"]["stages"][number]["sections"];
}) {
  const { leagueId, tournamentId, stageIndex, sectionIndex } = useParams();
  const router = useRouter();
  return (
    <Tabs
      orientation="vertical"
      variant="outline"
      value={sectionIndex}
      onTabChange={(value) => {
        router.push(
          `/leagues/${leagueId}/tournaments/${tournamentId}/stages/${stageIndex}`
        );
      }}
    >
      <Tabs.List>
        {sections.map((section, index) => (
          <Tabs.Tab key={section.name} value={index.toString()}>
            {section.name}
          </Tabs.Tab>
        ))}
      </Tabs.List>
      <Tabs.Panel value={sectionIndex ?? "0"}>{children}</Tabs.Panel>
    </Tabs>
  );
}
