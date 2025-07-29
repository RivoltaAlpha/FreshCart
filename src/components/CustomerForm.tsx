import { useState } from 'react';
import { User, Mail, Lock, Phone, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner';
import { useRegister } from '@/hooks/useRegister';
import { getAreasInLocality, getLocalitiesInCounty, getSubCountiesInCounty, getCounties } from 'kenya-locations';

function CustomerForm() {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        phone_number: '',
        town: '',
        area: '',
        county: '',
        country: 'Kenya',
        role: 'Customer' as 'Customer' | 'Store' | 'Driver' | 'Admin',
    });
    const navigate = useNavigate();
    const registerMutation = useRegister();
    const [county, setCounty] = useState('');
    const [subCounty, setSubCounty] = useState('');
    const [localityName, setLocalityName] = useState('');
    const [area, setArea] = useState('');
    const counties = getCounties();
    const subCounties = county ? getSubCountiesInCounty(county) : [];
    const localities = subCounty ? getLocalitiesInCounty(county) : [];
    const areas = localityName ? getAreasInLocality(localityName) : [];

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
        <>
            <div className="bg-searchbar lg:max-w-3xl m-2 rounded-2xl shadow-2xl p-8 md:w-full transform hover:scale-105 transition-transform duration-300">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-[#00A7B3] rounded-full flex items-center justify-center mx-auto mb-4">
                        <User className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold mb-2">Join FreshCart</h1>
                    <p className="">Your new Shopping Experience</p>
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


                    <div className="space-y-2">
                        <select
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00A7B3] focus:border-transparent"
                            value={county}
                            onChange={e => {
                                setCounty(e.target.value);
                                setSubCounty('');
                                setLocalityName('');
                                setArea('');
                            }}
                            required
                        >
                            <option value="">Select County</option>
                            {counties.map((c: any) => (
                                <option key={c.code} value={c.name}>{c.name}</option>
                            ))}
                        </select>
                        {county && (
                            <select
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00A7B3] focus:border-transparent"
                                value={subCounty}
                                onChange={e => {
                                    setSubCounty(e.target.value);
                                    setLocalityName('');
                                    setArea('');
                                }}
                                required
                            >
                                <option value="">Select Sub-County</option>
                                {subCounties.map((sc: any) => (
                                    <option key={sc.code} value={sc.name}>{sc.name}</option>
                                ))}
                            </select>
                        )}
                        {subCounty && (
                            <select
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00A7B3] focus:border-transparent"
                                value={localityName}
                                onChange={e => {
                                    setLocalityName(e.target.value);
                                    setArea('');
                                }}
                                required
                            >
                                <option value="">Select Locality</option>
                                {localities.map((l: any, idx: number) => (
                                    <option key={l.name || idx} value={l.name || ''}>{l.name || ''}</option>
                                ))}
                            </select>
                        )}
                        {localityName && (
                            <select
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00A7B3] focus:border-transparent"
                                value={area}
                                onChange={e => setArea(e.target.value)}
                                required
                            >
                                <option value="">Select Area</option>
                                {areas.map((a: any, idx: number) => (
                                    <option key={a.name || a || idx} value={a.name || a || ''}>{a.name || a || ''}</option>
                                ))}
                            </select>
                        )}
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
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center">
                        <input type="checkbox" className="rounded border-gray-300 text-[#00A7B3] focus:ring-[#00A7B3]" required />
                        <span className="ml-2 text-sm ">
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

                <div className="mt-8 text-center gap-6 items-center">
                    <p className="">
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
        </>
    );
};

export default CustomerForm;
