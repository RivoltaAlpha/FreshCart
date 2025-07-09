import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router'
import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, ArrowLeft, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { useVerifyPayment } from '@/hooks/usePayments';
import { orderActions } from '@/store/order';
import { cartActions } from '@/store/cart';

type PaymentVerifySearch = {
    reference?: string
    trxref?: string
}

export const Route = createFileRoute('/customer/payment-verify')({
    component: RouteComponent,
    validateSearch: (search: Record<string, unknown>): PaymentVerifySearch => {
        return {
            reference: search?.reference as string,
            trxref: search?.trxref as string
        }
    }
})

function RouteComponent() {
    const navigate = useNavigate();
    const search = useSearch({ from: '/customer/payment-verify' });
    const { mutate: verifyPayment } = useVerifyPayment();
    const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'failed'>('loading');
    const [paymentDetails, setPaymentDetails] = useState<any>(null);

    useEffect(() => {
        const reference = search.reference || search.trxref || localStorage.getItem('payment_reference');

        console.log('Payment verification - URL params:', search);
        console.log('Payment verification - extracted reference:', reference);

        if (!reference) {
            console.error('No payment reference found in URL or localStorage');
            toast.error('No payment reference found. Please try again.');
            navigate({ to: '/customer/cart' });
            return;
        }

        // Verify payment
        verifyPayment(reference, {
            onSuccess: (response) => {
                console.log('Payment verification response:', response);

                if (response.status && response.data.status === 'success') {
                    setVerificationStatus('success');
                    setPaymentDetails(response.data);

                    // Payment successful - clear cart and order
                    cartActions.clearCart();

                    // Add to order history
                    const currentOrder = orderActions.getCurrentOrder();
                    if (currentOrder) {
                        orderActions.addToOrderHistory(currentOrder);
                    }

                    orderActions.clearCurrentOrder();

                    // Clean up localStorage
                    localStorage.removeItem('payment_reference');
                    localStorage.removeItem('payment_order_id');

                    toast.success('Payment verified successfully!');

                    // Redirect to orders page after 3 seconds
                    setTimeout(() => {
                        navigate({ to: '/customer/my-orders' });
                    }, 5000);
                } else {
                    setVerificationStatus('failed');
                    toast.error('Payment verification failed. Please contact support.');
                }
            },
            onError: (error) => {
                console.error('Payment verification error:', error);
                setVerificationStatus('failed');
                toast.error('Payment verification failed. Please try again.');
            }
        });
    }, [search.reference, verifyPayment, navigate]);

    const retryVerification = () => {
        setVerificationStatus('loading');
        const reference = search.reference || search.trxref || localStorage.getItem('payment_reference');
        if (reference) {
            verifyPayment(reference);
        } else {
            toast.error('No payment reference found. Cannot retry verification.');
        }
    };

    const goBackToCart = () => {
        navigate({ to: '/customer/cart' });
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center py-12">
            <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-card rounded-2xl shadow-lg p-8 text-center">
                    {verificationStatus === 'loading' && (
                        <>
                            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#00A7B3] mx-auto mb-6"></div>
                            <h1 className="text-2xl font-bold text-fresh-primary mb-4">Verifying Payment</h1>
                            <p className="text-fresh-secondary mb-6">
                                Please wait while we verify your payment...
                            </p>
                        </>
                    )}

                    {verificationStatus === 'success' && (
                        <>
                            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
                            <h1 className="text-2xl font-bold text-green-700 mb-4">Payment Successful!</h1>
                            <p className="text-fresh-secondary mb-6">
                                Your payment has been verified and your order has been placed successfully.
                            </p>

                            {paymentDetails && (
                                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 text-left">
                                    <h3 className="font-semibold text-green-800 mb-2">Payment Details</h3>
                                    <div className="space-y-1 text-sm text-green-700">
                                        <p><span className="font-medium">Reference:</span> {paymentDetails.reference}</p>
                                        <p><span className="font-medium">Amount:</span> KSh {(paymentDetails.amount / 100).toFixed(2)}</p>
                                        <p><span className="font-medium">Status:</span> {paymentDetails.status}</p>
                                        {paymentDetails.channel && (
                                            <p><span className="font-medium">Channel:</span> {paymentDetails.channel}</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            <p className="text-sm text-fresh-secondary mb-4">
                                Redirecting to your orders in 3 seconds...
                            </p>

                            <button
                                onClick={() => navigate({ to: '/customer/my-orders' })}
                                className="w-full bg-[#00A7B3] hover:bg-[#00A7B3]/90 text-white py-3 rounded-xl font-semibold transition-colors"
                            >
                                View My Orders
                            </button>
                        </>
                    )}

                    {verificationStatus === 'failed' && (
                        <>
                            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
                            <h1 className="text-2xl font-bold text-red-700 mb-4">Payment Verification Failed</h1>
                            <p className="text-fresh-secondary mb-6">
                                We couldn't verify your payment. This might be a temporary issue.
                            </p>

                            <div className="space-y-3">
                                <button
                                    onClick={retryVerification}
                                    className="w-full bg-[#00A7B3] hover:bg-[#00A7B3]/90 text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                                >
                                    <CreditCard className="h-4 w-4" />
                                    Retry Verification
                                </button>

                                <button
                                    onClick={goBackToCart}
                                    className="w-full bg-gray-200 hover:bg-gray-300 text-fresh-primary py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    Back to Cart
                                </button>
                            </div>

                            <p className="text-xs text-fresh-secondary mt-4">
                                If the problem persists, please contact our support team.
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
