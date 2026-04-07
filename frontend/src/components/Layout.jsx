import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const Layout = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Outlet />
            </main>
            <footer className="bg-gray-800 text-gray-300 py-6">
                <div className="container mx-auto px-4 text-center">
                    <p>&copy; 2026 Blood Drop. Saving Lives Together.</p>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
