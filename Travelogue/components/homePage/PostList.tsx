import { View, Text, StyleSheet, FlatList, Image, Button, Touchable, TouchableOpacity, Pressable } from 'react-native'
import React, { useState } from 'react'
import ActionBar from '../ActionBar'
import Icon from 'react-native-vector-icons/FontAwesome'
import { DefaultTheme, Divider, IconButton, MD3Colors, Menu, PaperProvider, Provider } from 'react-native-paper'
import { white } from 'react-native-paper/lib/typescript/styles/themes/v2/colors'
import { blue } from 'react-native-reanimated/lib/typescript/reanimated2/Colors'

const PostList = () => {
  const locations: number = 2
  // Du lieu fetch
  const dataPosts = [
    {
      id: '1',
      name: 'aa',
      locations: ["BR - VT", "Huế", "Phú Yên", "Quảng Bình"],
      created_at: '07 tháng 11, 2024',
      author: {
        name: "Hieu Phuc",
        image: "https://firebasestorage.googleapis.com/v0/b/travelogue-abb82.appspot.com/o/testImagePost%2Fda-lat.png?alt=media&token=39bb9034-6bca-47b8-8d5a-2f4aa5f60f9b",
      }
    },
    {
      id: '2',
      name: 'aa',
      locations: ["Lâm Đồng", "Bình Duong", "Phú Yên"],
      created_at: '07 tháng 11, 2024',
      author: {
        name: "Tran Thi Anh Thu",
        image: "da-lat.png",
      }
    },
    {
      id: '3',
      name: 'aa',
      locations: ["BR - VT", "Huế", "Phú Yên"],
      created_at: '07 tháng 11, 2024',
      author: {
        name: "Ngoc Hieu",
        image: "logo.png",
      }
    },
  ];

  const [indexVisibleMenu, setIndexVisibleMenu] = useState(-1); // Sử dụng một trạng thái để quản lý ID của menu đang mở
  const openMenu = (itemIndex: any) => {
    setIndexVisibleMenu(itemIndex)
  }  // Mở menu theo ID
  const closeMenu = () => {
    setIndexVisibleMenu(-1)
  };         // Đóng tất cả menu
  const postItem = (post: any) => { // từng phần tử trong data có dạng {"index": 0, "item":{du lieu}} co the thay the post = destructuring {item, index}
    // console.log(post.index);
    return (
      <PaperProvider>
        <Pressable style={styles.item} onPress={() => console.log(post.index + "hh")
        }>
          {/*Author*/}
          <View style={styles.authorContent}>
            <TouchableOpacity style={styles.avatarWrap}>
              <Image style={styles.avatar} source={require('@/assets/images/logo.png')}></Image>
            </TouchableOpacity>
            <View className='justify-center mx-2'>
              <TouchableOpacity>
                <Text className='font-semibold w-[120px]'>
                  {post.item.author.name}
                </Text>
              </TouchableOpacity> 
              <Text className='italic text-xs'>{post.item.created_at}</Text>
            </View>
          </View>
          {/* Location */}
          <View style={styles.flagBtn}>
            {/* <Provider > */}
            <Menu
              // statusBarHeight={0}
              style={styles.listLocations}
              visible={indexVisibleMenu === post.item.id} // Thay the 1 bang index của post trong mang
              onDismiss={closeMenu}
              theme={''}
              anchor={
                <IconButton
                  style={{ backgroundColor: 'white', width: 50, height: 32 }}
                  icon="flag-variant-outline"
                  iconColor={MD3Colors.error10}
                  size={26}
                  onPress={() => openMenu(post.item.id)}
                  accessibilityLabel="Menu button"
                />
              }>
              {post.item.locations.map((location: any, index: any) => {
                return (
                  <>
                    <TouchableOpacity key={index}>
                      <Menu.Item title={location} titleStyle={styles.itemLocation} dense={true}></Menu.Item>
                      <Divider />
                    </TouchableOpacity>

                  </>
                )
              })}
            </Menu>
            {/* </Provider> */}
          </View>
          <View style={styles.imagePost}>
            <Image style={styles.imagePost} source={{ uri: post.item.author.image }}></Image>
          </View>

          {/* Button like, comment, save */}
          <ActionBar style={styles.actionBar}></ActionBar>
        </Pressable>
      </PaperProvider >

    )
  }
  return (
    // <Provider>
    <View style={styles.container}>
      <FlatList
        data={dataPosts}
        renderItem={postItem}
        keyExtractor={(post) => post.id}
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
    zIndex:3
  },
  container: {
    position: 'relative',
    height: 428,
    marginTop: 15,
  }
})


export default PostList