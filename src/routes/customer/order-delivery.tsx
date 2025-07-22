import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { MapPin, Phone, Package, User, Route as RouteIcon, ArrowLeft, CheckCircle2Icon, Star, Clock, Truck, XCircle } from 'lucide-react';
import type { DeliveryStatus } from '@/types/delivery';
import { useUpdateOrderStatusMutation } from '@/hooks/useOrders';
import type { OrderStatus } from '@/types/types';
import { useCreateFeedback, useOrderFeedback } from '@/hooks/useFeedback';
import { useState } from 'react';
import { toast } from 'sonner';

export const Route = createFileRoute('/customer/order-delivery')({
    component: RouteComponent,
});

function RouteComponent() {
    const delivery = JSON.parse(localStorage.getItem('selectedDelivery') || 'null');

    const navigate = useNavigate();
    const updateMutation = useUpdateOrderStatusMutation(delivery?.order_id ?? 0);
    const createMutation = useCreateFeedback();
    const [rating, setRating] = useState<number | null>(null);
    const [hoveredRating, setHoveredRating] = useState<number | null>(null);
    const [comment, setComment] = useState<string>('');
    const selectedDelivery = JSON.parse(localStorage.getItem('selectedDelivery') || 'null');
    const userId = selectedDelivery?.customer?.id ?? null;
    const orderId = selectedDelivery?.order_id ?? null;
    const { data: feedback } = useOrderFeedback(orderId ?? 0);
    // console.log('Feedback:', feedback);

    if (!userId || !orderId) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
                <div className="bg-white p-8 rounded-lg shadow-lg">
                    <p className="text-red-600 mb-4">Missing user or order information. Please try again.</p>
                    <button
                        onClick={() => navigate({ to: '/customer/my-orders' })}
                        className="px-4 py-2 bg-[#145DA0] text-white rounded-lg hover:bg-[#145DA0]/90"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    const handleBack = () => {
        localStorage.removeItem('selectedDelivery');
        navigate({ to: '/customer/my-orders' });
    };

    if (!delivery) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
                <div className="flex flex-col h-screen">
                    <main className="flex-1 p-4 sm:p-6">
                        <header className="bg-white shadow-lg border-b-4 border-[#145DA0] rounded-t-2xl">
                            <div className="px-4 sm:px-6 py-4 sm:py-6">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => handleBack()}
                                            className="text-gray-500 hover:text-gray-700 transition-colors"
                                        >
                                            <ArrowLeft className="h-6 w-6" />
                                        </button>
                                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Orders</h1>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#145DA0] rounded-lg flex items-center justify-center">
                                            <Package className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                        </div>
                                        <h1 className="text-xl sm:text-3xl font-bold text-[#0C2D48]">Current Delivery</h1>
                                    </div>
                                </div>
                            </div>
                        </header>
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 mt-4">
                            <div className="p-8 sm:p-12 text-center">
                                <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Package className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400" />
                                </div>
                                <p className="text-lg sm:text-xl text-gray-500 mb-2">No delivery details found</p>
                                <p className="text-sm sm:text-base text-gray-400">Please check back later for delivery updates</p>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'in_transit':
                return <Truck className="h-4 w-4" />
            case 'delivered':
                return <Package className="h-4 w-4" />
            case 'cancelled':
                return <XCircle className="h-4 w-4" />
            default:
                return <Clock className="h-4 w-4" />
        }
    }

    const getStatusColor = (status: DeliveryStatus) => {
        switch (status) {
            case 'picked_up':
                return 'bg-[#2E8BC0] text-white';
            case 'assigned':
                return 'bg-[#0C2D48] text-white';
            case 'in_transit':
                return 'bg-gradient-to-r from-[#145DA0] to-[#2E8BC0] text-white';
            case 'delivered':
                return 'bg-teal-500 text-white';
            default:
                return 'bg-gray-300 text-gray-800';
        }
    };

    const handleStatusChange = () => {
        const newStatus = 'delivered';
        updateMutation.mutate(newStatus as OrderStatus);
    };

    const handleRatingClick = (selectedRating: number) => {
        setRating(selectedRating);
    };

    const handleRatingHover = (selectedRating: number) => {
        setHoveredRating(selectedRating);
    };

    const handleRatingLeave = () => {
        setHoveredRating(null);
    };

    const displayRating = hoveredRating || rating || 0;

    // Check if delivery is delivered and if feedback exists
    const isDelivered = delivery.status === 'delivered';
    const hasFeedback = Array.isArray(feedback) && feedback.length > 0;
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
            <div className="flex flex-col h-screen">
                {/* Main Content */}
                <main className="flex-1 p-4 sm:p-6">
                    <header className="bg-white shadow-lg border-b-4 border-[#145DA0] rounded-t-2xl">
                        <div className="px-4 sm:px-6 py-4 sm:py-6">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={handleBack}
                                        className="text-gray-500 hover:text-gray-700 transition-colors"
                                    >
                                        <ArrowLeft className="h-6 w-6" />
                                    </button>
                                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Orders</h1>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#145DA0] rounded-lg flex items-center justify-center">
                                        <Package className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                    </div>
                                    <h1 className="text-xl sm:text-3xl font-bold text-[#0C2D48]">
                                        {isDelivered ? 'Order Delivered' : 'Current Delivery'}
                                    </h1>
                                </div>
                            </div>
                        </div>
                    </header>
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mt-4">
                        <div className="relative">
                            <div className="px-4 sm:px-8 py-6 bg-gradient-to-r from-[#145DA0] to-[#2E8BC0] text-white">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-full flex items-center justify-center">
                                            <Package className="w-5 h-5 sm:w-6 sm:h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl sm:text-2xl font-bold">Order #{delivery.order_id}</h3>
                                            <p className="text-blue-100 text-sm sm:text-base">
                                                {isDelivered ? 'Order delivered successfully' : 'Delivery in progress'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-left sm:text-right">
                                        <p className="text-2xl sm:text-3xl font-bold">KSh {delivery.delivery_fee}</p>
                                        <p className="text-blue-100 text-sm sm:text-base">Delivery Fee</p>
                                    </div>
                                </div>
                            </div>

                            {/* Driver Information */}
                            <div className="px-4 sm:px-8 py-6 bg-gray-50 border-b border-gray-100">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#145DA0] rounded-full flex items-center justify-center">
                                            <User className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                        </div>
                                        <div>
                                            <h4 className="text-lg sm:text-xl font-semibold text-[#0C2D48]">{delivery.driver?.name}</h4>
                                            <div className="flex items-center space-x-1 text-gray-600 mt-1">
                                                <Phone size={14} className="sm:w-4 sm:h-4" />
                                                <span className="text-sm sm:text-base">{delivery.driver?.phone}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Delivery Details */}
                            <div className="px-4 sm:px-8 py-6">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Left Column - Address & Timing */}
                                    <div className="space-y-4">
                                        <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
                                            <div className="w-8 h-8 bg-[#145DA0] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                                <MapPin className="w-4 h-4 text-white" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-[#0C2D48] mb-1">Delivery Address</p>
                                                <p className="text-gray-700 text-sm sm:text-base">{delivery.delivery_address}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column - Driver & Route Info */}
                                    <div className="space-y-4">
                                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                                            <div className="flex items-center space-x-3 mb-3">
                                                <div className="w-8 h-8 bg-[#2E8BC0] rounded-full flex items-center justify-center">
                                                    <RouteIcon className="w-4 h-4 text-white" />
                                                </div>
                                                <p className="font-medium text-[#0C2D48]">Route Details</p>
                                            </div>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Distance:</span>
                                                    <span className="font-medium text-gray-900">{delivery.route?.distance || 'Calculating...'}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Duration:</span>
                                                    <span className="font-medium text-gray-900">{delivery.route?.duration || 'Calculating...'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Status Information */}
                            <div className="px-4 sm:px-8 py-6 bg-gray-50 border-t border-gray-100">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className={`w-3 h-3 rounded-full ${isDelivered ? 'bg-teal-600' : 'bg-[#145DA0] animate-pulse'}`}></div>
                                        <span className="text-gray-600">Order Status:</span>
                                        <div className={`px-3 flex gap-2 py-1 sm:px-4 sm:py-2 font-semibold text-xs sm:text-sm rounded-full ${getStatusColor(delivery.status as DeliveryStatus)}`}>
                                            {getStatusIcon(delivery.status as DeliveryStatus)}
                                            {typeof delivery.status === 'string' ? delivery.status.replace('_', ' ').toUpperCase() : 'UNKNOWN'}
                                        </div>
                                    </div>

                                    {/* Only show the button if the order is not delivered */}
                                    {!isDelivered && (
                                        <button
                                            onClick={handleStatusChange}
                                            className="px-4 py-2 bg-[#00A7B3] text-white rounded-lg hover:bg-[#00A7B3]/90 transition-colors disabled:opacity-50 text-sm sm:text-base"
                                            disabled={updateMutation.isPending}
                                        >
                                            <div className="flex items-center justify-center space-x-2">
                                                <CheckCircle2Icon className="h-4 w-4" />
                                                <span>{updateMutation.isPending ? 'Updating...' : 'Mark as Delivered'}</span>
                                            </div>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Conditional Feedback Section */}
                    {hasFeedback ? (
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 mt-4">
                            <div className="px-4 sm:px-8 py-6">
                                <h2 className="text-xl font-semibold text-[#0C2D48] mb-4">Customer Feedback</h2>
                                {Array.isArray(feedback) && feedback.length > 0 ? (
                                    feedback.map((item: any) => (
                                        <div key={item.feedback_id} className="mb-4 p-4 bg-gray-200 rounded-lg">
                                            <div className="flex items-center space-x-1 mb-2">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <Star
                                                        key={star}
                                                        className={`w-5 h-5 ${star <= item.rating
                                                            ? 'text-yellow-400 fill-yellow-400'
                                                            : 'text-gray-300'
                                                            }`}
                                                    />
                                                ))}
                                                <span className="ml-2 text-sm text-gray-600">
                                                    ({item.rating}/5 stars)
                                                </span>
                                            </div>
                                            <p className="text-gray-700">{item.comment}</p>
                                            {item.created_at && (
                                                <p className="text-xs text-gray-500 mt-2">
                                                    Submitted on {new Date(item.created_at).toLocaleDateString()}
                                                </p>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500">No feedback yet.</p>
                                )}
                            </div>
                        </div>
                    ) : (
                        // Show review form only if delivered and no feedback exists
                        isDelivered && (
                            <div className='bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mt-4'>
                                <div className="px-4 sm:px-8 py-6 bg-gray-50 border-t border-gray-100">
                                    <h2 className="text-xl font-semibold text-[#0C2D48] mb-4">Leave a Review</h2>
                                    <textarea
                                        className="w-full h-24 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#145DA0] text-sm sm:text-base"
                                        placeholder="Write your feedback here..."
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                    />

                                    {/* Rating Section */}
                                    <div className="mt-6">
                                        <h3 className="text-lg font-semibold text-[#0C2D48] mb-2">Rate our services</h3>
                                        <p className="text-gray-600 mb-4 text-sm sm:text-base">Your feedback helps us improve our delivery experience.</p>

                                        {/* Interactive Star Rating */}
                                        <div className="flex items-center space-x-1 mb-2">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    onClick={() => handleRatingClick(star)}
                                                    onMouseEnter={() => handleRatingHover(star)}
                                                    onMouseLeave={handleRatingLeave}
                                                    className="p-1 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#145DA0] focus:ring-opacity-50 rounded"
                                                    type="button"
                                                >
                                                    <Star
                                                        className={`w-6 h-6 sm:w-8 sm:h-8 transition-colors duration-150 ${star <= displayRating
                                                            ? 'text-yellow-400 fill-yellow-400'
                                                            : 'text-gray-300 hover:text-yellow-300'
                                                            }`}
                                                    />
                                                </button>
                                            ))}
                                        </div>

                                        {/* Rating Text */}
                                        {rating && (
                                            <p className="text-sm text-gray-600 mb-4">
                                                You rated: {rating} star{rating !== 1 ? 's' : ''}
                                            </p>
                                        )}
                                    </div>

                                    {/* Submit Button */}
                                    <div className="flex justify-end mt-6">
                                        <button
                                            className="px-6 py-2 bg-[#0662ad] text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm sm:text-base"
                                            onClick={() => {
                                                if (!rating) {
                                                    alert('Please select a rating before submitting.');
                                                    return;
                                                }
                                                createMutation.mutate({
                                                    user_id: userId,
                                                    order_id: orderId,
                                                    comment: comment,
                                                    rating: rating,
                                                });
                                                setRating(null);
                                                setComment('');
                                                setHoveredRating(null);
                                                toast('Thank you for your feedback!');
                                                console.log('Feedback submitted:', { userId, orderId: orderId, comment, rating });
                                            }}
                                            disabled={createMutation.isPending || !rating}
                                        >
                                            {createMutation.isPending ? 'Submitting...' : 'Submit Review'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    )}
                </main>
            </div>
        </div>
    );
}