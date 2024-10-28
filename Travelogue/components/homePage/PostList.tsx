import { View, Text, StyleSheet, FlatList, Image, Button, Touchable, TouchableOpacity, Pressable, RefreshControl } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import ActionBar from '../ActionBar'
import Icon from 'react-native-vector-icons/FontAwesome'
import { DefaultTheme, Divider, IconButton, MD3Colors, Menu, PaperProvider, Provider } from 'react-native-paper'
import { database, ref } from '@/firebase/firebaseConfig'
import { get, off, onValue } from '@firebase/database'
import { useHomeProvider } from '@/contexts/HomeProvider'
import SkeletonPost from '@/components/skeletons/SkeletonPost'
import { formatDate } from '@/utils/commons'
import { AntDesign, FontAwesome6 } from '@expo/vector-icons'

const PostList = () => {

  const {
    dataPosts,
    setAllLocationIdFromPost,
    setPostIdCurrent,
    notifyNewPost,
    setDataPosts,
    currentPostCount,
    setCurrentPostCount,
    newPostCount,
    searching,
    setSearching,
    behavior,
    setBehavior }: any = useHomeProvider();

  // Hàm handleClick load new post button
  // Hàm để tải bài viết từ Firebase
  // useEffect để tải dữ liệu ban đầu

  const fetchPosts = async () => {
    try {
      const refPosts = ref(database, 'posts/')
      const snapshot = await get(refPosts);
      if (snapshot.exists()) {
        const dataPostsJson = snapshot.val()
        // Chuyển đổi object thành array bang values cua js
        const jsonArrayPosts = Object.values(dataPostsJson).sort((a: any, b: any) => b.created_at - a.created_at)
        // Chuyển mảng data thành 2 mảng con : theo behavior và không theo behavior và thực hiện trộn 2 mảng
        // Phân loại bài viết thành 2 mảng dựa trên behavior
        const behaviorPosts = [];
        const nonBehaviorPosts = [];

        jsonArrayPosts.forEach((post:any) => {
          // const locationIds = post. // TỚI ĐÂY RỒI LÀM TIẾP NHÉ :((((((((((((((((((()))))))))))))))))))
          if (/* Điều kiện behavior */ post.behavior) {
            behaviorPosts.push(post);
          } else {
            nonBehaviorPosts.push(post);
          }
        });


        // 1.Gọi hàm trộn 2 mảng
        // 2. set mảng đã trộn cho dataPost
        // Tạm thời xếp theo thời gian
        setDataPosts(jsonArrayPosts)
        // Set lại số lượng bài post đang hiển thị
        setCurrentPostCount(jsonArrayPosts.length)
      } else {
        console.log("No data available");
      }
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  }
  // Gọi lần đầu
  useEffect(() => {
    fetchPosts();
  }, []);

  // Hàm reload bài viết
  const handleReloadNewPost = () => {
    fetchPosts(); // Tải lại bài viết
  };

  // Hàm reload bài viết
  const handleReloadHomePage = () => {
    setSearching(false)
    fetchPosts(); // Tải lại bài viết
  };

  // Xử lý sự kiện khi item hiển thị thay đổi
  const onViewableItemsChanged = ({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      // Xử lí lưu bìa viết đang hiển thị ra biến toàn cục để đổ list tour theo chủ đề của bài viết
      const locations = viewableItems[0].item.locations
      // Lấy tất cả các locationId <=> id của tỉnh thành trong từng bài post ['vn_1', 'jp_1']
      const allLocationIds: string[] = Object.keys(locations).flatMap((country) =>
        Object.keys(locations[country])
      );
      setPostIdCurrent(viewableItems[0].item.id)
      // setAllLocationNameFromPost(allLocationNames) // Set mảng name của location để tính điểm tour tour phù hợp
      setAllLocationIdFromPost(allLocationIds) // Set mảng id của location để lấy tour phù hợp
    }
  };

  // Cài đặt để FlatList xác định các mục hiển thị
  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50, // Chỉ định rằng item phải hiển thị ít nhất 50% để được coi là visible
  };

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
      <View key={post.item.id}>
        {/* {loadingPost && (<SkeletonPost></SkeletonPost>)} */}
        < PaperProvider >
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
        </PaperProvider>
      </View>
    )
  }

  // VIEW
  return (
    <View style={styles.container}>
      <View style={styles.titlePostContainer}>
        <Text style={styles.textCategory}>Những bài viết mới</Text>

        {/* {((currentPostCount != newPostCount) && (searching == false)) && ( */}
        <TouchableOpacity style={styles.loadNewPost} onPress={handleReloadNewPost}>
          <FontAwesome6 name="newspaper" size={20} color="black" />
          <Text style={styles.iconPost}>Có bài viết mới</Text>
        </TouchableOpacity>
        {/* )} */}

        <TouchableOpacity style={styles.refreshBtn} onPress={handleReloadHomePage}>
          <AntDesign name="reload1" size={22} color="grey" />
        </TouchableOpacity>
      </View>

      <FlatList
        showsVerticalScrollIndicator={false}
        data={dataPosts}
        renderItem={postItem}
        keyExtractor={(post: any) => post.id}
        contentContainerStyle={{}}
        // ItemSeparatorComponent={() => <View style={{ height: 20 }} />} // Space between item
        pagingEnabled //Scroll to next item
        onViewableItemsChanged={onViewableItemsChanged} // Theo dõi các mục hiển thị
        viewabilityConfig={viewabilityConfig} // Cấu hình cách xác định các mục hiển thị
      />
    </View>
  )
}
const styles = StyleSheet.create({
  refreshBtn: {
    position: 'absolute',
    right: 30,
    top: 4,
  },
  iconPost: {
    paddingLeft: 4,
    fontWeight: '500'
  },
  loadNewPost: {
    flexDirection: 'row',
    position: 'absolute',
    left: "40%",
    borderRadius: 8,
    padding: 4,
    backgroundColor: 'grey',
    transformOrigin: 'center'
  },
  titlePostContainer: {
    flexDirection: 'row'
  },
  textCategory: {
    marginBottom: 10,
    fontSize: 14,
    backgroundColor: '#f0f0f0',
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontWeight: '500',
    alignSelf: 'flex-start',
    elevation: 10
  },
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
    marginBottom: 10,
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
    height: 458,
    marginTop: 4,
  }
})


export default PostList