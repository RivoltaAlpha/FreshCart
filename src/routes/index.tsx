import { Star, Clock, Truck, Shield, Heart } from 'lucide-react';
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import RecommendationsSection from '@/components/recommendations';
import ChatbotIntegration from '@/components/ChatbotIntegration';
import { useState } from 'react';
import sampleProducts from "../../public/marketplaceItems.json";
import type { Product } from '@/Gemini/context';

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  const navigate = useNavigate();
  const [products] = useState<Product[]>(sampleProducts as Product[]);

  const handleProductClick = (product: Product) => {
    navigate({ to: '/products' });
    console.log('Navigate to products page from recommendation:', product.id);
  };

  const handleAddToCart = (product: Product) => {
    navigate({ to: '/products' });
    console.log('Navigate to products page to add to cart:', product.name);
  };

  return (
    <div className="home-page min-h-screen ">
      <section className="bg-gradient-to-br from-[#0b10a4] via-[#00A7B3] to-[#6A89A7] text-black py-64
        bg-no-repeat bg-cover bg-center bg-fixed bg-black backdrop-opacity-90"
        style={{ backgroundImage: 'url(/image.png)', backgroundColor: '#000000' }}
        id="hero-section"
        aria-label="Hero Section"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                Fresh Groceries...
                <span className="block text-[#03a1ad]">Delivered Fast</span>
              </h1>
              <p className="text-xl font-bold mb-8 text-gray-100">
                Get farm-fresh produce, quality groceries, and daily essentials delivered to your doorstep in under 30 minutes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => navigate({ to: '/products' })}
                  className="bg-[#00A7B3] hover:bg-[#00A7B3]/90 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
                >
                  Order Now
                </button>
                <button className="border-2 border-white text-white hover:bg-white hover:text-[#0b10a4] px-8 py-4 rounded-full text-lg font-semibold transition-all">
                  Learn More
                </button>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 shadow-2xl">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/20 rounded-2xl p-4 text-center">
                    <Truck className="h-12 w-12 mx-auto mb-2 text-[#00A7B3]" />
                    <p className="font-semibold">30min Delivery</p>
                  </div>
                  <div className="bg-white/20 rounded-2xl p-4 text-center">
                    <Shield className="h-12 w-12 mx-auto mb-2 text-[#00A7B3]" />
                    <p className="font-semibold">Quality Assured</p>
                  </div>
                  <div className="bg-white/20 rounded-2xl p-4 text-center">
                    <Star className="h-12 w-12 mx-auto mb-2 text-[#00A7B3]" />
                    <p className="font-semibold">Top Rated</p>
                  </div>
                  <div className="bg-white/20 rounded-2xl p-4 text-center">
                    <Heart className="h-12 w-12 mx-auto mb-2 text-[#00A7B3]" />
                    <p className="font-semibold">Fresh Daily</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#0b10a4] mb-4">Why Choose FreshCart?</h2>
            <p className="text-xl max-w-2xl mx-auto">
              We're committed to bringing you the freshest groceries with unmatched convenience and quality.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="bg-[#00A7B3]/10 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <Clock className="h-8 w-8 text-[#00A7B3]" />
              </div>
              <h3 className="text-2xl font-bold text-[#0b10a4] mb-4">Lightning Fast Delivery</h3>
              <p className="text-[#516E89]">
                Get your groceries delivered in under 30 minutes with our efficient delivery network across the city.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="bg-[#00A7B3]/10 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <Shield className="h-8 w-8 text-[#00A7B3]" />
              </div>
              <h3 className="text-2xl font-bold text-[#0b10a4] mb-4">Quality Guaranteed</h3>
              <p className="text-[#516E89]">
                We partner with trusted local farmers and suppliers to ensure you get the freshest, highest quality products.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="bg-[#00A7B3]/10 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <Heart className="h-8 w-8 text-[#00A7B3]" />
              </div>
              <h3 className="text-2xl font-bold text-[#0b10a4] mb-4">Made with Love</h3>
              <p className="text-[#516E89]">
                Every order is carefully selected and packed with care, ensuring your groceries arrive in perfect condition.
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* What's for Dinner Section */}
      <section className="py-20 bg-gradient-to-br from-[#00A7B3]/5 to-[#0b10a4]/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#0b10a4] mb-4">What's for Dinner? 🍽️</h2>
            <p className="text-xl max-w-3xl mx-auto text-[#516E89]">
              Let AI suggest perfect recipes based on your preferences and instantly add all ingredients to your cart!
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-[#00A7B3] text-white rounded-full p-3 flex-shrink-0">
                    <span className="font-bold">✨</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-[#0b10a4] mb-2">AI Recipe Suggestions</h3>
                    <p className="text-[#516E89]">
                      Get personalized recipe recommendations based on your preferences, dietary needs, and cooking time.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-[#00A7B3] text-white rounded-full p-3 flex-shrink-0">
                    <span className="font-bold">🛒</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-[#0b10a4] mb-2">Instant Cart Addition</h3>
                    <p className="text-[#516E89]">
                      Love a recipe? Add all ingredients to your cart with one click and get cooking!
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-[#00A7B3] text-white rounded-full p-3 flex-shrink-0">
                    <span className="font-bold">🏪</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-[#0b10a4] mb-2">Local Sourcing</h3>
                    <p className="text-[#516E89]">
                      Ingredients are sourced from nearby kiosks and stores, ensuring freshness and supporting local businesses.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <button
                  onClick={() => navigate({ to: '/recipes' })}
                  className="bg-[#00A7B3] hover:bg-[#00A7B3]/90 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
                >
                  Discover Recipes 🔍
                </button>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <div className="text-center mb-6">
                  <h4 className="text-xl font-bold text-[#0b10a4] mb-2">Recipe of the Day</h4>
                  <p className="text-[#516E89]">Beef Pilau - Traditional Kenyan Delight</p>
                </div>

                <img
                  src="https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop&q=80"
                  alt="Beef Pilau"
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#516E89]">Cooking Time:</span>
                    <span className="font-semibold">60 minutes</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#516E89]">Servings:</span>
                    <span className="font-semibold">6 people</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#516E89]">Difficulty:</span>
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">Medium</span>
                  </div>
                </div>

                <button
                  onClick={() => navigate({ to: '/recipes' })}
                  className="w-full mt-4 bg-[#0b10a4] hover:bg-[#0b10a4]/90 text-white py-2 rounded-lg transition-colors"
                >
                  Try This Recipe
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recommendations Section */}
      <RecommendationsSection
        products={products}
        onProductClick={handleProductClick}
        onAddToCart={handleAddToCart}
      />

      {/* Testimonials Section */}
      <section className="py-20 bg-card shadow-2xl rounded-2xl mx-20 mb-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#0b10a4] mb-4">What Our Customers Say</h2>
            <p className="text-xl max-w-2xl mx-auto">
              Hear from our satisfied customers who love the convenience and quality of FreshCart.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-[#0b88bd] p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <p className="mb-4">
                <img src="https://ichef.bbci.co.uk/images/ic/1920x1080/p074mmrq.jpg" alt="Testimonials" className="rounded-full w-16 h-16 mx-auto mb-4" />
                "FreshCart has completely changed the way I shop for groceries. The delivery is super fast and the quality is top-notch!"
              </p>
              <p className="font-semibold text-[#0b10a4]">- Sarah K.</p>
            </div>

            <div className="bg-[#0b88bd] p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <p className="mb-4">
                <img src="https://m.media-amazon.com/images/M/MV5BMWY3MjI3ZjQtOWUzOS00Njg4LWFjMWMtYWY1ODVjMjg3MWJjXkEyXkFqcGc@._V1_.jpg" alt="Testimonials" className="rounded-full w-16 h-16 mx-auto mb-4" />
                "I love how easy it is to order fresh produce from FreshCart. The app is user-friendly and the service is excellent."
              </p>
              <p className="font-semibold text-[#0b10a4]">- Martin S.</p>
            </div>

            <div className="bg-[#0b88bd] p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <p className="mb-4">
                <img src="https://www.themoviedb.org/t/p/original/nmlXYem6k3aaN15FKDYnROY46nA.jpg" alt="Testimonials" className="rounded-full w-16 h-16 mx-auto mb-4" />
                "The quality of the groceries is amazing! I can always count on FreshCart for my daily essentials."
              </p>
              <p className="font-semibold text-[#0b10a4]">- Emily R.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Chatbot Integration Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ChatbotIntegration />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#017294] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Start Shopping?</h2>
          <p className="text-xl mb-8 text-gray-100">
            Join thousands of happy customers who trust FreshCart for their daily grocery needs.
          </p>
          <button
            onClick={() => navigate({ to: '/products' })}
            className="bg-[#00A7B3] hover:bg-[#00A7B3]/90 text-white px-12 py-4 rounded-full text-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
          >
            Start Shopping Now
          </button>
        </div>
      </section>
    </div>
  );
}

export default App;