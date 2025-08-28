import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { ArrowRight, Sparkles, Coffee, Utensils, Users, Clock, X, Key } from 'lucide-react';

const WelcomeScreen = () => {
  const navigate = useNavigate();
  const { themeColors } = useTheme();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isButtonHovered, setIsButtonHovered] = useState(false);

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

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleGoToLogin = () => {
    navigate('/login');
  };

  const handleGoToLicense = () => {
    navigate('/license');
  };

  const features = [
    { icon: Coffee, title: 'Smart Ordering', description: 'Streamlined order management' },
    { icon: Utensils, title: 'Kitchen Display', description: 'Real-time kitchen coordination' },
    { icon: Users, title: 'Customer Care', description: 'Enhanced customer experience' },
    { icon: Clock, title: '24/7 Support', description: 'Always ready to serve' }
  ];

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{ backgroundColor: themeColors.dashboardBackground }}
    >
      {/* Close button for welcome screen */}
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
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        
        {/* Logo Section */}
        <div className="mb-4 transform hover:scale-105 transition-transform duration-300">
          <div 
            className="w-32 h-32 mx-auto rounded-3xl border-4 flex flex-col items-center justify-center mb-6 shadow-2xl"
            style={{ 
              backgroundColor: themeColors.primary, 
              borderColor: themeColors.primaryLight,
              boxShadow: `0 20px 40px rgba(0, 0, 0, 0.1), 0 0 0 1px ${themeColors.primaryLight}20`
            }}
          >
            <span className="text-white font-bold text-6xl mb-1">G</span>
            <span className="text-white font-medium text-xl">POS</span>
          </div>
          
          {/* Sparkles around logo */}
          <div className="relative">
            <Sparkles 
              className="absolute -top-4 -left-4 w-6 h-6 animate-pulse" 
              style={{ color: themeColors.primaryLight }}
            />
            <Sparkles 
              className="absolute -top-4 -right-4 w-6 h-6 animate-pulse" 
              style={{ color: themeColors.primaryLight }}
            />
            <Sparkles 
              className="absolute -bottom-4 -left-4 w-6 h-6 animate-pulse" 
              style={{ color: themeColors.primaryLight }}
            />
            <Sparkles 
              className="absolute -bottom-4 -right-4 w-6 h-6 animate-pulse" 
              style={{ color: themeColors.primaryLight }}
            />
          </div>
        </div>

        {/* Welcome Text */}
        <div className="mb-12">
          <h1 
            className="text-5xl font-bold mb-4 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent"
          >
            Welcome to GPOS
          </h1>
          <p 
            className="text-xl text-gray-600 mb-2 font-medium"
          >
            Smart & Simplified Point of Sale
          </p>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Experience the future of restaurant management with our comprehensive POS solution. 
            From order processing to kitchen coordination, we've got everything covered.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 max-w-3xl mx-auto">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div 
                key={index}
                className="p-4 rounded-xl text-center transform hover:scale-105 transition-all duration-300"
                style={{ 
                  backgroundColor: 'white',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                  border: `1px solid ${themeColors.primaryExtraLight}`
                }}
              >
                <div 
                  className="w-12 h-12 mx-auto mb-3 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: themeColors.primaryExtraLight }}
                >
                  <IconComponent 
                    className="w-6 h-6" 
                    style={{ color: themeColors.primary }}
                  />
                </div>
                <h3 className="font-semibold text-gray-800 mb-1">{feature.title}</h3>
                <p className="text-sm text-gray-500">{feature.description}</p>
              </div>
            );
          })}
        </div>

        {/* Buttons */}
        <div className="mb-4 flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleGoToLogin}
            onMouseEnter={() => setIsButtonHovered(true)}
            onMouseLeave={() => setIsButtonHovered(false)}
            className="group relative px-8 py-4 rounded-2xl cursor-pointer font-semibold text-lg transition-all duration-300 transform shadow-sm hover:scale-105"
            style={{
              backgroundColor: themeColors.primary,
              color: 'white',
              boxShadow: `0 8px 25px ${themeColors.primary}40`
            }}
          >
            <span className="flex items-center gap-3">
              Go to Login Screen
              <ArrowRight 
                className={`w-5 h-5 transition-transform duration-300 ${
                  isButtonHovered ? 'translate-x-1' : ''
                }`}
              />
            </span>
            
          </button>

          <button
            onClick={handleGoToLicense}
            className="group relative px-8 py-4 rounded-2xl cursor-pointer font-semibold text-lg transition-all duration-300 transform shadow-sm hover:scale-105 border-2"
            style={{
              backgroundColor: 'white',
              color: themeColors.primary,
              borderColor: themeColors.primary,
              boxShadow: `0 8px 25px ${themeColors.primary}20`
            }}
          >
            <span className="flex items-center gap-3">
              <Key className="w-5 h-5" />
              License
            </span>
            
            
          </button>
        </div>

        {/* Time and Date */}
        <div className="text-center">
          <div 
            className="inline-flex items-center gap-3 px-6 py-3 rounded-full"
            style={{ backgroundColor: 'white', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)' }}
          >
            <div className="text-center">
              <div 
                className="text-2xl font-bold"
                style={{ color: themeColors.primary }}
              >
                {formatTime(currentTime)}
              </div>
              <div className="text-sm text-gray-500">
                {formatDate(currentTime)}
              </div>
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

export default WelcomeScreen;
