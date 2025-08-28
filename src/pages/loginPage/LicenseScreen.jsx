import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { ArrowLeft, Key, Shield, CheckCircle, X, Sparkles, Globe, Wifi, WifiOff } from 'lucide-react';

const LicenseScreen = () => {
  const navigate = useNavigate();
  const { themeColors } = useTheme();
  const [licenseKey, setLicenseKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState(null);
  const [apiResponse, setApiResponse] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [networkStatus, setNetworkStatus] = useState('checking'); // 'checking', 'online', 'offline'

  const handleBackToWelcome = () => {
    console.log('Back to Welcome clicked, navigating to /');
    navigate('/');
  };

  // Check network connectivity
  const checkNetworkStatus = async () => {
    try {
      setNetworkStatus('checking');
      const response = await fetch(`http://127.0.0.1:8080/api/v1/check/license/test`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });
      
      console.log('Network check - Status:', response.status);
      console.log('Network check - Headers:', response.headers);
      
      // If we get any response (even an error), the server is reachable
      setNetworkStatus('online');
    } catch (error) {
      console.log('Network check failed:', error);
      setNetworkStatus('offline');
    }
  };

  // License verification API function
  const verifyLicense = async (licenseKey) => {
    try {
      setNetworkStatus('checking');
      const response = await fetch(`http://127.0.0.1:8080/api/v1/check/license/${licenseKey}`, {
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        // Response is not JSON, get the text content
        const textResponse = await response.text();
        console.log('Non-JSON response:', textResponse);
        
        setApiResponse({
          status: 'error',
          message: 'Server returned non-JSON response',
          rawResponse: textResponse,
          statusCode: response.status
        });
        setNetworkStatus('online');
        
        return { 
          success: false, 
          error: 'INVALID_RESPONSE', 
          message: `Server returned ${response.status}: ${textResponse.substring(0, 100)}...` 
        };
      }
      
      const result = await response.json();
      
      console.log('API Response:', result);
      setApiResponse(result);
      setNetworkStatus('online');
      
      if (result.status === 'ok') {
        return {
          success: true,
          hotel: result.hotel,
          isActive: result.hotel.status,
          isExpired: new Date(result.hotel.validUntil) < new Date()
        };
      } else {
        return { 
          success: false, 
          error: 'INVALID_LICENSE', 
          message: result.message 
        };
      }
    } catch (error) {
      console.error('License verification error:', error);
      setNetworkStatus('offline');
      
      // Set a more detailed error response
      setApiResponse({
        status: 'error',
        message: 'Network or parsing error',
        error: error.message,
        type: error.name
      });
      
      return { 
        success: false, 
        error: 'NETWORK_ERROR', 
        message: error.message 
      };
    }
  };

  const handleValidateLicense = async () => {
    if (!licenseKey.trim()) {
      return;
    }

    setIsValidating(true);
    setApiResponse(null);
    setErrorMessage('');
    
    try {
      // Verify license with real API
      const verificationResult = await verifyLicense(licenseKey);
      
      if (verificationResult.success) {
        // Check if license is active and not expired
        if (verificationResult.isActive && !verificationResult.isExpired) {
          // Check if hotel table exists and has data
          const tableCheck = await window.myAPI.checkHotelTable();
          if (!tableCheck.success) {
            throw new Error('Failed to check hotel table');
          }

          // Create or update hotel record with licensed status (90500)
          const hotelData = {
            name: verificationResult.hotel.hotelName || 'GPOS Restaurant',
            status: 90500, // Licensed status
            active: true,
            isDelete: false,
            isSyncronized: false
          };

          const result = await window.myAPI.createOrUpdateHotel(hotelData);
          if (!result.success) {
            throw new Error(result.message || 'Failed to update hotel status');
          }

          setIsValid(true);
          setIsValidating(false);
          
          // Navigate to welcome screen after successful validation
          setTimeout(() => {
            navigate('/');
          }, 3000); // Increased delay to show API response
        } else {
          setIsValid(false);
          setIsValidating(false);
          setErrorMessage(verificationResult.isExpired ? 'License has expired' : 'License is inactive');
        }
      } else {
        setIsValid(false);
        setIsValidating(false);
        setErrorMessage(verificationResult.message || 'Invalid license key');
      }
    } catch (error) {
      console.error('Error validating license:', error);
      setIsValid(false);
      setIsValidating(false);
      setErrorMessage(error.message);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleValidateLicense();
    }
  };

  // Check network status on component mount
  useEffect(() => {
    checkNetworkStatus();
  }, []);

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
          
          {/* Network Status Indicator */}
          <div className="mt-4 flex items-center justify-center gap-2">
            {networkStatus === 'checking' && (
              <>
                <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm text-blue-600">Checking server connection...</span>
              </>
            )}
            {networkStatus === 'online' && (
              <>
                <Wifi className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-600">Server connected</span>
              </>
            )}
            {networkStatus === 'offline' && (
              <>
                <WifiOff className="w-4 h-4 text-red-500" />
                <span className="text-sm text-red-600">Server offline</span>
              </>
            )}
          </div>
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
          
          {/* Test License Key Button */}
          <div className="mt-3 text-center space-y-2">
            <button
              onClick={() => setLicenseKey('ABC123XYZ789DEF456GHI')}
              className="text-sm text-gray-500 hover:text-gray-700 underline block"
            >
              Use Test License Key
            </button>
            <button
              onClick={async () => {
                try {
                  const response = await fetch('http://127.0.0.1:8080/api/v1/check/license/test');
                  const text = await response.text();
                  console.log('Test endpoint response:', text);
                  setApiResponse({
                    status: 'test',
                    message: 'Test endpoint response',
                    rawResponse: text,
                    statusCode: response.status
                  });
                } catch (error) {
                  console.error('Test endpoint error:', error);
                  setApiResponse({
                    status: 'error',
                    message: 'Test endpoint failed',
                    error: error.message
                  });
                }
              }}
              className="text-sm text-blue-500 hover:text-blue-700 underline block"
            >
              Test API Endpoint
            </button>
          </div>
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
                <p className="text-sm text-red-600">
                  {errorMessage || 'Please check your license key and try again.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* API Response Display for Testing */}
        {apiResponse && (
          <div className="mb-6 p-4 rounded-xl bg-blue-50 border border-blue-200">
                          <div className="flex items-center gap-3 mb-3">
                <Globe className="w-6 h-6 text-blue-500" />
                <div>
                  <p className="font-semibold text-blue-800">API Response (Testing)</p>
                  <p className="text-sm text-blue-600">Server: 127.0.0.1:8080</p>
                </div>
              </div>
            
            <div className="bg-white p-3 rounded-lg border">
              <pre className="text-xs text-gray-700 overflow-x-auto whitespace-pre-wrap">
                {apiResponse.rawResponse ? 
                  `Status: ${apiResponse.statusCode || 'N/A'}\n\nRaw Response:\n${apiResponse.rawResponse}` : 
                  JSON.stringify(apiResponse, null, 2)
                }
              </pre>
            </div>
            
            {apiResponse.status === 'ok' && apiResponse.hotel && (
              <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="font-medium">Hotel:</span> {apiResponse.hotel.hotelName}</div>
                  <div><span className="font-medium">Admin:</span> {apiResponse.hotel.adminName}</div>
                  <div><span className="font-medium">Email:</span> {apiResponse.hotel.adminEmail}</div>
                  <div><span className="font-medium">Phone:</span> {apiResponse.hotel.adminPhone}</div>
                  <div><span className="font-medium">Valid Until:</span> {new Date(apiResponse.hotel.validUntil).toLocaleDateString()}</div>
                  <div><span className="font-medium">Status:</span> 
                    <span className={`ml-1 px-2 py-1 rounded text-xs ${
                      apiResponse.hotel.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {apiResponse.hotel.status ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            )}
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
