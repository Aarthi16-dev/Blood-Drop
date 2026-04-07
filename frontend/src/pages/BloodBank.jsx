import { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Building2, Droplets, MapPin, Calendar, PlusCircle, Edit2, X, Phone } from 'lucide-react';

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const BloodBank = () => {
    const { user } = useContext(AuthContext);
    const [banks, setBanks] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Admin checking
    const isAdmin = user?.email === 'aarthi16@gmail.com';

    // Add / Edit Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBankId, setEditingBankId] = useState(null);
    const [formData, setFormData] = useState({
        bankName: '',
        city: '',
        contactNumber: '',
        inventory: {}
    });

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

    useEffect(() => {
        fetchBanks();
    }, []);

    const handleOpenModal = (bank = null) => {
        if (bank) {
            setEditingBankId(bank.id);
            setFormData({
                bankName: bank.bankName,
                city: bank.city,
                contactNumber: bank.contactNumber || '',
                inventory: bank.inventory || {}
            });
        } else {
            setEditingBankId(null);
            setFormData({
                bankName: '',
                city: '',
                contactNumber: '',
                inventory: {}
            });
        }
        setIsModalOpen(true);
    };

    const handleInventoryChange = (bg, val) => {
        const units = parseInt(val);
        setFormData(prev => ({
            ...prev,
            inventory: {
                ...prev.inventory,
                [bg]: isNaN(units) ? 0 : units
            }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingBankId) {
                await api.put(`/bloodbank/${editingBankId}`, formData);
            } else {
                await api.post('/bloodbank/add', formData);
            }
            setIsModalOpen(false);
            fetchBanks(); // Refresh list
        } catch (error) {
            console.error("Failed to save blood bank", error);
            alert("Error saving Blood Bank Record.");
        }
    };

    if (loading) return <div className="text-center py-12">Loading...</div>;

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md flex justify-between items-center border-t-4 border-red-600">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Building2 className="text-red-600" /> Blood Bank Availabilities
                    </h2>
                    <p className="text-gray-600 mt-2">Check live blood stock at registered blood banks.</p>
                </div>
                {isAdmin && (
                    <button 
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-red-700 transition shadow-sm"
                    >
                        <PlusCircle size={18} /> Add Blood Bank
                    </button>
                )}
            </div>

            {/* Blood Banks Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {banks.map(bank => (
                    <div key={bank.id} className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-xl transition-shadow relative">
                        {isAdmin && (
                            <button 
                                onClick={() => handleOpenModal(bank)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-red-600 transition"
                                title="Edit Inventory"
                            >
                                <Edit2 size={20} />
                            </button>
                        )}
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">{bank.bankName}</h3>
                        <div className="flex flex-col gap-1 mb-4 text-sm text-gray-500 font-medium">
                            <p className="flex items-center gap-1"><MapPin size={16} className="text-red-500"/> {bank.city}</p>
                            {bank.contactNumber && <p className="flex items-center gap-1"><Phone size={14} className="text-green-600"/> <a href={`tel:${bank.contactNumber}`} className="hover:text-green-700">{bank.contactNumber}</a></p>}
                        </div>
                        
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                            <h4 className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-3 flex items-center gap-1"><Droplets size={12}/> Current Inventory</h4>
                            <div className="grid grid-cols-4 sm:grid-cols-4 gap-3">
                                {BLOOD_GROUPS.map(bg => {
                                    const units = bank.inventory && bank.inventory[bg] ? bank.inventory[bg] : 0;
                                    return (
                                        <div key={bg} className={`text-center py-2 rounded-lg border ${units > 0 ? 'bg-red-50 border-red-100' : 'bg-white border-gray-200'}`}>
                                            <div className={`text-sm font-black ${units > 0 ? 'text-red-600' : 'text-gray-400'}`}>{bg}</div>
                                            <div className={`text-xs font-bold mt-1 ${units > 0 ? 'text-red-700' : 'text-gray-400'}`}>{units} units</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {bank.lastUpdatedDate && (
                            <p className="flex items-center gap-2 text-[10px] uppercase font-bold text-gray-400 mt-4 tracking-widest"><Calendar size={12}/> Last Updated: {new Date(bank.lastUpdatedDate).toLocaleDateString()}</p>
                        )}
                    </div>
                ))}
            </div>

            {banks.length === 0 && (
                <div className="text-center py-24 bg-white rounded-2xl shadow-sm border border-gray-100 text-gray-400">
                    <Building2 size={48} className="mx-auto mb-4 opacity-20" />
                    No blood bank records found.
                </div>
            )}

            {/* Admin Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden">
                        <div className="bg-red-600 px-8 py-6 text-white flex justify-between items-center">
                            <h3 className="text-2xl font-black">{editingBankId ? 'Edit Blood Bank' : 'Add Blood Bank'}</h3>
                            <button onClick={() => setIsModalOpen(false)}><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-8">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                                <div>
                                    <label className="block text-xs font-black text-gray-500 uppercase mb-1">Blood Bank Name</label>
                                    <input required value={formData.bankName} onChange={e => setFormData({...formData, bankName: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3" />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-500 uppercase mb-1">City</label>
                                    <input required value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3" />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-500 uppercase mb-1">Contact No.</label>
                                    <input value={formData.contactNumber || ''} onChange={e => setFormData({...formData, contactNumber: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3" placeholder="+91..." />
                                </div>
                            </div>
                            
                            <h4 className="text-sm font-black text-gray-700 uppercase tracking-widest mb-4 border-b pb-2">Inventory Stock (Units)</h4>
                            <div className="grid grid-cols-4 gap-4 mb-8">
                                {BLOOD_GROUPS.map(bg => (
                                    <div key={bg}>
                                        <label className="block text-xs font-bold text-gray-500 text-center mb-1">{bg}</label>
                                        <input 
                                            type="number" 
                                            min="0"
                                            value={formData.inventory[bg] || 0} 
                                            onChange={e => handleInventoryChange(bg, e.target.value)} 
                                            className="w-full bg-red-50 text-red-700 border border-red-100 font-bold text-center rounded-lg px-2 py-2" 
                                        />
                                    </div>
                                ))}
                            </div>

                            <button type="submit" className="w-full bg-red-600 text-white py-4 rounded-xl font-black text-lg hover:bg-red-700 transition-all">
                                {editingBankId ? 'Save Changes' : 'Create Blood Bank'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BloodBank;
