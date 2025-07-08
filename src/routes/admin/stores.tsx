import { createFileRoute, useNavigate } from '@tanstack/react-router'
import React, { useEffect } from 'react';
import { useStore } from '@/hooks/useStore';
import type { Store } from '@/types/store';
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
import { Building2, Plus, Eye, Settings } from 'lucide-react';

const columnHelper = createColumnHelper<Store>();

const columns = [
  columnHelper.accessor('store_id', {
    header: 'ID',
    cell: info => info.getValue(),
    footer: info => info.column.id,
  }),
  columnHelper.accessor('name', {
    header: 'Store Name',
    cell: info => (
      <div className="max-w-xs truncate font-medium" title={info.getValue() || ""}>
        {info.getValue() || 'N/A'}
      </div>
    ),
    footer: info => info.column.id,
  }),
  columnHelper.accessor(row => `${row.owner?.profile?.first_name || ''} ${row.owner?.profile?.last_name || ''}`.trim(), {
    id: 'owner_name',
    header: 'Owner',
    cell: info => (
      <div className="max-w-xs truncate" title={info.getValue() || ""}>
        {info.getValue() || 'N/A'}
      </div>
    ),
    footer: info => info.column.id,
  }),
  columnHelper.accessor('owner.email', {
    header: 'Owner Email',
    cell: info => (
      <div className="max-w-xs truncate" title={info.getValue() || ""}>
        {info.getValue() || 'N/A'}
      </div>
    ),
    footer: info => info.column.id,
  }),
  columnHelper.accessor('owner.profile.phone_number', {
    header: 'Phone',
    cell: info => (
      <div className="max-w-xs truncate" title={info.getValue() || ""}>
        {info.getValue() || 'N/A'}
      </div>
    ),
    footer: info => info.column.id,
  }),
  columnHelper.accessor(row => `${row.city}, ${row.town}`, {
    id: 'location',
    header: 'Location',
    cell: info => (
      <div className="max-w-xs truncate" title={info.getValue()}>
        {info.getValue()}
      </div>
    ),
    footer: info => info.column.id,
  }),
  columnHelper.accessor('rating', {
    header: 'Rating',
    cell: info => (
      <div className="text-center">
        {Number(info.getValue()).toFixed(1)} ⭐
      </div>
    ),
    footer: info => info.column.id,
  }),
  columnHelper.accessor('total_reviews', {
    header: 'Reviews',
    cell: info => (
      <div className="text-center">
        {info.getValue()}
      </div>
    ),
    footer: info => info.column.id,
  })
];

export const Route = createFileRoute('/admin/stores')({
  component: RouteComponent,
})

function RouteComponent() {
  const [data, setData] = React.useState<Store[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const navigate = useNavigate();

  // Use the store hook to fetch stores
  const { stores, loading: storeLoading, error: storeError } = useStore();

  useEffect(() => {
    if (stores) {
      setData(stores);
      setLoading(false);
    }
    if (storeError) {
      setError(storeError);
      setLoading(false);
    }
    if (!storeLoading && !storeError) {
      setLoading(false);
    }
  }, [stores, storeLoading, storeError]);

  const table = useReactTable({
    data: data || [],
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

  if (loading || storeLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg text-[#005A61]">Loading stores...</div>
      </div>
    );
  }

  if (error || storeError) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg text-red-600">Error loading stores: {error || storeError}</div>
      </div>
    );
  }

  // Show empty state if no stores
  if (!loading && !storeLoading && (!data || data.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-gray-500">
        <Building2 className="w-16 h-16 mb-4" />
        <h2 className="text-xl font-semibold mb-2">No Stores Found</h2>
        <p>There are no stores to display at the moment.</p>
      </div>
    );
  }

  return (
    <>
      <h1 className="flex justify-center text-2xl font-bold text-[#005A61]">Store Management</h1>
      <div className="flex justify-around items-center mb-4 bg-gray-300 shadow-2xl rounded py-10 mt-10">
        <div className="mt-2 flex items-center justify-center gap-4">
          <h2 className="text-lg font-semibold">Add Store</h2>
          <Plus
            className="w-12 h-12 text-[#00A7B3] cursor-pointer hover:text-[#005A61]"
            onClick={() => navigate({ to: '/admin/create-user' })}
          />
        </div>
        <div className="mb-6">
          <div className="mt-2 flex items-center justify-center gap-4">
            <h2 className="text-lg font-semibold">View Orders</h2>
            <Eye
              className="w-12 h-12 text-[#00A7B3] cursor-pointer hover:text-[#005A61]"
              onClick={() => navigate({ to: '/admin/orders' })}
            />
          </div>
        </div>
        <div className="mb-6">
          <div className="mt-2 flex items-center justify-center gap-4">
            <h2 className="text-lg font-semibold">Store Settings</h2>
            <Settings
              className="w-12 h-12 text-[#00A7B3] cursor-pointer hover:text-[#005A61]"
              onClick={() => navigate({ to: '/admin/settings' })}
            />
          </div>
        </div>
      </div>
      <div className="flex min-h-screen">
        <div className="flex flex-col lg:w-7xl max-w-6xl mx-auto py-12 px-4">
          <h2 className="text-3xl font-bold text-[#005A61] mb-6">Stores ({data?.length || 0})</h2>

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
      </div>
    </>
  );
}
