import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { ArrowRight, Sparkles, Coffee, Utensils, Users, Clock, X, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { useHotelStatus } from '../../hooks/useHotelStatus';

const WelcomeScreen = () => {
  const navigate = useNavigate();
  const { themeColors } = useTheme();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const { isLoading, isLicensed, error } = useHotelStatus();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState(''); // 'uploading', 'success', 'error'
  const [uploadMessage, setUploadMessage] = useState('');

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

  // Database upload functions
  const uploadDatabase = async (file, license, adminName, hotelUsername) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('license', license);
      formData.append('adminName', adminName);
      formData.append('hotelUsername', hotelUsername);

      const response = await fetch('http://127.0.0.1:8080/api/v1/upload/database', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      
      if (result.status === 'ok') {
        console.log('Upload successful:', result.filePath);
        return { success: true, data: result };
      } else if (result.status === 'inactive') {
        console.log('License expired:', result.message);
        return { success: false, error: 'LICENSE_EXPIRED', message: result.message };
      } else {
        console.log('Upload failed:', result.message);
        return { success: false, error: 'UPLOAD_FAILED', message: result.message };
      }
    } catch (error) {
      console.error('Network error:', error);
      return { success: false, error: 'NETWORK_ERROR', message: error.message };
    }
  };

  const handleCloseApp = async () => {
    try {
      setIsUploading(true);
      setUploadProgress(0);
      setUploadStatus('uploading');
      setUploadMessage('Preparing database backup...');

      // Get hotel info from database
      const hotelInfo = await window.myAPI.getHotelInfo();
      if (!hotelInfo.success) {
        throw new Error('Failed to get hotel information');
      }

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Get database file path
      const dbPath = await window.myAPI.getDatabasePath();
      if (!dbPath.success) {
        throw new Error('Failed to get database path');
      }

      setUploadMessage('Uploading database to server...');

      // Read the database file
      const fileResponse = await fetch(`local-file://${dbPath.path}`);
      if (!fileResponse.ok) {
        throw new Error('Failed to read database file');
      }
      
      const fileBlob = await fileResponse.blob();
      const file = new File([fileBlob], 'pos.db', { type: 'application/x-sqlite3' });
      
      // Upload database
      const uploadResult = await uploadDatabase(
        file,
        'QgtXF2TwCu03gKIwZJbO', // License key
        'saqib', // Admin name
        'miday' // Hotel username
      );

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (uploadResult.success) {
        setUploadStatus('success');
        setUploadMessage('Database uploaded successfully! Closing application...');
        
        // Close app after 2 seconds
        setTimeout(() => {
          window.loginWindowControls?.close();
        }, 2000);
      } else {
        setUploadStatus('error');
        setUploadMessage(uploadResult.message || 'Upload failed');
        
        // Still close app after 3 seconds even if upload failed
        setTimeout(() => {
          window.loginWindowControls?.close();
        }, 3000);
      }
    } catch (error) {
      console.error('Error during upload:', error);
      setUploadStatus('error');
      setUploadMessage(error.message || 'Upload failed');
      
      // Close app after 3 seconds even if upload failed
      setTimeout(() => {
        window.loginWindowControls?.close();
      }, 3000);
    }
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
        onClick={handleCloseApp}
        disabled={isUploading}
        className={`absolute top-4 right-4 w-8 h-8 flex items-center justify-center transition-colors duration-200 rounded-full border z-50 ${
          isUploading 
            ? 'text-gray-400 cursor-not-allowed border-gray-200' 
            : 'text-gray-600 hover:text-red-600 hover:bg-red-50 border-gray-300 hover:border-red-300'
        }`}
        title={isUploading ? "Uploading database..." : "Close Application"}
      >
        {isUploading ? (
          <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <X className="w-5 h-5" />
        )}
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
          {isLoading ? (
            <div className="flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gray-100">
              <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-600 font-medium">Checking License Status...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-red-50 border border-red-200">
              <span className="text-red-600 font-medium">Error: {error}</span>
            </div>
          ) : isLicensed ? (
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
          ) : null}
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

      {/* Upload Progress Overlay */}
      {isUploading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div 
            className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl"
            style={{ border: `2px solid ${themeColors.primary}` }}
          >
            <div className="text-center">
              {/* Status Icon */}
              <div className="mb-6">
                {uploadStatus === 'uploading' && (
                  <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: themeColors.primaryExtraLight }}>
                    <Upload className="w-8 h-8" style={{ color: themeColors.primary }} />
                  </div>
                )}
                {uploadStatus === 'success' && (
                  <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 bg-green-100">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                )}
                {uploadStatus === 'error' && (
                  <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 bg-red-100">
                    <AlertCircle className="w-8 h-8 text-red-600" />
                  </div>
                )}
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {uploadStatus === 'uploading' && 'Uploading Database'}
                {uploadStatus === 'success' && 'Upload Complete'}
                {uploadStatus === 'error' && 'Upload Failed'}
              </h3>

              {/* Message */}
              <p className="text-gray-600 mb-6">
                {uploadMessage}
              </p>

              {/* Progress Bar */}
              {uploadStatus === 'uploading' && (
                <div className="mb-6">
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                    <div 
                      className="h-3 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${uploadProgress}%`,
                        backgroundColor: themeColors.primary
                      }}
                    />
                  </div>
                  <p className="text-sm text-gray-500">{uploadProgress}% Complete</p>
                </div>
              )}

              {/* Server Info */}
              <div className="text-xs text-gray-400 mb-4">
                Server: 127.0.0.1:8080
              </div>

              {/* Status Message */}
              {uploadStatus === 'success' && (
                <div className="text-sm text-green-600 font-medium">
                  Database backup saved successfully!
                </div>
              )}
              {uploadStatus === 'error' && (
                <div className="text-sm text-red-600 font-medium">
                  Application will close anyway...
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
