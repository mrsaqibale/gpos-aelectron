import { useState, useEffect } from 'react';

const useVirtualKeyboard = (inputFields = []) => {
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [activeInput, setActiveInput] = useState('');
  const [keyboardInput, setKeyboardInput] = useState('');
  const [capsLock, setCapsLock] = useState(false);

  // Handle caps lock changes
  useEffect(() => {
    if (capsLock) {
      // The keyboard will automatically use shift layout when capsLock is true
    } else {
      // The keyboard will automatically use default layout when capsLock is false
    }
  }, [capsLock]);

  const handleInputFocus = (inputName, currentValue = '') => {
    setActiveInput(inputName);
    setKeyboardInput(currentValue || '');
    setShowKeyboard(true);
  };

  const handleInputBlur = (e) => {
    // Don't hide keyboard immediately to allow for keyboard input
    // Update the form state when input loses focus
    const { name, value } = e.target;
    if (name === activeInput) {
      setKeyboardInput(value);
    }
    // Don't hide keyboard here, let the parent component decide
  };

  const handleAnyInputFocus = (e, inputName, currentValue = '') => {
    // Always reset keyboard input when switching to a different input
    if (activeInput !== inputName) {
      setKeyboardInput(currentValue || '');
    }
    setActiveInput(inputName);
    setShowKeyboard(true);
    // Set the keyboard input value to match the current form value
    setKeyboardInput(currentValue || '');
    // Also update the form field value to ensure synchronization
    if (e && e.target) {
      e.target.value = currentValue || '';
    }
  };

  const handleAnyInputClick = (e, inputName, currentValue = '') => {
    if (!showKeyboard || activeInput !== inputName) {
      handleAnyInputFocus(e, inputName, currentValue);
    }
  };

  const onKeyboardChange = (input) => {
    setKeyboardInput(input);
    
    // Return the input and activeInput so parent component can handle it
    return { input, activeInput };
  };

  const onKeyboardChangeAll = (inputs) => {
    setKeyboardInput(inputs[activeInput] || '');
  };

  const onKeyboardKeyPress = (button) => {
    if (activeInput) {
      if (button === '{bksp}') {
        const currentValue = keyboardInput || '';
        const newValue = currentValue.slice(0, -1);
        setKeyboardInput(newValue);
        return { action: 'backspace', value: newValue, activeInput };
      } else if (button === '{enter}') {
        // Move to next input field or submit form
        const currentIndex = inputFields.indexOf(activeInput);
        if (currentIndex < inputFields.length - 1) {
          const nextField = inputFields[currentIndex + 1];
          return { action: 'enter', nextField, activeInput };
        } else {
          return { action: 'enter', submit: true, activeInput };
        }
      } else if (button === '{lock}') {
        // Toggle caps lock
        setCapsLock(!capsLock);
        return { action: 'capslock', capsLock: !capsLock };
      } else if (button === '{shift}') {
        // Toggle shift (this will be handled by the layout change)
        return { action: 'shift', activeInput };
      } else if (button === '{tab}') {
        // Move to next input field
        const currentIndex = inputFields.indexOf(activeInput);
        if (currentIndex < inputFields.length - 1) {
          const nextField = inputFields[currentIndex + 1];
          return { action: 'tab', nextField, activeInput };
        } else {
          // If at last field, go to first
          const firstField = inputFields[0];
          return { action: 'tab', nextField: firstField, activeInput };
        }
      } else if (button === '{space}') {
        const currentValue = keyboardInput || '';
        const newValue = currentValue + ' ';
        setKeyboardInput(newValue);
        return { action: 'space', value: newValue, activeInput };
      }
    }
    return null;
  };

  const resetKeyboardInputs = () => {
    setKeyboardInput('');
    setActiveInput('');
    setShowKeyboard(false);
    setCapsLock(false);
  };

  const hideKeyboard = (onBeforeHide) => {
    // If there's a callback to handle saving the current input, call it first
    if (onBeforeHide && activeInput && keyboardInput !== undefined) {
      onBeforeHide(activeInput, keyboardInput);
    }
    setShowKeyboard(false);
  };

  return {
    // State
    showKeyboard,
    activeInput,
    keyboardInput,
    capsLock,
    
    // Actions
    handleInputFocus,
    handleInputBlur,
    handleAnyInputFocus,
    handleAnyInputClick,
    onKeyboardChange,
    onKeyboardChangeAll,
    onKeyboardKeyPress,
    resetKeyboardInputs,
    hideKeyboard,
    
    // Utility
    setActiveInput,
    setKeyboardInput
  };
};

export default useVirtualKeyboard;
