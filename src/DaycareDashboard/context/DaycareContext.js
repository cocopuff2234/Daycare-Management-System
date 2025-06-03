import React, { createContext, useContext } from 'react';

// Create the context
const DaycareContext = createContext(null);

// Provider component
export const DaycareProvider = ({ children, value }) => {
  return (
    <DaycareContext.Provider value={value}>
      {children}
    </DaycareContext.Provider>
  );
};

// Custom hook to use the context
export const useDaycare = () => {
  const context = useContext(DaycareContext);
  if (context === null) {
    throw new Error('useDaycare must be used within a DaycareProvider');
  }
  return context;
};
