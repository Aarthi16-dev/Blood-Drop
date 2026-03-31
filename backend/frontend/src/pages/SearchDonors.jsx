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
    const [bloodGroup, setBloodGroup] = useState('');
    const [location, setLocation] = useState('');
    const [pincode, setPincode] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedDonor, setSelectedDonor] = useState(null);
    const [messageForm, setMessageForm] = useState({
        senderName: '',
        contactNumber: '',
        message: ''
    });
    const [messageStatus, setMessageStatus] = useState('');
    const [userLocation, setUserLocation] = useState({ latitude: null, longitude: null });
    const [realUserLocation, setRealUserLocation] = useState({ latitude: null, longitude: null });
    const [locationStatus, setLocationStatus] = useState('');
    const [map, setMap] = useState(null);
    const [markers, setMarkers] = useState([]);
    const [focusedDonorId, setFocusedDonorId] = useState(null);

    useEffect(() => {
        if (user) {
            setMessageForm(prev => ({
                ...prev,
                senderName: user.name || '',
                contactNumber: user.phoneNumber || ''
            }));

            // Initialize userLocation from profile if available
            if (user.latitude && user.longitude && !userLocation.latitude) {
                console.log("Initializing userLocation from profile:", user.latitude, user.longitude);
                setUserLocation({ latitude: user.latitude, longitude: user.longitude });
                setRealUserLocation({ latitude: user.latitude, longitude: user.longitude });
            } else if (!userLocation.latitude && (user.location || user.city)) {
                // Auto-geocode their profile city if they don't have exact coordinates
                const searchCity = user.location || user.city;
                fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchCity)}`, {
                    headers: { 'Accept-Language': 'en', 'User-Agent': 'BloodDropApp' }
                })
                    .then(res => res.json())
                    .then(data => {
                        if (data && data.length > 0) {
                            const lat = parseFloat(data[0].lat);
                            const lon = parseFloat(data[0].lon);
                            setUserLocation({ latitude: lat, longitude: lon });
                            setRealUserLocation({ latitude: lat, longitude: lon });
                            setLocationStatus(`Auto-located to your profile city: ${searchCity}`);
                        }
                    })
                    .catch(err => console.error("Profile auto-geocoding failed", err));
            }
        }
    }, [user]);

    // Automatically try to get location on mount
    useEffect(() => {
        if (!userLocation.latitude) {
            getLocation();
        }
    }, []);

    // Initialize Map
    useEffect(() => {
        const initMap = () => {
            const mapElement = document.getElementById('map-container');
            if (!map && window.L && mapElement) {
                try {
                    const initialMap = window.L.map(mapElement).setView([20.5937, 78.9629], 5); // Default to India center
                    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        attribution: '&copy; OpenStreetMap contributors'
                    }).addTo(initialMap);

                    // Allow users to set their location manually by clicking on the map
                    initialMap.on('click', (e) => {
                        const { lat, lng } = e.latlng;
                        setUserLocation({ latitude: lat, longitude: lng });
                        setLocationStatus('Location manually set from map');
                        handleSearch(null, lat, lng);
                    });

                    setMap(initialMap);
                } catch (err) {
                    console.error("Map initialization failed:", err);
                }
            }
        };

        // Small delay to ensure the container is ready and Leaflet is loaded
        const timer = setTimeout(initMap, 100);

        return () => {
            clearTimeout(timer);
            if (map) {
                map.remove();
                setMap(null);
            }
        };
    }, [map]); // Re-run if map somehow cleared or not yet set

    // Update markers and lines when donors or userLocation change
    useEffect(() => {
        if (!map || !window.L) return;

        // Clear existing markers and lines
        markers.forEach(m => m.remove());
        const newMarkers = [];

        // 1. Add User Marker (Blue Circle) - Always at their REAL location if available, otherwise search center
        const displayUserLat = realUserLocation.latitude || userLocation.latitude;
        const displayUserLon = realUserLocation.longitude || userLocation.longitude;

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

        // 2. Add Donor Markers & Connecting Lines
        donors.forEach(donor => {
            const dLat = donor.latitude;
            const dLon = donor.longitude;

            if (dLat !== null && dLat !== undefined && dLon !== null && dLon !== undefined) {
                const isFocused = focusedDonorId === donor.id;

                // Add Connection Line from REAL location to donor
                if (isFocused && displayUserLat && displayUserLon) {
                    const line = window.L.polyline(
                        [[displayUserLat, displayUserLon], [dLat, dLon]],
                        {
                            color: '#ef4444',
                            weight: 4,
                            opacity: 0.8,
                            dashArray: '10, 10',
                            lineJoin: 'round'
                        }
                    ).addTo(map);
                    newMarkers.push(line);

                    // Add a distance label mid-way
                    const dist = calculateDistance(displayUserLat, displayUserLon, dLat, dLon);
                    const midPoint = [
                        (displayUserLat + dLat) / 2,
                        (displayUserLon + dLon) / 2
                    ];

                    const distanceMarker = window.L.marker(midPoint, {
                        icon: window.L.divIcon({
                            className: 'distance-label',
                            html: `<div style="background: white; padding: 2px 6px; border-radius: 12px; border: 1px solid #ef4444; color: #ef4444; font-weight: bold; font-size: 10px; white-space: nowrap; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">${dist.toFixed(1)} km</div>`,
                            iconSize: [60, 20],
                            iconAnchor: [30, 10]
                        })
                    }).addTo(map);
                    newMarkers.push(distanceMarker);
                }

                // Add Donor Marker
                const donorIcon = window.L.divIcon({
                    className: 'custom-div-icon',
                    html: `<div style="background-color: ${isFocused ? '#ef4444' : '#dc2626'}; width: ${isFocused ? '20px' : '15px'}; height: ${isFocused ? '20px' : '15px'}; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 8px rgba(0,0,0,0.3); transition: all 0.3s ease;"></div>`,
                    iconSize: [isFocused ? 20 : 15, isFocused ? 20 : 15],
                    iconAnchor: [isFocused ? 10 : 7, isFocused ? 10 : 7]
                });

                const marker = window.L.marker([dLat, dLon], {
                    icon: donorIcon
                })
                    .addTo(map)
                    .on('click', () => setFocusedDonorId(donor.id))
                    .bindPopup(`
                    <div style="font-family: 'Inter', sans-serif; min-width: 140px; padding: 4px;">
                        <b style="color: #dc2626; font-size: 14px; display: block; margin-bottom: 4px;">${donor.name}</b>
                        <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
                            <span style="background: #fee2e2; color: #dc2626; padding: 2px 6px; border-radius: 4px; font-weight: 700; font-size: 11px;">${donor.bloodGroup}</span>
                            <span style="color: #6b7280; font-size: 11px;">${donor.city || donor.location || ''}</span>
                        </div>
                        ${displayUserLat ? `
                            <div style="border-top: 1px solid #f3f4f6; pt-2 mt-2 font-weight: 600; color: #111827; font-size: 12px;">
                                Distance: ${calculateDistance(displayUserLat, displayUserLon, dLat, dLon).toFixed(2)} km
                            </div>
                        ` : ''}
                    </div>
                `, { closeButton: false });

                if (isFocused) {
                    marker.openPopup();
                }
                newMarkers.push(marker);
            }
        });

        // 3. Adjust View
        if (focusedDonorId) {
            const focusedDonor = donors.find(d => d.id === focusedDonorId);
            if (focusedDonor && focusedDonor.latitude && focusedDonor.longitude) {
                if (displayUserLat && displayUserLon) {
                    const bounds = window.L.latLngBounds([
                        [displayUserLat, displayUserLon],
                        [focusedDonor.latitude, focusedDonor.longitude]
                    ]);
                    map.fitBounds(bounds.pad(0.3), { animate: true, duration: 1 });
                } else {
                    map.setView([focusedDonor.latitude, focusedDonor.longitude], 13, { animate: true });
                }
            }
        } else if (newMarkers.length > 0) {
            try {
                // Filter out non-layer objects if any (though newMarkers should be layers)
                const layerGroup = window.L.featureGroup(newMarkers.filter(m => m instanceof window.L.Layer));
                if (layerGroup.getBounds().isValid()) {
                    map.fitBounds(layerGroup.getBounds().pad(0.2), { animate: true });
                }
            } catch (e) {
                console.error("Fit bounds failed:", e);
                if (userLocation.latitude) {
                    map.setView([userLocation.latitude, userLocation.longitude], 11);
                }
            }
        } else if (displayUserLat) {
            map.setView([displayUserLat, displayUserLon], 11);
        }

        setMarkers(newMarkers);
    }, [donors, map, userLocation, realUserLocation, focusedDonorId]);

    const handleSearch = async (e, lat, lon) => {
        if (e) e.preventDefault();
        setLoading(true);
        let searchLat = lat !== undefined ? lat : userLocation.latitude;
        let searchLon = lon !== undefined ? lon : userLocation.longitude;
        const isExplicitCoords = lat !== undefined && lon !== undefined;

        try {
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
                        setUserLocation({ latitude: searchLat, longitude: searchLon });
                        setLocationStatus(`Location found: ${geoData[0].display_name.split(',')[0]}`);
                    } else {
                        setLocationStatus('Location not found. Searching by name.');
                    }
                } catch (geoErr) {
                    console.error("Geocoding failed", geoErr);
                }
            }

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
                        setUserLocation({ latitude: searchLat, longitude: searchLon });
                        setLocationStatus(`Pincode area found: ${geoData[0].display_name.split(',')[0]}`);
                    } else {
                        setLocationStatus('Pincode not found. Searching by name.');
                    }
                } catch (geoErr) {
                    console.error("Pincode geocoding failed", geoErr);
                    setLocationStatus('Geocoding service busy/unavailable');
                }
            }

            const response = await api.get('/donors/search', {
                params: {
                    bloodGroup,
                    location,
                    pincode,
                    latitude: searchLat,
                    longitude: searchLon
                }
            });
            const fetchedDonors = response.data;
            setDonors(fetchedDonors);

            // Geocode donors missing coordinates sequentially to respect rate limits
            geocodeMissingDonors(fetchedDonors);

            if (fetchedDonors.length === 1) {
                setFocusedDonorId(fetchedDonors[0].id);
            } else {
                setFocusedDonorId(null);
            }
            if (lat !== undefined) {
                setLocationStatus('Location acquired and results updated');
            }
        } catch (error) {
            console.error("Failed to fetch donors", error);
            if (lat !== undefined) {
                setLocationStatus('Failed to search around location');
            }
        } finally {
            setLoading(false);
        }
    };

    const geocodeMissingDonors = async (donorList) => {
        // Find only those that need geocoding
        const needsGeocoding = donorList.filter(d => !d.latitude && (d.pincode || d.city));

        needsGeocoding.forEach(async (donor, index) => {
            try {
                // Staggered delay to respect Nominatim rate limit (1 req/sec)
                await new Promise(resolve => setTimeout(resolve, index * 1200));

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
        });
    };

    const getLocation = () => {
        setLocationStatus('Locating...');
        if (!navigator.geolocation) {
            setLocationStatus('Geolocation not supported');
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
            () => setLocationStatus('Location access denied')
        );
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        try {
            console.log("Sending message to donor:", selectedDonor.id, "from user:", user?.id);
            await api.post('/message/send', {
                donorId: selectedDonor.id,
                senderId: user?.id,
                ...messageForm
            });
            console.log("Message sent response received");
            setMessageStatus('Message sent successfully!');
            setTimeout(() => {
                setSelectedDonor(null);
                setMessageStatus('');
                setMessageForm({
                    senderName: user?.name || '',
                    contactNumber: user?.phoneNumber || '',
                    message: ''
                });
            }, 2000);
        } catch (error) {
            console.error("Failed to send message", error);
            setMessageStatus('Failed to send message.');
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <Search className="text-red-600" /> Search Donors
                </h2>
                <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Blood Group</label>
                        <select
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                            value={bloodGroup}
                            onChange={(e) => setBloodGroup(e.target.value)}
                        >
                            <option value="">Any</option>
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
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Search Location</label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Enter city or area..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 transition-all shadow-sm"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                            />
                            <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Pin Code</label>
                        <input
                            type="text"
                            placeholder="6-digit PIN"
                            maxLength="6"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 transition-all shadow-sm"
                            value={pincode}
                            onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                        />
                    </div>

                    <div className="flex flex-col justify-end">
                        <label className="block text-sm font-medium text-gray-700 mb-1 invisible">Location Trigger</label>
                        <button
                            type="button"
                            onClick={getLocation}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-all border border-blue-200"
                            title="Find donors near me"
                        >
                            <Navigation size={18} />
                            <span className="font-medium whitespace-nowrap">Near Me</span>
                        </button>
                    </div>
                    <div className="flex flex-col justify-end">
                        <label className="block text-sm font-medium text-gray-700 mb-1 invisible">Search Button</label>
                        <button
                            type="submit"
                            className="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading ? 'Searching...' : 'Find Donors'}
                        </button>
                    </div>
                </form>
                {locationStatus && <p className="text-[10px] mt-1 text-gray-500">{locationStatus}</p>}
            </div>

            {/* Map Container */}
            <div className="bg-white p-2 rounded-xl shadow-md border border-gray-100 overflow-hidden">
                <div className="h-64 sm:h-80 w-full rounded-lg z-0" id="map-container"></div>
                <div className="p-3 text-xs text-gray-500 flex items-center gap-4 justify-center flex-wrap">
                    <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Your Location</div>
                    <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-600"></div> Donors</div>
                    <div className="flex items-center gap-1"><div className="w-4 h-0.5 border-t border-dashed border-blue-400"></div> Connection</div>
                </div>
            </div>

            {/* Sorting Logic */}
            {(() => {
                const currentUserLat = realUserLocation.latitude || userLocation.latitude;
                const currentUserLon = realUserLocation.longitude || userLocation.longitude;

                const sortedDonors = [...donors].sort((a, b) => {
                    // Calculate distances for comparison
                    const distA = (currentUserLat && a.latitude && a.longitude)
                        ? calculateDistance(currentUserLat, currentUserLon, a.latitude, a.longitude)
                        : Infinity;
                    const distB = (currentUserLat && b.latitude && b.longitude)
                        ? calculateDistance(currentUserLat, currentUserLon, b.latitude, b.longitude)
                        : Infinity;

                    // Sort by distance (shortest first)
                    // Infinity values (not yet calculated) go to the end
                    if (distA === Infinity && distB === Infinity) return 0;
                    if (distA === Infinity) return 1;
                    if (distB === Infinity) return -1;

                    return distA - distB;
                });

                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {sortedDonors.length > 0 ? (
                            sortedDonors.map((donor) => (
                                <div
                                    key={donor.id}
                                    onClick={() => donor.latitude && setFocusedDonorId(donor.id)}
                                    className={`bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border ${focusedDonorId === donor.id ? 'border-red-500 ring-2 ring-red-100 scale-[1.02]' : 'border-gray-100'} group flex flex-col cursor-pointer`}
                                >
                                    <div className="p-6 flex-1">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center space-x-4">
                                                <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center group-hover:bg-red-200 transition-colors">
                                                    <span className="text-red-700 font-bold text-lg">{donor.bloodGroup}</span>
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-900 capitalize">{donor.name}</h3>
                                                    <p className="text-gray-500 flex items-center text-sm">
                                                        <MapPin className="h-3 w-3 mr-1" />
                                                        {donor.city || donor.location || 'Unknown location'}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${donor.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                {donor.available ? 'Available' : 'Busy'}
                                            </span>
                                        </div>

                                        <div className="space-y-2 mb-6">
                                            <div className="flex items-center text-sm text-gray-600">
                                                <Navigation className="h-4 w-4 mr-2 text-blue-500" />
                                                <span>
                                                    {currentUserLat ? (
                                                        donor.latitude && donor.longitude ? (
                                                            `${calculateDistance(currentUserLat, currentUserLon, donor.latitude, donor.longitude).toFixed(1)} km away`
                                                        ) : (
                                                            <span className="animate-pulse text-blue-400 font-medium">Calculating distance...</span>
                                                        )
                                                    ) : (
                                                        donor.pincode ? `PIN: ${donor.pincode}` : 'Distance unavailable'
                                                    )}
                                                </span>
                                            </div>
                                            <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-100 flex items-center justify-between">
                                                <div className="flex items-center text-green-700">
                                                    <Phone className="h-5 w-5 mr-3" />
                                                    <span className="font-bold text-lg">{donor.phoneNumber || 'Contact hidden'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-4">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation(); // Prevent card click
                                                    setSelectedDonor(donor);
                                                }}
                                                className="w-full bg-red-600 text-white px-4 py-3 rounded-xl font-bold hover:bg-red-700 transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
                                            >
                                                <Mail size={18} /> Send Message
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full py-16 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                                <Droplets className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500 text-lg font-medium">No donors found matching your search.</p>
                                <p className="text-gray-400 text-sm mt-1">Try expanding your location or selecting a different blood group.</p>
                            </div>
                        )}
                    </div>
                );
            })()}

            {selectedDonor && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full relative">
                        <button
                            onClick={() => setSelectedDonor(null)}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                        >
                            <X size={20} />
                        </button>
                        <h3 className="text-xl font-bold mb-4">Message to {selectedDonor.name}</h3>
                        {messageStatus && (
                            <div className={`mb-4 p-2 text-sm rounded ${messageStatus.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {messageStatus}
                            </div>
                        )}
                        <form onSubmit={handleSendMessage} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Your Name</label>
                                <input required type="text" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500" value={messageForm.senderName} onChange={e => setMessageForm({ ...messageForm, senderName: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Contact Number</label>
                                <input required type="tel" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500" value={messageForm.contactNumber} onChange={e => setMessageForm({ ...messageForm, contactNumber: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Message</label>
                                <textarea required rows="4" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500" value={messageForm.message} onChange={e => setMessageForm({ ...messageForm, message: e.target.value })} placeholder="e.g. Hello, I need O+ blood urgently..."></textarea>
                            </div>
                            <button type="submit" className="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors">
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
