import { View, Text, Button, Image, StyleSheet, Pressable } from 'react-native'
import React, { useEffect, useState } from 'react'
import { router, Tabs, useLocalSearchParams } from 'expo-router'
import TabBar from '@/components/navigation/TabBar'
import PlusButton from '@/components/buttons/PlusButton'
import BellButton from '@/components/buttons/BellButton'
import { useHomeProvider } from '@/contexts/HomeProvider'
import { ref } from 'firebase/database'
import { database, get, onValue } from '@/firebase/firebaseConfig'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { TouchableOpacity } from 'react-native-gesture-handler'


const _layout = () => {
  const [role, setRole] = useState("user");
  const [userID, setUserId] = useState("");
  const [countNotify, setCountNotify] = useState(0);

  useEffect(() => {
    const fetchRole = async () => {
      const userID = await AsyncStorage.getItem("userToken");
      setUserId(userID + "")
      if (userID) {
        const userRef = ref(database, "accounts/" + userID);
        const snapshot = await get(userRef);
        const data = snapshot.val();
        if (data && data.role) {
          setRole(data.role);
        }
      }
    };
    fetchRole();
  }, []);
  //Dem nhung thong bao chua xem
  useEffect(() => {
    // Lắng nghe dữ liệu từ Firebase Realtime Database theo thời gian thực
    const onValueChange = ref(database, `notifications/${userID}`);
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
  }, [userID]);
  console.log(countNotify);


  return (
    <Tabs
      tabBar={(props: any) => <TabBar role={role} {...props} />}
      screenOptions={{
        headerStyle: {
          height: 105,
        },
        // headerTitle: (props) =>
        //   // Bỏ image vào đây

        //   <Image
        //     source={require('@/assets/images/logo.png')}
        //     resizeMode="contain"
        //   />

        // ,
        headerRight: () => (
          <View style={styles.headerRight}>
            <PlusButton onPress={() => {
              role === "user" ? router.push('../(article)/addPostUser') : router.push('../(article)/addPostTour')
            }} style={styles.buttonRight}></PlusButton>
            {/* Chuong thong bao voi so luong thong bao chua xem */}
            <TouchableOpacity style={[ styles.container]} >
              <View style={{}}>
                <BellButton style={styles.buttonRight} onPress={() => {
                  router.push({
                    pathname: '/notify'
                  })
                }}></BellButton>
              </View>
              {countNotify > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{countNotify}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        ),
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
          headerShown: false,
        }} />
      <Tabs.Screen
        key={4}
        name="payment"
        options={{
          title: 'Payment',
          // headerShown: false,
        }} />
      <Tabs.Screen
        key={5}
        name="(profiles)"
        options={{
          title: 'Profile',
          headerShown: false,
        }} />
    </Tabs >

  )
}
const styles = StyleSheet.create({
  headerRight: {
    display: 'flex',
    flexDirection: 'row',
    paddingEnd: 10,
    justifyContent: 'space-around'
  },
  buttonRight: {
    alignItems: 'center',
    marginHorizontal: 10
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: 'red',
    borderRadius: 10,
    paddingHorizontal: 5,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  container: {
    position: 'relative',
  },
})
export default _layout