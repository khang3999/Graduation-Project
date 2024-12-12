import { View, Text, FlatList, StyleSheet, Image, ScrollView, Dimensions, TouchableOpacity, Pressable, Alert, TextInput, Modal } from 'react-native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import Carousel from 'react-native-reanimated-carousel';
import { database, get, onValue, ref, update } from '@/firebase/firebaseConfig';
import { types } from '@babel/core';
import { Badge, Divider, IconButton, MD3Colors, Menu, PaperProvider } from 'react-native-paper';
import ActionBar from '../actionBars/ActionBar';
import { formatDate } from '@/utils/commons';
import { AntDesign, Entypo, FontAwesome, FontAwesome6 } from '@expo/vector-icons';
import { countMatchingLocations, mergeWithRatio, slug, sortTourAtTourScreen } from '@/utils';
import { useHomeProvider } from '@/contexts/HomeProvider';
import { useTourProvider } from '@/contexts/TourProvider';
import { MultipleSelectList, SelectList } from 'react-native-dropdown-select-list';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { equalTo, orderByChild, query } from 'firebase/database';
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import LottieView from 'lottie-react-native';
import { useAccount } from '@/contexts/AccountProvider';

const { width } = Dimensions.get('window');
const ITEM_HEIGHT = 270;
const TYPE = 1;
const TourList = () => {
  const {
    accountBehavior, setAccountBehavior,
    dataAccount,
    loadedDataAccount,
    dataCountries, setDataCountries,
  }: any = useHomeProvider()
  const {
    dataTours, setDataTours,
    currentTourCount, setCurrentTourCount,
    newTourCount, setNewTourCount,
    isSearchingMode, setIsSearchingMode,
    loadedTours, setLoadedTours,
    dataModalSelected, setDataModalSelected,
    selectedTour, setSelectedTour,
    selectedTypeSearch,
    dataNewTourList, setDataNewTourList
  }: any = useTourProvider();

  const [indexVisibleMenu, setIndexVisibleMenu] = useState(-1);
  const [dataCities, setDataCities] = useState([])
  const [dataInput, setDataInput] = useState('') // Dữ liệu để sort(Lưu vào behavior khi bấm sort)
  const [selectedCountry, setSelectedCountry] = useState(null); // Dữ liệu để sort(Lưu vào behavior khi bấm sort)
  const [selectedCities, setSelectedCities] = useState([]); // Dữ liệu để sort(Lưu vào behavior khi bấm sort)
  const [modalNewToursVisible, setModalNewToursVisible] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [modalNewPostVisible, setModalNewPostVisible] = useState(false);
  const [dataNewTours, setDataNewTours] = useState([]); // Chứa các bài viết mới đc thêm trên firebase
  const [reloadScreen, setReloadScreen] = useState(false)
  const { selectedCityId, content } = useLocalSearchParams()
  const { setSearchedAccountData }: any = useAccount();



  const [isLongPress, setIsLongPress] = useState(false);

  const handlePressOnItemTour = (tourId: any) => {
    if (!isLongPress) {
      router.push({
        pathname: "/tourDetail",
        params: { tourId: tourId },
      });
    }
    // Reset trạng thái sau khi nhấn
    setIsLongPress(false);
  };

  const handleLongPressOnItemTour = () => {
    setIsLongPress(true); // Đánh dấu rằng đã giữ lâu
    // Alert.alert('Long Pressed!');
  };


  const dataTypeSearch = [
    { key: 1, value: 'Mặc định' },
    { key: 2, value: 'Thích nhiều nhất' },
    { key: 3, value: 'Đánh giá tốt nhất' }
  ]
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

  const handleTapOnSearchButton = async (dataTours: any, dataInput: any, selectedCountry: any, selectedCities: any) => {
    if (!(dataInput === '' && selectedCountry === null && selectedCities.length === 0)) {
      setLoadedTours(false) // Load skeleton
      // Lấy id user
      const userId = await AsyncStorage.getItem("userToken")
      // Chuyển sang chế độ searching
      // setIsSearchingMode(true)
      // Ghi lên firebase content và location không ghi quốc gia
      const refBehaviors = ref(database, `accounts/${userId}/behavior`)
      const dataUpdate = {
        'content': dataInput ? dataInput : '',
        'location': selectedCities.length > 0 ? selectedCities : null
      }
      await update(refBehaviors, dataUpdate);
      // Đọc xuống các mảng các bài viết theo tiêu chí search 
      // try {
      // const refTours = ref(database, 'tours/')
      // const snapshot = await get(refTours);
      if (dataTours) {
        // const dataToursJson = snapshot.val()
        // Chuyển đổi object thành array bang values cua js
        // const jsonArrayTours = Object.values(dataToursJson)
        // Bước 1: Lấy mảng theo tiêu chí
        let matchingTour: any[] = []

        if (selectedCities && selectedCities.length > 0) { // Có chọn cities
          console.log("case1: selected cities");
          dataTours.forEach((tour: any) => {
            tour.match = 0 // Khởi tạo lại match

            // Tiêu chí 1: Nội dung
            let matchingContent = 0
            const contentOfTourSlug = slug(tour.content + tour.hashtags)
            if (contentOfTourSlug.includes(slug(dataInput))) { // Đúng cả 2 case khi dataInput: không nhâp nội dung và nhập nội dung, vd: nếu nhập content thì phải tìm đúng theo content mới update match, còn không nhập content thì mặc định luôn đúng vì dataInput là ''
              matchingContent = 1 // Điều kiện để push vào mảng
              tour.match -= 1   // Điều kiện để sắp xếp khi đã push vào mảng
            }

            // Tiêu chí 2: Địa điểm (Mã thành phố)
            const listLocationIdOfTour = Object.keys(tour.locations).flatMap((country) => {
              return Object.keys(tour.locations[country])
            }); //["vn_1", 'jp_2']
            // Đếm độ lệch nếu lệch ít thì ưu tiên hơn
            // Cập nhật độ lệch của bài viết so với tiêu chí
            const matchingLocation = countMatchingLocations(selectedCities, listLocationIdOfTour)
            const closestValue = Math.abs(matchingLocation - selectedCities.length);
            tour.match += closestValue // cập nhật match

            // Push vào mảng
            if (matchingContent > 0 && matchingLocation > 0) { //PHẢI trùng cả nội dung và vị trí mới push vì đây là phần tìm kiếm
              matchingTour.push(tour)
            }
          })
        } else if (selectedCountry !== null) {// Tìm theo quốc gia: không kiểm tra đã chọn city chưa vì đã check chọn city ở if trước rồi
          console.log("case2");// Trùng nội dung và quốc gia mới add vào mảng
          dataTours.forEach((tour: any) => {
            tour.match = 0 // Khởi tạo lại match

            // Tiêu chí 1: Nội dung
            let matchingContent = 0
            const contentOfTourSlug = slug(tour.content + tour.hashtags)
            if (contentOfTourSlug.includes(slug(dataInput))) {// Đúng cả 2 case khi dataInput: không nhâp nội dung và nhập nội dung, vd: nếu nhập content thì phải tìm đúng theo content mới update match, còn không nhập content thì mặc định luôn đúng vì dataInput là ''
              matchingContent = 1
              tour.match -= 1
            }

            // Tieu chi 2: tim nhung bai post nào cho chứa mã quoc gia
            let matchingLocation = 0
            const listCountriesIdOfTour = Object.keys(tour.locations)//["avietnam", 'japan']
            // Kiểm tra có quốc gia không
            if (listCountriesIdOfTour.includes(selectedCountry.key)) {
              // Đếm độ lệch càng ít thì càng chính xác
              matchingLocation = 1
              const closestValue = listCountriesIdOfTour.length;
              tour.match += closestValue
            }
            // Push vào mảng
            if (matchingContent > 0 && matchingLocation > 0) {
              matchingTour.push(tour)
            }
          })
        } else { // Chỉ nhập input
          console.log("case3"); // trùng nội dung mới add vào
          dataTours.forEach((tour: any) => {
            tour.match = 0
            // Kiểm tra nội dung
            const contentOfTourSlug = slug(tour.content + tour.hashtags)
            if (contentOfTourSlug.includes(slug(dataInput))) {
              tour.match -= 1
              // Push vào mảng
              matchingTour.push(tour)
            }
          })
        }

        // Bước 2: Sort mảng
        sortTourAtTourScreen(matchingTour, selectedTypeSearch.current)
        // Bước 3: Set data
        setDataTours(matchingTour)
      } else {
        console.log("No data tours");
      }
      // }
      // catch (error) {
      //   console.error("Error fetching tour data search at tour screen: ", error);
      // }

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
      setDataInput('')
      setSelectedCountry(null)
      setSelectedCities([])
      setDataCities([])
      fetchTours()
    }
    // Đóng modal
    setModalVisible(false)
  }

  // Hàm đóng modal search
  const handleCloseModalSearch = () => {
    setDataInput('')
    setSelectedCountry(null)
    setSelectedCities([])
    setDataCities([])
    // Đóng modal search
    setModalVisible(!modalVisible)
  }

  // Cập nhật tour mới
  const handleReloadNewTours = () => {
    // setIsSearchingMode(false)
    fetchTours()
  }

  // Reload màn hình tour
  const handleRefreshTourScreen = () => {
    // // setSelectedTypeSearch(1)
    setDataInput('')
    setSelectedCountry(null)
    setDataCities([])
    selectedTypeSearch.current = 1
    setDataModalSelected(null)
    setReloadScreen(true)

    // fetchTours() // Tải lại tất cả tour
    // // setIsSearchingMode(false)
  }

  useEffect(() => {
    if (reloadScreen) {
      fetchTours()
      setReloadScreen(false)
    }
  }, [reloadScreen])

  const handleSelecteCountry = (val: any) => {
    // Fetch city tương ứng tương ứng (chính)
    fetchCityByCountry(val)
    // Lưu lại quốc gia đang chọn ra biến thành phần 2.1. Chuyển val thành {key:'a', value:'b'} (để set giá trị mặc định có cũng được không cũng được) khi nào lưu default Option thì mở ra
    const country = dataCountries.find((country: any) => country.key === val);
    // setSelectedCountry(country)
    setSelectedCountry(country)
  }

  const handleTapOnLocationInMenu = async (selectedCityId: any, selectedCountryId: any) => {
    // Update hành vi lên firebase
    const userId = dataAccount.id
    // 1. Lưu lên firebase
    const refBehavior = ref(database, `accounts/${userId}/behavior`);
    const dataUpdate = {
      content: "",
      location: [selectedCityId],
    };
    await update(refBehavior, dataUpdate);
    router.push({
      pathname: "/gallery",
      params: { idCity: selectedCityId, idCountry: selectedCountryId },
    });
  }


  useFocusEffect(
    useCallback(() => {
      setModalNewPostVisible(false)
      setModalVisible(false);
      if (selectedCityId) {
        console.log('have param 1111', selectedCityId);
        if (dataTours.length === 0) {
          handleTapOnSearchButton(dataNewTourList, content, null, [selectedCityId])
        } else {
          handleTapOnSearchButton(dataTours, content, null, [selectedCityId])

        }
      } else {
        // Kiểm tra khi màn hình focus và cả 2 biến đều có dữ liệu
        if (dataAccount && loadedDataAccount) {
          console.log("tour focus");
          // Clear data
          setDataInput('')
          setSelectedCountry(null)
          setSelectedCities([])
          setDataCities([])
          selectedTypeSearch.current = 1
          fetchTours(); // Gọi fetchTours
          // setIsSearchingMode(true)
          //setHasFetched(true); // Đánh dấu đã fetch để tránh gọi lại
        }
      }

      return () => {
        console.log('Screen is unfocused');
      };
    }, [loadedDataAccount, selectedCityId, content]) // Cập nhật khi các giá trị này thay đổi
  );

  // Hàm phụ Fetch data cities theo quốc gia
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

  const fetchTours = async () => {
    // Load skeleton
    setLoadedTours(false)
    try {
      if (dataNewTourList.length > 0) {
        // Ý tưởng: chuyển mảng data thành 2 mảng con và trộn (3 bước: tạo 2 mảng con, sort, trộn)
        //Bước 1: Phân loại bài viết thành 2 mảng
        const behaviorTours: any = [];
        const nonBehaviorTours: any = [];

        dataNewTourList.forEach((tour: any) => {
          tour.match = 0 // Khởi tạo lại match

          // Điều kiện phân loại mảng: Bài viết có chứa nội dung hoặc có chứa địa điểm thì add vào
          // Tiêu chí 1: Nội dung
          let matchingContent = 0
          const contentOfTourSlug = slug(tour.content)
          const behaviorContentSlug = slug(accountBehavior.content || '')
          if (contentOfTourSlug.includes(behaviorContentSlug)) { // Đúng cả 2 case khi behaviorContentSlug = '' và != ''
            matchingContent += 1 // Điều kiện để được push vào mảng: khi có hoặc không có hành vi
            tour.match -= 1 // Điều kiện để sắp xếp mảng
          }

          //Tiêu chí 2: Địa điểm (Mã thành phố)
          const listBehaviorLocation = accountBehavior?.location ? accountBehavior.location : []
          const listLocationIdOfTour = Object.keys(tour.locations).flatMap((country) =>
            Object.keys(tour.locations[country])
          ); //["vn_1", 'jp_2']
          // listBehaviorLocation là tham số đầu tiên vì khi nó là rỗng thì phụ thuộc vào nội dung
          // Nếu xếp ngược lại thì khi đó countMatching luôn lớn hơn 0 => luôn được add nếu như không có địa điểm
          const countMatchingLocation = countMatchingLocations(listLocationIdOfTour, listBehaviorLocation)
          const closestValue = Math.abs(countMatchingLocation - listLocationIdOfTour.length);
          tour.match += closestValue // cập nhật match

          // Phân loại
          if (countMatchingLocation > 0 || (matchingContent > 0 && behaviorContentSlug !== '')) {//Vì là hàm fetch bình thường nên có nội dung hoặc có địa điểm thì thêm vào mảng nhưng phải kiểm tra địa điểm trước vì nội dung đang làm điều kiện tổng quát cho cả 2 case khi behaviorContent có hoặc không nên cần kiểm tra sau để đúng logic
            behaviorTours.push(tour)
          } else {
            nonBehaviorTours.push(tour)
          }
        })
        // Bước 2: Sort dựa vào typeSearch
        // 2.1. Sort mảng theo behavior: match > fator > rating > like >created_at
        sortTourAtTourScreen(behaviorTours, selectedTypeSearch.current)
        // 2.2. Sort mảng không theo behavior: match > fator > rating > like >created_at
        sortTourAtTourScreen(nonBehaviorTours, selectedTypeSearch.current)


        //Bước 3: Trộn mảng
        const mergedTours = mergeWithRatio(behaviorTours, nonBehaviorTours, 2, 1)

        // SET DỮ LIÊU
        // 1. set mảng đã trộn cho dataTour
        setDataTours(mergedTours)
        // Set lại số lượng bài post đang hiển thị(Là 1 trong 2 điều kiện để không hiển thị button loadNewPosts
        setCurrentTourCount(dataNewTourList.length)
        // UnLoad skeleton
        setLoadedTours(true)
      } else {
        console.log("No data tour available");
      }
    } catch (error) {
      console.error("Error fetching data tours: ", error);
    }
    setDataModalSelected(null)
  }

  // Hàm hiển thị các bài viết mới
  const handleShowNewTour = () => {
    // Mở modal chứa các bài viết mới
    setModalNewToursVisible(true)
    // Load dữ liệu các bài viết mới vào modal
    const result = dataNewTourList.filter((postObj1: any) =>
      !dataTours.some((postObj2: any) => postObj1.id === postObj2.id)
    );
    result.sort((postA: any, postB: any) => {
      return postB.created_at - postA.created_at
    })
    setDataNewTours(result)
  };

  // Hàm button 'Đóng' và load những bài viết mới
  const handleCloseAndReLoadModalNewTour = () => {
    // Có thể reload trang nếu cần lại nếu cần
    setDataTours(dataNewTourList)
    setCurrentTourCount(dataNewTourList.length)
    // Đóng modal
    setModalNewToursVisible(false)
  }
  // Hàm button 'Đóng' modal những bài viết mới
  const handleCloseModalNewTour = () => {
    // Đóng modal
    setModalNewToursVisible(false)

    // Có thể xếp lại các bài viết
  }

  const handleGoToProfileScreen = async (accountId: any) => {
    if (accountId) {
      try {
        const refAccount = ref(database, `accounts/${accountId}`)
        const snapshot = await get(refAccount);
        if (snapshot.exists()) {
          const dataAccountJson = snapshot.val()
          console.log(dataAccountJson, 'adsd');

          await setSearchedAccountData(dataAccountJson)
          router.push("/SearchResult");
        } else {
          console.log("No data account available");
        }
      } catch (error) {
        console.error("Error fetching data account: ", error);
      }
    }

  }

  // ITEM RENDER
  const tourItem = (tour: any) => { // từng phần tử trong data có dạng {"index": 0, "item":{du lieu}} co the thay the tour = destructuring {item, index}    
    const locations: any = tour.item.locations // Lấy được ĐỐI TƯỢNG locations
    const allLocations: any[] = Object.keys(locations).flatMap((country) => //Object.keys(locations): lấy được mảng ["avietnam", "japan"]
      // Lấy các giá trị (địa điểm) của từng country (vd: Hà Nội, Cao Bằng)
      Object.entries(locations[country]).map(([id, name]) => ({
        id,
        name,
        country
      }))
    );


    let rating = tour.item.ratingSummary.totalRatingValue / tour.item.ratingSummary.totalRatingCounter
    rating = Math.ceil(rating * 2) / 2
    rating = isNaN(rating) ? 0 : rating

    const originalPrice = tour.item.money
    const promotionalPrice = tour.item.money * (100 - tour.item.discountTour) / 100
    return (
      <PaperProvider key={tour.item.id}>
        <TouchableOpacity style={styles.item}
          onPress={() => handlePressOnItemTour(tour.item.id)}
          onLongPress={() => handleLongPressOnItemTour()}
        >
          {/*Author*/}
          <View style={styles.authorContent}>
            <TouchableOpacity style={styles.avatarWrap} onPress={() => handleGoToProfileScreen(tour.item.author.id)}>
              <Image style={styles.avatar} source={require('@/assets/images/logo.png')}></Image>
            </TouchableOpacity>
            <View style={{ justifyContent: 'center', marginHorizontal: 4 }}>
              <TouchableOpacity onPress={() => handleGoToProfileScreen(tour.item.author.id)}>
                <Text style={{ fontWeight: '600' }} numberOfLines={1}>
                  {tour.item.author.fullname}
                </Text>
              </TouchableOpacity>
              <Text style={{ fontStyle: 'italic', fontSize: 12 }}>{formatDate(tour.item.created_at)}</Text>
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
                  <TouchableOpacity key={location.id} onPress={() => handleTapOnLocationInMenu(location.id, location.country)}>
                    <Menu.Item title={location.name} titleStyle={styles.itemLocation} dense={true}></Menu.Item>
                    <Divider />
                  </TouchableOpacity>
                )
              })
              }
            </Menu>
            {/* </Provider> */}
          </View>
          <View style={styles.imageTour}>
            <Image style={styles.imageTour} source={{ uri: tour.item.thumbnail }}></Image>
          </View>

          {tour.item.discountTour !== 0 ?
            <View style={styles.priceBackground}>
              <View style={styles.priceWrap}>
              <Entypo style={{paddingHorizontal: 8}} name="price-tag" size={24} color="#824b24" />
                <View style={{ paddingRight: 10 }}>
                  <Text style={{ textDecorationLine: 'line-through', color: 'grey' }}>{originalPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</Text>
                  <Text style={{ fontSize: 18 }}>{promotionalPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</Text>
                </View>
              </View>
            </View>
            :
            <View style={styles.priceBackground}>
              <View style={styles.priceWrap}>
                <Text style={styles.priceLabel}>Deal hot</Text>
                <View style={{ paddingRight: 10 }}>
                  <Text style={{ fontSize: 18 }}>{originalPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</Text>
                </View>
              </View>
            </View>
          }

          <View style={styles.rating}>
            <Text style={styles.textRating}> Đánh giá: {`${rating.toFixed(1)} / 5.0`}</Text>
            <FontAwesome name="star" size={20} color="#F6CE00" style={{ marginLeft: 4 }} />
          </View>
          {/* Button like, comment, save */}
          <ActionBar style={styles.actionBar} data={tour.item} type={TYPE}></ActionBar>
        </TouchableOpacity>
      </PaperProvider >
    )
  }

  const newTourItem = (tour: any) => {
    const locations: any = tour.item.locations // Lấy được ĐỐI TƯỢNG locations
    const allLocations: any[] = Object.keys(locations).flatMap((country) => //Object.keys(locations): lấy được mảng ["avietnam", "japan"]
      // Lấy các giá trị (địa điểm) của từng country (vd: Hà Nội, Cao Bằng)
      Object.entries(locations[country]).map(([id, name]) => ({
        id,
        name
      }))
    )
    return (
      <View key={tour.item.id} style={styles.itemNewTourWrap}>
        <View style={{ flexDirection: 'row' }}>
          <View style={{}}>
            <TouchableOpacity style={{ flexDirection: 'row', borderRadius: 90, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', padding: 2, marginBottom: 4, alignSelf: 'flex-start' }} onPress={() => handleGoToProfileScreen(tour.item.author.id)}>
              <Image style={{ width: 25, height: 25, borderRadius: 90 }} source={{ uri: tour.item.author.avatar }} />
              <Text style={{ fontWeight: '500', paddingHorizontal: 4 }} numberOfLines={1}>
                {tour.item.author.fullname}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity style={styles.itemNewTourContent}>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Image style={{ width: '100%', borderRadius: 10, aspectRatio: 1 }} source={{ uri: tour.item.thumbnail }}></Image>
          </View>
          <View style={{ flex: 1.5, paddingLeft: 10 }}>
            <View style={{ flexDirection: 'row' }}>
              <Text style={styles.textTitle}> {tour.item.title}</Text>
            </View>
            <View style={{ flexDirection: 'row', flex: 1, alignItems: 'flex-start', flexWrap: 'wrap', padding: 4 }}>
              <Text style={{ fontWeight: '500', textAlign: 'center', paddingVertical: 1 }}>Địa điểm: </Text>
              {allLocations.map((location) => {
                return (<Badge key={location.id} style
                  ={{ margin: 1 }}>{location.name}</Badge>)
              })}
            </View>
            <Text style={{ fontStyle: 'italic', fontSize: 12, alignSelf: 'flex-end' }}>{formatDate(tour.item.created_at)}</Text>
          </View>
        </TouchableOpacity>
      </View>
    )
  }


  return (
    <View style={styles.container}>
      <View style={{ flexDirection: 'row', position: 'relative' }}>
        <View style={{ backgroundColor: '#009400', marginBottom: 10, paddingLeft: 6, borderTopRightRadius: 10, borderBottomRightRadius: 10 }}>
          <Text style={styles.textCategory}>Tour du lịch</Text>
        </View>
        {((currentTourCount != newTourCount)) && (
          <TouchableOpacity style={styles.loadNewTour} onPress={() => handleShowNewTour()}>
            <FontAwesome6 name="newspaper" size={20} color="black" />
            <Text style={{ paddingLeft: 4, fontWeight: '500' }}>Tour mới</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.refreshBtn} onPress={() => handleRefreshTourScreen()}>
          <AntDesign name="reload1" size={22} color="black" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.filterBtn}
          onPress={() => setModalVisible(true)}
        >
          <AntDesign name="filter" size={22} color="black" />
        </TouchableOpacity>
      </View>
      {dataTours.length !== 0 ? (
        loadedTours ? (
          <FlatList
            style={{ maxHeight: 580 }}
            data={dataTours}
            extraData={dataTours}
            renderItem={tourItem}
            keyExtractor={(tour: any) => tour.id}
          // ItemSeparatorComponent={() => <View style={{ height: 20 }} />}
          // pagingEnabled
          />
        ) : (
          <View>
            <Text style={{ fontSize: 28, color: '#c9c9c9', textAlign: 'center', marginTop: 60 }}>Đang tải dữ liệu tour</Text>
            <LottieView
              autoPlay
              style={{
                position: "absolute",
                top: 80,
                left: 0,
                width: width,
                height: 320,
              }}
              source={require('@/assets/images/loadingPost.json')}
            />
          </View>
        )
      ) : (
        <View>
          <Text style={{ fontSize: 28, color: '#c9c9c9', textAlign: 'center', marginTop: 100 }}>Không có tour phù hợp</Text>
          <LottieView
            autoPlay
            style={{
              position: "absolute",
              top: 120,
              left: 0,
              width: width,
              height: 320,
            }}
            source={require('@/assets/images/noDataGif.json')}
          />
        </View>
      )}



      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          Alert.alert('Modal has been closed.');
          setModalVisible(!modalVisible);
        }}>
        <View style={styles.modalView}>
          <View style={styles.modalBottomView}>
            <Text style={styles.modalTitleText}>Tìm kiếm</Text>
            <View style={{ width: 350 }}>
              <TextInput
                style={{ borderWidth: 1, borderRadius: 10, paddingHorizontal: 8, height: 46 }}
                placeholder="Tìm kiếm với nội dung"
                // onChangeText={(str) => setDataInput(str)} 
                onChangeText={(str) => setDataInput(str)}
              />
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
              <Text style={{ marginVertical: 8, fontWeight: '500' }}>Kiểu sắp xếp:</Text>
              <SelectList
                search={false}
                // setSelected={(val: any) => setSelectedTypeSearch(val)}
                setSelected={(val: any) => selectedTypeSearch.current = val}
                data={dataTypeSearch}
                maxHeight={120}
                save="key"
                defaultOption={{ key: 1, value: 'Mặc định' }} />
            </View>
            <View style={{ flexDirection: 'row' }}>
              <Pressable
                style={styles.buttonSearch}
                onPress={() => handleTapOnSearchButton(dataNewTourList, dataInput, selectedCountry, selectedCities)}>
                <Text style={styles.textStyle}>Tìm kiếm</Text>
              </Pressable>
              <Pressable
                style={styles.buttonCancel}
                onPress={() => handleCloseModalSearch()}>
                <Text style={styles.textStyle}>Đóng</Text>
              </Pressable>
            </View>

          </View>
          {/* overplay */}
          <View style={styles.overPlay}></View>
        </View>
      </Modal>

      <Modal
        animationType='slide'
        transparent={true}
        visible={modalNewToursVisible}
        onRequestClose={() => {
          Alert.alert('Modal has been closed.');
          setModalNewPostVisible(!modalNewToursVisible);
        }}
        style={{ maxHeight: 400 }}
      >
        <View style={styles.modalView}>
          <View style={[styles.modalBottomView, { height: 500 }]}>
            <Text style={styles.modalTitleText}>Tour mới</Text>
            <FlatList
              data={dataNewTours}
              renderItem={newTourItem}
              ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
            />

            <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity
                style={styles.buttonSearch}
                onPress={() => handleCloseAndReLoadModalNewTour()}>
                <Text style={styles.textStyle}>Làm mới</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleCloseModalNewTour()}
                style={styles.buttonCancel}
              >
                <Text style={styles.textStyle}>Đóng</Text>
              </TouchableOpacity>
            </View>

          </View>
          <View style={styles.overPlay}></View>
        </View>
      </Modal>
    </View >
  )
}
const styles = StyleSheet.create({
  priceLabel: {
    fontSize: 20,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 50,
    paddingHorizontal: 10
    // backgroundColor: '#fcfc85'
  },
  priceWrap: {
    flexDirection: 'row',
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    height: 50,
  },
  priceBackground: {
    position: 'absolute',
    // backgroundColor: '#fcfc85',
    backgroundColor: 'red',
    paddingLeft: 6,
    borderRadius: 10,
    bottom: 60,
    left: 10,
  },
  textRating: {

  },
  rating: {
    flexDirection: 'row',
    position: 'absolute',
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    padding: 6,
    bottom: 10,
    left: 200,
  },
  textTitle: {
    flex: 1,
    paddingHorizontal: 4,
    fontSize: 20,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 4
  },
  itemNewTourWrap: {
    borderRadius: 10,
    width: width - 30,
    padding: 8,
    backgroundColor: '#eeeeee',
    elevation: 4,
    shadowRadius: 12,
    marginBottom: 15,
    marginHorizontal: 8
  },
  itemNewTourContent: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 8,
    backgroundColor: '#f9f9f9',
    elevation: 4,
    shadowRadius: 12,
    marginVertical: 8
  },
  // Modal
  modalBottomView: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 10,
    width: width,
    alignItems: 'center',
    zIndex: 4,
    borderBottomWidth: 1,
    elevation: 5,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  textStyle: {
    // color: 'white',
    fontWeight: '500',
    textAlign: 'center',
    fontSize: 16
  },
  buttonSearch: {
    backgroundColor: '#c6f2c6',
    padding: 10,
    borderRadius: 5,
    margin: 10
  },
  buttonCancel: {
    backgroundColor: '#f87171',
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
  modalTitleText: {
    backgroundColor: '#ffd7bf',
    paddingVertical: 10,
    width: width,
    marginBottom: 15,
    fontSize: 24,
    fontWeight: '500',
    textAlign: 'center',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20
  },
  refreshBtn: {
    position: 'absolute',
    backgroundColor: '#fcfc8d',
    right: 50,
    top: 0,
    padding: 4,
    borderRadius: 5,
    elevation: 6
  },
  filterBtn: {
    position: 'absolute',
    backgroundColor: '#b9e0f7',
    right: 10,
    top: 0,
    padding: 4,
    borderRadius: 5,
    elevation: 6
  },
  loadNewTour: {
    flexDirection: 'row',
    position: 'absolute',
    left: "40%",
    borderRadius: 8,
    padding: 4,
    backgroundColor: '#ffff77',
    transformOrigin: 'center',
    elevation: 8,
  },
  textCategory: {
    fontSize: 14,
    backgroundColor: '#E6F6E6',
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontWeight: '500',
    alignSelf: 'flex-start',
    elevation: 6
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