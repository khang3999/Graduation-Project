import { View, Text, FlatList, StyleSheet, Image, ScrollView, Dimensions, TouchableOpacity, Pressable } from 'react-native'
import React, { useEffect, useState } from 'react'
import Carousel from 'react-native-reanimated-carousel';
import { database, onValue, ref } from '@/firebase/firebaseConfig';
import { types } from '@babel/core';
import { Divider, IconButton, MD3Colors, Menu, PaperProvider } from 'react-native-paper';
import ActionBar from '../ActionBar';
import { formatDate } from '@/constants/commonFunctions';

const { width } = Dimensions.get('window');
const dataTours = [
  []
]
const TourList = () => {
  const [dataTours, setDataTours] = useState([])

  const [indexVisibleMenu, setIndexVisibleMenu] = useState(-1);

  // Mở menu theo ID
  const openMenu = (itemIndex: any) => {
    setIndexVisibleMenu(itemIndex)
  }
  // Đóng tất cả menu
  const closeMenu = () => {
    setIndexVisibleMenu(-1)
  };


  useEffect(() => {
    // Tạo đường dẫn tham chiếu tới nơi cần lấy bảng posts
    const refTours = ref(database, 'tours/')
    const unsubscribe = onValue(refTours, (snapshot) => {
      if (snapshot.exists()) {
        const jsonDataTours = snapshot.val();
        // Chuyển đổi object thành array bang values cua js
        const jsonArrayTours: any = Object.values(jsonDataTours).sort((a: any, b: any) => b.created_at - a.created_at)
        // Set du lieu
        setDataTours(jsonArrayTours)
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

  // ITEM RENDER
  const tourItem = (tour: any) => { // từng phần tử trong data có dạng {"index": 0, "item":{du lieu}} co the thay the tour = destructuring {item, index}    
    const locations: any = tour.item.locations // Lấy được ĐỐI TƯỢNG locations
    const allLocations: any[] = Object.keys(locations).flatMap((country) => //Object.keys(locations): lấy được mảng ["avietnam", "japan"]
      // Lấy các giá trị (địa điểm) của từng country (vd: Hà Nội, Cao Bằng)
      Object.entries(locations[country]).map(([id, name]) => ({
        id,
        name
      }))
    );
    return (
      <PaperProvider key={tour.item.id}>
        <Pressable style={styles.item} onPress={() => console.log(tour.index + "tap")
        }>
          {/*Author*/}
          <View style={styles.authorContent}>
            <TouchableOpacity style={styles.avatarWrap}>
              <Image style={styles.avatar} source={require('@/assets/images/logo.png')}></Image>
            </TouchableOpacity>
            <View className='justify-center mx-2'>
              <TouchableOpacity>
                <Text className='font-semibold w-[120px]'>
                  {tour.item.author.fullname}
                </Text>
              </TouchableOpacity>
              <Text className='italic text-xs'>{formatDate(tour.item.created_at)}</Text>
            </View>
          </View>
          {/* Location */}
          <View style={styles.flagBtn}>
            {/* <Provider > */}
            <Menu
              // statusBarHeight={0}
              style={styles.listLocations}
              visible={indexVisibleMenu === tour.index} // Thay the 1 bang index của tour trong mang
              onDismiss={closeMenu}
              theme={''}
              anchor={
                <IconButton
                  style={{ backgroundColor: 'white', width: 50, height: 32 }}
                  icon="flag-variant-outline"
                  iconColor={MD3Colors.error10}
                  size={26}
                  onPress={() => openMenu(tour.index)}
                  accessibilityLabel="Menu button"
                />
              }>
              {allLocations.map((location: any) => {
                return (
                  <>
                    <TouchableOpacity key={location.id}>
                      <Menu.Item title={location.name} titleStyle={styles.itemLocation} dense={true}></Menu.Item>
                      <Divider />
                    </TouchableOpacity>
                  </>
                )
              })
              }
            </Menu>
            {/* </Provider> */}
          </View>
          <View style={styles.imageTour}>
            <Image style={styles.imageTour} source={{ uri: tour.item.images }}></Image>
          </View>

          {/* Button like, comment, save */}
          <ActionBar style={styles.actionBar} tourID={tour.item.id}></ActionBar>
        </Pressable>
      </PaperProvider >

    )
  }


  return (
    <View style={styles.container}>
      <FlatList
        // scrollToOffset={}
        data={dataTours}
        renderItem={tourItem}
        keyExtractor={(tour: any) => tour.id}
        contentContainerStyle={{ marginBottom: 8, paddingHorizontal: 10, paddingVertical: 10 }}
        ItemSeparatorComponent={() => <View style={{ height: 22, }} />}
        pagingEnabled>
      </FlatList>
    </View>
  )
}
const styles = StyleSheet.create({
  actionBar: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    zIndex: 3
  },
  imageTour: {
    height: 258,
    // backgroundColor: 'red',
    borderRadius: 30,
  },
  itemLocation: {
    padding: 0,
    fontSize: 14,
    left: -11,
    width: 80,
    // backgroundColor: 'green',
    textAlign: 'center'
  },
  listLocations: {
    width: 90,
    left: 284,
    top: 42,
    position: 'absolute',
    paddingVertical: 0,
    borderRadius: 30
  },
  flagBtn: {
    position: 'absolute',
    right: 20,
    top: 4,
    zIndex: 3
  },
  avatar: {
    borderRadius: 90,
    width: 40,
    height: 40,
  },
  avatarWrap: {
    borderRadius: 90,
    width: 40,
    height: 40,
    backgroundColor: 'grey',
    elevation: 3
  },
  authorContent: {
    position: 'absolute',
    left: 10,
    top: 10,
    flexDirection: 'row',
    backgroundColor: 'white',
    width: 185,
    padding: 6,
    borderRadius: 90,
    zIndex: 3
  },
  item: {
    height: 258,
    position: "relative",
    marginHorizontal: 10,
    borderRadius: 30,
    elevation: 6
  },
  container: {
    position: 'relative',
    height: 565,
    marginTop: 15,
  }
})
export default TourList