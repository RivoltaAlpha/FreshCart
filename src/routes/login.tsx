import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Smartphone } from 'lucide-react';
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner';
import { useLogin } from '@/hooks/useLogin';

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const navigate = useNavigate();
  const loginMutation = useLogin();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const onLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      const response = await loginMutation.mutateAsync(formData);
      console.log("Login response:", response);
      toast.success("Login successful!");

      let userRole = response.user?.role || response.data?.user?.role;
      // Normalize role to capitalize first letter
      if (typeof userRole === 'string') {
        userRole = userRole.charAt(0).toUpperCase() + userRole.slice(1).toLowerCase();
      }
      switch (userRole) {
        case 'Admin':
          navigate({ to: '/admin/dashboard' });
          break;
        case 'Store':
          navigate({ to: '/store/dashboard' });
          break;
        case 'Customer':
          navigate({ to: '/customer/dashboard' });
          break;
        case 'Driver':
          navigate({ to: '/driver/dashboard' });
          break;
        default:
          toast.error("Unknown user role");
          navigate({ to: '/'})
          console.error("Unknown role:", userRole);
          break;
      }
    } catch (error: any) {
      console.error("Login error:", error);
      if (error.message.includes('401') || error.message.includes('Invalid')) {
        toast.error("Invalid email or password");
      } else {
        toast.error(error.message || "An unexpected error occurred");
      }
    }
  };

  const onSwitchToRegister = () => {
    navigate({ to: '/register' });
  }

  return (
    <div className="min-h-screen flex items-center justify-center "
      style={{
        backgroundImage: "url('./login.png')",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md transform hover:scale-105 transition-transform duration-300">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Smartphone className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to FreshCart</p>
        </div>

        <form onSubmit={onLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                name="email"
                value={formData.email}
                type="email"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter your email"
                required
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter your password"
                required
                value={formData.password}
                onChange={handleInputChange}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              <span className="ml-2 text-sm text-gray-600">Remember me</span>
            </label>
            <a href="#" className="text-sm text-blue-600 hover:text-blue-500">Forgot password?</a>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-blue-600 transform hover:scale-105 transition-all duration-200"
          >
            Sign In
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <button
              onClick={onSwitchToRegister}
              className="text-blue-600 hover:text-blue-500 font-semibold"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;