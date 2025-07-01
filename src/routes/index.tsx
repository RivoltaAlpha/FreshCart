import {  Star, Clock, Truck, Shield, Heart } from 'lucide-react';
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#005A61] via-[#00A7B3] to-[#6A89A7] text-black py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                Fresh Groceries
                <span className="block text-[#00A7B3]">Delivered Fast</span>
              </h1>
              <p className="text-xl mb-8 text-gray-100">
                Get farm-fresh produce, quality groceries, and daily essentials delivered to your doorstep in under 30 minutes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="bg-[#00A7B3] hover:bg-[#00A7B3]/90 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all transform hover:scale-105 shadow-lg">
                  Order Now
                </button>
                <button className="border-2 border-white text-white hover:bg-white hover:text-[#005A61] px-8 py-4 rounded-full text-lg font-semibold transition-all">
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
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#005A61] mb-4">Why Choose FreshCart?</h2>
            <p className="text-xl text-[#516E89] max-w-2xl mx-auto">
              We're committed to bringing you the freshest groceries with unmatched convenience and quality.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="bg-[#00A7B3]/10 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <Clock className="h-8 w-8 text-[#00A7B3]" />
              </div>
              <h3 className="text-2xl font-bold text-[#005A61] mb-4">Lightning Fast Delivery</h3>
              <p className="text-[#516E89]">
                Get your groceries delivered in under 30 minutes with our efficient delivery network across the city.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="bg-[#00A7B3]/10 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <Shield className="h-8 w-8 text-[#00A7B3]" />
              </div>
              <h3 className="text-2xl font-bold text-[#005A61] mb-4">Quality Guaranteed</h3>
              <p className="text-[#516E89]">
                We partner with trusted local farmers and suppliers to ensure you get the freshest, highest quality products.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="bg-[#00A7B3]/10 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <Heart className="h-8 w-8 text-[#00A7B3]" />
              </div>
              <h3 className="text-2xl font-bold text-[#005A61] mb-4">Made with Love</h3>
              <p className="text-[#516E89]">
                Every order is carefully selected and packed with care, ensuring your groceries arrive in perfect condition.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#005A61] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Start Shopping?</h2>
          <p className="text-xl mb-8 text-gray-100">
            Join thousands of happy customers who trust FreshCart for their daily grocery needs.
          </p>
          <button className="bg-[#00A7B3] hover:bg-[#00A7B3]/90 text-white px-12 py-4 rounded-full text-lg font-semibold transition-all transform hover:scale-105 shadow-lg">
            Start Shopping Now
          </button>
        </div>
      </section>
    </div>
  );
}

export default App;