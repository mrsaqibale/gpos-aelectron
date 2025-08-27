import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { ArrowLeft, Key, Shield, CheckCircle, X, Sparkles } from 'lucide-react';

const LicenseScreen = () => {
  const navigate = useNavigate();
  const { themeColors } = useTheme();
  const [licenseKey, setLicenseKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState(null);

  const handleBackToWelcome = () => {
    console.log('Back to Welcome clicked, navigating to /');
    navigate('/');
  };

  const handleValidateLicense = async () => {
    if (!licenseKey.trim()) {
      return;
    }

    setIsValidating(true);
    
    // Simulate license validation
    setTimeout(() => {
      // For demo purposes, accept any non-empty license key
      const isValidLicense = licenseKey.trim().length > 0;
      setIsValid(isValidLicense);
      setIsValidating(false);
      
      if (isValidLicense) {
        // Navigate to login after successful validation
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      }
    }, 2000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleValidateLicense();
    }
  };

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{ backgroundColor: themeColors.dashboardBackground }}
    >
      {/* Close button */}
      <button
        onClick={() => window.loginWindowControls?.close()}
        className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors duration-200 rounded-full border border-gray-300 hover:border-red-300 z-50"
        title="Close Application"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-32 h-32 rounded-full" style={{ backgroundColor: themeColors.primary }}></div>
        <div className="absolute top-40 right-32 w-24 h-24 rounded-full" style={{ backgroundColor: themeColors.primaryLight }}></div>
        <div className="absolute bottom-32 left-32 w-28 h-28 rounded-full" style={{ backgroundColor: themeColors.primary }}></div>
        <div className="absolute bottom-20 right-20 w-20 h-20 rounded-full" style={{ backgroundColor: themeColors.primaryLight }}></div>
      </div>

             {/* Main Content */}
       <div className="relative z-10 text-center px-6 max-w-md mx-auto">
         
         {/* Back Button */}
         <button
           onClick={handleBackToWelcome}
           className="mb-8 flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors duration-200 hover:scale-105 mx-auto px-4 py-2 rounded-lg hover:bg-gray-100 active:scale-95"
         >
           <ArrowLeft className="w-5 h-5" />
           <span className="font-medium">Back to Welcome</span>
         </button>

        {/* License Icon */}
        <div className="mb-8 transform hover:scale-105 transition-transform duration-300">
          <div 
            className="w-24 h-24 mx-auto rounded-2xl border-4 flex items-center justify-center mb-6 shadow-2xl"
            style={{ 
              backgroundColor: themeColors.primary, 
              borderColor: themeColors.primaryLight,
              boxShadow: `0 20px 40px rgba(0, 0, 0, 0.1), 0 0 0 1px ${themeColors.primaryLight}20`
            }}
          >
            <Key className="w-12 h-12 text-white" />
          </div>
          
          {/* Sparkles around icon */}
          <div className="relative">
            <Sparkles 
              className="absolute -top-2 -left-2 w-4 h-4 animate-pulse" 
              style={{ color: themeColors.primaryLight }}
            />
            <Sparkles 
              className="absolute -top-2 -right-2 w-4 h-4 animate-pulse" 
              style={{ color: themeColors.primaryLight }}
            />
            <Sparkles 
              className="absolute -bottom-2 -left-2 w-4 h-4 animate-pulse" 
              style={{ color: themeColors.primaryLight }}
            />
            <Sparkles 
              className="absolute -bottom-2 -right-2 w-4 h-4 animate-pulse" 
              style={{ color: themeColors.primaryLight }}
            />
          </div>
        </div>

        {/* Title */}
        <div className="mb-8">
          <h1 
            className="text-3xl font-bold mb-4 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent"
          >
            License Verification
          </h1>
          <p className="text-gray-600 mb-2 font-medium">
            Enter your license key to continue
          </p>
          <p className="text-gray-500 text-sm">
            Please provide your valid license key to access GPOS
          </p>
        </div>

        {/* License Input */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              value={licenseKey}
              onChange={(e) => setLicenseKey(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter your license key..."
              className={`w-full px-4 py-4 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-4 text-center font-mono text-lg ${
                isValid === null 
                  ? 'border-gray-300 focus:border-blue-500 focus:ring-blue-100' 
                  : isValid 
                    ? 'border-green-500 focus:border-green-500 focus:ring-green-100' 
                    : 'border-red-500 focus:border-red-500 focus:ring-red-100'
              }`}
              style={{ 
                backgroundColor: 'white',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
              }}
            />
            
            {/* Status Icon */}
            {isValid !== null && (
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                {isValid ? (
                  <CheckCircle className="w-6 h-6 text-green-500" />
                ) : (
                  <X className="w-6 h-6 text-red-500" />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Validate Button */}
        <div className="mb-6">
          <button
            onClick={handleValidateLicense}
            disabled={!licenseKey.trim() || isValidating}
            className={`group relative w-full px-8 py-4 rounded-xl cursor-pointer font-semibold text-lg transition-all duration-300 transform shadow-sm ${
              !licenseKey.trim() || isValidating 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:scale-105'
            }`}
            style={{
              backgroundColor: themeColors.primary,
              color: 'white',
              boxShadow: `0 8px 25px ${themeColors.primary}40`
            }}
          >
            {isValidating ? (
              <span className="flex items-center justify-center gap-3">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Validating License...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-3">
                <Shield className="w-5 h-5" />
                Validate License
              </span>
            )}
            
            {/* Button glow effect */}
            <div 
              className={`absolute inset-0 rounded-xl transition-opacity duration-300 ${
                !licenseKey.trim() || isValidating ? 'opacity-0' : 'opacity-0 hover:opacity-100'
              }`}
              style={{
                background: `linear-gradient(45deg, ${themeColors.primary}, ${themeColors.primaryLight})`,
                filter: 'blur(5px)',
                zIndex: -1
              }}
            />
          </button>
        </div>

        {/* Success Message */}
        {isValid && (
          <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-500" />
              <div>
                <p className="font-semibold text-green-800">License Valid!</p>
                <p className="text-sm text-green-600">Redirecting to login...</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {isValid === false && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200">
            <div className="flex items-center gap-3">
              <X className="w-6 h-6 text-red-500" />
              <div>
                <p className="font-semibold text-red-800">Invalid License</p>
                <p className="text-sm text-red-600">Please check your license key and try again.</p>
              </div>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div 
          className="p-4 rounded-xl text-left"
          style={{ 
            backgroundColor: 'white',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
            border: `1px solid ${themeColors.primaryExtraLight}`
          }}
        >
          <div className="flex items-start gap-3">
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-1"
              style={{ backgroundColor: themeColors.primaryExtraLight }}
            >
              <Shield className="w-4 h-4" style={{ color: themeColors.primary }} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-1">License Information</h3>
              <p className="text-sm text-gray-600">
                Your license key ensures you have access to all GPOS features and updates. 
                Contact support if you need assistance with your license.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-10 right-10 opacity-20">
        <div 
          className="w-4 h-4 rounded-full animate-bounce"
          style={{ backgroundColor: themeColors.primary }}
        />
      </div>
      <div className="absolute bottom-10 left-10 opacity-20">
        <div 
          className="w-6 h-6 rounded-full animate-bounce"
          style={{ backgroundColor: themeColors.primaryLight }}
        />
      </div>
    </div>
  );
};

export default LicenseScreen;
