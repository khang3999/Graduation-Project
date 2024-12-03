import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, Switch } from 'react-native';
import { set, ref, database, onValue } from "@/firebase/firebaseConfig";
import { AntDesign, Feather, MaterialIcons } from '@expo/vector-icons';
import { remove, update } from '@firebase/database';
import CutText from '@/components/CutText';
import { router } from 'expo-router';

export default function CompanyManagementScreen() {

  const [datCompany, setDatCompany] = useState([]);
  const [dataStatus, setDataStatus] = useState([]);
  const keyResolve = 2
  const color = ['', 'green', 'blue', 'brown', 'orange', 'red']
  const [factorReport, setFactorReport] = useState(0);
  //Doc du lieu Status
  useEffect(() => {
    // Lắng nghe dữ liệu từ Firebase Realtime Database theo thời gian thực
    const onValueChange = ref(database, 'status/account');
    // Lắng nghe thay đổi trong dữ liệu
    const status = onValue(onValueChange, (snapshot) => {
      if (snapshot.exists()) {
        const jsonData = snapshot.val();
        console.log(jsonData);

        setDataStatus(jsonData)
      } else {
        console.log("No data available");
      }
    }, (error) => {
      console.error("Error fetching data:", error);
    });
  }, [])

  //Du lieu Account
  useEffect(() => {
    // Lắng nghe dữ liệu từ Firebase Realtime Database theo thời gian thực
    const onValueChange = ref(database, 'accounts');
    // Lắng nghe thay đổi trong dữ liệu
    const account = onValue(onValueChange, (snapshot) => {
      if (snapshot.exists()) {
        const jsonData = snapshot.val();
        const jsonDataArr: any = Object.values(jsonData)
        console.log(jsonDataArr);
        // Lọc các bài có status != 2, da xu ly
        const filteredData = jsonDataArr.filter((account: any) => (account.business_license_id != null));
        // Sắp xếp dữ liệu theo status_id
        const sortedData = filteredData.sort((a: any, b: any) => a.status_id - b.status_id);
        setDatCompany(sortedData);
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

  // Hàm lock cho account,  user  status la (1) ve 2
  const acceptAcc = (accountId: string) => {
    const refAcc = ref(database, `accounts/${[accountId]}`)
    Alert.alert(
      "Accept account",
      "Are you sure you want to accept this account?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "OK", onPress: () => {
            //Cap nhat report cho post sau khi unlock
            update(refAcc, { status_id: 2 })
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
  // Hàm lock cho account,  user  status la (1) ve 5
  const rejectAcc = (accountId: string) => {
    const refAcc = ref(database, `accounts/${[accountId]}`)
    Alert.alert(
      "Reject account",
      "Are you sure you want to reject this account?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "OK", onPress: () => {
            //Cap nhat report cho post sau khi unlock
            update(refAcc, { status_id: 5 })
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
  // Hàm gỡ report cho account, khi user co status la 3 ve lai 2
  const unReportAcc = (accountId: string) => {
    const refRemove = ref(database, `reports/account/${[accountId]}`)
    const refAcc = ref(database, `accounts/${[accountId]}`)
    Alert.alert(
      "Clear report for this account",
      "Are you sure you want to clear report this account?",
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
            update(refAcc, { status_id: 2 })
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
  // Hàm gỡ lock cho account, khi user co status la 4 ve lai 2
  const unLockAcc = (accountId: string) => {
    const refAcc = ref(database, `accounts/${[accountId]}`)
    Alert.alert(
      "Clear report for this account",
      "Are you sure you want to clear report this account?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "OK", onPress: () => {
            //Cap nhat report cho post sau khi unlock
            update(refAcc, { status_id: 2 })
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

  // Hàm lock cho account,  user  status la (2,3) ve 4
  const lockAcc = (accountId: string) => {
    const refAcc = ref(database, `accounts/${[accountId]}`)
    Alert.alert(
      "Lock account",
      "Are you sure you want to lock this account?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "OK", onPress: () => {
            //Cap nhat report cho post sau khi unlock
            update(refAcc, { status_id: 4 })
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




  //Render icon
  const renderIcon = (item: any) => {
    switch (item.status_id) {
      case 1:
        return (
          <View style={{ flexDirection: 'row' }}>
            <Feather name="check-square" size={24} color="green" style={{ left: -25 }} onPress={() => acceptAcc(item.id)} />
            <Feather name="x-square" size={25} color="red" onPress={() => rejectAcc(item.id)} />
          </View>);
      case 2:
        return (
          <View>
            <AntDesign name="lock" size={28} color="black" onPress={() => lockAcc(item.id)} />
          </View>);
      case 3:
        return (
          <View style={{ flexDirection: 'row' }}>
            <MaterialIcons name="clear" size={28} color="#3366CC" style={{ bottom: 0, left: -22 }} onPress={() => unReportAcc(item.id)} />
            <AntDesign name="lock" size={28} color="black" onPress={() => lockAcc(item.id)} />
          </View>);
      case 4:
        return (
          <View>
            <AntDesign name="unlock" size={26} color='#3366CC' style={{ bottom: 0 }} onPress={() => unLockAcc(item.id)} />
          </View>);
      default:
        return null;
    }
  }
  //Chuyen sang post detail
  const handleNavigateCompanyInformation = (accountId: any) => {
    router.push({
      pathname: '/companyDetail',
      params: { userId: accountId }
    })

  }
  // Render từng item trong danh sách
  const renderAccountItem = (account: any) => {
    console.log('stu', dataStatus[account.item.status_id]);

    return (
      <TouchableOpacity key={account.item.id} style={styles.accountItem}
        onPress={
          () => handleNavigateCompanyInformation(account.item.id)
        }>
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

      {datCompany.length > 0 ? (
        <FlatList
          data={datCompany}
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
    padding: 10,
    fontSize: 14,
    color: '#555',
  },
  name: {
    fontSize: 20,
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
