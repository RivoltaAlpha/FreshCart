import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useStore, useUpdateStoreMutation } from '@/hooks/useStore'
import { toast } from 'sonner'

export const Route = createFileRoute('/store/payment-details')({
  component: RouteComponent,
})

function RouteComponent() {
  const storeDetails = localStorage.getItem("currentStore") || '';
  const storeId = storeDetails ? JSON.parse(storeDetails).store_id : 0;
  const { data: store, isLoading } = useStore(storeId)
  const updateStore = useUpdateStoreMutation(storeId)
  const [accountNumber, setAccountNumber] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (store?.account_number) {
      setAccountNumber(store.account_number)
    }
  }, [store?.account_number])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    updateStore.mutate(
      { account_number: accountNumber },
      {
        onSuccess: () => {
          toast.success('Account number updated successfully!')
        },
        onError: () => {
          toast.error('Failed to update account number. Please try again.')
        },
        onSettled: () => setIsSubmitting(false),
      }
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg text-gray-600">Loading store details...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md border border-gray-100">
        <h1 className="text-2xl font-bold text-fresh-primary mb-4">Store Payment Details</h1>
        <p className="text-fresh-secondary mb-6">
          Add or update the account number where you want to receive your store payments.
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Account Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00A7B3] focus:border-transparent"
              placeholder="Enter your account number"
              value={accountNumber}
              onChange={e => setAccountNumber(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#00A7B3] text-white py-3 rounded-lg font-semibold hover:bg-[#008C9E] transition-all"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save Account Number'}
          </button>
        </form>
      </div>
    </div>
  )
}