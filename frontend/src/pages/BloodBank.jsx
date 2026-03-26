import { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Building2, Droplets, MapPin, Calendar, PlusCircle } from 'lucide-react';

const BloodBank = () => {
    const { user } = useContext(AuthContext);
    const [banks, setBanks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        bankName: '',
        city: '',
        bloodGroup: '',
        availableUnits: ''
    });
    const [editingStockId, setEditingStockId] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [updating, setUpdating] = useState(false);

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

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/bloodbank/add', {
                ...formData,
                availableUnits: parseInt(formData.availableUnits),
                lastUpdatedDate: new Date().toISOString()
            });
            setShowForm(false);
            setFormData({ bankName: '', city: '', bloodGroup: '', availableUnits: '' });
            fetchBanks(); // Refresh list
        } catch (error) {
            console.error("Failed to add blood bank", error);
            alert("Error adding Blood Bank Record.");
        }
    };

    const handleUpdateStock = async (stockId, group) => {
        setUpdating(true);
        try {
            await api.post('/bloodbank/add', {
                bankName: selectedBank.bankName,
                city: selectedBank.city,
                bloodGroup: group,
                availableUnits: parseInt(editValue),
                lastUpdatedDate: new Date().toISOString()
            });
            setEditingStockId(null);
            fetchBanks();
            
            // Also update the local selectedBank state to reflect the change immediately
            const updatedStocks = selectedBank.stocks.map(s => 
                s.id === stockId ? { ...s, units: parseInt(editValue) } : s
            );
            setSelectedBank({ ...selectedBank, stocks: updatedStocks, lastUpdated: new Date().toISOString() });
            
        } catch (error) {
            console.error("Failed to update stock", error);
            alert("Error updating stock quantity.");
        } finally {
            setUpdating(false);
        }
    };

    const [selectedBank, setSelectedBank] = useState(null);

    // Group banks by name and city
    const groupedBanks = banks.reduce((acc, bank) => {
        const key = `${bank.bankName.toLowerCase()}-${bank.city.toLowerCase()}`;
        if (!acc[key]) {
            acc[key] = {
                bankName: bank.bankName,
                city: bank.city,
                stocks: [],
                lastUpdated: bank.lastUpdatedDate
            };
        }
        acc[key].stocks.push({
            id: bank.id,
            group: bank.bloodGroup,
            units: bank.availableUnits
        });
        // Sort stocks alphabetically
        acc[key].stocks.sort((a, b) => a.group.localeCompare(b.group));
        
        if (new Date(bank.lastUpdatedDate) > new Date(acc[key].lastUpdated)) {
            acc[key].lastUpdated = bank.lastUpdatedDate;
        }
        return acc;
    }, {});

    const bankList = Object.values(groupedBanks);

    if (loading) return <div className="text-center py-12">Loading...</div>;

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md flex justify-between items-center border-l-4 border-red-600">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Building2 className="text-red-600" /> Blood Bank Availabilities
                    </h2>
                    <p className="text-gray-600 mt-2">Check live blood stock at registered blood banks.</p>
                </div>
                {(user?.role === 'ADMIN' || user?.role === 'RECEPTION') && (
                    <button 
                        onClick={() => setShowForm(!showForm)}
                        className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition shadow-md"
                    >
                        <PlusCircle size={18} /> {showForm ? 'Cancel' : 'Add Stock Record'}
                    </button>
                )}
            </div>

            {showForm && (
                <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-xl animate-in fade-in slide-in-from-top-4 duration-300">
                    <h3 className="text-lg font-bold mb-6 text-gray-800 flex items-center gap-2 underline decoration-red-200 underline-offset-4">
                        <PlusCircle size={20} className="text-red-500"/> Update Blood Stock
                    </h3>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
                        <div className="space-y-1">
                            <label className="block text-sm font-semibold text-gray-700">Bank Name</label>
                            <input 
                                name="bankName" 
                                list="bank-names"
                                value={formData.bankName} 
                                onChange={handleChange} 
                                placeholder="Enter bank name..."
                                required 
                                className="block w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all" 
                            />
                            <datalist id="bank-names">
                                {[...new Set(banks.map(b => b.bankName))].map(name => <option key={name} value={name} />)}
                            </datalist>
                        </div>
                        <div className="space-y-1">
                            <label className="block text-sm font-semibold text-gray-700">City</label>
                            <input 
                                name="city" 
                                list="bank-cities"
                                value={formData.city} 
                                onChange={handleChange} 
                                placeholder="Enter city..."
                                required 
                                className="block w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all" 
                            />
                            <datalist id="bank-cities">
                                {[...new Set(banks.map(b => b.city))].map(city => <option key={city} value={city} />)}
                            </datalist>
                        </div>
                        <div className="space-y-1">
                            <label className="block text-sm font-semibold text-gray-700">Blood Group</label>
                            <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} required className="block w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all">
                                <option value="">Select Group...</option>
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
                        <div className="space-y-1">
                            <label className="block text-sm font-semibold text-gray-700">Available Units</label>
                            <div className="flex gap-3">
                                <input type="number" name="availableUnits" value={formData.availableUnits} onChange={handleChange} required min="0" placeholder="0" className="block w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all" />
                                <button type="submit" className="bg-red-600 text-white px-8 py-2 rounded-lg font-bold hover:bg-red-700 transition shadow-lg active:scale-95">Save</button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {bankList.map((bank, idx) => (
                    <div 
                        key={idx} 
                        onClick={() => setSelectedBank(bank)}
                        className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 group cursor-pointer active:scale-[0.98]"
                    >
                        <div className="bg-gradient-to-r from-red-600 to-red-500 p-5 text-white relative overflow-hidden">
                            <Building2 size={80} className="absolute -right-4 -bottom-4 opacity-10 rotate-12"/>
                            <h3 className="text-xl font-bold tracking-tight flex items-center gap-2">
                                <Building2 size={24} className="opacity-80"/> {bank.bankName}
                            </h3>
                            <p className="flex items-center gap-1.5 text-red-100 text-sm mt-1 font-medium">
                                <MapPin size={14}/> {bank.city}
                            </p>
                        </div>
                        
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Availability Summary</div>
                                <span className="bg-red-50 text-red-600 text-[10px] font-bold px-2 py-1 rounded-full uppercase">
                                    {bank.stocks.length} Groups
                                </span>
                            </div>
                            
                            <div className="flex flex-wrap gap-2 mb-6">
                                {bank.stocks.slice(0, 4).map((s, i) => (
                                    <span key={i} className="px-2 py-1 bg-gray-50 border border-gray-200 rounded text-xs font-bold text-gray-600">
                                        {s.group}
                                    </span>
                                ))}
                                {bank.stocks.length > 4 && (
                                    <span className="px-2 py-1 bg-gray-50 border border-gray-200 rounded text-xs font-bold text-gray-400">
                                        +{bank.stocks.length - 4} more
                                    </span>
                                )}
                            </div>

                            <button className="w-full py-3 bg-gray-900 text-white rounded-lg font-bold text-sm hover:bg-red-600 transition-colors flex items-center justify-center gap-2 shadow-sm">
                                <Droplets size={16}/> View All Stock
                            </button>
                        </div>

                        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                            <div className="flex items-center gap-1 text-[10px] font-semibold text-gray-400 uppercase">
                                <Calendar size={12}/> {new Date(bank.lastUpdated).toLocaleDateString()}
                            </div>
                            <div className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">
                                LIVE
                            </div>
                        </div>
                    </div>
                ))}
                
                {bankList.length === 0 && (
                    <div className="col-span-full py-20 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                        <Droplets className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-xl font-medium">No blood bank records found.</p>
                        <p className="text-gray-400 text-sm mt-1">Start by adding a new stock record above.</p>
                    </div>
                )}
            </div>

            {/* Availability details modal */}
            {selectedBank && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="bg-red-600 p-6 text-white flex justify-between items-start">
                            <div>
                                <h3 className="text-2xl font-bold">{selectedBank.bankName}</h3>
                                <p className="flex items-center gap-1 text-red-100 text-sm mt-1 font-medium">
                                    <MapPin size={14}/> {selectedBank.city}
                                </p>
                            </div>
                            <button 
                                onClick={() => setSelectedBank(null)}
                                className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors"
                            >
                                <PlusCircle className="rotate-45" size={24}/>
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="flex items-center gap-2 mb-6 text-gray-800 font-bold border-b pb-4">
                                <Droplets className="text-red-500" size={20}/>
                                Current Stock Availability
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {selectedBank.stocks.map((stock, idx) => (
                                    <div key={idx} className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col items-center gap-2 hover:border-red-200 transition-colors group/item">
                                        <div className="w-10 h-10 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-black text-sm ring-4 ring-white shadow-sm">
                                            {stock.group}
                                        </div>
                                        {editingStockId === stock.id ? (
                                            <div className="flex flex-col items-center gap-2">
                                                <input 
                                                    type="number" 
                                                    value={editValue} 
                                                    onChange={(e) => setEditValue(e.target.value)}
                                                    autoFocus
                                                    className="w-20 text-center text-xl font-bold bg-white border border-red-300 rounded focus:ring-2 focus:ring-red-500 outline-none"
                                                />
                                                <div className="flex gap-1">
                                                    <button 
                                                        disabled={updating}
                                                        onClick={() => handleUpdateStock(stock.id, stock.group)}
                                                        className="text-[10px] bg-green-600 text-white px-2 py-1 rounded font-bold hover:bg-green-700 disabled:opacity-50"
                                                    >
                                                        {updating ? '...' : 'SAVE'}
                                                    </button>
                                                    <button 
                                                        onClick={() => setEditingStockId(null)}
                                                        className="text-[10px] bg-gray-400 text-white px-2 py-1 rounded font-bold"
                                                    >
                                                        ESC
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                                    {stock.units}
                                                    {(user?.role === 'ADMIN' || user?.role === 'RECEPTION') && (
                                                        <button 
                                                            onClick={() => {
                                                                setEditingStockId(stock.id);
                                                                setEditValue(stock.units);
                                                            }}
                                                            className="opacity-0 group-hover/item:opacity-100 p-1 hover:text-red-600 transition-opacity"
                                                            title="Edit units"
                                                        >
                                                            <PlusCircle className="rotate-0 text-gray-400 hover:text-red-500" size={14}/>
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Units Available</div>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {selectedBank.stocks.length === 0 && (
                                <div className="text-center py-10 text-gray-400">
                                    No blood groups available at this time.
                                </div>
                            )}

                            <div className="mt-8 flex justify-between items-center text-xs font-semibold text-gray-400 border-t pt-4">
                                <span>Last updated on {new Date(selectedBank.lastUpdated).toLocaleDateString()}</span>
                                <span className="text-green-600 flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                    Verified Stock
                                </span>
                            </div>
                        </div>

                        <div className="p-6 bg-gray-50 flex justify-end">
                            <button 
                                onClick={() => setSelectedBank(null)}
                                className="px-6 py-2.5 bg-gray-900 text-white rounded-lg font-bold hover:bg-red-600 transition shadow-lg"
                            >
                                Close View
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BloodBank;
