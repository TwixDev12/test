import React from 'react';
import { ColumnDef, flexRender, getCoreRowModel, getSortedRowModel, SortingState, useReactTable } from '@tanstack/react-table';

export type TorrentRow = {
  id: number;
  name: string;
  category: string;
  size: number;
  seeders: number;
  leechers: number;
  completed: number;
  createdAt: string;
};

function bytes(n: number): string {
  const units = ['B', 'KiB', 'MiB', 'GiB', 'TiB'];
  let value = n;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit++;
  }
  return `${value.toFixed(value >= 10 || unit === 0 ? 0 : 1)} ${units[unit]}`;
}

const columns: ColumnDef<TorrentRow>[] = [
  { accessorKey: 'name', header: 'Nom', cell: ({ row }) => <strong>{row.original.name}</strong> },
  { accessorKey: 'category', header: 'Catégorie' },
  { accessorKey: 'size', header: 'Taille', cell: ({ row }) => bytes(row.original.size) },
  { accessorKey: 'seeders', header: 'Seeders' },
  { accessorKey: 'leechers', header: 'Leechers' },
  { accessorKey: 'completed', header: 'Complétés' },
  { accessorKey: 'createdAt', header: 'Ajouté', cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString('fr-FR') },
];

export function TorrentTable({ rows }: { rows: TorrentRow[] }) {
  const [sorting, setSorting] = React.useState<SortingState>([{ id: 'seeders', desc: true }]);
  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="card">
      <table>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} onClick={header.column.getToggleSortingHandler()}>
                  {flexRender(header.column.columnDef.header, header.getContext())}
                  <span className="sort">{{ asc: ' ↑', desc: ' ↓' }[header.column.getIsSorted() as string] ?? ''}</span>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
