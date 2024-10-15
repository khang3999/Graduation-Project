import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import React from 'react'
import HeaderIndex from '@/components/header/HeaderIndex'
import ActionBar from '@/components/ActionBar'
import {router } from 'expo-router'

console.log('App is running from (tabs)/index.tsx');

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace("/LoginScreen"); 
    } catch (error) {
      Alert.alert("Lỗi", "Đăng xuất không thành công. Vui lòng thử lại.");
    }
  };
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