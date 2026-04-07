import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Activity, Navigation } from 'lucide-react';

const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

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
    const [userLocation, setUserLocation] = useState({ latitude: null, longitude: null });
    const [donors, setDonors] = useState([]);
    const [map, setMap] = useState(null);
    const [markers, setMarkers] = useState([]);

    useEffect(() => {
        if (user && user.latitude && !userLocation.latitude) {
            setUserLocation({ latitude: user.latitude, longitude: user.longitude });
            setFormData(prev => ({ ...prev, latitude: user.latitude, longitude: user.longitude, city: user.city || prev.city }));
            setLocationStatus('Using registered location');
        } else if (user && !userLocation.latitude) {
            setFormData(prev => ({ ...prev, city: user.city || prev.city, contactNumber: user.phoneNumber || prev.contactNumber, patientName: user.name || prev.patientName }));
        }
    }, [user]);

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
            async (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                setFormData(prev => ({ ...prev, latitude: lat, longitude: lon }));
                setUserLocation({ latitude: lat, longitude: lon });
                setLocationStatus('Location captured!');
            },
            () => setLocationStatus('Unable to retrieve your location')
        );
    };

    useEffect(() => {
        if (userLocation.latitude) {
            api.get('/donors/search', {
                params: { latitude: userLocation.latitude, longitude: userLocation.longitude, bloodGroup: formData.bloodGroup }
            }).then(res => setDonors(res.data)).catch(console.error);
        }
    }, [formData.bloodGroup, userLocation.latitude]);

    useEffect(() => {
        const initMap = () => {
            const mapElement = document.getElementById('req-map-container');
            if (!map && window.L && mapElement) {
                try {
                    const initialMap = window.L.map(mapElement).setView([20.5937, 78.9629], 5);
                    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        attribution: '&copy; OpenStreetMap contributors'
                    }).addTo(initialMap);
                    setMap(initialMap);
                } catch (err) {
                    console.error("Map initialization failed:", err);
                }
            }
        };
        const timer = setTimeout(initMap, 100);
        return () => { clearTimeout(timer); if (map) { map.remove(); setMap(null); } };
    }, [map]);

    useEffect(() => {
        if (!map || !window.L) return;
        
        markers.forEach(m => m.remove());
        const newMarkers = [];

        if (userLocation.latitude && userLocation.longitude) {
            const userIcon = window.L.divIcon({
                className: 'custom-div-icon',
                html: `<div style="background-color: #3b82f6; width: 15px; height: 15px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.3);"></div>`,
                iconSize: [15, 15],
                iconAnchor: [7, 7]
            });
            const userMarker = window.L.marker([userLocation.latitude, userLocation.longitude], {
                icon: userIcon, zIndexOffset: 1000
            }).addTo(map).bindPopup("<b style='color: #3b82f6;'>You are here</b>");
            newMarkers.push(userMarker);
        }

        donors.forEach(donor => {
            const dLat = donor.latitude;
            const dLon = donor.longitude;
            if (dLat && dLon) {
                if (userLocation.latitude && userLocation.longitude) {
                    const dist = calculateDistance(userLocation.latitude, userLocation.longitude, dLat, dLon);
                    if (dist < 200) { 
                        const line = window.L.polyline(
                            [[userLocation.latitude, userLocation.longitude], [dLat, dLon]],
                            { color: '#ef4444', weight: 4, opacity: 0.8, dashArray: '10, 10', lineJoin: 'round' }
                        ).addTo(map);
                        newMarkers.push(line);
                        
                        const midPoint = [(userLocation.latitude + dLat) / 2, (userLocation.longitude + dLon) / 2];
                        const distanceMarker = window.L.marker(midPoint, {
                            icon: window.L.divIcon({
                                className: 'distance-label',
                                html: `<div style="background: white; padding: 2px 6px; border-radius: 12px; border: 1px solid #ef4444; color: #ef4444; font-weight: bold; font-size: 10px; white-space: nowrap; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">Distance: ${dist.toFixed(1)} km</div>`,
                                iconSize: [80, 20], iconAnchor: [40, 10]
                            })
                        }).addTo(map);
                        newMarkers.push(distanceMarker);
                    }
                }

                const donorIcon = window.L.divIcon({
                    className: 'custom-div-icon',
                    html: `<div style="background-color: #ef4444; width: 15px; height: 15px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 8px rgba(0,0,0,0.3);"></div>`,
                    iconSize: [15, 15], iconAnchor: [7, 7]
                });

                const marker = window.L.marker([dLat, dLon], { icon: donorIcon }).addTo(map).bindPopup(`
                    <div style="font-family: 'Inter', sans-serif; min-width: 100px; padding: 2px;">
                        <b style="color: #dc2626; font-size: 13px;">${donor.name}</b>
                        <div style="font-weight: 700; font-size: 11px;">${donor.bloodGroup}</div>
                    </div>
                `, { closeButton: false });
                newMarkers.push(marker);
            }
        });

        if (newMarkers.length > 0) {
            try {
                const layerGroup = window.L.featureGroup(newMarkers.filter(m => m instanceof window.L.Layer));
                if (layerGroup.getBounds().isValid()) {
                    map.fitBounds(layerGroup.getBounds().pad(0.2), { animate: true });
                }
            } catch (e) {
                if (userLocation.latitude) map.setView([userLocation.latitude, userLocation.longitude], 11);
            }
        } else if (userLocation.latitude) {
            map.setView([userLocation.latitude, userLocation.longitude], 11);
        }

        setMarkers(newMarkers);
    }, [donors, map, userLocation]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const submissionData = {
                ...formData,
                unitsRequired: parseInt(formData.unitsRequired),
                isUrgent: formData.urgency === 'HIGH'
            };
            await api.post('/requests', submissionData);
            setStatus('success');
            setTimeout(() => navigate('/dashboard'), 2000);
        } catch (error) {
            console.error("Failed to create request", error);
            setStatus('error');
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
            {status === 'error' && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm text-center font-bold">Failed to create request.</div>}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                            <div className="flex gap-2">
                                <input name="city" onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500" />
                                <button 
                                    type="button" 
                                    onClick={getLocation}
                                    title="Get precise location for map"
                                    className={`mt-1 px-4 py-2 flex items-center gap-1 text-sm font-bold rounded-md ${formData.latitude ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'} hover:bg-gray-200 transition-colors whitespace-nowrap`}
                                >
                                    <Navigation size={16} /> Near Me
                                </button>
                            </div>
                            {locationStatus && <p className="text-[10px] mt-1 text-gray-500">{locationStatus}</p>}
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
                    <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 mt-4">
                        Submit Blood Request
                    </button>
                </form>

                <div className="bg-gray-50 p-4 rounded-xl shadow-inner border border-gray-100 flex flex-col min-h-[400px]">
                    <h3 className="text-sm font-bold text-gray-700 mb-2">Live Location & Nearby Donors</h3>
                    <div className="flex-1 bg-white rounded-lg border border-gray-200 overflow-hidden relative">
                        {!userLocation.latitude && (
                            <div className="absolute inset-0 z-10 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
                                <Navigation className="h-8 w-8 text-gray-400 mb-2" />
                                <p className="text-sm text-gray-600 font-medium">Click the location button next to 'City' to view nearby donors automatically</p>
                            </div>
                        )}
                        <div className="w-full h-full z-0" id="req-map-container" style={{ minHeight: '300px' }}></div>
                    </div>
                    {userLocation.latitude && (
                        <div className="mt-3 text-xs text-gray-500 flex items-center justify-between px-2">
                            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"></div> You</div>
                            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-600"></div> Donors</div>
                            <div className="flex items-center gap-1"><div className="w-4 h-0.5 border-t border-dashed border-red-400"></div> Connection</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BloodRequest;
