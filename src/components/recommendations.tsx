import React, { useState } from 'react';
import { useRecommendations } from '../hooks/recommendation';
import { trackUserInteraction, type Product } from '../Gemini/context';
import { ShoppingCart } from 'lucide-react';

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
      id: product.product_id,
      name: product.name,
      category: product.category,
    });
    onProductClick?.(product);
  };

  const handleAddToCart = (product: Product): void => {
    trackUserInteraction('addToCart', {
      id: product.product_id,
      name: product.name,
      category: product.category,
    });
    onAddToCart?.(product);
  };

  const getFallbackImage = () => './market-concept-with-vegetables.jpg';

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-[#05445E] mb-4">Loading AI Recommendations...</h2>
          <div className="w-24 h-1 bg-[#189AB4] mx-auto mb-8"></div>
          <p className="text-xl text-[#189AB4]">🤖 Analyzing your preferences...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-[#05445E] mb-4">AI Recommendations</h2>
          <div className="w-24 h-1 bg-[#189AB4] mx-auto mb-8"></div>
          <p className="text-red-600 mb-4">❌ Error loading recommendations: {String(error)}</p>
          <button
            onClick={refetch}
            className="bg-[#189AB4] hover:bg-[#05445E] text-white px-8 py-3 rounded-full font-semibold transition-all"
          >
            Retry
          </button>
        </div>
      </section>
    );
  }

  if (!recommendations.length) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-[#05445E] mb-4">🤖 AI Recommendations</h2>
          <div className="w-24 h-1 bg-[#189AB4] mx-auto mb-8"></div>
          <p className="text-xl text-[#189AB4]">
            Start browsing products to get personalized recommendations!
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-[#05445E] mb-4">AI Recommended Products</h2>
          <div className="w-24 h-1 bg-[#189AB4] mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Personalized recommendations just for you</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 xl:grid-cols-3 gap-6 mb-12">
          {recommendations
            .map((rec) => {
              const product = products.find((p) => p.product_id === rec.productId);
              return product ? { rec, product } : null;
            })
            .filter((item): item is { rec: any; product: Product } => item !== null)
            .map(({ rec, product }) => (
              <div
                key={product.product_id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-4 group"
              >
                <div className="relative mb-4">
                  <img
                    src={imageErrors.has(product.product_id) ? getFallbackImage() : product.image}
                    alt={product.name}
                    className="w-full h-44 object-cover"
                    onError={() => handleImageError(product.product_id)}
                    onLoad={() =>
                      setImageErrors((prev) => {
                        const newSet = new Set(prev);
                        newSet.delete(product.product_id);
                        return newSet;
                      })
                    }
                  />
                  <button className="absolute top-2 right-2 bg-white text-[#189AB4] rounded-full p-2 shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-sm">♡</span>
                  </button>
                  <div className="absolute top-2 left-2 bg-[#189AB4] text-white px-2 py-1 rounded-full text-xs font-semibold">
                    AI
                  </div>
                </div>

                <div className="mb-4">
                  <h3 className="font-semibold text-[#05445E] mb-1">{product.name}</h3>
                  <p className="text-[#189AB4] font-bold mb-2">KSh {product.price}</p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleProductClick(product)}
                    className="flex-1 border-2 border-[#189AB4] text-[#189AB4] hover:bg-[#189AB4] hover:text-white py-3 rounded-xl transition-all duration-300 font-semibold text-sm shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="bg-gradient-to-r from-[#75E6DA] to-[#189AB4] hover:from-[#189AB4] hover:to-[#05445E] text-white p-3 rounded-full transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                    title="Add to Cart"
                  >
                    <ShoppingCart size={16} />
                  </button>
                </div>
              </div>
            ))}
        </div>

        <div className="text-center">
          <button
            onClick={refetch}
            className="bg-[#189AB4] hover:bg-[#05445E] text-white px-8 py-3 rounded-full font-semibold transition-all inline-flex items-center gap-2 mr-4"
          >
            Refresh Recommendations
            <span>↻</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default RecommendationsSection;
