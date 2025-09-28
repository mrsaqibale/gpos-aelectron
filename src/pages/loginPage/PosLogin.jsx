import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Crown, Settings, DollarSign, ChefHat, X, BarChart3, AlertCircle, User } from 'lucide-react';
import ForgotPinModals from './ForgotPassword';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';

const POSLogin = () => {
  console.log('POSLogin component rendering...');

  const [selectedRole, setSelectedRole] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const [showForgotPinModal, setShowForgotPinModal] = useState(false);
  const { themeColors, changeTheme, currentTheme } = useTheme();

  // Get theme-specific styles for PosLogin
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

  const roles = [
    { id: 'Admin', name: 'Admin', icon: Crown },
    { id: 'Manager', name: 'Manager', icon: Settings },
    { id: 'Cashier', name: 'Cashier', icon: DollarSign, subtitle: 'Multiple Users' },
    { id: 'Chef', name: 'Chef', icon: ChefHat },
    { id: 'Waiter', name: 'Waiter', icon: User }
  ];

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (showForgotPinModal) return;

      if (e.key >= '0' && e.key <= '9') {
        handleNumberClick(e.key);
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Delete') {
        handleClear();
      } else if (e.key === 'Enter') {
        handleLogin();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [pin, selectedRole, showForgotPinModal]);

  // Update time every minute
  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date());
    };

    // Update immediately
    updateTime();

    // Set interval to update every minute
    const interval = setInterval(updateTime, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
    setError(''); // Clear any previous error when role is selected
  };

  const handleNumberClick = (number) => {
    if (!selectedRole) {
      setError('⚠ Please select a role first.');
      return;
    }
    if (pin.length < 4) {
      setPin(prev => prev + number);
      setError(''); // Clear error when user starts typing
    }
  };

  const handleClear = () => {
    if (!selectedRole) {
      setError('⚠ Please select a role first.');
      return;
    }
    setPin('');
  };

  const handleBackspace = () => {
    if (!selectedRole) {
      setError('⚠ Please select a role first.');
      return;
    }
    setPin(prev => prev.slice(0, -1));
  };

  const handleLogin = async () => {
    if (!selectedRole) {
      setError('⚠ Please select a role first.');
      return;
    }
    if (pin.length < 4) {
      setError('⚠ PIN must be 4 digits.');
      return;
    }
    if (selectedRole && pin.length >= 4) {
      setIsLoading(true);
      
      // Add a minimum loading time of 1 second
      const loadingPromise = new Promise(resolve => setTimeout(resolve, 1000));
      
      try {
        console.log('Login attempt:', { role: selectedRole, pin });

        // Call the backend login function
        const loginPromise = window.myAPI?.loginEmployee(pin, selectedRole);
        
        // Wait for both the minimum loading time and the actual login
        const [result] = await Promise.all([loginPromise, loadingPromise]);

        if (result.success) {
          console.log('Login successful:', result.data);
          
          // Create employee login session after successful authentication
          try {
            const loginSessionResult = await window.myAPI?.createEmployeeLogin(result.data.id);
            if (loginSessionResult.success) {
              console.log('Employee login session created:', loginSessionResult);
              // Store login session data along with employee data
              localStorage.setItem('currentEmployee', JSON.stringify({
                ...result.data,
                loginSessionId: loginSessionResult.login_id,
                loginTime: loginSessionResult.login_time
              }));
            } else {
              console.warn('Failed to create login session:', loginSessionResult.message);
              // Still proceed with login even if session creation fails
              localStorage.setItem('currentEmployee', JSON.stringify(result.data));
            }
          } catch (sessionError) {
            console.error('Error creating login session:', sessionError);
            // Still proceed with login even if session creation fails
            localStorage.setItem('currentEmployee', JSON.stringify(result.data));
          }
          
          // Reload app settings after successful login
          try {
            if (window.appSettings && typeof window.appSettings.reloadSettings === 'function') {
              await window.appSettings.reloadSettings();
            }
          } catch (e) {
            console.warn('Could not reload app settings on login:', e);
          }

          // Navigate to dashboard
          navigate('/dashboard');
        } else {
          setError('⚠ Invalid PIN or role. Please try again.');
          setPin(''); // Clear PIN on failed attempt
        }
      } catch (error) {
        console.error('Login error:', error);
        setError('⚠ Login failed. Please try again.');
        setPin(''); // Clear PIN on error
      } finally {
        setIsLoading(false);
      }
    }
  };

  const togglePinVisibility = () => {
    setShowPin(!showPin);
  };

  const getSelectedRoleName = () => {
    const role = roles.find(r => r.id === selectedRole);
    return role ? role.name : '';
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleForgotPinClick = () => {
    setShowForgotPinModal(true);
  };

  const handleForgotPinClose = () => {
    setShowForgotPinModal(false);
  };

  // Utility function to handle employee logout (can be used from other components)
  const handleEmployeeLogout = async (employeeId) => {
    try {
      if (employeeId) {
        const logoutResult = await window.myAPI?.updateEmployeeLogout(employeeId);
        if (logoutResult.success) {
          console.log('Employee logout session updated:', logoutResult);
        } else {
          console.warn('Failed to update logout session:', logoutResult.message);
        }
      }
    } catch (error) {
      console.error('Error updating logout session:', error);
    }
  };

  // Expose logout function globally for use in other components
  React.useEffect(() => {
    window.handleEmployeeLogout = handleEmployeeLogout;
    return () => {
      delete window.handleEmployeeLogout;
    };
  }, []);

  const renderPinDisplay = () => {
    const boxes = Array.from({ length: 4 }, (_, index) => {
      const hasDigit = index < pin.length;
      const digit = pin[index] || '';
      const isEmpty = !hasDigit;

      return (
        <div
          key={index}
          className={`w-10 h-10 border-[1px] rounded-lg flex items-center justify-center text-lg font-semibold transition-all duration-200 ${isEmpty
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
      <div className="flex justify-center items-center gap-2">
        {boxes}
        <button
          onClick={togglePinVisibility}
          disabled={!selectedRole}
          className={`ml-1 w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-200 bg-primary hover:shadow-lg ${selectedRole
              ? 'text-[#032D3A] hover:text-white hover:bg-[#032D3A] cursor-pointer'
              : 'text-[#032D3A] cursor-not-allowed'
            }`}
        >
          {showPin ? <EyeOff className="w-6 h-6 text-white" /> : <Eye className="w-6 h-6 text-white" />}
        </button>
      </div>
    );
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
      backgroundColor: selectedRole ? themeStyles.rightActionButtonsBg : themeStyles.rightActionButtonsBg,
      color: selectedRole ? 'white' : 'white',
      border: selectedRole ? 'none' : `2px solid ${themeStyles.rightActionButtonsBg}`,
    };

    return (
      <button
        onClick={onClick}
        className={`${baseClasses} ${className}`}
        style={buttonStyle}
      >
        {children}
      </button>
      );
  };


  return (
    <>
      <div
        className="w-full h-screen relative flex flex-col items-center justify-center px-6 py-0 transition-colors duration-300"
        style={{ backgroundColor: themeStyles.screenBg }}
      >
        {/* Close button for login page */}
        <button
          onClick={() => window.loginWindowControls?.close()}
          className="absolute top-14 right-4 w-8 h-8 flex items-center justify-center text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors duration-200 rounded-full border border-gray-300 hover:border-red-300"
          title="Close Application"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="py-4 rounded-t-xl">
          <div
            className="flex flex-col items-center justify-center text-center"
          >
            <div className="w-24 h-20 rounded-2xl border-2 flex flex-col items-center justify-center mb-3 shadow-md shadow-black"
            style={{ backgroundColor: themeStyles.logoBg, borderColor: themeStyles.logoBg  }} 
            >
              <span className="font-bold text-5xl" style={{ color: themeStyles.logoText }}>G</span>
              <span className="font-medium text-base" style={{ color: themeStyles.logoText }}>POS</span>
            </div>
            <p className="text-lg font-bold" style={{ color: themeStyles.logoSubText }}>
              Welcome to GPOS – Smart & Simplified Point of Sale
            </p>
          </div>

        </div>


        {/* Main Content */}
        <div 
          className="w-full h-[480px] max-w-4xl flex transform perspective-1000 rounded-3xl overflow-hidden"
          style={{
            boxShadow: themeStyles.mainContentShadow,
            border: themeStyles.mainContentBorder
          }}
        >

                      {/* Left Section - Role Selection with 3D effect */}
            <div className="w-1/2 p-3" style={{ backgroundColor: themeStyles.leftSectionBg }}>
            <h2 className="text-2xl mt-2 font-bold text-white mb-6 text-center">
              Select Your Role
            </h2>

            <div className="grid h-[300px] grid-cols-2 gap-4">
              {roles.map((role) => {
                const IconComponent = role.icon;
                const isSelected = selectedRole === role.id;

                return (
                  
                  <button
                      key={role.id}
                      onClick={() => handleRoleSelect(role.id)}
                      className={`
                        ${isSelected
                          ? 'scale-[1.04] z-[1]'
                          : 'hover:bg-transparent hover:border-white'}
                         rounded-xl transition-all duration-300 
                        flex flex-col items-center justify-center h-24
                        hover:cursor-pointer transform hover:-translate-y-1 hover:scale-105 active:translate-y-0 
                        border-[2.5px]
                      `}
                                                                                              style={{
                          transformStyle: 'preserve-3d',
                          background: isSelected ? themeStyles.roleButtonSelectedBg : themeStyles.roleButtonBg,
                          border: themeStyles.roleButtonBorder,
                          boxShadow: isSelected
                            ? `0 0 16px 2px ${themeStyles.roleButtonBorder}, 0 0 0 4px rgba(52, 160, 164, 0.12)`
                            : '0 4px 6px -1px rgba(0,0,0,0.2), 0 2px 4px -1px rgba(0,0,0,0.1)'
                        }}
                    >
                      <IconComponent className="w-8 h-8 mb-1" style={{ color: isSelected ? themeStyles.roleButtonSelectedText : themeStyles.roleButtonText }} />
                      <span className="text-xl font-bold" style={{ color: isSelected ? themeStyles.roleButtonSelectedText : themeStyles.roleButtonText }}>{role.name}</span>
                                              {role.subtitle && (
                          <span className="text-xs opacity-70" style={{ color: isSelected ? themeStyles.roleButtonSelectedText : themeStyles.roleButtonText }}>{role.subtitle}</span>
                        )}
                    </button>

                );
              })}
            </div>
          </div>

          {/* Right Section - PIN Entry with 3D effect */}
          <div
            className="w-1/2 bg-[#ffffff] text-black p-3"
            style={{
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)'
            }}
          >
            {/* Logging in as Role Header */}
            {selectedRole && (
              <div className="mb-2 p-2] rounded-md border border-[#4a7ca3] shadow-inner max-w-xs mx-auto">
                <div className="flex items-center justify-center gap-1 text-black">
                  <BarChart3 className="w-3 h-3" />
                  <span className="text-sm font-medium">
                    Logging in as: {getSelectedRoleName()}
                  </span>
                </div>
              </div>
            )}

            <h2 className="text-xl mt-0 font-semibold text-black mb-2 text-center transform transition-transform hover:scale-105">
              Enter PIN To Continue
            </h2>

            {/* PIN Display */}
            <div className="mb-2">
              {renderPinDisplay()}
              <p className="text-center text-xs text-gray-400 mt-2">
                {pin.length}/4 digits
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-2 mx-10 flex items-center justify-center gap-2 bg-white text-red-500 p-2 rounded-lg border border-red-500">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}

            {/* Number Pad with 3D buttons */}
            <div className="max-w-xs mx-auto mb-2">
              {/* First 3 rows */}
              <div className="grid grid-cols-3 gap-3 mb-2 text-white cursor-pointer">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
                                     <NumberButton
                     key={number}
                     number={number}
                     onClick={handleNumberClick}
                     style={{
                       start: themeColors.keypad,
                       end: themeColors.keypad_end,
                     }}
                   />
                ))}
              </div>

              <div className="grid grid-cols-3 gap-3">
                  <ActionButton
                    onClick={handleClear}
                    variant="clear"
                    disabled={!selectedRole}
                  >
                    Clear
                  </ActionButton>
                                     <NumberButton
                     number={0}
                     onClick={handleNumberClick}
                     style={{
                       start: themeColors.keypad,
                       end: themeColors.keypad_end,
                     }}
                   />

                  <ActionButton
                    onClick={handleBackspace}
                    variant="backspace"
                    disabled={!selectedRole}
                  >
                    <svg className="w-6 h-6" viewBox="0 0 20 20" fill="none">
                       <path
                         d="M7.5 10H15M5.5 5L2 10L5.5 15M15 5V15"
                         stroke={selectedRole ? 'white' : 'white'}
                         strokeWidth="1.5"
                         strokeLinecap="round"
                         strokeLinejoin="round"
                       />
                     </svg>
                  </ActionButton>
                </div>

            </div>

            {/* Login Button with 3D effect */}
            <div className="mb-2 flex justify-center">
              <button
                onClick={handleLogin}
                disabled={!selectedRole || pin.length < 4 || isLoading}
                className="w-[80%] cursor-pointer text-white py-3 rounded-lg text-base font-semibold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:-translate-y-1 active:translate-y-0 active:shadow-inner"
                                 style={{
                     backgroundColor: themeStyles.rightActionButtonsBg,
                     borderColor: themeStyles.rightActionButtonsBg,
                   }}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Logging in...
                  </>
                ) : (
                  'Login'
                )}
              </button>

            </div>

            {/* Forgot PIN */}
            <div className="text-center">
              <button
                onClick={handleForgotPinClick}
                className=" underline font-semibold cursor-pointer text-sm transition-colors hover:-translate-y-0.5"
                                 style={{
                     color: themeStyles.rightActionButtonsBg,
                   }}
              >
                Forgot PIN?
              </button>
            </div>

            {/* Current Time Display */}
            <div className="text-center mt-1">
              <div className="text-lg flex items-start justify-start ml-10 font-semibold text-gray-600">
                <span
                  className="inline-flex items-center justify-center rounded-full mr-2"
                  style={{
                    backgroundColor: themeStyles.rightActionButtonsBg,
                    width: 24,
                    height: 24,
                  }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M5 10.5L9 14.5L15 7.5"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <p className='text-[16px]'>Time In logged at {formatTime(currentTime)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot PIN Modals */}
      <ForgotPinModals
        isOpen={showForgotPinModal}
        onClose={handleForgotPinClose}
      />


    </>
  );
};

export default POSLogin;
