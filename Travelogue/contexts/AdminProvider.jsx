import { View, Text, Alert } from 'react-native'
import React, { createContext, useContext, useEffect, useState } from 'react'
import { ref } from 'firebase/database'
import { database, onValue, update } from '@/firebase/firebaseConfig'
import { AntDesign, Feather, MaterialIcons } from '@expo/vector-icons'

const AdminContext = createContext(undefined)
const AdminProvider = ({ children }) => {
  const [postArr, setPostArr] = useState([])
  const [imagesReport, setImagesReport] = useState([])
  const [dataStatus, setDataStatus] = useState([]);
  const [factorReport, setFactorReport] = useState(0);

  //Doc du lieu Status
  useEffect(() => {
    // Lắng nghe dữ liệu từ Firebase Realtime Database theo thời gian thực
    const onValueChange = ref(database, 'status/account');
    // Lắng nghe thay đổi trong dữ liệu
    const status = onValue(onValueChange, (snapshot) => {
      if (snapshot.exists()) {
        const jsonData = snapshot.val();
        // console.log(jsonData);

        setDataStatus(jsonData)
      } else {
        console.log("No data available");
      }
    }, (error) => {
      console.error("Error fetching data:", error);
    });
    return () => {
      status(); // Sử dụng return để hủy listener
    };
  }, [])

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

  // Hàm lock cho account,  user  status la (1) ve 2
  const acceptAcc = (accountId) => {
    const refAcc = ref(database, `accounts/${[accountId]}`)
    Alert.alert(
      "Duyệt tài khoản",
      "Bạn chắc chắn muốn duyệt tài khoản này?",
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
  const rejectAcc = (accountId) => {
    const refAcc = ref(database, `accounts/${[accountId]}`)
    Alert.alert(
      "Từ chối đăng ký tài khoản",
      "Bạn chắc chắn muốn từ chối đăng ký cho tài khoản này?",
      [
        { text: "Hủy", style: "cancel" },
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
  const unReportAcc = (accountId) => {
    const refRemove = ref(database, `reports/account/${[accountId]}`)
    const refAcc = ref(database, `accounts/${[accountId]}`)
    Alert.alert(
      "Gỡ báo cáo tài khoản",
      "Bạn muốn gỡ báo cáo cho tài khoản này?",
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
  const unLockAcc = (accountId) => {
    const refAcc = ref(database, `accounts/${[accountId]}`)
    Alert.alert(
      "Mở khóa tài khoản",
      "Bạn muốn mở khóa cho tài khoản này?",
      [
        { text: "Hủy", style: "cancel" },
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
  const lockAcc = (accountId) => {
    const refAcc = ref(database, `accounts/${[accountId]}`)
    Alert.alert(
      "Khóa tài khoản",
      "Bạn chắc chắn muốn khóa tài khoản này?",
      [
        { text: "Hủy", style: "cancel" },
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

  const renderIcon = (item) => {
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

  return (
    <AdminContext.Provider
      value={{
        postArr, setPostArr,
        imagesReport, setImagesReport,
        dataStatus, setDataStatus,
        factorReport, setFactorReport,
        acceptAcc,
        rejectAcc,
        lockAcc,
        unLockAcc,
        unReportAcc,
        renderIcon
      }}>
      {children}
    </AdminContext.Provider>
  )
}
export const useAdminProvider = () => useContext(AdminContext);
export default AdminProvider