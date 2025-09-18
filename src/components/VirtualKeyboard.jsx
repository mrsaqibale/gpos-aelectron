import React, { useState, useEffect } from 'react';
import Keyboard from 'react-simple-keyboard';
import 'react-simple-keyboard/build/css/index.css';
import { X } from 'lucide-react';
import { useKeyboardSetting } from '../hooks/useKeyboardSetting';

const VirtualKeyboard = ({ 
  isVisible, 
  onClose, 
  activeInput, 
  onInputChange, 
  onInputBlur,
  inputValue = '',
  placeholder = 'Type here...',
  onKeyPress
}) => {
  const [keyboardInput, setKeyboardInput] = useState('');
  const [capsLock, setCapsLock] = useState(false);
  const { shouldShowVirtualKeyboard } = useKeyboardSetting();

  // Reset keyboard input when activeInput changes
  useEffect(() => {
    if (activeInput && inputValue !== undefined) {
      setKeyboardInput(inputValue);
    }
  }, [activeInput, inputValue]);

  // Handle caps lock changes
  useEffect(() => {
    if (capsLock) {
      // The keyboard will automatically use shift layout when capsLock is true
    } else {
      // The keyboard will automatically use default layout when capsLock is false
    }
  }, [capsLock]);

  const handleInputFocus = (inputName) => {
    if (inputName === activeInput) {
      setKeyboardInput(inputValue || '');
    }
  };

  const handleInputBlur = (e) => {
    // Don't hide keyboard immediately to allow for keyboard input
    // Update the form state when input loses focus
    if (onInputBlur) {
      onInputBlur(e);
    }
    // Don't hide keyboard here, let the parent component decide
  };

  const handleAnyInputFocus = (e, inputName) => {
    if (inputName === activeInput) {
      setKeyboardInput(inputValue || '');
    }
  };

  const handleAnyInputClick = (e, inputName) => {
    if (inputName === activeInput) {
      handleAnyInputFocus(e, inputName);
    }
  };

  const onKeyboardChange = (input) => {
    setKeyboardInput(input);
    
    // Update the corresponding form field through callback
    if (onInputChange) {
      onInputChange(input, activeInput);
    }
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
        if (onInputChange) {
          onInputChange(newValue, activeInput);
        }
      } else if (button === '{enter}') {
        // Move to next input field or submit form
        if (onKeyPress) {
          onKeyPress({ action: 'enter', nextField: activeInput });
        } else if (onInputChange) {
          onInputChange(keyboardInput, activeInput, 'enter');
        }
      } else if (button === '{lock}') {
        // Toggle caps lock
        setCapsLock(!capsLock);
      } else if (button === '{shift}') {
        // Toggle shift (this will be handled by the layout change)
        // The layout will automatically switch between default and shift
      } else if (button === '{tab}') {
        // Move to next input field
        if (onKeyPress) {
          onKeyPress({ action: 'tab', nextField: activeInput });
        } else if (onInputChange) {
          onInputChange(keyboardInput, activeInput, 'tab');
        }
      } else if (button === '{space}') {
        const currentValue = keyboardInput || '';
        const newValue = currentValue + ' ';
        setKeyboardInput(newValue);
        if (onInputChange) {
          onInputChange(newValue, activeInput);
        }
      }
    }
  };

  const resetKeyboardInputs = () => {
    setKeyboardInput('');
    setCapsLock(false);
  };

  const handleClose = () => {
    // Save the current input before clearing it
    if (onInputChange && activeInput && keyboardInput !== undefined) {
      onInputChange(keyboardInput, activeInput);
    }
    resetKeyboardInputs();
    if (onClose) {
      onClose();
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-[15%] right-[15%] z-50 bg-white border-t border-gray-200 shadow-lg">
      <div className="p-4 bg-gray-50">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Virtual Keyboard</span>
            {capsLock && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                CAPS LOCK
              </span>
            )}
            {activeInput && (
              <span className="px-2 py-1 bg-primaryExtraLight text-primary font-medium rounded-full text-xs">
                {activeInput}
              </span>
            )}
          </div>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div 
          className="keyboard-container w-full" 
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.preventDefault()}
        >
          <Keyboard
            key={activeInput} // Force re-render when activeInput changes
            keyboardRef={(r) => (window.keyboard = r)}
            input={keyboardInput}
            onChange={onKeyboardChange}
            onChangeAll={onKeyboardChangeAll}
            onKeyPress={onKeyboardKeyPress}
            theme="hg-theme-default"
            layoutName={capsLock ? "shift" : "default"}
            layout={{
              default: [
                "` 1 2 3 4 5 6 7 8 9 0 - = {bksp}",
                "{tab} q w e r t y u i o p [ ] \\",
                "{lock} a s d f g h j k l ; ' {enter}",
                "z x c v b n m , . /",
                "{space}"
              ],
              shift: [
                "~ ! @ # $ % ^ & * ( ) _ + {bksp}",
                "{tab} Q W E R T Y U I O P { } |",
                "{lock} A S D F G H J K L : \" {enter}",
                "Z X C V B N M < > ?",
                "{space}"
              ]
            }}
            physicalKeyboardHighlight={true}
            physicalKeyboardHighlightTextColor={"#000000"}
            physicalKeyboardHighlightBgColor={"#fff475"}
          />
        </div>
      </div>
    </div>
  );
};

export default VirtualKeyboard;
