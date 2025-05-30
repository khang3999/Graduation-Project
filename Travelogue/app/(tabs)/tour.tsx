import { View, Text, StyleSheet, ScrollView, Image, Animated, Easing, Touchable, TouchableOpacity, Dimensions } from 'react-native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import PostList from '@/components/homePage/PostList'
import TourList from '@/components/tours/TourList'
import { useTourProvider } from '@/contexts/TourProvider'
import { Badge } from 'react-native-paper'
import { useHomeProvider } from '@/contexts/HomeProvider'
import HeaderIndex from '@/components/header/HeaderIndex'
import { AntDesign, FontAwesome6, Foundation, MaterialCommunityIcons } from '@expo/vector-icons'
import { backgroundColors, iconColors } from '@/assets/colors'
import SearchModal from '@/components/tours/modals/SearchModal'
import NewTourModal from '@/components/tours/modals/NewTourModal'

const HEADER_HEIGHT = 0;
const maxheight = Dimensions.get('window').height;
const Tour = () => {
  const {
    dataTours,
    dataModalSelected,
    // selectedTypeSearch, setSelectedTypeSearch,
    selectedTypeSearch,
    dataNewTourList,
    dataTypeSearch,
    modalSearchVisible, setModalSearchVisible,
    setReload,
    modalNewTourVisible, setModalNewTourVisible,
    setIsLoading,
    currentTourCount,
    newTourCount
  }: any = useTourProvider()
  const { dataAllCities }: any = useHomeProvider()

  const scrollY = useRef(new Animated.Value(0)).current;
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
    // loopRef.current.start();

    // Stop after 3s
    // const timeout = setTimeout(() => {
    //   loopRef.current?.stop();
    // }, 3000);
    // return () => clearTimeout(timeout);
  }, []);

  const rotate = rotateAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-2deg', '0deg', '2deg'],
  });

  const headerBackgroundColor = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: ['transparent', backgroundColors.background2],
    extrapolate: 'clamp',
  });
  // End  Animation

  const handleTapOnReloadTourScreen = useCallback(() => {
    setIsLoading(true)
    setReload((prev: Boolean) => !prev); // toggle reload
  }, [])


  const renderModal = useCallback(() => {
    return (
      <>
        {modalSearchVisible && <SearchModal />}
        {modalNewTourVisible && <NewTourModal
          data={dataTours}
          // data={[]}
          dataNew={dataNewTourList}
          modalNewPostVisible={modalNewTourVisible}
          setReload={setReload}
          setModalNewPostVisible={setModalNewTourVisible}
          setIsLoading={setIsLoading}
        />}
      </>
    )
  }, [modalSearchVisible, modalNewTourVisible])
  return (
    <View style={styles.container}>
      {/* Animated Header 1*/}
      <Animated.View style={[styles.header, { backgroundColor: headerBackgroundColor }]}>
        <HeaderIndex />
      </Animated.View>

      {/* ScrollView 4 */}
      <Animated.ScrollView
        style={styles.contentSection}
        contentContainerStyle={{ paddingTop: HEADER_HEIGHT }}
        showsVerticalScrollIndicator={true}
        nestedScrollEnabled={true}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}>
        {/* {Banner && filter && badge */}
        <View style={{ width: '100%', overflow: 'hidden', }}>
          {/* Banner Image */}
          <View style={{ height: maxheight / 2, width: '100%' }}>
            <Image style={styles.bannerImage} source={require('@/assets/images/tourBg.jpg')}></Image>
            <View style={[styles.bannerContentBackgroundOverPlay, { backgroundColor: 'rgba(5, 26, 9, 0.1)' }]}></View>
          </View>
          {/* Banner content */}
          <View style={styles.bannerContent}>
            {/* Banner background */}
            <View style={styles.bannerContentBackground}>
              {/* <Image style={{ width: '100%', height: '100%' }} source={require('@/assets/images/pineForest.jpg')}></Image> */}
              <View style={styles.bannerContentBackgroundOverPlay}></View>
            </View>
            {/* Banner content item */}
            <View style={styles.bannerContentItem}>
              <View style={styles.bannerIcon}>
                <Foundation name="trees" size={40} color={iconColors.green4} />
              </View>
              <View style={{ flex: 2, }}>
                {/* <Text >Top Travel Picks of the Moment</Text> */}
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <MaterialCommunityIcons name="trending-up" size={20} color="white" />
                  <Text style={styles.textBanner}>Top trending</Text>
                </View>
                <Text style={styles.textBannerTitle}>Những lựa chọn du lịch hàng đầu hiện nay</Text>
                <Text style={styles.textBanner}>" Đi đi em,</Text>
                <Text style={styles.textBanner}>  Còn do dự ... </Text>
                <Text style={styles.textBanner}>  Trời tối mất"</Text>
                <TouchableOpacity style={styles.bannerButtonArrowRight}>
                  <AntDesign name="arrowright" size={24} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Badges, filter button, reload button */}
          <View style={styles.badgeSection}>
            {/* Tour category and new tour button */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              {/* <Text style={[styles.textCategory, { flex: 1 }]}>Tour du lịch</Text> */}
              <View style={{ flex: 1 }}></View>
              <View style={{ flex: 2 }}>
                {((currentTourCount !== newTourCount)) && (
                  <Animated.View style={{ transform: [{ rotate: rotate }], width: '100%', alignItems: 'center', justifyContent: 'center' }}>
                    <TouchableOpacity style={styles.btnNotifyNewPost} onPress={() => setModalNewTourVisible(true)}>
                      <FontAwesome6 name="newspaper" size={20} color="black" />
                      <Text style={{ fontWeight: '500' }}>Tour mới</Text>
                    </TouchableOpacity>
                  </Animated.View>
                )}
              </View>
              <View style={{ flex: 1 }}></View>
            </View>

            {/* Badges and button  reload*/}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 5, }}>
              <View style={styles.listBadges} >
                <ScrollView
                  horizontal={true}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{
                    paddingVertical: 10, paddingHorizontal: 15, gap: 10,
                  }}
                >
                  {dataModalSelected == null ?
                    <>
                      <Badge size={24} style={styles.badge}>Tất cả</Badge>
                    </>
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
              </View>

              {/* Button search and reload */}
              <View style={styles.containerButton}>
                <TouchableOpacity
                  style={styles.btn}
                  onPress={() => setModalSearchVisible(true)}>
                  {/* <Ionicons name="options-outline" size={28} color={iconColors.green1} /> */}
                  <MaterialCommunityIcons name="tune-variant" size={24} color={iconColors.green1} />
                </TouchableOpacity>

                <TouchableOpacity style={[styles.btn, { backgroundColor: backgroundColors.reloadButton }]} onPress={handleTapOnReloadTourScreen}>
                  <AntDesign name="reload1" size={22} color='white' />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Tour list section */}
        <TourList></TourList>

      </Animated.ScrollView>
      {/* Modal */}
      {/* {renderSearchModal()}
      {renderNewPostModal()} */}
      {renderModal()}
    </View >
  )
}

const styles = StyleSheet.create({
  badgeSection: {
    position: 'absolute',
    paddingVertical: 15,
    padding: 10,
    bottom: 0,
    width: '100%',
    // borderTopLeftRadius: 30, 
    // borderTopRightRadius: 30, 
    backgroundColor: 'rgba(0, 0, 0, 0.6)'
  },
  listBadges: {
    flex: 1,
    backgroundColor: backgroundColors.background1,
    borderRadius: 10,
    elevation: 15,
    shadowColor: 'white'
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
    // elevation: 15,
    shadowColor: 'white'
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
  textCategory: {
    fontSize: 14,
    backgroundColor: '#f0f0f0',
    // borderTopRightRadius: 10,
    // borderBottomRightRadius: 10,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    margin: 10,
    fontWeight: 500,
    alignSelf: 'flex-start',
    elevation: 10
  },
  textBanner: {
    color: 'white',
    // fontWeight:'500'
  },
  textBannerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '500',
    paddingVertical: 5
  },
  contentSection: {
    flex: 1,
    backgroundColor: 'white',
    paddingBottom: 60,
    // paddingBottom: 100
  },
  bannerButtonArrowRight: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(46, 64, 49, 0.8)',
    borderRadius: 15,
    paddingVertical: 15,
    paddingHorizontal: 15
  },
  bannerIcon: {
    backgroundColor: '#eeeeee',
    justifyContent: 'center',
    alignItems: 'center',
    width: 60,
    borderRadius: 90,
  },
  bannerContentItem: {
    flexDirection: 'row',
    gap: 15,
    padding: 20,
    width: '100%',
    borderRadius: 40,
  },
  bannerContentBackgroundOverPlay: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: 'rgba(5, 26, 9, 0.85)'
  },
  bannerContentBackground: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 20,
    left: 20,
    borderRadius: 40,
    overflow: 'hidden'
  },
  bannerContent: {
    position: 'absolute',
    width: '100%',
    top: 100,
    padding: 20,
    elevation: 4,
    zIndex: 3,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  header: {
    position: 'absolute',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
    // backgroundColor: 'white',
  },
  container: {
    flex: 1,
    backgroundColor: 'white'
  },
  badgeText: {
    fontSize: 13,
    backgroundColor: '#b9e0f7',
    color: 'black',
    paddingHorizontal: 6,
    fontWeight: '500'
  },
})
export default Tour