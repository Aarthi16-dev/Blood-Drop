import { useState, useEffect } from 'react';
import api from '../services/api';
import { Search, MapPin, Droplets, Phone, X } from 'lucide-react';

const SearchDonors = () => {
    const [donors, setDonors] = useState([]);
    const [bloodGroup, setBloodGroup] = useState('');
    const [location, setLocation] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedDonor, setSelectedDonor] = useState(null);
    const [messageForm, setMessageForm] = useState({
        senderName: '',
        contactNumber: '',
        message: ''
    });
    const [messageStatus, setMessageStatus] = useState('');

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await api.get('/donors/search', {
                params: { bloodGroup, location }
            });
            setDonors(response.data);
        } catch (error) {
            console.error("Failed to fetch donors", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        try {
            await api.post('/message/send', {
                donorId: selectedDonor.id,
                ...messageForm
            });
            setMessageStatus('Message sent successfully!');
            setTimeout(() => {
                setSelectedDonor(null);
                setMessageStatus('');
                setMessageForm({ senderName: '', contactNumber: '', message: '' });
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
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Location</label>
                        <input
                            type="text"
                            placeholder="City or Area"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                        />
                    </div>
                    <div className="flex items-end">
                        <button
                            type="submit"
                            className="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading ? 'Searching...' : 'Find Donors'}
                        </button>
                    </div>
                </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {donors.map(donor => (
                    <div key={donor.id} className="bg-white p-6 rounded-lg shadow-md border-t-4 border-red-500 hover:shadow-lg transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-xl font-bold">{donor.name}</h3>
                                <p className="text-gray-500 text-sm flex items-center gap-1 mt-1">
                                    <MapPin size={14} /> {donor.city || donor.location || 'Unknown'}
                                </p>
                                <p className="text-gray-500 text-sm flex items-center gap-1 mt-1">
                                    <Phone size={14} /> {donor.phoneNumber || 'Not available'}
                                </p>
                                <div className="mt-2 text-sm">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${donor.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {donor.available ? 'Available' : 'Not Available'}
                                    </span>
                                </div>
                            </div>
                            <span className="bg-red-100 text-red-800 text-lg font-bold px-3 py-1 rounded-full flex items-center gap-1">
                                <Droplets size={16} /> {donor.bloodGroup}
                            </span>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
                            <button
                                onClick={() => setSelectedDonor(donor)}
                                className="w-full bg-red-100 text-red-800 py-2 rounded font-semibold hover:bg-red-200 transition-colors"
                            >
                                Send Message
                            </button>
                        </div>
                    </div>
                ))}
                {donors.length === 0 && !loading && (
                    <div className="col-span-full text-center py-12 text-gray-500">
                        No donors found matching your criteria.
                    </div>
                )}
            </div>

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
                                <input required type="text" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500" value={messageForm.senderName} onChange={e => setMessageForm({...messageForm, senderName: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Contact Number</label>
                                <input required type="tel" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500" value={messageForm.contactNumber} onChange={e => setMessageForm({...messageForm, contactNumber: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Message</label>
                                <textarea required rows="4" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500" value={messageForm.message} onChange={e => setMessageForm({...messageForm, message: e.target.value})} placeholder="e.g. Hello, I need O+ blood urgently..."></textarea>
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
