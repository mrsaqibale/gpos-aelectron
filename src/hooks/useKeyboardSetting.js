import { useCallback } from 'react';

export const useKeyboardSetting = () => {
  const getKeyboardSetting = useCallback(() => {
    try {
      // Get settings from global context
      const settings = window.appSettings?.current;
      return settings?.select_keyboard || 'System Keyboard';
    } catch (error) {
      console.log('Failed to get keyboard setting:', error);
      return 'System Keyboard'; // Default fallback
    }
  }, []);

  const shouldShowVirtualKeyboard = useCallback(() => {
    const keyboardSetting = getKeyboardSetting();
    return keyboardSetting === 'GBoard';
  }, [getKeyboardSetting]);

  return {
    getKeyboardSetting,
    shouldShowVirtualKeyboard,
    isGBoardSelected: shouldShowVirtualKeyboard()
  };
};
