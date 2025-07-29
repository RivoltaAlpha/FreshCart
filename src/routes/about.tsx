import { Clock, Heart, Shield, Truck } from "lucide-react";
import { createFileRoute } from '@tanstack/react-router'
import Header from "@/components/Header";
import { Footer } from "@/components/Footer";
import * as motion from "motion/react-client";

export const Route = createFileRoute('/about')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <>
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen bg-background py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-fresh-primary mb-6">About FreshCart</h1>
          <p className="text-xl text-fresh-secondary max-w-3xl mx-auto leading-relaxed">
            We're on a mission to revolutionize grocery shopping by connecting communities with fresh,
            locally-sourced produce while making healthy eating accessible and convenient for everyone.
          </p>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.8,
            rotate: { duration: 0.8, ease: "easeOut" }
          }}
        >

          {/* Story Section */}
          <div className="bg-card rounded-3xl shadow-xl p-8 md:p-12 mb-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-fresh-primary mb-6">Our Story</h2>
                <p className="text-fresh-secondary mb-4 leading-relaxed">
                  Founded in 2023, FreshCart began with a simple idea: everyone deserves access to fresh,
                  quality groceries without the hassle of long shopping trips. We started by partnering with
                  local farmers and suppliers in Nairobi, creating a platform that benefits both consumers and producers.
                </p>
                <p className="text-fresh-secondary mb-6 leading-relaxed">
                  Today, we're proud to serve thousands of families across Kenya, delivering farm-fresh produce
                  and quality groceries right to their doorsteps. Our commitment to freshness, quality, and
                  community remains at the heart of everything we do.
                </p>
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-[#00A7B3] mb-2">50K+</div>
                    <div className="text-fresh-secondary">Happy Customers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-[#00A7B3] mb-2">200+</div>
                    <div className="text-fresh-secondary">Local Partners</div>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="bg-gradient-to-br from-[#005A61] to-[#00A7B3] rounded-2xl p-8 text-white">
                  <h3 className="text-2xl font-bold mb-4">Our Values</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Heart className="h-6 w-6 text-[#00A7B3] mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold">Quality First</h4>
                        <p className="text-sm opacity-90">We never compromise on the quality of our products</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Shield className="h-6 w-6 text-[#00A7B3] mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold">Trust & Transparency</h4>
                        <p className="text-sm opacity-90">Building lasting relationships through honest practices</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Truck className="h-6 w-6 text-[#00A7B3] mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold">Fast & Reliable</h4>
                        <p className="text-sm opacity-90">Consistent delivery times you can count on</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Benefits Section */}
          <section className="bg-card rounded-3xl shadow-xl p-8 md:p-12 mb-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="text-center">
                  <div className="bg-[#75E6DA]/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="h-10 w-10 text-[#189AB4]" />
                  </div>
                  <h3 className="text-xl font-bold text-[#05445E] mb-2">Lightning Fast Delivery</h3>
                  <p className="text-gray-600">
                    Get your groceries delivered in under 30 minutes
                  </p>
                </div>

                <div className="text-center">
                  <div className="bg-[#75E6DA]/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="h-10 w-10 text-[#189AB4]" />
                  </div>
                  <h3 className="text-xl font-bold text-[#05445E] mb-2">Quality Guarantee</h3>
                  <p className="text-gray-600">
                    Fresh products with 100% quality guarantee
                  </p>
                </div>

                <div className="text-center">
                  <div className="bg-[#75E6DA]/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="h-10 w-10 text-[#189AB4]" />
                  </div>
                  <h3 className="text-xl font-bold text-[#05445E] mb-2">100% Secure Payment</h3>
                  <p className="text-gray-600">
                    Safe and secure payment processing
                  </p>
                </div>

                <div className="text-center">
                  <div className="bg-[#75E6DA]/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="h-10 w-10 text-[#189AB4]" />
                  </div>
                  <h3 className="text-xl font-bold text-[#05445E] mb-2">Customer Support 24/7</h3>
                  <p className="text-gray-600">
                    Round the clock customer support
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Team Section */}
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-fresh-primary mb-4">Meet Our Team</h2>
            <p className="text-fresh-secondary text-lg mb-12">The passionate people behind FreshCart</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-card rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow">
                <div className="w-24 h-24 bg-gradient-to-br from-[#005A61] to-[#00A7B3] rounded-full mx-auto mb-6 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">JI</span>
                </div>
                <h3 className="text-xl font-bold text-fresh-primary mb-2">John Ihugo</h3>
                <p className="text-[#00A7B3] font-semibold mb-3">CEO & Founder</p>
                <p className="text-fresh-secondary text-sm">
                  Former agriculture specialist with 10 years of experience connecting farmers to markets.
                </p>
              </div>

              <div className="bg-card rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow">
                <div className="w-24 h-24 bg-gradient-to-br from-[#005A61] to-[#00A7B3] rounded-full mx-auto mb-6 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">VO</span>
                </div>
                <h3 className="text-xl font-bold text-fresh-primary mb-2">Valarie Okumu</h3>
                <p className="text-[#00A7B3] font-semibold mb-3">Head of Operations</p>
                <p className="text-fresh-secondary text-sm">
                  Supply chain expert ensuring our delivery network runs smoothly across Kenya.
                </p>
              </div>

              <div className="bg-card rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow">
                <div className="w-24 h-24 bg-gradient-to-br from-[#005A61] to-[#00A7B3] rounded-full mx-auto mb-6 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">TN</span>
                </div>
                <h3 className="text-xl font-bold text-fresh-primary mb-2">Mwaniki Tifany</h3>
                <p className="text-[#00A7B3] font-semibold mb-3">Tech Lead</p>
                <p className="text-fresh-secondary text-sm">
                  Software engineer passionate about building technology that makes life easier.
                </p>
              </div>
            </div>
          </div>

          {/* Mission Section */}
          <div className="bg-gradient-to-r from-[#005A61] to-[#00A7B3] rounded-3xl p-8 md:p-12 text-white text-center">
            <h2 className="text-4xl font-bold mb-6">Our Mission</h2>
            <p className="text-xl leading-relaxed max-w-4xl mx-auto">
              To create a sustainable ecosystem where fresh, nutritious food is accessible to all,
              while empowering local farmers and small businesses to thrive in the digital economy.
              We believe that everyone deserves quality groceries, and technology can make that possible.
            </p>
          </div>
        </motion.div>
      </div>
      <Footer />
    </>
  );
};
