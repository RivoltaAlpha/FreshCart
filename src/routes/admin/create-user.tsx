import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react';
import { useCreateUser } from '@/hooks/useUser';
import { UserRole } from '@/types/types';
import { getAreasInLocality, getLocalitiesInCounty, getSubCountiesInCounty, getCounties } from 'kenya-locations';

export const Route = createFileRoute('/admin/create-user')({
  component: RouteComponent,
})

function RouteComponent() {
  const [county, setCounty] = useState('');
  const [subCounty, setSubCounty] = useState('');
  const [localityName, setLocalityName] = useState('');
  const [area, setArea] = useState('');
  const counties = getCounties();
  const subCounties = county ? getSubCountiesInCounty(county) : [];
  const localities = subCounty ? getLocalitiesInCounty(county) : [];
  const areas = localityName ? getAreasInLocality(localityName) : [];
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    role: 'Admin' as UserRole,
    phone_number: '',
    town: '',
    area: '',
    county: '',
    country: 'Kenya'
  });

  const navigate = useNavigate();

  const createUserMutation = useCreateUser();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createUserMutation.mutate({
      email: form.email,
      password: form.password,
      role: form.role,
      first_name: form.first_name,
      last_name: form.last_name,
      phone_number: form.phone_number,
      area: form.area,
      town: form.town,
      county: form.county,
      country: form.country,
      is_active: true,
      is_available: true,
    });
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
            <option value="Store">Store</option>
            <option value="Driver">Driver</option>
          </select>
        </div>
        <div>
          <label className="block mb-1 font-medium text-[#005A61]">Phone Number</label>
          <input
            type="tel"
            name="phone_number"
            value={form.phone_number}
            onChange={handleChange}
            className="w-full border border-[#6A89A7] rounded px-4 py-2 focus:ring-2 focus:ring-[#00A7B3]"
            required
          />
        </div>
        <div className="space-y-2">
          <select
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00A7B3] focus:border-transparent"
            value={county}
            onChange={e => {
              setCounty(e.target.value);
              setSubCounty('');
              setLocalityName('');
              setArea('');
            }}
            required
          >
            <option value="">Select County</option>
            {counties.map((c: any) => (
              <option key={c.code} value={c.name}>{c.name}</option>
            ))}
          </select>
          {county && (
            <select
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00A7B3] focus:border-transparent"
              value={subCounty}
              onChange={e => {
                setSubCounty(e.target.value);
                setLocalityName('');
                setArea('');
              }}
              required
            >
              <option value="">Select Sub-County</option>
              {subCounties.map((sc: any) => (
                <option key={sc.code} value={sc.name}>{sc.name}</option>
              ))}
            </select>
          )}
          {subCounty && (
            <select
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00A7B3] focus:border-transparent"
              value={localityName}
              onChange={e => {
                setLocalityName(e.target.value);
                setArea('');
              }}
              required
            >
              <option value="">Select Locality</option>
              {localities.map((l: any, idx: number) => (
                <option key={l.name || idx} value={l.name || ''}>{l.name || ''}</option>
              ))}
            </select>
          )}
          {localityName && (
            <select
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00A7B3] focus:border-transparent"
              value={area}
              onChange={e => setArea(e.target.value)}
              required
            >
              <option value="">Select Area</option>
              {areas.map((a: any, idx: number) => (
                <option key={a.name || a || idx} value={a.name || a || ''}>{a.name || a || ''}</option>
              ))}
            </select>
          )}
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