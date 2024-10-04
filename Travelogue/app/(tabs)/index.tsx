import { View, Text, StyleSheet, TouchableOpacity, Button } from 'react-native'
import React from 'react'
import HeaderIndex from '@/components/header/HeaderIndex'
import ActionBar from '@/components/ActionBar'
import LikeButton from '@/components/buttons/HeartButton'
const Home = ({...navigation}) => {
  return (
    <View>
      <TouchableOpacity onPress={()=>navigation.navigate('@/admin')}><Text>Admin</Text></TouchableOpacity>
      <HeaderIndex></HeaderIndex>
      <Text>Home</Text>
      <ActionBar></ActionBar>
    </View>
  )
}


export default Home