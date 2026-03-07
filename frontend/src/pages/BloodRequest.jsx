import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Activity } from 'lucide-react';

const BloodRequest = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        patientName: '',
        bloodGroup: '',
        unitsRequired: '',
        hospitalName: '',
        city: '',
        contactNumber: '',
        urgency: 'HIGH'
    });
    const [status, setStatus] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/requests', formData);
            setStatus('success');
            setTimeout(() => navigate('/dashboard'), 2000);
        } catch (error) {
            console.error("Failed to create request", error);
            setStatus('error');
        }
    };

    return (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg mt-6">
            <div className="text-center mb-6">
                <Activity className="mx-auto h-12 w-12 text-red-600" />
                <h2 className="text-3xl font-bold text-gray-900 mt-2">Emergency Blood Request</h2>
                <p className="text-gray-600">Request blood for a patient in need</p>
            </div>
            {status === 'success' && <div className="bg-green-100 text-green-700 p-3 rounded mb-4 text-sm text-center font-bold">Request created successfully!</div>}
            {status === 'error' && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm text-center font-bold">Failed to create request.</div>}
            
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Patient Name</label>
                        <input name="patientName" onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Blood Group Needed</label>
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
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Units Required</label>
                        <input type="number" name="unitsRequired" onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Hospital Name</label>
                        <input name="hospitalName" onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500" />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">City</label>
                        <input name="city" onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Contact Number</label>
                        <input type="tel" name="contactNumber" onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500" />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Urgency Level</label>
                    <select name="urgency" onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500">
                        <option value="HIGH">High (Within 24 Hours)</option>
                        <option value="MEDIUM">Medium (Within 2-3 Days)</option>
                        <option value="LOW">Low (Not immediate)</option>
                    </select>
                </div>
                <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700">
                    Submit Blood Request
                </button>
            </form>
        </div>
    );
};

export default BloodRequest;
