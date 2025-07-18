import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import {
  Mail,
  Calendar,
  Edit3,
  Camera,
  ArrowLeft,
  Shield,
  Save,
  X,
  StoreIcon,
  LocateIcon,
  LocateFixedIcon,
} from 'lucide-react'
import { loggedInUser } from '@/store/auth'
import { toast } from 'sonner'
import { useStore } from '@/hooks/useStore'

export const Route = createFileRoute('/store/settings')({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()
  const authUser = loggedInUser()
  const owner_id = authUser?.user_id || 0
  const { data: storeData, isLoading, refetch } = useStore(owner_id)

  const [isEditing, setIsEditing] = useState(false)
  const [editedProfile, setEditedProfile] = useState({
    name: '',
    description: '',
    area: '',
    town: '',
    country: '',
    contact_info: '',
    image_url: '',
    rating: 0,
    total_reviews: 0,
    store_code: '',
    delivery_fee: 0,
  })

  // But also handle case where API returns a single store object
  const store = Array.isArray(storeData) ? storeData[0] : storeData

  // Initialize edit form when store data loads
  // ...existing code...
  useState(() => {
    if (store) {
      setEditedProfile({
        name: store.name || '',
        description: store.description || '',
        area: store.address?.area || '', // If you use area, otherwise remove
        town: store.address?.town || '',
        country: store.address?.country || '',
        contact_info: store.contact_info || '',
        image_url: store.image_url || '',
        rating: Number(store.rating) || 0,
        total_reviews: store.total_reviews || 0,
        store_code: store.store_code || '',
        delivery_fee: store.delivery_fee || 0,
      })
    }
  })
  // ...existing code...

  const handleEditToggle = () => {
    if (store) {
      setEditedProfile({
        name: store.name || '',
        description: store.description || '',
        area: store.address?.area || '',
        town: store.address?.town || '',
        country: store.address?.country || '',
        contact_info: store.contact_info || '',
        image_url: store.image_url || '',
        rating: store.rating || 0,
        total_reviews: store.total_reviews || 0,
        store_code: store.store_code || '',
        delivery_fee: store.delivery_fee || 0,
      })
    }
    setIsEditing(!isEditing)
  }

  const handleSave = async () => {
    try {
      // Here you would typically call an update store API
      // For now, we'll just show success and refresh data
      toast.success('Profile updated successfully!')
      setIsEditing(false)
      refetch()
    } catch (error) {
      toast.error('Failed to update profile')
    }
  }

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  if (!authUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Please Login
          </h1>
          <p className="text-gray-600 mb-6">
            You need to be logged in to view your store Details.
          </p>
          <button
            onClick={() => navigate({ to: '/login' })}
            className="bg-[#00A7B3] hover:bg-[#00A7B3]/90 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00A7B3]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate({ to: '/customer/dashboard' })}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Store Profile</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
              <div className="relative mb-6">
                <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto">
                  <StoreIcon className="h-12 w-12 text-white" />
                </div>
                <img
                  src={store?.image_url || ''}
                  alt="Store Profile"
                  className="absolute inset-0 object-cover rounded-full w-full h-full"
                />
                <button className="absolute bottom-0 right-1/2 transform translate-x-1/2 translate-y-1/2 bg-white border-2 border-gray-200 rounded-full p-2 hover:bg-gray-50 transition-colors">
                  <Camera className="h-4 w-4 text-gray-600" />
                </button>
              </div>

              {/* Basic Info */}
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                {store.name}
              </h2>
              <p className="text-gray-600 mb-4">{store?.contact_info}</p>
              {/* Member Since */}
              <div className="text-sm text-gray-500">
                <Calendar className="h-4 w-4 inline mr-1" />
                Member since{' '}
                {store?.created_at ? formatDate(store.created_at) : 'N/A'}
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  Profile Information
                </h3>
                {!isEditing ? (
                  <button
                    onClick={handleEditToggle}
                    className="flex items-center gap-2 px-4 py-2 text-[#00A7B3] hover:bg-[#00A7B3]/10 rounded-lg transition-colors"
                  >
                    <Edit3 className="h-4 w-4" />
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      className="flex items-center gap-2 px-4 py-2 bg-[#00A7B3] text-white rounded-lg hover:bg-[#00A7B3]/90 transition-colors"
                    >
                      <Save className="h-4 w-4" />
                      Save
                    </button>
                    <button
                      onClick={handleEditToggle}
                      className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X className="h-4 w-4" />
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">
                    Store Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Name
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedProfile.name}
                          onChange={(e) =>
                            setEditedProfile((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A7B3] focus:border-transparent"
                        />
                      ) : (
                        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                          <StoreIcon className="h-4 w-4 text-gray-500" />
                          <span>{store.name || 'Not provided'}</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Code
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedProfile.store_code}
                          onChange={(e) =>
                            setEditedProfile((prev) => ({
                              ...prev,
                              store_code: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A7B3] focus:border-transparent"
                        />
                      ) : (
                        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                          <StoreIcon className="h-4 w-4 text-gray-500" />
                          <span>{store.store_code || 'Not provided'}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Area
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedProfile.area}
                          onChange={(e) =>
                            setEditedProfile((prev) => ({
                              ...prev,
                              area: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A7B3] focus:border-transparent"
                        />
                      ) : (
                        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                          <LocateIcon className="h-4 w-4 text-gray-500" />
                          <span>{store.address.area || 'Not provided'}</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Town
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedProfile.town}
                          onChange={(e) =>
                            setEditedProfile((prev) => ({
                              ...prev,
                              town: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A7B3] focus:border-transparent"
                        />
                      ) : (
                        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                          <LocateFixedIcon className="h-4 w-4 text-gray-500" />
                          <span>{store.address.town || 'Not provided'}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Delivery Fee
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedProfile.delivery_fee}
                        onChange={(e) =>
                          setEditedProfile((prev) => ({
                            ...prev,
                            delivery_fee: Number(e.target.value),
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A7B3] focus:border-transparent"
                      />
                    ) : (
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        <StoreIcon className="h-4 w-4 text-gray-500" />
                        <span>{store.delivery_fee || 'Not provided'}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">
                    Contact Information
                  </h4>
                  <div className="space-y-4">
                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      {isEditing ? (
                        <input
                          type="email"
                          value={editedProfile.contact_info}
                          onChange={(e) =>
                            setEditedProfile((prev) => ({
                              ...prev,
                              contact_info: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A7B3] focus:border-transparent"
                        />
                      ) : (
                        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                          <Mail className="h-4 w-4 text-gray-500" />
                          <span>{store?.contact_info || 'Not provided'}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Account Information */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">
                    Account Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <Shield className="h-4 w-4 text-gray-500" />
                      <div>
                        <span className="text-sm text-gray-600">
                          Account Type
                        </span>
                        <p className="font-medium">Store</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <div>
                        <span className="text-sm text-gray-600">
                          Member Since
                        </span>
                        <p className="font-medium">
                          {store?.created_at
                            ? formatDate(store.created_at)
                            : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Actions */}
        <div className="mt-8 flex flex-wrap gap-4">
          <button
            onClick={() => navigate({ to: '/store/manage-orders' })}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-3 rounded-xl font-semibold transition-colors"
          >
            Manage Orders
          </button>
          <button
            onClick={() => navigate({ to: '/store/inventories' })}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-3 rounded-xl font-semibold transition-colors"
          >
            View Inventory
          </button>
        </div>
      </div>
    </div>
  )
}
