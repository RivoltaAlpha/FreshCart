import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useUnverifiedStores, useVerifyStoreMutation } from '@/hooks/useStore'
import {
  StoreIcon,
  Mail,
  User,
  MapPin,
  Calendar,
  Shield,
  XCircle,
  Edit3,
  CheckCircle
} from 'lucide-react'
  import { toast } from 'sonner'

export const Route = createFileRoute('/admin/verify-store')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data: stores, isLoading, isError, refetch } = useUnverifiedStores()
  const [selectedStore, setSelectedStore] = useState<any | null>(null)
  const verifyMutation = useVerifyStoreMutation(selectedStore?.store_id ?? 0)

  const openModal = (store: any) => setSelectedStore(store)
  const closeModal = () => setSelectedStore(null)

  const handleVerify = async () => {
    if (selectedStore) {
      await verifyMutation.mutateAsync()
      toast.success('Store verified successfully!')
      closeModal()
      refetch()
    }
  }

  // Modal for store details and verify button
  const StoreVerifyModal = ({ store, onClose }: { store: any, onClose: () => void }) => (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <StoreIcon className="h-6 w-6 text-[#00A7B3]" />
            Store Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XCircle className="h-6 w-6" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-500" />
              <span className="font-semibold">{store.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-500" />
              <span>{store.contact_info}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span>
                {store.address?.area}, {store.address?.town}, {store.address?.county}, {store.address?.country}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span>Created: {new Date(store.created_at).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-gray-500" />
              <span>Status: <span className="text-red-500 font-bold">Unverified</span></span>
            </div>
            <div>
              <span className="block text-gray-700 font-medium mb-1">Description:</span>
              <span className="text-gray-600">{store.description}</span>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleVerify}
              className="px-4 py-2 bg-[#00A7B3] text-white rounded-lg hover:bg-[#00A7B3]/90 transition-colors flex items-center gap-2"
              disabled={verifyMutation.isPending}
            >
              {verifyMutation.isPending ? 'Verifying...' : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Verify Store
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00A7B3]"></div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Stores</h1>
          <p className="text-gray-600 mb-6">There was an error loading the unverified stores. Please try again.</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-[#00A7B3] hover:bg-[#00A7B3]/90 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Unverified Stores</h1>
        {(!stores || stores.length === 0) ? (
          <div className="text-center py-12">
            <StoreIcon className="h-24 w-24 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Unverified Stores</h2>
            <p className="text-gray-600">All stores have been verified.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {stores.map((store: any) => (
              <div
                key={store.store_id}
                className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="p-6 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{store.name}</h3>
                    <span className="text-sm text-gray-600">{store.address?.town}, {store.address?.county}</span>
                  </div>
                  <button
                    onClick={() => openModal(store)}
                    className="text-[#00A7B3] hover:text-[#00A7B3]/80 flex items-center gap-1 text-sm font-medium transition-colors"
                  >
                    <Edit3 className="h-4 w-4" />
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        {selectedStore && (
          <StoreVerifyModal
            store={selectedStore}
            onClose={closeModal}
          />
        )}
      </div>
    </div>
  )
}