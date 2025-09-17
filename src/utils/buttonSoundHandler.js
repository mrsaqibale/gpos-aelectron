// Global button sound handler
let settings = null;

// Function to update settings from the global context
export const updateButtonSoundSettings = (newSettings) => {
  settings = newSettings;
};

// Function to play button sound based on settings
const playButtonSound = () => {
  try {
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
};

// Global button click handler
const handleButtonClick = (event) => {
  // Check if the clicked element is a button or contains a button
  const target = event.target;
  const isButton = target.tagName === 'BUTTON' || 
                   target.closest('button') || 
                   target.getAttribute('role') === 'button' ||
                   target.classList.contains('btn') ||
                   target.classList.contains('button');
  
  if (isButton) {
    playButtonSound();
  }
};

// Initialize the global button sound handler
export const initializeButtonSoundHandler = () => {
  // Remove existing listener if any
  document.removeEventListener('click', handleButtonClick);
  
  // Add new listener
  document.addEventListener('click', handleButtonClick, true);
  
  console.log('Button sound handler initialized');
};

// Cleanup function
export const cleanupButtonSoundHandler = () => {
  document.removeEventListener('click', handleButtonClick, true);
  console.log('Button sound handler cleaned up');
};
