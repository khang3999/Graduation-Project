import { View, Text, FlatList, StyleSheet, Image, ScrollView, Dimensions, TouchableOpacity, Pressable, Alert, TextInput, Modal } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import Carousel from 'react-native-reanimated-carousel';
import { database, get, onValue, ref, update } from '@/firebase/firebaseConfig';
import { types } from '@babel/core';
import { Divider, IconButton, MD3Colors, Menu, PaperProvider } from 'react-native-paper';
import ActionBar from '../actionBars/ActionBar';
import { formatDate } from '@/utils/commons';
import { AntDesign, FontAwesome6 } from '@expo/vector-icons';
import { countMatchingLocations, mergeWithRatio, slug, sortTourMatchingAtTourScreen } from '@/utils';
import { useHomeProvider } from '@/contexts/HomeProvider';
import { useTourProvider } from '@/contexts/TourProvider';
import { MultipleSelectList, SelectList } from 'react-native-dropdown-select-list';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { equalTo, orderByChild, query } from 'firebase/database';
import { router } from "expo-router";

const { width } = Dimensions.get('window');
const ITEM_HEIGHT = 270;
const TYPE = 1;
const TourList = () => {
  const {
    accountBehavior, setAccountBehavior,
    loadedDataAccount,
    dataCountries, setDataCountries

  }: any = useHomeProvider()
  const {
    dataTours, setDataTours,
    currentTourCount, setCurrentTourCount,
    newTourCount, setNewTourCount,
    isSearchingMode, setIsSearchingMode,
    modalVisible, setModalVisible,
    loadedTours, setLoadedTours,
    dataModalSelected, setDataModalSelected,
    selectedTour, setSelectedTour
  }: any = useTourProvider();

  const [indexVisibleMenu, setIndexVisibleMenu] = useState(-1);
  const [dataCities, setDataCities] = useState([])
  const [dataInput, setDataInput] = useState('') // Dữ liệu để sort(Lưu vào behavior khi bấm sort)
  const [selectedCountry, setSelectedCountry] = useState(null); // Dữ liệu để sort(Lưu vào behavior khi bấm sort)
  const [selectedCities, setSelectedCities] = useState([]); // Dữ liệu để sort(Lưu vào behavior khi bấm sort)

  // Mở menu theo ID
  const openMenu = (itemIndex: any) => {
    setIndexVisibleMenu(itemIndex)
  }
  // Đóng tất cả menu
  const closeMenu = () => {
    setIndexVisibleMenu(-1)
  };

  const handleSelecteCities = (val: any) => {
    setSelectedCities(val)
  }

  const handleTapOnSearchButton = async (dataInput: any, selectedCountry: any, selectedCities: any) => {
    if (!(dataInput === '' && selectedCountry === null && selectedCities.length === 0)) {
      setLoadedTours(false) // Load skeleton
      // Lấy id user
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
        const refTours = ref(database, 'tours/')
        const snapshot = await get(refTours);
        if (snapshot.exists()) {
          const dataToursJson = snapshot.val()
          // Chuyển đổi object thành array bang values cua js
          const jsonArrayTours = Object.values(dataToursJson)
          // Bước 1: Lấy mảng theo tiêu chí
          let matchingTour: any[] = []
          if (selectedCities && selectedCities.length > 0) { // Có chọn cities
            console.log("case1: selected cities");
            jsonArrayTours.forEach((tour: any) => {
              tour.match = 0
              // Tieu chi 1: co tat ca selectedCities trong tourLocation
              const listLocationIdOfTour = Object.keys(tour.locations).flatMap((country) => {
                return Object.keys(tour.locations[country])
              }); //["vn_1", 'jp_2']
              // Kiểm tra nội dung
              if (slug(tour.content).includes(slug(dataInput))) { // Đúng cả 2 case: không nhâp nội dung và nhập nội dung
                tour.match += 1
              }
              // Đếm city trùng
              const matchLocation = selectedCities.filter((cityID: any) => listLocationIdOfTour.includes(cityID)).length; // Đếm số phần tử trùng
              tour.match += matchLocation // cập nhật match
              // Push vào mảng
              if (tour.match >= 2) { // Nếu không nhập nội dung hoặc có nội dung thì được 1, thêm vị trí > 2
                matchingTour.push(tour)
              }
            })
          } else if (selectedCountry !== null) {// không chọn city chỉ chọn quốc gia
            console.log("case2");// Trùng nội dung và quốc gia mới add vào mảng

            jsonArrayTours.forEach((tour: any) => {
              tour.match = 0
              // Tieu chi 1: co tat ca selectedCities trong tourLocation
              const listCountriesId = Object.keys(tour.locations)//["avietnam", 'japan']
              // Kiểm tra nội dung
              if (slug(tour.content).includes(slug(dataInput))) {
                tour.match += 1
              }
              // console.log('check1',listCountriesId);
              // console.log('check1',selectedCountry);
              // Kiểm tra có quốc gia không
              if (listCountriesId.includes(selectedCountry.key)) {
                tour.match += 1
              }
              // Push vào mảng
              if (tour.match >= 2) {
                matchingTour.push(tour)
              }
            })
          } else { // Chỉ nhập input
            console.log("case3"); // trùng nội dung mới add vào
            jsonArrayTours.forEach((tour: any) => {
              tour.match = 0
              // Kiểm tra nội dung
              if (slug(tour.content).includes(slug(dataInput))) {
                tour.match += 1
                // Push vào mảng
                matchingTour.push(tour)
              }
            })
          }

          // Bước 2: Sort mảng
          sortTourMatchingAtTourScreen(matchingTour)
          // matchingTour.sort((tourA: any, tourB: any) => {
          //   // So sánh theo match trước
          //   if (tourB.match !== tourA.match) {
          //     return tourB.match - tourA.match; // Sắp xếp giảm dần theo match
          //   }
          //   // Nếu match bằng nhau, so sánh theo created_at
          //   return (tourB.created_at || 0) - (tourA.created_at || 0); // Sắp xếp giảm dần theo created_at
          // });
          // Bước 3: 
          setDataTours(matchingTour)
        } else {
          console.log("No data tour available");
        }
      }
      catch (error) {
        console.error("Error fetching tour data search at tour screen: ", error);
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
      setLoadedTours(true) // UnLoad skeleton
    } else {
      fetchTours()
    }
    // Đóng modal
    setModalVisible(!modalVisible)
  }

  // Cập nhật tour mới
  const handleReloadNewTours = () => {
    setIsSearchingMode(false)
    fetchTours()
  }

  // Reload màn hình tour
  const handleRefreshTourScreen = () => {
    setDataInput('')
    setSelectedCountry(null)
    setDataCities([])
    setIsSearchingMode(false)
    setDataModalSelected(null)
    fetchTours() // Tải lại tất cả tour
  }

  const handleSelecteCountry = (val: any) => {
    // Fetch city tương ứng tương ứng (chính)
    fetchCityByCountry(val)
    // Lưu lại quốc gia đang chọn ra biến thành phần 2.1. Chuyển val thành {key:'a', value:'b'} (để set giá trị mặc định có cũng được không cũng được) khi nào lưu default Option thì mở ra
    const country = dataCountries.find((country: any) => country.key === val);
    setSelectedCountry(country)
  }

  // Lấy tour lần đầu sau khi đã có dữ liệu của account
  useEffect(() => {
    if (loadedDataAccount && !isSearchingMode) {
      fetchTours();
    }
  }, [loadedDataAccount]);

  // Hàm phụ Fetch data cities theo quốc gia
  const fetchCityByCountry = async (countryId: any) => {
    try {
      const refCity = ref(database, `cities/${countryId}`)
      const snapshot = await get(refCity);
      if (snapshot.exists()) {
        const dataCityJson = snapshot.val()
        const dataCitiesArray: any = Object.entries(dataCityJson).flatMap(([region, cities]:any) => 
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

  // Hàm Fetch tour
  const fetchTours = async () => {
    // Load skeleton
    setLoadedTours(false)
    try {
      const refTours = ref(database, 'tours/')
      const toursQuery = query(refTours, orderByChild('view_mode'), equalTo(true));
      const snapshot = await get(toursQuery);
      if (snapshot.exists()) {
        const dataToursJson = snapshot.val()
        // console.log(dataToursJson)
        // Chuyển đổi object thành array
        const jsonArrayTours = Object.values(dataToursJson)
        // Ý tưởng: chuyển mảng data thành 2 mảng con và trộn (3 bước: tạo 2 mảng con, sort, trộn)
        //Bước 1: Phân loại bài viết thành 2 mảng
        const behaviorTours: any = [];
        const nonBehaviorTours: any = [];
        jsonArrayTours.forEach((tour: any) => {
          tour.match = 0
          const contentSlug = slug(tour.content)
          const behaviorContentSlug = slug(accountBehavior.content)
          const listLocationIdOfTour = Object.keys(tour.locations).flatMap((country) =>
            Object.keys(tour.locations[country])
          ); //["vn_1", 'jp_2']

          const listBehaviorLocation = accountBehavior.location ? accountBehavior.location : []

          // Điều kiện phân loại mảng
          if (contentSlug.includes(behaviorContentSlug)) {
            tour.match += 1
          }
          const countMatchingLocation = countMatchingLocations(listBehaviorLocation, listLocationIdOfTour)
          // const countMatchingLocation = listLocationIdOfTour.filter(locationId => listBehaviorLocation.includes(locationId)).length; // Đếm số phần tử trùng
          tour.match += countMatchingLocation // cập nhật match
          // Phân loại
          if (tour.match > 0) {
            behaviorTours.push(tour)
          } else {
            nonBehaviorTours.push(tour)
          }
        })
        // Bước 2: Sort
        // 2.1. Sort mảng theo behavior: match > fator > rating > like >created_at
        const behaviorToursSorted = sortTourMatchingAtTourScreen(behaviorTours)
        
        // 2.2. Sort mảng không match hành vi theo created_at
        nonBehaviorTours.sort((tourA: any, tourB: any) => {
          return tourB.created_at - tourA.created_at;
        })
        //Bước 3: Trộn mảng
        const mergedTours = mergeWithRatio(behaviorToursSorted, nonBehaviorTours, 2, 1)

        // SET DỮ LIÊU
        // 1. set mảng đã trộn cho dataTour
        setDataTours(mergedTours)
        // Set lại số lượng bài post đang hiển thị(Là 1 trong 2 điều kiện để không hiển thị button loadNewPosts
        setCurrentTourCount(jsonArrayTours.length)
        // UnLoad skeleton
        setLoadedTours(true)
      } else {
        console.log("No data tour available");
      }
    } catch (error) {
      console.error("Error fetching data tours: ", error);
    }

  }

  useEffect(() => {
    fetchTours()
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
        <Pressable style={styles.item} 
         onPress={() => {
          router.push({
            pathname: "/(profiles)/Tour",
            params: { initialIndex: 0 },
          });
          setSelectedTour([tour.item])
        }}
        >
          {/*Author*/}
          <View style={styles.authorContent}>
            <TouchableOpacity style={styles.avatarWrap}>
              <Image style={styles.avatar} source={require('@/assets/images/logo.png')}></Image>
            </TouchableOpacity>
            <View style={{justifyContent:'center', marginHorizontal: 4}}>
              <TouchableOpacity>
                <Text style={{fontWeight:'600'}} numberOfLines={1}>
                  {tour.item.author.fullname}
                </Text>
              </TouchableOpacity>
              <Text style={{fontStyle:'italic', fontSize:12}}>{formatDate(tour.item.created_at)}</Text>
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
            <Image style={styles.imageTour} source={{ uri: tour.item.thumbnail }}></Image>
          </View>

          {/* Button like, comment, save */}
          <ActionBar style={styles.actionBar} data={tour.item} type={TYPE}></ActionBar>
        </Pressable>
      </PaperProvider >
    )
  }
  return (
    <View style={styles.container}>
      <View style={{ flexDirection: 'row', position: 'relative' }}>
        <Text style={styles.textCategory}>Tour du lịch siêu hot</Text>
        {((currentTourCount != newTourCount) && (isSearchingMode == false)) && (
          <TouchableOpacity style={styles.loadNewTour} onPress={handleReloadNewTours}>  
            <FontAwesome6 name="newspaper" size={20} color="black" />
            <Text style={{ paddingLeft: 4, fontWeight: '500' }}>Có tour mới</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.refreshBtn} onPress={handleRefreshTourScreen}>
          <AntDesign name="reload1" size={22} color="black" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.filterBtn}
          onPress={() => setModalVisible(true)}
        >
          <AntDesign name="filter" size={22} color="black" />
        </TouchableOpacity>
      </View>

      {loadedTours ?
        <FlatList
          // scrollToOffset={}
          style={{ maxHeight: 580 }}
          data={dataTours}
          renderItem={tourItem}
          keyExtractor={(tour: any) => tour.id}
          // ItemSeparatorComponent={() => <View style={{ height: 20, }} />}
          // pagingEnabled
          >
        </FlatList>
        : <></>}


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
            </View>

          </View>
          {/* overplay */}
          <View style={styles.overPlay}></View>
        </View>
      </Modal>
    </View>
  )
}
const styles = StyleSheet.create({
  // Modal
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
  modalText: {
    margin: 10,
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
  },
  buttonSearch: {
    backgroundColor: '#6200ee',
    padding: 10,
    borderRadius: 5,
    margin: 10
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  buttonCancel: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
    margin: 10
  },
  overPlay: {
    backgroundColor: 'black',
    top: 0,
    height: '100%',
    width: '100%',
    position: 'absolute',
    opacity: 0.4,
    zIndex: 3
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
  loadNewTour: {
    flexDirection: 'row',
    position: 'absolute',
    left: "40%",
    borderRadius: 8,
    padding: 4,
    backgroundColor: 'grey',
    transformOrigin: 'center'
  },
  textCategory: {
    fontSize: 14,
    backgroundColor: '#f0f0f0',
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 10,
    fontWeight: '500',
    alignSelf: 'flex-start',
    elevation: 10
  },
  actionBar: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    zIndex: 3
  },
  imageTour: {
    height: ITEM_HEIGHT,
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
    height: 270,
    position: "relative",
    marginHorizontal: 10,
    marginBottom: 20,
    borderRadius: 30,
    elevation: 6
  },
  container: {
    position: 'relative',
  }
})
export default TourList