import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'

export const Route = createFileRoute('/admin/create-category')({
  component: RouteComponent,
})

function RouteComponent() {
  const [form, setForm] = useState({
    name: '',
    description: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(false)
    try {
      const res = await fetch('http://localhost:8000/categories/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('AdminToken') || ''}`,
        },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Failed to create category')
      setSuccess(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (success) {
      const timeout = setTimeout(() => {
        navigate({ to: '/admin/success' })
      }, 2000)
      return () => clearTimeout(timeout)
    }
  }, [success, navigate])

  return (
    <div className="max-w-xl mx-auto mt-16 bg-white p-8 rounded-lg shadow border border-[#005A61]/20">
      <h2 className="text-2xl font-bold text-[#005A61] mb-6">Create Category</h2>
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
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full border border-[#6A89A7] rounded px-4 py-2"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-[#00A7B3] text-white px-6 py-2 rounded hover:bg-[#0097a2] transition"
          disabled={isLoading}
        >
          {isLoading ? 'Creating...' : 'Create Category'}
        </button>
        {success && (
          <div className="text-green-600 font-medium">✅ Category created successfully!</div>
        )}
        {error && (
          <div className="text-red-600 font-medium">❌ {error}</div>
        )}
      </form>
    </div>
  )
}