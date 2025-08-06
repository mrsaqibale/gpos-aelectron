import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Crown, Settings, DollarSign, ChefHat, X, BarChart3, AlertCircle } from 'lucide-react';
import ForgotPinModals from './ForgotPassword';
import { useNavigate } from 'react-router-dom';

const POSLogin = () => {
  console.log('POSLogin component rendering...');

  const [selectedRole, setSelectedRole] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const [showForgotPinModal, setShowForgotPinModal] = useState(false);
  const themes = {
    default: {
      background: '#003C58',
      logo: '#176B87',
      logo_border: '#0D445E',
      keypad: '#176b87',
      keypad_end: '#00bcd4',
      keypadBorder: '#1976d2',
      buttonHover: '#06A9C2',
      loginBg: '#005A9C',
      
    },
    blue: {
      background: '#00428C',
      logo: '#004687',
      logo_border: '#0C4789',
      keypad: '#00428c',
      keypad_end: '#4f8cff',
      keypadBorder: '#34A0A4',
      buttonHover: '#3B79E2',
      loginBg: '#34A0A4',
    },
    green: {
      background: '#25A18E',
      logo: '#34A0A4',
      logo_border: '#2FA391',
      keypad: '#25a18e',
      keypad_end: '#86efac',
      keypadBorder: '#2d5a87',
      buttonHover: '#6AD9A4',
      loginBg: '#2d5a87',
    },
  };
  const [theme, setTheme] = useState(themes.default);
   const changeTheme = (themeKey) => {
    setTheme(themes[themeKey]);
  };

  const roles = [
    { id: 'Admin', name: 'Admin', icon: Crown },
    { id: 'Manager', name: 'Manager', icon: Settings },
    { id: 'Cashier', name: 'Cashier', icon: DollarSign, subtitle: 'Multiple Users' },
    { id: 'Chef', name: 'Chef', icon: ChefHat }
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

  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
    setError(''); // Clear any previous error when role is selected
  };

  const handleNumberClick = (number) => {
    if (!selectedRole) {
      setError('⚠ Please select a role first.');
      return;
    }
    if (pin.length < 6) {
      setPin(prev => prev + number);
      setError(''); // Clear error when user starts typing
    }
  };

  const handleClear = () => {
    setPin('');
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
  };

  const handleLogin = async () => {
    if (!selectedRole) {
      setError('⚠ Please select a role first.');
      return;
    }
    if (pin.length < 4) {
      setError('⚠ PIN must be at least 4 digits.');
      return;
    }
    if (selectedRole && pin.length >= 4) {
      try {
        console.log('Login attempt:', { role: selectedRole, pin });

        // Call the backend login function
        const result = await window.myAPI?.loginEmployee(pin, selectedRole);

        if (result.success) {
          console.log('Login successful:', result.data);
          // Store employee data in localStorage or state management
          localStorage.setItem('currentEmployee', JSON.stringify(result.data));
          navigate('/dashboard');
        } else {
          setError('⚠ Invalid PIN or role. Please try again.');
          setPin(''); // Clear PIN on failed attempt
        }
      } catch (error) {
        console.error('Login error:', error);
        setError('⚠ Login failed. Please try again.');
        setPin(''); // Clear PIN on error
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

  const handleForgotPinClick = () => {
    setShowForgotPinModal(true);
  };

  const handleForgotPinClose = () => {
    setShowForgotPinModal(false);
  };

  const renderPinDisplay = () => {
    const boxes = Array.from({ length: 6 }, (_, index) => {
      const hasDigit = index < pin.length;
      const digit = pin[index] || '';
      const isEmpty = !hasDigit;

      return (
        <div
          key={index}
          className={`w-10 h-10 border-[1.5px] rounded-lg flex items-center justify-center text-lg font-semibold transition-all duration-200 ${isEmpty
              ? 'border-[#1e3a5f] bg-[#0f2a44]'
              : 'border-[#2d5a87] bg-[#032D3A] text-white'
            } shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]`}
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
          className={`ml-3 w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-200 shadow-md hover:shadow-lg ${selectedRole
              ? 'text-gray-300 hover:text-white hover:bg-[#032D3A] cursor-pointer'
              : 'text-gray-500 cursor-not-allowed'
            }`}
        >
          {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>
    );
  };

    const NumberButton = ({ number, onClick, style }) => (
      <button
        onClick={() => onClick(number)}
        disabled={!selectedRole}
        className="rounded-xl py-2 px-4 shadow-lg cursor-pointer hover:shadow-xl text-white font-bold text-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105"
        style={{
          background: `linear-gradient(145deg, ${style?.start} 60%, ${style?.end} 100%)`
        }}
      >
        {number}
      </button>
    );


  const ActionButton = ({ onClick, className = "", children, variant = "default", disabled = false }) => {
    const baseClasses = "h-11 rounded-lg text-sm font-semibold transition-all duration-200 border-[1.5px] flex items-center justify-center shadow-md hover:shadow-lg active:shadow-inner active:translate-y-0.5";
    const variantClasses = {
      clear: disabled
        ? `bg-linear-to-145-from${theme.keypad}-to-${theme.keypad_end} border-[#4a7ca3] text-gray-500 cursor-not-allowed`
        : "bg-red-900/40 hover:bg-red-800/50 border-[#4a7ca3] cursor-pointer text-red-300 hover:border-red-500",
      backspace: disabled
        ? "bg-[#032D3A] text-gray-500 cursor-not-allowed border-[#4a7ca3]"
        : "bg-[#032D3A] hover:bg-[#2d5a87] border-[#4a7ca3] cursor-pointer text-white hover:border-[#4a7ca3]",
      default: baseClasses
    };

    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      >
        {children}
      </button>
    );
  };

  return (
    <>
      <div
        className="w-full min-h-screen relative flex flex-col items-center justify-center px-6 py-3 transition-colors duration-300"
        style={{ backgroundColor: theme.background }}
      >

        <div className="py-6 rounded-t-xl">
          <div className="absolute top-4 right-6 flex gap-2">
           <button
              onClick={() => changeTheme("default")}
              className="w-5 h-5 rounded-full border border-white cursor-pointer transform active:scale-95"
              style={{ background: "linear-gradient(to bottom right, #003E5C, #1976d2)" }}
            />
            <button
              onClick={() => changeTheme("blue")}
              className="w-5 h-5 rounded-full border border-white cursor-pointer transform active:scale-95"
              style={{ background: "linear-gradient(to bottom right, #176B87, #3498db)" }}
            />
            <button
              onClick={() => changeTheme("green")}
              className="w-5 h-5 rounded-full border border-white cursor-pointer transform active:scale-95"
              style={{ background: "linear-gradient(to bottom right, #25A18E, #34A0A4)" }}
            />
          </div>


          <div
            className="flex flex-col items-center justify-center text-center mt-6"
          >
            <div className="w-24 h-20 rounded-2xl border-2 flex flex-col items-center justify-center mb-3 shadow-md shadow-black"
            style={{ backgroundColor: theme.logo, borderColor: theme.logo_border  }} 
            >
              <span className="text-white font-bold text-5xl">G</span>
              <span className="text-white font-medium text-base">POS</span>
            </div>
            <p className="text-xl text-white font-semibold">
              Smart Restaurant Billing System
            </p>
          </div>

        </div>


        {/* Main Content */}
        <div className="w-full max-w-4xl flex gap-8 transform perspective-1000">

          {/* Left Section - Role Selection with 3D effect */}
          <div className="w-1/2 h-full bg-transparent rounded-3xl p-6 border-[#4a7ca3] border shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              Select Your Role
            </h2>

            <div className="grid grid-cols-2 gap-4">
              {roles.map((role) => {
                const IconComponent = role.icon;
                const isSelected = selectedRole === role.id;

                return (
                  <button
                      key={role.id}
                      onClick={() => handleRoleSelect(role.id)}
                      className={`
                        ${isSelected ? 'border-3 border-[#4a7ca3] text-white' : 'border-[#1e3a5f] text-black hover:bg-transparent hover:border-white'}
                        p-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl
                        flex flex-col items-center justify-center h-24 hover:cursor-pointer 
                        transform hover:-translate-y-1 hover:scale-105 active:translate-y-0 
                        border-2
                      `}
                      style={{
                        transformStyle: 'preserve-3d',
                        boxShadow: isSelected
                          ? '0 10px 15px -3px rgba(0,0,0,0.2), 0 4px 6px -2px rgba(0,0,0,0.1), inset 0 0 0 2px #4a7ca3'
                          : '0 4px 6px -1px rgba(0,0,0,0.2), 0 2px 4px -1px rgba(0,0,0,0.1)',
                        background: isSelected
                          ? `linear-gradient(135deg, ${theme.loginBg}, ${theme.buttonHover})`
                          : '#ffffff',
                        borderColor: isSelected ? theme.loginBg : '#1e3a5f'
                      }}
                    >
                      <IconComponent className="w-6 h-6 mb-1" />
                      <span className="text-md font-bold">{role.name}</span>
                      {role.subtitle && (
                        <span className="text-xs opacity-70">{role.subtitle}</span>
                      )}
                    </button>
                );
              })}
            </div>
          </div>

          {/* Right Section - PIN Entry with 3D effect */}
          <div
            className="w-1/2 bg-[#ffffff] text-black rounded-2xl p-6 shadow-2xl border-1 border-[#2d5a87]"
            style={{
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)'
            }}
          >
            {/* Logging in as Role Header */}
            {selectedRole && (
              <div className="mb-3 p-2] rounded-md border border-[#4a7ca3] shadow-inner max-w-xs mx-auto">
                <div className="flex items-center justify-center gap-1 text-black">
                  <BarChart3 className="w-3 h-3" />
                  <span className="text-sm font-medium">
                    Logging in as: {getSelectedRoleName()}
                  </span>
                </div>
              </div>
            )}

            <h2 className="text-2xl font-semibold text-black mb-6 text-center transform transition-transform hover:scale-105">
              Enter PIN To Continue
            </h2>

            {/* PIN Display */}
            <div className="mb-4">
              {renderPinDisplay()}
              <p className="text-center text-xs text-gray-400 mt-2">
                {pin.length}/6 digits (min 4)
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 flex items-center justify-center gap-2 bg-red-900/40 text-red-300 p-2 rounded-lg border border-red-600/30">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}

            {/* Number Pad with 3D buttons */}
            <div className="max-w-xs mx-auto mb-4">
              {/* First 3 rows */}
              <div className="grid grid-cols-3 gap-3 mb-3 text-white cursor-pointer">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
                  <NumberButton
                    key={number}
                    number={number}
                    onClick={handleNumberClick}
                    style={{
                      start: theme.keypad,
                      end: theme.keypad_end,
                    }}
                  />
                ))}
              </div>


              <div className="grid grid-cols-3 gap-3">
                  <ActionButton
                    onClick={handleClear}
                    variant="clear"
                    disabled={!selectedRole}
                    // style={{
                    //   background: `linear-gradient(145deg, ${theme.keypad} 60%, ${theme.keypad_end} 100%)`
                    // }}
                  >
                    Clear
                  </ActionButton>

                  <NumberButton
                    number={0}
                    onClick={handleNumberClick}
                    style={{
                      start: theme.keypad,
                      end: theme.keypad_end,
                    }}
                  />

                  <ActionButton
                    onClick={handleBackspace}
                    variant="backspace"
                    disabled={!selectedRole}
                    style={{
                      background: `linear-gradient(145deg, ${theme.keypad} 60%, ${theme.keypad_end} 100%)`
                    }}
                  >
                    <X className="w-4 h-4" />
                  </ActionButton>
                </div>

            </div>

            {/* Login Button with 3D effect */}
            <div className="mb-4 flex justify-center">
              <button
                onClick={handleLogin}
                disabled={!selectedRole || pin.length < 4}
                className="w-[86%] bg-[#2d5a87] cursor-pointer hover:bg-[#4a7ca3] text-white py-3 rounded-lg text-base font-semibold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:-translate-y-1 active:translate-y-0 active:shadow-inner border border-[#4a7ca3]"
                style={{
                    background: `linear-gradient(145deg, ${theme.keypad} 60%, ${theme.keypad_end} 100%)`,
                    borderColor: theme.loginBg,
                  }}
              >
                Login
              </button>

            </div>

            {/* Forgot PIN */}
            <div className="text-center">
              <button
                onClick={handleForgotPinClick}
                className="text-gray-300 hover:text-white cursor-pointer text-sm font-semibold transition-colors hover:-translate-y-0.5"
              >
                Forgot PIN?
              </button>
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
