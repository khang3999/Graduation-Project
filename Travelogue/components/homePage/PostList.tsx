import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Pressable, Modal, Alert, TextInput, Dimensions, RefreshControl } from 'react-native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { database, get, ref, update } from '@/firebase/firebaseConfig'
import { useHomeProvider } from '@/contexts/HomeProvider'
import { countMatchingLocations, mergeWithRatio, slug, sortTourAtHomeScreen } from '@/utils'
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router'
import LottieView from 'lottie-react-native'
import { useAccount } from '@/contexts/AccountProvider'
import { backgroundColors, bagdeColors, iconColors } from '@/assets/colors'
import PostItem, { PostModal } from './PostItem'
import { FlashList } from "@shopify/flash-list";
import { equalTo, orderByChild, query } from 'firebase/database'
const { width } = Dimensions.get('window')


const PostList = () => {
  const TYPE = { post: 0, tour: 1 };
  const {
    userId,
    dataPosts, setDataPosts,
    setCurrentPostCount,
    dataAccount,
    dataNewPostList, setDataNewPostList,
    dataTours,
    dataToursSorted, setDataToursSorted,
    modalNewPostVisible, setModalNewPostVisible,
    reload, setReload,
    search, setSearch,
    isLoading, setIsLoading,
    // ModalSearch
    modalSearchVisible, setModalSearchVisible,
    dataInput,
    dataCountries,
    selectedCountry,
    dataCities, setDataCities,
    selectedCities, setSelectedCities,
    dataTypeSearch,
    selectedTypeSearch,
    dataModalSelected, setDataModalSelected,
  }: any = useHomeProvider();


  // Lưu giá trị các thành phố dựa trên quốc gia đang chọn
  // const [dataCities, setDataCities] = useState([])
  // const [selectedCountry, setSelectedCountry] = useState(null); // Dữ liệu để sort(Lưu vào behavior khi bấm sort)
  // const selectedCountry = useRef(null)
  // const [selectedCities, setSelectedCities] = useState([]); // Dữ liệu để sort(Lưu vào behavior khi bấm sort)
  // const dataInPut = useRef('')
  // const [modalVisible, setModalVisible] = useState(false);
  // const [modalNewPostVisible, setModalNewPostVisible] = useState(false);
  const [dataNewPosts, setDataNewPosts] = useState([]); // Chứa các bài viết mới đc thêm trên firebase
  const allLocationIdFromPost = useRef([])
  const flatListPostRef: any = useRef(null)
  const { setSearchedAccountData, likedPostsList, setLikedPostsList, }: any = useAccount();
  const { selectedCityId, content }: any = useLocalSearchParams();

  // ĐỊNH NGHĨA CÁC HÀM 
  // Hàm search . Khi tap vào button search thì lưu giá trị các biến đã chọn qua 1 biến khác để hiển thị ở home, và set lại giá trị default cho các biến đó
  // const handleTapOnSearchButton = useCallback(() => {
  //   // if (!(dataInput === '' && selectedCountry === null && selectedCities.length === 0)) {
  //   if (!(dataInPut.current === '' && selectedCountry.current === null && selectedCities.length === 0)) {
  //     setIsLoading(true)
  //     setSearch((prev: Boolean) => !prev) // Chay ham search
  //   }
  //   // Chi dong modal
  //   setModalSearchVisible(false)
  // }, [])

  const searchPost = useCallback(async (dataPosts: any, dataInput: any, selectedCountry: any, selectedCities: any) => {
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
      await update(refBehaviors, dataUpdate);
      // Lưu các giá trị đã chọn vào biến để hiển thị ở home
      const dataOfModalSelected = {
        'input': dataInput,
        'country': selectedCountry ? selectedCountry.value : '', // Chỉ cần lưu tên để hiển thị
        'cities': selectedCities
      }
      setDataModalSelected(dataOfModalSelected)

      if (dataPosts) {
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
        setIsLoading(false)
        // Bước 3: Return lại mảng
        return matchingPost.length > 0 ? matchingPost : [];
        // setDataPosts(matchingPost)
      } else {
        console.log("No dataPosts, invalid");
        return []
      }
    }
    return []
  }, [])

  const handleSearch = useCallback(async () => {
    console.log(selectedCities, 'check selected cities');

    const resultSearch = await searchPost(dataPosts, dataInput.current, selectedCountry.current, selectedCities);
    setDataPosts(resultSearch);
    // clear data các biến select 
    dataInput.current = ''
    selectedCountry.current = null
    setSelectedCities([])
    setDataCities([])
  }, [selectedCities, dataPosts])

  // Xử lí tìm kiếm bài viết của modal search
  useEffect(() => {
    handleSearch()
  }, [search])

  const fetchPosts = useCallback(async () => {
    try {
      const refPosts = ref(database, 'posts/')
      const postsQuery = query(refPosts, orderByChild('status_id'), equalTo(1));
      const snapshot = await get(postsQuery);
      if (snapshot.exists()) {
        const dataPostsJson = snapshot.val()
        const dataPostsArray = Object.values(dataPostsJson)
        return dataPostsArray
      } else {
        console.log("No data post available");
      }
    } catch (error) {
      console.error("Error fetching post data: ", error);
    }
    return []; // đảm bảo luôn trả về mảng
  }, [])

  const sortPostListByBehavior = useCallback((list: any, behavior: any) => {
    // Ý tưởng: chuyển mảng data thành 2 mảng con và trộn (3 bước: tạo 2 mảng con, sort, trộn)
    //Bước 1: Phân loại bài viết thành 2 mảng (MỤC TIÊU)
    const behaviorPosts: any = [];
    const nonBehaviorPosts: any = [];
    const behaviorContentSlug = slug(behavior?.content || '')
    const listBehaviorLocation = behavior?.location ? behavior?.location : []
    // Trường hợp behavior.location is null - mới tạo account (behavior.content =  '') và chỉ tìm kiếm theo nội dung (behavior.content =  ''), không chọn địa điểm
    //Mới tạo account -  behavior.content = '' && behavior.location = null: 
    // 0 - 0
    // Chỉ sắp xếp theo thời gian - mặc định

    if (listBehaviorLocation.length == 0 && behaviorContentSlug == '') {
      list = list.sort((postA: any, postB: any) => {
        return (postB.created_at || 0) - (postA.created_at || 0);
      })
      return list // ĐÃ RETURN
    }
    // Chắc chắn có nội dung hoặc địa điểm : 0 - 1 || 1 - 0 || 1 - 1 
    list.forEach((post: any) => {
      post.match = 0 // Khởi tạo lại match - lưu độ lệch
      const contentOfPostSlug = slug(post.content) // Nội dung của bài viết
      let matchingContent = 0
      // BƯỚC 1: CHUẨN BỊ
      // Tiêu chí 1: Nội dung
      if (contentOfPostSlug.includes(behaviorContentSlug)) { // Đúng cả 2 case khi behaviorContentSlug = '' và != ''
        // Nếu không nhập nội dung => tất cả bài viết đều được -1 điểm
        // Nếu có nhập nội dung => bài nào trùng khớp thì được -1 không trùng thì không được -1 (closestValue lớn -> ít ưu tiên hơn)
        matchingContent = 1 // Điều kiện để được push vào mảng: khi có hoặc không có địa điểm trùng có tìm theo nội dung TH: 1 - 0
        post.match -= 1 // Điều kiện để sắp xếp mảng khi dùng closestValue
      }

      // Tiêu chí 2: Địa điểm - Tính độ gần đúng của location --START--
      const listLocationIdOfPost = Object.keys(post.locations).flatMap((country) =>
        Object.keys(post.locations[country])
      );

      // countMatchingLocation <= số phần tử của listLocationIdOfPost
      const countMatchingLocation = countMatchingLocations(listLocationIdOfPost, listBehaviorLocation)

      // Tính độ lệch, càng trùng khớp nhiều thì giá trị càng nhỏ max = 0 <=> trùng 100%
      const closestValue = Math.abs(listLocationIdOfPost.length - countMatchingLocation);
      // Cập nhật độ lệch của bài viết so với tiêu chí
      post.match += closestValue // cập nhật match
      //Tính độ gần đúng của location --END--

      //BƯỚC 2: PHÂN LOẠI THÀNH 2 MẢNG  
      // TH1: Chắc chắn có trùng địa điểm
      if (countMatchingLocation != 0) {
        behaviorPosts.push(post)
        // TH2: Có chọn địa điểm nhưng không trùng khớp
        // 2.1 Có nhập nội dung nhưng không có trùng, vì matchingContent luôn = 1 chỉ khi không trùng khớp mới = 0
      } else if (matchingContent == 0) {
        nonBehaviorPosts.push(post)
        // 2.2 Không nhập nội dung content = '' khi đó matchingContent luôn = 1
      } else if (behaviorContentSlug == '') {
        nonBehaviorPosts.push(post)
      } else { // Có nhập và có trùng nội dung
        behaviorPosts.push(post)
      }
    })

    // BƯỚC 3: SẮP XẾP MẢNG
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
    // BƯỚC 4: TRỘN 2 MẢNG
    const mergedPosts = mergeWithRatio(behaviorPosts, nonBehaviorPosts, 2, 1)
    return mergedPosts
  }, [])

  // Hàm lấy lại các tour từ firebase khi mỗi lần focus và khi reload 
  const fetchTours = useCallback(async () => {
    try {
      const refTours = ref(database, 'tours/')
      const toursQuery = query(refTours, orderByChild('status_id'), equalTo(1));
      const snapshot = await get(toursQuery);
      if (snapshot.exists()) {
        const dataToursJson = snapshot.val()
        const dataToursArray = Object.values(dataToursJson) // Array all tours from firebase
        // Sắp xếp lại list tour theo thứ tự
        return dataToursArray
      } else {
        console.log("No data available");
      }
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
    return []
  }, [])

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

  const reloadHomeScreen = useCallback(async () => {
    // Xử lí
    // Lấy list bài viết mới nhất
    const newPostsList = await fetchPosts()
    // Lấy list tour mới nhất
    const newToursList = await fetchTours();
    // Lấy hành vi mới nhất của người dùng
    const newBehavior = await fetchBehavior(userId)
    // Cập nhật danh sách tour mới nhất
    dataTours.current = newToursList;
    // Sắp xếp danh sách bài viết theo hành vi mới nhất
    setDataPosts(sortPostListByBehavior(newPostsList, newBehavior))
    // setDataPosts(sortPostListByBehavior(newPostsList, accountBehavior))
    // Clear data
    dataInput.current = ''
    selectedCountry.current = null
    setSelectedCities([])
    setDataCities([])
    selectedTypeSearch.current = 1
    setDataModalSelected(null)
    setCurrentPostCount(newPostsList.length)
    setModalNewPostVisible(false)
    setModalSearchVisible(false)
    setIsLoading(false)
  }, [])

  // Khi focus chạy đầu tiên - 90%
  useFocusEffect(
    useCallback(() => {
      // Scroll to first item in list 
      if (flatListPostRef.current) {
        flatListPostRef.current.scrollToOffset({ animated: true, offset: 0 });
      }
      setModalNewPostVisible(false)
      setModalSearchVisible(false);
      if (selectedCityId) { // Khi tap vào xem bài viết hoặc xem tour từ màn hình map
        if (dataPosts.length === 0) {
          searchPost(dataNewPostList, content, null, [selectedCityId])
        } else {
          searchPost(dataPosts, content, null, [selectedCityId])
        }
      } else { // Chuyển giữa các màn hình trong stack
        console.log('22');
        reloadHomeScreen()
      }
      return () => {
        console.log('Screen is unfocused');
      };
    }, [selectedCityId, content, reload]) // Cập nhật khi các giá trị này thay đổi
  );

  // Hàm sắp xếp tour theo LocationId của bài viết - DONE
  const sortToursByPostLocationId = useCallback(() => {
    const arrayToursSorted = sortTourAtHomeScreen(dataTours.current, allLocationIdFromPost.current)
    setDataToursSorted(arrayToursSorted)
  }, [])

  //Khi reload và khi thay đổi post hiển thị thì sort lại tour: 3 - DONE
  useEffect(() => {
    if (allLocationIdFromPost.current) {
      sortToursByPostLocationId()
    }
  }, [allLocationIdFromPost.current, dataTours.current])

  // CÁC HÀM XỬ LÍ SỰ KIỆN
  // Hàm xem chi tiết bài viết
  const handleTapToViewPostDetail = useCallback((path: any, postId: string) => {
    router.push({
      pathname: path,
      params: { postId: postId },
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

  // Xử lý sự kiện khi item hiển thị thay đổi - DONE
  const onViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      // Xử lí lưu bài viết đang hiển thị ra biến toàn cục để đổ list tour theo chủ đề của bài viết
      const locations = viewableItems[0].item.locations
      // Lấy tất cả các locationId <=> id của tỉnh thành trong từng bài post ['vn_1', 'jp_1']
      const allLocationIds: any = Object.keys(locations).flatMap((country) =>
        Object.keys(locations[country])
      );
      allLocationIdFromPost.current = allLocationIds
    }
  }, [])

  // ITEM RENDER
  const postItem = useCallback((post: any) => { // từng phần tử trong data có dạng {"index": 0, "item":{du lieu}} co the thay the post = destructuring {item, index}    
    const postData: PostModal = post.item
    const itemIndex = post.index
    return (
      <PostItem
        index={itemIndex}
        // userId={userId}
        data={postData}
        liked={postData.id in likedPostsList}
        onTapToViewDetail={handleTapToViewPostDetail}
        onTapToViewProfile={handleTapToViewProfile}
      ></PostItem>
    )
  }, [likedPostsList])
  // VIEW
  return (
    <View style={styles.container}>
      {/* Post list */}
      <View style={{ height: 500, width: width }}>
        {
          dataPosts.length !== 0 ?
            !isLoading ?
              <FlatList
                keyboardShouldPersistTaps="handled"
                horizontal={true}
                ref={flatListPostRef}
                nestedScrollEnabled={true}
                showsVerticalScrollIndicator={true}
                showsHorizontalScrollIndicator={true}
                data={dataPosts}
                extraData={dataPosts}
                renderItem={postItem}
                keyExtractor={(post: any) => {
                  return post.id.toString()
                }}
                contentContainerStyle={{ paddingVertical: 40, paddingHorizontal: 20, backgroundColor: iconColors.green2 }}
                ItemSeparatorComponent={() => <View style={{ width: 40 }} />}
                pagingEnabled={true}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={{ itemVisiblePercentThreshold: 80 }}
                initialNumToRender={1}
                maxToRenderPerBatch={1}
              // refreshing={isLoading}
              // onRefresh={reloadHomeScreen}
              />
              // <FlashList
              //   horizontal={true}
              //   renderItem={postItem}
              //   data={dataPosts}
              //   ref={flatListPostRef}
              //   estimatedItemSize={width} // Quan trọng
              //   nestedScrollEnabled={true}
              //   keyExtractor={(post: any) => {return post.id.toString()}}
              //   ItemSeparatorComponent={() => <View style={{ width: 40 }} />}
              //   contentContainerStyle={{ paddingVertical: 40, paddingHorizontal: 20, backgroundColor: iconColors.green2 }}
              //   estimatedFirstItemOffset={20}
              //   viewabilityConfig={{ itemVisiblePercentThreshold: 80 }}
              //   onViewableItemsChanged={onViewableItemsChanged}
              //   pagingEnabled
              // />
              :
              <View style={{ width: '100%' }}>
                <Text style={{ width: '100%', fontSize: 28, color: '#c9c9c9', textAlign: 'center', marginTop: 60 }}>Đang tải dữ liệu bài viết</Text>
                <LottieView
                  autoPlay
                  style={{
                    // position: "absolute",
                    top: 80,
                    left: 0,
                    right: 0,
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
    </View >
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
  authorNewPost: {
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
    width: '100%'
  }
})
export default PostList