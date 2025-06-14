import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Redux actions
import { loginUser, clearError } from '@/store/slices/authSlice';

// Utils
import { isValidEmail } from '@/utils/validationUtils';

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error, isAuthenticated, loginAttempts } = useSelector(state => state.auth);

  // Clear error when component mounts
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Redirect if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const validateForm = () => {
    const errors = {};
    
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Don't clear global error immediately when typing
    // Let it persist so user can see the login error
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Clear any previous errors before attempting login
    if (error) {
      dispatch(clearError());
    }

    console.log('Login attempt:', formData);
    console.log('API Base URL:', process.env.REACT_APP_API_BASE_URL);

    try {
      const result = await dispatch(loginUser(formData)).unwrap();
      console.log('Login successful:', result);
      // Navigation handled by useEffect
    } catch (error) {
      // Error handled by Redux
      console.error('Login failed:', error);
    }
  };

  const isFormValid = formData.email && formData.password && Object.keys(validationErrors).length === 0;
  const isBlocked = loginAttempts >= 3;

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="space-y-1 text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-white font-bold text-xl">HR</span>
        </div>
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Welcome Back
        </CardTitle>
        <p className="text-gray-600">Sign in to your HRMS account</p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive" className="animate-in slide-in-from-top-2 duration-300">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isBlocked && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Too many failed attempts. Please try again later.
            </AlertDescription>
          </Alert>
        )}

        {/* Debug API Test */}
        <div className="mb-4 p-3 bg-gray-100 rounded">
          <button
            type="button"
            onClick={() => {
              console.log('Testing API...');
              fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api'}/auth/health`)
                .then(res => res.json())
                .then(data => {
                  console.log('API Health Response:', data);
                  alert(`API Health: ${JSON.stringify(data)}`);
                })
                .catch(err => {
                  console.error('API Error:', err);
                  alert(`API Error: ${err.message}`);
                });
            }}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
          >
            Test API Connection
          </button>
          <p className="text-xs mt-1">API URL: {process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api'}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`pl-10 transition-all duration-200 ${
                  validationErrors.email ? 'border-red-500 focus:border-red-500' : ''
                }`}
                disabled={isLoading || isBlocked}
                autoComplete="email"
              />
            </div>
            {validationErrors.email && (
              <p className="text-sm text-red-500 animate-in slide-in-from-top-1 duration-200">
                {validationErrors.email}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className={`pl-10 pr-10 transition-all duration-200 ${
                  validationErrors.password ? 'border-red-500 focus:border-red-500' : ''
                }`}
                disabled={isLoading || isBlocked}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                disabled={isLoading || isBlocked}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {validationErrors.password && (
              <p className="text-sm text-red-500 animate-in slide-in-from-top-1 duration-200">
                {validationErrors.password}
              </p>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
            disabled={isLoading || !isFormValid || isBlocked}
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Signing in...</span>
              </div>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>

        <div className="text-center text-sm text-gray-600">
          <p>Demo Credentials:</p>
          <p className="text-xs">Admin: admin@hrms.com / admin123</p>
          <p className="text-xs">Manager: manager@hrms.com / Manager123!</p>
          <p className="text-xs">Employee: employee@hrms.com / Employee123!</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoginForm;
