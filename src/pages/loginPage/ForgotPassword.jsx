import React, { useState } from 'react';
import { X, Shield, Phone, Crown, Settings, DollarSign, Scissors, ChefHat, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

// Custom styles for scrollbar
const scrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 8px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-track {
    background: #032D3A;
    border-radius: 10px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #4a7ca3;
    border-radius: 10px;
    border: 1px solid #2d5a87;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #2d5a87;
  }
  
  .custom-scrollbar::-webkit-scrollbar-corner {
    background: #032D3A;
  }
`;


// Step 2: Phone Number Entry with Number Pad
const ResetPinStep2 = ({ isOpen, onClose, onNext, userInfo, resetFields }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedCountry, setSelectedCountry] = useState({ code: '+353', name: 'Ireland', flag: '🇮🇪' });
  const [showCountrySelector, setShowCountrySelector] = useState(false);
  const [countries, setCountries] = useState([]);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const { themeColors, currentTheme } = useTheme();

  // Get theme-specific styles
  const getThemeStyles = () => {
    switch (currentTheme) {
      case 'default':
        return {
          screenBg: '#003C58',
          logoBg: '#176B87',
          logoText: 'white',
          logoSubText: 'white',
          mainContentShadow: '0 8px 32px rgba(0,0,0,0.10), 0 0 10px rgba(0, 188, 212, 0.6)',
          mainContentBorder: '2px solid var(--primary-light, #00bcd4)',
          leftSectionBg: '#176B87',
          rightActionButtonsBg: '#176B87',
          roleButtonBg: '#003C58',
          roleButtonText: 'white',
          roleButtonBorder: '2px solid rgba(255, 255, 255, 0.3)',
          roleButtonSelectedBg: 'white',
          roleButtonSelectedText: '#003C58'
        };
      case 'blue':
        return {
          screenBg: 'white',
          logoBg: '#032C7E',
          logoText: 'white',
          logoSubText: 'black',
          mainContentShadow: '0 8px 32px rgba(0,0,0,0.10), 0 0 20px rgba(3, 45, 129, 0.3)',
          mainContentBorder: '2px solid #032d81',
          leftSectionBg: '#032C7E',
          rightActionButtonsBg: '#032C7E',
          roleButtonBg: 'white',
          roleButtonText: '#032D81',
          roleButtonBorder: 'var(--primary-light, #00bcd4)',
          roleButtonSelectedBg: '#032D81',
          roleButtonSelectedText: 'white'
        };
      case 'green':
        return {
          screenBg: '#136F63',
          logoBg: '#34A0A4',
          logoText: 'white',
          logoSubText: 'white',
          mainContentShadow: '0 8px 32px rgba(0,0,0,0.10), 0 0 10px rgba(0, 188, 212, 0.6)',
          mainContentBorder: '2px solid var(--primary-light, #00bcd4)',
          leftSectionBg: '#34A0A4',
          rightActionButtonsBg: '#136F63',
          roleButtonBg: '#136F63',
          roleButtonText: 'white',
          roleButtonBorder: 'var(--logo-box-bg, #176B87)',
          roleButtonSelectedBg: 'white',
          roleButtonSelectedText: '#34A0A4'
        };
      case 'black':
        return {
          screenBg: 'white',
          logoBg: '#000000',
          logoText: 'white',
          logoSubText: 'black',
          mainContentShadow: '0 8px 32px rgba(0,0,0,0.10), 0 0 20px rgba(0, 0, 0, 0.3)',
          mainContentBorder: '2.5px solid #e0e0e0',
          leftSectionBg: '#000000',
          rightActionButtonsBg: '#000000',
          roleButtonBg: 'white',
          roleButtonText: '#000000',
          roleButtonBorder: '1px solid #e0e0e0',
          roleButtonSelectedBg: '#000000',
          roleButtonSelectedText: 'white'
        };
      default:
        return {
          screenBg: '#003C58',
          logoBg: '#176B87',
          logoText: 'white',
          logoSubText: 'white',
          mainContentShadow: '0 8px 32px rgba(0,0,0,0.10), 0 0 10px rgba(0, 188, 212, 0.6)',
          mainContentBorder: '2px solid var(--primary-light, #00bcd4)',
          leftSectionBg: '#176B87',
          rightActionButtonsBg: '#176B87',
          roleButtonBg: '#003C58',
          roleButtonText: 'white',
          roleButtonBorder: '2px solid rgba(255, 255, 255, 0.3)',
          roleButtonSelectedBg: 'white',
          roleButtonSelectedText: '#003C58'
        };
    }
  };

  const themeStyles = getThemeStyles();

  // Fetch countries data
  const fetchCountries = async () => {
    setLoadingCountries(true);
    try {
      const response = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2,idd');
      const data = await response.json();
      
      const formattedCountries = data
        .filter(country => country.idd && country.idd.root)
        .map(country => ({
          code: country.idd.root + (country.idd.suffixes ? country.idd.suffixes[0] : ''),
          name: country.name.common,
          flag: country.cca2 ? String.fromCodePoint(...country.cca2.split('').map(c => 0x1F1E6 + c.charCodeAt(0) - 65)) : '🏳️'
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
      
      setCountries(formattedCountries);
    } catch (error) {
      console.error('Error fetching countries:', error);
      // Fallback to basic countries if API fails
      setCountries([
        { code: '+353', name: 'Ireland', flag: '🇮🇪' },
        { code: '+44', name: 'United Kingdom', flag: '🇬🇧' },
        { code: '+1', name: 'United States', flag: '🇺🇸' },
        { code: '+49', name: 'Germany', flag: '🇩🇪' },
        { code: '+33', name: 'France', flag: '🇫🇷' },
        { code: '+39', name: 'Italy', flag: '🇮🇹' },
        { code: '+34', name: 'Spain', flag: '🇪🇸' },
        { code: '+31', name: 'Netherlands', flag: '🇳🇱' },
        { code: '+32', name: 'Belgium', flag: '🇧🇪' },
        { code: '+41', name: 'Switzerland', flag: '🇨🇭' }
      ]);
    } finally {
      setLoadingCountries(false);
    }
  };

  React.useEffect(() => {
    if (resetFields) {
      setPhoneNumber('');
      setError('');
      setSelectedCountry({ code: '+353', name: 'Ireland', flag: '🇮🇪' });
    }
  }, [resetFields]);

  React.useEffect(() => {
    if (isOpen && countries.length === 0) {
      fetchCountries();
    }
  }, [isOpen]);

  const handleNumberClick = (number) => {
    setPhoneNumber(prev => prev + number);
    setError(''); // Clear error when typing
  };

  const handleClear = () => {
    setPhoneNumber('');
    setError('');
  };

  const handleBackspace = () => {
    setPhoneNumber(prev => prev.slice(0, -1));
    setError('');
  };

  const handleSendOTP = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Combine country code with phone number
      const fullPhoneNumber = selectedCountry.code + phoneNumber;
      
      // Call the backend to send OTP
      const result = await window.myAPI?.sendPasswordResetOTP(fullPhoneNumber, userInfo.role);
      
      if (result && result.success) {
        // OTP sent successfully, proceed to next step
        onNext({ ...userInfo, phoneNumber: fullPhoneNumber });
      } else {
        setError(result?.message || 'Failed to send OTP. Please try again.');
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      setError('Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const NumberButton = ({ number, onClick, style }) => (
    <button
      onClick={() => onClick(number)}
      className="rounded-xl py-1 px-0 shadow-lg cursor-pointer hover:shadow-xl font-bold text-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105"
      style={{
        backgroundColor: 'white',
        color: themeStyles.rightActionButtonsBg,
        border: `2px solid ${themeStyles.rightActionButtonsBg}`
      }}
    >
      {number}
    </button>
  );

  const ActionButton = ({
    onClick,
    className = "",
    children,
    variant = "default",
    disabled = false,
  }) => {
    const baseClasses =
      "px-0 rounded-lg text-sm font-semibold transition-all duration-200 border-[1.5px] flex items-center justify-center shadow-md hover:shadow-lg active:shadow-inner active:translate-y-0.5";

    const buttonStyle = {
      backgroundColor: themeStyles.rightActionButtonsBg,
      color: 'white',
      border: 'none',
    };

    return (
      <button
        onClick={onClick}
        className={`${baseClasses} ${className}`}
        style={buttonStyle}
        disabled={disabled}
      >
        {children}
      </button>
    );
  };

  if (!isOpen) return null;

  return (
    <>
      <style>{scrollbarStyles}</style>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div 
          className="rounded-3xl w-full max-w-lg mx-auto relative overflow-hidden"
          style={{
            boxShadow: themeStyles.mainContentShadow,
            border: themeStyles.mainContentBorder
          }}
        >
          {/* Header */}
          <div 
            className="p-6 text-center relative"
            style={{ backgroundColor: themeStyles.logoBg }}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-white hover:bg-white/20 transition-colors duration-200 rounded-lg"
              style={{ border: '1px solid rgba(255,255,255,0.35)', backgroundColor: 'transparent' }}
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 rounded-2xl border-2 flex flex-col items-center justify-center mx-auto mb-4 shadow-md"
              style={{ backgroundColor: themeStyles.logoBg, borderColor: themeStyles.logoBg }}
            >
              <Phone className="w-8 h-8" style={{ color: themeStyles.logoText }} />
            </div>
            <h2 className="text-2xl font-bold mb-1" style={{ color: themeStyles.logoText }}>Reset PIN</h2>
            <p className="text-sm opacity-80" style={{ color: themeStyles.logoText }}>Step 1 of 3</p>
          </div>

          {/* Content */}
          <div 
            className="p-6"
            style={{ backgroundColor: themeStyles.screenBg }}
          >
            <h3 className="text-lg font-semibold mb-4 text-center" style={{ color: themeStyles.logoSubText }}>
              Enter Phone Number
            </h3>
            
            <p className="text-sm mb-4 text-center" style={{ color: themeStyles.logoSubText }}>
              Role: <span className="font-semibold">{userInfo?.role}</span>
            </p>

            {/* Error Message */}
            {error && (
              <div className="mb-4 flex items-center justify-center gap-2 bg-red-50 text-red-500 p-3 rounded-lg border border-red-200">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}

            {/* Phone Number Display */}
            <div className="mb-6">
              <div className="flex justify-center items-center gap-2 mb-2">
                {/* Country Code Selector */}
                <div className="relative">
                  <button
                    onClick={() => setShowCountrySelector(!showCountrySelector)}
                    className="flex items-center bg-white border-2 rounded-lg px-3 py-3 shadow-inner hover:bg-gray-50 transition-colors"
                    style={{ borderColor: themeStyles.rightActionButtonsBg }}
                  >
                    <span className="text-lg mr-2">{selectedCountry.flag}</span>
                    <span className="font-mono text-sm" style={{ color: themeStyles.rightActionButtonsBg }}>
                      {selectedCountry.code}
                    </span>
                    <svg className="w-4 h-4 ml-1" style={{ color: themeStyles.rightActionButtonsBg }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {/* Country Dropdown */}
                  {showCountrySelector && (
                    <div className="absolute top-full left-0 mt-1 bg-white border-2 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto min-w-[200px]"
                      style={{ borderColor: themeStyles.rightActionButtonsBg }}
                    >
                      {loadingCountries ? (
                        <div className="p-3 text-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 mx-auto" style={{ borderColor: themeStyles.rightActionButtonsBg }}></div>
                          <p className="text-sm mt-2" style={{ color: themeStyles.logoSubText }}>Loading countries...</p>
                        </div>
                      ) : (
                        countries.map((country) => (
                          <button
                            key={country.code}
                            onClick={() => {
                              setSelectedCountry(country);
                              setShowCountrySelector(false);
                            }}
                            className="w-full flex items-center px-3 py-2 hover:bg-gray-100 text-left transition-colors"
                          >
                            <span className="text-lg mr-3">{country.flag}</span>
                            <span className="font-mono text-sm mr-2" style={{ color: themeStyles.rightActionButtonsBg }}>
                              {country.code}
                            </span>
                            <span className="text-sm text-gray-700">{country.name}</span>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
                
                {/* Phone Number Input */}
                <div className="flex items-center bg-white border-2 rounded-lg px-4 py-3 min-w-[150px] shadow-inner"
                  style={{ borderColor: themeStyles.rightActionButtonsBg }}
                >
                  <Phone className="w-5 h-5 mr-3" style={{ color: themeStyles.rightActionButtonsBg }} />
                  <span className="font-mono text-lg" style={{ color: themeStyles.rightActionButtonsBg }}>
                    {phoneNumber || "Enter number"}
                  </span>
                </div>
              </div>
              <p className="text-center text-sm" style={{ color: themeStyles.logoSubText }}>
                {phoneNumber.length} digits
              </p>
            </div>

            {/* Number Pad */}
            <div className="max-w-xs mx-auto mb-6">
              {/* First 3 rows */}
              <div className="grid grid-cols-3 gap-3 mb-3">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
                  <NumberButton
                    key={number}
                    number={number}
                    onClick={handleNumberClick}
                  />
                ))}
              </div>
              
              {/* Bottom row */}
              <div className="grid grid-cols-3 gap-3">
                <ActionButton
                  onClick={handleClear}
                  variant="clear"
                >
                  Clear
                </ActionButton>
                
                <NumberButton
                  number={0}
                  onClick={handleNumberClick}
                />
                
                <ActionButton
                  onClick={handleBackspace}
                  variant="backspace"
                >
                  <svg className="w-6 h-6" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M7.5 10H15M5.5 5L2 10L5.5 15M15 5V15"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </ActionButton>
              </div>
            </div>

            {/* Send OTP Button */}
            <div className="flex justify-center">
              <button
                onClick={handleSendOTP}
                disabled={isLoading}
                className="w-[80%] cursor-pointer text-white py-3 rounded-lg text-base font-semibold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:-translate-y-1 active:translate-y-0 active:shadow-inner"
                style={{
                  backgroundColor: themeStyles.rightActionButtonsBg,
                  borderColor: themeStyles.rightActionButtonsBg,
                }}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Sending...
                  </>
                ) : (
                  'Send OTP'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// Step 3: OTP Verification with Number Pad
const ResetPinStep3 = ({ isOpen, onClose, onNext, userInfo, resetFields }) => {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { themeColors, currentTheme } = useTheme();

  // Get theme-specific styles
  const getThemeStyles = () => {
    switch (currentTheme) {
      case 'default':
        return {
          screenBg: '#003C58',
          logoBg: '#176B87',
          logoText: 'white',
          logoSubText: 'white',
          mainContentShadow: '0 8px 32px rgba(0,0,0,0.10), 0 0 10px rgba(0, 188, 212, 0.6)',
          mainContentBorder: '2px solid var(--primary-light, #00bcd4)',
          leftSectionBg: '#176B87',
          rightActionButtonsBg: '#176B87',
          roleButtonBg: '#003C58',
          roleButtonText: 'white',
          roleButtonBorder: '2px solid rgba(255, 255, 255, 0.3)',
          roleButtonSelectedBg: 'white',
          roleButtonSelectedText: '#003C58'
        };
      case 'blue':
        return {
          screenBg: 'white',
          logoBg: '#032C7E',
          logoText: 'white',
          logoSubText: 'black',
          mainContentShadow: '0 8px 32px rgba(0,0,0,0.10), 0 0 20px rgba(3, 45, 129, 0.3)',
          mainContentBorder: '2px solid #032d81',
          leftSectionBg: '#032C7E',
          rightActionButtonsBg: '#032C7E',
          roleButtonBg: 'white',
          roleButtonText: '#032D81',
          roleButtonBorder: 'var(--primary-light, #00bcd4)',
          roleButtonSelectedBg: '#032D81',
          roleButtonSelectedText: 'white'
        };
      case 'green':
        return {
          screenBg: '#136F63',
          logoBg: '#34A0A4',
          logoText: 'white',
          logoSubText: 'white',
          mainContentShadow: '0 8px 32px rgba(0,0,0,0.10), 0 0 10px rgba(0, 188, 212, 0.6)',
          mainContentBorder: '2px solid var(--primary-light, #00bcd4)',
          leftSectionBg: '#34A0A4',
          rightActionButtonsBg: '#136F63',
          roleButtonBg: '#136F63',
          roleButtonText: 'white',
          roleButtonBorder: 'var(--logo-box-bg, #176B87)',
          roleButtonSelectedBg: 'white',
          roleButtonSelectedText: '#34A0A4'
        };
      case 'black':
        return {
          screenBg: 'white',
          logoBg: '#000000',
          logoText: 'white',
          logoSubText: 'black',
          mainContentShadow: '0 8px 32px rgba(0,0,0,0.10), 0 0 20px rgba(0, 0, 0, 0.3)',
          mainContentBorder: '2.5px solid #e0e0e0',
          leftSectionBg: '#000000',
          rightActionButtonsBg: '#000000',
          roleButtonBg: 'white',
          roleButtonText: '#000000',
          roleButtonBorder: '1px solid #e0e0e0',
          roleButtonSelectedBg: '#000000',
          roleButtonSelectedText: 'white'
        };
      default:
        return {
          screenBg: '#003C58',
          logoBg: '#176B87',
          logoText: 'white',
          logoSubText: 'white',
          mainContentShadow: '0 8px 32px rgba(0,0,0,0.10), 0 0 10px rgba(0, 188, 212, 0.6)',
          mainContentBorder: '2px solid var(--primary-light, #00bcd4)',
          leftSectionBg: '#176B87',
          rightActionButtonsBg: '#176B87',
          roleButtonBg: '#003C58',
          roleButtonText: 'white',
          roleButtonBorder: '2px solid rgba(255, 255, 255, 0.3)',
          roleButtonSelectedBg: 'white',
          roleButtonSelectedText: '#003C58'
        };
    }
  };

  const themeStyles = getThemeStyles();

  React.useEffect(() => {
    if (resetFields) {
      setOtp('');
      setError('');
    }
  }, [resetFields]);

  const handleNumberClick = (number) => {
    setOtp(prev => prev + number);
    setError(''); // Clear error when typing
  };

  const handleClear = () => {
    setOtp('');
    setError('');
  };

  const handleBackspace = () => {
    setOtp(prev => prev.slice(0, -1));
    setError('');
  };

  const handleVerifyOTP = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Call the backend to verify OTP
      const result = await window.myAPI?.verifyPasswordResetOTP(userInfo.phoneNumber, userInfo.role, otp);
      
      if (result && result.success) {
        // OTP verified successfully, proceed to next step with OTP
        onNext({ ...userInfo, otp });
      } else {
        setError(result?.message || 'Invalid OTP. Please try again.');
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      setError('Failed to verify OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const NumberButton = ({ number, onClick, className = "" }) => (
    <button
      onClick={() => onClick(number)}
      className={`h-9 bg-[#032D3A] border-[#2d5a87] rounded-lg text-sm font-bold transition-all duration-200 border cursor-pointer text-white hover:bg-[#2d5a87] hover:border-[#4a7ca3] ${className}`}
    >
      {number}
    </button>
  );

  const ActionButton = ({ onClick, className = "", children, variant = "default" }) => {
    const baseClasses = "h-9 rounded-lg text-xs font-semibold transition-all duration-200 border flex items-center justify-center";
    const variantClasses = {
      clear: "bg-red-900/40 hover:bg-red-800/50 border-[#4a7ca3] cursor-pointer text-red-300 hover:border-red-500",
      backspace: "bg-[#032D3A] hover:bg-[#2d5a87] border-[#4a7ca3] cursor-pointer text-white hover:border-[#4a7ca3]",
      default: baseClasses
    };

    return (
      <button
        onClick={onClick}
        className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      >
        {children}
      </button>
    );
  };

  const renderOtpDisplay = () => {
    const maxBoxes = Math.max(6, otp.length); // Show at least 6 boxes, or more if OTP is longer
    const boxes = Array.from({ length: maxBoxes }, (_, index) => {
      const hasDigit = index < otp.length;
      const digit = otp[index] || '';
      const isEmpty = !hasDigit;
      
      return (
        <div 
          key={index} 
          className={`w-8 h-8 border rounded-lg flex items-center justify-center text-sm font-semibold transition-all duration-200 ${
            isEmpty 
              ? 'border-[#1e3a5f] bg-[#0f2a44]' 
              : 'border-[#2d5a87] bg-[#032D3A] text-white'
          }`}
        >
          {hasDigit ? digit : ''}
        </div>
      );
    });

    return (
      <div className="flex justify-center items-center gap-2 flex-wrap">
        {boxes}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <>
      <style>{scrollbarStyles}</style>
      <div className="fixed inset-0 bg-[#00000094] bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-[#032D3A] rounded-xl w-full max-w-md mx-auto relative border border-[#4a7ca3]">
          <div className="p-4">
            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-gray-300 hover:text-white transition-colors z-10 border border-[#4a7ca3] rounded-lg w-7 h-7 flex items-center justify-center hover:bg-[#2d5a87]"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-[#2d5a87] rounded-lg flex items-center justify-center mx-auto mb-3 border border-[#4a7ca3]">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white mb-1">Reset PIN</h2>
              <p className="text-xs text-gray-300">Step 2 of 3</p>
            </div>

            <div className="mb-4">
              <h3 className="text-md font-semibold text-white mb-3 text-center">Enter OTP</h3>
              
              <p className="text-xs text-gray-300 mb-3 text-center">
                OTP sent to: <span className="text-white font-semibold">{userInfo?.phoneNumber}</span>
              </p>

              {/* Error Message */}
              {error && (
                <div className="mb-3 flex items-center justify-center gap-1 bg-red-900/40 text-red-300 p-2 rounded border border-red-600/30">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-xs font-medium">{error}</span>
                </div>
              )}

              {/* OTP Display */}
              <div className="mb-3">
                {renderOtpDisplay()}
                <p className="text-center text-xs text-gray-400 mt-1">
                  {otp.length} digits
                </p>
              </div>

              {/* Number Pad */}
              <div className="max-w-xs mx-auto mb-4">
                {/* First 3 rows */}
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
                    <NumberButton
                      key={number}
                      number={number}
                      onClick={handleNumberClick}
                    />
                  ))}
                </div>
                
                {/* Bottom row */}
                <div className="grid grid-cols-3 gap-2">
                  <ActionButton
                    onClick={handleClear}
                    variant="clear"
                  >
                    Clear
                  </ActionButton>
                  
                  <NumberButton
                    number={0}
                    onClick={handleNumberClick}
                  />
                  
                  <ActionButton
                    onClick={handleBackspace}
                    variant="backspace"
                  >
                    <X className="w-3 h-3" />
                  </ActionButton>
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={handleVerifyOTP}
                  disabled={isLoading}
                  className={`px-6 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 border flex items-center gap-2 ${
                    !isLoading
                      ? 'bg-[#2d5a87] border-[#4a7ca3] text-white hover:bg-[#4a7ca3] cursor-pointer'
                      : 'bg-[#1e3a5f] border-[#4a7ca3] text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                      Verifying...
                    </>
                  ) : (
                    'Verify OTP'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// Step 4: Set New PIN with Number Pad
const ResetPinStep4 = ({ isOpen, onClose, onComplete, userInfo, resetFields }) => {
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isConfirmMode, setIsConfirmMode] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showNewPin, setShowNewPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const { themeColors, currentTheme } = useTheme();

  // Get theme-specific styles
  const getThemeStyles = () => {
    switch (currentTheme) {
      case 'default':
        return {
          screenBg: '#003C58',
          logoBg: '#176B87',
          logoText: 'white',
          logoSubText: 'white',
          mainContentShadow: '0 8px 32px rgba(0,0,0,0.10), 0 0 10px rgba(0, 188, 212, 0.6)',
          mainContentBorder: '2px solid var(--primary-light, #00bcd4)',
          leftSectionBg: '#176B87',
          rightActionButtonsBg: '#176B87',
          roleButtonBg: '#003C58',
          roleButtonText: 'white',
          roleButtonBorder: '2px solid rgba(255, 255, 255, 0.3)',
          roleButtonSelectedBg: 'white',
          roleButtonSelectedText: '#003C58'
        };
      case 'blue':
        return {
          screenBg: 'white',
          logoBg: '#032C7E',
          logoText: 'white',
          logoSubText: 'black',
          mainContentShadow: '0 8px 32px rgba(0,0,0,0.10), 0 0 20px rgba(3, 45, 129, 0.3)',
          mainContentBorder: '2px solid #032d81',
          leftSectionBg: '#032C7E',
          rightActionButtonsBg: '#032C7E',
          roleButtonBg: 'white',
          roleButtonText: '#032D81',
          roleButtonBorder: 'var(--primary-light, #00bcd4)',
          roleButtonSelectedBg: '#032D81',
          roleButtonSelectedText: 'white'
        };
      case 'green':
        return {
          screenBg: '#136F63',
          logoBg: '#34A0A4',
          logoText: 'white',
          logoSubText: 'white',
          mainContentShadow: '0 8px 32px rgba(0,0,0,0.10), 0 0 10px rgba(0, 188, 212, 0.6)',
          mainContentBorder: '2px solid var(--primary-light, #00bcd4)',
          leftSectionBg: '#34A0A4',
          rightActionButtonsBg: '#136F63',
          roleButtonBg: '#136F63',
          roleButtonText: 'white',
          roleButtonBorder: 'var(--logo-box-bg, #176B87)',
          roleButtonSelectedBg: 'white',
          roleButtonSelectedText: '#34A0A4'
        };
      case 'black':
        return {
          screenBg: 'white',
          logoBg: '#000000',
          logoText: 'white',
          logoSubText: 'black',
          mainContentShadow: '0 8px 32px rgba(0,0,0,0.10), 0 0 20px rgba(0, 0, 0, 0.3)',
          mainContentBorder: '2.5px solid #e0e0e0',
          leftSectionBg: '#000000',
          rightActionButtonsBg: '#000000',
          roleButtonBg: 'white',
          roleButtonText: '#000000',
          roleButtonBorder: '1px solid #e0e0e0',
          roleButtonSelectedBg: '#000000',
          roleButtonSelectedText: 'white'
        };
      default:
        return {
          screenBg: '#003C58',
          logoBg: '#176B87',
          logoText: 'white',
          logoSubText: 'white',
          mainContentShadow: '0 8px 32px rgba(0,0,0,0.10), 0 0 10px rgba(0, 188, 212, 0.6)',
          mainContentBorder: '2px solid var(--primary-light, #00bcd4)',
          leftSectionBg: '#176B87',
          rightActionButtonsBg: '#176B87',
          roleButtonBg: '#003C58',
          roleButtonText: 'white',
          roleButtonBorder: '2px solid rgba(255, 255, 255, 0.3)',
          roleButtonSelectedBg: 'white',
          roleButtonSelectedText: '#003C58'
        };
    }
  };

  const themeStyles = getThemeStyles();

  React.useEffect(() => {
    if (resetFields) {
      setNewPin('');
      setConfirmPin('');
      setIsConfirmMode(false);
      setError('');
      setShowNewPin(false);
      setShowConfirmPin(false);
    }
  }, [resetFields]);

  const handleNumberClick = (number) => {
    if (!isConfirmMode) {
      if (newPin.length < 4) {
        setNewPin(prev => prev + number);
      }
    } else {
      if (confirmPin.length < 4) {
        setConfirmPin(prev => prev + number);
        setError(''); // Clear error when typing
      }
    }
  };

  const handleClear = () => {
    if (!isConfirmMode) {
      setNewPin('');
    } else {
      setConfirmPin('');
      setError('');
    }
  };

  const handleBackspace = () => {
    if (!isConfirmMode) {
      setNewPin(prev => prev.slice(0, -1));
    } else {
      setConfirmPin(prev => prev.slice(0, -1));
      setError('');
    }
  };

  const handleContinue = async () => {
    if (!isConfirmMode) {
      setIsConfirmMode(true);
      setError('');
    } else {
      if (newPin !== confirmPin) {
        setError('PINs do not match');
        return;
      }

      // Reset the PIN
      setIsLoading(true);
      setError('');

      try {
        // We need to get the OTP from the previous step, but since we don't have it stored,
        // we'll need to modify the flow to pass it through. For now, let's assume the OTP
        // is still valid since we just verified it in step 3.
        const result = await window.myAPI?.resetEmployeePIN(
          userInfo.phoneNumber, 
          userInfo.role, 
          userInfo.otp,
          newPin
        );
        
        if (result && result.success) {
          onComplete();
        } else {
          setError(result?.message || 'Failed to reset PIN. Please try again.');
        }
      } catch (error) {
        console.error('Error resetting PIN:', error);
        setError('Failed to reset PIN. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const NumberButton = ({ number, onClick, className = "" }) => (
    <button
      onClick={() => onClick(number)}
      className={`h-9 bg-[#032D3A] border-[#2d5a87] rounded-lg text-sm font-bold transition-all duration-200 border cursor-pointer text-white hover:bg-[#2d5a87] hover:border-[#4a7ca3] ${className}`}
    >
      {number}
    </button>
  );

  const ActionButton = ({ onClick, className = "", children, variant = "default" }) => {
    const baseClasses = "h-9 rounded-lg text-xs font-semibold transition-all duration-200 border flex items-center justify-center";
    const variantClasses = {
      clear: "bg-red-900/40 hover:bg-red-800/50 border-[#4a7ca3] cursor-pointer text-red-300 hover:border-red-500",
      backspace: "bg-[#032D3A] hover:bg-[#2d5a87] border-[#4a7ca3] cursor-pointer text-white hover:border-[#4a7ca3]",
      default: baseClasses
    };

    return (
      <button
        onClick={onClick}
        className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      >
        {children}
      </button>
    );
  };

  const renderPinDisplay = (pin, label, showPin, onToggleVisibility) => {
    const boxes = Array.from({ length: 4 }, (_, index) => {
      const hasDigit = index < pin.length;
      const digit = pin[index] || '';
      const isEmpty = !hasDigit;
      
      return (
        <div 
          key={index} 
          className={`w-10 h-10 border-[1px] rounded-lg flex items-center justify-center text-lg font-semibold transition-all duration-200 ${
            isEmpty
              ? 'border-primary bg-[#E0F7FA]'
              : 'border-primary bg-[#E0F7FA] text-black'
          } shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]`}
          style={{
            boxShadow: "0 0 10px rgba(0, 188, 212, 0.6)"
          }}
        >
          {hasDigit ? (showPin ? digit : '●') : ''}
        </div>
      );
    });

    return (
      <div className="mb-4">
        <p className="text-center text-sm mb-2" style={{ color: themeStyles.logoSubText }}>{label}</p>
        <div className="flex justify-center items-center gap-2">
          {boxes}
          <button
            onClick={onToggleVisibility}
            className={`ml-2 w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-200 bg-primary hover:shadow-lg text-[#032D3A] hover:text-white hover:bg-[#032D3A] cursor-pointer`}
            style={{
              backgroundColor: themeStyles.rightActionButtonsBg,
              color: 'white'
            }}
          >
            {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        <p className="text-center text-xs mt-2" style={{ color: themeStyles.logoSubText }}>
          {pin.length}/4 digits
        </p>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <>
      <style>{scrollbarStyles}</style>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div 
          className="rounded-3xl w-full max-w-lg mx-auto relative overflow-hidden"
          style={{
            boxShadow: themeStyles.mainContentShadow,
            border: themeStyles.mainContentBorder
          }}
        >
          {/* Header */}
          <div 
            className="p-6 text-center relative"
            style={{ backgroundColor: themeStyles.logoBg }}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-white hover:bg-white/20 transition-colors duration-200 rounded-lg"
              style={{ border: '1px solid rgba(255,255,255,0.35)', backgroundColor: 'transparent' }}
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 rounded-2xl border-2 flex flex-col items-center justify-center mx-auto mb-4 shadow-md"
              style={{ backgroundColor: themeStyles.logoBg, borderColor: themeStyles.logoBg }}
            >
              <Shield className="w-8 h-8" style={{ color: themeStyles.logoText }} />
            </div>
            <h2 className="text-2xl font-bold mb-1" style={{ color: themeStyles.logoText }}>Reset PIN</h2>
            <p className="text-sm opacity-80" style={{ color: themeStyles.logoText }}>Step 3 of 3</p>
          </div>

          {/* Content */}
          <div 
            className="p-6"
            style={{ backgroundColor: themeStyles.screenBg }}
          >
            <h3 className="text-lg font-semibold mb-6 text-center" style={{ color: themeStyles.logoSubText }}>
              {!isConfirmMode ? 'Set New PIN' : 'Confirm New PIN'}
            </h3>

            {/* PIN Display */}
            {!isConfirmMode ? (
              renderPinDisplay(newPin, 'Enter New PIN (4 digits)', showNewPin, () => setShowNewPin(!showNewPin))
            ) : (
              renderPinDisplay(confirmPin, 'Confirm New PIN', showConfirmPin, () => setShowConfirmPin(!showConfirmPin))
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-4 flex items-center justify-center gap-2 bg-red-50 text-red-500 p-3 rounded-lg border border-red-200">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}

            {/* Number Pad */}
            <div className="max-w-xs mx-auto mb-6">
              {/* First 3 rows */}
              <div className="grid grid-cols-3 gap-3 mb-3">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
                  <NumberButton
                    key={number}
                    number={number}
                    onClick={handleNumberClick}
                  />
                ))}
              </div>
              
              {/* Bottom row */}
              <div className="grid grid-cols-3 gap-3">
                <ActionButton
                  onClick={handleClear}
                  variant="clear"
                >
                  Clear
                </ActionButton>
                
                <NumberButton
                  number={0}
                  onClick={handleNumberClick}
                />
                
                <ActionButton
                  onClick={handleBackspace}
                  variant="backspace"
                >
                  <svg className="w-6 h-6" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M7.5 10H15M5.5 5L2 10L5.5 15M15 5V15"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </ActionButton>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-3">
              {isConfirmMode && (
                <button
                  onClick={() => {
                    setIsConfirmMode(false);
                    setConfirmPin('');
                    setError('');
                  }}
                  className="px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 text-gray-600 hover:text-gray-800 bg-gray-100 border border-gray-300 hover:bg-gray-200"
                >
                  Back to New PIN
                </button>
              )}
              <button
                onClick={handleContinue}
                disabled={isLoading}
                className="w-[80%] cursor-pointer text-white py-3 rounded-lg text-base font-semibold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:-translate-y-1 active:translate-y-0 active:shadow-inner"
                style={{
                  backgroundColor: themeStyles.rightActionButtonsBg,
                  borderColor: themeStyles.rightActionButtonsBg,
                }}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Resetting...
                  </>
                ) : (
                  !isConfirmMode ? 'Continue' : 'Reset PIN'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// Main component that manages the forgot PIN flow
const ForgotPinModals = ({ isOpen, onClose, selectedRole }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [userInfo, setUserInfo] = useState(null);
  const [resetFields, setResetFields] = useState(false);

  // Reset state when modal is closed or opened
  React.useEffect(() => {
    if (!isOpen) {
      setCurrentStep(1);
      setUserInfo(null);
      setResetFields(prev => !prev); // Toggle to trigger reset
    }
  }, [isOpen]);

  const handleStep1Next = (info) => {
    setUserInfo(info);
    setCurrentStep(2);
  };

  const handleStep2Next = (info) => {
    setUserInfo(info);
    setCurrentStep(3);
  };

  const handleResetComplete = () => {
    setCurrentStep(1);
    setUserInfo(null);
    setResetFields(prev => !prev); // Toggle to trigger reset
    alert('PIN reset successfully! You can now login with your new PIN.');
    onClose();
  };

  const handleModalClose = () => {
    setCurrentStep(1);
    setUserInfo(null);
    setResetFields(prev => !prev); // Toggle to trigger reset
    onClose();
  };

  return (
    <>
      <ResetPinStep2
        isOpen={isOpen && currentStep === 1}
        onClose={handleModalClose}
        onNext={handleStep1Next}
        userInfo={{ role: selectedRole }}
        resetFields={resetFields}
      />

      <ResetPinStep3
        isOpen={isOpen && currentStep === 2}
        onClose={handleModalClose}
        onNext={handleStep2Next}
        userInfo={userInfo}
        resetFields={resetFields}
      />

      <ResetPinStep4
        isOpen={isOpen && currentStep === 3}
        onClose={handleModalClose}
        onComplete={handleResetComplete}
        userInfo={userInfo}
        resetFields={resetFields}
      />
    </>
  );
};

export default ForgotPinModals;