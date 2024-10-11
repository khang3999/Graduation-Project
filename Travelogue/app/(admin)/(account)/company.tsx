
import UnlockBtn from '@/components/buttons/UnlockBtn';
import { Background } from '@react-navigation/elements';
import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';

// Định nghĩa kiểu dữ liệu cho một tài khoản
interface Account {
  id: string;
  name: string;
  email: string;
  status: string;
  isBlocked:boolean;
}

// Giả lập danh sách tài khoản bị block
const initialAccounts: Account[] = [
  { id: '1', name: 'User 1', email: 'user1@example.com', status: 'Active', isBlocked:false},
  { id: '2', name: 'User 2', email: 'user2@example.com' , status: 'Register',isBlocked:false},
  { id: '3', name: 'User 3', email: 'user3@example.com' , status: 'Register',isBlocked:false},
  { id: '4', name: 'User 4', email: 'user4@example.com' , status: 'Active',isBlocked:false},
];

export default function AccountManagementScreen() {
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts);
  // Hàm gỡ block cho tài khoản
  const statusAccount = (accountId: string, status:string) => {
    if (status=='Register') {
      Alert.alert(
        "Active Account",
        "Are you sure you want to active this account?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "OK", onPress: () => {
            // setBlockedAccounts(prevAccounts =>
            //   prevAccounts.filter(account => account.id !== accountId)
            // );
            setAccounts(prevAccounts =>
              prevAccounts.map(account => {
                if (account.id === accountId && account.status == 'Register') {
                  account.status ='Active' ;
                }
                return account;
              })
            );
  
  
          }}
        ]
      );
    }
    
  };
  const [accountBlock, setBlockAccounts] = useState<Account[]>(initialAccounts);
  // Hàm gỡ block cho tài khoản
  const unlockAccount= (accountId:string,isBlocked: boolean) => {
    if(isBlocked){
      Alert.alert(
        "Unlock Account",
        "Are you sure you want to unlock this account?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "OK", onPress: () => {
            setBlockAccounts(prevAccounts =>
              prevAccounts.map(account => {
                if (account.id === accountId) {
                  account.isBlocked= !isBlocked ;
                }
                return account;
              })
              );
  
          }}
        ]
      );

    }
    else{
      Alert.alert(
        "Lock Account",
        "Are you sure you want to lock this account?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "OK", onPress: () => {
            setAccounts(prevAccounts =>
              prevAccounts.map(account => {
                if (account.id === accountId) {
                   account.isBlocked = !isBlocked
                }
                console.log();
                
                return account;
              })
              );
  
          }}
        ]
      );
    }
    console.log(accountId+" "+isBlocked);
    
  };
  // Render từng item trong danh sách
  const renderAccountItem = ({ item }: { item: Account }) => (
    <View style={styles.accountItem}>
      <View>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.email}>{item.email}</Text>
      </View>
      <TouchableOpacity
        style={ item.status == "Active" ? styles.activeButton  :styles.registerButton}
        
        onPress={() => statusAccount(item.id, item.status)}
      >
        <Text style={styles.buttonText}>{item.status == 'Register' ? 'Register' : 'Active'}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[item.isBlocked ? styles.unblockButton :styles.blockButton, item.status == "Active" ?{display:'flex'}:{ display: 'none' }]}
        onPress={() => unlockAccount(item.id,item.isBlocked)}
      >
        <Text style={styles.buttonText}>{item.isBlocked ? 'Unblock' : 'Lock'}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      
      {accounts.length > 0 ? (
        <FlatList
          data={accounts}
          keyExtractor={(item) => item.id}
          renderItem={renderAccountItem}
        />
      ) : (
        <Text style={styles.noAccountsText}>No accounts</Text>
      )}
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f2f2f2',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  accountItem: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 10,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
  },
  email: {
    fontSize: 14,
    color: '#555',
  },
  registerButton: {
    backgroundColor: '#ff5c5c',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  activeButton: {
    backgroundColor: '#5E8C31',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  noAccountsText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 20,
    color: '#777',
  },unblockButton: {
    backgroundColor: '#2986cc',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8
  },
  blockButton: {
    backgroundColor: '#ff5c5c',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
});
