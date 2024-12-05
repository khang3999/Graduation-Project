import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { set, ref, database, onValue } from "@/firebase/firebaseConfig";
import { AntDesign, Feather } from '@expo/vector-icons';
import { remove, update } from '@firebase/database';
import { useAccount } from '@/contexts/AccountProvider';
import { router } from 'expo-router';
import { useAdminProvider } from '@/contexts/AdminProvider';
import CutText from '@/components/CutText';

export default function AccountManagementScreen() {

  const keyResolve = 2
  const [dataAccount, setDataAccount] = useState([]);
  const {
    dataStatus, setDataStatus,
    imagesReport, setImagesReport,
    factorReport, setFactorReport,
    renderIcon
  }: any = useAdminProvider();
  const color = ['', 'green', 'blue', 'brown', 'orange', 'red']

  //Du lieu Account
  useEffect(() => {
    // Lắng nghe dữ liệu từ Firebase Realtime Database theo thời gian thực
    const onValueChange = ref(database, 'accounts');
    // Lắng nghe thay đổi trong dữ liệu
    const account = onValue(onValueChange, (snapshot) => {
      if (snapshot.exists()) {
        const jsonData = snapshot.val();
        console.log(jsonData);
        const jsonDataArr: any = Object.values(jsonData)
        // console.log(jsonDataArr);
        // Lọc các bài có status != 2, da xu ly
        const filteredData = jsonDataArr.filter((account: any) => (account.role === "user"));
        // Sắp xếp dữ liệu theo status_id
        const sortedData = filteredData.sort((a: any, b: any) => a.status_id - b.status_id);

        setDataAccount(sortedData);
      } else {
        console.log("No data available");
      }
    }, (error) => {
      console.error("Error fetching data:", error);
    });

    // Cleanup function để hủy listener khi component unmount
    return () => account();
  }, [factorReport]);

  // // Hàm gỡ report cho account
  // const unreportAccount = (accountId: string) => {
  //   const refRemove = ref(database, `reports/account/${[accountId]}`)
  //   const refAccount = ref(database, `accounts/${[accountId]}`)
  //   Alert.alert(
  //     "Gỡ báo cáo tài khoản",
  //     "Bạn muốn gỡ báo cáo cho tài khoản này?",
  //     [
  //       { text: "Cancel", style: "cancel" },
  //       {
  //         text: "OK", onPress: () => {
  //           // Xoa khoi bang report
  //           remove(refRemove).then(() => {
  //             console.log('Data remove successfully');
  //           })
  //             .catch((error) => {
  //               console.error('Error removing data: ', error);
  //             }); // Xóa từ khỏi Realtime Database

  //         }
  //       }
  //     ]
  //   );
  // };
  // // Hàm report cho account
  // const lockAccount = (accountId: string) => {
  //   const refReport = ref(database, `reports/account/${[accountId]}`)
  //   const refAccount = ref(database, `accounts/${[accountId]}`)
  //   Alert.alert(
  //     "Khóa tài khoản",
  //     "Bạn chắc chắn muốn khóa tài khoản này?",
  //     [
  //       { text: "Cancel", style: "cancel" },
  //       {
  //         text: "OK", onPress: () => {
  //           //Cap nhat status_id cho account sau khi lock
  //           update(refAccount, { status_id: 4 })
  //             .then(() => {
  //               console.log('Data updated successfully!');
  //             })
  //             .catch((error) => {
  //               console.error('Error updating data:', error);
  //             });
  //           //Cap nhat status_id cho report sau khi lock
  //           update(refReport, { status_id: 2 })
  //             .then(() => {
  //               console.log('Data updated successfully!');
  //             })
  //             .catch((error) => {
  //               console.error('Error updating data:', error);
  //             });
  //         }
  //       }
  //     ]
  //   );
  // };

  //Chuyen sang account detail
  const handleNavigateIndividualUserInformation = (accountId: any) => {
    router.push({
      pathname: '/userDetail',
      params: { userId: accountId }
    })
  }
  // Render từng item trong danh sách
  const renderAccountItem = (account: any) => {
    return (
      <TouchableOpacity key={account.item.id} style={styles.accountItem}
        onPress={
          () => handleNavigateIndividualUserInformation(account.item.id)
        }
        >
        <View >
          <Text style={styles.name}>{CutText(account.item.fullname)}</Text>
          <Text style={[styles.reason, { color: color[account.item.status_id] }]}>{dataStatus[account.item.status_id]}</Text>
        </View>

        {(renderIcon(account.item))}

      </TouchableOpacity>
    )
  };

  return (
    <View style={styles.container}>

      {dataAccount.length > 0 ? (
        <FlatList
          data={dataAccount}
          renderItem={renderAccountItem}
          keyExtractor={(item: any) => item.account_id}
        />
      ) : (
        <Text style={styles.noAccountsText}>Không có dữ liệu</Text>
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
