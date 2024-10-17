import { View, Text, Button, Image, StyleSheet } from 'react-native'
import React, { useState } from 'react'
import { Tabs } from 'expo-router'
import TabBar from '@/components/navigation/TabBar'
import PlusButton from '@/components/buttons/PlusButton'
import BellButton from '@/components/buttons/BellButton'


const _layout = () => {
  const [count, setCount] = useState(0)
  return (
    <>
      <Tabs
        tabBar={(props: any) => <TabBar {...props} />}
      >
        <Tabs.Screen
          key={1}
          name="index"
          options={{
            title: 'Home',
            headerStyle: {
              height: 90,
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
                <PlusButton style={styles.buttonRight}></PlusButton>
                <BellButton style={styles.buttonRight}></BellButton>
              </View>
            ),
          }} />
        <Tabs.Screen
          key={2}
          name="tour"
          options={{
            title: 'Tour',
            headerShown: false,
          }} />
        <Tabs.Screen
          key={3}
          name="map"
          options={{
            title: 'Map',
            headerShown: false,
          }} />
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