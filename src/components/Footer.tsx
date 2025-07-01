import { Facebook, Instagram, Mail, MapIcon, Phone, ShoppingCart, Twitter } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-[#005A61] text-white border-t border-[#516E89]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <ShoppingCart className="h-8 w-8 text-[#00A7B3]" />
              <span className="ml-2 text-2xl font-bold">FreshCart</span>
            </div>
            <p className="text-[#6A89A7] mb-4 max-w-md">
              Your trusted partner for fresh, quality groceries delivered right to your doorstep. 
              We connect you with local farmers and stores for the freshest produce.
            </p>
            <div className="flex space-x-4">
              <Facebook className="h-6 w-6 text-[#6A89A7] hover:text-[#00A7B3] cursor-pointer transition-colors" />
              <Twitter className="h-6 w-6 text-[#6A89A7] hover:text-[#00A7B3] cursor-pointer transition-colors" />
              <Instagram className="h-6 w-6 text-[#6A89A7] hover:text-[#00A7B3] cursor-pointer transition-colors" />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-[#6A89A7] hover:text-[#00A7B3] transition-colors">About Us</a></li>
              <li><a href="#" className="text-[#6A89A7] hover:text-[#00A7B3] transition-colors">Products</a></li>
              <li><a href="#" className="text-[#6A89A7] hover:text-[#00A7B3] transition-colors">Delivery Areas</a></li>
              <li><a href="#" className="text-[#6A89A7] hover:text-[#00A7B3] transition-colors">FAQ</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <div className="space-y-2">
              <div className="flex items-center">
                <Phone className="h-4 w-4 text-[#00A7B3] mr-2" />
                <span className="text-[#6A89A7]">+254 700 123 456</span>
              </div>
              <div className="flex items-center">
                <Mail className="h-4 w-4 text-[#00A7B3] mr-2" />
                <span className="text-[#6A89A7]">hello@freshcart.co.ke</span>
              </div>
              <div className="flex items-center">
                <MapIcon className="h-4 w-4 text-[#00A7B3] mr-2" />
                <span className="text-[#6A89A7]">Nairobi, Kenya</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-[#516E89] mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-[#6A89A7] text-sm">
              © 2025 FreshCart. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-[#6A89A7] hover:text-[#00A7B3] text-sm transition-colors">Privacy Policy</a>
              <a href="#" className="text-[#6A89A7] hover:text-[#00A7B3] text-sm transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};