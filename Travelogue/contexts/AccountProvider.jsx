import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the shape of the context data


// Create the context
const AccountContext = createContext(undefined);

// Provider component
export const AccountProvider = ({ children }) => {
  const [accountData, setAccountData] = useState(null);
  return (
    <AccountContext.Provider value={{ accountData, setAccountData }}>
      {children}
    </AccountContext.Provider>
  );
};

// Custom hook to use the account context
export const useAccount = () => {
  const context = useContext(AccountContext);
  if (!context) {
    throw new Error('useAccount must be used within a AccountProvider');
  }
  return context;
};
