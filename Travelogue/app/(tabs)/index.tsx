import { View, Text } from 'react-native'
import React from 'react'
import HeaderIndex from '@/components/header/HeaderIndex'
import ActionBar from '@/components/ActionBar'
import { TouchableOpacity } from 'react-native'
import { router } from 'expo-router'
const Home = () => {
  return (
    <View>
      <HeaderIndex></HeaderIndex>
      <Text>Home</Text>
      <ActionBar></ActionBar>
      <TouchableOpacity onPress={()=>{
        router.push('/screens/admin/account/account')
      }}>
        <Text>Admin</Text>
      </TouchableOpacity>
    </View>
  )
}


export default Home