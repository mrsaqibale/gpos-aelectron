import React, { createContext, useContext, useState } from 'react';

const DraftContext = createContext();

export const useDraftCount = () => {
  const context = useContext(DraftContext);
  if (!context) {
    throw new Error('useDraftCount must be used within a DraftProvider');
  }
  return context;
};

export const DraftProvider = ({ children }) => {
  const [draftCount, setDraftCount] = useState(0);

  const updateDraftCount = (count) => {
    setDraftCount(count);
  };

  return (
    <DraftContext.Provider value={{ draftCount, updateDraftCount }}>
      {children}
    </DraftContext.Provider>
  );
};
