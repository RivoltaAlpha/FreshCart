export interface Delivery {
  delivery_id: number;
  order_id: number;
  delivery_status: DeliveryStatus | string;
  driver: {
    id: number;
    name: string;
    phone: string;
  };
  user: {
    user_id: number;
    name: string;
    phone: string;
    profile: {
      first_name: string;
      last_name: string;
      email: string;
      address: string;
    };
  };
  route: {
    distance: string;
    duration: string;
    coordinates: [number, number][];
  };
  delivery_address: string;
  estimated_delivery_time: string;
  delivery_fee: string;
  created_at: string;
  updated_at: string;
  order: {
  order_id: number;
  order_number: string;
  user_id: number;
  store_id: number;
  delivery_fee: string;
  discount_amount: string;
  status: string;
  delivery_method: string;
  total_amount: string;
  estimated_delivery_time: number;
  created_at: string;
  delivery_address: string;
  tax_amount: string;
  driver_id: number;
  confirmed_at: string;
  prepared_at: string;
  finished_at: string;
  picked_up_at: string | null;
  delivered_at: string | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  review: string | null;
  rating: string | null;
}
}

export enum DeliveryStatus {
  PENDING = 'pending',
  ASSIGNED = 'assigned',
  PICKED_UP = 'picked_up',
  IN_TRANSIT = 'in_transit',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}