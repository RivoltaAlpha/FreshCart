import { usePayments } from '@/hooks/usePayments'
import { createFileRoute } from '@tanstack/react-router'
import PaymentsDashboard from '@/components/SalesAnalytics' // Adjust path as needed

export const Route = createFileRoute('/admin/payments')({
  component: PaymentsAnalytics,
})

function PaymentsAnalytics() {
  const { data: payments, isLoading, error } = usePayments()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payments...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading payments</p>
          <p className="text-gray-600">{error.message}</p>
        </div>
      </div>
    )
  }

  // Extract payments from the response structure if needed
  const paymentsData = payments?.json ? [payments] : payments || []

  return <PaymentsDashboard payments={paymentsData} />
}

export default PaymentsAnalytics