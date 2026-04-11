import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { UserPlus, Navigation, ShieldCheck } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({
        firstname: '',
        lastname: '',
        email: '',
        phoneNumber: '',
        password: '',
        bloodGroup: '',
        city: '',
        pincode: '',
        role: 'DONOR',
        age: '',
        weight: '',
        gender: '',
        healthIssues: '',
        latitude: null,
        longitude: null
    });
    const [locationStatus, setLocationStatus] = useState('');
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const getLocation = () => {
        setLocationStatus('Locating...');
        if (!navigator.geolocation) {
            setLocationStatus('Geolocation is not supported by your browser');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setFormData({
                    ...formData,
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                });
                setLocationStatus('Location captured!');
            },
            () => {
                setLocationStatus('Unable to retrieve your location');
            }
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        setLoading(true);
        try {
            let payload = { ...formData, location: formData.city };
            
            // Auto-geocode if coordinates are missing
            if (!payload.latitude || !payload.longitude) {
                try {
                    const query = `${payload.city}${payload.pincode ? ', ' + payload.pincode : ''}, India`;
                    const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`, {
                        headers: { 'Accept-Language': 'en', 'User-Agent': 'BloodDropApp' }
                    });
                    const geoData = await geoRes.json();
                    if (geoData && geoData.length > 0) {
                        payload.latitude = parseFloat(geoData[0].lat);
                        payload.longitude = parseFloat(geoData[0].lon);
                    }
                } catch (geoErr) {
                    console.error("Auto-geocoding failed", geoErr);
                }
            }

            if (payload.role === 'DONOR') {
                payload.age = parseInt(payload.age);
                payload.weight = parseFloat(payload.weight);
            } else {
                payload.age = null;
                payload.weight = null;
                payload.gender = null;
                payload.healthIssues = null;
            }

            await register(payload);
            navigate('/dashboard');
        } catch (err) {
            console.error("Registration submit error:", err);
            let message = 'Registration failed. Please try again.';
            if (err.response && err.response.data) {
                if (typeof err.response.data === 'string') {
                    message = err.response.data;
                } else if (err.response.data.message) {
                    message = err.response.data.message;
                } else if (err.response.data.error) {
                    message = err.response.data.error;
                }
            } else if (err.message) {
                message = err.message;
            }
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto bg-white p-8 rounded-xl shadow-lg mt-6">
            <div className="text-center mb-6">
                <UserPlus className="mx-auto h-12 w-12 text-red-600" />
                <h2 className="text-3xl font-bold text-gray-900 mt-2">Create Account</h2>
                <p className="text-gray-600">Join the community</p>
            </div>
            {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm font-bold">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">First Name</label>
                        <input name="firstname" onChange={handleChange} required value={formData.firstname} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Last Name</label>
                        <input name="lastname" onChange={handleChange} required value={formData.lastname} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500" />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input type="email" name="email" onChange={handleChange} required value={formData.email} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                        <input type="tel" name="phoneNumber" onChange={handleChange} required value={formData.phoneNumber} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">City</label>
                        <div className="flex gap-2">
                            <input name="city" onChange={handleChange} required value={formData.city} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500" />
                            <button
                                type="button"
                                onClick={getLocation}
                                title="Get precise location"
                                className="mt-1 p-2 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-colors"
                            >
                                <Navigation size={20} className={formData.latitude ? 'text-green-600' : ''} />
                            </button>
                        </div>
                        {locationStatus && <p className="text-[10px] mt-1 text-gray-500">{locationStatus}</p>}
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Pin Code</label>
                        <input type="text" name="pincode" onChange={handleChange} value={formData.pincode} maxLength="6" placeholder="6-digit PIN" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500" />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Password</label>
                    <input type="password" name="password" onChange={handleChange} required value={formData.password} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Blood Group</label>
                        <select name="bloodGroup" onChange={handleChange} required value={formData.bloodGroup} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500">
                            <option value="">Select...</option>
                            <option value="A+">A+</option>
                            <option value="A-">A-</option>
                            <option value="B+">B+</option>
                            <option value="B-">B-</option>
                            <option value="AB+">AB+</option>
                            <option value="AB-">AB-</option>
                            <option value="O+">O+</option>
                            <option value="O-">O-</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Role</label>
                        <select name="role" onChange={handleChange} required value={formData.role} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500">
                            <option value="DONOR">Donor</option>
                            <option value="RECIPIENT">Recipient</option>
                        </select>
                    </div>
                </div>
                {formData.role === 'DONOR' && (
                    <>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Age</label>
                                <input type="number" name="age" onChange={handleChange} required value={formData.age} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Weight (kg)</label>
                                <input type="number" name="weight" onChange={handleChange} required value={formData.weight} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Gender</label>
                                <select name="gender" onChange={handleChange} required value={formData.gender} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500">
                                    <option value="">Select...</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Health Issues / Questions</label>
                            <textarea name="healthIssues" onChange={handleChange} value={formData.healthIssues} rows="2" placeholder="Diabetes, high blood pressure, recent surgery, infected disease?" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"></textarea>
                        </div>
                    </>
                )}
                <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 shadow-sm text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors">
                    {loading ? 'Registering...' : 'Register'}
                </button>
            </form>
        </div>
    );
};

export default Register;
