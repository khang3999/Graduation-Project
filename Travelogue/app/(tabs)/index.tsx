import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import React, { useEffect, useState } from "react";
import { router } from "expo-router";
import { signOut } from "firebase/auth";
import { auth, database, onValue, ref } from "@/firebase/firebaseConfig";
import SearchBar from '@/components/homePage/SearchBar'
import PostList from '@/components/homePage/PostList'
import TourSection from "@/components/homePage/TourSection";
import HomeProvider, { useHomeProvider } from "@/contexts/HomeProvider";
import { FontAwesome6 } from "@expo/vector-icons";

const handleLogout = async () => {
  try {
    await signOut(auth);
    router.replace("/LoginScreen");
  } catch (error) {
    Alert.alert("Lỗi", "Đăng xuất không thành công. Vui lòng thử lại.");
  }
};
const Home = () => {
  // const { notifyNewPost } = useHomeProvider();

  const handleLoadNewPosts = () => {

  }
  return (
    <HomeProvider>
      <View style={styles.container}>
        {/* Search bar */}
        <View>
          <SearchBar></SearchBar>
        </View>
        {/* Tour section */}
        <View style={{display: 'flex', flexDirection:'row'}}>
          <Text style={[styles.textCategory, { width: 'auto', marginTop: 12 }]}>Tour du lịch siêu hot</Text>
          <TouchableOpacity className='mt-5' onPress={() => { router.push('/(admin)/(account)/account') }}>
            <Text>admin</Text>
          </TouchableOpacity>
        </View>
        <TourSection></TourSection>
        {/* Post Section */}

        <View className="relative">
          {/* {notifyNewPost && (
            <TouchableOpacity style={styles.buttonLoadNewPost}>
              <View style={{}}>
                <FontAwesome6 name="newspaper" size={20} color="black" />
              </View>
              <Text style={{ fontSize: 13, alignSelf: 'center', marginLeft: 4 }}>Có bài viết mới</Text>
            </TouchableOpacity>
          )} */}
        </View>
        <PostList></PostList>
      </View>
    </HomeProvider>
  )
}

const styles = StyleSheet.create({
  buttonLoadNewPost: {
    display: 'flex',
    backgroundColor: 'white',
    flexDirection: 'row',
    left: '40%',
    position: 'absolute',
    zIndex: 100,
    elevation: 8,
    padding: 4,
    borderRadius: 8
  },
  container: {
    flex: 1,
    backgroundColor: 'white'
  },
  textCategory: {
    fontSize: 14,
    backgroundColor: '#f0f0f0',
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontWeight: '500',
    alignSelf: 'flex-start',
    elevation: 10
  }
})

export default Home;
