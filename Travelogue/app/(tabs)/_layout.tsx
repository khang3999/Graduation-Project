import { View, Text } from 'react-native'
import React from 'react'
import { Tabs } from 'expo-router'
import TabBar from '@/components/navigation/TabBar'
import HeaderIndex from '@/components/header/HeaderIndex'


const _layout = () => {
  return (
    <>
      <Tabs
        tabBar={props => <TabBar {...props} />}
      >
        <Tabs.Screen
          key={1}
          name="index"
          options={{
            title: 'Home',
            headerShown: false,
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
      </Tabs>
    </>

  )
}

export default _layout