import { useOrders } from '@/hooks/useOrders'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { ClipLoader } from 'react-spinners'
import type { OrderResponse } from '@/types/types'
import React, { useEffect } from 'react';
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
import { PlusCircleIcon, ShoppingBag, TicketCheckIcon } from 'lucide-react'

export const Route = createFileRoute('/admin/orders')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data, isError, isLoading, error, isSuccess } = useOrders()
  const [orders, setOrders] = React.useState<OrderResponse[]>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const navigate = useNavigate();
  const columnHelper = createColumnHelper<OrderResponse>();

  const columns = [
    columnHelper.accessor('order_id', {
      header: 'ID',
      cell: info => info.getValue(),
      footer: info => info.column.id,
    }),
    columnHelper.accessor('order_number', {
      header: 'Order Number',
      cell: info => (
        <div className="max-w-xs truncate" title={info.getValue()}>
          {info.getValue()}
        </div>
      ),
      footer: info => info.column.id,
    }),
    columnHelper.accessor(row => `${row.user?.profile?.first_name || ''} ${row.user?.profile?.last_name || ''}`, {
      header: 'User',
      cell: info => {
        const userName = info.getValue() || 'N/A';
        return (
          <div className="max-w-xs truncate" title={userName}>
            {userName}
          </div>
        );
      },
      footer: info => info.column.id,
    }),
    columnHelper.accessor(row => `${row.store?.name || ''}`, {
      header: 'Store',
      cell: info => {
        const storeName = info.getValue() || '';
        return (
          <div className="max-w-xs truncate" title={storeName}>
            {storeName || 'N/A'}
          </div>
        );
      },
      footer: info => info.column.id,
    }),
    columnHelper.accessor('items', {
      header: 'Items',
      cell: info => {
        const items = info.getValue();
        const itemCount = Array.isArray(items) ? items.length : 0;
        const totalQuantity = Array.isArray(items)
          ? items.reduce((sum, item) => sum + (item.quantity || 0), 0)
          : 0;
        return (
          <div className="max-w-xs truncate" title={`${itemCount} products, ${totalQuantity} total items`}>
            {itemCount} products ({totalQuantity} items)
          </div>
        );
      },
      footer: info => info.column.id,
    }),
    columnHelper.accessor('total_amount', {
      header: 'Total Amount',
      cell: info => (
        <div className="max-w-xs truncate" title={`KSh ${info.getValue()}`}>
          KSh {info.getValue()?.toLocaleString() || '0'}
        </div>
      ),
      footer: info => info.column.id,
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: info => {
        const status = info.getValue();
        const statusColors = {
          pending: 'bg-yellow-100 text-yellow-800',
          confirmed: 'bg-blue-100 text-blue-800',
          preparing: 'bg-orange-100 text-orange-800',
          ready: 'bg-green-100 text-green-800',
          delivered: 'bg-gray-100 text-gray-800',
          cancelled: 'bg-red-100 text-red-800'
        };
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}>
            {status}
          </span>
        );
      },
      footer: info => info.column.id,
    }),
    columnHelper.accessor('created_at', {
      header: 'Created',
      cell: info => {
        const date = new Date(info.getValue());
        return (
          <div className="max-w-xs truncate" title={date.toLocaleString()}>
            {date.toLocaleDateString()}
          </div>
        );
      },
      footer: info => info.column.id,
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <button
            className="bg-blue-600 p-2 rounded hover:underline"
            onClick={() => navigate({ to: `/admin/layout/approveOrder/${row.id}` })}
          >
            Approve
          </button>
          <button
            className="bg-red-600 p-2 hover:underline"
            onClick={() => navigate({ to: `/admin/layout/cancelOrder/${row.id}` })}
          >
            Delete
          </button>
        </div>
      ),
      footer: info => info.column.id,
    }),
  ];

  if (isError && error) {
    toast.error(`Error: ${error.message}`)
  }
  console.log('Orders data:', data);

  useEffect(() => {
    if (isSuccess && data) {
      setOrders(data);
    }
  }, [isSuccess, data]);

  const table = useReactTable({
    data: orders,
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
    <>
      <h1 className="flex justify-center text-2xl font-bold text-[#005A61]">Quick Actions</h1>
      <div className="flex justify-around items-center mb-4 bg-gray-300 shadow-2xl rounded py-10 mt-10">
        <div className="mt-2 flex items-center justify-center gap-4">
          <h2 className="text-lg font-semibold">New Order</h2>
          <PlusCircleIcon
            className="w-12 h-12 text-[#00A7B3] cursor-pointer hover:text-[#005A61]"
            onClick={() => navigate({ to: '/customer/checkout-order' })}
          />
        </div>
        <div className="mb-6">
          <div className="mt-2 flex items-center justify-center gap-4">
            <h2 className="text-lg font-semibold">Approve Order</h2>
            <TicketCheckIcon
              className="w-12 h-12 text-[#00A7B3] cursor-pointer hover:text-[#005A61]"
              onClick={() => navigate({ to: '/admin/categories' })}
            />
          </div>
        </div>
        <div className="mb-6">
          <div className="mt-2 flex items-center justify-center gap-4">
            <h2 className="text-lg font-semibold">Ship Order</h2>
            <ShoppingBag
              className="w-12 h-12 text-[#00A7B3] cursor-pointer hover:text-[#005A61]"
              onClick={() => navigate({ to: '/admin/products' })}
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-screen">
          <ClipLoader color="#00A7B3" size={50} />
        </div>
      ) : (
        <div className="flex min-h-screen">
          <div className="flex flex-col lg:w-7xl md:w-auto mx-auto py-12 px-4">
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
      )}
    </>
  )
}
