"use client";
import { SegmentedControl } from "@mantine/core";
import {
  useParams,
  useRouter,
  useSelectedLayoutSegments,
} from "next/navigation";

export function TournamentIdLayoutControl() {
  const { stageIndex, leagueId, tournamentId } = useParams();
  const segments = useSelectedLayoutSegments();
  const segment = segments[2];
  const router = useRouter();

  return (
    <SegmentedControl
      value={segment}
      onChange={(value) => {
        router.push(
          `/leagues/${leagueId}/tournaments/${tournamentId}/stages/${stageIndex}/${value}`
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
