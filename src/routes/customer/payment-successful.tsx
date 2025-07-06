import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react';
import { CheckCircle } from 'lucide-react';

export const Route = createFileRoute('/customer/payment-successful')({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate();

// validate payment success

  useEffect(() => {
    const timer = setTimeout(() => {
        navigate({ to: '/admin/success' });
    }, 4000); // 4 seconds

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f8fa] px-4">
      <div className="bg-white rounded-xl shadow-lg p-10 text-center border border-[#00A7B3]/30">
        <CheckCircle className="w-16 h-16 text-[#00A7B3] mx-auto mb-4 animate-bounce" />
        <h1 className="text-2xl font-bold text-[#005A61] mb-2">Success!</h1>
        <p className="text-[#516E89] mb-6">Your operation was successful. Redirecting to dashboard...</p>
        <button
          onClick={() => navigate({ to: '/customer/dashboard' })}
          className="px-5 py-2 rounded bg-[#00A7B3] text-white hover:bg-[#0096a3] transition"
        >
          Go to Dashboard Now
        </button>
      </div>
    </div>
  );
};

