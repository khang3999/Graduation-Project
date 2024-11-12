import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Pressable, Modal, Alert, TextInput, Dimensions } from 'react-native'
import React, { useEffect, useImperativeHandle, useState } from 'react'
import { Divider, IconButton, MD3Colors, Menu, PaperProvider } from 'react-native-paper'
import { database, ref } from '@/firebase/firebaseConfig'
import { equalTo, get, orderByChild, query, update } from '@firebase/database'
import { useHomeProvider } from '@/contexts/HomeProvider'
import SkeletonPost from '@/components/skeletons/SkeletonPost'
import { formatDate } from '@/utils/commons'
import { AntDesign, FontAwesome6 } from '@expo/vector-icons'
import { countMatchingLocations, mergeWithRatio, slug } from '@/utils'
import { MultipleSelectList, SelectList } from 'react-native-dropdown-select-list'
import AsyncStorage from '@react-native-async-storage/async-storage'
import ActionBar from '../actionBars/ActionBar'
import Toast from 'react-native-toast-message-custom'

const { width } = Dimensions.get('window')


const PostList = () => {
  const TYPE = 0;
  const {
    dataPosts, setDataPosts,
    allLocationIdFromPost, setAllLocationIdFromPost,
    setPostIdCurrent,
    notifyNewPost,
    currentPostCount, setCurrentPostCount,
    newPostCount,
    accountBehavior, setAccountBehavior,
    loadedDataAccount, setLoadedDataAccount,
    loadedPosts, setLoadedPosts,
    loadedTours, setLoadedTours,
    modalVisible, setModalVisible,
    dataCountries, setDataCountries,
    isSearchingMode, setIsSearchingMode,
    dataModalSelected, setDataModalSelected,
    dataAccount
  }: any = useHomeProvider();


  // Lưu giá trị các thành phố dựa trên quốc gia đang chọn
  const [dataCities, setDataCities] = useState([])
  const [selectedCountry, setSelectedCountry] = useState(null); // Dữ liệu để sort(Lưu vào behavior khi bấm sort)
  const [selectedCities, setSelectedCities] = useState([]); // Dữ liệu để sort(Lưu vào behavior khi bấm sort)
  const [dataInput, setDataInput] = useState('') // Dữ liệu để sort(Lưu vào behavior khi bấm sort)
  const [selectedCitiesTemp, setSelectedCitiesTemp] = useState([]); // Khi nào set default thì xài

  // ĐỊNH NGHĨA CÁC HÀM 
  // Hàm search . Khi tap vào button search thì lưu giá trị các biến đã chọn qua 1 biến khác để hiển thị ở home, và set lại giá trị default cho các biến đó
  const handleTapOnSearchButton = async (dataInput: any, selectedCountry: any, selectedCities: any) => {
    if (!(dataInput === '' && selectedCountry === null && selectedCities.length === 0)) {
      setLoadedTours(false) // Load skeleton tour section
      setLoadedPosts(false) // Load skeleton posts list
      const userId = await AsyncStorage.getItem("userToken")
      // Chuyển sang chế độ searching
      setIsSearchingMode(true)
      // Ghi lên firebase content và location không ghi quốc gia
      const refBehaviors = ref(database, `accounts/${userId}/behavior`)
      const dataUpdate = {
        'content': dataInput,
        'location': selectedCities.length > 0 ? selectedCities : null
      }
      await update(refBehaviors, dataUpdate);
      // Đọc xuống các mảng các bài viết theo tiêu chí search 
      try {
        const refPosts = ref(database, 'posts/')
        const snapshot = await get(refPosts);
        if (snapshot.exists()) {
          const dataPostsJson = snapshot.val()
          // Chuyển đổi object thành array bang values cua js
          const jsonArrayPosts = Object.values(dataPostsJson)
          // Bước 1: Lấy mảng theo tiêu chí
          let matchingPost: any[] = []
          if (selectedCities && selectedCities.length > 0) { // Chọn nhiều city
            console.log("case1"); // Trùng nội dung và thành phố thì mới add vào mảng
            jsonArrayPosts.forEach((post: any) => {
              post.match = 0
              // Tieu chi 1: co tat ca selectedCities trong postLocation
              const listLocationIdOfPost = Object.keys(post.locations).flatMap((country) => {
                return Object.keys(post.locations[country])
              }); //["vn_1", 'jp_2']
              // Kiểm tra nội dung
              if (slug(post.content).includes(slug(dataInput))) { // Đúng cả 2 case: không nhâp nội dung và nhập nội dung
                post.match += 1
              }
              // Đếm city trùng
              const matchLocation = selectedCities.filter((cityID: any) => listLocationIdOfPost.includes(cityID)).length; // Đếm số phần tử trùng
              post.match += matchLocation // cập nhật match
              // Push vào mảng
              if (post.match >= 2) { // Nếu không nhập nội dung hoặc có nội dung thì được 1, thêm vị trí > 2
                matchingPost.push(post)
              }
            })
          } else if (selectedCountry !== null) { // không chọn city chỉ chọn quốc gia
            console.log("case2");// Trùng nội dung và quốc gia mới add vào mảng

            jsonArrayPosts.forEach((post: any) => {
              post.match = 0
              // Tieu chi 1: co tat ca selectedCities trong postLocation
              const listCountriesId = Object.keys(post.locations)//["avietnam", 'japan']
              // Kiểm tra nội dung
              if (slug(post.content).includes(slug(dataInput))) {
                post.match += 1
              }
              // console.log('check1',listCountriesId);
              // console.log('check1',selectedCountry);
              // Kiểm tra có quốc gia không
              if (listCountriesId.includes(selectedCountry.key)) {
                post.match += 1
              }
              // Push vào mảng
              if (post.match >= 2) {
                matchingPost.push(post)
              }
            })
          } else { // Tìm kiếm theo nội dung 
            console.log("case3"); // trùng nội dung mới add vào
            jsonArrayPosts.forEach((post: any) => {
              post.match = 0
              // Kiểm tra nội dung
              if (slug(post.content).includes(slug(dataInput))) {
                post.match += 1
                // Push vào mảng
                matchingPost.push(post)
              }
            })
          }
          // Bước 2: Sort mảng
          matchingPost.sort((postA: any, postB: any) => {
            // So sánh theo match trước
            if (postB.match !== postA.match) {
              return postB.match - postA.match; // Sắp xếp giảm dần theo match
            }
            // Nếu match bằng nhau, so sánh theo created_at
            return (postB.created_at || 0) - (postA.created_at || 0); // Sắp xếp giảm dần theo created_at
          });
          // Bước 3: 
          setDataPosts(matchingPost)
        } else {
          console.log("No data post available");
        }
      } catch (error) {
        console.error("Error fetching post data search: ", error);
      }
      // Luu gia tri qua bien khacs
      const dataOfModalSelected = {
        'input': dataInput,
        'country': selectedCountry ? selectedCountry.value : '', // Chỉ cần lưu tên để hiển thị
        'cities': selectedCities
      }
      setDataModalSelected(dataOfModalSelected)
      // clear data các biến select 
      setDataInput('')
      setSelectedCountry(null)
      setSelectedCities([])
      setDataCities([])
      setLoadedPosts(true) // UnLoad skeleton
      setLoadedTours(true) // UnLoad skeleton
    } else {
      fetchPosts()
    }
    // Đóng modal
    setModalVisible(!modalVisible)
  }

  // Hàm chọn nhiều thành phố 
  const handleSelecteCities = (val: any) => {
    // Lưu lại id các city được chọn
    setSelectedCities(val)
  }
  // Thực hiện đổi từ mảng ['vn_1', 'jp_2'] => [key:'vn_1', value:'Ha noi'] mỗi khi chọn phần tử mới
  // useEffect(() => {
  //   console.log(selectedCitiesTemp);
  //   const temp: any = selectedCitiesTemp.map((cityTemp) => {
  //     const cityNew: any = dataCities.find((city: any) => city.key === cityTemp);
  //     if (cityNew) {
  //       return { key: cityNew.key, value: cityNew.value }; // Sử dụng cityNew để lấy giá trị
  //     }
  //     return null;
  //   }).filter(city => city !== null);
  //   console.log(temp);
  //   setSelectedCities(temp)
  // }, [selectedCitiesTemp])

  /// Log
  // useEffect(() => {
  //   console.log('input', dataInput);
  //   console.log(selectedCountry)
  //   console.log('cities',selectedCities);

  // }, [selectedCities, dataInput, selectedCountry])

  // Hàm chọn một quốc gia: thực hiện 2 việc: 1. Fetch data city, 2. Lưu quốc gia đó ra biến thành phần {key:'a', value:'b'}
  const handleSelecteCountry = (val: any) => {
    // Fetch city tương ứng tương ứng (chính)
    fetchCityByCountry(val)
    // Lưu lại quốc gia đang chọn ra biến thành phần 2.1. Chuyển thành {key:'a', value:'b'} (để set giá trị mặc định có cũng được không cũng được) khi nào lưu default Option thì mở ra
    const country = dataCountries.find((country: any) => country.key === val);
    setSelectedCountry(country)
    // Set giá trị đang chọn cho list (Chính)
    // console.log('valCountry', country);
    // setSelectedCitiesTemp([])
    // setSelectedCountry(val)
  }

  // Fetch data cities theo quốc gia
  const fetchCityByCountry = async (countryId: any) => {
    try {
      const refCity = ref(database, `cities/${countryId}`)
      const snapshot = await get(refCity);
      if (snapshot.exists()) {
        const dataCityJson = snapshot.val()
        const dataCitiesArray: any = Object.entries(dataCityJson).flatMap(([region, cities]: any) =>
          Object.entries(cities).map(([cityCode, cityInfo]: any) => ({
            key: cityCode,
            value: cityInfo.name
          }))
        );
        setDataCities(dataCitiesArray)
      } else {
        console.log("No data city available");
      }
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  }

  // Hàm lấy các bài viết khi có tương tác
  const fetchPosts = async () => {
    setLoadedPosts(false)
    try {
      const refPosts = ref(database, 'posts/')
      const postsQuery = query(refPosts, orderByChild('view_mode'), equalTo(true));
      const snapshot = await get(postsQuery);
      if (snapshot.exists()) {
        const dataPostsJson = snapshot.val()
        // Chuyển đổi object thành array bang values cua js
        const jsonArrayPosts = Object.values(dataPostsJson)

        // Ý tưởng: chuyển mảng data thành 2 mảng con và trộn (3 bước: tạo 2 mảng con, sort, trộn)
        //Bước 1: Phân loại bài viết thành 2 mảng
        const behaviorPosts: any = [];
        const nonBehaviorPosts: any = [];
        jsonArrayPosts.forEach((post: any) => {
          post.match = 0 // Tạo lại giá trị ban đầu
          const contentSlug = slug(post.content)
          const behaviorContentSlug = slug(accountBehavior.content)
          const listLocationIdOfPost = Object.keys(post.locations).flatMap((country) =>
            Object.keys(post.locations[country])
          ); //["vn_1", 'jp_2']
          const listBehaviorLocation = accountBehavior.location ? accountBehavior.location : []
          // Điều kiện phân loại mảng: Trùng content  + 1, đếm match hành vi + match
          if (contentSlug.includes(behaviorContentSlug)) {
            post.match += 1
          }
          const countMatchingLocation = countMatchingLocations(listBehaviorLocation, listLocationIdOfPost)
          // const countMatchingLocation = listLocationIdOfPost.filter(locationId => listBehaviorLocation.includes(locationId)).length; // Đếm số phần tử trùng
          post.match += countMatchingLocation // cập nhật match

          // Phân loại 
          if (post.match > 0) {
            behaviorPosts.push(post)
          } else {
            nonBehaviorPosts.push(post)
          }
        });
        // Bước 2: Sort
        //2.1. Sort mảng theo behavior: match > created_at
        behaviorPosts.sort((postA: any, postB: any) => {
          // So sánh theo match trước
          if (postB.match !== postA.match) {
            return postB.match - postA.match; // Sắp xếp giảm dần theo match
          }
          // Nếu match bằng nhau, so sánh theo created_at
          return postB.created_at - postA.created_at; // Sắp xếp giảm dần theo created_at
        });
        //2.2. Sort mảng không match hành vi theo created_at
        nonBehaviorPosts.sort((postA: any, postB: any) => {
          return postB.created_at - postA.created_at;
        })
        //Bước 3: Trộn mảng
        const mergedPosts = mergeWithRatio(behaviorPosts, nonBehaviorPosts, 2, 1)
        // mergedPosts.map((post) => console.log(post.id));
        // SET DỮ LIÊU
        //set mảng đã trộn cho dataPost
        setDataPosts(mergedPosts)
        // setDataPosts(jsonArrayPosts)
        // Set lại số lượng bài post đang hiển thị(Là 1 trong 2 điều kiện để không hiển thị button loadNewPosts
        setCurrentPostCount(jsonArrayPosts.length)
        // Set loadedTourHome
        setLoadedPosts(true)
        setLoadedTours(true)
      } else {
        console.log("No data post available");
      }
    } catch (error) {
      console.error("Error fetching post data: ", error);
    }
    setDataModalSelected(null)
  }
  // Hàm reload bài viết
  const handleReloadNewPost = () => {
    setIsSearchingMode(false)
    fetchPosts(); // Tải lại bài viết
  };

  // Hàm reload trang home
  const handleReloadHomeScreen = () => {
    setLoadedTours(false)
    setDataInput('')
    setSelectedCountry(null)
    setDataCities([])
    setIsSearchingMode(false)
    setDataModalSelected(null)
    fetchPosts(); // Tải lại bài viết
  };

  /// Các Hook
  // Lấy post lần đầu sau khi đã có dữ liệu của account
  useEffect(() => {
    if (loadedDataAccount && !isSearchingMode) {
      // console.log(loadedDataAccount);
      fetchPosts();
    }
  }, [loadedDataAccount, dataAccount]);


  // Xử lý sự kiện khi item hiển thị thay đổi
  const onViewableItemsChanged = ({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      // Xử lí lưu bài viết đang hiển thị ra biến toàn cục để đổ list tour theo chủ đề của bài viết
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
        < PaperProvider >
          <Pressable style={styles.item} onPress={() => console.log(post.index + "tap")
          }>
            {/*Author*/}
            <View style={styles.authorContent}>
              <TouchableOpacity style={styles.avatarWrap}>
                <Image style={styles.avatar} source={{ uri: post.item.author.avatar }}></Image>
              </TouchableOpacity>
              <View style={{ justifyContent: 'center', marginHorizontal: 4 }}>
                <TouchableOpacity>
                  <Text style={{ fontWeight: '600' }} numberOfLines={1}>
                    {post.item.author.fullname}
                  </Text>
                </TouchableOpacity>
                <Text style={{ fontStyle: 'italic', fontSize: 12 }}>{formatDate(post.item.created_at)}</Text>
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
                    <TouchableOpacity key={location.id}>
                      <Menu.Item title={location.name} titleStyle={styles.itemLocation} dense={true}></Menu.Item>
                      <Divider />
                    </TouchableOpacity>
                  )
                })
                }
              </Menu>
              {/* </Provider> */}
            </View>
            <View style={styles.imagePost}>
              <Image style={styles.imagePost} source={{ uri: post.item.thumbnail }}></Image>
            </View>

            {/* Button like, comment, save */}
            <ActionBar style={styles.actionBar} data={post.item} type={TYPE}></ActionBar>
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

        {((currentPostCount != newPostCount) && (isSearchingMode == false)) && (
          <TouchableOpacity style={styles.loadNewPost} onPress={handleReloadNewPost}>
            <FontAwesome6 name="newspaper" size={20} color="black" />
            <Text style={styles.iconPost}>Có bài viết mới</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.filterBtn}
          onPress={() => setModalVisible(true)}>
          <AntDesign name="filter" size={22} color="black" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.refreshBtn} onPress={handleReloadHomeScreen}>
          <AntDesign name="reload1" size={22} color="black" />
        </TouchableOpacity>
      </View>

      {loadedPosts ?
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
        :
        <SkeletonPost></SkeletonPost>}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          Alert.alert('Modal has been closed.');
          setModalVisible(!modalVisible);
        }}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Tìm kiếm</Text>
            <View style={{ width: 350 }}>
              <TextInput
                style={{ borderWidth: 1, borderRadius: 10, paddingHorizontal: 8 }}
                placeholder="Tìm kiếm với nội dung"
                onChangeText={(str) => setDataInput(str)} />
              <Text style={{ marginVertical: 8, fontWeight: '500' }}>Quốc gia:</Text>
              <SelectList
                setSelected={(val: any) => handleSelecteCountry(val)}
                data={dataCountries}
                maxHeight={120}
                save="key"
                placeholder='Chọn quốc gia'
              // onSelect={(val: any)=>{console.log(val)}}
              // defaultOption={selectedCountry}
              />
              <Text style={{ marginVertical: 8, fontWeight: '500' }}>Tỉnh/Thành phố:</Text>
              <MultipleSelectList
                setSelected={(val: any) => handleSelecteCities(val)}
                data={dataCities}
                save="key"
                // onSelect={() => alert(selectedMultiList)}
                label="Categories"
                notFoundText="No data"
                placeholder='Chọn tỉnh/thành phố'
                maxHeight={230}
              />
            </View>
            <View style={{ flexDirection: 'row', position: 'absolute', bottom: 0 }}>
              <Pressable
                style={styles.buttonSearch}
                onPress={() => handleTapOnSearchButton(dataInput, selectedCountry, selectedCities)}>
                <Text style={styles.textStyle}>Search</Text>
              </Pressable>
              <Pressable
                style={styles.buttonCancel}
                onPress={() => setModalVisible(!modalVisible)}>
                <Text style={styles.textStyle}>Cancel</Text>
              </Pressable>
              {/* Clear and refesh button
              <TouchableOpacity style={styles.refreshBtn} onPress={handleReloadHomePage}>
                <AntDesign name="reload1" size={22} color="grey" />
              </TouchableOpacity> */}
            </View>

          </View>

          <View style={styles.overPlay}></View>

        </View>
      </Modal>
    </View>
  )
}
const styles = StyleSheet.create({
  // Modal
  overPlay: {
    backgroundColor: 'black',
    top: 0,
    height: '100%',
    width: '100%',
    position: 'absolute',
    opacity: 0.4,
    zIndex: 3
  },
  buttonLoadNewPost: {
    display: 'flex',
    backgroundColor: 'white',
    flexDirection: 'row',
    left: '40%',
    position: 'absolute',
    zIndex: 100,
    elevation: 8,
    padding: 4,
    borderRadius: 8
  },
  // containerModal: {
  //   paddingTop: 10,
  //   flex: 1,
  //   backgroundColor: 'white'
  // },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    paddingTop: 10,
    paddingBottom: 60,
    width: width,
    alignItems: 'center',
    zIndex: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonFilter: {
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: '#ECECEC',
    borderRadius: 6,
    right: 10,
    top: 100,
    elevation: 10,
    padding: 10,
  },
  buttonOpen: {
    backgroundColor: '#F194FF',
  },
  buttonClose: {
    backgroundColor: '#2196F3',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  buttonSearch: {
    backgroundColor: '#6200ee',
    padding: 10,
    borderRadius: 5,
    margin: 10
  },
  buttonCancel: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
    margin: 10
  },
  modalText: {
    margin: 10,
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
  },
  refreshBtn: {
    position: 'absolute',
    backgroundColor: '#b7f4c2',
    right: 50,
    top: 0,
    padding: 4,
    borderRadius: 5,
  },
  filterBtn: {
    position: 'absolute',
    backgroundColor: '#b9e0f7',
    right: 10,
    top: 0,
    padding: 4,
    borderRadius: 5,
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
    maxWidth: 200,
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
    // width: 220,
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