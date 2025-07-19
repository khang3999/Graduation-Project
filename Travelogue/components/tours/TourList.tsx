import { View, Text, FlatList, StyleSheet, Image, ScrollView, Dimensions, TouchableOpacity, Pressable, Alert, TextInput, Modal, Easing } from 'react-native'
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
import { Animated } from 'react-native';
import { backgroundColors, iconColors } from '@/assets/colors';
import TourItemTourScreen from './TourItemTourScreen';
import { TourModal } from '../homePage/TourItem';

const { width } = Dimensions.get('window');
const ITEM_HEIGHT = 270;
const TYPE = 1;


const TourList = () => {
  const {
    userId,
  }: any = useHomeProvider()
  const {
    dataTours, setDataTours,
    currentTourCount, setCurrentTourCount,
    newTourCount, setNewTourCount,
    loadedTours, setLoadedTours,
    dataModalSelected, setDataModalSelected,
    selectedTour, setSelectedTour,
    selectedTypeSearch,
    dataNewTourList, setDataNewTourList,
    modalSearchVisible, setModalSearchVisible,
    reload, setReload,
    modalNewTourVisible, setModalNewTourVisible,
    isLoading, setIsLoading,
    dataInput,
    selectedCountry,
    selectedCities, setSelectedCities,
    dataCities, setDataCities,
    search, setSearch
  }: any = useTourProvider();

  const [modalNewPostVisible, setModalNewPostVisible] = useState(false);
  const [dataNewTours, setDataNewTours] = useState([]); // Chứa các bài viết mới đc thêm trên firebase
  const { selectedCityId, content } = useLocalSearchParams()
  const { setSearchedAccountData }: any = useAccount();
  const [isLongPress, setIsLongPress] = useState(false);

  const bannerOpacity = useRef(new Animated.Value(1)).current;
  const bannerTranslateY = useRef(new Animated.Value(0)).current;


  const handleLongPressOnItemTour = () => {
    setIsLongPress(true); // Đánh dấu rằng đã giữ lâu
    // Alert.alert('Long Pressed!');
  };
  // XONG
  const searchTours = useCallback(async (dataTours: any, dataInput: any, selectedCountry: any, selectedCities: any) => {
    // Lưu lại hành vi mới lên firebase
    // Khi có chọn điều kiện sort
    // if (!(dataInput === '' && selectedCountry === null && selectedCities.length === 0)) {
    if (!(dataInput === '' && selectedCountry === null && selectedCities.length === 0)) {
      // Ghi lên firebase content và location không ghi quốc gia
      const refBehaviors = ref(database, `accounts/${userId}/behavior`)
      const dataUpdate = {
        'content': dataInput ? dataInput : '',
        'location': selectedCities.length > 0 ? selectedCities : null
      }
      await update(refBehaviors, dataUpdate)
      // Lưu các giá trị đã chọn vào biến để hiển thị ở home
      const dataOfModalSelected = {
        'input': dataInput,
        'country': selectedCountry ? selectedCountry.value : '', // Chỉ cần lưu tên để hiển thị
        'cities': selectedCities
      }
      setDataModalSelected(dataOfModalSelected)

      if (dataTours) {
        // Bước 1: Lấy mảng theo 2 tiêu chí: nội dung và địa điểm
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

        setIsLoading(false)
        // Bước 3: Set data
        return matchingTour.length > 0 ? matchingTour : [];
        // setDataTours(matchingTour)
      } else {
        console.log("No data tours, invalid");
        return []
      }
    }
    return []
  }, [])
  // XONG
  const handleSearch = useCallback(async () => {
    const resultSearch = await searchTours(dataTours, dataInput.current, selectedCountry.current, selectedCities);
    setDataTours(resultSearch);
    // clear data các biến select 
    dataInput.current = ''
    selectedCountry.current = null
    setSelectedCities([])
    setDataCities([])
  }, [selectedCities, dataTours])

  // Xử lí tìm kiếm bài viết của modal search -XONG
  useEffect(() => {
    handleSearch()
  }, [search])

  //XONG
  const fetchBehavior = useCallback(async (userId: string) => {
    try {
      const refBehavior = ref(database, `accounts/${userId}/behavior`)
      const snapshot = await get(refBehavior);
      if (snapshot.exists()) {
        const dataBehaviorJson = snapshot.val()
        return dataBehaviorJson
      } else {
        console.log("No data available - Snapshot don't exist");
      }
    } catch (error) {
      console.error("Error fetching data behavior: tes useId is" + userId, error);
    }
    return {}
  }, [])
  //XONG
  const fetchTours = useCallback(async () => {
    try {
      const refTours = ref(database, 'tours/')
      const toursQuery = query(refTours, orderByChild('status_id'), equalTo(1));
      const snapshot = await get(toursQuery);
      if (snapshot.exists()) {
        const dataToursJson = snapshot.val()
        const dataToursArray = Object.values(dataToursJson)
        return dataToursArray
      } else {
        console.log("No data post available");
      }
    } catch (error) {
      console.error("Error fetching post data: ", error);
    }
    return []; // đảm bảo luôn trả về mảng
  }, [])
  //XONG
  const sortTourListByBehavior = useCallback((list: any, behavior: any) => {
    const behaviorTours: any = [];
    const nonBehaviorTours: any = [];
    const behaviorContentSlug = slug(behavior?.content || '')
    const listBehaviorLocation = behavior?.location ? behavior?.location : []

    if (listBehaviorLocation.length == 0 && behaviorContentSlug == '') {
      list = list.sort((tourA: any, tourB: any) => {
        return (tourB.created_at || 0) - (tourA.created_at || 0);
      })
      return list // ĐÃ RETURN
    }

    list.forEach((tour: any) => {
      tour.match = 0 // Khởi tạo lại match - lưu độ lệch
      const contentOfPostSlug = slug(tour.content) // Nội dung của bài viết
      let matchingContent = 0
      // BƯỚC 1: CHUẨN BỊ
      // Tiêu chí 1: Nội dung
      if (contentOfPostSlug.includes(behaviorContentSlug)) { // Đúng cả 2 case khi behaviorContentSlug = '' và != ''
        // Nếu không nhập nội dung => tất cả bài viết đều được -1 điểm
        // Nếu có nhập nội dung => bài nào trùng khớp thì được -1 không trùng thì không được -1 (closestValue lớn -> ít ưu tiên hơn)
        matchingContent = 1 // Điều kiện để được push vào mảng: khi có hoặc không có địa điểm trùng có tìm theo nội dung TH: 1 - 0
        tour.match -= 1 // Điều kiện để sắp xếp mảng khi dùng closestValue
      }

      // Tiêu chí 2: Địa điểm - Tính độ gần đúng của location --START--
      const listLocationIdOfPost = Object.keys(tour.locations).flatMap((country) =>
        Object.keys(tour.locations[country])
      );

      // countMatchingLocation <= số phần tử của listLocationIdOfPost
      const countMatchingLocation = countMatchingLocations(listLocationIdOfPost, listBehaviorLocation)

      // Tính độ lệch, càng trùng khớp nhiều thì giá trị càng nhỏ max = 0 <=> trùng 100%
      const closestValue = Math.abs(listLocationIdOfPost.length - countMatchingLocation);
      // Cập nhật độ lệch của bài viết so với tiêu chí
      tour.match += closestValue // cập nhật match
      //Tính độ gần đúng của location --END--

      //BƯỚC 2: PHÂN LOẠI THÀNH 2 MẢNG  
      // TH1: Chắc chắn có trùng địa điểm
      if (countMatchingLocation != 0) {
        behaviorTours.push(tour)
        // TH2: Có chọn địa điểm nhưng không trùng khớp
        // 2.1 Có nhập nội dung nhưng không có trùng, vì matchingContent luôn = 1 chỉ khi không trùng khớp mới = 0
      } else if (matchingContent == 0) {
        nonBehaviorTours.push(tour)
        // 2.2 Không nhập nội dung content = '' khi đó matchingContent luôn = 1
      } else if (behaviorContentSlug == '') {
        nonBehaviorTours.push(tour)
      } else { // Có nhập và có trùng nội dung
        behaviorTours.push(tour)
      }
    })
    // BƯỚC 3: SẮP XẾP MẢNG
    // 2.1. Sort mảng theo behavior: match > fator > rating > like >created_at
    sortTourAtTourScreen(behaviorTours, selectedTypeSearch.current)
    // 2.2. Sort mảng không theo behavior: match > fator > rating > like >created_at
    sortTourAtTourScreen(nonBehaviorTours, selectedTypeSearch.current)
    //Bước 3: Trộn mảng
    const mergedTours = mergeWithRatio(behaviorTours, nonBehaviorTours, 2, 1)
    return mergedTours
  }, [])

  // DONE
  const reloadTourScreen = useCallback(async () => {
    // Xử lí
    // Lấy list tour mới nhất
    const newToursList = await fetchTours();
    // Lấy hành vi mới nhất của người dùng
    const newBehavior = await fetchBehavior(userId)
    // Cập nhật danh sách tour mới nhất
    dataTours.current = newToursList;
    // Sắp xếp danh sách bài viết theo hành vi mới nhất
    setDataTours(sortTourListByBehavior(newToursList, newBehavior))
    // Clear data
    dataInput.current = ''
    selectedCountry.current = null
    setSelectedCities([])
    setDataCities([])
    selectedTypeSearch.current = 1
    setDataModalSelected(null)
    setCurrentTourCount(newToursList.length)
    setModalNewPostVisible(false)
    setModalSearchVisible(false)
    setIsLoading(false)
  }, [])

  //XONG
  useFocusEffect(
    useCallback(() => {
      setModalNewTourVisible(false)
      setModalSearchVisible(false);
      if (selectedCityId) {
        console.log('have param 1111', selectedCityId);
        if (dataTours.length === 0) {
          searchTours(dataNewTourList, content, null, [selectedCityId])
        } else {
          searchTours(dataTours, content, null, [selectedCityId])
        }
      } else {
        // Kiểm tra khi màn hình focus và cả 2 biến đều có dữ liệu
        console.log("tour focus");
        reloadTourScreen()
      }
      return () => {
        console.log('Screen is unfocused');
      };
    }, [selectedCityId, content, reload]) // Cập nhật khi các giá trị này thay đổi
  );
  // Run to load new post list but don't merge with old post list
  useEffect(() => {
    if (modalNewPostVisible) {
      const result = dataNewTourList.filter((tourObj1: any) =>
        !dataTours.some((tourObj2: any) => tourObj1.id === tourObj2.id)
      );
      result.sort((tourA: any, tourB: any) => {
        return tourB.created_at - tourA.created_at
      })
      setDataNewTours(result)
    }
  }, [modalNewPostVisible])

  // Hàm xem chi tiết bài viết
  const handleTapToViewPostDetail = useCallback((path: any, tourId: string) => {
    router.push({
      pathname: path,
      params: { tourId: tourId },
    });
  }, [])
  // Định nghĩa hàm xử lý sự kiện khi người dùng nhấn vào chủ bài viết để xem chi tiết trang cá nhân - DONE
  const handleTapToViewProfile = useCallback(async (authorId: string) => {
    if (!authorId) {
      console.log('Go to profile fail: check authorId');
      return
    }
    try {
      const refAccount = ref(database, `accounts/${authorId}`)
      const snapshot = await get(refAccount);
      if (snapshot.exists()) {
        const dataAccountJson = snapshot.val()
        await setSearchedAccountData(dataAccountJson)
        router.push("/SearchResult");
      } else {
        console.log("Go to profile: No data account available");
      }
    } catch (error) {
      console.error("Go to profile: Error fetching data account: ", error);
    }
  }, [])


  // ITEM RENDER
  const tourItem = useCallback((tour: any) => { // từng phần tử trong data có dạng {"index": 0, "item":{du lieu}} co the thay the tour = destructuring {item, index}   
    const tourData: TourModal = tour.item
    const itemIndex = tour.index
    return (
      <TourItemTourScreen
        index={itemIndex}
        // userId={userId}
        data={tourData}
        liked={false} //Chua xu li like
        onTapToViewDetail={handleTapToViewPostDetail}
        onTapToViewProfile={handleTapToViewProfile}
      ></TourItemTourScreen>
    )
  }, [])

  // const newTourItem = (tour: any) => {
  //   const locations: any = tour.item.locations // Lấy được ĐỐI TƯỢNG locations
  //   const allLocations: any[] = Object.keys(locations).flatMap((country) => //Object.keys(locations): lấy được mảng ["avietnam", "japan"]
  //     // Lấy các giá trị (địa điểm) của từng country (vd: Hà Nội, Cao Bằng)
  //     Object.entries(locations[country]).map(([id, name]) => ({
  //       id,
  //       name
  //     }))
  //   )
  //   return (
  //     <View key={tour.item.id} style={styles.itemNewTourWrap}>
  //       <View style={{ flexDirection: 'row' }}>
  //         <View style={{}}>
  //           <TouchableOpacity style={{ flexDirection: 'row', borderRadius: 90, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', padding: 2, marginBottom: 4, alignSelf: 'flex-start' }} onPress={() => handleGoToProfileScreen(tour.item.author.id)}>
  //             <Image style={{ width: 25, height: 25, borderRadius: 90 }} source={{ uri: tour.item.author.avatar }} />
  //             <Text style={{ fontWeight: '500', paddingHorizontal: 4 }} numberOfLines={1}>
  //               {tour.item.author.fullname}
  //             </Text>
  //           </TouchableOpacity>
  //         </View>
  //       </View>
  //       <TouchableOpacity style={styles.itemNewTourContent}
  //         onPress={() => {
  //           router.push({
  //             pathname: "/tourDetail",
  //             params: { tourId: tour.item.id },
  //           })
  //         }}
  //       >
  //         <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
  //           <Image style={{ width: '100%', borderRadius: 10, aspectRatio: 1 }} source={{ uri: tour.item.thumbnail }}></Image>
  //         </View>
  //         <View style={{ flex: 1.5, paddingLeft: 10 }}>
  //           <View style={{ flexDirection: 'row' }}>
  //             <Text style={styles.textTitle}> {tour.item.title}</Text>
  //           </View>
  //           <View style={{ flexDirection: 'row', flex: 1, alignItems: 'flex-start', flexWrap: 'wrap', padding: 4 }}>
  //             <Text style={{ fontWeight: '500', textAlign: 'center', paddingVertical: 1 }}>Địa điểm: </Text>
  //             {allLocations.map((location) => {
  //               return (<Badge key={location.id} style
  //                 ={{ margin: 1 }}>{location.name}</Badge>)
  //             })}
  //           </View>
  //           <Text style={{ fontStyle: 'italic', fontSize: 12, alignSelf: 'flex-end' }}>{formatDate(tour.item.created_at)}</Text>
  //         </View>
  //       </TouchableOpacity>
  //     </View>
  //   )
  // }


  return (
    <View style={styles.container}>
      {dataTours.length !== 0 ? (
        !isLoading ? (
          <FlatList
            style={{ maxHeight: 620 }}
            nestedScrollEnabled={true}
            scrollEnabled={false}
            //NHO MO COMMENT
            // horizontal={true}
            data={dataTours}
            renderItem={tourItem}
            keyExtractor={(tour: any) => tour.id}
            contentContainerStyle={{ paddingVertical: 30, paddingHorizontal: 20, backgroundColor: backgroundColors.background2 }}
            ItemSeparatorComponent={() => <View style={{ height: 30 }} />}
            initialNumToRender={4}
            maxToRenderPerBatch={4}
          />
        ) : (
          <View style={{ height: 620, justifyContent:'center',alignSelf:'center' }}>
            <Text style={{ fontSize: 28, color: 'grey', textAlign: 'center', marginTop: 60 }}>Đang tải dữ liệu</Text>
            <LottieView
              autoPlay
              style={{
                width: width,
                height: 320,
              }}
              source={require('@/assets/images/loadingPost.json')}
            />
          </View>
        )
      ) : (
         <View style={{ height: 620, justifyContent: 'center', alignSelf: 'center', }}>
          <Text style={{ fontSize: 26, color: 'grey', textAlign: 'center', }}>Không tìm thấy tour phù hợp</Text>
          <LottieView
            autoPlay
            style={{
              width: width,
              height: 320,
            }}
            source={require('@/assets/images/noDataGif.json')}
          />
        </View>
      )}
    </View >
  )
}
const styles = StyleSheet.create({
  container: {
    // position: 'absolute',
    paddingBottom: 56
  }
})
export default TourList