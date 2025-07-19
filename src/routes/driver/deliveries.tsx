import { useDeliveriesForDriver, useUpdateDeliveryStatus } from '@/hooks/useDeliveries';
import { loggedInUser } from '@/store/auth';
import { createFileRoute } from '@tanstack/react-router'
import { MapPin, Phone, Navigation } from 'lucide-react';
import { useState } from 'react';
import RouteMap from '@/components/RouteMap';
import type { Delivery } from '@/types/delivery';

export const Route = createFileRoute('/driver/deliveries')({
  component: RouteComponent,
});

function RouteComponent() {
  const user = loggedInUser();
  const { data: alldeliveries } = useDeliveriesForDriver(user?.user_id ? parseInt(user.user_id) : 0);

  const deliveries: Delivery[] | undefined = alldeliveries?.filter(
    (delivery: Delivery) => delivery.status === 'assigned' || delivery.status === 'picked_up' || delivery.status === 'in_transit'
  );  
  const updateDeliveryMutation = useUpdateDeliveryStatus();
  const [mapModalOpen, setMapModalOpen] = useState(false);
  const [modalCoords, setModalCoords] = useState<any[]>([]);

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">Driver Deliveries</h1>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">
          <div className="bg-white rounded-xl shadow-sm">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-semibold text-gray-800">Active Delivery</h2>
            </div>
            <div className="p-6 space-y-4">
              {(deliveries && deliveries.length > 0) ? (
                deliveries.map((delivery: any) => {
                  // Get user/customer info
                  const customer = delivery.user;
                  const customerProfile = customer?.profile;
                  const defaultAddress = customerProfile?.addresses?.find((addr: any) => addr.isDefault) || customerProfile?.addresses?.[0];
                  // Get order info
                  const order = delivery.order;
                  return (
                    <div key={delivery.delivery_id} className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-semibold text-gray-800">Order #{order?.order_number || delivery.order_id}</h3>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${delivery.status === 'picked_up' ? 'bg-[#005A61] text-white' :
                              delivery.status === 'ready_pickup' ? 'bg-[#516E89] text-white' :
                                delivery.status === 'assigned' ? 'bg-[#0074B7] text-white' :
                                  delivery.status === 'in_transit' ? 'bg-[#516E89] text-white' :
                                    delivery.status === 'delivered' ? 'bg-green-600 text-white' :
                                      'bg-gray-300 text-gray-800'
                              }`}>
                              {typeof delivery.status === 'string' ? delivery.status.replace('_', ' ').toUpperCase() : 'UNKNOWN'}
                            </span>
                          </div>
                          <p className="text-lg font-medium text-gray-900">{customerProfile?.first_name} {customerProfile?.last_name}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mt-2">
                            <div className="flex items-center space-x-1">
                              <MapPin size={16} />
                              <span>
                                {defaultAddress ? `${defaultAddress.area}, ${defaultAddress.town}, ${defaultAddress.county}, ${defaultAddress.country}` : delivery.delivery_address}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Phone size={16} />
                              <span>{customerProfile?.phone_number}</span>
                            </div>
                          </div>
                          <div className="mt-2 text-sm text-gray-700">
                            <div><span className="font-semibold">Order Total:</span> KSh {order?.total_amount}</div>
                            <div><span className="font-semibold">Delivery Fee:</span> KSh {delivery.delivery_fee}</div>
                            <div><span className="font-semibold">Delivery Method:</span> {order?.delivery_method?.replace('_', ' ')}</div>
                            <div><span className="font-semibold">Order Status:</span> {order?.status?.replace('_', ' ')}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">KSh {delivery.delivery_fee}</p>
                          <p className="text-sm text-gray-600">Est. {delivery.estimated_delivery_time ? new Date(delivery.estimated_delivery_time).toLocaleTimeString() : "-"}</p>
                          <p className="text-sm text-gray-600">{delivery.route_distance ? `${parseFloat(delivery.route_distance).toLocaleString()} m` : '-'}
                          </p>
                          <p className="text-sm text-gray-600">Duration: {delivery.route_duration ? `${Math.round(parseFloat(delivery.route_duration) / 60)} min` : '-'}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {delivery.status === 'assigned' && (
                          <button
                            className="flex-1 min-w-[120px] bg-[#516E89] text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
                            onClick={() => {
                              updateDeliveryMutation.mutate({
                                deliveryId: delivery.delivery_id,
                                status: 'in_transit',
                              });
                            }}
                          >
                            Pick Up Order
                          </button>
                        )}
                        {(delivery.status === 'picked_up' || delivery.status === 'in_transit') && (
                          <button
                            className="flex-1 min-w-[120px] bg-[#0074B7] text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
                            onClick={() => {
                              updateDeliveryMutation.mutate({
                                deliveryId: delivery.delivery_id,
                                status: 'delivered',
                              });
                            }}
                          >
                            Mark as Delivered
                          </button>
                        )}
                        <button
                          className="px-4 py-2 min-w-[48px] border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
                          onClick={() => {
                            let coords = [];
                            try {
                              coords = JSON.parse(delivery.route_coordinates);
                            } catch (e) {
                              try {
                                const geom = JSON.parse(delivery.route_geometry);
                                coords = geom.coordinates || [];
                              } catch { }
                            }
                            if (coords.length > 0) {
                              setModalCoords(coords);
                              setMapModalOpen(true);
                            } else {
                              alert('No route coordinates available');
                            }
                          }}
                        >
                          <Navigation size={16} />
                        </button>
                        <button className="px-4 py-2 min-w-[48px] border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center">
                          <Phone size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <p>No deliveries found.</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
      {/* Modal for map preview */}
      {mapModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full relative">
            <button
              className="absolute bg-accent-foreground p-2 rounded-full top-2 right-4 text-white hover:text-gray-700 "
              onClick={() => setMapModalOpen(false)}
            >
              X
            </button>
            <h2 className="text-lg font-semibold mb-4">Route Preview</h2>
            <div style={{ width: '100%', height: '400px', borderRadius: '8px', overflow: 'hidden' }}>
              <RouteMap coords={modalCoords} />
            </div>
            <p className="mt-2 text-sm text-gray-600">This is an interactive map preview. For full navigation, use the OpenRouteService app or website.</p>
          </div>
        </div>
      )}
    </div>
  );
}
