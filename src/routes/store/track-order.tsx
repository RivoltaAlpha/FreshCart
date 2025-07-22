import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Phone, Package, User, Route as RouteIcon, ArrowLeft } from 'lucide-react';
import type { DeliveryStatus } from '@/types/delivery';

export const Route = createFileRoute('/store/track-order')({
  component: RouteComponent,
});

function RouteComponent() {
  const delivery = JSON.parse(localStorage.getItem('selectedDelivery') || 'null');
  const navigate = useNavigate();

  if (!delivery) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="flex flex-col h-screen">
          <main className="flex-1 p-6">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100">
              <div className="p-12 text-center">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Package className="w-12 h-12 text-gray-400" />
                </div>
                <p className="text-xl text-gray-500 mb-2">No delivery details found</p>
                <p className="text-gray-400">Please check back later for delivery updates</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: DeliveryStatus) => {
    switch (status) {
      case 'picked_up':
        return 'bg-[#2E8BC0] text-white';
      case 'assigned':
        return 'bg-[#0C2D48] text-white';
      case 'in_transit':
        return 'bg-gradient-to-r from-[#145DA0] to-[#2E8BC0] text-white';
      case 'delivered':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-300 text-gray-800';
    }
  };

  const handleBack = () => {
    localStorage.removeItem('selectedDelivery');
    navigate({ to: '/store/manage-orders' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-4 border-[#145DA0]">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={() => handleBack()}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[#145DA0] rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-[#0C2D48]">Current Delivery</h1>
            </div>
          </div>
        </div>
      </header>
      <div className="flex flex-col h-screen">
        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="relative">
              <div className="px-8 py-6 bg-gradient-to-r from-[#145DA0] to-[#2E8BC0] text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                      <Package className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">Order #{delivery.order_id}</h3>
                      <p className="text-blue-100">Delivery in progress</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold">KSh {delivery.delivery_fee}</p>
                    <p className="text-blue-100">Delivery Fee</p>
                  </div>
                </div>
              </div>

              {/* Driver Information */}
              <div className="px-8 py-6 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex items-center justify-center space-x-4 mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-[#145DA0] rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold text-[#0C2D48]">{delivery.driver?.name}</h4>
                      <div className="flex items-center space-x-1 text-gray-600 mt-1">
                        <Phone size={16} />
                        <span>{delivery.driver?.phone}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery Details */}
              <div className="px-8 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* user info */}
                  <div className="px-8 py-6 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-[#145DA0] rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-xl font-semibold text-[#0C2D48]">{delivery.customer?.name}</h4>
                        <div className="flex items-center space-x-1 text-gray-600 mt-1">
                          <Phone size={16} />
                          <span>{delivery.customer?.phone}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Driver & Route Info */}
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-8 h-8 bg-[#2E8BC0] rounded-full flex items-center justify-center">
                          <RouteIcon className="w-4 h-4 text-white" />
                        </div>
                        <p className="font-medium text-[#0C2D48]">Route Details</p>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Distance:</span>
                          <span className="font-medium text-gray-900">{delivery.route?.distance || "Calculating..."}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Duration:</span>
                          <span className="font-medium text-gray-900">{delivery.route?.duration || "Calculating..."}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Information */}
              <div className="px-8 py-6 bg-gray-50 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-[#145DA0] rounded-full animate-pulse"></div>
                    <span className="text-gray-600">Order Status:</span>
                  </div>
                  <div className={`px-4 py-2 font-semibold text-sm ${getStatusColor(delivery.status as DeliveryStatus)}`}>
                    {typeof delivery.status === 'string' ? delivery.status.replace('_', ' ').toUpperCase() : 'UNKNOWN'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}