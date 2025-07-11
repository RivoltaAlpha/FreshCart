import { Star, Truck, Shield, Heart } from 'lucide-react';
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import RecommendationsSection from '@/components/recommendations';
import ChatbotIntegration from '@/components/ChatbotIntegration';
import { useState } from 'react';
import sampleProducts from "../../public/marketplaceItems.json";
import type { Product } from '@/Gemini/context';
import Header from '@/components/Header';
import { Footer } from '@/components/Footer';

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  const navigate = useNavigate();
  const [products] = useState<Product[]>(sampleProducts as Product[]);

  const handleProductClick = (product: Product) => {
    navigate({ to: '/products' });
    console.log('Navigate to products page from recommendation:', product.product_id);
  };

  const handleAddToCart = (product: Product) => {
    navigate({ to: '/products' });
    console.log('Navigate to products page to add to cart:', product.name);
  };

  return (
    <>
      <Header />
      <div className="home-page h-3/4">
        <section className="bg-gradient-to-br relative from-[#05445E] via-[#189AB4] to-[#75E6DA] text-white py-20 lg:py-32
        bg-no-repeat bg-cover bg-center"
          style={{ backgroundImage: 'url(/hero.png)' }}
          id="hero-section"
          aria-label="Hero Section"
        >
          <div className="absolute inset-0 bg-black/60"></div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
              <div className='text-white space-y-6'>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                  Fresh
                  <span className="block text-[#75E6DA]">Groceries,</span>
                  <span className="block">Delivered Fast</span>
                </h1>
                <p className="text-xl lg:text-2xl text-gray-100 max-w-xl">
                  Get farm-fresh produce, quality groceries, and daily essentials delivered to your doorstep in under 30 minutes.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <button
                    onClick={() => navigate({ to: '/products' })}
                    className="bg-[#189AB4] hover:bg-[#75E6DA] hover:text-[#05445E] text-white px-10 py-4 rounded-full text-lg font-semibold transition-all transform hover:scale-105 shadow-xl"
                  >
                    Shop Now
                  </button>
                  <button className="border-2 border-[#75E6DA] text-[#75E6DA] hover:bg-[#75E6DA] hover:text-[#05445E] px-10 py-4 rounded-full text-lg font-semibold transition-all">
                    Learn More
                  </button>
                </div>
              </div>

            </div>
          </div>
        </section>

        <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          {/* Floating strawberry images */}
          <div className="absolute  lg:-left-48 -left-20 -top-10 lg:top-2 w-64 h-40 opacity-90">
            <img src="/strawberries 1.png" alt="Strawberry" className="w-full h-full object-contain" />
          </div>
          <div className="absolute -bottom-10 lg:-right-44 -right-12 w-64 h-40 opacity-90">
            <img src="/strawberries 1.png" alt="Strawberry" className="w-full h-full object-contain" />
          </div>

          {/* Why Choose FreshCart Cards */}
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl ">
            <h3 className="text-3xl font-bold text-center mb-8">Why Choose FreshCart?</h3>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="bg-[#75E6DA]/20 rounded-2xl p-6 text-center">
                <div className="bg-[#189AB4] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Truck className="h-8 w-8 text-white" />
                </div>
                <p className="font-semibold text-[#05445E] text-sm">Fast Shipping</p>
              </div>
              <div className="bg-[#75E6DA]/20 rounded-2xl p-6 text-center">
                <div className="bg-[#189AB4] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <p className="font-semibold text-[#05445E] text-sm">Quality Guarantee</p>
              </div>
              <div className="bg-[#75E6DA]/20 rounded-2xl p-6 text-center">
                <div className="bg-[#189AB4] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <p className="font-semibold text-[#05445E] text-sm">100% Secure Payment</p>
              </div>
              <div className="bg-[#75E6DA]/20 rounded-2xl p-6 text-center">
                <div className="bg-[#189AB4] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Heart className="h-8 w-8 text-white" />
                </div>
                <p className="font-semibold text-[#05445E] text-sm">Customer Support 24/7</p>
              </div>
            </div>
          </div>
        </section>
        {/* Featured Products Section */}
        <section className="py-10 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-[#05445E] mb-4">Featured Products</h2>
              <div className="w-24 h-1 bg-[#189AB4] mx-auto mb-4"></div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              {/* Product cards */}
              <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all p-4 group">
                <div className="relative mb-4">
                  <img src="/fruits.jpg" alt="Oranges" className="w-full h-32 object-cover rounded-xl" />
                  <button className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                    <Heart className="h-4 w-4 text-[#189AB4]" />
                  </button>
                </div>
                <h3 className="font-semibold text-[#05445E] mb-1">Oranges</h3>
                <p className="text-[#189AB4] font-bold">$4.99</p>
                <div className="flex items-center mt-2">
                  <div className="flex text-yellow-400">
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all p-4 group">
                <div className="relative mb-4">
                  <img src="/bannar.png" alt="Bananas" className="w-full h-32 object-cover rounded-xl" />
                  <button className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                    <Heart className="h-4 w-4 text-[#189AB4]" />
                  </button>
                </div>
                <h3 className="font-semibold text-[#05445E] mb-1">Bananas</h3>
                <p className="text-[#189AB4] font-bold">$2.99</p>
                <div className="flex items-center mt-2">
                  <div className="flex text-yellow-400">
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all p-4 group">
                <div className="relative mb-4">
                  <img src="/dairy.jpg" alt="Dairy" className="w-full h-32 object-cover rounded-xl" />
                  <button className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                    <Heart className="h-4 w-4 text-[#189AB4]" />
                  </button>
                </div>
                <h3 className="font-semibold text-[#05445E] mb-1">Fresh Milk</h3>
                <p className="text-[#189AB4] font-bold">$3.49</p>
                <div className="flex items-center mt-2">
                  <div className="flex text-yellow-400">
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all p-4 group">
                <div className="relative mb-4">
                  <img src="/greens.jpg" alt="Greens" className="w-full h-32 object-cover rounded-xl" />
                  <div className="absolute top-2 left-2 bg-[#189AB4] text-white px-2 py-1 rounded-full text-xs font-semibold">
                    Hot Deal
                  </div>
                  <button className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                    <Heart className="h-4 w-4 text-[#189AB4]" />
                  </button>
                </div>
                <h3 className="font-semibold text-[#05445E] mb-1">Fresh Greens</h3>
                <p className="text-[#189AB4] font-bold">$1.99</p>
                <div className="flex items-center mt-2">
                  <div className="flex text-yellow-400">
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all p-4 group">
                <div className="relative mb-4">
                  <img src="/vegetable.jpg" alt="Vegetables" className="w-full h-32 object-cover rounded-xl" />
                  <button className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                    <Heart className="h-4 w-4 text-[#189AB4]" />
                  </button>
                </div>
                <h3 className="font-semibold text-[#05445E] mb-1">Mixed Vegetables</h3>
                <p className="text-[#189AB4] font-bold">$5.99</p>
                <div className="flex items-center mt-2">
                  <div className="flex text-yellow-400">
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-16 rounded mx-auto shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
              <div className="lg:col-span-1">
                <h2 className="text-4xl font-bold text-[#05445E] mb-6">Popular Categories</h2>
                <p className="text-lg text-gray-600 mb-8">
                  Browse through our wide selection of fresh categories
                </p>
                <button
                  onClick={() => navigate({ to: '/products' })}
                  className="bg-[#189AB4] hover:bg-[#05445E] text-white px-8 py-3 rounded-full font-semibold transition-all"
                >
                  View All
                </button>
              </div>

              <div className="lg:col-span-2">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all group cursor-pointer">
                    <img src="/fruits.jpg" alt="Fresh Fruit" className="w-16 h-16 mx-auto mb-4 rounded-full object-cover group-hover:scale-110 transition-transform" />
                    <h3 className="font-semibold text-[#05445E]">Fresh Fruit</h3>
                  </div>

                  <div className="bg-white rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all group cursor-pointer">
                    <img src="/vegetable.jpg" alt="Fresh Vegetable" className="w-16 h-16 mx-auto mb-4 rounded-full object-cover group-hover:scale-110 transition-transform" />
                    <h3 className="font-semibold text-[#05445E]">Fresh Vegetable</h3>
                  </div>

                  <div className="bg-white rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all group cursor-pointer">
                    <img src="/dairy.jpg" alt="Meat & Fish" className="w-16 h-16 mx-auto mb-4 rounded-full object-cover group-hover:scale-110 transition-transform" />
                    <h3 className="font-semibold text-[#05445E]">Meat & Fish</h3>
                  </div>

                  <div className="bg-white rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all group cursor-pointer">
                    <img src="/spices.jpg" alt="Snacks" className="w-16 h-16 mx-auto mb-4 rounded-full object-cover group-hover:scale-110 transition-transform" />
                    <h3 className="font-semibold text-[#05445E]">Snacks</h3>
                  </div>

                  <div className="bg-white rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all group cursor-pointer">
                    <img src="/pantry.jpg" alt="Bread & Bakery" className="w-16 h-16 mx-auto mb-4 rounded-full object-cover group-hover:scale-110 transition-transform" />
                    <h3 className="font-semibold text-[#05445E]">Bread & Bakery</h3>
                  </div>

                  <div className="bg-white rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all group cursor-pointer">
                    <img src="/Cereals.jpg" alt="Cooking" className="w-16 h-16 mx-auto mb-4 rounded-full object-cover group-hover:scale-110 transition-transform" />
                    <h3 className="font-semibold text-[#05445E]">Cooking</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* AI Recommended Products Section */}
        <section className="py-20 bg-gray-50 shadow-2xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-[#05445E] mb-4">AI Recommended Products</h2>
              <div className="w-24 h-1 bg-[#189AB4] mx-auto mb-4"></div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-12">
              <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all p-4 group">
                <div className="relative mb-4">
                  <img src="/healthy-broccoli.jpg" alt="Broccoli" className="w-full h-32 object-cover rounded-xl" />
                  <button className="absolute top-2 right-2 bg-[#189AB4] text-white rounded-full p-2 shadow-md">
                    <Heart className="h-4 w-4" />
                  </button>
                </div>
                <h3 className="font-semibold text-[#05445E] mb-1">Broccoli</h3>
                <p className="text-[#189AB4] font-bold">$2.99</p>
                <button className="w-full mt-2 bg-[#75E6DA] hover:bg-[#189AB4] text-[#05445E] hover:text-white py-2 rounded-lg transition-colors font-medium">
                  Add to Cart
                </button>
              </div>

              <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all p-4 group">
                <div className="relative mb-4">
                  <img src="/vegetable.jpg" alt="Tomatoes" className="w-full h-32 object-cover rounded-xl" />
                  <button className="absolute top-2 right-2 bg-white text-[#189AB4] rounded-full p-2 shadow-md">
                    <Heart className="h-4 w-4" />
                  </button>
                </div>
                <h3 className="font-semibold text-[#05445E] mb-1">Tomatoes</h3>
                <p className="text-[#189AB4] font-bold">$3.99</p>
                <button className="w-full mt-2 bg-[#75E6DA] hover:bg-[#189AB4] text-[#05445E] hover:text-white py-2 rounded-lg transition-colors font-medium">
                  Add to Cart
                </button>
              </div>

              <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all p-4 group">
                <div className="relative mb-4">
                  <img src="/greens.jpg" alt="Lettuce" className="w-full h-32 object-cover rounded-xl" />
                  <button className="absolute top-2 right-2 bg-white text-[#189AB4] rounded-full p-2 shadow-md">
                    <Heart className="h-4 w-4" />
                  </button>
                </div>
                <h3 className="font-semibold text-[#05445E] mb-1">Lettuce</h3>
                <p className="text-[#189AB4] font-bold">$1.99</p>
                <button className="w-full mt-2 bg-[#75E6DA] hover:bg-[#189AB4] text-[#05445E] hover:text-white py-2 rounded-lg transition-colors font-medium">
                  Add to Cart
                </button>
              </div>

              <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all p-4 group">
                <div className="relative mb-4">
                  <img src="/vegetable.jpg" alt="Cherry Tomatoes" className="w-full h-32 object-cover rounded-xl" />
                  <button className="absolute top-2 right-2 bg-[#189AB4] text-white rounded-full p-2 shadow-md">
                    <Heart className="h-4 w-4" />
                  </button>
                </div>
                <h3 className="font-semibold text-[#05445E] mb-1">Cherry Tomatoes</h3>
                <p className="text-[#189AB4] font-bold">$4.99</p>
                <button className="w-full mt-2 bg-[#75E6DA] hover:bg-[#189AB4] text-[#05445E] hover:text-white py-2 rounded-lg transition-colors font-medium">
                  Add to Cart
                </button>
              </div>

              <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all p-4 group">
                <div className="relative mb-4">
                  <img src="/dairy.jpg" alt="Eggs" className="w-full h-32 object-cover rounded-xl" />
                  <button className="absolute top-2 right-2 bg-white text-[#189AB4] rounded-full p-2 shadow-md">
                    <Heart className="h-4 w-4" />
                  </button>
                </div>
                <h3 className="font-semibold text-[#05445E] mb-1">Eggs</h3>
                <p className="text-[#189AB4] font-bold">$2.49</p>
                <button className="w-full mt-2 bg-[#75E6DA] hover:bg-[#189AB4] text-[#05445E] hover:text-white py-2 rounded-lg transition-colors font-medium">
                  Add to Cart
                </button>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={() => navigate({ to: '/products' })}
                className="bg-[#189AB4] hover:bg-[#05445E] text-white px-8 py-3 rounded-full font-semibold transition-all inline-flex items-center gap-2"
              >
                View All
                <span>→</span>
              </button>
            </div>
          </div>
        </section>

        {/* Recommendations Section */}
        <RecommendationsSection
          products={products}
          onProductClick={handleProductClick}
          onAddToCart={handleAddToCart}
        />

        {/* CTA Section */}
        <section className="py-20 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/bannar.png')] bg-cover bg-center"></div>
          <div className="relative max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center mr-40">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Start Shopping?</h2>
            <p className="text-xl mb-8 text-gray-100 max-w-6xl mx-auto">
              Join thousands of happy customers who trust FreshCart for their daily grocery needs.
            </p>
            <button
              onClick={() => navigate({ to: '/stores' })}
              className="bg-[#75E6DA] hover:bg-white text-[#05445E] px-12 py-4 rounded-full text-lg font-semibold transition-all transform hover:scale-105 shadow-xl"
            >
              Shop Now
            </button>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-[#05445E] mb-4">--------- What Our Customers Say ---------</h2>
              <div className="w-32 h-1 bg-[#000d0f] mx-auto mb-4"></div>
              <p className="text-xl max-w-2xl mx-auto text-gray-600">
                Hear from our satisfied customers who love the convenience and quality of FreshCart.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-gray-100 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all border-l-4 border-[#189AB4]">
                <div className="flex items-center mb-4">
                  <img src="https://ichef.bbci.co.uk/images/ic/1920x1080/p074mmrq.jpg" alt="Customer" className="rounded-full w-16 h-16 object-cover mr-4" />
                  <div>
                    <h4 className="font-semibold text-[#05445E]">Sarah K.</h4>
                    <div className="flex text-yellow-400">
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 italic">
                  "FreshCart has completely changed the way I shop for groceries. The delivery is super fast and the quality is top-notch!"
                </p>
              </div>

              <div className="bg-gray-100 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all border-l-4 border-[#189AB4]">
                <div className="flex items-center mb-4">
                  <img src="https://m.media-amazon.com/images/M/MV5BMWY3MjI3ZjQtOWUzOS00Njg4LWFjMWMtYWY1ODVjMjg3MWJjXkEyXkFqcGc@._V1_.jpg" alt="Customer" className="rounded-full w-16 h-16 object-cover mr-4" />
                  <div>
                    <h4 className="font-semibold text-[#05445E]">Martin S.</h4>
                    <div className="flex text-yellow-400">
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 italic">
                  "I love how easy it is to order fresh produce from FreshCart. The app is user-friendly and the service is excellent."
                </p>
              </div>

              <div className="bg-gray-100 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all border-l-4 border-[#189AB4]">
                <div className="flex items-center mb-4">
                  <img src="https://www.themoviedb.org/t/p/original/nmlXYem6k3aaN15FKDYnROY46nA.jpg" alt="Customer" className="rounded-full w-16 h-16 object-cover mr-4" />
                  <div>
                    <h4 className="font-semibold text-[#05445E]">Emily R.</h4>
                    <div className="flex text-yellow-400">
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 italic">
                  "The quality of the groceries is amazing! I can always count on FreshCart for my daily essentials."
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Chatbot Integration Section */}
        <section className="py-2">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ChatbotIntegration />
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}

export default App;