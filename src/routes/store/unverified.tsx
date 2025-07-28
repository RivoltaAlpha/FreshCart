import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/store/unverified')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md border border-gray-100 text-center">
        <svg
          className="mx-auto mb-4 h-16 w-16 text-yellow-400"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h1 className="text-2xl font-bold text-fresh-primary mb-2">
          Store Under Review
        </h1>
        <p className="text-fresh-secondary mb-4">
          Your store is currently under review by our team.
        </p>
        <p className="text-gray-600 mb-6">
          You will be able to operate and start selling once your store is verified. We appreciate your patience!
        </p>
        <div className="text-sm text-gray-400">
          Need help? <a href="/support" className="text-fresh-primary underline">Contact support</a>
          <br />
          <a href="/terms" className="text-fresh-primary underline">Terms of Service</a>
        </div>
      </div>
    </div>

    );
}