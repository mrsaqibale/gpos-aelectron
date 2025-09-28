// Sound utility for handling audio file paths in both development and production
import path from 'path';

// Function to get the correct audio file path based on environment
export const getAudioPath = (audioFileName) => {
  try {
    // Check if we're in a built app (app.asar) or have resourcesPath
    const isBuiltApp = window.location.protocol === 'file:' || 
                      window.location.href.includes('app.asar') ||
                      process?.resourcesPath;
    
    console.log(`[soundUtils] Getting audio path for: ${audioFileName}`);
    console.log(`[soundUtils] isBuiltApp: ${isBuiltApp}`);
    console.log(`[soundUtils] window.location.protocol: ${window.location.protocol}`);
    console.log(`[soundUtils] window.location.href: ${window.location.href}`);
    
    if (isBuiltApp) {
      // Built app: use resources path
      const builtPath = `./assets/${audioFileName}`;
      console.log(`✅ [soundUtils] Using built app path: ${builtPath}`);
      return builtPath;
    } else {
      // Development: use relative path from src/assets
      const devPath = `./src/assets/${audioFileName}`;
      console.log(`✅ [soundUtils] Using dev path: ${devPath}`);
      return devPath;
    }
  } catch (error) {
    console.error(`[soundUtils] Failed to resolve audio path: ${audioFileName}`, error);
    // Fallback to development path
    return `./src/assets/${audioFileName}`;
  }
};

// Function to play audio with proper path resolution
export const playAudio = (audioFileName, options = {}) => {
  try {
    const audioPath = getAudioPath(audioFileName);
    const audio = new Audio(audioPath);
    
    if (options.volume !== undefined) {
      audio.volume = options.volume;
    }
    
    return audio.play().catch(error => {
      console.log(`Audio play failed for ${audioFileName}:`, error);
    });
  } catch (error) {
    console.log(`Audio creation failed for ${audioFileName}:`, error);
  }
};

// Predefined audio functions for common sounds
export const playButtonSound = (options = {}) => {
  return playAudio('buttonPressBeep.mp3', options);
};

export const playNotificationSound = (options = {}) => {
  return playAudio('newNotificationBeep.mp3', options);
};

export const playProductAddSound = (options = {}) => {
  return playAudio('newProductAdd.mp3', options);
};






