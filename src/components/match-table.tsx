import { createColumnHelper } from "@tanstack/react-table";
import type { MatchesSection } from "@/api/types";
import { DataTable, TeamCell, winningCellStyle } from "./data-table";

type MatchRow = MatchesSection["matches"][number];

const columnHelper = createColumnHelper<MatchRow>();

const columns = [
  columnHelper.accessor((row) => row.teams[0].name, {
    id: "team1Name",
    header: "Team 1",
    cell: ({ row, getValue }) => <TeamCell name={getValue()} image={row.original.teams[0].image} />,
    meta: { cellStyle: (row) => winningCellStyle(row.teams[0].result?.outcome === "win") },
  }),
  columnHelper.accessor((row) => row.teams[1].name, {
    id: "team2Name",
    header: "Team 2",
    cell: ({ row, getValue }) => <TeamCell name={getValue()} image={row.original.teams[1].image} />,
    meta: { cellStyle: (row) => winningCellStyle(row.teams[1].result?.outcome === "win") },
  }),
  columnHelper.accessor("state", {
    header: "Status",
  }),
];

export function MatchTable({ data, title }: { data: MatchRow[]; title: string }) {
  // Match ids grow over time, so sorting by id descending shows the latest first.
  const sortedData = data.toSorted((a, b) =>
    b.id.localeCompare(a.id, undefined, { numeric: true }),
  );

  return <DataTable title={title} data={sortedData} columns={columns} enableSearch />;
}
