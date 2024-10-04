import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import React from 'react'
import HeaderIndex from '@/components/header/HeaderIndex'
import ActionBar from '@/components/ActionBar'
import {router } from 'expo-router'

console.log('App is running from (tabs)/index.tsx');

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