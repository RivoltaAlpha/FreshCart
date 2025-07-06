import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react';
import { useCreateProduct } from '@/hooks/useProducts';

export const Route = createFileRoute('/store/create-product')({
  component: RouteComponent,
})

function RouteComponent() {
  const [form, setForm] = useState({
  name: '',
  store_id: 0,
  description: '',
  price: 0,
  stock_quantity: 0,
  category_id: 0,
  image_url: '',
  weight: 0,
  unit: '',
  rating: 0,
  review_count: 0,
  discount: 0,
  initial_quantity: 0,
  reorder_level: 0,
  });

  const createProductMutation = useCreateProduct();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createProductMutation.mutate({
        name: form.name,
        store_id: form.store_id,
        price: form.price,
        description: form.description,
        stock_quantity: form.stock_quantity,
        category_id: form.category_id,
        image_url: form.image_url,
        weight: form.weight,
        unit: form.unit,
        rating: form.rating,
        review_count: form.review_count,
        discount: form.discount,
        initial_quantity: form.initial_quantity,
        reorder_level: form.reorder_level,
    });
  };

  useEffect(() => {
    if (createProductMutation.isSuccess) {
      const timeout = setTimeout(() => {
        navigate({ to: '/store/success' });
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [createProductMutation.isSuccess, navigate]);

  return (
    <div className="max-w-xl mx-auto mt-16 bg-white p-8 rounded-lg shadow border border-[#005A61]/20">
      <h2 className="text-2xl font-bold text-[#005A61] mb-6">Create Product</h2>
      <form onSubmit={handleSubmit} className="space-y-5 text-sm text-[#516E89]">
        <div>
          <label className="block mb-1 font-medium text-[#005A61]">Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full border border-[#6A89A7] rounded px-4 py-2"
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-medium text-[#005A61]">Description</label>
          <input
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full border border-[#6A89A7] rounded px-4 py-2"
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-medium text-[#005A61]">SKU</label>
          <input
            name="sku"
            value={form.stock_quantity}
            onChange={handleChange}
            className="w-full border border-[#6A89A7] rounded px-4 py-2"
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-medium text-[#005A61]">Price</label>
          <input
            type="number"
            name="price"
            value={form.price}
            onChange={handleChange}
            className="w-full border border-[#6A89A7] rounded px-4 py-2"
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-medium text-[#005A61]">Category ID</label>
          <input
            type="number"
            name="category_id"
            value={form.category_id}
            onChange={handleChange}
            className="w-full border border-[#6A89A7] rounded px-4 py-2"
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-medium text-[#005A61]">Store ID</label>
          <input
            type="number"
            name="store_id"
            value={form.store_id}
            onChange={handleChange}
            className="w-full border border-[#6A89A7] rounded px-4 py-2"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-[#00A7B3] text-white px-6 py-2 rounded hover:bg-[#0097a2] transition"
          disabled={createProductMutation.isPending}
        >
          {createProductMutation.isPending ? 'Creating...' : 'Create Product'}
        </button>
        {createProductMutation.isSuccess && (
          <div className="text-green-600 font-medium">✅ Product created successfully!</div>
        )}
        {createProductMutation.isError && (
          <div className="text-red-600 font-medium">
            ❌ {(createProductMutation.error as Error).message}
          </div>
        )}
      </form>
    </div>
  );
}