"use client";
import { components } from "@/api/generated";
import { Group, Avatar, Text, Title } from "@mantine/core";
import { MRT_ColumnDef, MantineReactTable } from "mantine-react-table";
import { useMemo } from "react";

interface TableSortProps {
  title: string;
  data: components["schemas"]["standing"]["stages"][number]["sections"][number]["rankings"];
}
export function RankingTable({ data, title }: TableSortProps) {
  const newData = useMemo(() => {
    return data.flatMap((ranking) => {
      return ranking.teams.map((team) => {
        return {
          ordinal: ranking.ordinal,
          team,
        };
      });
    });
  }, [data]);

  const columns = useMemo<MRT_ColumnDef<(typeof newData)[number]>[]>(
    () => [
      {
        header: "Rank",
        accessorKey: "ordinal",
        enableHiding: true,
        maxSize: 40,
      },
      {
        header: "Team",
        id: "teamName",
        accessorFn: (row) => row.team.name,
        Cell: ({ row, renderedCellValue }) => (
          <Group spacing="sm">
            <Avatar size={26} src={row.original.team.image} radius={0} />
            <Text size="sm" weight={500}>
              {renderedCellValue}
            </Text>
          </Group>
        ),
        minSize: 300,
      },
      {
        header: "Wins",
        id: "wins",
        accessorFn: (row) => row.team.record.wins,
        maxSize: 40,
      },
      {
        header: "Losses",
        id: "losses",
        accessorFn: (row) => row.team.record.losses,
        maxSize: 40,
      },
    ],
    []
  );

  return (
    <MantineReactTable
      columns={columns}
      data={newData}
      mantinePaperProps={{
        withBorder: false,
        shadow: "none",
      }}
      initialState={{
        density: "xs",
      }}
      enableFilters={false}
      enableBottomToolbar={false}
      enableColumnActions={false}
      enableFullScreenToggle={false}
      renderTopToolbarCustomActions={() => <Title order={3}>{title}</Title>}
    />
  );
}
