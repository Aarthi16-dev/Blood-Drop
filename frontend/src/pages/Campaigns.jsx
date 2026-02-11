import { useState, useEffect } from 'react';
import api from '../services/api';
import { Calendar, MapPin } from 'lucide-react';

const Campaigns = () => {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCampaigns = async () => {
            try {
                // In a real app, use the API. For now, mocking data if API fails or empty
                // const response = await api.get('/campaigns');
                // setCampaigns(response.data);

                // Mock data for demo
                setCampaigns([
                    {
                        id: 1,
                        name: "City Blood Drive 2026",
                        description: "Join us for our annual city-wide blood donation camp.",
                        organizer: "City Hospital",
                        location: "Central Park, Downtown",
                        startDate: "2026-03-15",
                        contactInfo: "555-0123"
                    },
                    {
                        id: 2,
                        name: "University Red Cross Camp",
                        description: "Calling all students to save lives!",
                        organizer: "University Red Cross Club",
                        location: "Student Center",
                        startDate: "2026-04-10",
                        contactInfo: "555-0199"
                    }
                ]);
            } catch (error) {
                console.error("Failed to fetch campaigns", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCampaigns();
    }, []);

    if (loading) return <div>Loading campaigns...</div>;

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900 border-b pb-4">Upcoming Donation Campaigns</h2>
            <div className="grid gap-6 md:grid-cols-2">
                {campaigns.map(campaign => (
                    <div key={campaign.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                        <div className="bg-red-600 h-2 w-full"></div>
                        <div className="p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">{campaign.name}</h3>
                                    <p className="text-sm text-gray-500 mt-1">Organized by {campaign.organizer}</p>
                                </div>
                                <div className="bg-red-50 text-red-700 px-3 py-1 rounded-lg text-sm font-semibold flex flex-col items-center">
                                    <span>{new Date(campaign.startDate).toLocaleDateString(undefined, { month: 'short' })}</span>
                                    <span className="text-xl">{new Date(campaign.startDate).getDate()}</span>
                                </div>
                            </div>
                            <p className="mt-4 text-gray-600">{campaign.description}</p>
                            <div className="mt-6 flex items-center text-gray-500 text-sm gap-4">
                                <span className="flex items-center gap-1"><MapPin size={16} /> {campaign.location}</span>
                                <span className="flex items-center gap-1"><Calendar size={16} /> {campaign.contactInfo}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Campaigns;
