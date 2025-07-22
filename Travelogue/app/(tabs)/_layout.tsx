import { View, Text, Button, Image, StyleSheet, Pressable, Alert, Linking, Platform } from 'react-native'
import React, { useEffect, useState } from 'react'
import { router, Tabs, useLocalSearchParams } from 'expo-router'
import TabBar from '@/components/navigation/TabBar'
import PlusButton from '@/components/buttons/PlusButton'
import BellButton from '@/components/buttons/BellButton'
import { useHomeProvider } from '@/contexts/HomeProvider'
import { off, ref } from 'firebase/database'
import { database, get, onValue } from '@/firebase/firebaseConfig'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { useAccount } from '@/contexts/AccountProvider'


const _layout = () => {
  const [role, setRole] = useState("user");
  // const [userID, setUserId] = useState("");
  const [countNotify, setCountNotify] = useState(0);
  const { userId }: any = useHomeProvider();
  const { dataAccount }: any = useAccount()
  useEffect(() => {
    if (userId) {
      const userRef = ref(database, `accounts/${userId}`);
      // Lắng nghe thay đổi trạng thái tài khoản
      onValue(userRef, async (snapshot) => {
        const data = snapshot.val();
        if (data && data.status_id === 2) {
          setRole(data.role);
        } else {
          // Xử lý nếu tài khoản bị khóa
          Alert.alert(
            "Tài khoản đã bị cấm",
            "Vui lòng liên hệ quản trị viên để biết thêm thông tin.",
            [
              {
                text: "Gọi Tổng Đài",
                onPress: () => Linking.openURL("tel:0384946973"),
              },
              {
                text: "Gửi email",
                onPress: () => Linking.openURL("mailto:"),
              },
              { text: "Đóng", style: "cancel" },
            ],
            { cancelable: true }
          );
          await AsyncStorage.removeItem("userToken");
          router.replace("/(auth)/LoginScreen");
        }
      }
      );
    }
  }, [userId]);
  //Dem nhung thong bao chua xem
  // useEffect(() => {
  //   // Lắng nghe dữ liệu từ Firebase Realtime Database theo thời gian thực
  //   const onValueChange = ref(database, `notifications/${userID}`);
  //   // Lắng nghe thay đổi trong dữ liệu
  //   const count = onValue(onValueChange, (snapshot) => {
  //     if (snapshot.exists()) {
  //       const jsonData = snapshot.val();
  //       // Chuyển đổi jsonData thành một mảng các đối tượng thông báo và lọc những thông báo chưa đọc
  //       const unreadNotifications = Object.values(jsonData).filter(
  //         (notification: any) => notification.read === false
  //       );
  //       setCountNotify(unreadNotifications.length);
  //     } else {
  //       setCountNotify(0)
  //       console.log("No data available");
  //     }
  //   }, (error) => {
  //     console.error("Error fetching data:", error);
  //   });

  //   // Cleanup function để hủy listener khi component unmount
  //   return () => count();
  // }, [userID]);
  // console.log(countNotify);


  return (
    <Tabs
      tabBar={(props: any) => <TabBar role={role} {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        key={1}
        name="index"
        options={{
          title: 'Home',
        }} />
      <Tabs.Screen
        key={2}
        name="tour"
        options={{
          title: 'Tour',
        }} />
      <Tabs.Screen
        key={3}
        name="(maps)"
        options={{
          title: 'Map',
          headerShown: false
        }} />
      <Tabs.Screen
        key={4}
        name="payment"
        options={{
          title: 'Payment',
          headerShown: false,
        }} />
      <Tabs.Screen
        key={5}
        name="(profiles)"
        options={{
          title: `Xin chào, ${dataAccount?.fullname}`,
          headerShown: true,
        }} />
    </Tabs >

  )
}
export default _layout