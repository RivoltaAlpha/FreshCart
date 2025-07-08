import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Users, Package, Warehouse, ShoppingCart, Clock, FileText, Bell, Search, Filter } from 'lucide-react'
import { authStore } from '@/store/auth'

export const Route = createFileRoute('/admin/dashboard')({
  component: RouteComponent,
})

function RouteComponent() {
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const stats = [
    { title: 'Total Users', value: '128', color: 'bg-[#30739C]', icon: Users },
    { title: 'Products Listed', value: '342', color: 'bg-[#670787]', icon: Package },
    { title: 'Warehouses', value: '5', color: 'bg-[#0C0166]', icon: Warehouse },
    { title: 'Orders Today', value: '76', color: 'bg-[#1A74B9]', icon: ShoppingCart },
    { title: 'Pending Approvals', value: '14', color: 'bg-[#015A6B]', icon: Clock },
    { title: 'Reports Generated', value: '22', color: 'bg-[#731CDE]', icon: FileText },
  ]

  const recentUsers = [
    { id: 1, firstName: 'John', lastName: 'Doe', email: 'john@example.com', role: 'Customer' },
    { id: 2, firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', role: 'Driver' },
    { id: 3, firstName: 'Mike', lastName: 'Johnson', email: 'mike@example.com', role: 'Store Owner' },
    { id: 4, firstName: 'Sarah', lastName: 'Wilson', email: 'sarah@example.com', role: 'Customer' },
    { id: 5, firstName: 'David', lastName: 'Brown', email: 'david@example.com', role: 'Driver' },
  ]
  const user = authStore.state.user

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
              <p className="text-gray-600">Welcome back {user.first_name} {user.last_name}! Here's an overview of your system.</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#015A6B]"
                />
              </div>
              <button className="p-2 rounded-lg hover:bg-gray-100 relative">
                <Bell size={20} />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  3
                </span>
              </button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-auto p-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className={`${stat.color} rounded-xl p-6 text-white`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm">{stat.title}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                  </div>
                  <stat.icon size={40} className="text-white/80" />
                </div>
              </div>
            ))}
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-xl shadow-sm">
            <div className="px-6 py-4 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">Users</h2>
                <div className="flex items-center space-x-2">
                  <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <Filter size={16} />
                    <span>Filter</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-teal-600 text-white">
                  <tr>
                    <th className="px-6 py-3 text-left font-medium">ID</th>
                    <th className="px-6 py-3 text-left font-medium">First Name</th>
                    <th className="px-6 py-3 text-left font-medium">Last Name</th>
                    <th className="px-6 py-3 text-left font-medium">Email</th>
                    <th className="px-6 py-3 text-left font-medium">Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{user.id}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{user.firstName}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{user.lastName}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${user.role === 'Customer' ? 'bg-blue-100 text-blue-800' :
                          user.role === 'Driver' ? 'bg-green-100 text-green-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                          {user.role}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Rows per page:</span>
                <select
                  value={rowsPerPage}
                  onChange={(e) => setRowsPerPage(Number(e.target.value))}
                  className="border border-gray-300 rounded px-2 py-1 text-sm"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <button className="px-3 py-1 text-sm bg-teal-100 text-teal-600 rounded hover:bg-teal-200">
                  &lt;&lt;
                </button>
                <span className="text-sm text-gray-600">
                  {currentPage} of 0
                </span>
                <button className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded hover:bg-gray-200">
                  &gt;&gt;
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}