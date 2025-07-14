import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const SignOutPage = () => {
    const { signOut, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const handleSignOut = async () => {
            if (isAuthenticated) {
                await signOut();
            }
            navigate('/', { replace: true });
        };

        handleSignOut();
    }, [signOut, isAuthenticated, navigate]);

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-white">Signing you out...</p>
            </div>
        </div>
    );
};

export default SignOutPage;