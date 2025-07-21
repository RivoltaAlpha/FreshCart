import { createFileRoute, useNavigate } from '@tanstack/react-router'
import React, { useEffect } from 'react';
import { getAllUsers } from '../../services/userService';
import type { User } from '../../types/types';
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
import { ClipboardCheckIcon, User2, Users2Icon } from 'lucide-react';

const columnHelper = createColumnHelper<User>();

const columns = [
  columnHelper.accessor('user_id', {
    header: 'ID',
    cell: info => info.getValue(),
    footer: info => info.column.id,
  }),
  columnHelper.accessor('profile.first_name', {
    header: 'First Name',
    cell: info => (
      <div className="max-w-xs truncate" title={info.getValue() || ''}>
        {info.getValue() || 'N/A'}
      </div>
    ),
    footer: info => info.column.id,
  }),
  columnHelper.accessor('profile.last_name', {
    header: 'Last Name',
    cell: info => (
      <div className="max-w-xs truncate" title={info.getValue() || ''}>
        {info.getValue() || 'N/A'}
      </div>
    ),
    footer: info => info.column.id,
  }),
  columnHelper.accessor('profile.phone_number', {
    header: 'Phone',
    cell: info => (
      <div className="max-w-xs truncate" title={info.getValue() || ''}>
        {info.getValue() || 'N/A'}
      </div>
    ),
    footer: info => info.column.id,
  }),
  columnHelper.accessor('email', {
    header: 'Email',
    cell: info => (
      <div className="max-w-xs truncate" title={info.getValue()}>
        {info.getValue()}
      </div>
    ),
    footer: info => info.column.id,
  }),
  columnHelper.accessor('role', {
    header: 'Role',
    cell: info => (
      <div className="max-w-xs truncate" title={info.getValue()}>
        {info.getValue()}
      </div>
    ),
    footer: info => info.column.id,
  })
];

export const Route = createFileRoute('/admin/users')({
  component: RouteComponent,
})

function RouteComponent() {
  const [data, setData] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching users...');
        const users = await getAllUsers();
        setData(users);
      } catch (error) {
        console.error('Error fetching users:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch users');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen px-4">
        <div className="text-lg text-[#005A61] text-center">Loading users...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen px-4">
        <div className="text-lg text-red-600 text-center">Error loading users: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-2 sm:px-4 lg:px-6">
      <div className="max-w-7xl mx-auto py-4 sm:py-8 lg:py-12">
        {/* Quick Actions Header */}
        <h1 className="text-xl sm:text-2xl font-bold text-[#005A61] text-center mb-4 sm:mb-6">
          Quick Actions
        </h1>
        
        {/* Quick Actions Grid - Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 sm:mb-8">
          <div className="bg-gray-300 shadow-lg rounded-lg p-4 flex flex-col sm:flex-row items-center justify-center gap-3 hover:shadow-xl transition-shadow">
            <h2 className="text-base sm:text-lg font-semibold text-center sm:text-left">Add User</h2>
            <User2
              className="w-10 h-10 sm:w-12 sm:h-12 text-[#00A7B3] cursor-pointer hover:text-[#005A61] transition-colors flex-shrink-0"
              onClick={() => navigate({ to: '/admin/create-user' })}
            />
          </div>
          
          <div className="bg-gray-300 shadow-lg rounded-lg p-4 flex flex-col sm:flex-row items-center justify-center gap-3 hover:shadow-xl transition-shadow">
            <h2 className="text-base sm:text-lg font-semibold text-center sm:text-left">View Orders</h2>
            <Users2Icon
              className="w-10 h-10 sm:w-12 sm:h-12 text-[#00A7B3] cursor-pointer hover:text-[#005A61] transition-colors flex-shrink-0"
              onClick={() => navigate({ to: '/admin/orders' })}
            />
          </div>
          
          <div className="bg-gray-300 shadow-lg rounded-lg p-4 flex flex-col sm:flex-row items-center justify-center gap-3 hover:shadow-xl transition-shadow sm:col-span-2 lg:col-span-1">
            <h2 className="text-base sm:text-lg font-semibold text-center sm:text-left">Assign Roles</h2>
            <ClipboardCheckIcon
              className="w-10 h-10 sm:w-12 sm:h-12 text-[#00A7B3] cursor-pointer hover:text-[#005A61] transition-colors flex-shrink-0"
              onClick={() => navigate({ to: '/admin/users' })}
            />
          </div>
        </div>

        {/* Users Table Section */}
        <h2 className="text-2xl sm:text-3xl font-bold text-[#005A61] mb-4 sm:mb-6">Users</h2>

        {/* Mobile Card View for small screens */}
        <div className="block sm:hidden">
          <div className="space-y-4">
            {table.getRowModel().rows.map((row) => {
              const user = row.original;
              return (
                <div key={row.id} className="bg-white shadow-md rounded-lg border border-[#005A61]/20 p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="font-semibold text-[#005A61]">ID: {user.user_id}</span>
                      <span className="bg-[#6A89A7] text-white text-xs px-2 py-1 rounded">
                        {user.role}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Name: </span>
                      <span>{user.profile?.first_name || 'N/A'} {user.profile?.last_name || ''}</span>
                    </div>
                    <div>
                      <span className="font-medium">Email: </span>
                      <span className="text-sm break-all">{user.email}</span>
                    </div>
                    <div>
                      <span className="font-medium">Phone: </span>
                      <span>{user.profile?.phone_number || 'N/A'}</span>
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