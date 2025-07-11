import type { Product } from "@/types/types";

export const sampleProducts: Product[] = [
  {
    product_id: 1,
    category_id: 1,
    name: 'Fresh Tomatoes',
    description: 'Locally grown, juicy and ripe tomatoes picked this morning.',
    price: '200.50',
    unit: '/kg',
    image_url: 'https://img.freepik.com/premium-photo/tomato-vegetables-isolated-white-fresh-tomato-fruit-clipping-path-tomato-macro-photo_299651-600.jpg?uid=R154664640&semt=ais_hybrid&w=740',
    stock_quantity: '120',
    weight: '1.0',
    discount: 0,
    rating: '4.8',
    review_count: 45,
    expiry_date: null,
    created_at: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    category: { category_id: 1, name: 'Vegetables', description: 'Fresh vegetables', image_url: '', created_at: new Date().toISOString() },
  },
  {
    product_id: 2,
    category_id: 1,
    name: 'Sweet Carrots',
    description: 'Sweet, crunchy carrots grown without pesticides.',
    price: '100.80',
    unit: '/kg',
    image_url: 'https://img.freepik.com/premium-photo/fresh-carrots-vegatables-isolated-white_80510-413.jpg?uid=R154664640&semt=ais_hybrid&w=740',
    stock_quantity: '80',
    weight: '1.0',
    discount: 5,
    rating: '4.6',
    review_count: 32,
    expiry_date: null,
    created_at: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    category: { category_id: 1, name: 'Vegetables', description: 'Fresh vegetables', image_url: '', created_at: new Date().toISOString() },
  },
  {
    product_id: 3,
    category_id: 2,
    name: 'Fresh Strawberries',
    description: 'Juicy, sweet strawberries picked at peak ripeness.',
    price: '400.00',
    unit: '/kg',
    image_url: 'https://img.freepik.com/free-photo/top-view-delicious-strawberries-arrangement_23-2149433482.jpg?uid=R154664640&semt=ais_hybrid&w=740',
    stock_quantity: '100',
    weight: '1.0',
    discount: 10,
    rating: '4.8',
    review_count: 67,
    expiry_date: null,
    created_at: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    category: { category_id: 2, name: 'Fruits', description: 'Fresh fruits', image_url: '', created_at: new Date().toISOString() },
  },
];