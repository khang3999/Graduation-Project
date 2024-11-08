import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import React, { useEffect } from "react";
import { router } from "expo-router";
import { signOut } from "firebase/auth";
import { auth } from "@/firebase/firebaseConfig";
import SearchBar from '@/components/homePage/SearchBar'
import TourList from '@/components/homePage/TourList'
import PostList from '@/components/homePage/PostList'
import AsyncStorage from "@react-native-async-storage/async-storage";

const handleLogout = async () => {
  try {
    await signOut(auth);
    router.replace("/LoginScreen");
  } catch (error) {
    Alert.alert("Lỗi", "Đăng xuất không thành công. Vui lòng thử lại.");
  }
};
const Home = () => {
  const currentUser = auth.currentUser;
  useEffect(() => {
    const storeUser = async () => {
      await AsyncStorage.setItem("user", JSON.stringify(currentUser));
    };
    storeUser();
  }, []);
  return (
    <View style={styles.container}>
      {/* Search bar */}
      <View>
        <SearchBar></SearchBar>
      </View>
      {/* Tour section */}
      <View className="flex-row">
        <Text style={[styles.textCategory, { width: 'auto', marginTop: 12 }]}>Tour du lịch siêu hot</Text>
        <TouchableOpacity  className='mt-5' onPress={() => { router.push('/(admin)/(account)/account') }}>
          <Text>admin</Text>
        </TouchableOpacity>
      </View>
      <TourList></TourList>
      {/* Post Section */}
      <Text style={[styles.textCategory]}>Những bài viết mới</Text>
      <PostList></PostList>
      {/* <ButtonComponent
        text="Đăng xuất"
        color={appColors.danger}
        onPress={handleLogout}
      /> */}
    </View>
  )
}

const styles = StyleSheet.create({
  tourItem: {

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
    fontWeight: 500,
    alignSelf: 'flex-start',
    elevation: 10
  }
})


export default Home