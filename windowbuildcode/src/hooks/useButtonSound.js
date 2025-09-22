import { useCallback } from 'react';

export const useButtonSound = () => {
  const playButtonSound = useCallback(() => {
    try {
      // Get settings from global context if available
      const settings = window.appSettings?.current;
      
      // Check if sound alerts are enabled in settings
      const soundAlertEnabled = settings?.sound_alert === 1 || settings?.sound_alert === true;
      
      if (!soundAlertEnabled) {
        return; // Don't play sound if disabled
      }

      // Play button press sound with relative path
      const audio = new Audio('./src/assets/buttonPressBeep.mp3');
      audio.play().catch(error => {
        console.log('Button sound play failed:', error);
      });
    } catch (error) {
      console.log('Button sound creation failed:', error);
    }
  }, []);

  return { playButtonSound };
};
