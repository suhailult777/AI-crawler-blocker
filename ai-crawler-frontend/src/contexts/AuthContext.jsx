import { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { authAPI, userAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);



  // Load user from localStorage on app start and verify with backend
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = localStorage.getItem('botguard_user');
        const storedToken = localStorage.getItem('botguard_token');

        if (storedUser && storedToken) {
          const userData = JSON.parse(storedUser);
          try {
            // Verify the token is still valid by making an API call
            await userAPI.getProfile(userData.id);
            setUser(userData);
            setIsAuthenticated(true);
          } catch (error) {
            // Token is invalid, clear auth data
            console.error('Token validation failed:', error);
            localStorage.removeItem('botguard_user');
            localStorage.removeItem('botguard_token');
          }
        }
      } catch (error) {
        console.error('Error loading user from localStorage:', error);
        localStorage.removeItem('botguard_user');
        localStorage.removeItem('botguard_token');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);



  // Sign in function
  const signIn = async (email, password, rememberMe = false) => {
    setLoading(true);

    try {
      const response = await authAPI.signIn({ email, password });

      if (response.success && response.data) {
        const { user: userData, token } = response.data;

        setUser(userData);
        setIsAuthenticated(true);

        // Store in localStorage if remember me is checked or always for now
        if (rememberMe || true) { // Always store for now
          localStorage.setItem('botguard_user', JSON.stringify(userData));
          localStorage.setItem('botguard_token', token);
        }

        toast.success(`Welcome back, ${userData.name}!`);
        return { success: true, user: userData };
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      const errorMessage = error.message || 'Sign in failed';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Sign up function
  const signUp = async (userData) => {
    setLoading(true);

    try {
      const response = await authAPI.signUp(userData);

      if (response.success && response.data) {
        const { user: newUser, token } = response.data;

        setUser(newUser);
        setIsAuthenticated(true);

        // Store in localStorage
        localStorage.setItem('botguard_user', JSON.stringify(newUser));
        localStorage.setItem('botguard_token', token);

        toast.success(`Welcome to AI Crawler, ${newUser.name}! Your account has been created successfully.`);
        return { success: true, user: newUser };
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      const errorMessage = error.message || 'Sign up failed';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Sign out function
  const signOut = async () => {
    setLoading(true);

    try {
      // Call backend signout (optional, mainly for token invalidation)
      try {
        await authAPI.signOut();
      } catch (error) {
        // Don't fail signout if backend call fails
        console.error('Backend signout failed:', error);
      }

      setUser(null);
      setIsAuthenticated(false);

      // Clear localStorage
      localStorage.removeItem('botguard_user');
      localStorage.removeItem('botguard_token');

      toast.success('You have been signed out successfully');
      return { success: true };
    } catch (error) {
      toast.error('Error signing out');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Forgot password function
  const forgotPassword = async (email) => {
    setLoading(true);

    try {
      // Simulate API call delay
      await simulateApiDelay();

      // Check if email exists
      if (!mockUsers[email]) {
        throw new Error('No account found with this email address');
      }

      toast.success('Password reset instructions have been sent to your email');
      return { success: true };
    } catch (error) {
      toast.error(error.message || 'Failed to send reset email');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (updates) => {
    setLoading(true);

    try {
      // Simulate API call delay
      await simulateApiDelay();

      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);

      // Update localStorage
      localStorage.setItem('botguard_user', JSON.stringify(updatedUser));

      toast.success('Profile updated successfully');
      return { success: true, user: updatedUser };
    } catch (error) {
      toast.error('Failed to update profile');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Social login function
  const socialLogin = async (provider) => {
    setLoading(true);

    try {
      // Simulate API call delay
      await simulateApiDelay();

      // Mock social login success
      const socialUser = {
        id: Date.now(),
        name: `${provider} User`,
        email: `user@${provider.toLowerCase()}.com`,
        subscriptionTier: 'free',
        avatar: null,
        joinDate: new Date().toISOString().split('T')[0],
        emailVerified: true,
        provider
      };

      setUser(socialUser);
      setIsAuthenticated(true);

      // Store in localStorage
      localStorage.setItem('botguard_user', JSON.stringify(socialUser));
      localStorage.setItem('botguard_token', `mock_token_${Date.now()}`);

      toast.success(`Successfully signed in with ${provider}!`);
      return { success: true, user: socialUser };
    } catch (error) {
      toast.error(`Failed to sign in with ${provider}`);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    signIn,
    signUp,
    signOut,
    forgotPassword,
    updateProfile,
    socialLogin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
