import React, { useState } from 'react';
import { X, Shield, Phone, Crown, Settings, DollarSign, Scissors, ChefHat, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { isValidPhoneNumber } from 'libphonenumber-js';

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
  const [selectedCountry, setSelectedCountry] = useState({ code: 'IE', name: 'Ireland', flag: '🇮🇪', callingCode: '+353' });
  const [showCountrySelector, setShowCountrySelector] = useState(false);
  const [countries, setCountries] = useState([]);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showCursor, setShowCursor] = useState(false);
  const [isValidNumber, setIsValidNumber] = useState(false);
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

  // Fetch countries data with flags and phone codes
  const fetchCountries = async () => {
    setLoadingCountries(true);
    try {
      // Use a comprehensive list of countries with flags and calling codes
      const countriesData = [
        { code: 'IE', name: 'Ireland', flag: '🇮🇪', callingCode: '+353' },
        { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', callingCode: '+44' },
        { code: 'US', name: 'United States', flag: '🇺🇸', callingCode: '+1' },
        { code: 'DE', name: 'Germany', flag: '🇩🇪', callingCode: '+49' },
        { code: 'FR', name: 'France', flag: '🇫🇷', callingCode: '+33' },
        { code: 'IT', name: 'Italy', flag: '🇮🇹', callingCode: '+39' },
        { code: 'ES', name: 'Spain', flag: '🇪🇸', callingCode: '+34' },
        { code: 'NL', name: 'Netherlands', flag: '🇳🇱', callingCode: '+31' },
        { code: 'BE', name: 'Belgium', flag: '🇧🇪', callingCode: '+32' },
        { code: 'CH', name: 'Switzerland', flag: '🇨🇭', callingCode: '+41' },
        { code: 'PK', name: 'Pakistan', flag: '🇵🇰', callingCode: '+92' },
        { code: 'IN', name: 'India', flag: '🇮🇳', callingCode: '+91' },
        { code: 'BD', name: 'Bangladesh', flag: '🇧🇩', callingCode: '+880' },
        { code: 'CN', name: 'China', flag: '🇨🇳', callingCode: '+86' },
        { code: 'JP', name: 'Japan', flag: '🇯🇵', callingCode: '+81' },
        { code: 'KR', name: 'South Korea', flag: '🇰🇷', callingCode: '+82' },
        { code: 'TH', name: 'Thailand', flag: '🇹🇭', callingCode: '+66' },
        { code: 'MY', name: 'Malaysia', flag: '🇲🇾', callingCode: '+60' },
        { code: 'SG', name: 'Singapore', flag: '🇸🇬', callingCode: '+65' },
        { code: 'ID', name: 'Indonesia', flag: '🇮🇩', callingCode: '+62' },
        { code: 'PH', name: 'Philippines', flag: '🇵🇭', callingCode: '+63' },
        { code: 'VN', name: 'Vietnam', flag: '🇻🇳', callingCode: '+84' },
        { code: 'AU', name: 'Australia', flag: '🇦🇺', callingCode: '+61' },
        { code: 'CA', name: 'Canada', flag: '🇨🇦', callingCode: '+1' },
        { code: 'BR', name: 'Brazil', flag: '🇧🇷', callingCode: '+55' },
        { code: 'MX', name: 'Mexico', flag: '🇲🇽', callingCode: '+52' },
        { code: 'AR', name: 'Argentina', flag: '🇦🇷', callingCode: '+54' },
        { code: 'ZA', name: 'South Africa', flag: '🇿🇦', callingCode: '+27' },
        { code: 'EG', name: 'Egypt', flag: '🇪🇬', callingCode: '+20' },
        { code: 'NG', name: 'Nigeria', flag: '🇳🇬', callingCode: '+234' },
        { code: 'KE', name: 'Kenya', flag: '🇰🇪', callingCode: '+254' },
        { code: 'MA', name: 'Morocco', flag: '🇲🇦', callingCode: '+212' },
        { code: 'RU', name: 'Russia', flag: '🇷🇺', callingCode: '+7' },
        { code: 'TR', name: 'Turkey', flag: '🇹🇷', callingCode: '+90' },
        { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦', callingCode: '+966' },
        { code: 'AE', name: 'UAE', flag: '🇦🇪', callingCode: '+971' },
        { code: 'AF', name: 'Afghanistan', flag: '🇦🇫', callingCode: '+93' },
        { code: 'AL', name: 'Albania', flag: '🇦🇱', callingCode: '+355' },
        { code: 'DZ', name: 'Algeria', flag: '🇩🇿', callingCode: '+213' },
        { code: 'AO', name: 'Angola', flag: '🇦🇴', callingCode: '+244' },
        { code: 'AT', name: 'Austria', flag: '🇦🇹', callingCode: '+43' },
        { code: 'AZ', name: 'Azerbaijan', flag: '🇦🇿', callingCode: '+994' },
        { code: 'BH', name: 'Bahrain', flag: '🇧🇭', callingCode: '+973' },
        { code: 'BY', name: 'Belarus', flag: '🇧🇾', callingCode: '+375' },
        { code: 'BO', name: 'Bolivia', flag: '🇧🇴', callingCode: '+591' },
        { code: 'BA', name: 'Bosnia and Herzegovina', flag: '🇧🇦', callingCode: '+387' },
        { code: 'BW', name: 'Botswana', flag: '🇧🇼', callingCode: '+267' },
        { code: 'BG', name: 'Bulgaria', flag: '🇧🇬', callingCode: '+359' },
        { code: 'KH', name: 'Cambodia', flag: '🇰🇭', callingCode: '+855' },
        { code: 'CM', name: 'Cameroon', flag: '🇨🇲', callingCode: '+237' },
        { code: 'CL', name: 'Chile', flag: '🇨🇱', callingCode: '+56' },
        { code: 'CO', name: 'Colombia', flag: '🇨🇴', callingCode: '+57' },
        { code: 'CR', name: 'Costa Rica', flag: '🇨🇷', callingCode: '+506' },
        { code: 'HR', name: 'Croatia', flag: '🇭🇷', callingCode: '+385' },
        { code: 'CU', name: 'Cuba', flag: '🇨🇺', callingCode: '+53' },
        { code: 'CY', name: 'Cyprus', flag: '🇨🇾', callingCode: '+357' },
        { code: 'CZ', name: 'Czech Republic', flag: '🇨🇿', callingCode: '+420' },
        { code: 'DK', name: 'Denmark', flag: '🇩🇰', callingCode: '+45' },
        { code: 'DO', name: 'Dominican Republic', flag: '🇩🇴', callingCode: '+1' },
        { code: 'EC', name: 'Ecuador', flag: '🇪🇨', callingCode: '+593' },
        { code: 'EE', name: 'Estonia', flag: '🇪🇪', callingCode: '+372' },
        { code: 'ET', name: 'Ethiopia', flag: '🇪🇹', callingCode: '+251' },
        { code: 'FI', name: 'Finland', flag: '🇫🇮', callingCode: '+358' },
        { code: 'GE', name: 'Georgia', flag: '🇬🇪', callingCode: '+995' },
        { code: 'GH', name: 'Ghana', flag: '🇬🇭', callingCode: '+233' },
        { code: 'GR', name: 'Greece', flag: '🇬🇷', callingCode: '+30' },
        { code: 'GT', name: 'Guatemala', flag: '🇬🇹', callingCode: '+502' },
        { code: 'HN', name: 'Honduras', flag: '🇭🇳', callingCode: '+504' },
        { code: 'HK', name: 'Hong Kong', flag: '🇭🇰', callingCode: '+852' },
        { code: 'HU', name: 'Hungary', flag: '🇭🇺', callingCode: '+36' },
        { code: 'IS', name: 'Iceland', flag: '🇮🇸', callingCode: '+354' },
        { code: 'IL', name: 'Israel', flag: '🇮🇱', callingCode: '+972' },
        { code: 'JO', name: 'Jordan', flag: '🇯🇴', callingCode: '+962' },
        { code: 'KZ', name: 'Kazakhstan', flag: '🇰🇿', callingCode: '+7' },
        { code: 'KW', name: 'Kuwait', flag: '🇰🇼', callingCode: '+965' },
        { code: 'LV', name: 'Latvia', flag: '🇱🇻', callingCode: '+371' },
        { code: 'LB', name: 'Lebanon', flag: '🇱🇧', callingCode: '+961' },
        { code: 'LT', name: 'Lithuania', flag: '🇱🇹', callingCode: '+370' },
        { code: 'LU', name: 'Luxembourg', flag: '🇱🇺', callingCode: '+352' },
        { code: 'MK', name: 'North Macedonia', flag: '🇲🇰', callingCode: '+389' },
        { code: 'MT', name: 'Malta', flag: '🇲🇹', callingCode: '+356' },
        { code: 'MU', name: 'Mauritius', flag: '🇲🇺', callingCode: '+230' },
        { code: 'MD', name: 'Moldova', flag: '🇲🇩', callingCode: '+373' },
        { code: 'MN', name: 'Mongolia', flag: '🇲🇳', callingCode: '+976' },
        { code: 'ME', name: 'Montenegro', flag: '🇲🇪', callingCode: '+382' },
        { code: 'MZ', name: 'Mozambique', flag: '🇲🇿', callingCode: '+258' },
        { code: 'MM', name: 'Myanmar', flag: '🇲🇲', callingCode: '+95' },
        { code: 'NP', name: 'Nepal', flag: '🇳🇵', callingCode: '+977' },
        { code: 'NZ', name: 'New Zealand', flag: '🇳🇿', callingCode: '+64' },
        { code: 'NO', name: 'Norway', flag: '🇳🇴', callingCode: '+47' },
        { code: 'OM', name: 'Oman', flag: '🇴🇲', callingCode: '+968' },
        { code: 'PE', name: 'Peru', flag: '🇵🇪', callingCode: '+51' },
        { code: 'PL', name: 'Poland', flag: '🇵🇱', callingCode: '+48' },
        { code: 'PT', name: 'Portugal', flag: '🇵🇹', callingCode: '+351' },
        { code: 'QA', name: 'Qatar', flag: '🇶🇦', callingCode: '+974' },
        { code: 'RO', name: 'Romania', flag: '🇷🇴', callingCode: '+40' },
        { code: 'RW', name: 'Rwanda', flag: '🇷🇼', callingCode: '+250' },
        { code: 'SN', name: 'Senegal', flag: '🇸🇳', callingCode: '+221' },
        { code: 'RS', name: 'Serbia', flag: '🇷🇸', callingCode: '+381' },
        { code: 'SK', name: 'Slovakia', flag: '🇸🇰', callingCode: '+421' },
        { code: 'SI', name: 'Slovenia', flag: '🇸🇮', callingCode: '+386' },
        { code: 'LK', name: 'Sri Lanka', flag: '🇱🇰', callingCode: '+94' },
        { code: 'SE', name: 'Sweden', flag: '🇸🇪', callingCode: '+46' },
        { code: 'TZ', name: 'Tanzania', flag: '🇹🇿', callingCode: '+255' },
        { code: 'TN', name: 'Tunisia', flag: '🇹🇳', callingCode: '+216' },
        { code: 'UG', name: 'Uganda', flag: '🇺🇬', callingCode: '+256' },
        { code: 'UA', name: 'Ukraine', flag: '🇺🇦', callingCode: '+380' },
        { code: 'UY', name: 'Uruguay', flag: '🇺🇾', callingCode: '+598' },
        { code: 'UZ', name: 'Uzbekistan', flag: '🇺🇿', callingCode: '+998' },
        { code: 'VE', name: 'Venezuela', flag: '🇻🇪', callingCode: '+58' },
        { code: 'ZM', name: 'Zambia', flag: '🇿🇲', callingCode: '+260' },
        { code: 'ZW', name: 'Zimbabwe', flag: '🇿🇼', callingCode: '+263' }
      ];
      
      // Sort countries alphabetically
      const sortedCountries = countriesData.sort((a, b) => a.name.localeCompare(b.name));
      setCountries(sortedCountries);
    } catch (error) {
      console.error('Error loading countries:', error);
      // Fallback to basic countries
      setCountries([
        { code: 'IE', name: 'Ireland', flag: '🇮🇪', callingCode: '+353' },
        { code: 'PK', name: 'Pakistan', flag: '🇵🇰', callingCode: '+92' },
        { code: 'IN', name: 'India', flag: '🇮🇳', callingCode: '+91' },
        { code: 'US', name: 'United States', flag: '🇺🇸', callingCode: '+1' },
        { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', callingCode: '+44' }
      ]);
    } finally {
      setLoadingCountries(false);
    }
  };

  // Helper function to get country name
  const getCountryName = (countryCode) => {
    const countryNames = {
      'IE': 'Ireland', 'GB': 'United Kingdom', 'US': 'United States', 'DE': 'Germany',
      'FR': 'France', 'IT': 'Italy', 'ES': 'Spain', 'NL': 'Netherlands',
      'BE': 'Belgium', 'CH': 'Switzerland', 'CA': 'Canada', 'AU': 'Australia',
      'JP': 'Japan', 'KR': 'South Korea', 'CN': 'China', 'IN': 'India',
      'BR': 'Brazil', 'MX': 'Mexico', 'AR': 'Argentina', 'ZA': 'South Africa',
      'EG': 'Egypt', 'NG': 'Nigeria', 'KE': 'Kenya', 'MA': 'Morocco',
      'RU': 'Russia', 'TR': 'Turkey', 'SA': 'Saudi Arabia', 'AE': 'UAE',
      'SG': 'Singapore', 'MY': 'Malaysia', 'TH': 'Thailand', 'ID': 'Indonesia',
      'PH': 'Philippines', 'VN': 'Vietnam', 'BD': 'Bangladesh', 'PK': 'Pakistan'
    };
    return countryNames[countryCode] || countryCode;
  };

  // Helper function to get maximum phone number length for a country
  const getMaxPhoneLength = (countryCode) => {
    const phoneLengths = {
      'IE': 9, 'GB': 10, 'US': 10, 'DE': 11, 'FR': 9, 'IT': 10, 'ES': 9,
      'NL': 9, 'BE': 9, 'CH': 9, 'CA': 10, 'AU': 9, 'JP': 10, 'KR': 10,
      'CN': 11, 'IN': 10, 'BR': 11, 'MX': 10, 'AR': 10, 'ZA': 9, 'EG': 10,
      'NG': 10, 'KE': 9, 'MA': 9, 'RU': 10, 'TR': 10, 'SA': 9, 'AE': 9,
      'SG': 8, 'MY': 9, 'TH': 9, 'ID': 11, 'PH': 10, 'VN': 9, 'BD': 10, 'PK': 10,
      'AF': 9, 'AL': 9, 'DZ': 9, 'AO': 9, 'AT': 10, 'AZ': 9, 'BH': 8, 'BY': 9,
      'BO': 8, 'BA': 8, 'BW': 7, 'BG': 9, 'KH': 8, 'CM': 9, 'CL': 8, 'CO': 10,
      'CR': 8, 'HR': 9, 'CU': 8, 'CY': 8, 'CZ': 9, 'DK': 8, 'DO': 10, 'EC': 9,
      'EE': 8, 'ET': 9, 'FI': 9, 'GE': 9, 'GH': 9, 'GR': 10, 'GT': 8, 'HN': 8,
      'HK': 8, 'HU': 9, 'IS': 7, 'IL': 9, 'JO': 9, 'KZ': 10, 'KW': 8, 'LV': 8,
      'LB': 8, 'LT': 8, 'LU': 9, 'MK': 8, 'MT': 8, 'MU': 7, 'MD': 8, 'MN': 8,
      'ME': 8, 'MZ': 9, 'MM': 8, 'NP': 10, 'NZ': 8, 'NO': 8, 'OM': 8, 'PE': 9,
      'PL': 9, 'PT': 9, 'QA': 8, 'RO': 9, 'RW': 9, 'SN': 9, 'RS': 9, 'SK': 9,
      'SI': 8, 'LK': 9, 'SE': 9, 'TZ': 9, 'TN': 8, 'UG': 9, 'UA': 9, 'UY': 8,
      'UZ': 9, 'VE': 10, 'ZM': 9, 'ZW': 9
    };
    return phoneLengths[countryCode] || 15; // Default to 15 if not found
  };

  React.useEffect(() => {
    if (resetFields) {
      setPhoneNumber('');
      setError('');
      setSelectedCountry({ code: 'IE', name: 'Ireland', flag: '🇮🇪', callingCode: '+353' });
      setIsValidNumber(false);
    }
  }, [resetFields]);

  // Validate phone number when it changes
  React.useEffect(() => {
    if (phoneNumber && selectedCountry.callingCode) {
      const fullNumber = selectedCountry.callingCode + phoneNumber;
      const isValid = isValidPhoneNumber(fullNumber);
      setIsValidNumber(isValid);
    } else {
      setIsValidNumber(false);
    }
  }, [phoneNumber, selectedCountry.callingCode]);

  React.useEffect(() => {
    if (isOpen && countries.length === 0) {
      fetchCountries();
    }
  }, [isOpen]);

  // Close country selector when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (showCountrySelector && !event.target.closest('.country-selector')) {
        setShowCountrySelector(false);
      }
      // Hide cursor when clicking outside phone input
      if (showCursor && !event.target.closest('.phone-input')) {
        setShowCursor(false);
      }
    };

    if (showCountrySelector || showCursor) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showCountrySelector, showCursor]);

  // Monitor online/offline status
  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleNumberClick = (number) => {
    // Get maximum length for the selected country
    const maxLength = getMaxPhoneLength(selectedCountry.code);
    
    setPhoneNumber(prev => {
      if (prev.length >= maxLength) {
        return prev; // Don't add more digits if limit reached
      }
      return prev + number;
    });
    setError(''); // Clear error when typing
    setShowCursor(false); // Hide cursor when typing
  };

  const handleClear = () => {
    setPhoneNumber('');
    setError('');
  };

  const handleBackspace = () => {
    setPhoneNumber(prev => prev.slice(0, -1));
    setError('');
    setShowCursor(false); // Hide cursor when backspacing
  };

  const handleSendOTP = async () => {
    // Check if offline
    if (!isOnline) {
      setError('⚠ Turn on your internet to send the OTP');
      return;
    }

    // Check if phone number is valid
    if (!isValidNumber) {
      setError('⚠ Please enter a valid phone number');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Combine country code with phone number
      const fullPhoneNumber = selectedCountry.callingCode + phoneNumber;
      
      // Call the backend to send OTP
      const result = await window.myAPI?.sendPasswordResetOTP(fullPhoneNumber, userInfo.role);
      
      if (result && result.success) {
        // OTP sent successfully, proceed to next step
        onNext({ ...userInfo, phoneNumber: fullPhoneNumber });
      } else {
        // Check for specific error messages
        if (result?.message && result.message.includes('Phone number not found')) {
          setError('⚠ Phone number not found in our records');
        } else if (result?.message && result.message.includes('registered as')) {
          setError(`⚠ ${result.message}`);
        } else if (result?.message && result.message.includes('not found')) {
          setError('⚠ Enter correct phone number');
        } else {
          setError(result?.message || 'Failed to send OTP. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      if (!isOnline) {
        setError('⚠ Turn on your internet to send the OTP');
      } else {
        setError('Failed to send OTP. Please try again.');
      }
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
                <div className="relative country-selector">
                  <button
                    onClick={() => setShowCountrySelector(!showCountrySelector)}
                    className="flex items-center bg-white border-2 rounded-lg px-3 py-3 shadow-inner hover:bg-gray-50 transition-colors"
                    style={{ borderColor: themeStyles.rightActionButtonsBg }}
                  >
                    <span className="text-2xl">{selectedCountry.flag}</span>
                    <svg className="w-4 h-4 ml-2" style={{ color: themeStyles.rightActionButtonsBg }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {/* Country Dropdown */}
                  {showCountrySelector && (
                    <div className="absolute top-full left-0 mt-1 bg-white border-2 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto min-w-[280px]"
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
                            <span className="text-xl mr-3">{country.flag}</span>
                            <span className="text-sm text-gray-700 flex-1">{country.name}</span>
                            <span className="text-sm font-mono text-gray-500">{country.callingCode}</span>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
                
                {/* Phone Number Input */}
                <div 
                  className="flex items-center bg-white border-2 rounded-lg px-4 py-3 min-w-[200px] shadow-inner cursor-text phone-input"
                  style={{ borderColor: themeStyles.rightActionButtonsBg }}
                  onClick={() => setShowCursor(true)}
                >
                  <Phone className="w-5 h-5 mr-3" style={{ color: themeStyles.rightActionButtonsBg }} />
                  <span className="font-mono text-lg" style={{ color: themeStyles.rightActionButtonsBg }}>
                    {phoneNumber ? `${selectedCountry.callingCode} ${phoneNumber}` : `${selectedCountry.callingCode} ${'x'.repeat(getMaxPhoneLength(selectedCountry.code))}`}
                  </span>
                  {showCursor && (
                    <span className="ml-1 animate-pulse" style={{ color: themeStyles.rightActionButtonsBg }}>|</span>
                  )}
                </div>
              </div>
              <p className="text-center text-sm" style={{ color: themeStyles.logoSubText }}>
                {phoneNumber.length}/{getMaxPhoneLength(selectedCountry.code)} digits
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
                disabled={isLoading || !isOnline || !isValidNumber}
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
                ) : !isOnline ? (
                  'Offline - No Internet'
                ) : !isValidNumber ? (
                  'Enter Valid Number'
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