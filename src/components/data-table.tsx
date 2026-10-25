import {
  Group,
  Pagination,
  Paper,
  Table,
  Text,
  TextInput,
  Title,
  UnstyledButton,
} from "@mantine/core";
import {
  IconArrowsSort,
  IconSearch,
  IconSortAscending,
  IconSortDescending,
} from "@tabler/icons-react";
import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData, TValue> {
    cellStyle?: (row: TData) => React.CSSProperties | undefined;
    width?: number | string;
  }
}

export function DataTable<TData>({
  title,
  data,
  columns,
  initialSorting = [],
  enableSearch = false,
  pageSize = 10,
}: {
  title: string;
  data: TData[];
  // oxlint-disable-next-line typescript/no-explicit-any -- column value types differ per column
  columns: ColumnDef<TData, any>[];
  initialSorting?: SortingState;
  enableSearch?: boolean;
  pageSize?: number;
}) {
  const [sorting, setSorting] = useState<SortingState>(initialSorting);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize });

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter, pagination },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const rowCount = table.getFilteredRowModel().rows.length;
  const firstRow = rowCount === 0 ? 0 : pagination.pageIndex * pagination.pageSize + 1;
  const lastRow = Math.min(rowCount, (pagination.pageIndex + 1) * pagination.pageSize);

  return (
    <Paper p="sm">
      <Group justify="space-between" mb="sm">
        <Title order={3}>{title}</Title>
        {enableSearch && (
          <TextInput
            size="xs"
            placeholder="Search"
            aria-label={`Search ${title}`}
            leftSection={<IconSearch size={14} />}
            value={globalFilter}
            onChange={(event) => {
              setGlobalFilter(event.currentTarget.value);
              setPagination((previous) => ({ ...previous, pageIndex: 0 }));
            }}
          />
        )}
      </Group>
      <Table.ScrollContainer minWidth={400}>
        <Table striped highlightOnHover verticalSpacing={4} fz="sm">
          <Table.Thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <Table.Tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const sorted = header.column.getIsSorted();
                  const SortIcon =
                    sorted === "asc"
                      ? IconSortAscending
                      : sorted === "desc"
                        ? IconSortDescending
                        : IconArrowsSort;

                  return (
                    <Table.Th key={header.id} w={header.column.columnDef.meta?.width}>
                      {header.column.getCanSort() ? (
                        <UnstyledButton onClick={header.column.getToggleSortingHandler()}>
                          <Group gap={4} wrap="nowrap">
                            <Text fw={700} fz="sm">
                              {flexRender(header.column.columnDef.header, header.getContext())}
                            </Text>
                            <SortIcon size={14} opacity={sorted ? 1 : 0.4} />
                          </Group>
                        </UnstyledButton>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </Table.Th>
                  );
                })}
              </Table.Tr>
            ))}
          </Table.Thead>
          <Table.Tbody>
            {table.getRowModel().rows.map((row) => (
              <Table.Tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <Table.Td
                    key={cell.id}
                    style={cell.column.columnDef.meta?.cellStyle?.(row.original)}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </Table.Td>
                ))}
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
      {rowCount > pagination.pageSize && (
        <Group justify="flex-end" mt="sm" gap="md">
          <Text fz="sm" c="dimmed">
            {firstRow}-{lastRow} of {rowCount}
          </Text>
          <Pagination
            size="sm"
            total={table.getPageCount()}
            value={pagination.pageIndex + 1}
            onChange={(page) => table.setPageIndex(page - 1)}
          />
        </Group>
      )}
    </Paper>
  );
}

export function TeamCell({
  name,
  image,
  size = 26,
}: {
  name: string;
  image: string;
  size?: number;
}) {
  return (
    <Group gap="sm" wrap="nowrap">
      <img width={size} height={size} alt="" src={image} loading="lazy" />
      <Text size="sm" fw={500}>
        {name}
      </Text>
    </Group>
  );
}

export function winningCellStyle(won: boolean): React.CSSProperties | undefined {
  return won ? { backgroundColor: "var(--mantine-color-green-9)", fontWeight: "bold" } : undefined;
}
