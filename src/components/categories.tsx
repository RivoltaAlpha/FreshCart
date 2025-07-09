import { useCategories } from '@/hooks/useCategory';
import type { Category } from '@/types/types';
import { Package } from 'lucide-react';

interface CategoriesProps {
    onCategorySelect?: (categoryId: number | null, categoryName: string) => void;
    selectedCategoryId?: number | null;
    className?: string;
    showAllOption?: boolean;
    gridCols?: string; // Changed to accept any grid class string
}
// Sample categories with images for fallback
const sampleCategories: Category[] = [
    {
        category_id: 1,
        name: 'Vegetables',
        description: 'Fresh vegetables from local farms',
        image_url: 'https://img.freepik.com/premium-photo/bio-russet-potato-wooden-vintage-table_120872-4574.jpg?uid=R154664640&semt=ais_hybrid&w=740',
        created_at: new Date(),
        updated_at: new Date(),
    },
    {
        category_id: 2,
        name: 'Fruits',
        description: 'Fresh seasonal fruits',
        image_url: 'https://img.freepik.com/free-photo/fresh-strawberries-isolated-white_144627-15674.jpg?uid=R154664640&semt=ais_hybrid&w=740',
        created_at: new Date(),
        updated_at: new Date(),
    },
    {
        category_id: 3,
        name: 'Dairy & Eggs',
        description: 'Fresh dairy products and farm eggs',
        image_url: 'https://img.freepik.com/free-photo/fresh-milk-glass-wooden-table_144627-3976.jpg?uid=R154664640&semt=ais_hybrid&w=740',
        created_at: new Date(),
        updated_at: new Date(),
    },
    {
        category_id: 4,
        name: 'Leafy Greens',
        description: 'Fresh leafy vegetables and herbs',
        image_url: 'https://img.freepik.com/free-photo/fresh-lettuce-white-background_144627-20143.jpg?uid=R154664640&semt=ais_hybrid&w=740',
        created_at: new Date(),
        updated_at: new Date(),
    },
    {
        category_id: 5,
        name: 'Pantry',
        description: 'Essential pantry items and grains',
        image_url: 'https://img.freepik.com/free-photo/variety-grains-wooden-bowls_144627-17854.jpg?uid=R154664640&semt=ais_hybrid&w=740',
        created_at: new Date(),
        updated_at: new Date(),
    },
    {
        category_id: 6,
        name: 'Herbs',
        description: 'Fresh herbs and spices',
        image_url: 'https://img.freepik.com/free-photo/fresh-herbs-wooden-table_144627-17856.jpg?uid=R154664640&semt=ais_hybrid&w=740',
        created_at: new Date(),
        updated_at: new Date(),
    },
];

export default function Categories({
    onCategorySelect,
    selectedCategoryId,
    className = '',
    showAllOption = true,
    gridCols = 'grid-cols-3'
}: CategoriesProps) {
    const { data: backendCategories, isLoading, error, isError } = useCategories();

    const shouldUseSampleData = isError && (
        error?.message?.includes('No authentication token found') ||
        error?.message?.includes('authentication') ||
        error?.message?.includes('unauthorized') ||
        error?.message?.includes('401')
    );

    const categories = shouldUseSampleData ? sampleCategories : (backendCategories || []);

    const handleCategoryClick = (categoryId: number | null, categoryName: string) => {
        if (onCategorySelect) {
            onCategorySelect(categoryId, categoryName);
        }
    };

    const renderCategoryCard = (category: Category | { category_id: null; name: string; image_url?: string; description?: string }) => {
        const isSelected = selectedCategoryId === category.category_id;
        const isAllOption = category.category_id === null;

        return (
            <div
                key={category.category_id || 'all'}
                onClick={() => handleCategoryClick(category.category_id, category.name)}
                className={`
          group cursor-pointer bg-card border rounded-2xl overflow-hidden 
          transition-all duration-300 hover:shadow-lg hover:scale-105
          ${isSelected ? 'ring-2 ring-fresh-primary border-fresh-primary shadow-lg' : 'hover:border-fresh-primary/50'}
          ${className}
        `}
            >
                <div className="relative h-32 sm:h-40 overflow-hidden">
                    {category.image_url ? (
                        <img
                            src={category.image_url}
                            alt={category.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            onError={(e) => {
                                // Fallback to placeholder if image fails to load
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const placeholder = target.nextElementSibling as HTMLElement;
                                if (placeholder) placeholder.style.display = 'flex';
                            }}
                        />
                    ) : null}

                    {/* Fallback placeholder */}
                    <div
                        className={`${category.image_url ? 'hidden' : 'flex'} w-full h-full bg-gradient-to-br from-fresh-primary/20 to-fresh-primary/10 items-center justify-center`}
                        style={{ display: category.image_url ? 'none' : 'flex' }}
                    >
                        {isAllOption ? (
                            <Package className="w-12 h-12 text-fresh-primary" />
                        ) : (
                            <div className="w-12 h-12 bg-fresh-primary/20 rounded-full flex items-center justify-center">
                                <span className="text-fresh-primary font-bold text-lg">
                                    {category.name.charAt(0).toUpperCase()}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Selected indicator */}
                    {isSelected && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-fresh-primary rounded-full flex items-center justify-center">
                            <div className="w-3 h-3 bg-white rounded-full"></div>
                        </div>
                    )}

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>

                <div className="p-4">
                    <h3 className="font-semibold text-foreground text-sm sm:text-base mb-1 line-clamp-1">
                        {category.name}
                    </h3>
                    {category.description && (
                        <p className="text-muted-foreground text-xs sm:text-sm line-clamp-2">
                            {category.description}
                        </p>
                    )}
                </div>
            </div>
        );
    };

    // Show loading state
    if (isLoading) {
        return (
            <div className={`grid ${gridCols} gap-4 ${className}`}>
                {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="bg-card border rounded-2xl overflow-hidden animate-pulse">
                        <div className="h-32 sm:h-40 bg-muted"></div>
                        <div className="p-4">
                            <div className="h-4 bg-muted rounded mb-2"></div>
                            <div className="h-3 bg-muted rounded w-3/4"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    // Show error state with fallback to sample data
    if (isError && !shouldUseSampleData) {
        console.warn('Categories API error:', error);
        return (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-destructive mb-2">Failed to load categories</h3>
                <p className="text-sm text-muted-foreground">
                    {error?.message || 'Unable to fetch categories from server. Please try again later.'}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className={`grid ${gridCols} gap-4 ${className}`}>
                {/* All option if enabled */}
                {showAllOption && renderCategoryCard({
                    category_id: null,
                    name: 'All Categories',
                    description: 'Browse all products',
                    image_url: undefined
                })}

                {/* Category cards */}
                {categories.map(category => renderCategoryCard(category))}
            </div>

            {/* Empty state */}
            {categories.length === 0 && !isLoading && (
                <div className="text-center py-12">
                    <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">No Categories Found</h3>
                    <p className="text-muted-foreground">
                        Categories will appear here once they are created.
                    </p>
                </div>
            )}
        </div>
    );
}