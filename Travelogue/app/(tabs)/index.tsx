<<<<<<< HEAD
import { View, Text } from 'react-native'
import React from 'react'
import HeaderIndex from '@/components/header/HeaderIndex'
import ActionBar from '@/components/ActionBar'
=======
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import React from 'react'
import HeaderIndex from '@/components/header/HeaderIndex'
import ActionBar from '@/components/ActionBar'
import {router } from 'expo-router'

console.log('App is running from (tabs)/index.tsx');

>>>>>>> 1c10ec0ff9f61229c1f01828fbc5e8db9bbfb2d2
const Home = () => {
  return (
    <View>
      <HeaderIndex></HeaderIndex>
      <Text>Home</Text>
      <ActionBar></ActionBar>
      <TouchableOpacity onPress={()=>{router.push('/(admin)/(account)/account')}}>
        <Text>admin</Text>
      </TouchableOpacity>
    </View>
  )
}


export default Home