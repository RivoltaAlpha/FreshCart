import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, ArrowLeft, CreditCard, Truck, Shield, Tag, MapPin, Clock, Store, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { cartStore, cartActions } from '@/store/cart';
import { orderActions } from '@/store/order';
import { authStore } from '@/store/auth';
import { DeliveryMethod } from '@/types/types';
import { useCreateOrderMutation } from '@/hooks/useOrders';
import { getStoreHavingProduct } from '@/services/storeService';

export const Route = createFileRoute('/customer/cart')({
  component: RouteComponent,
})

interface StoreGroup {
  store_id: number;
  store_name: string;
  items: any[];
}

function RouteComponent() {
  const [cartItems, setCartItems] = useState(cartStore.state.items);
  const [storeGroups, setStoreGroups] = useState<StoreGroup[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);
  const [isMultiStore, setIsMultiStore] = useState(false);
  const [loadingStores, setLoadingStores] = useState(true);
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number; description: string } | null>(null);
  const [deliveryOption, setDeliveryOption] = useState('standard');
  const authUser = localStorage.getItem('auth');
  const user_id = JSON.parse(authUser || '{}')?.user?.user_id;
  const selectedStore = localStorage.getItem('selectedStore');
  const store_id = JSON.parse(selectedStore || '{}')?.store_id;
  const [loading, setLoading] = useState(false);

  const { mutate: createNewOrder } = useCreateOrderMutation();

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

  // Group items by store when cart items change
  useEffect(() => {
    if (cartItems.length > 0) {
      groupItemsByStore();
    } else {
      setStoreGroups([]);
      setIsMultiStore(false);
      setLoadingStores(false);
    }
  }, [cartItems]);

  const groupItemsByStore = async () => {
    setLoadingStores(true);
    try {
      const storeMap = new Map<number, { store_name: string; items: any[] }>();
      
      // Get store information for each item
      for (const item of cartItems) {
        try {
          const store = await getStoreHavingProduct(item.product.product_id);
          if (store) {
            if (!storeMap.has(store.store_id)) {
              storeMap.set(store.store_id, {
                store_name: store.name || `Store ${store.store_id}`,
                items: []
              });
            }
            storeMap.get(store.store_id)?.items.push(item);
          }
        } catch (error) {
          console.error(`Error getting store for product ${item.product.product_id}:`, error);
          // Create a fallback group for items without store info
          if (!storeMap.has(-1)) {
            storeMap.set(-1, {
              store_name: 'Unknown Store',
              items: []
            });
          }
          storeMap.get(-1)?.items.push(item);
        }
      }

      const groups: StoreGroup[] = Array.from(storeMap.entries()).map(([store_id, data]) => ({
        store_id,
        store_name: data.store_name,
        items: data.items
      }));

      setStoreGroups(groups);
      
      if (groups.length > 1) {
        setIsMultiStore(true);
        // Auto-select the store with the most items or the current selected store
        const currentStoreGroup = groups.find(g => g.store_id === store_id);
        if (currentStoreGroup) {
          setSelectedStoreId(store_id);
          toast.info(`Items from ${groups.length} different stores found. Selected your current store: ${currentStoreGroup.store_name}`);
        } else {
          const largestGroup = groups.reduce((prev, current) => 
            prev.items.length > current.items.length ? prev : current
          );
          setSelectedStoreId(largestGroup.store_id);
          toast.info(`Items from ${groups.length} different stores found. Auto-selected store with most items: ${largestGroup.store_name}`);
        }
      } else if (groups.length === 1) {
        setIsMultiStore(false);
        setSelectedStoreId(groups[0].store_id);
      }
    } catch (error) {
      console.error('Error grouping items by store:', error);
      toast.error('Error organizing cart items by store');
    } finally {
      setLoadingStores(false);
    }
  };

  // Get current items to display (either all items if single store, or selected store items if multi-store)
  const getCurrentItems = () => {
    if (!isMultiStore) {
      return cartItems;
    }
    
    if (selectedStoreId === null) {
      return [];
    }
    
    const selectedGroup = storeGroups.find(group => group.store_id === selectedStoreId);
    return selectedGroup ? selectedGroup.items : [];
  };

  const currentItems = getCurrentItems();

  // Calculate totals based on current items
  const subtotal = currentItems.reduce((sum, item) =>
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
    toast.info('Promo code removed');
  };

  const handleStoreSelection = (storeId: number) => {
    setSelectedStoreId(storeId);
    const selectedGroup = storeGroups.find(group => group.store_id === storeId);
    if (selectedGroup) {
      toast.success(`Selected ${selectedGroup.store_name} with ${selectedGroup.items.length} items`);
      // Reset promo code when switching stores
      setAppliedPromo(null);
    }
  };

  const navigate = useNavigate();

  const proceedToCheckout = async () => {
    if (currentItems.length === 0) {
      toast.error('Please select a store and ensure it has items before proceeding to checkout.');
      return;
    }

    // Validate user data
    if (!user_id) {
      toast.error('User authentication required. Please log in again.');
      return;
    }

    if (selectedStoreId === null) {
      toast.error('Please select a store to proceed with checkout.');
      return;
    }

    try {
      const orderData = {
        user_id: Number(user_id),
        store_id: Number(selectedStoreId),
        delivery_method: deliveryOption as DeliveryMethod,
        delivery_address: "Default Address",
        estimated_delivery_time: deliveryOption === 'express_delivery' ? 30 : deliveryOption === 'standard_delivery' ? 120 : 15,
        items: currentItems.map(item => ({
          product_id: item.product.product_id,
          quantity: item.quantity
        }))
      };

      // Prepare order details for local store
      const orderDetails = {
        user_id: user_id,
        store_id: selectedStoreId,
        customer_email: authStore.state.user.email,
        items: currentItems,
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
      setLoading(true);
      
      createNewOrder(orderData, {
        onSuccess: (createdOrder) => {
          console.log('Order created:', createdOrder);

          if (createdOrder?.order_id) {
            orderActions.updateOrderDetails({
              order_id: createdOrder.order_id,
              order_number: createdOrder.order_number
            });
          }

          // If multi-store, remove only the items from the selected store from cart
          if (isMultiStore) {
            currentItems.forEach(item => {
              cartActions.removeFromCart(item.product.product_id);
            });
            const selectedGroup = storeGroups.find(group => group.store_id === selectedStoreId);
            toast.success(`Order created for ${selectedGroup?.store_name}! Remaining items from other stores are still in your cart.`);
          } else {
            // Single store - clear entire cart
            cartActions.clearCart();
            toast.success('Order created successfully!');
          }

          navigate({ to: '/customer/checkout-order' });
          setLoading(false);
        },
        onError: (error) => {
          console.error('Error creating order:', error);
          toast.error('Failed to create order. Please try again.');
          setLoading(false);
        }
      });
    } catch (error) {
      console.error('Error in checkout process:', error);
      toast.error('Failed to proceed to checkout. Please try again.');
      setLoading(false);
    }
  };

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
              to="/stores"
              className="bg-[#00A7B3] hover:bg-[#00A7B3]/90 text-white px-8 py-4 rounded-full text-lg font-semibold transition-colors inline-block"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center flex flex-col items-center">
          <h1 className="text-2xl font-bold text-fresh-primary mb-4">Processing your order...</h1>
          <ShoppingCart className="h-24 w-24 text-fresh-secondary animate-spin mb-6" />
          <p className="text-fresh-secondary">Please wait while we prepare your order.</p>
        </div>
      </div>
    );
  }

  if (loadingStores) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center flex flex-col items-center">
          <h1 className="text-2xl font-bold text-fresh-primary mb-4">Organizing your cart...</h1>
          <Store className="h-24 w-24 text-fresh-secondary animate-pulse mb-6" />
          <p className="text-fresh-secondary">Grouping items by store for better checkout experience.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Banner */}
      <div className="h-72 w-full relative overflow-hidden">
        <img
          src="../delivery.png"
          alt="Banner"
          className="w-full h-full object-cover"
        />
        <div className="flex-col absolute inset-0 bg-black/50 w-full h-full object-cover">
          <div className="flex items-center justify-center mb-8 my-20">
            <div className="flex items-center gap-4">
              <Link to="/products" className="flex items-center p-2 hover:bg-gray-200 rounded-full transition-colors">
                <ArrowLeft className="h-6 w-6 text-fresh-secondary" />
              </Link>
              <div>
                <h1 className="text-4xl font-bold text-white">Shopping Cart</h1>
                <p className="text-white">
                  {isMultiStore 
                    ? `${cartItems.length} items from ${storeGroups.length} stores` 
                    : `${cartItems.length} item${cartItems.length !== 1 ? "s" : ""} in your cart`
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Store Selection - Only show if multi-store */}
        {isMultiStore && (
          <div className="mt-10 mb-8">
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Store className="h-6 w-6 text-[#00A7B3]" />
                <h2 className="text-xl font-bold text-fresh-primary">Multiple Stores Detected</h2>
              </div>
              <p className="text-fresh-secondary mb-6">
                Your cart contains items from multiple stores. Please select which store you'd like to checkout with:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {storeGroups.map((group) => (
                  <div
                    key={group.store_id}
                    className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                      selectedStoreId === group.store_id
                        ? 'border-[#00A7B3] bg-[#00A7B3]/5 shadow-lg'
                        : 'border-gray-200 hover:border-[#00A7B3]/50 hover:shadow-md'
                    }`}
                    onClick={() => handleStoreSelection(group.store_id)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Store className="h-5 w-5 text-[#00A7B3]" />
                        <h3 className="font-bold text-fresh-primary">{group.store_name}</h3>
                      </div>
                      {selectedStoreId === group.store_id && (
                        <CheckCircle2 className="h-5 w-5 text-[#00A7B3]" />
                      )}
                    </div>
                    <p className="text-sm text-fresh-secondary mb-2">
                      {group.items.length} item{group.items.length !== 1 ? 's' : ''}
                    </p>
                    <p className="text-lg font-bold text-fresh-primary">
                      KSh {group.items.reduce((sum, item) => 
                        sum + (Number(item.product.price) * item.quantity), 0
                      ).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10">
          <div className="lg:col-span-2 space-y-4">
            {/* Show selected store name if multi-store */}
            {isMultiStore && selectedStoreId && (
              <div className="bg-[#00A7B3]/10 border border-[#00A7B3]/20 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-2">
                  <Store className="h-5 w-5 text-[#00A7B3]" />
                  <span className="font-semibold text-fresh-primary">
                    Checkout items from: {storeGroups.find(g => g.store_id === selectedStoreId)?.store_name}
                  </span>
                </div>
              </div>
            )}

            {currentItems.length === 0 && selectedStoreId === null ? (
              <div className="text-center py-12">
                <Store className="h-16 w-16 text-fresh-secondary mx-auto mb-4" />
                <p className="text-fresh-secondary text-lg">Please select a store to view items</p>
              </div>
            ) : (
              currentItems.map((item) => (
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
              ))
            )}
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
                    name="delivery"
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
                    name="delivery"
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
                disabled={currentItems.length === 0 || selectedStoreId === null}
                className={`w-full py-4 rounded-xl font-semibold text-lg transition-colors flex items-center justify-center gap-2 mt-6 ${
                  currentItems.length === 0 || selectedStoreId === null
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-[#00A7B3] hover:bg-[#00A7B3]/90 text-white'
                }`}
              >
                <CreditCard className="h-5 w-5" />
                {isMultiStore && selectedStoreId 
                  ? `Checkout ${storeGroups.find(g => g.store_id === selectedStoreId)?.store_name}`
                  : 'Proceed to Checkout'
                }
              </button>

              {/* Multi-store info */}
              {isMultiStore && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                  <p className="text-sm text-blue-700 text-center">
                    <span className="font-semibold">Note:</span> You have items from {storeGroups.length} stores. 
                    After this checkout, items from other stores will remain in your cart.
                  </p>
                </div>
              )}

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