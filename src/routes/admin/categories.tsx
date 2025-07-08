import { createFileRoute, useNavigate } from '@tanstack/react-router'
import React, { useEffect } from 'react';
import { PlusCircleIcon } from 'lucide-react';
import { getAllCategories } from '@/services/categoriesService';
import type { Category } from '../../types/types';
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    type PaginationState,
    type SortingState,
    type ColumnFiltersState,
} from '@tanstack/react-table';

const columnHelper = createColumnHelper<Category>();

const columns = [
    columnHelper.accessor('category_id', {
        header: 'ID',
        cell: info => info.getValue(),
        footer: info => info.column.id,
    }),
    columnHelper.accessor('name', {
        header: 'Name',
        cell: info => (
            <div className="max-w-xs truncate" title={info.getValue()}>
                {info.getValue()}
            </div>
        ),
        footer: info => info.column.id,
    }),
    columnHelper.accessor('description', {
        header: 'Description',
        cell: info => (
            <div className="max-w-xs truncate" title={info.getValue()}>
                {info.getValue()}
            </div>
        ),
        footer: info => info.column.id,
    })
];

export const Route = createFileRoute('/admin/categories')({
  component: RouteComponent,
})

function RouteComponent() {
const [data, setData] = React.useState<Category[]>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const navigate = useNavigate();
  
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('Fetching categories...');
        const categories = await getAllCategories();
        setData(categories);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    loadData();
  }, []);

  const table = useReactTable({
      data,
      columns,
      getCoreRowModel: getCoreRowModel(),
      getSortedRowModel: getSortedRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
      state: {
          pagination: pagination,
          sorting: sorting,
          columnFilters: columnFilters,
      },
      onPaginationChange: setPagination,
      onSortingChange: setSorting,
      onColumnFiltersChange: setColumnFilters,
  });

  return (
  <div className="flex min-h-screen">
    <div className="flex flex-col lg:w-7xl md:max-w-6xl mx-auto py-12 px-4">
      <h2 className="text-3xl font-bold text-[#005A61] mb-6">Categories</h2>

      <div className="overflow-x-auto bg-white shadow-md rounded-lg border border-[#005A61]/20">
        <table className="min-w-full divide-y divide-[#005A61]/30 text-sm">
          <thead className="bg-[#6A89A7] text-white">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left font-semibold tracking-wide"
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        className={header.column.getCanSort() ? 'cursor-pointer select-none flex items-center' : ''}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getIsSorted() === 'asc' ? ' ↑' : header.column.getIsSorted() === 'desc' ? ' ↓' : ''}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody className="bg-white divide-y divide-gray-200 text-gray-800">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-[#6A89A7]/10">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-[#516E89]">
        <div>
          <span className="mr-2">Rows per page:</span>
          <select
            title='Rows per page'
            className="border border-[#00A7B3] rounded px-2 py-1 text-[#005A61]"
            value={table.getState().pagination.pageSize}
            onChange={(e) => {
              table.setPageSize(Number(e.target.value));
            }}
          >
            {[5, 10, 20, 30].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                {pageSize}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <button
            className="px-3 py-1 rounded bg-[#00A7B3] text-white disabled:opacity-50"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            {'<<'}
          </button>
          <span className="flex items-center gap-1">
            <input
              title='Page number'
              type="number"
              min={1}
              max={table.getPageCount()}
              value={table.getState().pagination.pageIndex + 1}
              onChange={(e) => {
                const page = e.target.value ? Number(e.target.value) - 1 : 0;
                table.setPageIndex(page);
              }}
              className="border rounded px-2 py-1 w-14 text-center text-[#005A61]"
            />
            <span>of {table.getPageCount()}</span>
          </span>
          <button
            className="px-3 py-1 rounded bg-[#00A7B3] text-white disabled:opacity-50"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            {'>>'}
          </button>
        </div>
      </div>
    </div>
        <div className="mb-6">
      <span className="text-lg font-semibold">Add Category</span>
      <div className="mt-2">
        <PlusCircleIcon
          className="w-12 h-12 text-[#00A7B3] cursor-pointer hover:text-[#005A61]"
          onClick={() => navigate({ to: '/admin/create-category' })}
        />
      </div>
    </div>
  </div>
  );
}
