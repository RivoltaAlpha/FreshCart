import { Clock, Mail, MapIcon, Phone } from "lucide-react";
import { createFileRoute } from '@tanstack/react-router'
import { useState } from "react";

export const Route = createFileRoute('/contact')({
  component: ContactPage,
})

// Contact Page Component
function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: any) => {
    e.preventDefault();
    // Handle form submission
    alert('Thank you for contacting us! We\'ll get back to you soon.');
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
  };

  const handleChange = (e: any) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-[#005A61] mb-6">Contact Us</h1>
          <p className="text-xl text-[#516E89] max-w-2xl mx-auto">
            We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-card rounded-3xl shadow-xl p-8">
            <h2 className="text-3xl font-bold text-[#005A61] mb-8">Get in Touch</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[#516E89] font-semibold mb-2">Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00A7B3] focus:border-transparent"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="block text-[#516E89] font-semibold mb-2">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00A7B3] focus:border-transparent"
                    placeholder="+254 700 123 456"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-[#516E89] font-semibold mb-2">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00A7B3] focus:border-transparent"
                  placeholder="your.email@example.com"
                />
              </div>
              
              <div>
                <label className="block text-[#516E89] font-semibold mb-2">Subject *</label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00A7B3] focus:border-transparent"
                >
                  <option value="">Select a subject</option>
                  <option value="general">General Inquiry</option>
                  <option value="support">Customer Support</option>
                  <option value="partnership">Partnership</option>
                  <option value="feedback">Feedback</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-[#516E89] font-semibold mb-2">Message *</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00A7B3] focus:border-transparent resize-none"
                  placeholder="Tell us how we can help you..."
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-[#00A7B3] hover:bg-[#00A7B3]/90 text-white px-8 py-4 rounded-xl font-semibold transition-colors"
              >
                Send Message
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            <div className="bg-card rounded-3xl shadow-xl p-8">
              <h3 className="text-2xl font-bold text-[#005A61] mb-6">Contact Information</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-[#00A7B3]/10 p-3 rounded-full">
                    <Phone className="h-6 w-6 text-[#00A7B3]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#005A61] mb-1">Phone</h4>
                    <p className="text-[#516E89]">+254 700 123 456</p>
                    <p className="text-[#516E89]">+254 720 987 654</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="bg-[#00A7B3]/10 p-3 rounded-full">
                    <Mail className="h-6 w-6 text-[#00A7B3]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#005A61] mb-1">Email</h4>
                    <p className="text-[#516E89]">hello@freshcart.co.ke</p>
                    <p className="text-[#516E89]">support@freshcart.co.ke</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="bg-[#00A7B3]/10 p-3 rounded-full">
                    <MapIcon className="h-6 w-6 text-[#00A7B3]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#005A61] mb-1">Address</h4>
                    <p className="text-[#516E89]">123 Fresh Street</p>
                    <p className="text-[#516E89]">Westlands, Nairobi</p>
                    <p className="text-[#516E89]">Kenya</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="bg-[#00A7B3]/10 p-3 rounded-full">
                    <Clock className="h-6 w-6 text-[#00A7B3]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#005A61] mb-1">Business Hours</h4>
                    <p className="text-[#516E89]">Monday - Friday: 7:00 AM - 9:00 PM</p>
                    <p className="text-[#516E89]">Saturday - Sunday: 8:00 AM - 8:00 PM</p>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="bg-card rounded-3xl shadow-xl p-8">
              <h3 className="text-2xl font-bold text-[#005A61] mb-6">Frequently Asked Questions</h3>
              <div className="space-y-4">
                <div className="border-b border-gray-200 pb-4">
                  <h4 className="font-semibold text-[#005A61] mb-2">What are your delivery areas?</h4>
                  <p className="text-[#516E89] text-sm">We currently deliver within Nairobi and selected areas in Central Kenya. Check our app for specific coverage in your area.</p>
                </div>
                <div className="border-b border-gray-200 pb-4">
                  <h4 className="font-semibold text-[#005A61] mb-2">How fast is delivery?</h4>
                  <p className="text-[#516E89] text-sm">Most orders are delivered within 30 minutes to 2 hours, depending on your location and order size.</p>
                </div>
                <div className="border-b border-gray-200 pb-4">
                  <h4 className="font-semibold text-[#005A61] mb-2">What payment methods do you accept?</h4>
                  <p className="text-[#516E89] text-sm">We accept M-Pesa, credit/debit cards, and cash on delivery for your convenience.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-[#005A61] mb-2">Do you offer refunds?</h4>
                  <p className="text-[#516E89] text-sm">Yes, we offer full refunds for damaged or unsatisfactory products. Contact us within 24 hours of delivery.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
