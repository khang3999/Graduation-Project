import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Pressable, Modal, Alert, TextInput, Dimensions, RefreshControl } from 'react-native'
import React, { useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { Badge, Divider, IconButton, MD3Colors, Menu, PaperProvider } from 'react-native-paper'
import { database, ref } from '@/firebase/firebaseConfig'
import { equalTo, get, orderByChild, query, update } from '@firebase/database'
import { useHomeProvider } from '@/contexts/HomeProvider'
import { formatDate } from '@/utils/commons'
import { AntDesign, Entypo, FontAwesome, FontAwesome5, FontAwesome6, Foundation, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { countMatchingLocations, mergeWithRatio, slug, sortTourAtHomeScreen } from '@/utils'
import { MultipleSelectList, SelectList } from 'react-native-dropdown-select-list'
import ActionBar from '../actionBars/ActionBar'
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router'
import LottieView from 'lottie-react-native'
import { useNavigationState, useRoute } from '@react-navigation/native'
import { useAccount } from '@/contexts/AccountProvider'
import HeartButton from '../buttons/HeartButton'
import SaveButton from '../buttons/SaveButton'
import LiveModeButton from '../buttons/LiveModeButton'
import { backgroundColors, bagdeColors, iconColors } from '@/assets/colors'

const { width } = Dimensions.get('window')


const PostList = () => {
  const TYPE = { post: 0, tour: 1 };
  const {
    dataPosts, setDataPosts,
    currentPostCount, setCurrentPostCount,
    newPostCount,
    accountBehavior, setAccountBehavior,
    loadedDataAccount, setLoadedDataAccount,
    loadedPosts, setLoadedPosts,
    loadedTours, setLoadedTours,
    dataCountries, setDataCountries,
    dataModalSelected, setDataModalSelected,
    dataAccount,
    selectedTypeSearch,
    dataNewPostList, setDataNewPostList,
    dataTours, setDataTours,
    dataToursSorted, setDataToursSorted,
    dataTypeSearch,
    modalSearchVisible, setModalSearchVisible,
    modalNewPostVisible, setModalNewPostVisible,
    reload, setReload
  }: any = useHomeProvider();


  // Lưu giá trị các thành phố dựa trên quốc gia đang chọn
  const [dataCities, setDataCities] = useState([])
  const [selectedCountry, setSelectedCountry] = useState(null); // Dữ liệu để sort(Lưu vào behavior khi bấm sort)
  const [selectedCities, setSelectedCities] = useState([]); // Dữ liệu để sort(Lưu vào behavior khi bấm sort)
  const [dataInput, setDataInput] = useState('') // Dữ liệu để sort(Lưu vào behavior khi bấm sort)
  // const [modalVisible, setModalVisible] = useState(false);
  // const [modalNewPostVisible, setModalNewPostVisible] = useState(false);
  const [dataNewPosts, setDataNewPosts] = useState([]); // Chứa các bài viết mới đc thêm trên firebase
  const [allLocationIdFromPost, setAllLocationIdFromPost] = useState([])
  const flatListPostRef: any = useRef(null)
  // const { selectedCityId, content } = useLocalSearchParams()
  const { setSearchedAccountData }: any = useAccount();
  const [reloadScreen, setReloadScreen] = useState(false)
  const route = useRoute();
  const { selectedCityId, content }: any = useLocalSearchParams();

  // useEffect(() => {
  //   // if (flatListPostRef.current) {
  //   //   flatListPostRef.current.scrollToOffset({ offset: 0, animated: true });
  //   // }
  //   setLoadedTours(true)
  // }, [dataPosts]);
  // useEffect(() => {
  //   // Hàm thực hiện hành động sau khi delay
  //   if (newPostCount < currentPostCount) {
  //     // Đặt độ trễ
  //     const timeoutId = setTimeout(fetchPosts, 5000); // Delay 2 giây (2000ms)

  //     // Cleanup: Hủy bỏ timeout nếu `newPostCount` thay đổi trước khi thời gian trôi qua
  //     return () => clearTimeout(timeoutId);
  //   }
  // }, [newPostCount]);

  const navigationState = useNavigationState((state) => state);
  useEffect(() => {
    // In ra các màn hình trong stack
    console.log('Danh sách các màn hình trong stack:');
    navigationState.routes.forEach((route, index) => {
      console.log(`Màn hình ${index + 1}: ${route.name}`);
    });
  }, [navigationState]);

  // ĐỊNH NGHĨA CÁC HÀM 
  // Hàm search . Khi tap vào button search thì lưu giá trị các biến đã chọn qua 1 biến khác để hiển thị ở home, và set lại giá trị default cho các biến đó
  const handleTapOnSearchButton = async (dataPosts: any, dataInput: any, selectedCountry: any, selectedCities: any) => {
    if (!(dataInput === '' && selectedCountry === null && selectedCities.length === 0)) {
      setLoadedTours(false) // Load skeleton tour section
      setLoadedPosts(false) // Load skeleton posts list
      // const userId = await AsyncStorage.getItem("userToken")
      const userId = dataAccount.id
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
      // const refPosts = ref(database, 'posts/')
      // const snapshot = await get(refPosts);
      // if (snapshot.exists()) {
      if (dataPosts) {
        // const dataPostsJson = snapshot.val()
        // Chuyển đổi object thành array bang values cua js
        // const jsonArrayPosts = Object.values(dataPostsJson)
        // Bước 1: Lấy mảng theo 2 tiêu chí: nội dung và địa điểm
        let matchingPost: any[] = []

        if (selectedCities && selectedCities.length > 0) { // Chọn nhiều city
          console.log("case1"); // Trùng nội dung và thành phố thì mới add vào mảng
          // ****************************
          // jsonArrayPosts.forEach((post: any) => {
          dataPosts.forEach((post: any) => {
            post.match = 0 // Khởi tạo lại match

            // Tiêu chí 1: Nội dung
            let matchingContent = 0
            const contentOfPostSlug = slug(post.content)
            if (contentOfPostSlug.includes(slug(dataInput))) { // Đúng cả 2 case khi dataInput: không nhâp nội dung và nhập nội dung, vd: nếu nhập content thì phải tìm đúng theo content mới update match, còn không nhập content thì mặc định luôn đúng vì dataInput là ''
              matchingContent = 1 // Điều kiện để push vào mảng
              post.match -= 1 //  Điều kiện để sắp xếp khi đã push vào mảng
            }


            // Tiêu chí 2: Địa điểm (Mã thành phố)
            const listLocationIdOfPost = Object.keys(post.locations).flatMap((country) => {
              return Object.keys(post.locations[country])
            }); //["vn_1", 'jp_2']
            // Đếm độ lệch nếu lệch ít thì ưu tiên hơn
            // Cập nhật độ lệch của bài viết so với tiêu chí
            const matchingLocation = countMatchingLocations(selectedCities, listLocationIdOfPost)
            const closestValue = Math.abs(matchingLocation - selectedCities.length);
            post.match += closestValue // cập nhật match

            // Push vào mảng
            if (matchingContent > 0 && matchingLocation > 0) { // PHẢI trùng cả nội dung và vị trí mới push vì đây là phần tìm kiếm
              matchingPost.push(post)
            }
          })
        } else if (selectedCountry !== null) {// Tìm theo quốc gia: không kiểm tra đã chọn city chưa vì đã check chọn city ở if trước rồi
          console.log("case2");// Trùng nội dung và quốc gia mới add vào mảng
          // ********************
          // jsonArrayPosts.forEach((post: any) => {
          dataPosts.forEach((post: any) => {
            post.match = 0  // Khởi tạo lại match
            // Tiêu chí 1: Nội dung
            let matchingContent = 0
            const contentOfPostSlug = slug(post.content)
            if (contentOfPostSlug.includes(slug(dataInput))) { // Đúng cả 2 case khi dataInput: không nhâp nội dung và nhập nội dung, vd: nếu nhập content thì phải tìm đúng theo content mới update match, còn không nhập content thì mặc định luôn đúng vì dataInput là ''
              matchingContent = 1
              post.match -= 1
            }
            // Tiêu chí 2: Địa điểm (Mã quốc gia)
            let matchingLocation = 0
            const listCountriesIdOfPost = Object.keys(post.locations)//["avietnam", 'japan']
            // Kiểm tra có mã quốc gia trong bài post đó không chỉ cần có chứa không
            if (listCountriesIdOfPost.includes(selectedCountry.key)) {
              // Đếm độ lệch càng ít thì càng chính xác
              matchingLocation = 1
              const closestValue = listCountriesIdOfPost.length;
              post.match += closestValue
            }
            // Push vào mảng
            if (matchingContent > 0 && matchingLocation > 0) { // trung khớp nội dung và có chứa mã quốc gia trong bài post
              matchingPost.push(post)
            }
          })
        } else { // Tìm kiếm theo nội dung 
          console.log("case3"); // trùng nội dung mới add vào
          // ***********************
          // jsonArrayPosts.forEach((post: any) => {
          dataPosts.forEach((post: any) => {
            post.match = 0  // Khởi tạo lại match
            // Kiểm tra nội dung
            const contentOfPostSlug = slug(post.content)
            if (contentOfPostSlug.includes(slug(dataInput))) {
              post.match -= 1
              // Push vào mảng
              matchingPost.push(post)
            }
          })
        }
        // Bước 2: Sort mảng
        // Nếu có sắp xếp theo lượt like thì bỏ qua closestValue(match) vì matchingPost là mảng đã khớp với điều kiện sort
        if (selectedTypeSearch.current === 2) {// TH1: Có chọn typeSearch thì bỏ qua closestValue sắp xếp theo lượt like
          matchingPost.sort((postA: any, postB: any) => {
            if (postB.likes !== postA.likes) {
              return postB.likes - postA.likes;
            }
            if (postB.match !== postA.match) {
              return postA.match - postB.match; // Sắp xếp tăng dần theo match vì match là độ lệch, càng ít thì càng ưu tiên
            }
            return (postB.created_at || 0) - (postA.created_at || 0);
          })
        } else { // TH2: Không chọn typeSearch thì sắp xếp theo  closestValue và thời gian
          matchingPost.sort((postA: any, postB: any) => {
            // So sánh theo match trước
            if (postB.match !== postA.match) {
              return postA.match - postB.match; // Sắp xếp tăng dần theo match vì match là độ lệch, càng ít thì càng ưu tiên
            }
            if (postB.likes !== postA.likes) {
              return postB.likes - postA.likes;
            }
            return (postB.created_at || 0) - (postA.created_at || 0); // Sắp xếp giảm dần theo created_at
          });
        }
        // Bước 3: 
        setDataPosts(matchingPost)
      } else {
        console.log("No data post list");
      }
      // } catch (error) {
      //   console.error("Error fetching post data search: ", error);
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
      setLoadedPosts(true) // UnLoad skeleton
      setLoadedTours(true) // UnLoad skeleton
    } else {
      setDataInput('')
      setSelectedCountry(null)
      setSelectedCities([])
      setDataCities([])
      fetchPosts(dataNewPostList)
    }
    // Đóng modal search
    setModalSearchVisible(false)
  }
  // Hàm đóng modal search
  const handleCloseModalSearch = () => {
    setDataInput('')
    setSelectedCountry(null)
    setSelectedCities([])
    setDataCities([])
    // Đóng modal search
    setModalSearchVisible(!modalSearchVisible)
  }

  // Hàm chọn nhiều thành phố 
  const handleSelecteCities = (val: any) => {
    // Lưu lại id các city được chọn
    setSelectedCities(val)
  }

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
  const fetchPosts = async (dataNewPostList: any) => {
    setLoadedPosts(false)
    try {
      if (dataNewPostList.length > 0) {
        // Ý tưởng: chuyển mảng data thành 2 mảng con và trộn (3 bước: tạo 2 mảng con, sort, trộn)
        //Bước 1: Phân loại bài viết thành 2 mảng
        const behaviorPosts: any = [];
        const nonBehaviorPosts: any = [];
        dataNewPostList.forEach((post: any) => {
          post.match = 0 // Khởi tạo lại match
          // Điều kiện phân loại mảng: Bài viết có chứa nội dung hoặc có chứa địa điểm thì add vào
          // Tiêu chí 1: Nội dung
          let matchingContent = 0
          const contentOfPostSlug = slug(post.content)
          const behaviorContentSlug = slug(accountBehavior.content || '')
          if (contentOfPostSlug.includes(behaviorContentSlug)) { // Đúng cả 2 case khi behaviorContentSlug = '' và != ''
            matchingContent = 1 // Điều kiện để được push vào mảng: khi có hoặc không có hành vi
            post.match -= 1 // Điều kiện để sắp xếp mảng khi dùng closestValue
          }

          //  Tiêu chí 2: Địa điểm
          const listBehaviorLocation = accountBehavior?.location ? accountBehavior.location : []
          const listLocationIdOfPost = Object.keys(post.locations).flatMap((country) =>
            Object.keys(post.locations[country])
          ); //["vn_1", 'jp_2']
          // Đếm độ lệch nếu lệch ít thì ưu tiên hơn

          const countMatchingLocation = countMatchingLocations(listLocationIdOfPost, listBehaviorLocation)
          const closestValue = Math.abs(countMatchingLocation - listLocationIdOfPost.length);
          // Cập nhật độ lệch của bài viết so với tiêu chí
          post.match += closestValue // cập nhật match

          // Phân loại: 
          if (countMatchingLocation > 0 || (matchingContent > 0 && behaviorContentSlug !== '')) { //Vì là hàm fetch bình thường nên có nội dung hoặc có địa điểm thì thêm vào mảng nhưng phải kiểm tra địa điểm trước vì nội dung đang làm điều kiện tổng quát cho cả 2 case khi behaviorContent có hoặc không nên cần kiểm tra sau để đúng logic
            behaviorPosts.push(post)
          } else {
            nonBehaviorPosts.push(post)
          }
        });
        // Bước 2: Sort mảng. Nếu có chọn kiểu search bỏ qua hệ số trùng
        if (selectedTypeSearch.current === 2) { //Th1: Có chọn typeSearch
          // Sort mảng theo hành vi theo lượt like nếu trùng like thì theo thời gian
          behaviorPosts.sort((postA: any, postB: any) => {
            if (postB.likes === postA.likes) {
              return (postB.created_at || 0) - (postA.created_at || 0);
            }
            return postB.likes - postA.likes;
          })
          // Sort mảng không theo hành vi theo lượt like nếu trùng like thì theo thời gian
          nonBehaviorPosts.sort((postA: any, postB: any) => {
            if (postB.likes === postA.likes) {
              return (postB.created_at || 0) - (postA.created_at || 0);
            }
            return postB.likes - postA.likes;
          })
        } else { // TH2: Không chon typeSearch
          //2.1. Sort mảng theo behavior: match > created_at
          behaviorPosts.sort((postA: any, postB: any) => {
            // Ưu tiên độ lệch số phần tỉnh thành của bài viết so với hành vi trước mới đến số like 
            // Vì là bài post nên chỉ So sánh theo hành vi và thời gian
            if (postB.match !== postA.match) {
              return postA.match - postB.match; // Sắp xếp tăng dần theo match vì match là độ lệch, càng ít thì càng ưu tiên
            }
            return (postB.created_at || 0) - (postA.created_at || 0);
          });
          //2.2. Sort mảng không match hành vi theo created_at
          nonBehaviorPosts.sort((postA: any, postB: any) => {
            return (postB.created_at || 0) - (postA.created_at || 0);
          })
        }

        //Bước 3: Trộn mảng
        const mergedPosts = mergeWithRatio(behaviorPosts, nonBehaviorPosts, 2, 1)
        // SET DỮ LIÊU
        //set mảng đã trộn cho dataPost
        setDataPosts(mergedPosts)
        // setDataPosts(jsonArrayPosts)
        // Set lại số lượng bài post đang hiển thị(Là 1 trong 2 điều kiện để không hiển thị button loadNewPosts
        setCurrentPostCount(dataNewPostList.length)
        // Set loadedTourHome
        setLoadedPosts(true)
        // Fetch tours
        const allLocationIdFromPost = Object.keys(mergedPosts[0].locations).flatMap((country) =>
          Object.keys(mergedPosts[0].locations[country])
        );

        sortTourAtHomeScreen(dataTours, allLocationIdFromPost)
      } else {
        console.log("No data post available");
      }
    } catch (error) {
      console.error("Error fetching post data: ", error);
    }
    // setIsSearchingMode(false)
    setDataModalSelected(null)
  }

  // Hàm lấy lại các tour từ firebase khi mỗi lần focus và khi reload 
  const fetchTours = async () => {
    setLoadedTours(false)
    try {
      const refTours = ref(database, 'tours/')
      const toursQuery = query(refTours, orderByChild('status_id'), equalTo(1));
      const snapshot = await get(toursQuery);
      if (snapshot.exists()) {
        const dataToursJson = snapshot.val()
        const dataToursArray = Object.values(dataToursJson) // Array all tours from firebase
        // Sắp xếp lại list tour theo thứ tự
        // sortTourAtHomeScreen(dataToursArray, allLocationIdFromPost)
        setDataTours(dataToursArray)
        setLoadedTours(true)
      } else {
        console.log("No data available");
      }
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  }

  const sortToursByPostLocationId = () => {
    const arrayToursSorted = sortTourAtHomeScreen([...dataTours], allLocationIdFromPost)
    setDataToursSorted(arrayToursSorted)
  }
  // Khi focus
  useFocusEffect(
    useCallback(() => {
      // console.log(contentCheckIn,'ccccccsssssss');
      setModalNewPostVisible(false)
      setModalSearchVisible(false);
      if (selectedCityId) {
        if (dataPosts.length === 0) {
          handleTapOnSearchButton(dataNewPostList, content, null, [selectedCityId])
        } else {
          handleTapOnSearchButton(dataPosts, content, null, [selectedCityId])
        }
      } else {
        // Kiểm tra khi màn hình focus và cả 2 biến đều có dữ liệu
        if (dataAccount && loadedDataAccount) {
          // Clear data
          console.log('Focus home screen');
          setDataInput('')
          setSelectedCountry(null)
          setSelectedCities([])
          setDataCities([])
          selectedTypeSearch.current = 1
          fetchPosts(dataNewPostList); // Gọi fetchPosts
          fetchTours(); //
        }
      }
      console.log();

      return () => {
        console.log('Screen is unfocused');
      };
    }, [loadedDataAccount, selectedCityId, content]) // Cập nhật khi các giá trị này thay đổi
  );


  // Khi reload và khi thay đổi post hiển thị thì sort lại tour
  useEffect(() => {
    if (allLocationIdFromPost && dataTours) {
      sortToursByPostLocationId()
    }
  }, [allLocationIdFromPost, dataTours])

  // Hàm reload trang home
  useEffect(() => {
    const handleReloadHomeScreen = () => {
      // Clear data
      setDataInput('')
      setSelectedCountry(null)
      setSelectedCities([])
      setDataCities([])
      selectedTypeSearch.current = 1
      setDataModalSelected(null)
      setReloadScreen(true)
      // fetchPosts(); // Tải lại bài viết
      // fetchTours()
    };
    handleReloadHomeScreen()
  }, [reload])



  useEffect(() => {
    if (reloadScreen) {
      fetchPosts(dataNewPostList); // Tải lại bài viết
      fetchTours()
      setReloadScreen(false)
    }
  }, [reloadScreen])

  // Hàm hiển thị những bài viết mới *** không xài nữa ***
  const handleShowNewPost = () => {
    // Mở modal chứa các bài viết mới
    // setModalNewPostVisible(true)
    // Load dữ liệu các bài viết mới vào modal
    const result = dataNewPostList.filter((postObj1: any) =>
      !dataPosts.some((postObj2: any) => postObj1.id === postObj2.id)
    );
    result.sort((postA: any, postB: any) => {
      return postB.created_at - postA.created_at
    })
    setDataNewPosts(result)
  };
  // Run to load new post list but don't merge with old post list
  useEffect(() => {
    if (modalNewPostVisible) {
      const result = dataNewPostList.filter((postObj1: any) =>
        !dataPosts.some((postObj2: any) => postObj1.id === postObj2.id)
      );
      result.sort((postA: any, postB: any) => {
        return postB.created_at - postA.created_at
      })
      setDataNewPosts(result)
    }
  }, [modalNewPostVisible])
  // Hàm button 'Đóng' modal những bài viết mới ***không xài nữa**
  const handleCloseModalNewPost = () => {
    // Đóng modal
    setModalNewPostVisible(false)
  }
  // Hàm button 'Làm mới' và merge những bài viết mới vào danh sách
  const handleCloseAndReLoadModalNewPost = () => {
    // Có thể reload trang nếu cần lại nếu cần
    setDataPosts(dataNewPostList)
    setCurrentPostCount(dataNewPostList.length)
    setLoadedPosts(true)
    // Clear state của button
    // Đóng modal
    setModalNewPostVisible(false)
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

  // Xử lý sự kiện khi item hiển thị thay đổi
  const onViewableItemsChanged = ({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      // setLoadedTours(false)
      // Xử lí lưu bài viết đang hiển thị ra biến toàn cục để đổ list tour theo chủ đề của bài viết
      const locations = viewableItems[0].item.locations
      // Lấy tất cả các locationId <=> id của tỉnh thành trong từng bài post ['vn_1', 'jp_1']
      const allLocationIds: any = Object.keys(locations).flatMap((country) =>
        Object.keys(locations[country])
      );
      // setPostIdCurrent(viewableItems[0].item.id)
      // setAllLocationNameFromPost(allLocationNames) // Set mảng name của location để tính điểm tour tour phù hợp
      setAllLocationIdFromPost(allLocationIds)
      // Set mảng id của location để lấy tour phù hợp
      // fetchToursByPost(allLocationIds)
    }
  };

  // useEffect(() => {
  //   sortToursByPostLocationId(dataTours, allLocationIdFromPost)
  // }, [allLocationIdFromPost])

  // Cài đặt để FlatList xác định các mục hiển thị
  const viewabilityConfig = {
    itemVisiblePercentThreshold: 80, // Chỉ định rằng item phải hiển thị ít nhất 80% để được coi là visible
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
  const postItem = (post: any) => { // từng phần tử trong data có dạng {"index": 0, "item":{du lieu}} co the thay the post = destructuring {item, index}    
    const locations: any = post.item.locations // Lấy được ĐỐI TƯỢNG locations
    const authorId = post.item.author.id
    const allLocations: any[] = Object.keys(locations).flatMap((country) => //Object.keys(locations): lấy được mảng ["avietnam", "japan"]
      // Lấy các giá trị (địa điểm) của từng country (vd: Hà Nội, Cao Bằng)
      Object.entries(locations[country]).map(([id, name]) => ({
        id,
        name,
        country
      }))
    );

    return (
      <View key={post.item.id} style={styles.itemWrap}>
        < PaperProvider >
          <TouchableOpacity style={styles.item} onPress={() => {
            router.push({
              pathname: "/postDetail",
              params: { postId: post.item.id },
            });
            // setSelectedPost([post.item])
          }}>
            {/* Label */}
            <View style={{ borderRadius: 30, position: 'absolute', backgroundColor: 'rgba(100,100,100,0.1)', zIndex: 1, width: '100%', height: '100%' }}></View>

            <View style={styles.header}>
              {/*Author*/}
              <View style={styles.authorContent}>
                <TouchableOpacity style={styles.avatarWrap} onPress={() => handleGoToProfileScreen(authorId)}>
                  <Image style={styles.avatar} source={{ uri: post.item.author.avatar }}></Image>
                </TouchableOpacity>
                <View style={{ justifyContent: 'center', marginHorizontal: 4 }}>
                  <TouchableOpacity>
                    <Text style={{ fontWeight: '600', }} numberOfLines={1}>
                      {post.item.author.fullname}
                    </Text>
                  </TouchableOpacity>
                  <Text style={{ fontSize: 12, fontStyle: 'italic' }}>{formatDate(post.item.created_at)}</Text>
                </View>
              </View>
              {/* Live mode */}
              <View style={styles.liveModeWrap}>
                <LiveModeButton type="1"></LiveModeButton>
              </View>
              {/* Location */}
              <View style={styles.flagBtn}>
                {/* <Provider > */}
                <Menu
                  style={styles.listLocations}
                  visible={indexVisibleMenu === post.index} // Thay the 1 bang index của post trong mang
                  onDismiss={closeMenu}
                  theme={''}
                  elevation={4}
                  // statusBarHeight={0}
                  anchorPosition='bottom'
                  contentStyle={{ backgroundColor: 'white', right: 26, }}
                  anchor={
                    <View style={{ alignItems: "center" }}>
                      <IconButton
                        style={{ backgroundColor: 'white', width: 50, height: 40 }}
                        icon="map-marker-radius"
                        iconColor={iconColors.green1}
                        size={26}
                        onPress={() => openMenu(post.index)}
                        accessibilityLabel="Menu button"
                      />
                    </View>
                  }
                >
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
            </View>
            <View style={styles.imagePostWrap}>
              <Image style={styles.imagePost} source={{ uri: post.item.thumbnail }}></Image>
            </View>
            {/* Button like, comment, save */}
            {/* <ActionBar style={styles.actionBar} data={post.item} type={TYPE}></ActionBar> */}
            {/* Action button */}
            <View style={styles.footer}>
              <View style={styles.actionBar}>
                <View style={[styles.btn, {
                  paddingHorizontal: 10,
                }]}>
                  <HeartButton data={post.item} type={TYPE.post}></HeartButton>
                </View>
                <View style={[styles.btn, { width: 50, marginLeft: 0 }]}>
                  <SaveButton data={post.item} type={TYPE.post}></SaveButton>
                </View>
              </View>
              {/* Topic */}
              <View style={styles.topicContainer}>
                <Text numberOfLines={2} ellipsizeMode='tail' textBreakStrategy='balanced' style={styles.topicText}>{post.item.title}</Text>
              </View>
            </View>

          </TouchableOpacity>
        </PaperProvider>
      </View>
    )
  }

  const newPostItem = (post: any) => {
    const locations: any = post.item.locations // Lấy được ĐỐI TƯỢNG locations
    const allLocations: any[] = Object.keys(locations).flatMap((country) => //Object.keys(locations): lấy được mảng ["avietnam", "japan"]
      // Lấy các giá trị (địa điểm) của từng country (vd: Hà Nội, Cao Bằng)
      Object.entries(locations[country]).map(([id, name]) => ({
        id,
        name
      }))
    );
    return (
      <View key={post.item.id} style={styles.itemNewPostWrap}>
        <TouchableOpacity style={styles.authorNewPost} onPress={() => handleGoToProfileScreen(post.item.author.id)}>
          <Image style={{ width: 30, height: 30, borderRadius: 90 }} source={{ uri: post.item.author.avatar }} />
          <Text style={{ fontWeight: '500', paddingHorizontal: 4 }} numberOfLines={1}>
            {post.item.author.fullname}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.itemNewPostContent}
          onPress={() => {
            router.push({
              pathname: "/postDetail",
              params: { postId: post.item.id },
            })
          }}>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', elevation: 4, borderRadius: 10,}}>
            <Image style={{ width: '100%', borderRadius: 10, aspectRatio: 1 }} source={{ uri: post.item.thumbnail }}></Image>
          </View>
          <View style={{ flex: 1.5, paddingLeft: 10 }}>
            <View style={{ flexDirection: 'row' }}>
              <Text style={styles.textTitle}> {post.item.title}</Text>
            </View>
            <View style={{ flexDirection: 'row', flex: 1, alignItems: 'flex-start', flexWrap: 'wrap', padding: 2 }}>
              <Text style={{ fontWeight: '500', textAlign: 'center'}}>Địa điểm: </Text>
              {allLocations.map((location) => {
                return (<Badge size={22} key={location.id} style
                  ={{ marginHorizontal: 2, paddingHorizontal: 8}}>{location.name}</Badge>)
              })}
            </View>
            <Text style={{ fontStyle: 'italic', fontSize: 12, alignSelf: 'flex-end' }}>{formatDate(post.item.created_at)}</Text>
          </View>
        </TouchableOpacity>
      </View>
    )
  }
  // VIEW
  return (
    <View style={styles.container}>
      <View>
        {/* {((currentPostCount !== newPostCount)) && ( */}
        {/* <TouchableOpacity style={styles.loadNewPost} onPress={() => handleShowNewPost()}>
            <FontAwesome6 name="newspaper" size={20} color="black" />
            <Text style={styles.iconPost}>Bài viết mới</Text>
          </TouchableOpacity> */}
        {/* )} */}
        {/* <TouchableOpacity
          style={styles.filterBtn}
          onPress={() => setModalSearchVisible(true)}>
          <AntDesign name="filter" size={22} color="black" />
        </TouchableOpacity> */}

        {/* <TouchableOpacity style={styles.refreshBtn} onPress={() => handleReloadHomeScreen()}>
          <AntDesign name="reload1" size={22} color="black" />
        </TouchableOpacity> */}
      </View>
      {/* <View style={{ height: 460 }}> */}
      {/* Post list */}
      <View style={{ height: 580 }}>
        {dataPosts.length !== 0 ?
          loadedPosts ?
            <FlatList
              keyboardShouldPersistTaps="handled"
              // horizontal={true}
              // ref={flatListPostRef}
              nestedScrollEnabled={true}
              // scrollEnabled={false}
              showsVerticalScrollIndicator={true}
              data={dataPosts}
              extraData={dataPosts}
              renderItem={postItem}
              keyExtractor={(post: any) => post.id}
              contentContainerStyle={{ paddingVertical: 30, paddingHorizontal: 20, backgroundColor: iconColors.green2 }}
              ItemSeparatorComponent={() => <View style={{ height: 40 }} />} // Space between item
              // pagingEnabled //Scroll to next item
              onViewableItemsChanged={onViewableItemsChanged} // Theo dõi các mục hiển thị
              viewabilityConfig={viewabilityConfig} // Cấu hình cách xác định các mục hiển thị
              // Refresh control tích hợp
              refreshControl={
                <RefreshControl refreshing={false} onRefresh={() => console.log('refreshed')} />
              }
            />
            :
            <View>
              <Text style={{ fontSize: 28, color: '#c9c9c9', textAlign: 'center', marginTop: 60 }}>Đang tải dữ liệu bài viết</Text>
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

          // <SkeletonPost></SkeletonPost>
          :
          <View>
            <Text style={{ fontSize: 28, color: '#c9c9c9', textAlign: 'center', marginTop: 60 }}>Không có bài viết phù hợp</Text>
            <LottieView
              autoPlay
              style={{
                position: "absolute",
                top: 80,
                left: 0,
                width: width,
                height: 320,
              }}
              source={require('@/assets/images/noDataGif.json')}
            />
          </View>

        }
      </View>
      {/* Tìm kiếm */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalSearchVisible}
        statusBarTranslucent={true}
        onRequestClose={() => {
          // Alert.alert('Modal has been closed.');
          setModalSearchVisible(!modalSearchVisible);
        }}>
        <View style={styles.modalView}>
          <View style={styles.modalBottomView}>
            <View style={styles.modalTitleWrap}>
              <Text style={styles.modalTitleText}>Bộ lọc</Text>
              <Ionicons name="filter" size={24} color={iconColors.green1} />
            </View>
            <View style={{ width: 350 }}>
              <View style={styles.wrapLabelModalFilter}>
                <Text style={styles.textLabelModalFilter}>Nội dung</Text>
                <FontAwesome5 name="signature" size={18} color={iconColors.green1} />
              </View>
              <TextInput
                style={{ borderWidth: 1, borderRadius: 10, paddingHorizontal: 8, height: 48 }}
                placeholder="Nhập nội dung tìm kiếm"
                // onChangeText={(str) => setDataInput(str)} 
                onChangeText={(str) => setDataInput(str)}
              />
              <View style={styles.wrapLabelModalFilter}>
                <Text style={styles.textLabelModalFilter}>Quốc gia</Text>
                <FontAwesome name="globe" size={20} color={iconColors.green1} />
              </View>
              <SelectList
                setSelected={(val: any) => handleSelecteCountry(val)}
                data={dataCountries}
                maxHeight={120}
                save="key"
                placeholder='Chọn quốc gia'
                searchPlaceholder='Nhập tên quốc gia'
                notFoundText='Không tìm thấy quốc gia'
              // onSelect={(val: any)=>{console.log(val)}}
              // defaultOption={selectedCountry}
              />
              <View style={styles.wrapLabelModalFilter}>
                <Text style={styles.textLabelModalFilter}>Tỉnh/Thành phố</Text>
                <FontAwesome6 name="tree-city" size={18} color={iconColors.green1} />
              </View>
              <MultipleSelectList
                setSelected={(val: any) => handleSelecteCities(val)}
                data={dataCities}
                save="key"
                // onSelect={() => alert(selectedMultiList)}
                label="Categories"
                placeholder='Chọn tỉnh/thành phố'
                searchPlaceholder='Nhập tên tỉnh/thành phố'
                notFoundText='Không tìm thấy tỉnh/thành phố'
                maxHeight={230}
              />
              <View style={styles.wrapLabelModalFilter}>
                <Text style={styles.textLabelModalFilter}>Kiểu sắp xếp</Text>
                <FontAwesome6 name="filter" size={18} color={iconColors.green1} />
              </View>
              <SelectList
                search={false}
                setSelected={(val: any) => selectedTypeSearch.current = val}
                data={dataTypeSearch}
                maxHeight={120}
                save="key"
                defaultOption={{ key: 1, value: 'Mặc định' }}
              // onSelect={(val: any)=>{console.log(val)}}
              // defaultOption={selectedCountry}
              />
            </View>
            <View style={styles.modalFooter}>
              <Pressable
                style={[styles.buttonModal, styles.buttonSearch]}
                onPress={() => handleTapOnSearchButton(dataNewPostList, dataInput, selectedCountry, selectedCities)}>
                <Text style={[styles.textStyle, { color: 'white' }]}>Áp dụng</Text>
              </Pressable>
              <Pressable
                style={[styles.buttonModal, styles.buttonCancel]}
                onPress={() => handleCloseModalSearch()}>
                <Text style={styles.textStyle}>Hủy</Text>
              </Pressable>
            </View>
          </View>
          <View style={styles.overPlay}></View>
        </View>
      </Modal>

      {/* Bài viết mới */}
      <Modal
        animationType='slide'
        transparent={true}
        statusBarTranslucent={true}
        visible={modalNewPostVisible}
        // visible={true}
        onRequestClose={() => {
          Alert.alert('Modal has been closed.');
          setModalNewPostVisible(false);
        }}
      >
        <View style={styles.modalView}>
          <View style={[styles.modalBottomView, { height: '75%' }]}>
            <View style={styles.modalTitleWrap}>
              <Text style={styles.modalTitleText}>Bài viết mới</Text>
              <View style={{ position: 'relative' }}>
                <Ionicons name="newspaper" size={24} color={iconColors.green1} />
                <View style={{ position: 'absolute', right: -12, top: -12 }}>
                  <Foundation name="burst-new" size={26} color="red" />
                </View>
              </View>
            </View>
            <FlatList
              data={dataNewPosts}
              // data={[...dataPosts]}
              renderItem={newPostItem}
              ItemSeparatorComponent={() => <View style={{ height: 20 }} />}
              contentContainerStyle={{ paddingVertical: 20 }}
            />
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.buttonModal, styles.buttonSearch]}
                onPress={() => handleCloseAndReLoadModalNewPost()}>
                <Text style={[styles.textStyle, { color: 'white' }]}>Làm mới</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setModalNewPostVisible(false)}
                style={[styles.buttonModal, styles.buttonCancel]}
              >
                <Text style={styles.textStyle}>Đóng</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.overPlay}></View>
        </View>
      </Modal>
    </View>
  )
}
const styles = StyleSheet.create({
  modalFooter: {
    flexDirection: 'row',
    width: '100%',
    paddingVertical: 8,
    justifyContent: 'center',
    alignItems: 'center'
  },
  topicText: {
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'left',
    marginBottom: 4,
    color: 'white',
  },
  topicContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: "rgba(10, 10, 10, 0.6)",
    borderRadius: 20,
    padding: 10,
    marginBottom: 10,
    marginRight: 10
  },
  textTitle: {
    flex: 1,
    paddingHorizontal: 4,
    fontSize: 20,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 4
  },
  itemNewPostContent: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 8,
    backgroundColor: '#f9f9f9',
    elevation: 4,
    shadowRadius: 12,
    marginVertical: 8,
  },
  authorNewPost:{
    flexDirection: 'row', 
    borderRadius: 90, 
    backgroundColor: 'white', 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 4, 
    alignSelf: 'flex-start', 
    elevation: 4,
  },

  itemNewPostWrap: {
    borderRadius: 10,
    width: width - 30,
    padding: 10,
    backgroundColor: '#eeeeee',
    elevation: 4,
    shadowRadius: 12,
    // marginBottom: 15,
    marginHorizontal: 8
  },
  // Modal new posts
  modalView: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalBottomView: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    width: width,
    alignItems: 'center',
    zIndex: 4,
    borderBottomWidth: 1,
  },
  // Modal filter
  wrapLabelModalFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 6
  },
  textLabelModalFilter: {
    fontWeight: '500',
    marginVertical: 8,
    marginRight: 4,
    // backgroundColor:'green'
  },
  overPlay: {
    backgroundColor: 'black',
    // top: -40,
    height: Dimensions.get('window').height,
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
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  textStyle: {
    // color: 'white',
    fontWeight: '500',
    textAlign: 'center',
    fontSize: 16
  },
  buttonSearch: {
    backgroundColor: iconColors.green1,
  },
  buttonCancel: {
    backgroundColor: backgroundColors.background1,
    borderWidth: 1,
    borderColor: iconColors.green1
  },
  buttonModal: {
    padding: 10,
    borderRadius: 5,
    margin: 10,
    width: 100,
    elevation: 4
  },
  modalTitleText: {
    fontSize: 24,
    fontWeight: '600',
    marginRight: 10,
  },
  modalTitleWrap: {
    backgroundColor: iconColors.green2,
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    // borderBottomWidth: 1,
    // borderColor: iconColors.green1,
  },
  refreshBtn: {
    position: 'absolute',
    backgroundColor: '#fcfc8d',
    right: 50,
    top: 0,
    padding: 4,
    borderRadius: 5,
    elevation: 4
  },
  filterBtn: {
    position: 'relative',
    backgroundColor: '#b9e0f7',
    right: 10,
    top: 0,
    padding: 4,
    borderRadius: 5,
    elevation: 4
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
    backgroundColor: '#ffff77',
    transformOrigin: 'center',
    elevation: 6,
    zIndex: 5,
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
  imagePost: {
    // height: 400,
    height: '100%',
    width: width - 40,
    // backgroundColor: 'red',
    borderRadius: 30,
  },
  imagePostWrap: {
    height: '100%',
    elevation: 4
  },
  itemLocation: {
    padding: 0,
    fontSize: 14,
    width: 'auto',
    textAlign: 'center',
  },
  listLocations: {
    width: 'auto',
    top: 70,
  },
  flagBtn: {
    alignSelf: 'flex-end',
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
    flexDirection: 'row',
    backgroundColor: 'white',
    maxWidth: 200,
    padding: 6,
    marginTop: 10,
    borderRadius: 90,
    zIndex: 3,
    elevation: 4
  },
  item: {
    position: "relative",
    borderRadius: 30,
  },
  itemWrap: {
    backgroundColor: 'white',
    height: 420,
    elevation: 6,
    borderRadius: 30
  },
  btn: {
    // backgroundColor: "rgba(255, 255, 255, 0.3)",
    backgroundColor: 'white',
    height: 40,
    borderRadius: 90,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    margin: 10,
  },
  actionBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    // padding: 10,
  },
  liveModeWrap: {
  },
  header: {
    // backgroundColor: 'red',
    flexDirection: 'row',
    width: '100%',
    position: 'absolute',
    justifyContent: 'space-between',
    padding: 10,
    paddingTop: 0,
    zIndex: 3,
  },
  container: {
    position: 'relative',
  }
})
export default PostList