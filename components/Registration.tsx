import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Lock, User, Phone, Eye, EyeOff, Sparkles, CheckCircle, Loader2 } from 'lucide-react';
import { authAPI } from '../utils/api';

const Registration: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Phone number must be 10 digits';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // Clean phone number (remove all non-digit characters)
      const cleanPhone = formData.phone.replace(/\D/g, '');
      
      console.log('📝 Registration attempt:', {
        fullName: formData.fullName,
        email: formData.email,
        phone: cleanPhone
      });
      
      const result = await authAPI.signup(
        formData.fullName,
        formData.email,
        cleanPhone,
        formData.password,
        formData.confirmPassword
      );

      console.log('✅ Registration successful:', result);
      setSuccessMessage('Account created successfully! Redirecting...');
      
      // Navigate to home after successful registration
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (error) {
      console.error('❌ Registration error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Registration failed. Please try again.';
      setErrors({ submit: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-mint-50 via-pastel-pink/20 to-pastel-blue/20 py-12 px-4">
      {/* Decorative Background Elements */}
      <div className="fixed top-0 right-0 w-96 h-96 bg-pastel-yellow rounded-full -mr-48 -mt-48 opacity-20 blur-3xl"></div>
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-pastel-blue rounded-full -ml-48 -mb-48 opacity-20 blur-3xl"></div>

      <div className="relative max-w-2xl mx-auto">
        {/* Back Button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-emerald-700 hover:text-emerald-900 mb-6 group transition-colors"
        >
          <ArrowLeft className="group-hover:-translate-x-1 transition-transform" size={20} />
          <span className="font-medium">Back to Home</span>
        </Link>

        {/* Registration Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-8 py-10 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
            <div className="relative">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-4 shadow-lg">
                <Sparkles className="text-white" size={40} />
              </div>
              <h1 className="text-4xl font-serif font-bold text-white mb-2">
                Create Your Account
              </h1>
              <p className="text-emerald-50 text-lg">
                Join Kadarla Designs and discover handcrafted treasures
              </p>
            </div>
          </div>

          {/* Form Section */}
          <div className="p-8 md:p-12">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-semibold text-emerald-900 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <User className="text-emerald-400" size={20} />
                  </div>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className={`w-full pl-12 pr-4 py-3.5 bg-white border-2 rounded-xl text-emerald-900 placeholder-emerald-300 focus:outline-none focus:ring-2 transition-all shadow-sm ${
                      errors.fullName
                        ? 'border-red-300 focus:ring-red-300 focus:border-red-400'
                        : 'border-emerald-100 focus:ring-emerald-300 focus:border-emerald-400'
                    }`}
                  />
                </div>
                {errors.fullName && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <span>•</span> {errors.fullName}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-emerald-900 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <Mail className="text-emerald-400" size={20} />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your.email@example.com"
                    className={`w-full pl-12 pr-4 py-3.5 bg-white border-2 rounded-xl text-emerald-900 placeholder-emerald-300 focus:outline-none focus:ring-2 transition-all shadow-sm ${
                      errors.email
                        ? 'border-red-300 focus:ring-red-300 focus:border-red-400'
                        : 'border-emerald-100 focus:ring-emerald-300 focus:border-emerald-400'
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <span>•</span> {errors.email}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-emerald-900 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <Phone className="text-emerald-400" size={20} />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="1234567890"
                    className={`w-full pl-12 pr-4 py-3.5 bg-white border-2 rounded-xl text-emerald-900 placeholder-emerald-300 focus:outline-none focus:ring-2 transition-all shadow-sm ${
                      errors.phone
                        ? 'border-red-300 focus:ring-red-300 focus:border-red-400'
                        : 'border-emerald-100 focus:ring-emerald-300 focus:border-emerald-400'
                    }`}
                  />
                </div>
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <span>•</span> {errors.phone}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-emerald-900 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <Lock className="text-emerald-400" size={20} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="At least 8 characters"
                    className={`w-full pl-12 pr-12 py-3.5 bg-white border-2 rounded-xl text-emerald-900 placeholder-emerald-300 focus:outline-none focus:ring-2 transition-all shadow-sm ${
                      errors.password
                        ? 'border-red-300 focus:ring-red-300 focus:border-red-400'
                        : 'border-emerald-100 focus:ring-emerald-300 focus:border-emerald-400'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-4 flex items-center text-emerald-400 hover:text-emerald-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <span>•</span> {errors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-semibold text-emerald-900 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <Lock className="text-emerald-400" size={20} />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter your password"
                    className={`w-full pl-12 pr-12 py-3.5 bg-white border-2 rounded-xl text-emerald-900 placeholder-emerald-300 focus:outline-none focus:ring-2 transition-all shadow-sm ${
                      errors.confirmPassword
                        ? 'border-red-300 focus:ring-red-300 focus:border-red-400'
                        : 'border-emerald-100 focus:ring-emerald-300 focus:border-emerald-400'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-4 flex items-center text-emerald-400 hover:text-emerald-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <span>•</span> {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Success Message */}
              {successMessage && (
                <div className="p-4 bg-emerald-50 border-2 border-emerald-200 rounded-xl text-emerald-700 font-medium">
                  {successMessage}
                </div>
              )}

              {/* Error Message */}
              {errors.submit && (
                <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-700 font-medium">
                  {errors.submit}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl hover:from-emerald-600 hover:to-emerald-700 transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2 mt-8 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={22} />
                    Creating Account...
                  </>
                ) : (
                  <>
                    <CheckCircle size={22} />
                    Create Account
                  </>
                )}
              </button>

              {/* Login Link */}
              <div className="text-center pt-4">
                <p className="text-emerald-700">
                  Already have an account?{' '}
                  <Link
                    to="/"
                    className="font-semibold text-emerald-600 hover:text-emerald-800 underline transition-colors"
                  >
                    Sign In
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Registration;

