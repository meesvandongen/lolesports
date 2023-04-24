"use client";
import { components } from "@/api/generated";
import { MRT_ColumnDef, MantineReactTable } from "mantine-react-table";
import { useMemo } from "react";
import { Group, Text } from "@mantine/core";
import Image from "next/image";

interface TableSortProps {
  data: components["schemas"]["section"]["matches"];
}
export function MatchTable({ data }: TableSortProps) {
  const columns = useMemo<
    MRT_ColumnDef<components["schemas"]["section"]["matches"][number]>[]
  >(
    () => [
      {
        header: "ID",
        accessorKey: "id",
        enableHiding: true,
      },
      {
        header: "Team 1",
        id: "team1Name",
        accessorFn: (row) => row.teams[0].name,
        Cell: ({ row, renderedCellValue }) => (
          <Group spacing="sm">
            <Image
              width={26}
              height={26}
              alt=""
              src={row.original.teams[0].image}
            />
            <Text size="sm" weight={500}>
              {renderedCellValue}
            </Text>
          </Group>
        ),
        mantineTableBodyCellProps: ({ cell, row }) => {
          const won = row.original.teams[0].result.outcome === "win";

          return {
            sx: (sx) => ({
              backgroundColor: won ? sx.colors.green[9] : undefined,
              fontWeight: won ? "bold" : undefined,
            }),
          };
        },
      },
      {
        header: "Team 2",
        id: "team2Name",
        accessorFn: (row) => row.teams[1].name,
        Cell: ({ row, renderedCellValue }) => (
          <Group spacing="sm">
            <Image
              width={26}
              height={26}
              alt=""
              src={row.original.teams[1].image}
            />
            <Text size="sm" weight={500}>
              {renderedCellValue}
            </Text>
          </Group>
        ),
        mantineTableBodyCellProps: ({ cell, row }) => {
          const won = row.original.teams[1].result.outcome === "win";

          return {
            sx: (sx) => ({
              backgroundColor: won ? sx.colors.green[9] : undefined,
              fontWeight: won ? "bold" : undefined,
            }),
          };
        },
      },
      {
        header: "Status",
        accessorKey: "state",
      },
    ],
    []
  );

  return (
    <MantineReactTable
      columns={columns}
      data={data}
      mantinePaperProps={{
        withBorder: false,
        shadow: "none",
      }}
      initialState={{
        columnVisibility: {
          id: false,
        },
        sorting: [
          {
            id: "id",
            desc: true,
          },
        ],
      }}
    />
  );
}
