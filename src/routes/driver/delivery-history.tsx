import { useDeliveriesForDriver } from '@/hooks/useDeliveries';
import { loggedInUser } from '@/store/auth';
import { createFileRoute } from '@tanstack/react-router'
import { MapPin, Phone } from 'lucide-react';

export const Route = createFileRoute('/driver/delivery-history')({
  component: RouteComponent,
});

function RouteComponent() {
  const user = loggedInUser();
  const { data: alldeliveries } = useDeliveriesForDriver(user?.user_id ? parseInt(user.user_id) : 0);
  interface Address {
    area: string;
    town: string;
    county: string;
    country: string;
    isDefault?: boolean;
  }

  interface Profile {
    first_name: string;
    last_name: string;
    phone_number: string;
    addresses?: Address[];
  }

  interface User {
    profile?: Profile;
  }

  interface Order {
    order_number?: string;
    total_amount?: number;
    delivery_method?: string;
    status?: string;
  }

  interface Delivery {
    delivery_id: number;
    delivery_status: string;
    order_id?: number;
    delivery_fee?: number;
    estimated_delivery_time?: string;
    route_distance?: string;
    route_duration?: string;
    delivery_address?: string;
    user?: User;
    order?: Order;
  }

  const deliveries: Delivery[] | undefined = alldeliveries?.filter(
    (delivery: Delivery) => delivery.delivery_status === 'delivered'
  );

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">Delivery History</h1>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">
          <div className="bg-white rounded-xl shadow-sm">
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
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${delivery.delivery_status === 'picked_up' ? 'bg-[#005A61] text-white' :
                              delivery.delivery_status === 'ready_pickup' ? 'bg-[#516E89] text-white' :
                                delivery.delivery_status === 'assigned' ? 'bg-[#0074B7] text-white' :
                                  delivery.delivery_status === 'in_transit' ? 'bg-[#516E89] text-white' :
                                    delivery.delivery_status === 'delivered' ? 'bg-green-600 text-white' :
                                      'bg-gray-300 text-gray-800'
                              }`}>
                              {typeof delivery.delivery_status === 'string' ? delivery.delivery_status.replace('_', ' ').toUpperCase() : 'UNKNOWN'}
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
                          <div className="mt-2 text-sm space-y-4 text-gray-700">
                            <div><span className="font-semibold">Order Total:</span> KSh {order?.total_amount}</div>
                            <div><span className="font-semibold">Delivery Fee:</span> KSh {delivery.delivery_fee}</div>
                            <div><span className="font-semibold">Delivery Method:</span> {order?.delivery_method?.replace("_", " ")}</div>
                            <div><span className="font-semibold">Order Status:</span> {order?.status?.replace("_", " ")}</div>
                          </div>
                        </div>
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
    </div>
  );
}
