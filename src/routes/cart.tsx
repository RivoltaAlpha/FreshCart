import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, ArrowLeft, CreditCard, Truck, Shield, Tag, MapPin, Clock } from 'lucide-react';

export const Route = createFileRoute('/cart')({
  component: RouteComponent,
})

function RouteComponent() {

  // Sample cart data - in a real app, this would come from state management
  const initialCartItems = [
    {
      id: 1,
      name: "Fresh Lettuce",
      seller: "Organic Fields Co",
      price: 100.25,
      unit: "per head",
      location: "1.8 miles away",
      image: "https://img.freepik.com/free-psd/fresh-green-lettuce-vibrant-healthy-vegetable_84443-40401.jpg?uid=R154664640&semt=ais_hybrid&w=740",
      quantity: 2,
      category: "Leafy Greens"
    },
    {
      id: 2,
      name: "Organic Tomatoes",
      seller: "Farm Fresh Ltd",
      price: 85.50,
      unit: "per kg",
      location: "2.1 miles away",
      image: "https://img.freepik.com/premium-photo/tomato-vegetables-isolated-white-fresh-tomato-fruit-clipping-path-tomato-macro-photo_299651-600.jpg?uid=R154664640&semt=ais_hybrid&w=740",
      quantity: 1,
      category: "Vegetables"
    },
    {
      id: 3,
      name: "Fresh Bananas",
      seller: "Tropical Fruits Co",
      price: 65.00,
      unit: "per dozen",
      location: "1.5 miles away",
      image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&h=300&fit=crop",
      quantity: 3,
      category: "Fruits"
    },
    {
      id: 4,
      name: "Fresh Milk",
      seller: "Dairy Pure",
      price: 120.00,
      unit: "per liter",
      location: "0.8 miles away",
      image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&h=300&fit=crop",
      quantity: 1,
      category: "Dairy"
    }
  ];

  const [cartItems, setCartItems] = useState(initialCartItems);
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [deliveryOption, setDeliveryOption] = useState('standard');

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = deliveryOption === 'express' ? 150 : deliveryOption === 'standard' ? 50 : 0;
  const promoDiscount = appliedPromo ? subtotal * (appliedPromo.discount / 100) : 0;
  const total = subtotal + deliveryFee - promoDiscount;

  // Promo codes
  const promoCodes = {
    'FRESH10': { discount: 10, description: '10% off your order' },
    'WELCOME': { discount: 15, description: '15% off for new customers' },
    'SAVE20': { discount: 20, description: '20% off orders over KSh 500' }
  };

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity <= 0) {
      removeItem(id);
      return;
    }
    setCartItems(items =>
      items.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = (id) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  const applyPromoCode = () => {
    const promo = promoCodes[promoCode.toUpperCase()];
    if (promo) {
      if (promoCode.toUpperCase() === 'SAVE20' && subtotal < 500) {
        alert('This promo code requires a minimum order of KSh 500');
        return;
      }
      setAppliedPromo({ code: promoCode.toUpperCase(), ...promo });
      setPromoCode('');
    } else {
      alert('Invalid promo code');
    }
  };

  const removePromoCode = () => {
    setAppliedPromo(null);
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <ShoppingCart className="h-24 w-24 text-[#516E89] mx-auto mb-6" />
            <h1 className="text-4xl font-bold text-[#005A61] mb-4">Your Cart is Empty</h1>
            <p className="text-[#516E89] text-lg mb-8">
              Looks like you haven't added any items to your cart yet.
            </p>
            <button className="bg-[#00A7B3] hover:bg-[#00A7B3]/90 text-white px-8 py-4 rounded-full text-lg font-semibold transition-colors">
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/products" className="flex items-center p-2 hover:bg-gray-200 rounded-full transition-colors">
              <ArrowLeft className="h-6 w-6 text-[#516E89]" />
            </Link>
            <div>
              <h1 className="text-4xl font-bold text-[#005A61]">Shopping Cart</h1>
              <p className="text-[#516E89]">{cartItems.length} item{cartItems.length !== 1 ? 's' : ''} in your cart</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Product Image */}
                  <div className="flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full sm:w-24 h-32 sm:h-24 object-cover rounded-xl"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-[#005A61] mb-1">{item.name}</h3>
                        <p className="text-[#516E89] text-sm mb-2">{item.seller}</p>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs bg-gray-100 text-[#516E89] px-2 py-1 rounded-full">
                            {item.category}
                          </span>
                          <div className="flex items-center text-sm text-[#516E89]">
                            <MapPin className="h-3 w-3 mr-1" />
                            {item.location}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-2xl font-bold text-[#005A61]">
                              KSh {item.price.toFixed(2)}
                            </span>
                            <span className="text-sm text-[#516E89] ml-1">{item.unit}</span>
                          </div>
                        </div>
                      </div>

                      {/* Quantity and Remove */}
                      <div className="flex items-center justify-between sm:flex-col sm:items-end gap-4 mt-4 sm:mt-0">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="font-semibold text-[#005A61] min-w-[2rem] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 bg-[#00A7B3] hover:bg-[#00A7B3]/90 text-white rounded-full flex items-center justify-center transition-colors"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    {/* Item Total */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="text-[#516E89]">Subtotal:</span>
                        <span className="text-xl font-bold text-[#005A61]">
                          KSh {(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            {/* Promo Code */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-[#005A61] mb-4">Promo Code</h3>
              {appliedPromo ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Tag className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-semibold text-green-800">{appliedPromo.code}</p>
                        <p className="text-sm text-green-600">{appliedPromo.description}</p>
                      </div>
                    </div>
                    <button
                      onClick={removePromoCode}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Enter promo code"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00A7B3] focus:border-transparent"
                  />
                  <button
                    onClick={applyPromoCode}
                    className="bg-[#00A7B3] hover:bg-[#00A7B3]/90 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
                  >
                    Apply
                  </button>
                </div>
              )}
            </div>

            {/* Delivery Options */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-[#005A61] mb-4">Delivery Options</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name="delivery"
                    value="pickup"
                    checked={deliveryOption === 'pickup'}
                    onChange={(e) => setDeliveryOption(e.target.value)}
                    className="text-[#00A7B3] focus:ring-[#00A7B3]"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-[#00A7B3]" />
                      <span className="font-semibold text-[#005A61]">Store Pickup</span>
                    </div>
                    <p className="text-sm text-[#516E89]">Free - Ready in 15 minutes</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name="delivery"
                    value="standard"
                    checked={deliveryOption === 'standard'}
                    onChange={(e) => setDeliveryOption(e.target.value)}
                    className="text-[#00A7B3] focus:ring-[#00A7B3]"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-[#00A7B3]" />
                      <span className="font-semibold text-[#005A61]">Standard Delivery</span>
                    </div>
                    <p className="text-sm text-[#516E89]">KSh 50 - 1-2 hours</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name="delivery"
                    value="express"
                    checked={deliveryOption === 'express'}
                    onChange={(e) => setDeliveryOption(e.target.value)}
                    className="text-[#00A7B3] focus:ring-[#00A7B3]"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-[#00A7B3]" />
                      <span className="font-semibold text-[#005A61]">Express Delivery</span>
                    </div>
                    <p className="text-sm text-[#516E89]">KSh 150 - 30 minutes</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-[#005A61] mb-4">Order Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-[#516E89]">Subtotal</span>
                  <span className="font-semibold text-[#005A61]">KSh {subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-[#516E89]">Delivery Fee</span>
                  <span className="font-semibold text-[#005A61]">
                    {deliveryFee === 0 ? 'Free' : `KSh ${deliveryFee.toFixed(2)}`}
                  </span>
                </div>

                {promoDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({appliedPromo.code})</span>
                    <span>-KSh {promoDiscount.toFixed(2)}</span>
                  </div>
                )}

                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-lg">
                    <span className="font-bold text-[#005A61]">Total</span>
                    <span className="font-bold text-[#005A61]">KSh {total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <button className="w-full bg-[#00A7B3] hover:bg-[#00A7B3]/90 text-white py-4 rounded-xl font-semibold text-lg transition-colors flex items-center justify-center gap-2 mt-6">
                <CreditCard className="h-5 w-5" />
                Proceed to Checkout
              </button>

              <div className="flex items-center justify-center gap-2 mt-4 text-sm text-[#516E89]">
                <Shield className="h-4 w-4" />
                <span>Secure checkout with SSL encryption</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

