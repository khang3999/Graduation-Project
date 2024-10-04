import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import HeaderIndex from '@/components/header/HeaderIndex'
import ActionBar from '@/components/ActionBar'
import LikeButton from '@/components/buttons/HeartButton'
const Home = () => {
  return (
    <View>
      <HeaderIndex></HeaderIndex>
      <Text>Home</Text>
      <ActionBar></ActionBar>
    </View>
  )
}


export default Home