import { database, onValue } from '@/firebase/firebaseConfig';
import { ref } from 'firebase/database';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useHomeProvider } from './HomeProvider';
import { Text } from 'react-native';

// Define the shape of the context data
// interface AccountContextType {
//   accountData: any; 
//   setAccountData: (account: any) => void;
//   searchedAccountData: any;
//   setSearchedAccountData: (account: any) => void;
// }

// Create the context
const AccountContext = createContext(undefined);

// Provider component
export const AccountProvider = ({ children }) => {
  const [dataAccount, setDataAccount] = useState(null);
  const [searchedAccountData, setSearchedAccountData] = useState(null);
  const { userId } = useHomeProvider()
  // POST
  const [likedPostsList, setLikedPostsList] = useState({});
  const [savedPostsList, setSavedPostsList] = useState({});
  // TOUR
  const [likedToursList, setLikedToursList] = useState({});
  const [savedToursList, setSavedToursList] = useState({});

  // Lấy data account
  useEffect(() => {
    if (userId) {
      const refAccount = ref(database, `accounts/${userId}`)
      const unsubscribe = onValue(refAccount, (snapshot) => {
        console.log('check data account');
        if (snapshot.exists()) {
          const jsonDataAccount = snapshot.val();

          // console.log(jsonDataAccount.likedPostsList);
          // console.log('khkhkhkhkh');
          
          // POST
          // console.log(jsonDataAccount.likedPostsList);
          setLikedPostsList({ ...(jsonDataAccount.likedPostsList || {}) });
          
          setSavedPostsList(jsonDataAccount.savedPostsList || {});
          // TOUR
          setLikedToursList(jsonDataAccount.likedToursList || {});
          setSavedToursList(jsonDataAccount.savedToursList || {});
          // Data account
          setDataAccount(jsonDataAccount) // use at postDetail.jsx
        } else {
          console.log("No data available1");
        }
      }, (error) => {
        console.log("check 999:");
        console.error("Error fetching data:", error);
      });

      return () => {
        unsubscribe(); // Sử dụng unsubscribe để hủy listener
      };
    }
  }, [userId,])

  // if (!dataAccount) {
  //     return (<Text>Loading...</Text>)
  // }
  return (
    <AccountContext.Provider value={{
      dataAccount, setDataAccount,
      searchedAccountData, setSearchedAccountData,
      likedPostsList, setLikedPostsList,
      savedPostsList, setSavedPostsList,
      likedToursList, setLikedToursList,
      savedToursList, setSavedToursList,
    }}>
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
