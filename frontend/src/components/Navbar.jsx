import { Link, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { MapPin, Droplets, User, LogOut } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="bg-red-600 text-white shadow-lg sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center space-x-2 font-bold text-2xl">
                            <Droplets size={28} />
                            <span>Blood Drop</span>
                        </Link>
                        <div className="hidden md:block ml-10">
                            <div className="flex items-baseline space-x-4">
                                <Link to="/search-donors" className="hover:bg-red-700 px-3 py-2 rounded-md text-sm font-medium">Find Donors</Link>
                                <Link to="/campaigns" className="hover:bg-red-700 px-3 py-2 rounded-md text-sm font-medium">Campaigns</Link>
                            </div>
                        </div>
                    </div>
                    <div className="hidden md:block">
                        <div className="ml-4 flex items-center md:ml-6">
                            {user ? (
                                <div className="flex items-center space-x-4">
                                    <Link to="/dashboard" className="flex items-center space-x-1 hover:text-red-200">
                                        <User size={20} />
                                        <span>{user.name}</span>
                                    </Link>
                                    <button onClick={handleLogout} className="bg-red-800 hover:bg-red-900 px-3 py-1 rounded flex items-center space-x-1">
                                        <LogOut size={16} />
                                        <span>Logout</span>
                                    </button>
                                </div>
                            ) : (
                                <div className="space-x-2">
                                    <Link to="/login" className="hover:text-red-200 font-medium">Login</Link>
                                    <Link to="/register" className="bg-white text-red-600 hover:bg-red-100 px-4 py-2 rounded-md font-medium shadow-sm transition-colors">Register</Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
