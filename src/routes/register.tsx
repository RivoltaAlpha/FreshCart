import { useState } from 'react';
import { User, Mail, Lock, Phone, Home, Eye, EyeOff } from 'lucide-react';
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner';
import { useRegister } from '@/hooks/useRegister';

export const Route = createFileRoute('/register')({
  component: RegisterPage,
})

function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    phone_number: '',
    town: '',
    county: '',
    country: '',
    role: 'Customer' as 'Customer' | 'Store' | 'Driver' | 'Admin',
  });
  const navigate = useNavigate();
  const registerMutation = useRegister();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const onRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      const response = await registerMutation.mutateAsync(formData);
      console.log("Register response:", response);
      toast.success("Registration successful!");

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
          console.error("Unknown role:", userRole);
          toast.error("Unknown user role");
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

  const onSwitchToLogin = () => {
    navigate({ to: '/login' });
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundImage: "url('/delivery.png')",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
      }}
    >
      <div className="bg-white lg:max-w-3xl rounded-2xl shadow-2xl p-8 md:w-full transform hover:scale-105 transition-transform duration-300">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#00A7B3] rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Join FreshCart</h1>
          <p className="text-gray-600">Create your farmer account</p>
        </div>

        <form onSubmit={onRegister} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="First name"
                  required
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="Last name"
                required
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                name="email"
                value={formData.email}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="Enter your email"
                required
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="tel"
                name="phone_number"
                value={formData.phone_number || ''}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="(555) 123-4567"
                required
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2"> Town</label>
            <div className="relative">
              <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                name="town"
                value={formData.town || ''}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="Nearest Town"
                required
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div className='flex gap-4'>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2"> County </label>
              <div className="relative">
                <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  name="county"
                  value={formData.county || ''}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  required
                  onChange={handleInputChange}
                >
                    <option value="">Select a county</option>
                    <option value="Baringo">Baringo</option>
                    <option value="Bomet">Bomet</option>
                    <option value="Bungoma">Bungoma</option>
                    <option value="Busia">Busia</option>
                    <option value="Elgeyo Marakwet">Elgeyo Marakwet</option>
                    <option value="Embu">Embu</option>
                    <option value="Garissa">Garissa</option>
                    <option value="Homa Bay">Homa Bay</option>
                    <option value="Isiolo">Isiolo</option>
                    <option value="Kajiado">Kajiado</option>
                    <option value="Kakamega">Kakamega</option>
                    <option value="Kericho">Kericho</option>
                    <option value="Kiambu">Kiambu</option>
                    <option value="Kilifi">Kilifi</option>
                    <option value="Kirinyaga">Kirinyaga</option>
                    <option value="Kisii">Kisii</option>
                    <option value="Kisumu">Kisumu</option>
                    <option value="Kitui">Kitui</option>
                    <option value="Kwale">Kwale</option>
                    <option value="Laikipia">Laikipia</option>
                    <option value="Lamu">Lamu</option>
                    <option value="Machakos">Machakos</option>
                    <option value="Makueni">Makueni</option>
                    <option value="Mandera">Mandera</option>
                    <option value="Marsabit">Marsabit</option>
                    <option value="Meru">Meru</option>
                    <option value="Migori">Migori</option>
                    <option value="Mombasa">Mombasa</option>
                    <option value="Murang'a">Murang'a</option>
                    <option value="Nairobi">Nairobi</option>
                    <option value="Nakuru">Nakuru</option>
                    <option value="Nandi">Nandi</option>
                    <option value="Narok">Narok</option>
                    <option value="Nyamira">Nyamira</option>
                    <option value="Nyandarua">Nyandarua</option>
                    <option value="Nyeri">Nyeri</option>
                    <option value="Samburu">Samburu</option>
                    <option value="Siaya">Siaya</option>
                    <option value="Taita Taveta">Taita Taveta</option>
                    <option value="Tana River">Tana River</option>
                    <option value="Tharaka Nithi">Tharaka Nithi</option>
                    <option value="Trans Nzoia">Trans Nzoia</option>
                    <option value="Turkana">Turkana</option>
                    <option value="Uasin Gishu">Uasin Gishu</option>
                    <option value="Vihiga">Vihiga</option>
                    <option value="Wajir">Wajir</option>
                    <option value="West Pokot">West Pokot</option>
                </select>
              </div>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2"> Country</label>
              <div className="relative">
                <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  name="country"
                  value={formData.country || ''}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  required
                >
                  <option value="Kenya">Kenya</option>
                  <option value="Uganda">Uganda</option>
                  <option value="Tanzania">Tanzania</option>
                  <option value="Rwanda">Rwanda</option>
                  <option value="South Africa">South Africa</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="Create a password"
                required
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

          <div className="flex items-center">
            <input type="checkbox" className="rounded border-gray-300 text-[#00A7B3] focus:ring-[#00A7B3]" required />
            <span className="ml-2 text-sm text-gray-600">
              I agree to the <a href="#" className="text-[#00A7B3] hover:text-[#008C9E]">Terms of Service</a> and <a href="#" className="text-[#00A7B3] hover:text-[#008C9E]">Privacy Policy</a>
            </span>
          </div>

          <button
            type="submit"
            className="w-full bg-[#00A7B3] text-white py-3 rounded-lg font-semibold hover:bg-[#008C9E] transform hover:scale-105 transition-all duration-200"
          >
            Create Account
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <button
              onClick={onSwitchToLogin}
              className="text-[#00A7B3] hover:text-[#008C9E] font-semibold"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;