import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react';
import { ArrowLeft, CreditCard, MapPin, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import { orderActions, type OrderDetails } from '@/store/order';
import { useInitializePayment } from '@/hooks/usePayments';

export const Route = createFileRoute('/customer/checkout-order')({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate();
  const [currentOrder, setCurrentOrder] = useState<OrderDetails | null>(null);
  const { mutate: initializePayment } = useInitializePayment();
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [deliveryPhone, setDeliveryPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const authUser = localStorage.getItem('auth');
  const customer_email = JSON.parse(authUser || '{}')?.user?.email;

  useEffect(() => {
    orderActions.loadFromStorage();
    const order = orderActions.getCurrentOrder();

    if (!order) {
      toast.error('No order found. Please start from the cart.');
      navigate({ to: '/customer/cart' });
      return;
    }
    setCurrentOrder(order);
  }, [navigate]);

  const updateOrderWithDeliveryInfo = () => {
    if (!currentOrder) return;

    orderActions.updateOrderDetails({
      delivery_address: deliveryAddress,
      delivery_instructions: deliveryInstructions,
      delivery_phone: deliveryPhone,
    });

    setCurrentOrder(orderActions.getCurrentOrder());
  };

  const processPayment = async () => {
    if (!currentOrder) {
      toast.error('No order found');
      return;
    }

    if (currentOrder.delivery_method !== 'pickup' && !deliveryAddress.trim()) {
      toast.error('Please enter a delivery address');
      return;
    }

    if (!deliveryPhone.trim()) {
      toast.error('Please enter a phone number');
      return;
    }

    // Validate required fields for payment
    if (!currentOrder.order_id) {
      toast.error('Order ID is missing. Please try again.');
      return;
    }

    setIsLoading(true);

    try {
      // Update order with delivery info
      updateOrderWithDeliveryInfo();
      const paymentData = {
        user_id: Number(currentOrder.user_id),
        order_id: currentOrder.order_id,
        email: customer_email,
        amount: currentOrder.total_amount,
        callback_url: 'http://localhost:5173/customer/payment-verify'
      };

      initializePayment(paymentData, {
        onSuccess: (paymentResponse) => {
          console.log('Payment initialized:', paymentResponse);

          // Store payment reference for verification
          localStorage.setItem('payment_reference', paymentResponse.payment_reference);
          localStorage.setItem('payment_order_id', currentOrder.order_id!.toString());

          // Redirect to payment gateway
          if (paymentResponse.authorization_url) {
            window.location.href = paymentResponse.authorization_url;
          } else {
            // If no authorization URL, redirect to verification page with reference
            navigate({
              to: '/customer/payment-verify'
            });
          }
        },
        onError: (error) => {
          console.error('Payment initialization failed:', error);
          toast.error('Failed to initialize payment. Please try again.');
          setIsLoading(false);
        }
      });

    } catch (error) {
      toast.error('Payment initialization failed. Please try again.');
      console.error('Payment error:', error);
      setIsLoading(false);
    }
  };

  if (!currentOrder) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00A7B3] mx-auto mb-4"></div>
          <p className="text-fresh-secondary">Loading order details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate({ to: '/customer/cart' })}
            className="flex items-center p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <ArrowLeft className="h-6 w-6 text-fresh-secondary" />
          </button>
          <div>
            <h1 className="text-4xl font-bold text-fresh-primary">Checkout</h1>
            <p className="text-fresh-secondary">Complete your order</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Delivery Information */}
          <div className="bg-card rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-fresh-primary mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Delivery Information
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-fresh-secondary mb-2">
                  Delivery Method
                </label>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <span className="font-semibold text-fresh-primary">
                    {currentOrder.delivery_method === 'pickup' ? 'Store Pickup' :
                      currentOrder.delivery_method === 'standard' ? 'Standard Delivery' :
                        'Express Delivery'}
                  </span>
                  <p className="text-sm text-fresh-secondary">
                    {currentOrder.delivery_method === 'pickup' ? 'Ready in 15 minutes' :
                      currentOrder.delivery_method === 'standard' ? '1-2 hours' :
                        '30 minutes'}
                  </p>
                </div>
              </div>

              {currentOrder.delivery_method !== 'pickup' && (
                <div>
                  <label className="block text-sm font-medium text-fresh-secondary mb-2">
                    Delivery Address *
                  </label>
                  <textarea
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Enter your full delivery address..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00A7B3] focus:border-transparent resize-none"
                    rows={3}
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-fresh-secondary mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={deliveryPhone}
                  onChange={(e) => setDeliveryPhone(e.target.value)}
                  placeholder="Enter your phone number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00A7B3] focus:border-transparent"
                  required
                />
              </div>

              {currentOrder.delivery_method !== 'pickup' && (
                <div>
                  <label className="block text-sm font-medium text-fresh-secondary mb-2">
                    Delivery Instructions (Optional)
                  </label>
                  <textarea
                    value={deliveryInstructions}
                    onChange={(e) => setDeliveryInstructions(e.target.value)}
                    placeholder="Any special instructions for delivery..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00A7B3] focus:border-transparent resize-none"
                    rows={2}
                  />
                </div>
              )}
            </div>
          </div>


          <div className='space-y-6'>
            {/* Order Items */}
            <div className="bg-card rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-fresh-primary mb-4 flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                Order Items ({currentOrder.items.length})
              </h3>

              <div className="space-y-3 max-h-64 overflow-y-auto">
                {currentOrder.items.map((item) => (
                  <div key={item.product.product_id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <img
                      src={item.product.image_url}
                      alt={item.product.name}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-fresh-primary">{item.product.name}</h4>
                      <p className="text-sm text-fresh-secondary">
                        {item.quantity} × KSh {Number(item.product.price).toFixed(2)}
                      </p>
                    </div>
                    <span className="font-bold text-fresh-primary">
                      KSh {(Number(item.product.price) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              <div className="bg-card rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-fresh-primary mb-6">Order Summary</h3>

                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-fresh-secondary">Subtotal</span>
                    <span className="font-semibold">KSh {currentOrder.subtotal.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-fresh-secondary">Delivery Fee</span>
                    <span className="font-semibold">
                      {currentOrder.delivery_fee === 0 ? 'Free' : `KSh ${currentOrder.delivery_fee.toFixed(2)}`}
                    </span>
                  </div>

                  {currentOrder.promo_discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount ({currentOrder.promo_code})</span>
                      <span>-KSh {currentOrder.promo_discount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between text-xl font-bold">
                      <span>Total</span>
                      <span className="text-[#00A7B3]">KSh {currentOrder.total_amount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={processPayment}
                  disabled={isLoading}
                  className="w-full bg-[#00A7B3] hover:bg-[#00A7B3]/90 text-white py-4 rounded-xl font-semibold text-lg transition-colors flex items-center justify-center gap-2 mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-5 w-5" />
                      Complete Order
                    </>
                  )}
                </button>

                <p className="text-xs text-fresh-secondary text-center mt-4">
                  By placing this order, you agree to our terms and conditions
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
