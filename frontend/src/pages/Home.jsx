import { Link } from 'react-router-dom';
import { Heart, Search, Users, Activity } from 'lucide-react';

const Home = () => {
    return (
        <div className="space-y-16">
            {/* Hero Section */}
            <section className="text-center space-y-6 py-12">
                <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight">
                    Donate Blood, <span className="text-red-600">Save a Life</span>
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    Be a hero in someone's life. Connect with donors nearby, track requests, and make a difference today.
                </p>
                <div className="flex justify-center gap-4">
                    <Link to="/register" className="px-8 py-3 bg-red-600 text-white font-bold rounded-lg shadow-lg hover:bg-red-700 transition transform hover:scale-105">
                        Register as Donor
                    </Link>
                    <Link to="/requests" className="px-8 py-3 bg-white text-red-600 border border-red-600 font-bold rounded-lg shadow-md hover:bg-red-50 transition transform hover:scale-105">
                        Find Blood
                    </Link>
                </div>
            </section>

            {/* Feature Cards */}
            <section className="grid md:grid-cols-3 gap-8">
                <div className="bg-white p-8 rounded-xl shadow-md text-center hover:shadow-xl transition-shadow">
                    <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                        <Search size={32} />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Find Donors Easily</h3>
                    <p className="text-gray-600">Locate compatible blood donors in your vicinity using our map integration.</p>
                </div>
                <div className="bg-white p-8 rounded-xl shadow-md text-center hover:shadow-xl transition-shadow">
                    <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                        <Activity size={32} />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Real-time Requests</h3>
                    <p className="text-gray-600">Post urgent blood requests and notify nearby donors instantly.</p>
                </div>
                <div className="bg-white p-8 rounded-xl shadow-md text-center hover:shadow-xl transition-shadow">
                    <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                        <Users size={32} />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Community Driven</h3>
                    <p className="text-gray-600">Join a network of thousands of donors and recipients working together.</p>
                </div>
            </section>
        </div>
    );
};

export default Home;
