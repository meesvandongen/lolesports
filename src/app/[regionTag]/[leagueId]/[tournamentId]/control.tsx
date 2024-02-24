"use client";
import { SegmentedControl } from "@mantine/core";
import {
  useParams,
  useRouter,
  useSelectedLayoutSegments,
} from "next/navigation";

export function TournamentIdLayoutControl() {
  const { stageIndex, leagueId, tournamentId, regionTag } = useParams();
  const segments = useSelectedLayoutSegments();
  const segment = segments[2];
  const router = useRouter();

  return (
    <SegmentedControl
      defaultValue={segment}
      onChange={(value) => {
        router.push(
          `/${regionTag}/${leagueId}/${tournamentId}/stages/${stageIndex}/${value}`
        );
      }}
      size="xs"
      style={{
        lineHeight: "initial",
      }}
      data={[
        { label: "Rankings", value: "rankings" },
        { label: "Matches", value: "matches" },
      ]}
    />
  );
}
