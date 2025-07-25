import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { ref } from 'firebase/database';
import { database, onValue } from '@/firebase/firebaseConfig';
import { useHomeProvider } from '@/contexts/HomeProvider';
import PlusButton from '../buttons/PlusButton';
import BellButton from '../buttons/BellButton';
import { router } from 'expo-router';
import { rgbaArrayToRGBAColor } from 'react-native-reanimated/lib/typescript/reanimated2/Colors';
import { useAccount } from '@/contexts/AccountProvider';

const HeaderIndex = () => {
  const [countNotify, setCountNotify] = useState(0);
  const [role, setRole] = useState("user");
   const { dataAccount, userId }: any = useHomeProvider();
  // const { dataAccount }: any = useAccount();
  //Dem nhung thong bao chua xem
  console.log("User ID:", userId);
  useEffect(() => {
    if (userId) {
      // Lắng nghe dữ liệu từ Firebase Realtime Database theo thời gian thực
      const onValueChange = ref(database, `notifications/${userId}`);
      // Lắng nghe thay đổi trong dữ liệu
      const count = onValue(onValueChange, (snapshot) => {
        if (snapshot.exists()) {
          const jsonData = snapshot.val();
          // Chuyển đổi jsonData thành một mảng các đối tượng thông báo và lọc những thông báo chưa đọc
          const unreadNotifications = Object.values(jsonData).filter(
            (notification: any) => notification.read === false
          );
          setCountNotify(unreadNotifications.length);
        } else {
          setCountNotify(0)
          console.log("No data available");
        }
      }, (error) => {
        console.error("Error fetching data:", error);
      });
      // Cleanup function để hủy listener khi component unmount
      return () => count();
    }
  }, [userId]);
  useEffect(() => {
      if (userId) {
        const onValueChange = ref(database, `accounts/${userId}`);
        const reportListener = onValue(
          onValueChange,
          (snapshot) => {
            if (snapshot.exists()) {
              const jsonData = snapshot.val();
              setRole(jsonData.role);
            } else {
              console.log("No data available");
            }
          },
          (error) => {
            console.error("Error fetching data:", error);
          }
        );
  
        return () => reportListener();
      }
  
    }, [userId]);
  console.log("Role:", role);
  return (
    <View style={styles.header}>
      <Text style={styles.appName}>Travelogue</Text>
      <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', alignSelf: 'flex-end' }}>
        <View style={{marginRight: 6}}>
          <PlusButton onPress={() => {
            console.log("Role:", role);
            role === "user" ? router.push('/(article)/addPostUser') : router.push('/(article)/addPostTour')
          }} ></PlusButton>
        </View>

        {/* Chuong thong bao voi so luong thong bao chua xem */}
        <View style={styles.buttonRight}>
          {/* <View style={{}}> */}
          <BellButton
            style={styles.buttonRight}
            onPress={() => {
              router.push({
                pathname: '/notify'
              })
            }}></BellButton>
          {/* </View> */}
          {countNotify > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{countNotify}</Text>
            </View>
          )}
        </View>
      </View>

    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -5,
    right: -1,
    backgroundColor: 'red',
    borderRadius: 50,
    padding: 2,
    minWidth: 20,
    minHeight: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  buttonRight: {
    // marginHorizontal: 4,
  },
  appName: {
    fontSize: 40,
    fontFamily: 'DancingScript-Bold',
  },
  header: {
    // height: 70,
    flexDirection: 'row',
    marginTop: 15,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    zIndex: 2
  }
})

export default HeaderIndex