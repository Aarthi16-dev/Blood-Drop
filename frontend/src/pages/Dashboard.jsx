import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Dashboard = () => {
    const { user } = useContext(AuthContext);

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-4">Welcome, {user?.name}!</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                        <h3 className="font-bold text-red-800">Your Blood Group</h3>
                        <p className="text-2xl font-bold text-red-600">{user?.bloodGroup || 'N/A'}</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <h3 className="font-bold text-blue-800">Total Donations</h3>
                        <p className="text-2xl font-bold text-blue-600">0</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                        <h3 className="font-bold text-green-800">Status</h3>
                        <p className="text-2xl font-bold text-green-600">{user?.available ? 'Available' : 'Unavailable'}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold mb-4">Urgent Blood Requests Nearby</h3>
                <p className="text-gray-500 italic">No urgent requests found at the moment.</p>
            </div>
        </div>
    );
};

export default Dashboard;
