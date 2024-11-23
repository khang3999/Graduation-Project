import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Pressable, Modal, Alert, TextInput, Dimensions } from 'react-native'
import React, { useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { Badge, Divider, IconButton, MD3Colors, Menu, PaperProvider } from 'react-native-paper'
import { database, ref } from '@/firebase/firebaseConfig'
import { equalTo, get, orderByChild, query, update } from '@firebase/database'
import { useHomeProvider } from '@/contexts/HomeProvider'
import SkeletonPost from '@/components/skeletons/SkeletonPost'
import { formatDate } from '@/utils/commons'
import { AntDesign, FontAwesome6 } from '@expo/vector-icons'
import { countMatchingLocations, mergeWithRatio, slug, sortTourAtHomeScreen } from '@/utils'
import { MultipleSelectList, SelectList } from 'react-native-dropdown-select-list'
import AsyncStorage from '@react-native-async-storage/async-storage'
import ActionBar from '../actionBars/ActionBar'
import Toast from 'react-native-toast-message-custom'
import { router, useFocusEffect } from 'expo-router'
import { usePost } from '@/contexts/PostProvider'
import { debounce, set } from 'lodash'
import LottieView from 'lottie-react-native'

const { width } = Dimensions.get('window')


const PostList = () => {
  const TYPE = 0;
  const {
    dataPosts, setDataPosts,
    currentPostCount, setCurrentPostCount,
    newPostCount,
    accountBehavior, setAccountBehavior,
    loadedDataAccount, setLoadedDataAccount,
    loadedPosts, setLoadedPosts,
    loadedTours, setLoadedTours,
    dataCountries, setDataCountries,
    isSearchingMode, setIsSearchingMode,
    dataModalSelected, setDataModalSelected,
    dataAccount,
    selectedTypeSearch,
    dataNewPostList, setDataNewPostList,
    dataTours, setDataTours,
    dataToursSorted, setDataToursSorted
  }: any = useHomeProvider();


  // Lưu giá trị các thành phố dựa trên quốc gia đang chọn
  const [dataCities, setDataCities] = useState([])
  const [selectedCountry, setSelectedCountry] = useState(null); // Dữ liệu để sort(Lưu vào behavior khi bấm sort)
  const [selectedCities, setSelectedCities] = useState([]); // Dữ liệu để sort(Lưu vào behavior khi bấm sort)
  const [dataInput, setDataInput] = useState('') // Dữ liệu để sort(Lưu vào behavior khi bấm sort)
  const [modalVisible, setModalVisible] = useState(false);
  const [modalNewPostVisible, setModalNewPostVisible] = useState(false);
  const [dataNewPosts, setDataNewPosts] = useState([]); // Chứa các bài viết mới đc thêm trên firebase
  const [allLocationIdFromPost, setAllLocationIdFromPost] = useState([])
  const flatListPostRef: any = useRef(null)
  const temp = [
    {
      "title": "aaaaaaaa",
      "author": {
        "avatar": "https://firebasestorage.googleapis.com/v0/b/travelogue-abb82.appspot.com/o/accounts%2FW5yixxZoQiZ4eg6CGrF0jrdMsDy2%2Fpapers%2Favatar.png?alt=media&token=15f0e28e-a7a6-49b9-b813-0602c9f65729",
        "fullname": "Đỗ Ngọc Hiếu",
        "id": "W5yixxZoQiZ4eg6CGrF0jrdMsDy2"
      },
      "content": "# ,bjxc,sB<br><br>lsalsahl<br><br>## **Ngày 1:** mbmb<br><br>hg<br><br>### 11:00 - n.m,<br><br>**Địa điểm:** Triệu Sơn, Huyện Triệu Sơn, Tỉnh Thanh Hóa, Việt Nam",
      "created_at": 1731602794165,
      "id": "-OBfZRWwYCSSjGw0xt7X",
      "images": {
        "avietnam": {
          "vn_26": {
            "city_name": "Nghệ An",
            "images_value": [
              "https://firebasestorage.googleapis.com/v0/b/travelogue-abb82.appspot.com/o/posts%2F-OBfZRWwYCSSjGw0xt7X%2Fimages%2Fd424dfa0-c92a-413a-a114-e2fe44f321a9.jpeg?alt=media&token=11dc45d1-cab9-457f-bf7f-36ecd1bb122f",
              "https://firebasestorage.googleapis.com/v0/b/travelogue-abb82.appspot.com/o/posts%2F-OBfZRWwYCSSjGw0xt7X%2Fimages%2Fcde429d3-a8ed-4345-ae5f-098118b55467.jpeg?alt=media&token=47fdd233-998b-48ef-9a7a-2f7e07049dd4"
            ]
          }
        }
      },
      "likes": 1,
      "locations": {
        "avietnam": {
          "vn_26": "Nghệ An"
        }
      },
      "match": 0,
      "reports": 0,
      "status_id": 1,
      "thumbnail": "https://firebasestorage.googleapis.com/v0/b/travelogue-abb82.appspot.com/o/posts%2F-OBfZRWwYCSSjGw0xt7X%2Fimages%2Fd424dfa0-c92a-413a-a114-e2fe44f321a9.jpeg?alt=media&token=11dc45d1-cab9-457f-bf7f-36ecd1bb122f"
    },
    {
      "title": "aaaaaaaa",
      "author": {
        "avatar": "https://firebasestorage.googleapis.com/v0/b/travelogue-abb82.appspot.com/o/accounts%2FW5yixxZoQiZ4eg6CGrF0jrdMsDy2%2Fpapers%2Favatar.png?alt=media&token=ab3a8c4c-557b-4614-9eee-1286b76feaba",
        "fullname": "Đỗ Ngọc Hiếu",
        "id": "W5yixxZoQiZ4eg6CGrF0jrdMsDy2"
      },
      "content": "# Hà Tĩnh Nghệ An<br><br>hzhzjs<br><br>## **Ngày 1:** hshsh<br><br>đjjjs<br><br>### 08:00 - dhhsjs<br><br>**Địa điểm:** Quảng Cư, Huyện Thạch Thành, Tỉnh Thanh Hóa, Việt Nam",
      "created_at": 1731659357787,
      "id": "-OBiwCvrf1u5DV4N6YBU",
      "images": {
        "avietnam": {
          "vn_26": {
            "city_name": "Nghệ An",
            "images_value": [
              "https://firebasestorage.googleapis.com/v0/b/travelogue-abb82.appspot.com/o/posts%2F-OBiwCvrf1u5DV4N6YBU%2Fimages%2F75f7cc80-87dd-459c-a7dd-6c4e799a6c13.jpeg?alt=media&token=c8c01b5c-ede9-4778-8ec4-166cd4b3ceab"
            ]
          },
          "vn_27": {
            "city_name": "Hà Tĩnh",
            "images_value": [
              "https://firebasestorage.googleapis.com/v0/b/travelogue-abb82.appspot.com/o/posts%2F-OBiwCvrf1u5DV4N6YBU%2Fimages%2Fd6aaa101-6773-42ce-82f9-5177daa86b4c.jpeg?alt=media&token=02374da4-3947-4c42-af95-82512ff865a2"
            ]
          }
        }
      },
      "likes": 0,
      "locations": {
        "avietnam": {
          "vn_26": "Nghệ An"
        }
      },
      "match": 0,
      "reports": 0,
      "status_id": 1,
      "thumbnail": "https://firebasestorage.googleapis.com/v0/b/travelogue-abb82.appspot.com/o/posts%2F-OBiwCvrf1u5DV4N6YBU%2Fimages%2F75f7cc80-87dd-459c-a7dd-6c4e799a6c13.jpeg?alt=media&token=c8c01b5c-ede9-4778-8ec4-166cd4b3ceab"
    },
    {
      "title": "aaaaaaaa",
      "author": {
        "avatar": "https://firebasestorage.googleapis.com/v0/b/travelogue-abb82.appspot.com/o/accounts%2Fd9Sk3mnsx8MXOF2RAOeO79WaUEi2%2Fpapers%2Favatar.png?alt=media&token=ad0f06ed-5b77-4780-b456-86bec9878d45",
        "fullname": "Trần Trung Chiến",
        "id": "d9Sk3mnsx8MXOF2RAOeO79WaUEi2"
      },
      "comments": {
        "-OBuwTiiMYSwHofXleMd": {
          "author": {
            "avatar": "https://firebasestorage.googleapis.com/v0/b/travelogue-abb82.appspot.com/o/accounts%2FxTVHqFbyhTPwlzWDZI7xwEVVTL93%2Fpapers%2Favatar.png?alt=media&token=439cc245-007f-4323-a237-e99570237650",
            "fullname": "Trần Hiếu Phúc ",
            "id": "xTVHqFbyhTPwlzWDZI7xwEVVTL93"
          },
          "content": "Hi",
          "created_at": 1731860752743,
          "id": "-OBuwTiiMYSwHofXleMd",
          "reports": 0,
          "status_id": 1
        },
        "-OBuwVSLv0MK_XXE6l-y": {
          "author": {
            "avatar": "https://firebasestorage.googleapis.com/v0/b/travelogue-abb82.appspot.com/o/accounts%2FxTVHqFbyhTPwlzWDZI7xwEVVTL93%2Fpapers%2Favatar.png?alt=media&token=439cc245-007f-4323-a237-e99570237650",
            "fullname": "Trần Hiếu Phúc ",
            "id": "xTVHqFbyhTPwlzWDZI7xwEVVTL93"
          },
          "content": "Chào",
          "created_at": 1731860759825,
          "id": "-OBuwVSLv0MK_XXE6l-y",
          "reports": 0,
          "status_id": 1
        },
        "-OBuwZ40Xk7SHiDfSM0t": {
          "author": {
            "avatar": "https://firebasestorage.googleapis.com/v0/b/travelogue-abb82.appspot.com/o/accounts%2FxTVHqFbyhTPwlzWDZI7xwEVVTL93%2Fpapers%2Favatar.png?alt=media&token=439cc245-007f-4323-a237-e99570237650",
            "fullname": "Trần Hiếu Phúc ",
            "id": "xTVHqFbyhTPwlzWDZI7xwEVVTL93"
          },
          "content": "Bạn tên gì",
          "created_at": 1731860774652,
          "id": "-OBuwZ40Xk7SHiDfSM0t",
          "parentId": "-OBuwVSLv0MK_XXE6l-y",
          "reports": 0,
          "status_id": 1
        },
        "-OBuwe1sIrVyxm9sXR2T": {
          "author": {
            "avatar": "https://firebasestorage.googleapis.com/v0/b/travelogue-abb82.appspot.com/o/accounts%2FxTVHqFbyhTPwlzWDZI7xwEVVTL93%2Fpapers%2Favatar.png?alt=media&token=439cc245-007f-4323-a237-e99570237650",
            "fullname": "Trần Hiếu Phúc ",
            "id": "xTVHqFbyhTPwlzWDZI7xwEVVTL93"
          },
          "content": "Đẹp quá",
          "created_at": 1731860799091,
          "id": "-OBuwe1sIrVyxm9sXR2T",
          "reports": 0,
          "status_id": 1
        },
        "-OBuwghcyQaUJmfy1JL0": {
          "author": {
            "avatar": "https://firebasestorage.googleapis.com/v0/b/travelogue-abb82.appspot.com/o/accounts%2FxTVHqFbyhTPwlzWDZI7xwEVVTL93%2Fpapers%2Favatar.png?alt=media&token=439cc245-007f-4323-a237-e99570237650",
            "fullname": "Trần Hiếu Phúc ",
            "id": "xTVHqFbyhTPwlzWDZI7xwEVVTL93"
          },
          "content": "Xinh",
          "created_at": 1731860810019,
          "id": "-OBuwghcyQaUJmfy1JL0",
          "reports": 0,
          "status_id": 1
        },
        "-OBuwgvo_ld5L3p3xYI0": {
          "author": {
            "avatar": "https://firebasestorage.googleapis.com/v0/b/travelogue-abb82.appspot.com/o/accounts%2FxTVHqFbyhTPwlzWDZI7xwEVVTL93%2Fpapers%2Favatar.png?alt=media&token=439cc245-007f-4323-a237-e99570237650",
            "fullname": "Trần Hiếu Phúc ",
            "id": "xTVHqFbyhTPwlzWDZI7xwEVVTL93"
          },
          "content": "Xinh",
          "created_at": 1731860810927,
          "id": "-OBuwgvo_ld5L3p3xYI0",
          "reports": 0,
          "status_id": 1
        },
        "-OBux8uc2qjm_oTjnHpb": {
          "author": {
            "avatar": "https://firebasestorage.googleapis.com/v0/b/travelogue-abb82.appspot.com/o/accounts%2FxTVHqFbyhTPwlzWDZI7xwEVVTL93%2Fpapers%2Favatar.png?alt=media&token=439cc245-007f-4323-a237-e99570237650",
            "fullname": "Trần Hiếu Phúc ",
            "id": "xTVHqFbyhTPwlzWDZI7xwEVVTL93"
          },
          "content": "Chào",
          "created_at": 1731860929635,
          "id": "-OBux8uc2qjm_oTjnHpb",
          "parentId": "-OBuwVSLv0MK_XXE6l-y",
          "reports": 0,
          "status_id": 1
        },
        "-OBuxBkQLby5zW6pxvnB": {
          "author": {
            "avatar": "https://firebasestorage.googleapis.com/v0/b/travelogue-abb82.appspot.com/o/accounts%2FxTVHqFbyhTPwlzWDZI7xwEVVTL93%2Fpapers%2Favatar.png?alt=media&token=439cc245-007f-4323-a237-e99570237650",
            "fullname": "Trần Hiếu Phúc ",
            "id": "xTVHqFbyhTPwlzWDZI7xwEVVTL93"
          },
          "content": "Pp",
          "created_at": 1731860941270,
          "id": "-OBuxBkQLby5zW6pxvnB",
          "reports": 0,
          "status_id": 1
        },
        "-OBxmh0HVPCzUHyntZof": {
          "author": {
            "avatar": "https://firebasestorage.googleapis.com/v0/b/travelogue-abb82.appspot.com/o/accounts%2FW5yixxZoQiZ4eg6CGrF0jrdMsDy2%2Fpapers%2Favatar.png?alt=media&token=ab3a8c4c-557b-4614-9eee-1286b76feaba",
            "fullname": "Đỗ Ngọc Hiếu",
            "id": "W5yixxZoQiZ4eg6CGrF0jrdMsDy2"
          },
          "content": "Aa",
          "created_at": 1731908521466,
          "id": "-OBxmh0HVPCzUHyntZof",
          "reports": 0,
          "status_id": 1
        },
        "-OBxmq4Vl-_qRYhRSEds": {
          "author": {
            "avatar": "https://firebasestorage.googleapis.com/v0/b/travelogue-abb82.appspot.com/o/accounts%2FW5yixxZoQiZ4eg6CGrF0jrdMsDy2%2Fpapers%2Favatar.png?alt=media&token=ab3a8c4c-557b-4614-9eee-1286b76feaba",
            "fullname": "Đỗ Ngọc Hiếu",
            "id": "W5yixxZoQiZ4eg6CGrF0jrdMsDy2"
          },
          "content": "Hhh",
          "created_at": 1731908558602,
          "id": "-OBxmq4Vl-_qRYhRSEds",
          "reports": 0,
          "status_id": 1
        },
        "-OByM-wTUJR6p18Vmf5L": {
          "author": {
            "avatar": "https://firebasestorage.googleapis.com/v0/b/travelogue-abb82.appspot.com/o/accounts%2FW5yixxZoQiZ4eg6CGrF0jrdMsDy2%2Fpapers%2Favatar.png?alt=media&token=ab3a8c4c-557b-4614-9eee-1286b76feaba",
            "fullname": "Đỗ Ngọc Hiếu",
            "id": "W5yixxZoQiZ4eg6CGrF0jrdMsDy2"
          },
          "content": "Fu.ckk",
          "created_at": 1731918039373,
          "id": "-OByM-wTUJR6p18Vmf5L",
          "reports": 0,
          "status_id": 1
        },
        "-OByM7h8meCrK-WNHmij": {
          "author": {
            "avatar": "https://firebasestorage.googleapis.com/v0/b/travelogue-abb82.appspot.com/o/accounts%2FW5yixxZoQiZ4eg6CGrF0jrdMsDy2%2Fpapers%2Favatar.png?alt=media&token=ab3a8c4c-557b-4614-9eee-1286b76feaba",
            "fullname": "Đỗ Ngọc Hiếu",
            "id": "W5yixxZoQiZ4eg6CGrF0jrdMsDy2"
          },
          "content": "<<<",
          "created_at": 1731918071156,
          "id": "-OByM7h8meCrK-WNHmij",
          "reports": 0,
          "status_id": 1
        }
      },
      "content": "# fjcnfkccjfjfiffkfjfjffcjcjcjcncksncjdncisbcxkcncnc cjcjcjcncksncjdncisbcxkcncnc có thể làm được điều đó không phải là người có thể làm được điều đó không phải là người có thể làm được điều đó không phải <br><br>cjcjcjcncksncjdncisbcxkcncnc cjcjcjcncksncjdncisbcxkcncnc có thể làm được điều đó không phải là người có thể làm được điều đó không phải là người có thể làm được điều đó không phải là người có thể làm được điều đó không phải làm sao để biết thêm thông tin về các vấn đề này k v a private message to k bạn có thể làm được điều đó không phải là người có thể làm được điều đó không phải người có thể làm được điều đó không phải là người có thể làm được điều đó không phải là người có thể làm được duy trì được điều đó không phải là người có thể làm được điều đó không phải là người có thể làm được điều đó không phải là người có thể làm được điều đó không phải là người có thể làm được điều đó không phải là <br><br>## **Ngày 1:** y<br><br>cjx<br><br>### 00:00 - cc<br><br>**Địa điểm:** Kon Đào, Huyện Đăk Tô, Tỉnh Kon Tum, 50000, Việt Nam",
      "created_at": 1731661735938,
      "id": "-OBj4HT9Ll0JnoJMccKp",
      "images": {
        "avietnam": {
          "vn_30": {
            "city_name": "Thừa Thiên-Huế",
            "images_value": [
              "https://firebasestorage.googleapis.com/v0/b/travelogue-abb82.appspot.com/o/posts%2F-OBj4HT9Ll0JnoJMccKp%2Fimages%2F38064344-07f7-416d-a181-850e8c65c9a7.jpeg?alt=media&token=379b446d-2647-4893-8074-7f29e8d62d34",
              "https://firebasestorage.googleapis.com/v0/b/travelogue-abb82.appspot.com/o/posts%2F-OBj4HT9Ll0JnoJMccKp%2Fimages%2Feae17da8-35f7-4224-920f-6e4eea7f66ee.jpeg?alt=media&token=7e2c3800-5287-4de7-8535-916918479b99",
              "https://firebasestorage.googleapis.com/v0/b/travelogue-abb82.appspot.com/o/posts%2F-OBj4HT9Ll0JnoJMccKp%2Fimages%2Fc17d6044-dbb5-4246-b700-4a0ab0f600e1.jpeg?alt=media&token=df3b522e-d411-4a32-b3c3-0c0025ad10e3",
              "https://firebasestorage.googleapis.com/v0/b/travelogue-abb82.appspot.com/o/posts%2F-OBj4HT9Ll0JnoJMccKp%2Fimages%2Ff0dcf311-5916-46a0-b6e9-9eb959d28843.jpeg?alt=media&token=c9e9e441-886f-4205-a742-211013c0375a",
              "https://firebasestorage.googleapis.com/v0/b/travelogue-abb82.appspot.com/o/posts%2F-OBj4HT9Ll0JnoJMccKp%2Fimages%2F88c828c5-40b1-454a-bbec-d940e29697ff.png?alt=media&token=9686b5d4-d9ec-450b-b40f-61f27cd84b11"
            ]
          }
        }
      },
      "likes": 2,
      "locations": {
        "avietnam": {
          "vn_28": "Quảng Bình",
          "vn_30": "Thừa Thiên-Huế"
        }
      },
      "match": 0,
      "reports": 0,
      "status_id": 1,
      "thumbnail": "https://firebasestorage.googleapis.com/v0/b/travelogue-abb82.appspot.com/o/posts%2F-OBj4HT9Ll0JnoJMccKp%2Fimages%2F38064344-07f7-416d-a181-850e8c65c9a7.jpeg?alt=media&token=379b446d-2647-4893-8074-7f29e8d62d34"
    }
  ]
  const dataTypeSearch = [
    { key: 1, value: 'Mặc định' },
    { key: 2, value: 'Thích nhiều nhất' }
  ]

  useEffect(() => {
    if (flatListPostRef.current) {
      flatListPostRef.current.scrollToOffset({ offset: 0, animated: true });
    }
  }, [dataPosts]);


  // ĐỊNH NGHĨA CÁC HÀM 
  // Hàm search . Khi tap vào button search thì lưu giá trị các biến đã chọn qua 1 biến khác để hiển thị ở home, và set lại giá trị default cho các biến đó
  const handleTapOnSearchButton = async (dataInput: any, selectedCountry: any, selectedCities: any) => {
    if (!(dataInput === '' && selectedCountry === null && selectedCities.length === 0)) {
      setLoadedTours(false) // Load skeleton tour section
      setLoadedPosts(false) // Load skeleton posts list
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
        matchingPost.sort((postA: any, postB: any) => {
          //Ý tưởng: Chỉ sort theo match và thời gian không sort theo lượt like vì bài cũ thường sẽ nhiều like hơn
          // So sánh theo match trước
          if (postB.match !== postA.match) {
            return postA.match - postB.match; // Sắp xếp tăng dần theo match vì match là độ lệch, càng ít thì càng ưu tiên
          }
          // Nếu match bằng nhau, xem điều kiện sort: nếu mặc định thì theo ngày tháng, nếu chọn thì theo điều kiện
          if (selectedTypeSearch.current === 2) {
            if (postB.likes === postA.likes) {
              return (postB.created_at || 0) - (postA.created_at || 0);
            }

            return postB.likes - postA.likes;
          }
          return (postB.created_at || 0) - (postA.created_at || 0); // Sắp xếp giảm dần theo created_at
        });


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
      fetchPosts()
    }
    // Đóng modal search
    setModalVisible(!modalVisible)
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
  const fetchPosts = async () => {
    setLoadedPosts(false)
    console.log('dât', dataNewPostList);

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
            post.match -= 1 // Điều kiện để sắp xếp mảng
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

        // Bước 2: Sort
        //2.1. Sort mảng theo behavior: match > created_at
        behaviorPosts.sort((postA: any, postB: any) => {
          // Vì là bài post nên chỉ So sánh theo hành vi và thời gian
          if (postB.match !== postA.match) {
            return postA.match - postB.match; // Sắp xếp tăng dần theo match vì match là độ lệch, càng ít thì càng ưu tiên
          }
          // Nếu match bằng nhau, xem điều kiện sort: nếu mặc định thì theo ngày tháng, nếu chọn thì theo điều kiện
          if (selectedTypeSearch.current === 2) {
            if (postB.likes === postA.likes) {
              return (postB.created_at || 0) - (postA.created_at || 0);
            }
            return postB.likes - postA.likes;
          }
          return (postB.created_at || 0) - (postA.created_at || 0);
        });
        //2.2. Sort mảng không match hành vi theo created_at
        nonBehaviorPosts.sort((postA: any, postB: any) => {
          return postB.created_at - postA.created_at;
        })
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
      // Kiểm tra khi màn hình focus và cả 2 biến đều có dữ liệu
      if (dataAccount && loadedDataAccount) {
        // Clear data
        setDataInput('')
        setSelectedCountry(null)
        setSelectedCities([])
        setDataCities([])
        selectedTypeSearch.current = 1
        fetchPosts(); // Gọi fetchPosts
        fetchTours(); //
      }
      return () => {
        console.log('Screen is unfocused');
      };
    }, [loadedDataAccount]) // Cập nhật khi các giá trị này thay đổi
  );


  // Khi reload và khi thay đổi post hiển thị thì sort lại tour
  useEffect(() => {
    if (allLocationIdFromPost && dataTours) {
      sortToursByPostLocationId()
    }
  }, [allLocationIdFromPost, dataTours])

  // Hàm reload trang home
  const handleReloadHomeScreen = () => {
    // Clear data
    setDataInput('')
    setSelectedCountry(null)
    setSelectedCities([])
    setDataCities([])
    selectedTypeSearch.current = 1
    setDataModalSelected(null)

    fetchPosts(); // Tải lại bài viết
    fetchTours()
  };

  // Hàm hiển thị những bài viết mới
  const handleShowNewPost = () => {
    // Mở modal chứa các bài viết mới
    setModalNewPostVisible(true)
    // Load dữ liệu các bài viết mới vào modal
    const result = dataNewPostList.filter((postObj1: any) =>
      !dataPosts.some((postObj2: any) => postObj1.id === postObj2.id)
    );
    result.sort((postA: any, postB: any) => {
      return postB.created_at - postA.created_at
    })
    setDataNewPosts(result)
  };
  // Hàm button 'Đóng' modal những bài viết mới
  const handleCloseModalNewPost = () => {
    // Đóng modal
    setModalNewPostVisible(false)
  }
  // Hàm button 'Đóng' và reload những bài viết mới
  const handleCloseAndReLoadModalNewPost = () => {
    // Có thể reload trang nếu cần lại nếu cần
    setDataPosts(dataNewPostList)
    setCurrentPostCount(dataNewPostList.length)
    // Clear state của button
    // Đóng modal
    setModalNewPostVisible(false)
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
  const { selectedPost, setSelectedPost }: any = usePost();
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
          <Pressable style={styles.item} onPress={() => {
            router.push({
              pathname: "/postDetail",
              params: { postId: post.item.id },
            });
            setSelectedPost([post.item])
          }}>
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
        <View style={{ flexDirection: 'row' }}>
          <View style={{}}>
            <TouchableOpacity style={{ flexDirection: 'row', borderRadius: 90, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', padding: 2, marginBottom: 4, alignSelf: 'flex-start' }}>
              <Image style={{ width: 25, height: 25, borderRadius: 90 }} source={{ uri: post.item.author.avatar }} />
              <Text style={{ fontWeight: '500', paddingHorizontal: 4 }} numberOfLines={1}>
                {post.item.author.fullname}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity style={styles.itemNewPostContent}>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Image style={{ width: '100%', borderRadius: 10, aspectRatio: 1 }} source={{ uri: post.item.thumbnail }}></Image>
          </View>
          <View style={{ flex: 1.5, paddingLeft: 10 }}>
            <View style={{ flexDirection: 'row' }}>
              <Text style={styles.textTitle}> {post.item.title}</Text>
            </View>
            <View style={{ flexDirection: 'row', flex: 1, alignItems: 'flex-start', flexWrap: 'wrap', padding: 4 }}>
              <Text style={{ fontWeight: '500', textAlign: 'center', paddingVertical: 1 }}>Địa điểm: </Text>
              {allLocations.map((location) => {
                return (<Badge key={location.id} style
                  ={{ margin: 1 }}>{location.name}</Badge>)
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
      <View style={styles.titlePostContainer}>
        <Text style={styles.textCategory}>Những bài viết mới</Text>

        {/* {((currentPostCount !== newPostCount) && (isSearchingMode === false)) && ( */}
        {((currentPostCount !== newPostCount)) && (
          <TouchableOpacity style={styles.loadNewPost} onPress={() => handleShowNewPost()}>
            <FontAwesome6 name="newspaper" size={20} color="black" />
            <Text style={styles.iconPost}>Có bài viết mới</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.filterBtn}
          onPress={() => setModalVisible(true)}>
          <AntDesign name="filter" size={22} color="black" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.refreshBtn} onPress={() => handleReloadHomeScreen()}>
          <AntDesign name="reload1" size={22} color="black" />
        </TouchableOpacity>
      </View>
      {dataPosts.length !== 0 ?
        loadedPosts ?
          <FlatList
            ref={flatListPostRef}
            showsVerticalScrollIndicator={false}
            data={dataPosts}
            renderItem={postItem}
            keyExtractor={(post: any) => post.id}
            // ItemSeparatorComponent={() => <View style={{ height: 20 }} />} // Space between item
            pagingEnabled //Scroll to next item
            onViewableItemsChanged={onViewableItemsChanged} // Theo dõi các mục hiển thị
            viewabilityConfig={viewabilityConfig} // Cấu hình cách xác định các mục hiển thị
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
                style={{ borderWidth: 1, borderRadius: 10, paddingHorizontal: 8, height: 48 }}
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
                setSelected={(val: any) => selectedTypeSearch.current = val}
                data={dataTypeSearch}
                maxHeight={120}
                save="key"
                defaultOption={{ key: 1, value: 'Mặc định' }}
              // onSelect={(val: any)=>{console.log(val)}}
              // defaultOption={selectedCountry}
              />
            </View>
            <View style={{ flexDirection: 'row' }}>
              <Pressable
                style={styles.buttonSearch}
                onPress={() => handleTapOnSearchButton(dataInput, selectedCountry, selectedCities)}>
                <Text style={styles.textStyle}>Tìm kiếm</Text>
              </Pressable>
              <Pressable
                style={styles.buttonCancel}
                onPress={() => handleCloseModalSearch()}>
                <Text style={styles.textStyle}>Đóng</Text>
              </Pressable>
            </View>
          </View>
          <View style={styles.overPlay}></View>
        </View>
      </Modal>

      <Modal
        animationType='slide'
        transparent={true}
        visible={modalNewPostVisible}
        onRequestClose={() => {
          Alert.alert('Modal has been closed.');
          setModalNewPostVisible(!modalNewPostVisible);
        }}
        style={{ maxHeight: 400 }}
      >
        <View style={styles.modalView}>
          <View style={[styles.modalBottomView, { height: 500 }]}>
            <Text style={styles.modalTitleText}>Bài viết mới</Text>
            <FlatList
              data={dataNewPosts}
              renderItem={newPostItem}
              ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
            />

            <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity
                style={styles.buttonSearch}
                onPress={() => handleCloseAndReLoadModalNewPost()}>
                <Text style={styles.textStyle}>Làm mới</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleCloseModalNewPost()}
                style={styles.buttonCancel}
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
    marginVertical: 8
  },
  itemNewPostWrap: {
    borderRadius: 10,
    width: width - 30,
    padding: 8,
    backgroundColor: '#eeeeee',
    elevation: 4,
    shadowRadius: 12,
    marginBottom: 15,
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
    paddingBottom: 10,
    width: width,
    alignItems: 'center',
    zIndex: 4,
    borderBottomWidth: 1,
    elevation: 5,
  },
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
  modalTitleText: {
    backgroundColor: '#ffd7bf',
    paddingVertical: 10,
    width: width,
    marginBottom: 15,
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20
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
    backgroundColor: '#ffff77',
    transformOrigin: 'center',
    elevation: 8
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