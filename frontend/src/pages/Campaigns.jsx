import { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Calendar, MapPin, Plus, X, Phone, User as UserIcon } from 'lucide-react';

const Campaigns = () => {
    const { user } = useContext(AuthContext);
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        organizer: '',
        location: '',
        startDate: '',
        endDate: '',
        contactInfo: ''
    });

    const fetchCampaigns = async () => {
        try {
            setLoading(true);
            const response = await api.get('/campaigns');
            setCampaigns(response.data);
        } catch (error) {
            console.error("Failed to fetch campaigns", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/campaigns', formData);
            setShowAddModal(false);
            setFormData({
                name: '',
                description: '',
                organizer: '',
                location: '',
                startDate: '',
                endDate: '',
                contactInfo: ''
            });
            fetchCampaigns();
            alert("Campaign created successfully!");
        } catch (error) {
            console.error("Error creating campaign", error);
            alert("Failed to create campaign. Only Admins/Recipients can perform this action.");
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
    );

    return (
        <div className="space-y-8 p-4">
            <div className="flex justify-between items-center border-b pb-6">
                <div>
                    <h2 className="text-4xl font-extrabold text-gray-900">Blood Donation Campaigns</h2>
                    <p className="text-gray-500 mt-2">Join an event near you and save lives together.</p>
                </div>
                {user?.role === 'ADMIN' && (
                <button
                    onClick={() => {
                        console.log("Create Campaign button clicked");
                        setShowAddModal(true);
                    }}
                    className="bg-red-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-red-700 transition-all shadow-lg"
                >
                    <Plus size={20} /> Create Campaign
                </button>
                )}
            </div>

            {campaigns.length === 0 ? (
                <div className="bg-gray-50 rounded-2xl p-12 text-center">
                    <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-xl font-bold text-gray-800">No upcoming campaigns</h3>
                    <p className="text-gray-500 mt-2">Check back later or start your own campaign!</p>
                </div>
            ) : (
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {campaigns.map(campaign => (
                        <div key={campaign.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all">
                            <div className="bg-red-600 h-2 w-full"></div>
                            <div className="p-8">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="bg-red-50 text-red-700 p-2 rounded-xl text-center min-w-[60px]">
                                        <div className="text-xs font-bold uppercase">{new Date(campaign.startDate).toLocaleDateString(undefined, { month: 'short' })}</div>
                                        <div className="text-2xl font-black">{new Date(campaign.startDate).getDate()}</div>
                                    </div>
                                    <div className="ml-4">
                                        <h3 className="text-xl font-bold text-gray-900">{campaign.name}</h3>
                                        <p className="text-xs text-red-600 font-bold uppercase mt-1 tracking-wider">{campaign.organizer}</p>
                                    </div>
                                </div>
                                <p className="text-gray-600 text-sm mb-6">{campaign.description}</p>
                                <div className="space-y-3 pt-4 border-t">
                                    <div className="flex items-center gap-3 text-gray-500 text-sm">
                                        <MapPin size={16} /> <span>{campaign.location}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-500 text-sm">
                                        <Phone size={16} /> <span>{campaign.contactInfo}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden">
                        <div className="bg-red-600 px-8 py-6 text-white flex justify-between items-center">
                            <h3 className="text-2xl font-black">Create New Campaign</h3>
                            <button onClick={() => setShowAddModal(false)}><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-8 space-y-4">
                            <div>
                                <label className="block text-xs font-black text-gray-500 uppercase mb-1">Campaign Name</label>
                                <input required name="name" value={formData.name} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-gray-500 uppercase mb-1">Organizer</label>
                                    <input required name="organizer" value={formData.organizer} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2" />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-500 uppercase mb-1">Location</label>
                                    <input required name="location" value={formData.location} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2" />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-500 uppercase mb-1">Start Date</label>
                                    <input required type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2" />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-500 uppercase mb-1">Contact Info</label>
                                    <input required name="contactInfo" value={formData.contactInfo} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-black text-gray-500 uppercase mb-1">Description</label>
                                <textarea required name="description" value={formData.description} onChange={handleChange} rows="3" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2"></textarea>
                            </div>
                            <button type="submit" className="w-full bg-red-600 text-white py-4 rounded-xl font-black text-lg hover:bg-red-700 transition-all mt-4">
                                Publish Campaign
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Campaigns;
