import { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Search, MapPin, Droplets, Phone, X, Navigation, Mail } from 'lucide-react';

const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

const SearchDonors = () => {
    const { user } = useContext(AuthContext);
    const [donors, setDonors] = useState([]);
    const [realUserLocation, setRealUserLocation] = useState({ latitude: null, longitude: null });
    const displayUserLat = user?.latitude || realUserLocation.latitude;
    const displayUserLon = user?.longitude || realUserLocation.longitude;
    const [bloodGroup, setBloodGroup] = useState('');
    const [location, setLocation] = useState('');
    const [pincode, setPincode] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedDonor, setSelectedDonor] = useState(null);
    const [messageForm, setMessageForm] = useState({
        senderName: user?.name || '',
        contactNumber: user?.phoneNumber || '',
        message: ''
    });
    const [messageStatus, setMessageStatus] = useState('');
    const [userLocation, setUserLocation] = useState({ latitude: null, longitude: null });

    const [locationStatus, setLocationStatus] = useState('');
    const [map, setMap] = useState(null);
    const [markers, setMarkers] = useState([]);
    const [focusedDonorId, setFocusedDonorId] = useState(null);

    // Sync form with user context
    useEffect(() => {
        if (user) {
            setMessageForm(prev => ({
                ...prev,
                senderName: user.name || '',
                contactNumber: user.phoneNumber || ''
            }));

            if (user.latitude && user.longitude && !userLocation.latitude) {
                console.log("Initializing userLocation from profile:", user.latitude, user.longitude);
                setUserLocation({ latitude: user.latitude, longitude: user.longitude });
                setRealUserLocation({ latitude: user.latitude, longitude: user.longitude });
            } else if (!userLocation.latitude && (user.location || user.city)) {
                // Placeholder for future geocoding based on user.location/city if coords not available
                // For now, it will rely on getLocation() or manual search.
            }
        }
    }, [user]);



    // Initialize Map
    useEffect(() => {
        const initMap = () => {
            const mapElement = document.getElementById('map-container');
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
        return () => {
            clearTimeout(timer);
            if (map) {
                map.remove();
                setMap(null);
            }
        };
    }, [map]);

    // Update markers and lines
    useEffect(() => {
        if (!map || !window.L) return;

        markers.forEach(m => m.remove());
        const newMarkers = [];

        // 1. Add User Marker (Blue Circle) - ALWAYS at their LIVE/PROFILE LOCATION ONLY

        if (displayUserLat && displayUserLon) {
            const userIcon = window.L.divIcon({
                className: 'custom-div-icon',
                html: `<div style="background-color: #3b82f6; width: 15px; height: 15px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.3);"></div>`,
                iconSize: [15, 15],
                iconAnchor: [7, 7]
            });

            const userMarker = window.L.marker([displayUserLat, displayUserLon], {
                icon: userIcon,
                zIndexOffset: 1000
            })
                .addTo(map)
                .bindPopup("<b style='color: #3b82f6;'>You are here</b>");
            newMarkers.push(userMarker);
        }

        // 2. Donor Markers & Lines
        donors.forEach(donor => {
            const dLat = donor.latitude;
            const dLon = donor.longitude;

            if (dLat !== null && dLat !== undefined && dLon !== null && dLon !== undefined) {
                const isFocused = focusedDonorId === donor.id;

                // CONNECTION LINE - Triggered when donor is focused/clicked
                if (isFocused && displayUserLat && displayUserLon) {
                    const line = window.L.polyline(
                        [[displayUserLat, displayUserLon], [dLat, dLon]],
                        { color: '#ef4444', weight: 4, opacity: 0.8, dashArray: '10, 10' }
                    ).addTo(map);
                    newMarkers.push(line);

                    const dist = calculateDistance(displayUserLat, displayUserLon, dLat, dLon);
                    const midPoint = [(displayUserLat + dLat) / 2, (displayUserLon + dLon) / 2];

                    const distanceMarker = window.L.marker(midPoint, {
                        icon: window.L.divIcon({
                            className: 'distance-label',
                            html: `<div style="background: white; padding: 2px 8px; border-radius: 12px; border: 1px solid #ef4444; color: #ef4444; font-weight: bold; font-size: 11px; white-space: nowrap; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">${dist.toFixed(1)} km</div>`,
                            iconSize: [70, 24],
                            iconAnchor: [35, 12]
                        })
                    }).addTo(map);
                    newMarkers.push(distanceMarker);
                }

                const donorIcon = window.L.divIcon({
                    className: 'custom-div-icon',
                    html: `<div style="background-color: ${isFocused ? '#ef4444' : '#dc2626'}; width: ${isFocused ? '20px' : '15px'}; height: ${isFocused ? '20px' : '15px'}; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 8px rgba(0,0,0,0.3); transition: all 0.3s ease;"></div>`,
                    iconSize: [isFocused ? 20 : 15, isFocused ? 20 : 15],
                    iconAnchor: [isFocused ? 10 : 7, isFocused ? 10 : 7]
                });

                const marker = window.L.marker([dLat, dLon], { icon: donorIcon })
                    .addTo(map)
                    .on('click', () => setFocusedDonorId(donor.id))
                    .bindPopup(`
                    <div style="font-family: 'Inter', sans-serif; min-width: 140px; padding: 4px;">
                        <b style="color: #dc2626; font-size: 14px; display: block; margin-bottom: 4px;">${donor.name}</b>
                        <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
                            <span style="background: #fee2e2; color: #dc2626; padding: 2px 6px; border-radius: 4px; font-weight: 700; font-size: 11px;">${donor.bloodGroup}</span>
                            <span style="color: #6b7280; font-size: 11px;">${donor.city || donor.location || ''}</span>
                        </div>
                         ${displayUserLat ? `<div style="border-top: 1px solid #f3f4f6; padding-top: 4px; mt-2 font-weight: 600; color: #111827; font-size: 12px;">Distance: ${calculateDistance(displayUserLat, displayUserLon, dLat, dLon).toFixed(2)} km</div>` : ''}
                    </div>
                `, { closeButton: false });

                if (isFocused) marker.openPopup();
                newMarkers.push(marker);
            }
        });

        // 3. View Adjustment
        if (focusedDonorId) {
            const focusedDonor = donors.find(d => d.id === focusedDonorId);
            if (focusedDonor && focusedDonor.latitude && focusedDonor.longitude) {
                if (displayUserLat && displayUserLon) {
                    const bounds = window.L.latLngBounds([[displayUserLat, displayUserLon], [focusedDonor.latitude, focusedDonor.longitude]]);
                    map.fitBounds(bounds.pad(0.3), { animate: true });
                } else {
                    map.setView([focusedDonor.latitude, focusedDonor.longitude], 13, { animate: true });
                }
            }
        } else if (newMarkers.length > 0) {
            const validMarkers = newMarkers.filter(m => m instanceof window.L.Layer);
            if (validMarkers.length > 0) {
                const group = window.L.featureGroup(validMarkers);
                if (group.getBounds().isValid()) map.fitBounds(group.getBounds().pad(0.2), { animate: true });
            }
        } else if (displayUserLat) {
            map.setView([displayUserLat, displayUserLon], 11);
        }

        setMarkers(newMarkers);
    }, [donors, map, userLocation, realUserLocation, focusedDonorId]);

    const geocodeMissingDonors = async (donorList) => {
        donorList.forEach(async (donor, index) => {
            if (!donor.latitude && (donor.pincode || donor.city)) {
                try {
                    // Staggered delay to respect Nominatim rate limit (1 req/sec)
                    await new Promise(resolve => setTimeout(resolve, index * 1200));
                    
                    // Try multiple query formats for better results
                    const queries = [];
                    if (donor.pincode) queries.push(`postalcode=${donor.pincode}&countrycodes=in`);
                    queries.push(`q=${encodeURIComponent(`${donor.city || donor.location || ''}${donor.pincode ? ' ' + donor.pincode : ''}, India`)}`);

                    for (const query of queries) {
                        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&${query}&limit=1`, {
                            headers: { 'User-Agent': 'BloodDropApp' }
                        });
                        const data = await res.json();
                        
                        if (data && data.length > 0) {
                            const lat = parseFloat(data[0].lat);
                            const lon = parseFloat(data[0].lon);
                            setDonors(prev => prev.map(d => d.id === donor.id ? { ...d, latitude: lat, longitude: lon } : d));
                            break; // Success!
                        }
                        // Small wait between retries if first query format failed
                        await new Promise(resolve => setTimeout(resolve, 500));
                    }
                } catch (err) {
                    console.error("Geocoding failed for donor", donor.id, err);
                }
            }
        });
    };
    const handleSearch = async (e, lat, lon) => {
        if (e) e.preventDefault();
        setLoading(true);
        try {
            let searchLat = lat;
            let searchLon = lon;
            const isExplicitCoords = lat !== undefined;

            // Geocode explicit search text if they typed a string and are not explicitly clicking/supplying coordinates right now
            if (!isExplicitCoords && location) {
                try {
                    setLocationStatus('Searching location...');
                    const query = `${location}, India`;
                    const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`, {
                        headers: { 'Accept-Language': 'en', 'User-Agent': 'BloodDropApp' }
                    });
                    const geoData = await geoRes.json();

                    if (geoData && geoData.length > 0) {
                        searchLat = parseFloat(geoData[0].lat);
                        searchLon = parseFloat(geoData[0].lon);
                        setLocationStatus(`Location found: ${geoData[0].display_name.split(',')[0]}`);
                    }
                } catch (geoErr) {
                    console.error("Geocoding failed", geoErr);
                }
            }

            // Geocode pincode if provided and no explicit coordinates or location text
            if (!isExplicitCoords && pincode && !location) {
                try {
                    setLocationStatus('Geocoding pincode...');
                    const fetchWithRetry = async (url, retries = 2) => {
                        for (let i = 0; i < retries; i++) {
                            try {
                                const res = await fetch(url, { headers: { 'User-Agent': 'BloodDropApp' } });
                                if (res.status === 200) return await res.json();
                                if (res.status === 429 || res.status === 403) await new Promise(r => setTimeout(r, 2000));
                            } catch (e) {
                                await new Promise(r => setTimeout(r, 1000));
                            }
                        }
                        throw new Error('Geocoding service busy');
                    };
                    const geoData = await fetchWithRetry(`https://nominatim.openstreetmap.org/search?format=json&postalcode=${pincode}&countrycodes=in&limit=1`);
                    if (geoData && geoData.length > 0) {
                        searchLat = parseFloat(geoData[0].lat);
                        searchLon = parseFloat(geoData[0].lon);
                        setLocationStatus(`Pincode area found: ${geoData[0].display_name.split(',')[0]}`);
                    } else {
                        setLocationStatus('Could not locate pincode. Searching by name.');
                    }
                } catch (geoErr) {
                    console.error("Pincode geocoding failed", geoErr);
                    setLocationStatus('Geocoding unavailable');
                }
            }

            const params = { bloodGroup, location, pincode };
            
            // For SORTING, we always pass YOUR location (the blue dot baseline) to the backend
            if (displayUserLat && displayUserLon) {
                params.latitude = displayUserLat;
                params.longitude = displayUserLon;
            }

            const response = await api.get('/donors/search', { params });
            
            // Sort by shortest distance to REAL user location
            let fetchedDonors = response.data;
            if (displayUserLat && displayUserLon) {
                fetchedDonors.sort((a, b) => {
                    const distA = calculateDistance(displayUserLat, displayUserLon, a.latitude, a.longitude);
                    const distB = calculateDistance(displayUserLat, displayUserLon, b.latitude, b.longitude);
                    return distA - distB;
                });
            }
            
            setDonors(fetchedDonors);
            // After setting donors, attempt to geocode any missing coordinates
            geocodeMissingDonors(fetchedDonors);

            if (response.data.length === 1) {
                setFocusedDonorId(response.data[0].id);
            } else {
                setFocusedDonorId(null);
            }
            if (lat !== undefined) setLocationStatus('Location acquired');
        } catch (error) {
            console.error("Failed to fetch donors", error);
            if (lat !== undefined) setLocationStatus('Failed to locate');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (realUserLocation.latitude && realUserLocation.longitude && donors.length === 0 && !loading) {
            handleSearch(null, realUserLocation.latitude, realUserLocation.longitude);
        }
    }, [realUserLocation.latitude]);

    const getLocation = () => {
        setLocationStatus('Locating...');
        if (!navigator.geolocation) {
            setLocationStatus('Not supported');
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                setUserLocation({ latitude: lat, longitude: lon });
                setRealUserLocation({ latitude: lat, longitude: lon });
                handleSearch(null, lat, lon);
            },
            () => setLocationStatus('Permission denied')
        );
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        try {
            await api.post('/message/send', {
                donorId: selectedDonor.id,
                senderId: user?.id,
                ...messageForm
            });
            setMessageStatus('Message sent successfully!');
            setTimeout(() => {
                setSelectedDonor(null);
                setMessageStatus('');
                setMessageForm({ senderName: user?.name || '', contactNumber: user?.phoneNumber || '', message: '' });
            }, 2000);
        } catch (error) {
            console.error("Failed to send message", error);
            setMessageStatus('Failed to send message.');
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-red-600">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <Search className="text-red-600" /> Search Donors
                </h2>
                <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Blood Group</label>
                        <select
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500"
                            value={bloodGroup}
                            onChange={(e) => setBloodGroup(e.target.value)}
                        >
                            <option value="">Any</option>
                            <option value="A+">A+</option><option value="A-">A-</option>
                            <option value="B+">B+</option><option value="B-">B-</option>
                            <option value="AB+">AB+</option><option value="AB-">AB-</option>
                            <option value="O+">O+</option><option value="O-">O-</option>
                        </select>
                    </div>
                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-700">Location</label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    placeholder="City or Area"
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-red-500"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                />
                                <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                            </div>
                            <button
                                type="button"
                                onClick={getLocation}
                                className={`px-4 py-2 flex items-center gap-1 text-sm font-bold rounded-md ${displayUserLat ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'} hover:bg-gray-200 transition-colors self-end h-10 whitespace-nowrap`}
                            >
                                <Navigation size={16} /> Near Me
                            </button>
                        </div>
                        {locationStatus && <p className="text-[10px] absolute -bottom-4 text-gray-400">{locationStatus}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Pin Code</label>
                        <input
                            type="text"
                            placeholder="6-digit PIN"
                            maxLength="6"
                            className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-red-500"
                            value={pincode}
                            onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                        />
                    </div>
                    <div className="flex items-end">
                        <button
                            type="submit"
                            className="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 font-bold h-10 shadow-sm"
                            disabled={loading}
                        >
                            {loading ? 'Searching...' : 'Find Donors'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Map Container */}
            <div className="bg-white p-2 rounded-xl shadow-md border border-gray-100 overflow-hidden">
                <div className="h-64 sm:h-80 w-full rounded-lg z-0" id="map-container"></div>
                <div className="p-3 text-xs text-gray-500 flex items-center gap-4 justify-center">
                    <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"></div> You</div>
                    <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-600"></div> Donors</div>
                    <div className="flex items-center gap-1"><div className="w-4 h-0.5 border-t border-dashed border-red-400"></div> Selected Connection</div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {donors.map(donor => (
                    <div
                        key={donor.id}
                        onClick={() => donor.latitude && setFocusedDonorId(donor.id)}
                        className={`bg-white p-6 rounded-lg shadow-md border-t-4 transition-all cursor-pointer relative overflow-hidden ${focusedDonorId === donor.id ? 'border-red-600 scale-[1.02] shadow-xl' : 'border-red-500 hover:shadow-lg'}`}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h3 className="text-xl font-bold truncate pr-4">{donor.name}</h3>
                                <p className="text-gray-500 text-sm flex items-center gap-1 mt-1 lowercase">
                                    <MapPin size={14} /> {donor.city || donor.location || 'Unknown'}
                                </p>
                            </div>
                            <div className="flex flex-col items-end gap-2 shrink-0">
                                <span className="bg-red-100 text-red-800 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-sm">
                                    <Droplets size={14} /> {donor.bloodGroup}
                                </span>
                                {donor.latitude && donor.longitude && (
                                    <div className="flex items-center gap-1 text-[9px] font-black text-red-600 uppercase tracking-widest bg-red-50/50 px-2 py-1 rounded-lg border border-red-100/50">
                                        <Navigation size={10} className="rotate-45" />
                                        {calculateDistance(displayUserLat, displayUserLon, donor.latitude, donor.longitude).toFixed(1)} km
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-4 text-xs">
                            <span className={`px-2.5 py-1 rounded-full font-bold shadow-sm ${donor.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {donor.available ? 'Available' : 'Busy'}
                            </span>
                        </div>

                        {donor.phoneNumber && (
                            <div className="mt-5 p-4 bg-gray-50/30 border border-gray-100 rounded-2xl flex flex-col gap-4 group/phone hover:border-red-100 transition-all shadow-sm">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 leading-none">Contact Number</span>
                                    <span className="text-sm font-bold text-gray-800 font-mono flex items-center gap-3">
                                        <div className="p-1.5 bg-red-50 text-red-500 rounded-lg">
                                            <Phone size={14} />
                                        </div>
                                        {donor.phoneNumber}
                                    </span>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedDonor(donor);
                                    }}
                                    className="w-full py-3 bg-red-600 text-white text-[10px] font-black rounded-xl hover:bg-red-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-200/50 active:scale-95 uppercase tracking-widest border border-red-600"
                                    title={`Message ${donor.name}`}
                                >
                                    <Mail size={14} />
                                    Message
                                </button>
                            </div>
                        )}
                    </div>
                ))}
                {donors.length === 0 && !loading && (
                    <div className="col-span-full text-center py-24 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 text-gray-400">
                        <Droplets size={48} className="mx-auto mb-4 opacity-20" />
                        No donors found matching your criteria.
                    </div>
                )}
            </div>

            {selectedDonor && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full relative shadow-2xl">
                        <button
                            onClick={() => setSelectedDonor(null)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <X size={24} />
                        </button>
                        <div className="text-center mb-6">
                            <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                                <Mail size={32} />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900">Message to {selectedDonor.name}</h3>
                            <p className="text-gray-500">The donor will receive your details</p>
                        </div>
                        {messageStatus && (
                            <div className={`mb-6 p-4 text-center font-bold rounded-xl ${messageStatus.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {messageStatus}
                            </div>
                        )}
                        <form onSubmit={handleSendMessage} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700">Your Name</label>
                                <input required type="text" className="block w-full px-4 py-2 border rounded-xl focus:ring-red-500" value={messageForm.senderName} onChange={e => setMessageForm({ ...messageForm, senderName: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700">Contact Number</label>
                                <input required type="tel" className="block w-full px-4 py-2 border rounded-xl focus:ring-red-500" value={messageForm.contactNumber} onChange={e => setMessageForm({ ...messageForm, contactNumber: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700">Message</label>
                                <textarea required rows="3" className="block w-full px-4 py-2 border rounded-xl focus:ring-red-500 resize-none" value={messageForm.message} onChange={e => setMessageForm({ ...messageForm, message: e.target.value })} placeholder="Help me with O+ blood..."></textarea>
                            </div>
                            <button type="submit" className="w-full bg-red-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-red-700 transition-all shadow-lg active:scale-95">
                                Send Message
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchDonors;
