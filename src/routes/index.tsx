import { Star, Truck, Shield, Heart, TrendingUpIcon, StarIcon } from 'lucide-react';
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import RecommendationsSection from '@/components/recommendations';
import type { Product } from '@/Gemini/context';
import Header from '@/components/Header';
import { Footer } from '@/components/Footer';
import { usePopularProducts, useProducts } from '@/hooks/useProducts';
import HeroSection from '@/components/Hero';

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  const navigate = useNavigate();
  const { data: allProducts } = useProducts();
  const products = allProducts || [];
  const { data: topProducts } = usePopularProducts();



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
        <HeroSection navigate={navigate} />

        <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          {/* Floating strawberry images */}
          <div className="absolute  lg:-left-48 -left-20 -top-10 lg:top-2 w-64 h-40 opacity-90">
            <img src="/strawberries 1.png" alt="Strawberry" className="w-full h-full object-contain" />
          </div>
          <div className="absolute -bottom-10 lg:-right-44 -right-12 w-64 h-40 opacity-90">
            <img src="/strawberries 1.png" alt="Strawberry" className="w-full h-full object-contain" />
          </div>

          {/* Why Choose FreshCart Cards */}
          <div className="bg-card backdrop-blur-sm rounded-3xl p-8 shadow-2xl ">
            <h3 className="text-3xl font-bold text-center mb-8">Why Choose FreshCart?</h3>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="bg-[#75E6DA]/20 rounded-2xl p-6 text-center">
                <div className="bg-[#189AB4] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Truck className="h-8 w-8 text-white" />
                </div>
                <p className="font-semibold text-sm">Fast Shipping</p>
              </div>
              <div className="bg-[#75E6DA]/20 rounded-2xl p-6 text-center">
                <div className="bg-[#189AB4] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <p className="font-semibold text-sm">Quality Guarantee</p>
              </div>
              <div className="bg-[#75E6DA]/20 rounded-2xl p-6 text-center">
                <div className="bg-[#189AB4] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <p className="font-semibold text-sm">100% Secure Payment</p>
              </div>
              <div className="bg-[#75E6DA]/20 rounded-2xl p-6 text-center">
                <div className="bg-[#189AB4] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Heart className="h-8 w-8 text-white" />
                </div>
                <p className="font-semibold text-sm">Customer Support 24/7</p>
              </div>
            </div>
          </div>
        </section>


        {/* Top Products Section */}
        <section className=" py-12 lg:px-60 px-4 mb-8">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {topProducts?.map((product, index) => (
              <div
                key={product.product_id}
                className="group relative gap-0 bg-card lg:h-full md:h-20 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden border border-[#005A61]/10"
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
                <div className="relative aspect-square bg-gray-50 overflow-hidden lg:w-full md:w-10">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="lg:w-full md:w-20 lg:h-full md:h-60 object-cover group-hover:scale-110 transition-transform duration-300"
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
              </div>
            ))}
          </div>
        </section>


        {/* Categories Section */}
        <section className="py-16 rounded mx-auto shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
              <div className="lg:col-span-1">
                <h2 className="text-4xl font-bold mb-6">Popular Categories</h2>
                <p className="text-lg  mb-8">
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
                  <div className="bg-card rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all group cursor-pointer">
                    <img src="https://jooinn.com/images/fresh-fruits-14.jpg" alt="Fresh Fruit" className="w-16 h-16 mx-auto mb-4 rounded-full object-cover group-hover:scale-110 transition-transform" />
                    <h3 className="font-semibold ">Fresh Fruit</h3>
                  </div>

                  <div className="bg-card rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all group cursor-pointer">
                    <img src="https://jooinn.com/images/vegetable-basket-6.jpg" alt="Fresh Vegetable" className="w-16 h-16 mx-auto mb-4 rounded-full object-cover group-hover:scale-110 transition-transform" />
                    <h3 className="font-semibold ">Fresh Vegetable</h3>
                  </div>

                  <div className="bg-card rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all group cursor-pointer">
                    <img src="https://th.bing.com/th/id/R.c3db916c4d2cc60eab697d635d078447?rik=GbMuNdFBcyiiSw&riu=http%3a%2f%2fs3.wp.wsu.edu%2fuploads%2fsites%2f2055%2f2017%2f07%2fiStock-483027918-1024x683.jpg&ehk=u9JBZ9yWvacUGVPTDQe9pznTtrqn6fXWGd4jo0Ndjpw%3d&risl=&pid=ImgRaw&r=0" alt="Meat & Fish" className="w-16 h-16 mx-auto mb-4 rounded-full object-cover group-hover:scale-110 transition-transform" />
                    <h3 className="font-semibold ">Meat & Fish</h3>
                  </div>

                  <div className="bg-card rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all group cursor-pointer">
                    <img src="https://bluegrassingredients.com/wp-content/uploads/2021/09/dairy-seasoning-powders.png" alt="Snacks" className="w-16 h-16 mx-auto mb-4 rounded-full object-cover group-hover:scale-110 transition-transform" />
                    <h3 className="font-semibold ">Snacks</h3>
                  </div>

                  <div className="bg-card rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all group cursor-pointer">
                    <img src="https://www.apprenticeship.ng/wp-content/uploads/2019/05/BREAD2.jpg" alt="Bread & Bakery" className="w-16 h-16 mx-auto mb-4 rounded-full object-cover group-hover:scale-110 transition-transform" />
                    <h3 className="font-semibold ">Pastries</h3>
                  </div>

                  <div className="bg-card rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all group cursor-pointer">
                    <img src="https://cleanfoodcrush.com/wp-content/uploads/2017/03/CleanFoodCrush-Leafy-greens.jpg" alt="Leafy Greens" className="w-16 h-16 mx-auto mb-4 rounded-full object-cover group-hover:scale-110 transition-transform" />
                    <h3 className="font-semibold ">Leafy Greens</h3>
                  </div>
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
              className="bg-[#75E6DA] hover:bg-card px-12 py-4 rounded-full text-lg font-semibold transition-all transform hover:scale-105 shadow-xl"
            >
              Shop Now
            </button>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">What Our Customers Say</h2>
              <div className="w-32 h-1 bg-[#189AB4] mx-auto mb-4"></div>
              <p className="text-xl max-w-2xl mx-auto ">
                Hear from our satisfied customers who love the convenience and quality of FreshCart.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-card p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all border-l-4 border-[#189AB4]">
                <div className="flex items-center mb-4">
                  <img src="https://ichef.bbci.co.uk/images/ic/1920x1080/p074mmrq.jpg" alt="Customer" className="rounded-full w-16 h-16 object-cover mr-4" />
                  <div>
                    <h4 className="font-semibold ">Sarah K.</h4>
                    <div className="flex text-yellow-400">
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                    </div>
                  </div>
                </div>
                <p className=" italic">
                  "FreshCart has completely changed the way I shop for groceries. The delivery is super fast and the quality is top-notch!"
                </p>
              </div>

              <div className="bg-card p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all border-l-4 border-[#189AB4]">
                <div className="flex items-center mb-4">
                  <img src="https://m.media-amazon.com/images/M/MV5BMWY3MjI3ZjQtOWUzOS00Njg4LWFjMWMtYWY1ODVjMjg3MWJjXkEyXkFqcGc@._V1_.jpg" alt="Customer" className="rounded-full w-16 h-16 object-cover mr-4" />
                  <div>
                    <h4 className="font-semibold ">Martin S.</h4>
                    <div className="flex text-yellow-400">
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                    </div>
                  </div>
                </div>
                <p className=" italic">
                  "I love how easy it is to order fresh produce from FreshCart. The app is user-friendly and the service is excellent."
                </p>
              </div>

              <div className="bg-card p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all border-l-4 border-[#189AB4]">
                <div className="flex items-center mb-4">
                  <img src="https://www.themoviedb.org/t/p/original/nmlXYem6k3aaN15FKDYnROY46nA.jpg" alt="Customer" className="rounded-full w-16 h-16 object-cover mr-4" />
                  <div>
                    <h4 className="font-semibold ">Emily R.</h4>
                    <div className="flex text-yellow-400">
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                    </div>
                  </div>
                </div>
                <p className="italic">
                  "The quality of the groceries is amazing! I can always count on FreshCart for my daily essentials."
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />

    </>
  );
}

export default App;