import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { set, ref, database, onValue } from "@/firebase/firebaseConfig";
import { AntDesign } from '@expo/vector-icons';
import { remove, update } from '@firebase/database';

export default function AccountManagementScreen() {

  const [dataAccountReport, setDataAccountReport] = useState([]);
  const keyResolve = 2
  const [factorReport, setFactorReport] = useState(0);
  //Du lieu Account
  useEffect(() => {
    // Lắng nghe dữ liệu từ Firebase Realtime Database theo thời gian thực
    const onValueChange = ref(database, 'reports/account');
    // Lắng nghe thay đổi trong dữ liệu
    const account = onValue(onValueChange, (snapshot) => {
      if (snapshot.exists()) {
        const jsonData = snapshot.val();
        const jsonDataArr: any = Object.values(jsonData)
        console.log(jsonDataArr);

        // Lọc các bài có status != 2, da xu ly
        const filteredData = jsonDataArr.filter((account: any) => (account.status != keyResolve) && (Object.keys(account.reason).length >= factorReport));

        setDataAccountReport(filteredData);
      } else {
        console.log("No data available");
      }
    }, (error) => {
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
        console.log(jsonData);

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

  // Hàm gỡ lock cho account
  const unlockPost = (accountId: string) => {
    const refRemove = ref(database, `reports/account/${[accountId]}`)
    const refPost = ref(database, `accounts/${[accountId]}`)
    Alert.alert(
      "Unlock post",
      "Are you sure you want to unlock this post?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "OK", onPress: () => {
            // Xoa khoi bang report
            remove(refRemove).then(() => {
              console.log('Data remove successfully');
            })
              .catch((error) => {
                console.error('Error removing data: ', error);
              }); // Xóa từ khỏi Realtime Database
            //Cap nhat report cho post sau khi unlock
            update(refPost, { reports: 0 })
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

  // Render từng item trong danh sách
  const renderAccountItem = (account: any) => {
    return (
      <View key={account.item.id} style={styles.accountItem}>
        <View>
          <Text style={styles.name}>{account.item.id}</Text>
          {Object.values(account.item.reason).map((reason: any) => {
            return (
              <Text style={styles.reason}>- {reason}</Text>
            )
          })}

        </View>
        <View >
          <AntDesign name="unlock" size={30} color='#3366CC' style={{ bottom: 0           }} onPress={() => unlockPost(account.item.id)} />

        </View>

      </View>
    )
  };

  return (
    <View style={styles.container}>

      {dataAccountReport.length > 0 ? (
        <FlatList
          data={dataAccountReport}
          renderItem={renderAccountItem}
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
