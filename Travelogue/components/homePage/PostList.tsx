import { View, Text, StyleSheet, FlatList, Image, Button, Touchable, TouchableOpacity, Pressable } from 'react-native'
import React, { useEffect, useState } from 'react'
import ActionBar from '../ActionBar'
import Icon from 'react-native-vector-icons/FontAwesome'
import { DefaultTheme, Divider, IconButton, MD3Colors, Menu, PaperProvider, Provider } from 'react-native-paper'
import { database, ref } from '@/firebase/firebaseConfig'
import { get, off, onValue } from '@firebase/database'
import { Timestamp } from 'react-native-reanimated/lib/typescript/reanimated2/commonTypes'
import { formatDate } from '@/constants/commonFunctions'
interface Location {
  id: string,
  name: string
}
const PostList = () => {
  const [dataPosts, setDataPosts] = useState([])

  // Handle save

  // Realtime database
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
  // Sử dụng một trạng thái để quản lý ID của menu đang mở
  const [indexVisibleMenu, setIndexVisibleMenu] = useState(-1);
  // Mở menu theo ID
  const openMenu = (itemIndex: any) => {
    setIndexVisibleMenu(itemIndex)
  }
  // Đóng tất cả menu
  const closeMenu = () => {
    setIndexVisibleMenu(-1)
  };


  // ITEM RENDER
  const postItem = (post: any) => { // từng phần tử trong data có dạng {"index": 0, "item":{du lieu}} co the thay the post = destructuring {item, index}    
    const locations: any = post.item.locations // Lấy được ĐỐI TƯỢNG locations
    const allLocations: any[] = Object.keys(locations).flatMap((country) => //Object.keys(locations): lấy được mảng ["avietnam", "japan"]
      // Lấy các giá trị (địa điểm) của từng country (vd: Hà Nội, Cao Bằng)
      Object.entries(locations[country]).map(([id, name]) => ({
        id,
        name
      }))
    );
    return (
      <PaperProvider key={post.item.id}>
        <Pressable style={styles.item} onPress={() => console.log(post.index + "tap")
        }>
          {/*Author*/}
          <View style={styles.authorContent}>
            <TouchableOpacity style={styles.avatarWrap}>
              <Image style={styles.avatar} source={require('@/assets/images/logo.png')}></Image>
            </TouchableOpacity>
            <View className='justify-center mx-2'>
              <TouchableOpacity>
                <Text className='font-semibold w-[120px]'>
                  {post.item.author.fullname}
                </Text>
              </TouchableOpacity>
              <Text className='italic text-xs'>{formatDate(post.item.created_at)}</Text>
            </View>
          </View>
          {/* Location */}
          <View style={styles.flagBtn}>
            {/* <Provider > */}
            <Menu
              // statusBarHeight={0}
              style={styles.listLocations}
              visible={indexVisibleMenu === post.index} // Thay the 1 bang index của post trong mang
              onDismiss={closeMenu}
              theme={''}
              anchor={
                <IconButton
                  style={{ backgroundColor: 'white', width: 50, height: 32 }}
                  icon="flag-variant-outline"
                  iconColor={MD3Colors.error10}
                  size={26}
                  onPress={() => openMenu(post.index)}
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
          <View style={styles.imagePost}>
            <Image style={styles.imagePost} source={{ uri: post.item.images }}></Image>
          </View>

          {/* Button like, comment, save */}
          <ActionBar style={styles.actionBar} postID={post.item.id}></ActionBar>
        </Pressable>
      </PaperProvider >

    )
  }

  // VIEW
  return (
    // <Provider>
    <View style={styles.container}>
      <FlatList
        showsVerticalScrollIndicator={false}
        data={dataPosts}
        renderItem={postItem}
        keyExtractor={(post: any) => post.id}
        contentContainerStyle={{ paddingBottom: 15 }}
        ItemSeparatorComponent={() => <View style={{ height: 20, }} />} />
    </View>
    // </Provider>

  )
}
const styles = StyleSheet.create({
  imagePost: {
    height: 410,
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
    height: 410,
    position: "relative",
    marginHorizontal: 10,
    borderRadius: 30,
    elevation: 6
  },
  actionBar: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    zIndex: 3
  },
  container: {
    position: 'relative',
    height: 428,
    marginTop: 15,
  }
})


export default PostList