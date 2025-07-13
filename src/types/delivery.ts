export interface Delivery {
  delivery_id: number;
  order_id: number;
  delivery_status: DeliveryStatus | string;
  driver: {
    id: number;
    name: string;
    phone: string;
  };
  customer: {
    id: number;
    name: string;
    phone: string;
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
}

export enum DeliveryStatus {
  PENDING = 'pending',
  ASSIGNED = 'assigned',
  PICKED_UP = 'picked_up',
  IN_TRANSIT = 'in_transit',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}