import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Activity, MapPin, Navigation } from 'lucide-react';

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
        urgency: 'HIGH',
        latitude: null,
        longitude: null
    });
    const [status, setStatus] = useState('');
    const [locationStatus, setLocationStatus] = useState('');
    const [map, setMap] = useState(null);
    const [marker, setMarker] = useState(null);

    // Initialize Map
    useEffect(() => {
        const initMap = () => {
            const mapElement = document.getElementById('request-map-container');
            if (!map && window.L && mapElement) {
                try {
                    const initialMap = window.L.map(mapElement).setView([20.5937, 78.9629], 5);
                    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        attribution: '&copy; OpenStreetMap contributors'
                    }).addTo(initialMap);

                    initialMap.on('click', (e) => {
                        const { lat, lng } = e.latlng;
                        setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
                        setLocationStatus('Location manually set');
                    });

                    setMap(initialMap);
                } catch (err) {
                    console.error("Map initialization failed:", err);
                }
            }
        };

        const timer = setTimeout(initMap, 100);
        return () => clearTimeout(timer);
    }, [map]);

    // Update marker when coordinates change
    useEffect(() => {
        if (!map || !window.L) return;
        
        if (marker) {
            marker.remove();
        }

        if (formData.latitude && formData.longitude) {
            const newMarker = window.L.marker([formData.latitude, formData.longitude], {
                icon: window.L.divIcon({
                    className: 'custom-div-icon',
                    html: `<div style="background-color: #ef4444; width: 15px; height: 15px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.3);"></div>`,
                    iconSize: [15, 15],
                    iconAnchor: [7, 7]
                })
            }).addTo(map);
            setMarker(newMarker);
            map.setView([formData.latitude, formData.longitude], 13);
        }
    }, [formData.latitude, formData.longitude, map]);

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
                setLocationStatus('Unable to retrieve your location'); // Renders in red due to dynamic class
            }
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.latitude || !formData.longitude) {
            setStatus('Please select a location on the map or use the Locate Me button.');
            return;
        }

        const submissionData = {
            ...formData,
            unitsRequired: parseInt(formData.unitsRequired),
            isUrgent: formData.urgency === 'HIGH'
        };
        
        try {
            await api.post('/requests', submissionData);
            setStatus('success');
            setTimeout(() => navigate('/dashboard'), 2000);
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.response?.data || error.message;
            setStatus(typeof errorMsg === 'string' ? errorMsg : 'Failed to create request.');
        }
    };

    return (
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg mt-6">
            <div className="text-center mb-6">
                <Activity className="mx-auto h-12 w-12 text-red-600" />
                <h2 className="text-3xl font-bold text-gray-900 mt-2">Emergency Blood Request</h2>
                <p className="text-gray-600">Request blood for a patient in need</p>
            </div>
            {status === 'success' && <div className="bg-green-100 text-green-700 p-3 rounded mb-4 text-sm text-center font-bold">Request created successfully!</div>}
            {status && status !== 'success' && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm text-center font-bold">{status}</div>}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column: Form Fields */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Patient Name</label>
                                <input name="patientName" onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500" value={formData.patientName} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Blood Group Needed</label>
                                <select name="bloodGroup" onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500" value={formData.bloodGroup}>
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
                                <input type="number" name="unitsRequired" onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500" value={formData.unitsRequired} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Hospital Name</label>
                                <input name="hospitalName" onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500" value={formData.hospitalName} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">City</label>
                                <input name="city" onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500" value={formData.city} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Contact Number</label>
                                <input type="tel" name="contactNumber" onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500" value={formData.contactNumber} />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Urgency Level</label>
                            <select name="urgency" onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500" value={formData.urgency}>
                                <option value="HIGH">High (Within 24 Hours)</option>
                                <option value="MEDIUM">Medium (Within 2-3 Days)</option>
                                <option value="LOW">Low (Not immediate)</option>
                            </select>
                        </div>
                    </div>

                    {/* Right Column: Map Integration */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-sm font-medium text-gray-700">Exact Location (Required)</label>
                            <button
                                type="button"
                                onClick={getLocation}
                                className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded hover:bg-blue-100 transition-colors"
                            >
                                <Navigation size={14} /> Locate Me
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mb-2">Click on the map or use Locate Me to pinpoint the hospital.</p>
                        
                        <div className="relative border border-gray-300 rounded-lg overflow-hidden h-[250px] w-full shadow-inner">
                            <div id="request-map-container" className="absolute inset-0 w-full h-full z-0 cursor-crosshair"></div>
                        </div>
                        
                        {locationStatus && (
                            <p className={`text-xs mt-1 font-medium ${locationStatus.includes('Unable') || locationStatus.includes('not supported') ? 'text-red-500' : 'text-green-600'}`}>
                                {locationStatus}
                            </p>
                        )}
                        
                        {formData.latitude && formData.longitude && (
                            <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                                <MapPin size={12} className="text-red-500" />
                                Selected: {formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)}
                            </p>
                        )}
                    </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                    <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-red-600 hover:bg-red-700 transition-colors">
                        Submit Emergency Blood Request
                    </button>
                </div>
            </form>
        </div>
    );
};

export default BloodRequest;
