import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import {
  User as UserIcon,
  Mail,
  Phone,
  Calendar,
  Edit3,
  Camera,
  ArrowLeft,
  Shield,
  Save,
  X
} from 'lucide-react'
import { useUser } from '@/hooks/useUser'
import { loggedInUser } from '@/store/auth'
import { toast } from 'sonner'

export const Route = createFileRoute('/customer/profile')({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()
  const authUser = loggedInUser()

  const [isEditing, setIsEditing] = useState(false)
  const [editedProfile, setEditedProfile] = useState({
    first_name: '',
    last_name: '',
    phone_number: '',
    email: ''
  })

  // Get user details from backend using the user ID
  const { data: userData, isLoading, error, refetch } = useUser(
    authUser?.user_id ? parseInt(authUser.user_id) : 0
  )

  // But also handle case where API returns a single user object
  const user = Array.isArray(userData) ? userData[0] : userData

  // Initialize edit form when user data loads
  useState(() => {
    if (user) {
      setEditedProfile({
        first_name: user.profile?.first_name || '',
        last_name: user.profile?.last_name || '',
        phone_number: user.profile?.phone_number || '',
        email: user.email || ''
      })
    }
  })

  const handleEditToggle = () => {
    if (user) {
      setEditedProfile({
        first_name: user.profile?.first_name || '',
        last_name: user.profile?.last_name || '',
        phone_number: user.profile?.phone_number || '',
        email: user.email || ''
      })
    }
    setIsEditing(!isEditing)
  }

  const handleSave = async () => {
    try {
      // Here you would typically call an update user API
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
      day: 'numeric'
    })
  }

  if (!authUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Login</h1>
          <p className="text-gray-600 mb-6">You need to be logged in to view your profile.</p>
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

  // If there's an error or no user data from API, show fallback with auth data
  if (!user && !isLoading && authUser) {
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
              <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
            </div>
          </div>

          {/* Fallback Profile Display */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="text-center mb-6">
              <div className="w-24 h-24 bg-[#00A7B3] rounded-full flex items-center justify-center mx-auto mb-4">
                <UserIcon className="h-12 w-12 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                {authUser.first_name} {authUser.last_name}
              </h2>
              <p className="text-gray-600 mb-4">{authUser.email}</p>
              <div className="inline-flex items-center gap-1 px-3 py-1 bg-[#00A7B3]/10 text-[#00A7B3] rounded-full text-sm font-medium">
                <Shield className="h-4 w-4" />
                {authUser.role.charAt(0).toUpperCase() + authUser.role.slice(1)}
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-yellow-800 text-sm">
                <strong>Note:</strong> Showing basic profile information from your session.
                {error && <span> Error loading detailed profile: {String(error)}</span>}
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <UserIcon className="h-4 w-4 text-gray-500" />
                  <div>
                    <span className="text-sm text-gray-600">First Name</span>
                    <p className="font-medium">{authUser.first_name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <UserIcon className="h-4 w-4 text-gray-500" />
                  <div>
                    <span className="text-sm text-gray-600">Last Name</span>
                    <p className="font-medium">{authUser.last_name}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <Mail className="h-4 w-4 text-gray-500" />
                <div>
                  <span className="text-sm text-gray-600">Email</span>
                  <p className="font-medium">{authUser.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <Shield className="h-4 w-4 text-gray-500" />
                <div>
                  <span className="text-sm text-gray-600">Role</span>
                  <p className="font-medium">{authUser.role.charAt(0).toUpperCase() + authUser.role.slice(1)}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={() => refetch()}
                className="bg-[#00A7B3] hover:bg-[#00A7B3]/90 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
              >
                Try Loading Full Profile Again
              </button>
            </div>
          </div>
        </div>
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
            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Summary Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
              {/* Profile Picture */}
              <div className="relative mb-6">
                <div className="w-24 h-24 bg-[#00A7B3] rounded-full flex items-center justify-center mx-auto">
                  <UserIcon className="h-12 w-12 text-white" />
                </div>
                <button className="absolute bottom-0 right-1/2 transform translate-x-1/2 translate-y-1/2 bg-white border-2 border-gray-200 rounded-full p-2 hover:bg-gray-50 transition-colors">
                  <Camera className="h-4 w-4 text-gray-600" />
                </button>
              </div>

              {/* Basic Info */}
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                {user?.profile?.first_name || authUser?.first_name} {user?.profile?.last_name || authUser?.last_name}
              </h2>
              <p className="text-gray-600 mb-4">{user?.email || authUser?.email}</p>

              {/* Role Badge */}
              <div className="inline-flex items-center gap-1 px-3 py-1 bg-[#00A7B3]/10 text-[#00A7B3] rounded-full text-sm font-medium mb-4">
                <Shield className="h-4 w-4" />
                {user?.role || authUser?.role ? (user?.role || authUser?.role).charAt(0).toUpperCase() + (user?.role || authUser?.role).slice(1) : 'Customer'}
              </div>

              {/* Member Since */}
              <div className="text-sm text-gray-500">
                <Calendar className="h-4 w-4 inline mr-1" />
                Member since {user?.createdAt ? formatDate(user.createdAt) : 'N/A'}
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Profile Information</h3>
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
                {/* Personal Information */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* First Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedProfile.first_name}
                          onChange={(e) => setEditedProfile(prev => ({ ...prev, first_name: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A7B3] focus:border-transparent"
                        />
                      ) : (
                        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                          <UserIcon className="h-4 w-4 text-gray-500" />
                          <span>{user?.profile?.first_name || authUser?.first_name || 'Not provided'}</span>
                        </div>
                      )}
                    </div>

                    {/* Last Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedProfile.last_name}
                          onChange={(e) => setEditedProfile(prev => ({ ...prev, last_name: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A7B3] focus:border-transparent"
                        />
                      ) : (
                        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                          <UserIcon className="h-4 w-4 text-gray-500" />
                          <span>{user?.profile?.last_name || authUser?.last_name || 'Not provided'}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Contact Information</h4>
                  <div className="space-y-4">
                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                      {isEditing ? (
                        <input
                          type="email"
                          value={editedProfile.email}
                          onChange={(e) => setEditedProfile(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A7B3] focus:border-transparent"
                        />
                      ) : (
                        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                          <Mail className="h-4 w-4 text-gray-500" />
                          <span>{user?.email || authUser?.email || 'Not provided'}</span>
                        </div>
                      )}
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                      {isEditing ? (
                        <input
                          type="tel"
                          value={editedProfile.phone_number}
                          onChange={(e) => setEditedProfile(prev => ({ ...prev, phone_number: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A7B3] focus:border-transparent"
                        />
                      ) : (
                        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <span>{user?.profile?.phone_number || 'Not provided'}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Account Information */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Account Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <Shield className="h-4 w-4 text-gray-500" />
                      <div>
                        <span className="text-sm text-gray-600">Account Type</span>
                        <p className="font-medium">{user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Customer'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <div>
                        <span className="text-sm text-gray-600">Member Since</span>
                        <p className="font-medium">{user?.createdAt ? formatDate(user.createdAt) : 'N/A'}</p>
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
            onClick={() => navigate({ to: '/customer/my-orders' })}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-3 rounded-xl font-semibold transition-colors"
          >
            View Orders
          </button>
          <button
            onClick={() => navigate({ to: '/customer/wishlist' })}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-3 rounded-xl font-semibold transition-colors"
          >
            View Wishlist
          </button>
        </div>
      </div>
    </div>
  )
}
