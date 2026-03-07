import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { UserPlus } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({
        firstname: '',
        lastname: '',
        email: '',
        phoneNumber: '',
        password: '',
        bloodGroup: '',
        city: '',
        role: 'DONOR',
        age: '',
        weight: '',
        gender: '',
        healthIssues: ''
    });
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.role === 'DONOR') {
            if (parseInt(formData.age) < 18 || parseInt(formData.age) > 60) {
                setError('Age must be between 18 and 60');
                return;
            }
            if (parseInt(formData.weight) < 50) {
                setError('Weight must be at least 50 kg');
                return;
            }
        }

        try {
            await register({...formData, location: formData.city});
            navigate('/dashboard');
        } catch (err) {
            setError('Registration failed. Please try again.');
        }
    };

    return (
        <div className="max-w-lg mx-auto bg-white p-8 rounded-xl shadow-lg mt-6">
            <div className="text-center mb-6">
                <UserPlus className="mx-auto h-12 w-12 text-red-600" />
                <h2 className="text-3xl font-bold text-gray-900 mt-2">Create Account</h2>
                <p className="text-gray-600">Join the community</p>
            </div>
            {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">First Name</label>
                        <input name="firstname" onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Last Name</label>
                        <input name="lastname" onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500" />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input type="email" name="email" onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                        <input type="tel" name="phoneNumber" onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">City</label>
                        <input name="city" onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500" />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Password</label>
                    <input type="password" name="password" onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Blood Group</label>
                        <select name="bloodGroup" onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500">
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
                        <select name="role" onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500">
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
                                <input type="number" name="age" onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Weight (kg)</label>
                                <input type="number" name="weight" onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Gender</label>
                                <select name="gender" onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500">
                                    <option value="">Select...</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Health Issues / Questions</label>
                            <textarea name="healthIssues" onChange={handleChange} rows="2" placeholder="Diabetes, high blood pressure, recent surgery, infected disease?" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"></textarea>
                        </div>
                    </>
                )}
                <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                    Register
                </button>
            </form>
        </div>
    );
};

export default Register;
