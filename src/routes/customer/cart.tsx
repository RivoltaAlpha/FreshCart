import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, ArrowLeft, CreditCard, Truck, Shield, Tag, MapPin, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { cartStore, cartActions } from '@/store/cart';
import { orderActions } from '@/store/order';
import { storesStore } from '@/store/store';
import { authStore } from '@/store/auth';
import { DeliveryMethod } from '@/types/types';
import { useOrderMutation } from '@/hooks/useOrders';

export const Route = createFileRoute('/customer/cart')({
  component: RouteComponent,
})

function RouteComponent() {
  const [cartItems, setCartItems] = useState(cartStore.state.items);
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number; description: string } | null>(null);
  const [deliveryOption, setDeliveryOption] = useState('standard');
  const authUser = localStorage.getItem('auth');
  const user_id = JSON.parse(authUser || '{}')?.user?.user_id;
  const selectedStore = localStorage.getItem('selectedStore');
  const store_id = JSON.parse(selectedStore || '{}')?.store_id;

  const { mutate: createNewOrder } = useOrderMutation({
    type: 'create',
    onSuccess: () => {
      console.log('Order mutation successful');
      toast.success('Order created successfully! Proceeding to checkout...');
      navigate({ to: '/customer/checkout-order' });
    }
  });

  // Load cart from storage and subscribe to changes
  useEffect(() => {
    cartActions.loadFromStorage();
    setCartItems(cartStore.state.items);

    // Subscribe to cart changes
    const unsubscribe = cartStore.subscribe(() => {
      setCartItems(cartStore.state.items);
    });

    return () => unsubscribe();
  }, []);

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) =>
    sum + (Number(item.product.price) * Number(item.quantity)), 0);
  const deliveryFee = deliveryOption === 'express_delivery' ? 150 : deliveryOption === 'standard_delivery' ? 50 : 0;
  const promoDiscount = appliedPromo ? subtotal * (appliedPromo.discount / 100) : 0;
  const total = subtotal + deliveryFee - promoDiscount;

  // Promo codes
  const promoCodes: Record<string, { discount: number; description: string }> = {
    'FRESH10': { discount: 10, description: '10% off your order' },
    'WELCOME': { discount: 15, description: '15% off for new customers' },
    'SAVE20': { discount: 20, description: '20% off orders over KSh 500' }
  };

  const updateQuantity = (productId: number, newQuantity: number) => {
    cartActions.updateQuantity(productId, newQuantity);
  };

  const removeItem = (productId: number) => {
    cartActions.removeFromCart(productId);
    toast.success('Item removed from cart');
  };

  const applyPromoCode = () => {
    const promo = promoCodes[promoCode.toUpperCase()];
    if (promo) {
      if (promoCode.toUpperCase() === 'SAVE20' && subtotal < 500) {
        toast.error('This promo code requires a minimum order of KSh 500');
        return;
      }
      setAppliedPromo({ code: promoCode.toUpperCase(), ...promo });
      setPromoCode('');
      toast.success('Promo code applied!');
    } else {
      toast.error('Invalid promo code');
    }
  };

  const removePromoCode = () => {
    setAppliedPromo(null);
  };

  const navigate = useNavigate();

  const proceedToCheckout = async () => {
    console.log('Proceeding to checkout with cart items:', cartItems);
    console.log('Auth user:', authStore.state.user);
    console.log('Store state:', storesStore.state);

    // Validate user and store data
    if (!user_id) {
      toast.error('User authentication required. Please log in again.');
      return;
    }

    if (!store_id) {
      toast.error('Store selection required. Please select a store.');
      return;
    }

    try {
      const orderData = {
        user_id: Number(user_id), // Use the parsed user_id, not authUser
        store_id: Number(store_id),
        delivery_method: deliveryOption as DeliveryMethod,
        delivery_address: "Default Address", // This will be updated on checkout page
        estimated_delivery_time: deliveryOption === 'express_delivery' ? 30 : deliveryOption === 'standard_delivery' ? 120 : 15,
        items: cartItems.map(item => ({
          product_id: item.product.product_id,
          quantity: item.quantity
        }))
      };
      console.log('Order data prepared for API:', orderData);

      // Prepare order details for local store
      const orderDetails = {
        user_id: user_id, // Use parsed user_id
        store_id: store_id,
        customer_email: authStore.state.user.email,
        items: cartItems,
        delivery_method: deliveryOption as DeliveryMethod,
        delivery_address: 'Default Address',
        subtotal,
        delivery_fee: deliveryFee,
        promo_code: appliedPromo?.code || undefined,
        promo_discount: promoDiscount,
        total_amount: total,
        estimated_delivery_time: deliveryOption === 'express_delivery' ? 30 : deliveryOption === 'standard_delivery' ? 120 : 15,
      };

      orderActions.setCurrentOrder(orderDetails);
      createNewOrder(orderData, {
        onSuccess: (createdOrder) => {
          console.log('Order created:', createdOrder);

          // Update local store with the created order ID if available
          if (createdOrder?.order_id) {
            orderActions.updateOrderDetails({
              order_id: createdOrder.order_id,
              order_number: createdOrder.order_number
            });
          }

          // Navigate to checkout
          navigate({ to: '/customer/checkout-order' });
          toast.success('Order created successfully! Proceeding to checkout...');
        },
        onError: (error) => {
          console.error('Error creating order:', error);
          toast.error('Failed to create order. Please try again.');
        }
      });

    } catch (error) {
      console.error('Error in checkout process:', error);
      toast.error('Failed to proceed to checkout. Please try again.');
    }
  }


  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <ShoppingCart className="h-24 w-24 text-fresh-secondary mx-auto mb-6" />
            <h1 className="text-4xl font-bold text-fresh-primary mb-4">Your Cart is Empty</h1>
            <p className="text-fresh-secondary text-lg mb-8">
              Looks like you haven't added any items to your cart yet.
            </p>
            <Link
              to="/store"
              className="bg-[#00A7B3] hover:bg-[#00A7B3]/90 text-white px-8 py-4 rounded-full text-lg font-semibold transition-colors inline-block"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/products" className="flex items-center p-2 hover:bg-gray-200 rounded-full transition-colors">
              <ArrowLeft className="h-6 w-6 text-fresh-secondary" />
            </Link>
            <div>
              <h1 className="text-4xl font-bold text-fresh-primary">Shopping Cart</h1>
              <p className="text-fresh-secondary">{cartItems.length} item{cartItems.length !== 1 ? "s" : ""} in your cart</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div key={item.product.product_id} className="bg-card rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Product Image */}
                  <div className="flex-shrink-0">
                    <img
                      src={item.product.image_url}
                      alt={item.product.name}
                      className="w-full sm:w-24 h-32 sm:h-24 object-cover rounded-xl"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-fresh-primary mb-1">{item.product.name}</h3>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs bg-gray-100 text-fresh-secondary px-2 py-1 rounded-full">
                            {item.product.category.name}
                          </span>
                          <div className="flex items-center text-sm text-fresh-secondary">
                            <MapPin className="h-3 w-3 mr-1" />
                            {item.product.category.description}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-2xl font-bold text-fresh-primary">
                              KSh {Number(item.product.price).toFixed(2)}
                            </span>
                            <span className="text-sm text-fresh-secondary ml-1">{item.product.unit}</span>
                          </div>
                        </div>
                      </div>

                      {/* Quantity and Remove */}
                      <div className="flex items-center justify-between sm:flex-col sm:items-end gap-4 mt-4 sm:mt-0">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => updateQuantity(item.product.product_id, item.quantity - 1)}
                            className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="font-semibold text-fresh-primary min-w-[2rem] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.product_id, item.quantity + 1)}
                            className="w-8 h-8 bg-[#00A7B3] hover:bg-[#00A7B3]/90 text-white rounded-full flex items-center justify-center transition-colors"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeItem(item.product.product_id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    {/* Item Total */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="text-fresh-secondary">Subtotal:</span>
                        <span className="text-xl font-bold text-fresh-primary">
                          KSh {(Number(item.product.price) * item.quantity).toFixed(2)}
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
            <div className="bg-card rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-fresh-primary mb-4">Promo Code</h3>
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
            <div className="bg-card rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-fresh-primary mb-4">Delivery Options</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl hover:bg-background cursor-pointer">
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
                      <span className="font-semibold text-fresh-primary">Store Pickup</span>
                    </div>
                    <p className="text-sm text-fresh-secondary">Free - Ready in 15 minutes</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl hover:bg-background cursor-pointer">
                  <input
                    type="radio"
                    name="standard_delivery"
                    value="standard_delivery"
                    checked={deliveryOption === 'standard_delivery'}
                    onChange={(e) => setDeliveryOption(e.target.value)}
                    className="text-[#00A7B3] focus:ring-[#00A7B3]"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-[#00A7B3]" />
                      <span className="font-semibold text-fresh-primary">Standard Delivery</span>
                    </div>
                    <p className="text-sm text-fresh-secondary">KSh 50 - 1-2 hours</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl hover:bg-background cursor-pointer">
                  <input
                    type="radio"
                    name="express_delivery"
                    value="express_delivery"
                    checked={deliveryOption === 'express_delivery'}
                    onChange={(e) => setDeliveryOption(e.target.value)}
                    className="text-[#00A7B3] focus:ring-[#00A7B3]"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-[#00A7B3]" />
                      <span className="font-semibold text-fresh-primary">Express Delivery</span>
                    </div>
                    <p className="text-sm text-fresh-secondary">KSh 150 - 30 minutes</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-card rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-fresh-primary mb-4">Order Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-fresh-secondary">Subtotal</span>
                  <span className="font-semibold text-fresh-primary">KSh {subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-fresh-secondary">Delivery Fee</span>
                  <span className="font-semibold text-fresh-primary">
                    {deliveryFee === 0 ? 'Free' : `KSh ${deliveryFee.toFixed(2)}`}
                  </span>
                </div>

                {promoDiscount > 0 && appliedPromo && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({appliedPromo.code})</span>
                    <span>-KSh {promoDiscount.toFixed(2)}</span>
                  </div>
                )}

                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-lg">
                    <span className="font-bold text-fresh-primary">Total</span>
                    <span className="font-bold text-fresh-primary">KSh {total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={proceedToCheckout}
                className="w-full bg-[#00A7B3] hover:bg-[#00A7B3]/90 text-white py-4 rounded-xl font-semibold text-lg transition-colors flex items-center justify-center gap-2 mt-6"
              >
                <CreditCard className="h-5 w-5" />
                Proceed to Checkout
              </button>

              <div className="flex items-center justify-center gap-2 mt-4 text-sm text-fresh-secondary">
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

