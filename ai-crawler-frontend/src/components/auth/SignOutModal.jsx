import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const SignOutModal = ({ isOpen, onClose }) => {
  const [isSigningOut, setIsSigningOut] = useState(false);
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    setIsSigningOut(true);
    
    try {
      const result = await signOut();
      if (result.success) {
        onClose();
        navigate('/', { replace: true });
      }
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setIsSigningOut(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 max-w-md w-full">
        <div className="text-center">
          {/* Icon */}
          <div className="text-4xl mb-4">👋</div>
          
          {/* Title */}
          <h3 className="text-lg font-semibold text-white mb-2">
            Sign out of BotGuard?
          </h3>
          
          {/* Message */}
          <p className="text-gray-300 text-sm mb-6">
            {user?.name ? `Goodbye, ${user.name}! ` : ''}
            You'll need to sign in again to access your dashboard and settings.
          </p>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              disabled={isSigningOut}
              className="flex-1 py-2 px-4 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
            >
              Cancel
            </button>
            
            <button
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
            >
              {isSigningOut ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing out...
                </div>
              ) : (
                'Sign Out'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignOutModal;
