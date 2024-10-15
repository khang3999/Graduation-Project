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
        image: "logo.png",
      }
    },
    {
      id: '2',
      name: 'aa',
      locations: ["Lâm Đồng", "Bình Duong", "Phú Yên"],
      created_at: '07 tháng 11, 2024',
      author: {
        name: "Tran Thi Anh Thu",
        image: "logo.png",
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
  // List location
  const theme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: 'white',  // Đặt màu nền là trắng
      surface: 'white',     // Đặt màu surface (nền cho các thành phần như Menu) là trắng
      primary: 'blue',      // Màu primary (nút, nhấn)
      text: 'black',        // Màu chữ là đen
    },
    roundness: 4,  // Độ bo góc
  };
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
      <PaperProvider theme={theme} key={post.index}>
        <Pressable style={styles.item} onPress={() => console.log(post.index + "hh")
        }>
          {/*Author*/}
          <View style={styles.authorContent}>
            <View style={styles.avatarWrap}>
              <Image style={styles.avatar} source={require('@/assets/images/logo.png')}></Image>
            </View>
            <View className='justify-center mx-2'>
              <Text className='font-semibold w-[120px]'>{post.item.author.name}</Text>
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
                      <Menu.Item  title={location} titleStyle={styles.itemLocation} dense={true}></Menu.Item>
                      <Divider />
                    </TouchableOpacity>

                  </>
                )
              })}
            </Menu>
            {/* </Provider> */}
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
        contentContainerStyle={{ paddingBottom: 15 }}
        ItemSeparatorComponent={() => <View style={{ height: 20, }} />} />
    </View>
    // </Provider>

  )
}
const styles = StyleSheet.create({
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
    left: 10,
    top: 10,
    flexDirection: 'row',
    backgroundColor: 'white',
    width: 185,
    padding: 6,
    borderRadius: 90
  },
  item: {
    height: 410,
    backgroundColor: 'red',
    marginHorizontal: 10,
    borderRadius: 30,
  },
  actionBar: {
    position: 'absolute',
    bottom: 10,
    left: 10
  },
  container: {
    position: 'relative',
    height: 428,
    marginTop: 15,
  }
})


export default PostList