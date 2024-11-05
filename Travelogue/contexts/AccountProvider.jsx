import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the shape of the context data
interface AccountContextType {
  accountData: any; 
  setAccountData: (account: any) => void;
  searchedAccountData: any;
  setSearchedAccountData: (account: any) => void;
}

// Create the context
const AccountContext = createContext(undefined);

// Provider component
export const AccountProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [accountData, setAccountData] = useState<any>(null);
  const [searchedAccountData, setSearchedAccountData] = useState<any>(null);
  return (
    <AccountContext.Provider value={{ accountData, setAccountData,searchedAccountData,setSearchedAccountData }}>
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
