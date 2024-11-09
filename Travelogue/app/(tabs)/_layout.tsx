import { View, Text, Button, Image, StyleSheet } from 'react-native'
import React, { useEffect, useState } from 'react'
import { router, Tabs } from 'expo-router'
import TabBar from '@/components/navigation/TabBar'
import PlusButton from '@/components/buttons/PlusButton'
import BellButton from '@/components/buttons/BellButton'
import { useHomeProvider } from '@/contexts/HomeProvider'
import { ref } from 'firebase/database'
import { database, onValue } from '@/firebase/firebaseConfig'
import AsyncStorage from '@react-native-async-storage/async-storage'


const _layout = () => {
  const [dataAccount, setDataAccount] = useState(null)
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    if (dataAccount) {
      console.log("account", dataAccount);
    }
  }, [dataAccount])

  // Lấy userId 
  useEffect(() => {
    const fetchUserId = async () => {
      const userId:any = await AsyncStorage.getItem("userToken");
      setUserId(userId);
    };
    fetchUserId()
  }, []);

  // Lấy data account
  useEffect(() => {
    if (userId) {
      const refAccount = ref(database, `accounts/${userId}`)
      const unsubscribe = onValue(refAccount, (snapshot) => {
        if (snapshot.exists()) {
          // Lấy tất cả factor của post dùng cho tính điểm
          const jsonDataAccount = snapshot.val();
          // Set du lieu
          console.log('dataAc', jsonDataAccount);
          
          setDataAccount(jsonDataAccount)
        } else {
          console.log("No data available1");
        }
      }, (error) => {
        console.error("Error fetching data:", error);
      });

      return () => {
        unsubscribe(); // Sử dụng unsubscribe để hủy listener
      };
    }
  }, [userId])
  return (
    <>
      <Tabs
        tabBar={(props: any) => <TabBar {...props} />}
        screenOptions={{
          headerStyle: {
            height: 105,
          },
          headerTitle: (props) =>
            // Bỏ image vào đây
            <Image
              source={require('@/assets/images/logo.png')}
              resizeMode="contain"
            />
          ,
          headerRight: () => (
            <View style={styles.headerRight}>
              <PlusButton onPress={() => { router.push('../(article)/addPostUser') }} style={styles.buttonRight}></PlusButton>
              <BellButton style={styles.buttonRight}></BellButton>
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
        {/* <Tabs.Screen
          key={3}
          name="payment"
          options={{
            title: 'Payment',
            headerShown: false,
          }} /> */}
        <Tabs.Screen
          key={4}
          name="(profiles)"
          options={{
            title: 'Profile',
            headerShown: false,
          }} />
      </Tabs >
    </>

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
  }
})
export default _layout