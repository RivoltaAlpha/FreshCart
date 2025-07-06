import React, { useState } from 'react';
import { useRecommendations } from '../hooks/recommendation';
import { trackUserInteraction, type Product } from '../Gemini/context';

interface RecommendationsSectionProps {
  products: Product[];
  onProductClick?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
}

const RecommendationsSection: React.FC<RecommendationsSectionProps> = ({
  products,
  onProductClick,
  onAddToCart,
}) => {
  const { recommendations, loading, error, refetch } = useRecommendations();
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

  const handleImageError = (productId: number) => {
    setImageErrors((prev) => new Set(prev).add(productId));
  };

  const handleProductClick = (product: Product): void => {
    trackUserInteraction('click', {
      id: product.id,
      name: product.name,
      category: product.category,
    });
    onProductClick?.(product);
  };

  const handleAddToCart = (product: Product): void => {
    trackUserInteraction('addToCart', {
      id: product.id,
      name: product.name,
      category: product.category,
    });
    onAddToCart?.(product);
  };

  const getFallbackImage = () => './market-concept-with-vegetables.jpg';

  if (loading) {
    return (
      <div className="p-8 bg-[#F9FBFC] border border-[#6A89A7]/20 rounded-xl my-8 text-center">
        <h2 className="text-2xl font-bold text-[#005A61] mb-2">Loading AI Recommendations...</h2>
        <p className="text-[#516E89]">🤖 Analyzing your preferences...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-[#F9FBFC] border border-[#6A89A7]/20 rounded-xl my-8 text-center">
        <h2 className="text-2xl font-bold text-[#005A61] mb-2">Recommendations</h2>
        <p className="text-red-600 mb-4">❌ Error loading recommendations: {String(error)}</p>
        <button
          onClick={refetch}
          className="bg-[#005A61] hover:bg-[#00414d] text-white px-6 py-2 rounded-md font-medium transition"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!recommendations.length) {
    return (
      <div className="p-8 bg-[#F9FBFC] border border-[#6A89A7]/20 rounded-xl my-8 text-center">
        <h2 className="text-2xl font-bold text-[#005A61] mb-2">🤖 AI Recommendations</h2>
        <p className="text-[#516E89]">
          Start browsing products to get personalized recommendations!
        </p>
      </div>
    );
  }

  return (
    <div className="p-8 bg-card shadow-2xl border-[#6A89A7]/30 rounded-xl my-8 mx-20">
      <div className="flex justify-between items-center mb-6 bg-gradient-to-br from-[#784ef5] to-[#0b0089fa] p-4 rounded-lg shadow-sm">
        <h2 className="text-2xl font-bold text-[#f4fafa]"> AI Recommendations For You ✨✨</h2>
        <button
          onClick={refetch}
          className="bg-[#00A7B3] hover:bg-[#0096a2] text-white px-5 py-2 rounded-md transition font-semibold"
        >
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {recommendations
          .map((rec) => {
            const product = products.find((p) => p.id === rec.productId);
            return product ? { rec, product } : null;
          })
          .filter((item): item is { rec: any; product: Product } => item !== null)
          .map(({ rec, product }) => (
            <div
              key={product.id}
              className="bg-card rounded-lg shadow-sm hover:shadow-md border border-[#E1EAF2] transition-all duration-200"
            >
              <div className="mb-3">
                <img
                  src={imageErrors.has(product.id) ? getFallbackImage() : product.image}
                  alt={product.name}
                  className="w-full h-96 object-cover"
                  onError={() => handleImageError(product.id)}
                  onLoad={() =>
                    setImageErrors((prev) => {
                      const newSet = new Set(prev);
                      newSet.delete(product.id);
                      return newSet;
                    })
                  }
                />
              </div>

              <div className="mb-4 p-4">
                <h3 className="text-lg font-bold mb-1">{product.name}</h3>
                <p className="font-semibold text-lg mb-2">KSh {product.price}</p>
                <div className="flex items-center gap-2 bg-[#d1dff6] px-3 py-2 rounded-md">
                  <span className="bg-[#015094] text-white text-xs px-2 py-1 rounded-full">AI</span>
                  <span className="text-sm text-[#516E89]">{rec.reason}</span>
                </div>
              </div>

              <div className="flex gap-2 p-4">
                <button
                  onClick={() => handleProductClick(product)}
                  className="flex-1 border border-[#005A61] hover:bg-[#005A61] hover:text-white px-4 py-2 rounded-md transition font-medium"
                >
                  View
                </button>
                <button
                  onClick={() => handleAddToCart(product)}
                  className="flex-1 bg-[#015094] hover:bg-[#008c97] text-white px-4 py-2 rounded-md transition font-medium"
                >
                  Add
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default RecommendationsSection;
