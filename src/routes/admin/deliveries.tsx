import { createFileRoute } from '@tanstack/react-router'
import { useDeliveries } from '@/hooks/useDeliveries'; 

const getStatusColor = (status: string) => {
  const statusColors = {
    'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'assigned': 'bg-blue-100 text-blue-800 border-blue-200',
    'picked_up': 'bg-indigo-100 text-indigo-800 border-indigo-200',
    'in_transit': 'bg-purple-100 text-purple-800 border-purple-200',
    'delivered': 'bg-green-100 text-green-800 border-green-200',
    'cancelled': 'bg-red-100 text-red-800 border-red-200',
    'failed': 'bg-red-100 text-red-800 border-red-200',
  };
  return statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800 border-gray-200';
};

// Format currency
const formatCurrency = (amount: string | number) => {
  return `KSh ${parseFloat(amount.toString()).toLocaleString('en-KE', { minimumFractionDigits: 2 })}`;
};

// Format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Format distance
const formatDistance = (distance: string | number) => {
  const distanceInKm = parseFloat(distance.toString()) / 1000;
  return `${distanceInKm.toFixed(1)} km`;
};

// Format duration
const formatDuration = (duration: string | number) => {
  const durationInMinutes = Math.round(parseFloat(duration.toString()) / 60);
  const hours = Math.floor(durationInMinutes / 60);
  const minutes = durationInMinutes % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

export const Route = createFileRoute('/admin/deliveries')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data: deliveries } = useDeliveries(); // Replace with your actual hook

  return (
    <div className="min-h-screen px-2 sm:px-4 lg:px-6 bg-gray-50">
      <div className="max-w-7xl mx-auto py-4 sm:py-8 lg:py-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#145DA0] mb-4 sm:mb-0">
            Deliveries
          </h1>
          <div className="flex items-center gap-4">
            <div className="text-sm text-[#516E89]">
              Total: {deliveries?.length || 0} deliveries
            </div>
          </div>
        </div>

        {/* Delivery Cards Grid */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1">
          {deliveries?.map((delivery: any) => (
            <div
              key={delivery.delivery_id}
              className="bg-white rounded-xl shadow-lg border border-[#145DA0]/10 overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              {/* Card Header */}
              <div className="bg-gradient-to-r from-[#145DA0] to-[#00A7B3] p-4 text-white">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-lg">
                      Order #{delivery.order?.order_number}
                    </h3>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(delivery.delivery_status)} bg-white`}>
                    {delivery.delivery_status.replace('_', ' ').toUpperCase()}
                  </div>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-4">
                {/* Main Info Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                  {/* Customer & Driver */}
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Customer</p>
                      <p className="font-medium text-sm">
                        {delivery.user?.profile?.first_name} {delivery.user?.profile?.last_name}
                      </p>
                      <p className="text-xs text-gray-400">{delivery.user?.profile?.phone_number}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Driver</p>
                      <p className="font-medium text-sm">
                        {delivery.driver?.profile?.first_name} {delivery.driver?.profile?.last_name}
                      </p>
                    </div>
                  </div>

                  {/* Delivery Details */}
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-500">Total Amount</p>
                      <p className="font-semibold text-[#145DA0]">
                        {formatCurrency(delivery.order?.total_amount || 0)}
                      </p>
                    </div>
                    <div className="flex gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Distance</p>
                        <p className="text-sm font-medium">{formatDistance(delivery.route_distance)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Duration</p>
                        <p className="text-sm font-medium">{formatDuration(delivery.route_duration)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Address & Times */}
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Address</p>
                      <p className="text-sm">{delivery.delivery_address}</p>
                    </div>
                    {delivery.delivered_at && (
                      <div>
                        <p className="text-xs text-gray-500">Delivered</p>
                        <p className="text-xs text-green-600 font-medium">
                          {formatDate(delivery.delivered_at)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {!deliveries || deliveries.length === 0 && (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
              <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1V8a1 1 0 00-1-1h-3z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-700 mb-2">No deliveries found</h3>
            <p className="text-gray-500">Deliveries will appear here when they are created.</p>
          </div>
        )}
      </div>
    </div>
  );
}