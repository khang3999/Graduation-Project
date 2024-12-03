import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { set, ref, database, onValue } from "@/firebase/firebaseConfig";
import { AntDesign, Feather } from '@expo/vector-icons';
import { remove, update } from '@firebase/database';
import { useAccount } from '@/contexts/AccountProvider';
import { router } from 'expo-router';
import { useAdminProvider } from '@/contexts/AdminProvider';

export default function AccountManagementScreen() {

  const [dataAccountReport, setDataAccountReport] = useState([]);
  const keyResolve = 2
  const [factorReport, setFactorReport] = useState(0);
  const { accountData, setAccountData }: any = useAccount()
  const { imagesReport, setImagesReport }: any = useAdminProvider()


  //Du lieu Account
  useEffect(() => {
    // Lắng nghe dữ liệu từ Firebase Realtime Database theo thời gian thực
    const onValueChange = ref(database, 'reports/account');
    // Lắng nghe thay đổi trong dữ liệu
    const account = onValue(onValueChange, (snapshot) => {
      if (snapshot.exists()) {
        const jsonData = snapshot.val();
        const jsonDataArr: any = Object.values(jsonData)
        // console.log(jsonDataArr);

        // Lọc các account có status != 2, da xu ly
        const filteredData = jsonDataArr.filter((account: any) => (account.status_id != keyResolve) && (Object.keys(account.reason).length >= factorReport));

        setDataAccountReport(filteredData);
      } else {
        console.log("No data available");
      }
    }, (error) => {
      setDataAccountReport([])
      console.error("Error fetching data:", error);
    });

    // Cleanup function để hủy listener khi component unmount
    return () => account();
  }, [factorReport]);
  //Du lieu factor 
  useEffect(() => {
    // Lắng nghe dữ liệu từ Firebase Realtime Database theo thời gian thực
    const onValueChange = ref(database, 'factors/report/account');
    // Lắng nghe thay đổi trong dữ liệu
    const factor = onValue(onValueChange, (snapshot) => {
      if (snapshot.exists()) {
        const jsonData = snapshot.val();
        // console.log(jsonData);

        setFactorReport(jsonData)
      } else {
        console.log("No data available");
      }
    }, (error) => {
      console.error("Error fetching data:", error);
    });

    // Cleanup function để hủy listener khi component unmount
    return () => factor();
  }, []);

  // Hàm gỡ report cho account
  const unreportAccount = (accountId: string) => {
    const refRemove = ref(database, `reports/account/${[accountId]}`)
    const refAccount = ref(database, `accounts/${[accountId]}`)
    Alert.alert(
      "Gỡ báo cáo",
      "Bạn chắc chắn muốn gỡ báo cáo cho tài khoản này?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "OK", onPress: () => {
            // Xoa khoi bang report
            remove(refRemove).then(() => {
              console.log('Data remove successfully');
            })
              .catch((error) => {
                console.error('Error removing data: ', error);
              }); // Xóa từ khỏi Realtime Database
            
          }
        }
      ]
    );
  };
 // Hàm gỡ report cho account
 const lockAccount = (accountId: string) => {
  const refReport = ref(database, `reports/account/${[accountId]}`)
  const refAccount = ref(database, `accounts/${[accountId]}`)
  Alert.alert(
    "Khóa tài khoản",
    "Bạn chắc chắc muốn khóa tài khoản bị vi phạm?",
    [
      { text: "Hủy", style: "cancel" },
      {
        text: "OK", onPress: () => {
          //Cap nhat status_id cho account sau khi lock
          update(refAccount, { status_id: 4 })
            .then(() => {
              console.log('Data updated successfully!');
            })
            .catch((error) => {
              console.error('Error updating data:', error);
            });
          //Cap nhat status_id cho report sau khi lock
          update(refReport, { status_id: 2 })
            .then(() => {
              console.log('Data updated successfully!');
            })
            .catch((error) => {
              console.error('Error updating data:', error);
            });
        }
      }
    ]
  );
};
  
  //Chuyen sang account detail
  const handleNavigateAccountDetail = (accountID:any) => {
    setImagesReport(Object.values(accountID.images).flat())
    router.push( '/imageReport')
  }
  // Render từng item trong danh sách
  const renderAccountItem = (account: any) => {
    return (
      <TouchableOpacity key={account.item.index} style={styles.accountItem}
      onPress={()=>handleNavigateAccountDetail(account.item)}
      >
        <View>
          <Text style={styles.name}>{account.item.account_id}</Text>
          {Object.values(account.item.reason).map((reason: any) => {
            return (
              <Text style={styles.reason}>- {reason}</Text>
            )
          })}

        </View>
        <View style={{ flexDirection: 'row', top:20, left:-50 }}>
          <AntDesign name="lock" size={26} color='#3366CC' style={{ bottom: 0 }} onPress={() => lockAccount(account.item.account_id)} />
          <Feather name="x-square" size={26} style={{ marginLeft: 25, color: 'red', bottom: -1 }} onPress={() => unreportAccount(account.item.account_id)} />
        </View>
      </TouchableOpacity>
    )
  };

  return (
    <View style={styles.container}>

      {dataAccountReport.length > 0 ? (
        <FlatList
          data={dataAccountReport}
          renderItem={renderAccountItem}
          keyExtractor={(item:any)=>item.account_id}
        />
      ) : (
        <Text style={styles.noAccountsText}>No blocked accounts</Text>
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
  reason: {
    padding: 5,
    fontSize: 14,
    color: '#555',
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
  },
  email: {
    fontSize: 14,
    color: '#555',
  },
  blockButton: {
    backgroundColor: '#ff5c5c',
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
  },
});
