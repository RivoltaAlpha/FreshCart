import { createFileRoute, useNavigate } from '@tanstack/react-router'
import React from 'react';
import type { Product } from '../../types/types';
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
import { TrendingUpIcon, StarIcon } from 'lucide-react';
import { usePopularProducts, useProducts } from '@/hooks/useProducts';
import { ProductModal } from '@/components/ProductModal';


export const Route = createFileRoute('/admin/products')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data: products, isLoading, error } = useProducts();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const { data: topProducts } = usePopularProducts();
  const navigate = useNavigate();
  const columnHelper = createColumnHelper<Product>();

  const showProductModal = (product: Product) => {
    <ProductModal
      isModalOpen={true}
      setIsModalOpen={() => {}}
      selectedProduct={{ ...product, inventory: product.inventory ?? [] }}
      handleAddToCartFromModal={() => {}}
      handleViewDetails={() => {}}
    />
  };

  const columns = [
    columnHelper.accessor('product_id', {
      header: 'ID',
      cell: info => info.getValue(),
      footer: info => info.column.id,
    }),
    columnHelper.accessor('name', {
      header: 'Product Name',
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
    }),
    columnHelper.accessor('price', {
      header: 'Price',
      cell: info => (
        <div className="max-w-xs truncate" title={`KSh ${info.getValue()}`}>
          KSh {info.getValue()}
        </div>
      ),
      footer: info => info.column.id,
    }),
  ];

  const table = useReactTable({
    data: Array.isArray(products) ? products : [],
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg text-[#005A61]">Loading products...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg text-red-600">Error loading products: {error.message}</div>
      </div>
    );
  }

  return (
    <>
      {/* Top Products Section */}
      <div className="bg-gradient-to-br from-[#005A61]/5 to-[#6A89A7]/10 py-12 px-4 mb-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="flex justify-center items-center gap-3 mb-4">
              <div className="bg-[#005A61] p-3 rounded-full shadow-lg">
                <TrendingUpIcon className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#005A61] to-[#6A89A7] bg-clip-text text-transparent">
                Top Products
              </h1>
            </div>
            <p className="text-[#516E89] text-lg max-w-2xl mx-auto">
              Discover our most popular and trending products loved by customers
            </p>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {topProducts?.map((product, index) => (
              <div 
                key={product.product_id} 
                className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden border border-[#005A61]/10"
              >
                {/* Rank Badge */}
                <div className="absolute top-3 left-3 bg-gradient-to-r from-[#005A61] to-[#6A89A7] text-white text-xs font-bold px-2 py-1 rounded-full z-10 shadow-md">
                  #{index + 1}
                </div>
                
                {/* Trending Badge */}
                <div className="absolute top-3 right-3 bg-yellow-400 text-yellow-800 p-1 rounded-full shadow-md z-10">
                  <StarIcon className="h-3 w-3 fill-current" />
                </div>

                {/* Image Container */}
                <div className="relative aspect-square bg-gray-50 overflow-hidden">
                  <img 
                    src={product.image_url} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-2">
                  <h3 className="font-semibold text-[#005A61] text-sm leading-tight line-clamp-2 min-h-[2.5rem] group-hover:text-[#6A89A7] transition-colors">
                    {product.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-[#00A7B3]">
                      KSh {product.price?.toLocaleString()}
                    </span>
                    <div className="flex items-center gap-1">
                      <StarIcon className="h-3 w-3 text-yellow-400 fill-current" />
                      <span className="text-xs text-gray-500">4.8</span>
                    </div>
                  </div>
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#005A61]/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                  <button className="bg-white text-[#005A61] px-4 py-2 rounded-full font-medium text-sm transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 hover:bg-[#005A61] hover:text-white"
                    onClick={() => {
                      showProductModal(product);
                    }}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* View All Button */}
          <div className="text-center mt-10">
            <button className="bg-gradient-to-r from-[#005A61] to-[#6A89A7] text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
              onClick={() => navigate({ to: '/admin/products' })}
            >
              View All Products
            </button>
          </div>
        </div>
      </div>

      {/* Products Table Section */}
      <div className="flex min-h-screen">
        <div className="flex flex-col lg:w-7xl md:w-auto mx-auto py-12 px-4">
          <h2 className="text-3xl font-bold text-[#005A61] mb-6">All Products</h2>

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