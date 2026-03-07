import { useState, useEffect } from 'react';
import api from '../services/api';
import { Building2, Droplets, MapPin, Calendar } from 'lucide-react';

const BloodBank = () => {
    const [banks, setBanks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBanks = async () => {
            try {
                const response = await api.get('/bloodbank/all');
                setBanks(response.data);
            } catch (error) {
                console.error("Failed to fetch blood banks", error);
            } finally {
                setLoading(false);
            }
        };
        fetchBanks();
    }, []);

    if (loading) return <div className="text-center py-12">Loading...</div>;

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Building2 className="text-red-600" /> Blood Bank Availabilities
                </h2>
                <p className="text-gray-600 mt-2">Check live blood stock at registered blood banks.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {banks.map(bank => (
                    <div key={bank.id} className="bg-white p-6 rounded-lg shadow-md border-t-4 border-red-500 hover:shadow-lg transition-shadow">
                        <h3 className="text-xl font-bold mb-3">{bank.bankName}</h3>
                        <div className="space-y-2 text-sm text-gray-600">
                            <p className="flex items-center gap-2"><MapPin size={16}/> {bank.city}</p>
                            <p className="flex items-center gap-2"><Droplets size={16}/> Blood Group: <strong>{bank.bloodGroup}</strong></p>
                            <p className="flex items-center gap-2"><Building2 size={16}/> Available Units: <span className="text-red-600 font-bold">{bank.availableUnits}</span></p>
                            {bank.lastUpdatedDate && (
                                <p className="flex items-center gap-2 text-xs mt-4"><Calendar size={14}/> Last Updated: {new Date(bank.lastUpdatedDate).toLocaleDateString()}</p>
                            )}
                        </div>
                    </div>
                ))}
                {banks.length === 0 && (
                    <div className="col-span-full text-center py-12 text-gray-500">
                        No blood bank records found.
                    </div>
                )}
            </div>
        </div>
    );
};

export default BloodBank;
