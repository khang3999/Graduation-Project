import { View, Text, StyleSheet, TouchableOpacity, Alert, Modal, Pressable, Dimensions, TextInput, Image, ScrollView, Animated, useAnimatedValue } from "react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import PostList from '@/components/homePage/PostList'
import TourSection from "@/components/homePage/TourSection";
import HomeProvider, { useHomeProvider } from "@/contexts/HomeProvider";
import { AntDesign, Entypo, FontAwesome6, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Badge } from "react-native-paper";
import HeaderIndex from "@/components/header/HeaderIndex";
import { backgroundColors, iconColors } from "@/assets/colors";
<<<<<<< HEAD
import Featured from "@/components/homePage/Featured ";
=======
import { set } from "lodash";
import SearchModal from "@/components/homePage/modals/SearchModal";
import NewPostModal from "@/components/homePage/modals/NewPostModal";
>>>>>>> main


const height = Dimensions.get('window').height;
const Home = () => {
  const {
    dataPosts,
    currentPostCount,
    newPostCount,
    dataModalSelected, setDataModalSelected,
    dataAllCities,
    dataNewPostList,
    setReload,
    setSearch,
    setIsLoading,
    // ModalSearch
    modalSearchVisible, setModalSearchVisible,
    dataInput,
    dataCountries,
    selectedCountry,
    // setDataCities,
    selectedCities, setSelectedCities,
    dataTypeSearch,
    selectedTypeSearch,
    // Modal new post
    modalNewPostVisible, setModalNewPostVisible,

  }: any = useHomeProvider();

  const rotateAnim = useRef(new Animated.Value(0)).current;
  const loopRef = useRef<any>(null);

  // Animation
  useEffect(() => {
    loopRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: -1,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 50,
          useNativeDriver: true,
        }),
      ])
    ).start()
  }, []);

  const rotate = rotateAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-2deg', '0deg', '2deg'],
  });

  const renderPostList = useCallback(() => (<PostList />), [])
  const renderTourList = useCallback(() => (<TourSection />), [])
  // const renderSearchModal = useCallback(() => {
  //   return modalSearchVisible ? <SearchModal /> : null
  // }, [modalSearchVisible])
  // // const renderSearchModal = () => {
  // //   return modalSearchVisible ? <SearchModal /> : null
  // // }
  // const renderNewPostModal = useCallback(() => {
  //   return modalNewPostVisible ? <NewPostModal /> : null
  // }, [modalNewPostVisible])

  const renderModal = useCallback(() => {
    return (
      <>
        {modalSearchVisible && <SearchModal

        />}
        {/* {modalSearchVisible && <SearchModal
          modalSearchVisible={modalSearchVisible}
          setModalSearchVisible={setModalSearchVisible}
          dataInput={dataInput}
          dataCountries={dataCountries}
          selectedCountry={selectedCountry}
          // dataCities={dataAllCities}
          selectedCities={selectedCities}
          setSelectedCities={setSelectedCities}
          // setDataCities={setDataCities}
          dataTypeSearch={dataTypeSearch}
          selectedTypeSearch={selectedTypeSearch}
          setIsLoading={setIsLoading}
          setSearch={setSearch}
          dataModalSelected={dataModalSelected}
          setDataModalSelected={setDataModalSelected}
        />} */}


        {modalNewPostVisible && <NewPostModal
          data={dataPosts}
          dataNew={dataNewPostList}
          modalNewPostVisible={modalNewPostVisible}
          setReload={setReload}
          setModalNewPostVisible={setModalNewPostVisible}
          setIsLoading={setIsLoading}
        />}
      </>
    );
  }, [modalSearchVisible, modalNewPostVisible]);

  // Dùng cho kiểu 1
  const scrollY = useAnimatedValue(0);

  // Kiểu Animation 1
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: true }
  );

  const contentSectionTranslateY = scrollY.interpolate({
    inputRange: [0, 500], // Khi cuộn từ 0 đến 100
    outputRange: [changePercentToPixel(height, 16), 20], // Di chuyển từ 0 đến -50px
    extrapolate: 'clamp', // Giới hạn di chuyển
  });

  const handleTapOnReloadHomeScreen = useCallback(() => {
    setIsLoading(true)
    setReload((prev: Boolean) => !prev); // toggle reload
  }, [])

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
          {
            transform: [{ translateY: contentSectionTranslateY }], // Di chuyển header
          },
        ]}
      >
        <Animated.ScrollView
          contentContainerStyle={{ overflow: 'hidden', backgroundColor: backgroundColors.background1 }}
          nestedScrollEnabled={true}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          <View>
            <Text style={[styles.textTitle, { marginBottom: 20 }]}>Explore the World through Stories</Text>
          </View>

        

          {/* Top list section */}
          <View>
            <Text style={styles.textCategory}>Nổi bật</Text>
             <Featured></Featured>
          </View>
          {/* Tour section */}
          <View>
            <Text style={[styles.textCategory]}>Tour du lịch</Text>
            <View style={{ paddingBottom: 20 }}>
              {renderTourList()}
            </View>
          </View>
          {/* POST */}
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={[styles.textCategory, { flex: 1 }]}>Bài viết</Text>

              <View style={{ flex: 2 }}>
                {((currentPostCount !== newPostCount)) && (
                  <Animated.View style={{ transform: [{ rotate: rotate }], width: '100%', alignItems: 'center', justifyContent: 'center' }}>
                    <TouchableOpacity style={styles.btnNotifyNewPost} onPress={() => setModalNewPostVisible(true)}>
                      <FontAwesome6 name="newspaper" size={20} color="black" />
                      <Text style={{ fontWeight: '500' }}>Bài viết mới</Text>
                    </TouchableOpacity>
                  </Animated.View>
                )}
              </View>
              <View style={{ flex: 1 }}></View>
            </View>

            {/* Đang hiển thị */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 10, marginBottom: 20 }}>
              <ScrollView
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingLeft: 20, paddingVertical: 10, gap: 10 }}
              >
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

                {/* <Badge size={24} style={styles.badge}>Tất cả</Badge>
                <Badge size={24} style={styles.badge}>Tất cả</Badge>
                <Badge size={24} style={styles.badge}>Tất cả</Badge>
                <Badge size={24} style={styles.badge}>Tất cả</Badge> */}
              </ScrollView>
              {/* Button search and reload */}
              <View style={styles.containerButton}>
                <TouchableOpacity
                  style={styles.btn}
                  onPress={() => setModalSearchVisible(true)}>
                  {/* <Ionicons name="options-outline" size={28} color={iconColors.green1} /> */}
                  <MaterialCommunityIcons name="tune-variant" size={24} color={iconColors.green1} />
                </TouchableOpacity>

                <TouchableOpacity style={[styles.btn, { backgroundColor: backgroundColors.reloadButton }]} onPress={handleTapOnReloadHomeScreen}>
                  <AntDesign name="reload1" size={22} color='white' />
                </TouchableOpacity>
              </View>
            </View>
            {/* Danh sach bài viết */}
            {/* <PostList ></PostList> */}
            {renderPostList()}
          </View>
          {/* <Text>ádsads</Text>
          <Text>ádsads</Text>
          <Text>ádsads</Text>
          <Text>ádsads</Text>
          <Text>ádsads</Text>
          <Text>ádsads</Text> */}
        </Animated.ScrollView>
      </Animated.View>
      {/* Modal */}
      {/* {renderSearchModal()}
      {renderNewPostModal()} */}
      {renderModal()}
    </View >
  )
}

const changePercentToPixel = (a: number, percent: number) => {
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
    marginHorizontal: 20,
    fontSize: 20,
    fontWeight: '600',
  },
  textTitle: {
    fontSize: 34,
    fontWeight: '500',
    paddingHorizontal: 20,
  },
  contentSection: {
    paddingTop: 36,
    paddingBottom: 77,
    position: 'absolute',
    backgroundColor: backgroundColors.background1,
    // backgroundColor: 'red',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    bottom: 0,
    height: height - changePercentToPixel(height, 13),
  },
  banner: {
    width: "100%",
    height: 380,
  },
  container: {
    height: '100%',
  },
  btn: {
    // backgroundColor: '#C3F9C2',
    backgroundColor: 'white',
    marginHorizontal: 5,
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  containerButton: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginHorizontal: 15,
  },
  bagdeType: {
    backgroundColor: iconColors.green1,
    color: 'white',
  },
  badge: {
    fontSize: 16,
    // backgroundColor: '#b9e0f7',
    backgroundColor: iconColors.green2,
    color: 'black',
    paddingHorizontal: 6,
    fontWeight: '500',
    height: 44,
    borderRadius: 10,
    elevation: 4,
  },
  btnNotifyNewPost: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    width: 110,
    paddingVertical: 4,
    backgroundColor: '#ffff77',
    borderRadius: 8,
    elevation: 4,
  },
})

export default Home;