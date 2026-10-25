import { createColumnHelper } from "@tanstack/react-table";
import { useMemo } from "react";
import type { StandingsSection } from "@/api/types";
import { DataTable, TeamCell } from "./data-table";

type RankingRow = {
  ordinal: number;
  team: StandingsSection["rankings"][number]["teams"][number];
};

const columnHelper = createColumnHelper<RankingRow>();

const columns = [
  columnHelper.accessor("ordinal", {
    header: "Rank",
    meta: { width: 40 },
  }),
  columnHelper.accessor((row) => row.team.name, {
    id: "teamName",
    header: "Team",
    cell: ({ row, getValue }) => <TeamCell name={getValue()} image={row.original.team.image} />,
  }),
  columnHelper.accessor((row) => row.team.record.wins, {
    id: "wins",
    header: "Wins",
    meta: { width: 40 },
  }),
  columnHelper.accessor((row) => row.team.record.losses, {
    id: "losses",
    header: "Losses",
    meta: { width: 40 },
  }),
];

const tiesColumn = columnHelper.accessor((row) => row.team.record.ties, {
  id: "ties",
  header: "Ties",
  meta: { width: 40 },
});

export function RankingTable({
  data,
  title,
}: {
  title: string;
  data: StandingsSection["rankings"];
}) {
  const rows = useMemo(
    () =>
      data.flatMap((ranking) =>
        ranking.teams.map((team) => ({
          ordinal: ranking.ordinal,
          team,
        })),
      ),
    [data],
  );

  // Ties only happen in a few formats, so the column is only shown when needed.
  const hasTies = rows.some((row) => row.team.record.ties > 0);

  return (
    <DataTable
      title={title}
      data={rows}
      columns={hasTies ? [...columns.slice(0, 3), tiesColumn, columns[3]] : columns}
      // A standings table reads best in one piece.
      pageSize={50}
    />
  );
}
