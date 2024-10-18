import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import React, { useEffect, useState } from "react";
import { router } from "expo-router";
import { signOut } from "firebase/auth";
import { auth, database, onValue, ref } from "@/firebase/firebaseConfig";
import SearchBar from '@/components/homePage/SearchBar'
import TourList from '@/components/homePage/TourSection'
import PostList from '@/components/homePage/PostList'
import TourSection from "@/components/homePage/TourSection";
import HomeProvider from "@/contexts/HomeProvider";

const handleLogout = async () => {
  try {
    await signOut(auth);
    router.replace("/LoginScreen");
  } catch (error) {
    Alert.alert("Lỗi", "Đăng xuất không thành công. Vui lòng thử lại.");
  }
};
const Home = () => {
  // TOURS DATA BY POST
  const [locations, setLocations] = useState([])

  // POSTS DATA
  const [dataPosts, setDataPosts] = useState([])
  useEffect(() => {
    // Tạo đường dẫn tham chiếu tới nơi cần lấy bảng posts
    const refPosts = ref(database, 'posts/')
    const unsubscribe = onValue(refPosts, (snapshot) => {
      if (snapshot.exists()) {
        const jsonDataPosts = snapshot.val();
        // Chuyển đổi object thành array bang values cua js
        const jsonArrayPosts: any = Object.values(jsonDataPosts).sort((a: any, b: any) => b.created_at - a.created_at)
        // Set du lieu
        setDataPosts(jsonArrayPosts)
      } else {
        console.log("No data available");
      }
    }, (error) => {
      console.error("Error fetching data:", error);
    });

    return () => {
      unsubscribe(); // Sử dụng unsubscribe để hủy listener
    };
  }, [])



  return (
    <HomeProvider>
      <View style={styles.container}>
        {/* Search bar */}
        <View>
          <SearchBar></SearchBar>
        </View>
        {/* Tour section */}
        <View className="flex-row">
          <Text style={[styles.textCategory, { width: 'auto', marginTop: 12 }]}>Tour du lịch siêu hot</Text>
          <TouchableOpacity className='mt-5' onPress={() => { router.push('/(admin)/(account)/account') }}>
            <Text>admin</Text>
          </TouchableOpacity>
        </View>
        <TourSection></TourSection>
        {/* Post Section */}
        <Text style={[styles.textCategory]}>Những bài viết mới</Text>
        <PostList dataPosts={dataPosts}></PostList>
        {/* <ButtonComponent
        text="Đăng xuất"
        color={appColors.danger}
        onPress={handleLogout}
      /> */}
      </View>
    </HomeProvider>
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

export default Home;
