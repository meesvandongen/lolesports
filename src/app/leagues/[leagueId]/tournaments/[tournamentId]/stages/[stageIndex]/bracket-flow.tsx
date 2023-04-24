"use client";
import { components } from "@/api/generated";
import { Text, Paper, Group, Avatar } from "@mantine/core";
import Image from "next/image";
import React, { useMemo } from "react";
import ReactFlow, { Background, Edge, Handle, Node, Position } from "reactflow";

interface NodeData {
  match: components["schemas"]["standing"]["stages"][number]["sections"][number]["columns"][number]["cells"][number]["matches"][number];
  cell: components["schemas"]["standing"]["stages"][number]["sections"][number]["columns"][number]["cells"][number];
}

const spacingX = 300;
const spacingY = 200;
const itemHeight = 50;

export function BracketFlow({
  data,
  title,
  id,
}: {
  title: string;
  id: string;
  data: components["schemas"]["standing"]["stages"][number]["sections"][number]["columns"];
}) {
  const nodeTypes = useMemo(() => ({ matchNode: MatchNode }), []);

  const nodes: Node[] = useMemo(
    () =>
      data.flatMap((column, columnIndex) => {
        return column.cells.flatMap((cell, cellIndex) => {
          return cell.matches.map((match, matchIndex): Node<NodeData> => {
            return {
              id: match.structuralId,
              position: {
                x: columnIndex * spacingX,
                y:
                  cellIndex * spacingY +
                  matchIndex * spacingY +
                  (columnIndex % 2 === 1 ? spacingY / 2 : 0),
              },
              type: "matchNode",
              data: {
                match,
                cell,
              },
            };
          });
        });
      }),
    [data]
  );

  const edges: Edge[] = useMemo(
    () =>
      data.flatMap((column, columnIndex) => {
        return column.cells.flatMap((cell, cellIndex) => {
          return cell.matches.flatMap((match, matchIndex) => {
            return match.teams.map((team, teamIndex): Edge => {
              return {
                id: `${match.structuralId}-${team.code}-edge`,
                source: team.origin.structuralId,
                sourceHandle: team.code,
                target: match.structuralId,
                targetHandle: team.code,
                style: {
                  stroke: team.result.outcome === "win" ? "#00ff00" : "#fff",
                },
              };
            });
          });
        });
      }),
    [data]
  );
  return (
    <div className="h-[500px]">
      <ReactFlow
        id={id}
        nodeTypes={nodeTypes}
        nodes={nodes}
        edges={edges}
        fitView
        proOptions={{
          hideAttribution: true,
        }}
      >
        <Background></Background>
      </ReactFlow>
    </div>
  );
}

function MatchNode({ data }: { data: NodeData }) {
  const team1 = data.match.teams[0];
  const team2 = data.match.teams[1];
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
        {/* <Text>{data.cell.name}</Text> */}
        {data.match.teams.map((team) => (
          <Group
            key={team.code}
            px="md"
            py="xs"
            sx={(sx) => ({
              backgroundColor:
                team.result.outcome === "win" ? sx.colors.green[9] : undefined,
            })}
          >
            <Image width={32} height={32} alt="" src={team.image} />
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
