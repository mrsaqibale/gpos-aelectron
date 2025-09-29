import { useCallback } from 'react';
import { playButtonSound as playButtonSoundUtil } from '../utils/soundUtils.js';

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

      // Play button press sound using utility function
      playButtonSoundUtil();
    } catch (error) {
      console.log('Button sound creation failed:', error);
    }
  }, []);

  return { playButtonSound };
};
