import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react';
import { PlusCircleIcon, Search, Grid, List } from 'lucide-react';
import { getAllCategories } from '@/services/categoriesService';
import type { Category } from '../../types/types';

export const Route = createFileRoute('/admin/categories')({
  component: RouteComponent,
})

function RouteComponent() {
  const [data, setData] = useState<Category[]>([]);
  const [filteredData, setFilteredData] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const navigate = useNavigate();
  
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('Fetching categories...');
        const categories = await getAllCategories();
        setData(categories);
        setFilteredData(categories);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    loadData();
  }, []);

  // Filter data based on search term
  useEffect(() => {
    const filtered = data.filter(category =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredData(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  }, [searchTerm, data]);

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  const CategoryCard = ({ category }: { category: Category }) => (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-[#005A61]/20">
      <div className="aspect-w-16 aspect-h-9 bg-gray-200">
        <img
          src={category.image_url || '/placeholder-image.jpg'}
          alt={category.name}
          className="w-full h-48 object-cover"
          onError={(e) => {
            e.currentTarget.src = '/placeholder-image.jpg';
          }}
        />
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-[#005A61] truncate" title={category.name}>
            {category.name}
          </h3>
          <span className="text-xs text-gray-500 ml-2"></span>
        </div>
        <p className="text-gray-600 text-sm line-clamp-3" title={category.description}>
          {category.description}
        </p>
        {category.created_at && (
          <div className="mt-3 text-xs text-gray-400">
            Created: {new Date(category.created_at).toLocaleDateString()}
          </div>
        )}
      </div>
    </div>
  );

  const CategoryListItem = ({ category }: { category: Category }) => (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 p-4 border border-[#005A61]/20">
      <div className="flex items-center space-x-4">
        <img
          src={category.image_url || '/placeholder-image.jpg'}
          alt={category.name}
          className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
          onError={(e) => {
            e.currentTarget.src = '/placeholder-image.jpg';
          }}
        />
        <div className="flex-grow min-w-0">
          <div className="flex justify-between items-start mb-1">
            <h3 className="text-lg font-semibold text-[#005A61] truncate" title={category.name}>
              {category.name}
            </h3>
            <span className="text-xs text-gray-500 ml-2 flex-shrink-0">ID: {category.category_id}</span>
          </div>
          <p className="text-gray-600 text-sm line-clamp-2" title={category.description}>
            {category.description}
          </p>
          {category.created_at && (
            <div className="mt-2 text-xs text-gray-400">
              Created: {new Date(category.created_at).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#005A61]">Categories</h2>
          
          {/* Add Category Button */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Add Category</span>
            <PlusCircleIcon
              className="w-8 h-8 text-[#00A7B3] cursor-pointer hover:text-[#005A61] transition-colors"
              onClick={() => navigate({ to: '/admin/create-category' })}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="mb-6 space-y-4">
          {/* Search and View Toggle */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="relative flex-grow max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search categories..."
                className="w-full pl-10 pr-4 py-2 border border-[#00A7B3] rounded-lg focus:ring-2 focus:ring-[#00A7B3] focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {/* View Toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-[#00A7B3] text-white' : 'bg-white text-gray-600 border'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-[#00A7B3] text-white' : 'bg-white text-gray-600 border'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Items per page */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Items per page:</span>
            <select
              className="border border-[#00A7B3] rounded px-2 py-1 text-[#005A61] text-sm"
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              {[6, 12, 24, 36].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Info */}
        <div className="mb-4 text-sm text-gray-600">
          Showing {startIndex + 1}-{Math.min(endIndex, filteredData.length)} of {filteredData.length} categories
        </div>

        {/* Categories Display */}
        {currentData.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No categories found</p>
            {searchTerm && (
              <p className="text-gray-400 text-sm mt-2">
                Try adjusting your search terms
              </p>
            )}
          </div>
        ) : (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {currentData.map((category) => (
                  <CategoryCard key={category.category_id} category={category} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {currentData.map((category) => (
                  <CategoryListItem key={category.category_id} category={category} />
                ))}
              </div>
            )}
          </>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </div>
            
            <div className="flex items-center gap-2">
              <button
                className="px-3 py-1 rounded bg-[#00A7B3] text-white disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                First
              </button>
              <button
                className="px-3 py-1 rounded bg-[#00A7B3] text-white disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              
              {/* Page number input */}
              <div className="flex items-center gap-1 text-sm">
                <input
                  type="number"
                  min={1}
                  max={totalPages}
                  value={currentPage}
                  onChange={(e) => {
                    const page = Math.max(1, Math.min(totalPages, Number(e.target.value) || 1));
                    setCurrentPage(page);
                  }}
                  className="border rounded px-2 py-1 w-16 text-center text-[#005A61]"
                />
              </div>
              
              <button
                className="px-3 py-1 rounded bg-[#00A7B3] text-white disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
              <button
                className="px-3 py-1 rounded bg-[#00A7B3] text-white disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                Last
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}