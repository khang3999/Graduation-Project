import { View, Text, Button, Image, StyleSheet } from 'react-native'
import React, { useEffect, useState } from 'react'
import { router, Tabs, useLocalSearchParams } from 'expo-router'
import TabBar from '@/components/navigation/TabBar'
import PlusButton from '@/components/buttons/PlusButton'
import BellButton from '@/components/buttons/BellButton'
import { useHomeProvider } from '@/contexts/HomeProvider'
import { ref } from 'firebase/database'
import { database, onValue } from '@/firebase/firebaseConfig'
import AsyncStorage from '@react-native-async-storage/async-storage'


const _layout = () => {
  const { userRole }: any = useLocalSearchParams();
  const role = userRole ? userRole : null;
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