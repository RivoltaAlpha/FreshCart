// Enums from backend
export enum PaymentMethod {
  CARD = 'CARD',
  MPESA = 'MPESA',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CASH = 'CASH'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED'
}

export enum PaymentGateway {
  PAYSTACK = 'PAYSTACK',
  MPESA = 'MPESA',
  STRIPE = 'STRIPE'
}

// Payment Entity Type
export interface Payment {
  payment_id: number;
  user_id: number;
  order_id: number;
  email: string;
  amount: number;
  currency: string;
  payment_method: PaymentMethod;
  gateway: PaymentGateway;
  status: PaymentStatus;
  transaction_id?: string;
  payment_reference?: string;
  authorization_url?: string;
  gateway_response?: any;
  failed_at?: Date;
  failure_reason?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreatePayment {
  user_id: number;
  order_id: number;
  email: string;
  amount: number;
  callback_url?: string;
}

export interface UpdatePayment {
  amount?: number;
  status?: PaymentStatus;
  gateway_response?: any;
  failed_at?: Date;
  failure_reason?: string;
}

// API Response Types
export interface PaymentInitializeResponse {
  authorization_url: string;
  payment_reference: string;
  payment_id: number;
  access_code: string;
  amount: number;
  currency: string;
}

export interface PaymentVerifyResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    domain: string;
    status: string;
    reference: string;
    amount: number;
    gateway_response: string;
    created_at: string;
    channel: string;
    currency: string;
    fees: number;
    customer: {
      id: number;
      first_name: string | null;
      last_name: string | null;
      email: string;
      customer_code: string;
    };
    order_id: number | null;
    paidAt: string;
    createdAt: string;
    requested_amount: number;
    transaction_date: string;
  };
}

export interface FetchTransactionResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    status: string;
    reference: string;
    receipt_number: string | null;
    amount: number;
    gateway_response: string;
    created_at: string;
    channel: string;
    currency: string;
    fees_split: any | null;
    authorization: {
      channel: string;
      card_type: string;
    };
    order_id: number | null;
    paidAt: string;
    createdAt: string;
    requested_amount: number;
  };
}