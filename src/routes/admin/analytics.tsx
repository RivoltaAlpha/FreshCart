import { createFileRoute } from '@tanstack/react-router'
import StoreAnalytics from '@/components/store-analytics'
import { useState } from 'react'
import PaymentsAnalytics from './payments'
import ProductAnalytics from '@/components/products-analytics'
import OrdersAnalytics from '@/components/orders-analytics'

export const Route = createFileRoute('/admin/analytics')({
  component: RouteComponent,
})

function RouteComponent() {
  const [selectedTab, setSelectedTab] = useState('store')
  const tabs = [
    { id: 'store', label: 'Stores ' },
    { id: 'products', label: 'Products ' },
    { id: 'payments', label: 'Payments ' },
    { id: 'orders', label: 'Orders ' },
    // { id: 'users', label: 'Users ' },
  ]

  return (
    <div>
      <div className="flex justify-center space-x-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedTab(tab.id)}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${selectedTab === tab.id
              ? 'border-[#189AB4] text-[#189AB4]'
              : 'border-transparent text-gray-500 hover:text-[#05445E] hover:border-gray-300'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {selectedTab === 'store' && <StoreAnalytics />}
        {selectedTab === 'payments' && <PaymentsAnalytics />}
        {selectedTab === 'products' && <ProductAnalytics />}
        {selectedTab === 'orders' && <OrdersAnalytics />}
        {/*
                {selectedTab === 'users' && <UsersAnalytics />}
                {selectedTab === 'categories' && <CategoriesAnalytics />}
                {selectedTab === 'coupons' && <CouponsAnalytics />}
                {selectedTab === 'reviews' && <ReviewsAnalytics />}
                 */}
      </div>
    </div>
  )
}