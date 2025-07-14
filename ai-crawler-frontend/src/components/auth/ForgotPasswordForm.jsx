import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const ForgotPasswordForm = ({ onBack }) => {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { forgotPassword, loading } = useAuth();

  const validateEmail = (email) => {
    if (!email) {
      return 'Email is required';
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const emailError = validateEmail(email);
    if (emailError) {
      setErrors({ email: emailError });
      return;
    }

    setErrors({});
    const result = await forgotPassword(email);
    
    if (result.success) {
      setIsSubmitted(true);
    } else {
      setErrors({ submit: result.error });
    }
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: '' }));
    }
  };

  if (isSubmitted) {
    return (
      <div className="text-center space-y-6">
        <div className="text-6xl mb-4">📧</div>
        <div>
          <h3 className="text-lg font-medium text-white mb-2">
            Check your email
          </h3>
          <p className="text-gray-300 text-sm">
            We've sent password reset instructions to{' '}
            <span className="font-medium text-blue-400">{email}</span>
          </p>
        </div>
        
        <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
          <p className="text-sm text-blue-300">
            Didn't receive the email? Check your spam folder or try again in a few minutes.
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => {
              setIsSubmitted(false);
              setEmail('');
              setErrors({});
            }}
            className="w-full py-2 px-4 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200"
          >
            Try different email
          </button>
          
          <button
            onClick={onBack}
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-6">
        <div className="text-4xl mb-3">🔑</div>
        <p className="text-gray-300 text-sm">
          Enter your email address and we'll send you instructions to reset your password.
        </p>
      </div>

      {/* Email Field */}
      <div>
        <label htmlFor="reset-email" className="block text-sm font-medium text-gray-300 mb-2">
          Email Address
        </label>
        <input
          type="email"
          id="reset-email"
          value={email}
          onChange={handleEmailChange}
          className={`w-full px-3 py-2 bg-gray-700 border rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ${
            errors.email ? 'border-red-500' : 'border-gray-600'
          }`}
          placeholder="Enter your email address"
          disabled={loading}
          autoFocus
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-400">{errors.email}</p>
        )}
      </div>

      {/* Submit Error */}
      {errors.submit && (
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-3">
          <p className="text-sm text-red-400">{errors.submit}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
        >
          {loading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Sending instructions...
            </div>
          ) : (
            'Send Reset Instructions'
          )}
        </button>

        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="w-full py-2 px-4 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
        >
          Back to Sign In
        </button>
      </div>

      {/* Help Text */}
      <div className="text-center">
        <p className="text-xs text-gray-400">
          Remember your password?{' '}
          <button
            type="button"
            onClick={onBack}
            className="text-blue-400 hover:text-blue-300 transition duration-200"
            disabled={loading}
          >
            Sign in instead
          </button>
        </p>
      </div>
    </form>
  );
};

export default ForgotPasswordForm;
