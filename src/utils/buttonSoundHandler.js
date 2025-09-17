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
  
  // More comprehensive button detection
  const isButton = target.tagName === 'BUTTON' || 
                   target.closest('button') || 
                   target.getAttribute('role') === 'button' ||
                   target.classList.contains('btn') ||
                   target.classList.contains('button') ||
                   target.classList.contains('btn-lifted') ||
                   target.closest('[data-invoice-button]') ||
                   target.closest('.cursor-pointer') ||
                   // Check for NavLink elements (React Router links that act like buttons)
                   target.closest('a[class*="cursor-pointer"]') ||
                   target.closest('a[class*="hover:"]') ||
                   // Check for sidebar navigation links
                   target.closest('a[class*="flex items-center"]') ||
                   // Check for any clickable element with specific classes
                   target.closest('[class*="hover:bg-"]') ||
                   target.closest('[class*="hover:text-"]') ||
                   // Check for elements with onClick handlers (this is a fallback)
                   target.onclick !== null ||
                   // Check if parent element is clickable
                   target.parentElement?.onclick !== null ||
                   target.parentElement?.tagName === 'BUTTON' ||
                   target.parentElement?.classList.contains('cursor-pointer');
  
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
