import { useState } from 'react';
import { User, Mail, Caravan, Clock10Icon } from 'lucide-react';
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner';
import { Footer } from '@/components/Footer';
import Header from '@/components/Header';
import { getCounties } from 'kenya-locations';
import { useCreateStore } from '@/hooks/useStore';

export const Route = createFileRoute('/verify-store')({
    component: RegisterPage,
})

function RegisterPage() {
    const storeOwner = localStorage.getItem('storeOwner');
    const owner_id = storeOwner ? JSON.parse(storeOwner).user_id : 0;
    const [formData, setFormData] = useState({
        "owner_id": owner_id,
        "name": "",
        "description": "",
        "town": "",
        "area": "",
        "county": "",
        "contact_info": "",
        "delivery_fee": 0,
        "store_code": "",
        "country": "Kenya",
        "image_url": "https://c.wallhere.com/photos/55/d0/barcelona_color_fruit_colore_flavor_100v10f_mercado_senses-819706.jpg",
        "delivery_time_minutes": 30,
        "rating": 2.0
    });

    const navigate = useNavigate();
    const createStoreMutation = useCreateStore();
    const [county, setCounty] = useState('');
    const counties = getCounties();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const onRegister = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        let submissionData = { ...formData };

        if (!submissionData.store_code) {
            const codeLength = Math.floor(Math.random() * 3) + 6; // 6-8 chars
            const randomCode = Array.from({ length: codeLength }, () =>
                "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[Math.floor(Math.random() * 36)]
            ).join('');
            submissionData.store_code = randomCode;
            setFormData(prev => ({
                ...prev,
                store_code: randomCode
            }));
        }

        console.log("Form data before submission:", submissionData);

        try {
            const response = await createStoreMutation.mutateAsync(submissionData);
            console.log("Register response:", response);
            toast.success("Registration successful!");
            localStorage.setItem('currentStore', JSON.stringify(response));
            navigate({ to: '/store/dashboard' });
        } catch (error: any) {
            console.error("Login error:", error);
            if (error.message && (error.message.includes('401') || error.message.includes('Invalid'))) {
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
            <Header />
            <div className="min-h-screen flex items-center justify-center py-10"
                style={{
                    backgroundImage: "url('/store.jpg')",
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "cover",
                }}
            >
                <div className="bg-white lg:max-w-2xl mx-4 rounded-2xl shadow-2xl p-8 md:w-full transform hover:scale-105 transition-transform duration-300">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-[#00A7B3] rounded-full flex items-center justify-center mx-auto mb-4">
                            <User className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">Join FreshCart Vendors</h1>
                        <p className="text-gray-600">Your new Shopping Experience</p>
                    </div>

                    <form onSubmit={onRegister} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2"> Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                    placeholder="First name"
                                    required
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                            <input
                                type="text"
                                name="description"
                                value={formData.description || ''}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                placeholder="Description"
                                required
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">County</label>
                                <select
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00A7B3] focus:border-transparent"
                                    value={formData.county}
                                    onChange={e => {
                                        setCounty(e.target.value);
                                        setFormData(prev => ({
                                            ...prev,
                                            county: e.target.value
                                        }));
                                    }}
                                    required
                                >
                                    <option value="">Select County</option>
                                    {counties.map((c: any) => (
                                        <option key={c.code} value={c.name}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">City | Town</label>
                                <input
                                    type="text"
                                    name="town"
                                    value={formData.town || ''}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                    placeholder="Your city or town"
                                    required
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Area</label>
                            <input
                                type="text"
                                name="area"
                                value={formData.area || ''}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                placeholder="Nearest Area around you"
                                required
                                onChange={handleInputChange}
                            />
                        </div>


                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Contact Information</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    name="contact_info"
                                    value={formData.contact_info || ''}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                    placeholder="Enter your email or phone number"
                                    required
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Shipping Fee </label>
                            <div className="relative">
                                <Caravan className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="number"
                                    name="delivery_fee"
                                    value={formData.delivery_fee === 0 ? '' : formData.delivery_fee}
                                    min={1}
                                    step={1}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                    placeholder="Enter delivery fee"
                                    required
                                    onChange={e => {
                                        const value = e.target.value;
                                        setFormData(prev => ({
                                            ...prev,
                                            delivery_fee: value === '' ? 0 : Number(value)
                                        }));
                                    }}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Estimation Time </label>
                            <div className="relative">
                                <Clock10Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="number"
                                    name="delivery_time"
                                    value={formData.delivery_time_minutes || ''}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                    placeholder="Enter delivery time in minutes"
                                    required
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-[#00A7B3] text-white py-3 rounded-lg font-semibold hover:bg-[#008C9E] transform hover:scale-105 transition-all duration-200"
                        >
                            Create Store
                        </button>
                    </form >

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
                </div >
            </div >
            <Footer />
        </>
    );
};

export default RegisterPage;