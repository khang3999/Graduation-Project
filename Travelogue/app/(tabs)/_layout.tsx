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


const _layout = () => {
  const [role, setRole] = useState("user"); 

  useEffect(() => {
    const fetchRole = async () => {
      const userID = await AsyncStorage.getItem("userToken");
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
 
  return (
    <Tabs
      tabBar={(props: any) => <TabBar role={role} {...props} />}
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
            <PlusButton onPress={() => { 
               role === "user" ? router.push('../(article)/addPostUser') : router.push('../(article)/addPostTour') 
             }} style={styles.buttonRight}></PlusButton>
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
      <Tabs.Screen
        key={4}
        name="payment"
        options={{
          title: 'Payment',
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
  }
})
export default _layout