import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import SignOutModal from './auth/SignOutModal';

const NavBar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [showSignOutModal, setShowSignOutModal] = useState(false);
    const location = useLocation();
    const { isAuthenticated, user } = useAuth();

    const isActive = (path) => {
        return location.pathname === path;
    };

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Dashboard', path: '/dashboard' },
        { name: 'Pricing', path: '/pricing' },
    ];

    return (
        <nav className="bg-gray-900 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            <Link to="/" className="text-white text-xl font-bold">
                                🛡️ BotGuard
                            </Link>
                        </div>
                        <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`${isActive(link.path)
                                        ? 'border-blue-500 text-white'
                                        : 'border-transparent text-gray-300 hover:border-gray-300 hover:text-white'
                                        } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition duration-300`}
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                    <div className="hidden sm:ml-6 sm:flex sm:items-center">
                        {isAuthenticated ? (
                            <div className="flex items-center space-x-4">
                                <div className="text-right">
                                    <p className="text-sm text-gray-300">Welcome back,</p>
                                    <p className="text-white font-medium">{user?.name || 'User'}</p>
                                </div>
                                <div className="relative">
                                    <button
                                        onClick={() => setShowSignOutModal(true)}
                                        className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition duration-300"
                                    >
                                        <span className="text-white font-medium text-sm">
                                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                                        </span>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <Link
                                to="/auth"
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition duration-300"
                            >
                                Sign In
                            </Link>
                        )}
                    </div>
                    <div className="-mr-2 flex items-center sm:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="bg-gray-900 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                        >
                            <span className="sr-only">Open main menu</span>
                            {!isOpen ? (
                                <svg
                                    className="block h-6 w-6"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            ) : (
                                <svg
                                    className="block h-6 w-6"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {isOpen && (
                <div className="sm:hidden">
                    <div className="pt-2 pb-3 space-y-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`${isActive(link.path)
                                    ? 'bg-gray-800 border-blue-500 text-white'
                                    : 'border-transparent text-gray-300 hover:bg-gray-700 hover:border-gray-300 hover:text-white'
                                    } block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition duration-300`}
                                onClick={() => setIsOpen(false)}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>
                    <div className="pt-4 pb-3 border-t border-gray-700">
                        <div className="px-4">
                            {isAuthenticated ? (
                                <div className="space-y-3">
                                    <div className="text-center">
                                        <p className="text-gray-300 text-sm">Welcome back,</p>
                                        <p className="text-white font-medium">{user?.name || 'User'}</p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setIsOpen(false);
                                            setShowSignOutModal(true);
                                        }}
                                        className="bg-red-600 hover:bg-red-700 text-white block px-4 py-2 rounded-md text-base font-medium w-full text-center transition duration-300"
                                    >
                                        Sign Out
                                    </button>
                                </div>
                            ) : (
                                <Link
                                    to="/auth"
                                    className="bg-blue-600 hover:bg-blue-700 text-white block px-4 py-2 rounded-md text-base font-medium w-full text-center transition duration-300"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Sign In
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Sign Out Modal */}
            <SignOutModal
                isOpen={showSignOutModal}
                onClose={() => setShowSignOutModal(false)}
            />
        </nav>
    );
};

export default NavBar;