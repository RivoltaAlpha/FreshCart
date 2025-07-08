import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react';
import { useCreateUser } from '@/hooks/useUser';
import type { UserRole } from '@/types/types';

export const Route = createFileRoute('/admin/create-user')({
  component: RouteComponent,
})

function RouteComponent() {
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    role: "Store" as UserRole,
  });
  const navigate = useNavigate();

  const createUserMutation = useCreateUser();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createUserMutation.mutate(form);
  };

  useEffect(() => {
    if (createUserMutation.isSuccess) {
      const timeout = setTimeout(() => {
        navigate({ to: '/admin/success' });
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [createUserMutation.isSuccess, navigate]);

  return (
    <div className="max-w-xl mx-auto mt-16 bg-white p-8 rounded-lg shadow border border-[#005A61]/20">
      <h2 className="text-2xl font-bold text-[#005A61] mb-6">Create New User</h2>

      <form onSubmit={handleSubmit} className="space-y-5 text-sm text-[#516E89]">
        <div>
          <label className="block mb-1 font-medium text-[#005A61]">First Name</label>
          <input
            name="first_name"
            value={form.first_name}
            onChange={handleChange}
            className="w-full border border-[#6A89A7] rounded px-4 py-2 focus:ring-2 focus:ring-[#00A7B3]"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium text-[#005A61]">Last Name</label>
          <input
            name="last_name"
            value={form.last_name}
            onChange={handleChange}
            className="w-full border border-[#6A89A7] rounded px-4 py-2 focus:ring-2 focus:ring-[#00A7B3]"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium text-[#005A61]">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full border border-[#6A89A7] rounded px-4 py-2 focus:ring-2 focus:ring-[#00A7B3]"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium text-[#005A61]">Password</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            className="w-full border border-[#6A89A7] rounded px-4 py-2 focus:ring-2 focus:ring-[#00A7B3]"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium text-[#005A61]">Role</label>
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full border border-[#6A89A7] rounded px-4 py-2 focus:ring-2 focus:ring-[#00A7B3]"
            required
          >
            <option value="Admin">Admin</option>
            <option value="Manager">Manager</option>
            <option value="Warehouse">Warehouse</option>
            <option value="Sales">Sales</option>
            <option value="Supplier">Supplier</option>
          </select>
        </div>

        <button
          type="submit"
          className="bg-[#00A7B3] text-white px-6 py-2 rounded hover:bg-[#0097a2] transition"
          disabled={createUserMutation.isPending}
        >
          {createUserMutation.isPending ? 'Creating...' : 'Create User'}
        </button>

        {createUserMutation.isSuccess && (
          <div className="text-green-600 font-medium">✅ User created successfully!</div>
        )}
        {createUserMutation.isError && (
          <div className="text-red-600 font-medium">
            ❌ {(createUserMutation.error as Error).message}
          </div>
        )}
      </form>
    </div>
  );
}