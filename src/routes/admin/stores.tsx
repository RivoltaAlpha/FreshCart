import { createFileRoute, useNavigate } from '@tanstack/react-router'
import React, { useEffect } from 'react';
import {  useStores } from '@/hooks/useStore';
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
import { Building2, ClipboardCheckIcon, PackageCheckIcon } from 'lucide-react';

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
  columnHelper.accessor(row => `${row.address.town}, ${row.address.area}`, {
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
  const { stores, loading: storeLoading, error: storeError } = useStores();

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
      <div className="flex justify-center items-center min-h-screen px-4">
        <div className="text-lg text-[#005A61] text-center">Loading stores...</div>
      </div>
    );
  }

  if (error || storeError) {
    return (
      <div className="flex justify-center items-center min-h-screen px-4">
        <div className="text-lg text-red-600 text-center">Error loading stores: {error || storeError}</div>
      </div>
    );
  }

  // Show empty state if no stores
  if (!loading && !storeLoading && (!data || data.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-gray-500 px-4">
        <Building2 className="w-12 h-12 sm:w-16 sm:h-16 mb-4" />
        <h2 className="text-lg sm:text-xl font-semibold mb-2 text-center">No Stores Found</h2>
        <p className="text-center">There are no stores to display at the moment.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-2 sm:px-4 lg:px-6">
      <div className="max-w-7xl mx-auto py-4 sm:py-8 lg:py-12">
        {/* Store Management Header */}
        <h1 className="text-xl sm:text-2xl font-bold text-[#005A61] text-center mb-4 sm:mb-6">
          Store Management
        </h1>
        
        {/* Quick Actions Grid - Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 mb-6 sm:mb-8">
          <div className="bg-gray-300 shadow-lg rounded-lg p-4 flex flex-col sm:flex-row items-center justify-center gap-3 hover:shadow-xl transition-shadow">
            <h2 className="text-base sm:text-lg font-semibold text-center sm:text-left">Verify Stores</h2>
            <ClipboardCheckIcon
              className="w-10 h-10 sm:w-12 sm:h-12 text-[#00A7B3] cursor-pointer hover:text-[#005A61] transition-colors flex-shrink-0"
              onClick={() => navigate({ to: '/admin/verify-store' })}
            />
          </div>
          
          <div className="bg-gray-300 shadow-lg rounded-lg p-4 flex flex-col sm:flex-row items-center justify-center gap-3 hover:shadow-xl transition-shadow">
            <h2 className="text-base sm:text-lg font-semibold text-center sm:text-left">View Orders</h2>
            <PackageCheckIcon
              className="w-10 h-10 sm:w-12 sm:h-12 text-[#00A7B3] cursor-pointer hover:text-[#005A61] transition-colors flex-shrink-0"
              onClick={() => navigate({ to: '/admin/orders' })}
            />
          </div>
        </div>

        {/* Stores Table Section */}
        <h2 className="text-2xl sm:text-3xl font-bold text-[#005A61] mb-4 sm:mb-6">
          Stores ({data?.length || 0})
        </h2>

        {/* Mobile Card View for small screens */}
        <div className="block sm:hidden">
          <div className="space-y-4">
            {table.getRowModel().rows.map((row) => {
              const store = row.original;
              const ownerName = `${store.owner?.profile?.first_name || ''} ${store.owner?.profile?.last_name || ''}`.trim();
              const location = `${store.address.town}, ${store.address.area}`;
              
              return (
                <div key={row.id} className="bg-white shadow-md rounded-lg border border-[#005A61]/20 p-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-semibold text-[#005A61] text-sm">ID: {store.store_id}</span>
                        <h3 className="font-bold text-lg text-gray-800 mt-1">{store.name}</h3>
                      </div>
                      <div className="text-right">
                        <div className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded mb-1">
                          {Number(store.rating).toFixed(1)} ⭐
                        </div>
                        <div className="text-xs text-gray-600">
                          {store.total_reviews} reviews
                        </div>
                      </div>
                    </div>
                    
                    <div className="border-t pt-3 space-y-2">
                      <div>
                        <span className="font-medium text-gray-700">Owner: </span>
                        <span className="text-gray-600">{ownerName || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Email: </span>
                        <span className="text-sm text-gray-600 break-all">
                          {store.owner?.email || 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Phone: </span>
                        <span className="text-gray-600">
                          {store.owner?.profile?.phone_number || 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Location: </span>
                        <span className="text-gray-600">{location}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Desktop Table View for larger screens */}
        <div className="hidden sm:block overflow-x-auto bg-white shadow-md rounded-lg border border-[#005A61]/20">
          <table className="min-w-full divide-y divide-[#005A61]/30 text-sm">
            <thead className="bg-[#6A89A7] text-white">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-3 sm:px-4 py-3 text-left font-semibold tracking-wide"
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
                    <td key={cell.id} className="px-3 sm:px-4 py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[#516E89]">
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm">Rows per page:</span>
            <select
              title='Rows per page'
              className="border border-[#00A7B3] rounded px-2 py-1 text-[#005A61] text-xs sm:text-sm"
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

          <div className="flex items-center gap-2">
            <button
              className="px-2 sm:px-3 py-1 rounded bg-[#00A7B3] text-white disabled:opacity-50 text-xs sm:text-sm"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              {'<<'}
            </button>
            <div className="flex items-center gap-1">
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
                className="border rounded px-2 py-1 w-12 sm:w-14 text-center text-[#005A61] text-xs sm:text-sm"
              />
              <span className="text-xs sm:text-sm">of {table.getPageCount()}</span>
            </div>
            <button
              className="px-2 sm:px-3 py-1 rounded bg-[#00A7B3] text-white disabled:opacity-50 text-xs sm:text-sm"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              {'>>'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}