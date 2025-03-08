import { View, Text, StyleSheet, TouchableOpacity, Alert, Modal, Pressable, Dimensions, TextInput, Image, ScrollView, Animated, useAnimatedValue } from "react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { signOut } from "firebase/auth";
import { auth, database, onValue, ref } from "@/firebase/firebaseConfig";
import SearchBar from '@/components/homePage/SearchBar'
import PostList from '@/components/homePage/PostList'
import TourSection from "@/components/homePage/TourSection";
import HomeProvider, { useHomeProvider } from "@/contexts/HomeProvider";
import { MultipleSelectList, SelectList } from 'react-native-dropdown-select-list'
import { AntDesign } from "@expo/vector-icons";
import { Badge } from "react-native-paper";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAccount } from "@/contexts/AccountProvider";
import { off } from "firebase/database";
import HeaderIndex from "@/components/header/HeaderIndex";


const height = Dimensions.get('window').height;
  const Home = () => {

  const {
    dataModalSelected,
    setDataModalSelected,
    dataAllCities,
    setDataAllCities,
    isFocus, setIsFocus, dataAccount,
    selectedTypeSearch, dataTypeSearch }: any = useHomeProvider();
  const { selectedCityId } = useLocalSearchParams()


  // useFocusEffect(
  //   useCallback(() => {
  //     if (selectedCityId) {
  //       console.log('have param', selectedCityId);
  //     } 
  //     return () => {
  //       console.log('Screen is unfocused');
  //     };
  //   }, [selectedCityId]) // Cập nhật khi các giá trị này thay đổi
  // );

  // useEffect(() => {
  //   if (selectedCityId) {
  //     console.log('have param', selectedCityId);
  //   }
  // }, [])
  // Dùng cho kiểu 1
  const scrollY = useAnimatedValue(0);
  // Dùng cho kiểu 2
  const translateY = useRef(new Animated.Value(0)).current; // Giá trị dùng để di chuyển container

  // Kiểu Animation 1
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: true }
  );

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, 500], // Khi cuộn từ 0 đến 100
    outputRange: [changePercentToPixel(height, 16), 0], // Di chuyển từ 0 đến -50px
    extrapolate: 'clamp', // Giới hạn di chuyển
  });
  // KIểu Animation 2
  // const handleScroll = (event: any) => {
  //   const offsetY = event.nativeEvent.contentOffset.y; // Lấy vị trí cuộn hiện tại

  //   if (!scrolledUp && offsetY >= 5) {
  //     // Nếu chưa di chuyển và cuộn vượt quá 100px
  //     Animated.timing(translateY, {
  //       toValue: -100, // Di chuyển lên trên 100px
  //       duration: 100,
  //       useNativeDriver: true,
  //     }).start();
  //     setScrolledUp(true);
  //   } else if (scrolledUp && offsetY <= 0) {
  //     // Nếu đã di chuyển lên và quay lại phần tử đầu tiên
  //     Animated.timing(translateY, {
  //       toValue: 0, // Reset về vị trí ban đầu
  //       duration: 100,
  //       useNativeDriver: true,
  //     }).start();
  //     setScrolledUp(false);
  //   }
  // };


  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={{ position: 'relative', height: changePercentToPixel(height, 40) }}>
        <HeaderIndex ></HeaderIndex>
        <View
          style={{
            position: 'absolute',
            height: '100%',
            width: '100%',
            overflow: 'hidden',
          }}>
          <Image style={styles.banner} source={require('@/assets/images/HoiAn-1.jpg')}></Image>
        </View>
      </View>
      {/* Content */}
      <Animated.View
        style={[
          styles.contentSection,
          // {
          //   transform: [{ translateY: translateY }], // Di chuyển header
          // },
          {
            transform: [{ translateY: headerTranslateY }], // Di chuyển header
          },
        ]}
      >
        <Animated.ScrollView
          // style={[
          //   { height: 400, position: 'relative'},
            
          // ]}
          contentContainerStyle={{ borderRadius: 20, overflow: 'hidden' }}
          nestedScrollEnabled={true}
          // BỎ COMMENT DÒNG DƯỚI ĐỂ SỬ DỤNG ANIMATION
          onScroll={handleScroll}
          // onScroll={moveUp}
          scrollEventThrottle={16}
        >
          <View>
            <Text style={[styles.textTitle, { marginBottom: 20 }]}>Explore the World through Stories</Text>
            {/* <Text style={[styles.textTitle, { marginBottom: 10 }]}></Text> */}
          </View>

          {/* Top list section */}
          <View>
            <Text style={styles.textCategory}>Nổi bật</Text>
          </View>
          {/* Tour section */}
          <View>
            <Text style={[styles.textCategory]}>Tour du lịch</Text>
            <TourSection></TourSection>
          </View>



          {/* Post Section */}
          <View>
            <Text style={styles.textCategory}>Bài viết</Text>
            {/* Đang hiển thị */}
            <View style={{ flexDirection: 'row', marginHorizontal: 20, gap: 10 }}>
              {/* <Text style={{ fontWeight: '600' }}>Hiển thị: </Text> */}
              {dataModalSelected == null ?
                <Badge size={24} style={styles.badge}>Tất cả</Badge>
                :
                <>
                  {dataModalSelected.input !== '' && <Badge size={24} style={styles.badge}>{dataModalSelected.input}</Badge>}
                  {dataModalSelected.cities.length <= 0 && dataModalSelected.country !== '' ?
                    <Badge size={24} style={styles.badge}>{dataModalSelected.country}</Badge>
                    :
                    dataModalSelected.cities.map((cityId: any) => {
                      const found = dataAllCities.find((obj: any) => obj[cityId] !== undefined);
                      return <Badge key={cityId} size={24} style={styles.badge}>{found[cityId]}</Badge>
                    })
                  }
                </>}

              <Badge size={24} style={[styles.badge, styles.bagdeType]} >{dataTypeSearch[selectedTypeSearch.current - 1].value}</Badge>
            </View>
            {/* Danh sach bài viết */}
            <PostList ></PostList>
          </View>
          {/* <Text>ádsads</Text>
          <Text>ádsads</Text>
          <Text>ádsads</Text>
          <Text>ádsads</Text>
          <Text>ádsads</Text>
          <Text>ádsads</Text> */}
        </Animated.ScrollView>
      </Animated.View>

    </View>
  )
}

const changePercentToPixel = (a:number,percent: number) => {
  return a * percent / 100;
}
const styles = StyleSheet.create({
  animatedView: {
    backgroundColor: 'blue',
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginBottom: 20,
  },
  text: {
    color: 'white',
    fontSize: 18,
  },

  textCategory: {
    marginVertical: 20,
    marginHorizontal: 20,
    fontSize: 20,
  },

  textTitle: {
    fontSize: 34,
    fontWeight:'500',
    paddingHorizontal: 20,
  },

  contentSection: {
    paddingTop: 36,
    paddingBottom: 60,
    position: 'absolute',
    backgroundColor: '#EAEAEA',
    // backgroundColor: 'red',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    bottom: 0,
    height: height - changePercentToPixel(height, 12),
  },
  banner: {
    width: "100%",
    height: 380,
  },
  container: {
    height: '100%',
  },
  bagdeType: {
    backgroundColor: 'grey',
    color: 'white',
  },
  badge: {
    fontSize: 16,
    backgroundColor: '#b9e0f7',
    color: 'black',
    paddingHorizontal: 6,
    fontWeight: '500',
    height: 44,
    borderRadius: 10
  }
})

export default Home;