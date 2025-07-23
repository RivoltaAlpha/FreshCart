import { useCustomerPayments } from '@/hooks/usePayments'
import { createFileRoute } from '@tanstack/react-router'
import { loggedInUser } from '@/store/auth'
import CustomerPayments from '@/components/customerPayments'

export const Route = createFileRoute('/customer/payments')({
  component: RouteComponent,
})

function RouteComponent() {
  const authUser = loggedInUser()
  const userId = authUser?.user_id
  const { data: allPayments, isLoading, error } = useCustomerPayments(userId)
  const payments = allPayments?.filter((payment:any) => payment.status === 'completed') || []
  // console.log('completed payments:', payments)

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

  const paymentsData = payments?.json ? [payments] : payments || []

  return <CustomerPayments payments={paymentsData} />
}