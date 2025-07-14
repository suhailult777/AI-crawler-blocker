import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import SignInForm from './auth/SignInForm';
import SignUpForm from './auth/SignUpForm';
import ForgotPasswordForm from './auth/ForgotPasswordForm';

const AuthComponent = () => {
    const [activeTab, setActiveTab] = useState('signin');
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const { isAuthenticated, loading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated && !loading) {
            const from = location.state?.from?.pathname || '/dashboard';
            navigate(from, { replace: true });
        }
    }, [isAuthenticated, loading, navigate, location]);

    // Don't render if authenticated or still loading
    if (isAuthenticated || loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    const handleForgotPassword = () => {
        setShowForgotPassword(true);
    };

    const handleBackToSignIn = () => {
        setShowForgotPassword(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                {/* Header */}
                <div className="text-center">
                    <div className="flex justify-center">
                        <div className="text-4xl mb-4">🛡️</div>
                    </div>
                    <h2 className="text-3xl font-extrabold text-white">
                        {showForgotPassword ? 'Reset Password' : 'Welcome to BotGuard'}
                    </h2>
                    <p className="mt-2 text-sm text-gray-400">
                        {showForgotPassword
                            ? 'Enter your email to receive reset instructions'
                            : 'Protect your content and monetize bot traffic'
                        }
                    </p>
                </div>

                {/* Main Content */}
                <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 p-8">
                    {showForgotPassword ? (
                        <ForgotPasswordForm onBack={handleBackToSignIn} />
                    ) : (
                        <>
                            {/* Tab Navigation */}
                            <div className="flex mb-6">
                                <button
                                    onClick={() => setActiveTab('signin')}
                                    className={`flex-1 py-2 px-4 text-sm font-medium rounded-l-md transition duration-200 ${activeTab === 'signin'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                        }`}
                                >
                                    Sign In
                                </button>
                                <button
                                    onClick={() => setActiveTab('signup')}
                                    className={`flex-1 py-2 px-4 text-sm font-medium rounded-r-md transition duration-200 ${activeTab === 'signup'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                        }`}
                                >
                                    Sign Up
                                </button>
                            </div>

                            {/* Form Content */}
                            {activeTab === 'signin' ? (
                                <SignInForm onForgotPassword={handleForgotPassword} />
                            ) : (
                                <SignUpForm />
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="text-center">
                    <p className="text-xs text-gray-400">
                        By continuing, you agree to our{' '}
                        <a href="#" className="text-blue-400 hover:text-blue-300">
                            Terms of Service
                        </a>{' '}
                        and{' '}
                        <a href="#" className="text-blue-400 hover:text-blue-300">
                            Privacy Policy
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AuthComponent;