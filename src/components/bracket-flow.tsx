import { Group, Paper, Text } from "@mantine/core";
import {
  Background,
  type Edge,
  Handle,
  type Node,
  type NodeProps,
  Position,
  ReactFlow,
} from "@xyflow/react";
import { useMemo } from "react";
import type { StandingsSection } from "@/api/types";

type Column = StandingsSection["columns"][number];
type Cell = Column["cells"][number];

type MatchNodeData = {
  match: Cell["matches"][number];
  cell: Cell;
};

type MatchNodeType = Node<MatchNodeData, "matchNode">;

const spacingX = 300;
const spacingY = 200;

const nodeTypes = { matchNode: MatchNode };

export function BracketFlow({ data, id }: { id: string; data: Column[] }) {
  const flatData = useMemo(
    () =>
      data.flatMap((column, columnIndex) => {
        let rowIndex = -1;
        return column.cells.flatMap((cell) =>
          cell.matches.map((match) => {
            rowIndex += 1;
            return { match, cell, columnIndex, rowIndex };
          }),
        );
      }),
    [data],
  );

  const nodes = useMemo(
    () =>
      flatData.map(({ cell, match, columnIndex, rowIndex }): MatchNodeType => ({
        id: match.structuralId,
        position: {
          x: columnIndex * spacingX,
          y: rowIndex * spacingY + (columnIndex % 2 === 1 ? spacingY / 2 : 0),
        },
        type: "matchNode",
        data: { match, cell },
      })),
    [flatData],
  );

  const edges = useMemo(() => {
    const matchesByStructuralId = new Map(
      flatData.map((entry) => [entry.match.structuralId, entry.match]),
    );

    return flatData.flatMap(({ match }) =>
      match.teams
        .filter((team) => team.origin.structuralId !== "seeding")
        .map((team): Edge => {
          const sourceTeam = matchesByStructuralId
            .get(team.origin.structuralId)
            ?.teams.find((sourceTeam) => sourceTeam.code === team.code);

          return {
            id: `${match.structuralId}-${team.code}-edge`,
            source: team.origin.structuralId,
            sourceHandle: team.code,
            target: match.structuralId,
            targetHandle: team.code,
            style: {
              stroke: sourceTeam?.result?.outcome === "win" ? "#00ff00" : "#fff",
            },
          };
        }),
    );
  }, [flatData]);

  return (
    <div style={{ height: 500 }}>
      <ReactFlow
        id={id}
        nodeTypes={nodeTypes}
        nodes={nodes}
        edges={edges}
        colorMode="dark"
        fitView
        proOptions={{ hideAttribution: true }}
      >
        <Background />
      </ReactFlow>
    </div>
  );
}

function MatchNode({ data }: NodeProps<MatchNodeType>) {
  const [team1, team2] = data.match.teams;

  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
        id={team1.code}
        style={{ top: "25%", left: 0, visibility: "hidden" }}
      />
      <Handle
        type="target"
        position={Position.Left}
        id={team2.code}
        style={{ top: "75%", left: 0, visibility: "hidden" }}
      />
      <Paper shadow="xs" p={0} withBorder>
        {data.match.teams.map((team) => (
          <Group
            key={team.code}
            px="md"
            py="xs"
            bg={team.result?.outcome === "win" ? "green.9" : undefined}
          >
            <img width={32} height={32} alt="" src={team.image} />
            <Text>{team.name}</Text>
          </Group>
        ))}
      </Paper>
      <Handle
        type="source"
        position={Position.Right}
        id={team1.code}
        style={{ top: "25%", right: 0, visibility: "hidden" }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id={team2.code}
        style={{ top: "75%", right: 0, visibility: "hidden" }}
      />
    </>
  );
}
