import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
  Switch,
  Image,
  FlatList,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import IconA from "react-native-vector-icons/AntDesign";
import Icon from "react-native-vector-icons/Fontisto";
import { ArrowLeft } from "iconsax-react-native";
import { router, useLocalSearchParams } from "expo-router";
import { appColors } from "@/constants/appColors";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import {
  ButtonComponent,
  RowComponent,
  SectionComponent,
  InputComponent,
  TextComponent,
} from "@/components";
import { Checkbox, Modal } from "react-native-paper";
import {
  database,
  onValue,
  ref,
  push,
  auth,
  storageRef,
  uploadBytes,
  getDownloadURL,
  set,
  update,
  get,
} from "@/firebase/firebaseConfig";
import MapView, { Marker } from "react-native-maps";
import * as ImagePicker from "expo-image-picker";
import { getStorage } from "firebase/storage";
import { child } from "firebase/database";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message-custom";
import LottieView from "lottie-react-native";
import ReviewPostUser from "./reviewPostUser";
import { useBannedWords } from "@/components/wordPosts/BannedWordData";
import { bannedWordsChecker } from "@/components/wordPosts/BannedWordsChecker";
import { getDataPost } from "@/app/(article)/getDataPost";
import { deleteFolder } from "@/services/storageService";

const EditPostUser = () => {

  interface Country {
    id: string;
    [key: string]: any;
  }

  const [countryData, setCountryData] = useState<Country[]>([]);
  const [isCheckIn, setIsCheckIn] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [contentReviewPost, setcontentReviewPost] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchQueryCity, setSearchQueryCity] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [citiesData, setCitiesData] = useState<
    {
      id_nuoc: string;
      id: string;
      name: string;
      area_id: string;
    }[]
  >([]);
  const [citiesDataFilter, setCitiesDataFilter] = useState<
    { id: string; name: string; id_nuoc: string; area_id: string }[]
  >([]);
  // console.log("Cities:", citiesDataFilter);

  const [cities, setCities] = useState<
    { id: string; name: string; id_nuoc: string; area_id: string }[]
  >([]);

  // useEffect(() => {
  //   console.log("Cities:", cities);
  //   [cities];
  // });

  //Modal
  const [modalVisibleCity, setModalVisibleCity] = useState(false);
  const [modalVisibleMap, setModalVisibleMap] = useState(false);
  const [modalVisibleCityImages, setModalVisibleCityImages] = useState(false);
  const [modalVisibleImage, setModalVisibleImage] = useState(false);
  const [modalVisibleImageInfEdit, setModalVisibleImageInfEdit] =
    useState(false);
  const [modalVisibleTimePicker, setModalVisibleTimePicker] = useState(false);
  const [modalVisibleCountry, setModalVisibleCountry] = useState(false);
  const [modalReviewPost, setModalReviewPost] = useState(false);

  //Chon quoc gia
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  //loading
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [buttonPost, setButtonPost] = useState(false);
  const [loadingButtonSearch, setLoadingButtonSearch] = useState(false);

  //Chon giờ
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);

  //Chosse ảnh
  //lưu trữ ảnh được chọn tạm thời
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  //lưu trữ thông tin thành phố đã chọn
  const [selectedCityForImages, setSelectedCityForImages] = useState<{
    id: string;
    name: string;
    id_nuoc: string;
    area_id: string;
  } | null>(null);
  useEffect(() => {
    // console.log("selectedCityForImages:", selectedCityForImages);
    [selectedCityForImages];
  });
  // lưu trữ hình ảnh cùng với thành phố tương ứng
  const [images, setImages] = useState<
    {
      city: {
        id: string;
        name: string;
        id_nuoc: string;
        area_id: string;
      } | null;
      images: string[];
    }[]
  >([]);
  // useEffect(() => {
  //   console.log("Images:", images);
  //   [images]});
  //Lưu vi trí muốn sửa tt ảnh
  const [indexEditImage, setIndexEditImage] = useState<number | null>(null);

  //map
  const [region, setRegion] = useState({
    latitude: 17.65005783136121,
    longitude: 106.40283940732479,
    latitudeDelta: 9,
    longitudeDelta: 9,
  });
  const mapViewRef = useRef<MapView>(null);

  const [selectedLocation, setSelectedLocation] = useState<{
    name: string;
    latitude: number;
    longitude: number;
  } | null>(null);

  const [days, setDays] = useState<
    {
      title: string;
      description: string;
      activities: { time: string; address: string; activity: string }[];
    }[]
  >([]);

  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);
  const [selectedActivityIndex, setSelectedActivityIndex] = useState<
    number | null
  >(null);

  //Lay data banned words
  const bannedWords = useBannedWords();

  // *********************************************************************
  //Lấy dữ liệu từ bài viết cần sửa
  const { postId } = useLocalSearchParams();
  console.log("ID Post:", postId);
  useEffect(() => {
    if (typeof postId === "string") {
      getDataPost(postId).then((data) => {
        if (data) {
          setTitle(data.title);
          setContent(data.content);
          setDays(data.days);
          setCities(data.cities);
          setImages(data.images);
          setIsCheckIn(data.isCheckIn);
          if (data.status_id === 1) {
            setIsPublic(true);
          } else {
            setIsPublic(false);
          }
        }
      });
    }
  }, [postId]);
  // *********************************************************************
  // *********************************************************************
  // *********************************************************************
  // *********************************************************************

  // *********************************************************************
  // Xử lý Chọn Quốc Gia CHo Bài Viết
  // *********************************************************************
  useEffect(() => {
    const countriesRef = ref(database, "countries");

    // Lấy dữ liệu từ firebase (qgia)
    onValue(countriesRef, (snapshot) => {
      const data = snapshot.val() || {};
      // Chuyển từ đối tượng thành mảng
      const formattedDataCountry = Object.keys(data).map((key) => ({
        id: key,
        ...data[key],
      }));
      // console.log(formattedDataCountry);
      setCountryData(formattedDataCountry);
      // console.log("Country Data:", countryData);
    });
  }, []);
  //Thay đổi quốc gia
  const handleCountryChange = (country: Country) => {
    // console.log("Selected Country1:", country);
    if (country !== null) {
      setSelectedCountry(country.id);
    }

    setModalVisibleCountry(false);
  };
  // *********************************************************************
  // Xử lý Chọn Quốc Gia CHo Bài Viết
  // *********************************************************************
  // *********************************************************************
  // Xử lý Thành Phố Bài Viết
  // *********************************************************************
  //Lấy data từ cty fb
  useEffect(() => {
    const cityRef = ref(database, "cities");
    onValue(cityRef, (snapshot) => {
      const data = snapshot.val() || {};

      // Duyệt qua tất cả các quốc gia
      const formattedData = Object.keys(data).flatMap((countryKey) => {
        return Object.keys(data[countryKey]).flatMap((area_id) => {
          return Object.keys(data[countryKey][area_id]).map((cityKey) => ({
            id: cityKey,
            area_id: area_id,
            id_nuoc: countryKey,
            name: data[countryKey][area_id][cityKey].value || "",
            ...data[countryKey][area_id][cityKey],
          }));
        });
      });

      setCitiesData(formattedData);
      // console.log("$$$$$$$$$$$$$$$$$$");
      // console.log("Cty:", formattedData);
      // console.log(citiesData)
    });
  }, []);
  //Lọc tỉnh thành theo nước
  useEffect(() => {
    if (selectedCountry) {
      const filteredCities = citiesData.filter(
        (city) => city.id_nuoc === selectedCountry
      );
      setCitiesDataFilter(filteredCities);
    }
  }, [selectedCountry]);

  //Xoa các dấu tiếng việt
  const removeDiacritics = (text: any) => {
    return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  };
  //Search theo ten thanh pho
  useEffect(() => {
    if (searchQueryCity) {
      const filteredCities = citiesData.filter((city) =>
        removeDiacritics(city.name.toLowerCase()).includes(
          removeDiacritics(searchQueryCity.toLowerCase())
        )
      );
      setCitiesDataFilter(filteredCities);
    } else {
      //Lấy all thành phố
      const filteredCities = citiesData.filter(
        (city) => city.id_nuoc === selectedCountry
      );
      setCitiesDataFilter(filteredCities);
    }
  }, [searchQueryCity]);

  // console.log("Cities:", citiesDataFilter);
  //Cac tinh thanh duoc chon
  const handCityPress =
    (city: { id: string; name: string; id_nuoc: string; area_id: string }) =>
      () => {
        setCities([
          {
            id: city.id,
            name: city.name,
            id_nuoc: city.id_nuoc,
            area_id: city.area_id,
          },
          ...cities,
        ]);
        setSearchQueryCity("");
        setModalVisibleCity(false);
      };

  //Remove tinh thanh de chon
  const removeCity = (cityId: string) => {
    //kiểm tra thử mảng ảnh có chứa thành phố đó không
    const isExist = images.find((image) => image.city?.id === cityId);
    if (isExist) {
      Alert.alert(
        "Thông báo",
        "Vui lòng xóa ảnh chứa thành phố này trước khi xóa thành phố."
      );
      return;
    }
    //Xóa thành phố
    const newCities = cities.filter((city) => city.id !== cityId);
    setCities(newCities);
  };

  // *********************************************************************
  // Xử lý Chọn Địa Điểm
  // *********************************************************************
  //Xử lý dot
  const handleMapPress = async (event: any) => {
    setLoadingLocation(true);
    // console.log("Map Pressed:", event.nativeEvent);
    const { latitude, longitude } = event.nativeEvent.coordinate;
    // console.log("Map Pressed:", latitude, longitude);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
        {
          headers: {
            "User-Agent": "travelogue/1.0 (dongochieu333@gmail.com)",
          },
        }
      );

      if (!response.ok) {
        setLoadingLocation(false);
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      // console.log("Data:", data);
      if (data && data.address) {
        setSelectedLocation({
          name: data.display_name,
          latitude,
          longitude,
        });
        setLoadingLocation(false);
      } else {
        setLoadingLocation(false);
        alert("Không tìm thấy thông tin vị trí.");
      }
    } catch (error) {
      setLoadingLocation(false);
      // console.error("Error", error);
      alert("Có lỗi xảy ra khi lấy thông tin vị trí.");
    }
  };
  //Search map
  const handleSearch = async () => {
    // setSelectedLocation(null);
    setLoadingLocation(true);
    setLoadingButtonSearch(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          searchQuery
        )}&format=json&limit=1`,
        {
          headers: {
            "User-Agent": "travelogue/1.0 (dongochieu333@gmail.com)",
          },
        }
      );

      if (!response.ok) {
        setLoadingLocation(false);
        setLoadingButtonSearch(false);
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      //  console.log("Data:", data);
      if (data && data.length > 0) {
        const location = data[0];
        if (mapViewRef.current) {
          mapViewRef.current.animateToRegion(
            {
              latitude: parseFloat(location.lat),
              longitude: parseFloat(location.lon),
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            },
            1000
          );
        }
        setLoadingLocation(false);
        setLoadingButtonSearch(false);
      } else {
        setLoadingLocation(false);
        setLoadingButtonSearch(false);
        alert("Không tìm thấy địa điểm.");
      }
    } catch (error) {
      setLoadingLocation(false);
      setLoadingButtonSearch(false);
      // console.error("Error fetching location:", error);
      alert(
        "Có lỗi xảy ra khi tìm kiếm. Vui lòng kiểm tra lại kết nối mạng hoặc từ khóa tìm kiếm."
      );
    }
  };
  //Lưu vi tri chon cho hoat dong
  const handleSaveLocation = () => {
    if (selectedLocation) {
      if (selectedDayIndex !== null && selectedActivityIndex !== null) {
        const activity =
          days[selectedDayIndex].activities[selectedActivityIndex];

        // Kiểm tra xem đã chọn giờ hay chưa
        if (!activity.time) {
          Alert.alert(
            "Thông báo",
            "Vui lòng chọn giờ cho hoạt động trước khi lưu địa điểm."
          );
          return;
        }
        // Cập nhật hoạt động với địa điểm đã chọn
        updateActivity(
          selectedDayIndex,
          selectedActivityIndex,
          "address",
          selectedLocation.name
        );
        //Huy all index
        // setSelectedDayIndex(null);
        // setSelectedActivityIndex(null);

        setModalVisibleMap(false);
        setSelectedLocation(null);
        setSearchQuery("");

        if (mapViewRef.current) {
          mapViewRef.current.animateToRegion(
            {
              latitude: 17.65005783136121,
              longitude: 106.40283940732479,
              latitudeDelta: 9,
              longitudeDelta: 9,
            },
            1000
          );
        }
      } else {
        Alert.alert("Thông báo", "V Tr");
      }
    } else {
      Alert.alert("Thông báo", "Vui lòng chọn vị trí trước khi lưu.");
    }
  };

  // *********************************************************************
  // Xử lý Chọn Địa Điểm
  // *********************************************************************

  // *********************************************************************
  // Xử lý Chọn Ngày và Hoạt Động
  // *********************************************************************
  //Thêm ngày hoạt động bài viết
  const addDay = () => {
    //so sanh title, description, activity trước khi có thêm ngày mới
    const existingDay = days.find(
      (day) =>
        day.title === "" ||
        day.description === "" ||
        day.activities.length === 0
    );
    if (existingDay) {
      Alert.alert(
        "Thông báo",
        "Vui lòng hoàn thành ngày hiện tại trước khi thêm ngày mới."
      );
      return;
    }

    setDays([...days, { title: "", description: "", activities: [] }]);
  };

  //Xóa ngày hoạt động bài viết
  const deleteDay = (dayIndex: number) => {
    const newDays = [...days];
    newDays.splice(dayIndex, 1);
    setDays(newDays);
  };

  //Cập nhật dữ liệu title or description của ngày
  const updateDay = (
    index: number,
    key: "title" | "description",
    value: string
  ) => {
    const newDays = [...days];
    // console.log("newDays:", newDays);
    // console.log("newDays:", newDays[0]['title']);
    newDays[index][key] = value;
    setDays(newDays);
  };
  // Them hoat dong cho ngay do
  const addActivity = (dayIndex: number) => {
    // so sanh time, address, activity trước khi có thêm hoạt động mới
    const newDays = [...days];
    const existingActivity = newDays[dayIndex].activities.find(
      (act) => act.time === "" || act.address === "" || act.activity === ""
    );

    if (existingActivity) {
      Alert.alert(
        "Thông báo",
        "Vui lòng hoàn thành hoạt động hiện tại trước khi thêm hoạt động mới."
      );
      return;
    }

    //Thêm đối tượng time and activity vào mảng activities
    newDays[dayIndex].activities.push({ time: "", address: "", activity: "" });
    setDays(newDays);
  };
  // xoa hoat dong cho ngay do
  const deleteActivity = (dayIndex: number, activityIndex: number) => {
    const newDays = [...days];
    // console.log("newDays:", newDays[dayIndex].activities);
    newDays[dayIndex].activities.splice(activityIndex, 1);
    setDays(newDays);
  };
  // Cap nhat hoat dong cho ngay do
  const updateActivity = (
    dayIndex: number,
    activityIndex: number,
    key: "time" | "address" | "activity",
    value: string
  ) => {
    const newDays = [...days];
    newDays[dayIndex].activities[activityIndex][key] = value;
    setDays(newDays);
    // console.log("newDays:",newDays[dayIndex].activities[activityIndex]);
  };

  //Chọn gio
  const showTimePicker = (
    dayIndex: number,
    activityIndex: number,
    time: string
  ) => {
    // console.log("Chon gio");
    setSelectedTime(new Date(`2024-01-01T${time || "00:00"}`));
    // console.log("Time:", time);
    // console.log(selectedTime);
    setSelectedDayIndex(dayIndex);
    setSelectedActivityIndex(activityIndex);
    setModalVisibleTimePicker(true);
  };

  // Xử lý khi chọn giờ xong
  const handleConfirm = (time: Date) => {
    if (selectedDayIndex !== null && selectedActivityIndex !== null) {
      const newDays = [...days];
      const formattedTime = `${time
        .getHours()
        .toString()
        .padStart(2, "0")}:${time.getMinutes().toString().padStart(2, "0")}`;

      if (selectedActivityIndex > 0) {
        const previousTime =
          newDays[selectedDayIndex].activities[selectedActivityIndex - 1].time;

        if (previousTime) {
          const currentTime = new Date(`2024-01-01T${formattedTime}:00`);
          const prevTime = new Date(`2024-01-01T${previousTime}:00`);

          // console.log("currentTime:", currentTime);

          if (currentTime <= prevTime) {
            Alert.alert(
              "Thông báo",
              "Thời gian của hoạt động này phải lớn hơn hoạt động trước."
            );
            setModalVisibleTimePicker(false);
            return;
          }
        }
      }
      if (
        selectedActivityIndex <
        newDays[selectedDayIndex].activities.length - 1
      ) {
        const nextTime =
          newDays[selectedDayIndex].activities[selectedActivityIndex + 1].time;

        if (nextTime) {
          const currentTime = new Date(`2024-01-01T${formattedTime}:00`);
          const nexTime = new Date(`2024-01-01T${nextTime}:00`);

          if (currentTime >= nexTime) {
            Alert.alert(
              "Thông báo",
              "Thời gian của hoạt động này phải nhỏ hơn hoạt động sau."
            );
            setModalVisibleTimePicker(false);
            return;
          }
        }
      }

      // cập nhật thời gian
      newDays[selectedDayIndex].activities[selectedActivityIndex].time =
        formattedTime;
      setDays(newDays);
    }

    // ẩn
    hideTimePicker();
  };

  // Ẩn modal chọn giờ
  const hideTimePicker = () => {
    setModalVisibleTimePicker(false);
  };
  //Mo modal map
  const handleOpenMap = (dayIndex: number, activityIndex: number) => {
    // console.log("Chuyen map");
    setModalVisibleMap(true);
    setSelectedDayIndex(dayIndex);
    setSelectedActivityIndex(activityIndex);
  };

  //Mo modal map de sua
  const handleOpenMapEdit = async (
    dayIndex: number,
    activityIndex: number,
    address: string
  ) => {
    // console.log(address);
    setLoadingLocation(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          address
        )}&format=json&limit=1`,
        {
          headers: {
            "User-Agent": "travelogue/1.0 (dongochieu333@gmail.com)",
          },
        }
      );

      if (!response.ok) {
        setLoadingLocation(false);
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.length > 0) {
        const location = data[0];
        // if (mapViewRef.current) {
        //   mapViewRef.current.animateToRegion(
        //     {
        //       latitude: parseFloat(location.lat),
        //       longitude: parseFloat(location.lon),
        //       latitudeDelta: 0.05,
        //       longitudeDelta: 0.05,
        //     },
        //     1000
        //   );
        // }
        if (location) {
          setRegion({
            latitude: parseFloat(location.lat),
            longitude: parseFloat(location.lon),
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          });
        }

        setSelectedLocation({
          name: address,
          latitude: parseFloat(location.lat),
          longitude: parseFloat(location.lon),
        });
        setLoadingLocation(false);
      }
    } catch (error) {
      setLoadingLocation(false);
      Alert.alert(" Vui lòng kiểm tra lại kết nối mạng.");
    }
    setSelectedDayIndex(dayIndex);
    setSelectedActivityIndex(activityIndex);
    setModalVisibleMap(true);
  };

  // *********************************************************************
  // Xử lý Chọn Ngày và Hoạt Động
  // *********************************************************************

  // *********************************************************************
  // Xử lý Thêm Ảnh
  // *********************************************************************
  //Xử lý chỗ chọn thành phố của ảnh
  const handCityImagesPress = (city: any) => () => {
    const selectedCity = {
      id: city.id,
      name: city.name,
      id_nuoc: city.id_nuoc,
      area_id: city.area_id,
    };
    setSelectedCityForImages(selectedCity);
    setModalVisibleCityImages(false);
  };
  // console.log("City:", selectedCityForImages);

  //Xử lý chọn ảnh từ thư viện
  const handleChooseImages = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled) {
      const selectedUris = result.assets.map((item) => item.uri);
      setSelectedImages([...selectedUris, ...selectedImages]);
    }
  };
  //Xử lý xóa ảnh chỗ chọn ảnh chưa lưu
  const handleRemoveImage = (index: number) => {
    const updatedImages = [...selectedImages];
    updatedImages.splice(index, 1);
    setSelectedImages(updatedImages);
  };
  //Xử lý lưu ảnh
  const handleSaveImages = () => {
    if (selectedImages.length === 0) {
      Alert.alert("Thông Báo", "Vui lòng chọn ảnh trước khi lưu.");
      return;
    }
    if (!selectedCityForImages) {
      Alert.alert(
        "Thông Báo",
        "Vui lòng chọn thành phố cho ảnh trước khi lưu."
      );
      return;
    }
    setImages([
      { city: selectedCityForImages, images: selectedImages },
      ...images,
    ]);
    setSelectedImages([]);
    setSelectedCityForImages(null);
    setModalVisibleImage(false);
  };
  //Xử lý xóa ảnh và xóa city của ảnh
  const handleRemoveImagesAndCity = (index: number) => {
    const updatedImages = [...images];
    updatedImages.splice(index, 1);
    setImages(updatedImages);
  };
  // console.log("Images:", images);
  //Xử lý chọn ảnh để chỉnh sửa thông tin
  const handleChangleInfoImage = (index: number) => () => {
    setSelectedImages(images[index].images);
    setSelectedCityForImages(images[index].city);
    setIndexEditImage(index);
    setModalVisibleImageInfEdit(true);
  };
  //Lưu thông tin ảnh sau khi chỉnh sửa
  const handleSaveImagesEditInfo = () => {
    if (selectedImages.length === 0) {
      Alert.alert("Thông Báo", "Vui lòng chọn ảnh trước khi lưu.");
      return;
    }
    const updatedImages = [...images];
    if (indexEditImage !== null) {
      updatedImages[indexEditImage].images = selectedImages;
      updatedImages[indexEditImage].city = selectedCityForImages;
    }
    setImages(updatedImages);
    setSelectedImages([]);
    setSelectedCityForImages(null);
    setIndexEditImage(null);
    setModalVisibleImageInfEdit(false);
  };
  // *********************************************************************
  // Xử lý Thêm Ảnh
  // *********************************************************************
  // *********************************************************************
  //  Xử lý Thêm Bài Viết
  // *********************************************************************
  // useEffect(() => {
  //   console.log("CheckIn:", isCheckIn);

  // }, [isCheckIn]);

  const handleEditPost = async () => {
    setButtonPost(true);
    if (cities.length === 0) {
      setButtonPost(false);
      Alert.alert("Thông báo", "Vui lòng chọn tỉnh thành checkin.");
      return;
    }
    if (title === "") {
      setButtonPost(false);
      Alert.alert("Thông báo", "Vui lòng nhập tiêu đề bài viết.");
      return;
    }
    if (content === "") {
      setButtonPost(false);
      Alert.alert("Thông báo", "Vui lòng nhập nội dung chung bài viết.");
      return;
    }
    if (days.length === 0) {
      setButtonPost(false);
      Alert.alert("Thông báo", "Vui lòng thêm ngày và hoạt động cho bài viết.");
      return;
    }

    const existingDay = days.find(
      (day) =>
        day.title === "" ||
        day.description === "" ||
        day.activities.length === 0
    );
    if (existingDay) {
      const dayIndex = days.findIndex((day) => day === existingDay);
      setButtonPost(false);
      Alert.alert(
        "Thông báo",
        `Vui lòng hoàn thành thông tin đầy đủ cho ngày thứ ${dayIndex + 1}.`
      );
      return;
    }

    const existingActivity = days.find((day) =>
      day.activities.find(
        (act) => act.time === "" || act.address === "" || act.activity === ""
      )
    );
    if (existingActivity) {
      const dayIndex = days.findIndex((day) =>
        day.activities.includes(existingActivity.activities[0])
      );
      setButtonPost(false);
      Alert.alert(
        "Thông báo",
        `Vui lòng hoàn thành thông tin đầy đủ cho các hoạt động của ngày thứ ${dayIndex + 1
        }.`
      );
      return;
    }
    // console.log(images);
    if (images.length === 0) {
      setButtonPost(false);
      Alert.alert("Thông báo", "Vui lòng thêm ảnh cho bài viết.");
      return;
    }
    //So sanh xem tinh thanh do da co anh chua
    // const exist = images.map((image) => image.city?.id)

    // console.log("888", exist)
    // const missingCities = cities.filter(city => !exist.includes(city.id));

    // if (missingCities.length > 0) {
    //   setButtonPost(false);
    //   Alert.alert(
    //   "Thông báo",
    //   `Vui lòng thêm ảnh cho các tỉnh thành sau: ${missingCities.map(city => city.name).join(", ")}.`
    //   );
    //   return;
    // }
    //Tạo dữ liệu mardown
    const contents = `# ${title}<br><br>${content}<br><br>${days
      .map(
        (day, index) =>
          `## **Ngày ${index + 1}:** ${day.title}<br><br>${day.description
          }<br><br>${day.activities
            .map(
              (activity) =>
                `### ${activity.time} - ${activity.activity}<br><br>**Địa điểm:** ${activity.address}`
            )
            .join("<br><br>")}`
      )
      .join("<br><br>")}`;

    //Kiem tra tu cam

    //Kiem tra tu cam thong tin bai viet
    if (bannedWordsChecker(title, bannedWords)) {
      console.log("Title:", title);
      setButtonPost(false);
      Toast.show({
        type: "error",
        text1: "Tiêu đề chứa từ cấm",
        text2: "Vui lòng sửa lại tiêu đề bài viết.",
        text1Style: { fontSize: 14 },
        text2Style: { fontSize: 12 },
        position: "top",
      });
      return;
    }
    if (bannedWordsChecker(content, bannedWords)) {
      setButtonPost(false);
      Toast.show({
        type: "error",
        text1: "Nội dung chứa từ cấm",
        text2: "Vui lòng sửa lại mô tả bài viết.",
        text1Style: { fontSize: 14 },
        text2Style: { fontSize: 12 },
        position: "top",
      });
      return;
    }
    for (let dayIndex = 0; dayIndex < days.length; dayIndex++) {
      const day = days[dayIndex];

      // Kiểm tra Tiêu đề ngày
      if (bannedWordsChecker(day.title, bannedWords)) {
        setButtonPost(false);
        Toast.show({
          type: "error",
          text1: `Ngày ${dayIndex + 1}: Tiêu đề chứa từ cấm`,
          text2: `Vui lòng sửa lại tiêu đề ngày ${dayIndex + 1}.`,
          text1Style: { fontSize: 14 },
          text2Style: { fontSize: 12 },
          position: "top",
        });
        return;
      }

      // Kiểm tra mô tả hoạt động cho từng ngày
      for (
        let activityIndex = 0;
        activityIndex < day.activities.length;
        activityIndex++
      ) {
        const activity = day.activities[activityIndex];

        if (bannedWordsChecker(activity.activity, bannedWords)) {
          setButtonPost(false);
          Toast.show({
            type: "error",
            text1: `Ngày ${dayIndex + 1}: Hoạt động thứ ${activityIndex + 1
              } chứa từ cấm`,
            text2: `Vui lòng sửa lại hoạt động ${activityIndex + 1} ngày ${dayIndex + 1
              }.`,
            text1Style: { fontSize: 14 },
            text2Style: { fontSize: 12 },
            position: "top",
          });
          return;
        }
      }

      // Kiểm tra mô tả chung của ngày
      if (bannedWordsChecker(day.description, bannedWords)) {
        setButtonPost(false);
        Toast.show({
          type: "error",
          text1: `Ngày ${dayIndex + 1}: Mô tả chung chứa từ cấm`,
          text2: `Vui lòng sửa lại mô tả chung ngày ${dayIndex + 1}.`,
          text1Style: { fontSize: 14 },
          text2Style: { fontSize: 12 },
          position: "top",
        });
        return;
      }
    }

    const timestamp = Date.now();
    try {
      const storage = getStorage();
      const uploadedImageUrls: {
        [key: string]: {
          [key: string]: { city_name: string; images_value: string[] };
        };
      } = {};

      //Sua tren db
      const postsRef = ref(database, `posts/${postId}`);
      //Xóa các ảnh cũ
      // deleteFolder(`posts/${postId}/images`);
      // Xử lý tải ảnh lên Firebase Storage và lưu đường dẫn
      for (const image of images) {
        const { city, images: imageUris } = image;
        const {
          id_nuoc,
          id,
          name: cityName,
          area_id: id_khuvucimages,
        } = city || {};

        if (id_nuoc && id) {
          // Tải lên tất cả ảnh trong `imageUris` đồng thời
          const uploadTasks = imageUris.map(async (uri) => {
            const name = uri.split("/").pop();
            const imageRef = storageRef(
              storage,
              `posts/${postId}/images/${name}`
            );

            // Tải ảnh lên Firebase Storage
            const response = await fetch(uri);
            const blob = await response.blob();
            await uploadBytes(imageRef, blob);

            // Lấy URL tải về từ Firebase Storage
            return await getDownloadURL(imageRef);
          });

          // Chờ tất cả ảnh được tải lên và lấy URL
          const imageUrls = await Promise.all(uploadTasks);

          // Lưu URL vào cấu trúc dữ liệu
          if (!uploadedImageUrls[id_nuoc]) {
            uploadedImageUrls[id_nuoc] = {};
          }
          if (!uploadedImageUrls[id_nuoc][id]) {
            uploadedImageUrls[id_nuoc][id] = {
              city_name: cityName || "",
              images_value: [],
            };
          }
          uploadedImageUrls[id_nuoc][id].images_value.push(...imageUrls);

          // Cập nhật thông tin ảnh trên Realtime Database
          const cityRef = ref(
            database,
            `cities/${id_nuoc}/${id_khuvucimages}/${id}/postImages/posts/${postId}`
          );
          await set(cityRef, {
            images: uploadedImageUrls[id_nuoc][id].images_value,
          });
        }
      }

      // Sau khi tải lên ảnh, chuẩn bị dữ liệu bài viết
      const thumbnail =
        uploadedImageUrls?.[Object.keys(uploadedImageUrls)[0]]?.[
          Object.keys(uploadedImageUrls[Object.keys(uploadedImageUrls)[0]])[0]
        ]?.images_value?.[0] || "";

      const postData = {
        locations: cities.reduce(
          (acc: { [key: string]: { [key: string]: string } }, city) => {
            const { id_nuoc, id, name } = city;
            if (!acc[id_nuoc]) {
              acc[id_nuoc] = {};
            }
            acc[id_nuoc][id] = name;
            return acc;
          },
          {}
        ),
        content: contents,
        images: uploadedImageUrls,
        thumbnail,
        isCheckIn,
        title,
        status_id: isPublic ? 1 : 2,
      };

      
      // cập nhật thông tin bài viết
      await update(postsRef, postData);

      // cập nhật thông tin vào tài khoản người dùng
      const userId = await AsyncStorage.getItem("userToken");
      const checkInListRef = ref(database, `accounts/${userId}/checkInList`);

      // Cập nhật thông tin bài viết vào danh sách bài viết của người dùng
      if (isCheckIn) {
        const snapshot = await get(checkInListRef);
        const currentData = snapshot.exists() ? snapshot.val() : {};

        const updatedCheckInList = cities.reduce(
          (acc, city) => {
            const { id_nuoc, id, name } = city;
            if (!acc[id_nuoc]) {
              acc[id_nuoc] = {};
            }
            acc[id_nuoc][id] = name;
            return acc;
          },
          { ...currentData }
        );

        // Cập nhật vào Realtime Database
        await update(checkInListRef, updatedCheckInList);
      }

      setButtonPost(false);
      Toast.show({
        type: "success",
        text1: "Thông báo",
        text2: "Thêm bài viết thành công",
        visibilityTime: 2000,
      });
      router.replace("/(tabs)/");
    } catch (error) {
      setButtonPost(false);
      console.error("Error:", error);
      Alert.alert("Lỗi", "Không thể thêm bài viết.");
    }
  };

  // *********************************************************************
  //  Xử lý Thêm Bài Viết
  // *********************************************************************
  // Xử lý review bài viết
  const handleReviewPost = async () => {
    if (cities.length === 0) {
      setButtonPost(false);
      Alert.alert("Thông báo", "Vui lòng chọn tỉnh thành checkin.");
      return;
    }
    if (title === "") {
      setButtonPost(false);
      Alert.alert("Thông báo", "Vui lòng nhập tiêu đề bài viết.");
      return;
    }
    if (content === "") {
      setButtonPost(false);
      Alert.alert("Thông báo", "Vui lòng nhập nội dung chung bài viết.");
      return;
    }
    if (days.length === 0) {
      setButtonPost(false);
      Alert.alert("Thông báo", "Vui lòng thêm ngày và hoạt động cho bài viết.");
      return;
    }

    const existingDay = days.find(
      (day) =>
        day.title === "" ||
        day.description === "" ||
        day.activities.length === 0
    );
    if (existingDay) {
      const dayIndex = days.findIndex((day) => day === existingDay);
      setButtonPost(false);
      Alert.alert(
        "Thông báo",
        `Vui lòng hoàn thành thông tin đầy đủ cho ngày thứ ${dayIndex + 1}.`
      );
      return;
    }

    const existingActivity = days.find((day) =>
      day.activities.find(
        (act) => act.time === "" || act.address === "" || act.activity === ""
      )
    );
    if (existingActivity) {
      const dayIndex = days.findIndex((day) =>
        day.activities.includes(existingActivity.activities[0])
      );
      setButtonPost(false);
      Alert.alert(
        "Thông báo",
        `Vui lòng hoàn thành thông tin đầy đủ cho các hoạt động của ngày thứ ${dayIndex + 1
        }.`
      );
      return;
    }
    // console.log(images);
    if (images.length === 0) {
      setButtonPost(false);
      Alert.alert("Thông báo", "Vui lòng thêm ảnh cho bài viết.");
      return;
    }
    //Tạo dữ liệu mardown
    const contents = `# ${title}<br><br>${content}<br><br>${days
      .map(
        (day, index) =>
          `## **Ngày ${index + 1}:** ${day.title}<br><br>${day.description
          }<br><br>${day.activities
            .map(
              (activity) =>
                `### ${activity.time} - ${activity.activity}<br><br>**Địa điểm:** ${activity.address}`
            )
            .join("<br><br>")}`
      )
      .join("<br><br>")}`;
    console.log("Contents:", "lsjdhdsjldh");

    //Kiem tra tu cam thong tin bai viet
    if (bannedWordsChecker(title, bannedWords)) {
      console.log("Title:", title);
      setButtonPost(false);
      Toast.show({
        type: "error",
        text1: "Tiêu đề chứa từ cấm",
        text2: "Vui lòng sửa lại tiêu đề bài viết.",
        text1Style: { fontSize: 14 },
        text2Style: { fontSize: 12 },
        position: "top",
      });
      return;
    }
    if (bannedWordsChecker(content, bannedWords)) {
      setButtonPost(false);
      Toast.show({
        type: "error",
        text1: "Nội dung chứa từ cấm",
        text2: "Vui lòng sửa lại mô tả bài viết.",
        text1Style: { fontSize: 14 },
        text2Style: { fontSize: 12 },
        position: "top",
      });
      return;
    }
    for (let dayIndex = 0; dayIndex < days.length; dayIndex++) {
      const day = days[dayIndex];

      // Kiểm tra Tiêu đề ngày
      if (bannedWordsChecker(day.title, bannedWords)) {
        setButtonPost(false);
        Toast.show({
          type: "error",
          text1: `Ngày ${dayIndex + 1}: Tiêu đề chứa từ cấm`,
          text2: `Vui lòng sửa lại tiêu đề ngày ${dayIndex + 1}.`,
          text1Style: { fontSize: 14 },
          text2Style: { fontSize: 12 },
          position: "top",
        });
        return;
      }

      // Kiểm tra mô tả hoạt động cho từng ngày
      for (
        let activityIndex = 0;
        activityIndex < day.activities.length;
        activityIndex++
      ) {
        const activity = day.activities[activityIndex];

        if (bannedWordsChecker(activity.activity, bannedWords)) {
          setButtonPost(false);
          Toast.show({
            type: "error",
            text1: `Ngày ${dayIndex + 1}: Hoạt động thứ ${activityIndex + 1
              } chứa từ cấm`,
            text2: `Vui lòng sửa lại hoạt động ${activityIndex + 1} ngày ${dayIndex + 1
              }.`,
            text1Style: { fontSize: 14 },
            text2Style: { fontSize: 12 },
            position: "top",
          });
          return;
        }
      }

      // Kiểm tra mô tả chung của ngày
      if (bannedWordsChecker(day.description, bannedWords)) {
        setButtonPost(false);
        Toast.show({
          type: "error",
          text1: `Ngày ${dayIndex + 1}: Mô tả chung chứa từ cấm`,
          text2: `Vui lòng sửa lại mô tả chung ngày ${dayIndex + 1}.`,
          text1Style: { fontSize: 14 },
          text2Style: { fontSize: 12 },
          position: "top",
        });
        return;
      }
    }

    //Luư dữ liệu content
    setcontentReviewPost(contents);

    setModalReviewPost(true);

    // console.log("Contents:", contents);
    // console.log("Images:", images);
    // console.log("Cities:", cities);
    // router.push({
    //   pathname: "/(article)/reviewPostUser",
    //   params: {

    //     locations: JSON.stringify(cities),
    //     contents: contents,
    //     images: JSON.stringify(images),
    //   },
    // });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : -125}
    >
      <View style={styles.container}>
        {/* <RowComponent justify="flex-start" styles={{ marginHorizontal: 20 }}>
          <ArrowLeft
            size="32"
            style={{ marginBottom: 15 }}
            onPress={() => {
              router.replace("/(tabs)/");
            }}
            color="#000"
          />
          <TextComponent
            text="Chỉnh sửa bài viết"
            size={24}
            styles={{
              fontWeight: "800",
              margin: 5,
              marginLeft: "25%",
              marginBottom: 20,
            }}
          />
        </RowComponent>
        <View style={[styles.separator, { marginTop: -10, marginBottom: 0 }]} /> */}
        <ScrollView>
          {/* Check in */}
          <RowComponent justify="space-between">
            <TouchableOpacity style={styles.checkin} disabled={true}>
              <RowComponent justify="space-between">
                <Text>Check in lên bản đồ</Text>
                {/* <Icon
                name="checkbox-active"
                size={14}
                style={{ marginLeft: 10 }}
                color={appColors.success}
              /> */}
                <Checkbox
                  color="green"
                  status={isCheckIn ? "checked" : "unchecked"}
                  onPress={() => setIsCheckIn(!isCheckIn)}
                />
              </RowComponent>
            </TouchableOpacity>

            {/* Quốc gia */}
            <SectionComponent>
              <View style={styles.countrySelector}>
                <TouchableOpacity
                  onPress={() => setModalVisibleCountry(true)}
                  style={styles.countryButton}
                >
                  {selectedCountry != null && (
                    <Image
                      source={{
                        uri: countryData.find(
                          (country) => country.id === selectedCountry
                        )?.image,
                      }}
                      style={styles.countryFlag}
                    />
                  )}
                  <Text
                    style={styles.countryButtonText}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {selectedCountry != null
                      ? countryData.find(
                        (country) => country.id === selectedCountry
                      )?.label
                      : "Chọn quốc gia"}
                  </Text>
                  <Icon
                    name="angle-down"
                    size={12}
                    style={{ padding: 8 }}
                    color="#000"
                  />
                </TouchableOpacity>
              </View>
            </SectionComponent>
          </RowComponent>

          {/* Cities */}
          <SectionComponent styles={styles.cities}>
            <ScrollView
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.leftButtons}
            >
              {cities.length === 0 ? (
                <Text
                  style={{
                    color: appColors.danger,
                    padding: 10,
                    fontWeight: "600",
                  }}
                >
                  Chưa chọn tỉnh thành
                </Text>
              ) : (
                cities.map((city) => (
                  <TouchableOpacity
                    disabled={true}
                    key={city.id}
                    style={styles.buttoncities}
                  >
                    <Text style={styles.textbtncities}>{city.name}</Text>
                    <TouchableOpacity
                      style={styles.iconMUL}
                      onPress={() => removeCity(city.id)}
                    >
                      <IconA name="minuscircleo" color="red" />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>

            {cities.length === 0 ? (
              <TouchableOpacity
                style={[styles.fixedRightButton]}
                onPress={() => setModalVisibleCity(true)}
              >
                <Text>
                  Chọn tỉnh <IconA name="pluscircleo" size={15} color="#000" />
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[
                  styles.fixedRightButton,
                  {
                    width: 40,
                    paddingLeft: 10,
                    paddingBottom: 6,
                    paddingRight: 1,
                    marginLeft: 10,
                  },
                ]}
                onPress={() => setModalVisibleCity(true)}
              >
                <Text>
                  <IconA name="pluscircleo" size={20} color="#000" />
                </Text>
              </TouchableOpacity>
            )}
          </SectionComponent>

          {/* Title */}
           {/* Title */}
           <SectionComponent styles={{ marginTop: -135, marginBottom: -15 }}>
            <TextComponent
              text="Tiêu đề"
              size={16}
              styles={{ fontWeight: "bold", color: "#000", marginBottom: 5 }}
            />
            <InputComponent
              value={title}
              placeholder="Nhập tiêu đề bài viết"
              onChange={(val) => setTitle(val)}
              textStyle={{ fontSize: 16, fontWeight: "400", color: "#000" }}
              inputStyle={{
                borderColor: appColors.gray,
                height: 40,
                backgroundColor: appColors.gray3,
                borderRadius: 5,
              }}
            />
          </SectionComponent>

          {/* Content */}
          <SectionComponent>
            <TextComponent
              text="Mô tả"
              size={16}
              styles={{
                fontWeight: "bold",
                color: "#000",
                marginBottom: 5,
                marginTop: -10,
              }}
            />
            <InputComponent
              value={content}
              placeholder="Mô tả chung cho bài viết"
              onChange={(val) => setContent(val)}
              textStyle={{ fontSize: 16, fontWeight: "400", color: "#000" }}
              inputStyle={{
                width: "100%",
                // height: 140,
                backgroundColor: appColors.gray3,
                borderColor: appColors.gray,
                borderRadius: 5,
              }}
              multiline={true}
            />
          </SectionComponent>
          {days.length > 0 && (
            <SectionComponent>
              <Text
                style={{ fontWeight: "bold", fontSize: 16, marginTop: -24 }}
              >
                Lịch trình
              </Text>
            </SectionComponent>
          )}
          {/*  ngày đã thêm */}
          <View style={{ marginTop: -10 }}>
            {days.map((day, dayIndex) => (
              <SectionComponent key={dayIndex} styles={styles.dayContainer}>
                <TouchableOpacity onPress={() => deleteDay(dayIndex)}>
                  <IconA
                    name="minuscircle"
                    size={20}
                    style={{ position: "absolute", top: -20, right: -20 }}
                    color={appColors.danger}
                  />
                </TouchableOpacity>
                <RowComponent
                  styles={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{ marginTop: -20, fontSize: 15, fontWeight: "bold" }}
                  >
                    Ngày {dayIndex + 1}
                  </Text>
                  <InputComponent
                    inputStyle={{
                      flex: 1,
                      height: 30,
                      marginLeft: 5,
                      borderRadius: 5,
                      backgroundColor: appColors.white,
                      borderColor: appColors.gray,
                    }}
                    textStyle={{ color: "#000" }}
                    placeholder={`Mô tả tiêu đề ngày ${dayIndex + 1}`}
                    value={day.title}
                    onChange={(text) => updateDay(dayIndex, "title", text)}
                  />
                </RowComponent>

                {/* Activities */}
                <View style={{ marginTop: 10 }}>
                  {/* Danh sach hoat dong cua ngay do */}
                  {day.activities.map((activity, activityIndex) => (
                    <View key={activityIndex}>
                      <RowComponent
                        justify="center"
                        styles={{ maxHeight: 70, marginBottom: 20 }}
                      >
                        <TouchableOpacity
                          style={{
                            width: 70,
                            height: "100%",
                            // borderRadius: 5,
                            borderTopLeftRadius: 5,
                            borderBottomLeftRadius: 5,
                            backgroundColor: appColors.btnaddActivity,
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                          //Chon gio
                          onPress={() =>
                            showTimePicker(
                              dayIndex,
                              activityIndex,
                              activity.time
                            )
                          }
                        >
                          <Text style={{ color: "#000" }}>
                            {activity.time || "Chọn giờ"}
                          </Text>
                        </TouchableOpacity>

                        {/* hoat dong */}
                        <View style={{ flex: 1 }}>
                          <TouchableOpacity
                            onPress={() => {
                              // console.log(activity);
                              if (activity.address) {
                                handleOpenMapEdit(
                                  dayIndex,
                                  activityIndex,
                                  activity.address
                                );
                              } else {
                                handleOpenMap(dayIndex, activityIndex);
                              }
                            }}
                          >
                            <InputComponent
                              disabled={true}
                              inputStyle={{
                                width: "100%",
                                height: "83.4%",
                                marginTop: 7,
                                borderRadius: 0,
                                borderTopRightRadius: 5,
                                borderBottomRightRadius: 5,
                                borderColor: appColors.btnDay,
                                backgroundColor: appColors.white,
                              }}
                              textStyle={{ color: "#000" }}
                              placeholder={`Địa điểm hoạt động ${activityIndex + 1
                                }`}
                              multiline={true}
                              value={activity.address}
                              onChange={(text) =>
                                updateActivity(
                                  dayIndex,
                                  activityIndex,
                                  "address",
                                  text
                                )
                              }
                            />
                          </TouchableOpacity>
                        </View>
                        <TouchableOpacity
                          style={{ marginTop: 0, marginLeft: 5 }}
                          onPress={() =>
                            deleteActivity(dayIndex, activityIndex)
                          }
                        >
                          <IconA
                            name="minuscircle"
                            size={20}
                            color={appColors.danger}
                          />
                        </TouchableOpacity>
                      </RowComponent>
                      {/* Mô tả hoat dong */}
                      <InputComponent
                        inputStyle={{
                          padding: 0,
                          margin: 0,
                          borderRadius: 5,
                          height: 80,
                          width: "100%",
                          borderColor: appColors.gray,
                        }}
                        placeholder={`Nhập mô tả cho hoạt động ${activityIndex + 1
                          }`}
                        value={activity.activity}
                        multiline={true}
                        onChange={(text) =>
                          updateActivity(
                            dayIndex,
                            activityIndex,
                            "activity",
                            text
                          )
                        }
                      />
                    </View>
                  ))}
                </View>

                {/* Nut them hoat dong */}
                <SectionComponent>
                  <TouchableOpacity
                    style={[styles.addButton, { marginTop: 0 }]}
                    onPress={() => addActivity(dayIndex)}
                  >
                    <Text style={{ fontSize: 13 }}>Thêm hoạt động</Text>
                    <IconA name="pluscircleo" size={15} color="#000" />
                  </TouchableOpacity>
                </SectionComponent>

                <InputComponent
                  inputStyle={{
                    borderRadius: 5,
                    backgroundColor: appColors.inputDay,
                    height: 100,
                    borderColor: appColors.gray,
                  }}
                  placeholder="Nhập mô tả cho ngày"
                  value={day.description}
                  multiline={true}
                  onChange={(text) => updateDay(dayIndex, "description", text)}
                />
              </SectionComponent>
            ))}
          </View>

          {/* Nút thêm ngày */}
          <SectionComponent>
            <TouchableOpacity
              style={[
                styles.addButton,
                { backgroundColor: appColors.btnaddActivity, marginTop: 0 },
              ]}
              onPress={addDay}
            >
              <Text style={{ fontSize: 16 }}>Thêm ngày</Text>
              <IconA name="pluscircleo" size={15} color="#000" />
            </TouchableOpacity>
          </SectionComponent>

          {/* Hình ảnh */}
          <SectionComponent styles={{ marginTop: 10, marginBottom: 35 }}>
            {images.length > 0 ? (
              <View>
                <TouchableOpacity
                  style={{ height: 160, width: 160 }}
                  onPress={() => setModalVisibleImage(true)}
                >
                  <Image
                    source={require("../../assets/images/addImage.png")}
                    style={[styles.festivalImage, { height: 90, width: 90 }]}
                  />
                </TouchableOpacity>
                <ScrollView
                  horizontal={true}
                  showsHorizontalScrollIndicator={false}
                  style={{ maxHeight: 100, marginTop: -50 }}
                >
                  {images.map((imageCity, index) => (
                    <TouchableOpacity
                      key={index}
                      style={{ marginRight: 10 }}
                      onPress={handleChangleInfoImage(index)}
                    >
                      <Image
                        source={{ uri: imageCity.images[0] }}
                        style={[
                          styles.festivalImage,
                          { maxWidth: 100, maxHeight: 100 },
                        ]}
                      />

                      <View
                        style={{
                          backgroundColor: "rgba(0,0,0,0.5)",
                          position: "absolute",
                          bottom: 0,
                          left: 0,
                          width: 100,
                          height: 30,
                          borderBottomEndRadius: 10,
                          borderBottomStartRadius: 10,
                        }}
                      >
                        <Text
                          style={{
                            textAlign: "center",
                            marginTop: 5,
                            fontSize: 16,
                            color: "rgba(255,255,255,0.8)",
                          }}
                        >
                          {imageCity.city?.name}
                        </Text>
                      </View>
                      <View
                        style={{
                          position: "absolute",
                          left: 5,
                          width: 30,
                          height: 30,
                          backgroundColor: "rgba(0,0,0,0.2)",
                          borderRadius: 50,
                          marginTop: 2.7,
                        }}
                      >
                        <Text
                          style={{
                            color: "white",
                            fontWeight: "bold",
                            textAlign: "center",
                            fontSize: 20,
                          }}
                        >
                          {imageCity.images.length}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.removeImageButton}
                        onPress={() => handleRemoveImagesAndCity(index)}
                      >
                        <IconA name="close" size={20} color="white" />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.festivalImage}
                onPress={() => setModalVisibleImage(true)}
              >
                <Image
                  source={require("../../assets/images/addImage.png")}
                  style={styles.festivalImage}
                />
              </TouchableOpacity>
            )}
          </SectionComponent>

          {/* Chọn giờ */}
          <DateTimePickerModal
            isVisible={modalVisibleTimePicker}
            mode="time"
            date={selectedTime || new Date()}
            onConfirm={handleConfirm}
            onCancel={hideTimePicker}
          />
        </ScrollView>

        {/* Public */}
        <View style={[styles.separator, { marginTop: 0, marginBottom: 0 }]} />
        <SectionComponent
          styles={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 10,
          }}
        >
          <RowComponent
            styles={{
              width: "100%",
              height: 30,
              padding: 5,
              marginTop: 10,
              marginBottom: -10,
              justifyContent: "center",
            }}
            justify="space-between"
          >
            <TextComponent
              text="Riêng tư"
              size={13}
              styles={{
                fontWeight: "500",
                backgroundColor: !isPublic ? "#ea695d" : appColors.gray3,
                borderRadius: 50,
                borderColor: appColors.gray,
                borderWidth: 1,
                padding: 5,
                width: 100,
                height: 28,
                textAlign: "center",
              }}
            />
            <Switch
              value={isPublic}
              trackColor={{ true: "#1aad1a", false: appColors.danger }}
              thumbColor={isPublic ? "#5dea60" : "#ea695d"}
              onValueChange={(val) => setIsPublic(val)}
            />
            <TextComponent
              text="Công khai"
              size={13}
              styles={{
                fontWeight: "500",
                backgroundColor: isPublic ? "#5dea60" : appColors.gray3,
                borderRadius: 50,
                padding: 5,
                width: 100,
                borderColor: appColors.gray,
                borderWidth: 1,
                height: 28,
                textAlign: "center",
              }}
            />
          </RowComponent>
        </SectionComponent>

        {/* Nút chia sẻ */}
        <SectionComponent>
          {buttonPost ? (
            <RowComponent styles={{ marginHorizontal: 10 }}>
              <TouchableOpacity
                onPress={() => {
                  handleReviewPost();
                }}
                style={{
                  backgroundColor: appColors.btncity,
                  width: "20%",
                  height: "100%",
                  borderRadius: 10,
                  marginRight: 10,
                  borderColor: "green",
                  borderWidth: 1,
                }}
              >
                <TextComponent
                  text="Xem trước"
                  size={14}
                  styles={{
                    fontWeight: "bold",
                    color: "green",
                    textAlign: "center",
                    justifyContent: "center",
                    marginTop: 3,
                    padding: 5,
                  }}
                />
              </TouchableOpacity>
              <ButtonComponent
                text="Đang Sửa Bài...."
                textStyles={{
                  width: "75%",
                  fontWeight: "bold",
                  fontSize: 30,
                  textAlign: "center",
                }}
                color={appColors.primary}
                onPress={handleEditPost}
              />
            </RowComponent>
          ) : (
            <RowComponent styles={{ marginHorizontal: 10 }}>
              <TouchableOpacity
                onPress={() => {
                  handleReviewPost();
                }}
                style={{
                  backgroundColor: appColors.btncity,
                  width: "20%",
                  height: "100%",
                  borderRadius: 10,
                  marginRight: 10,
                  borderColor: "green",
                  borderWidth: 1,
                }}
              >
                <TextComponent
                  text="Xem trước"
                  size={14}
                  styles={{
                    fontWeight: "bold",
                    color: "green",
                    textAlign: "center",
                    justifyContent: "center",
                    marginTop: 3,
                    padding: 5,
                  }}
                />
              </TouchableOpacity>
              <ButtonComponent
                text="Sửa bài viết"
                textStyles={{
                  width: "75%",
                  fontWeight: "bold",
                  fontSize: 30,
                  textAlign: "center",
                }}
                color={appColors.primary}
                onPress={handleEditPost}
              />
            </RowComponent>
          )}
        </SectionComponent>
        {/* Chọn nước cho bài viết */}
        {/* Modal chọn quốc gia */}
        <Modal visible={modalVisibleCountry}>
          <View>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Chọn quốc gia</Text>
              <FlatList
                data={countryData}
                keyExtractor={(item) => item.id}
                style={styles.countryList}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.countryOption}
                    onPress={() => handleCountryChange(item)}
                  >
                    <Image
                      source={{ uri: item.image }}
                      style={styles.optionFlag}
                    />
                    <Text style={styles.countryLabel}>{item.label}</Text>
                  </TouchableOpacity>
                )}
              />
              <View style={styles.separator} />
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisibleCountry(false)}
              >
                <Text style={styles.closeButtonText}>Đóng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        {/* Chọn tỉnh thành cho bài viết */}
        <Modal
          visible={modalVisibleCity}
          onDismiss={() => {
            setModalVisibleCity(false);
            setSearchQueryCity("");
          }}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Chọn Thành Phố</Text>
            {/* Tìm kiếm thành phố */}
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Tìm kiếm địa điểm"
                value={searchQueryCity}
                onChangeText={setSearchQueryCity}
              />
            </View>
            {selectedCountry ? (
              <FlatList
                data={citiesDataFilter}
                keyExtractor={(item) => item.id}
                style={[styles.countryList, { minHeight: 200 }]}
                renderItem={({ item }) => {
                  //Loc ra nhung thanh pho da chon
                  const isCitySelected = cities.some(
                    (city) => city.id === item.id
                  );
                  return (
                    <TouchableOpacity
                      style={styles.countryOption}
                      onPress={handCityPress(item)}
                      disabled={isCitySelected}
                    >
                      <Text
                        style={[
                          styles.countryLabel,
                          isCitySelected && { color: "gray" },
                        ]}
                      >
                        {item.name}
                      </Text>
                    </TouchableOpacity>
                  );
                }}
              />
            ) : (
              <Text style={{ fontSize: 16, color: "red" }}>
                Chưa chọn quốc gia trước khi chọn thành phố
              </Text>
            )}
            <View style={styles.separator} />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setModalVisibleCity(false);
                setSearchQueryCity("");
              }}
            >
              <Text style={styles.closeButtonText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </Modal>

        {/* Chon map */}
        <Modal
          visible={modalVisibleMap}
          style={{ width: "100%" }}
          onDismiss={() => {
            setSelectedLocation(null);
            setRegion({
              latitude: 17.65005783136121,
              longitude: 106.40283940732479,
              latitudeDelta: 9,
              longitudeDelta: 9,
            });
            setSearchQuery("");
            setModalVisibleMap(false);
          }}
        >
          <View style={[styles.containerMap]}>
            <RowComponent>
              <Text style={[styles.modalTitle, { marginLeft: 10 }]}>
                Chọn địa điểm
              </Text>
              <LottieView
                source={require("../../assets/images/map.json")}
                autoPlay
                loop
                style={{
                  width: 60,
                  height: 35,
                }}
              />
            </RowComponent>
            {/* Search */}
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Tìm kiếm địa điểm"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              <TouchableOpacity
                style={styles.searchButton}
                onPress={handleSearch}
              >
                {loadingButtonSearch ? (
                  <LottieView
                    source={require("../../assets/images/search.json")}
                    autoPlay
                    loop
                    style={{
                      width: 120,
                      height: 90,
                      marginTop: -35,
                      marginLeft: -50,
                    }}
                    colorFilters={[{ keypath: "*", color: "#fff" }]}
                  />
                ) : (
                  <IconA name="search1" size={20} color={appColors.white} />
                )}
              </TouchableOpacity>
            </View>
            <RowComponent styles={{ marginTop: 0 }}>
              <Text style={{ fontWeight: "bold" }}>Lưu ý: </Text>
              <Text style={{ fontSize: 12, color: appColors.danger }}>
                Nhấn giữ để chọn vị trí trên bản đồ
              </Text>
            </RowComponent>
            <View style={{ height: 550 }}>
              <MapView
                ref={mapViewRef}
                style={styles.map}
                initialRegion={region}
                onRegionChangeComplete={setRegion}
                onLongPress={handleMapPress}
                mapType="hybrid"
              >
                {selectedLocation && (
                  <Marker
                    coordinate={{
                      latitude: selectedLocation.latitude,
                      longitude: selectedLocation.longitude,
                    }}
                    title={selectedLocation.name}
                  />
                )}
              </MapView>
              {loadingLocation && (
                <View style={styles.loadingOverlay}>
                  <ActivityIndicator size="large" color={appColors.danger} />
                </View>
              )}
              <RowComponent justify="space-around" styles={{ marginTop: 10 }}>
                <TouchableOpacity
                  style={[
                    styles.closeButton,
                    { marginRight: 10, backgroundColor: "green" },
                  ]}
                  onPress={handleSaveLocation}
                >
                  <Text style={styles.closeButtonText}>Lưu</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.closeButton, { marginTop: 10 }]}
                  onPress={() => {
                    setSelectedLocation(null);
                    setRegion({
                      latitude: 17.65005783136121,
                      longitude: 106.40283940732479,
                      latitudeDelta: 9,
                      longitudeDelta: 9,
                    });
                    setSearchQuery("");
                    setModalVisibleMap(false);
                  }}
                >
                  <Text style={[styles.closeButtonText]}>Đóng</Text>
                </TouchableOpacity>
              </RowComponent>
            </View>
          </View>
        </Modal>

        {/* Modal thêm ảnh  */}
        <Modal
          visible={modalVisibleImage}
          onDismiss={() => {
            setSelectedImages([]);
            setSelectedCityForImages(null);
            setModalVisibleImage(false);
          }}
        >
          <View style={styles.modalContent}>
            <View style={{ padding: 10 }}>
              <Text style={styles.modalTitle}>Thêm Ảnh</Text>
            </View>
            <View>
              {selectedImages.length > 0 ? (
                <View>
                  <ScrollView
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                    style={{ maxHeight: 100 }}
                  >
                    {selectedImages.map((imageUri, index) => (
                      <View key={index}>
                        <Image
                          source={{ uri: imageUri }}
                          style={[
                            styles.festivalImage,
                            {
                              width: 100,
                              height: 100,
                              marginRight: 2,
                              resizeMode: "cover",
                            },
                          ]}
                        />
                        <TouchableOpacity
                          style={styles.removeImageButton}
                          onPress={() => handleRemoveImage(index)}
                        >
                          <IconA name="close" size={20} color="white" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              ) : (
                <TouchableOpacity onPress={handleChooseImages}>
                  <Image
                    source={require("../../assets/images/addImage.png")}
                    style={[styles.festivalImage, { height: 100, width: 100 }]}
                  />
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.separator} />
            {selectedImages.length > 0 ? (
              <RowComponent>
                <TouchableOpacity onPress={handleChooseImages}>
                  <Image
                    source={require("../../assets/images/addImage.png")}
                    style={[
                      styles.festivalImage,
                      { height: 50, width: 50, marginRight: 40 },
                    ]}
                  />
                </TouchableOpacity>
                {selectedCityForImages ? (
                  <TouchableOpacity
                    style={[styles.fixedRightButton, { width: 130 }]}
                    onPress={() => setModalVisibleCityImages(true)}
                  >
                    <Text>
                      {selectedCityForImages.name}{" "}
                      <IconA name="retweet" size={15} color="#000" />
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={[styles.fixedRightButton]}
                    onPress={() => setModalVisibleCityImages(true)}
                  >
                    <Text>
                      Chọn tỉnh{" "}
                      <IconA name="pluscircleo" size={15} color="#000" />
                    </Text>
                  </TouchableOpacity>
                )}
              </RowComponent>
            ) : (
              <>
                {selectedCityForImages ? (
                  <TouchableOpacity
                    style={[styles.fixedRightButton, { width: 130 }]}
                    onPress={() => setModalVisibleCityImages(true)}
                  >
                    <Text>
                      {selectedCityForImages.name}{" "}
                      <IconA name="retweet" size={15} color="#000" />
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={[styles.fixedRightButton]}
                    onPress={() => setModalVisibleCityImages(true)}
                  >
                    <Text>
                      Chọn tỉnh{" "}
                      <IconA name="pluscircleo" size={15} color="#000" />
                    </Text>
                  </TouchableOpacity>
                )}
              </>
            )}
            {/* Các nút xử lý */}
            <RowComponent>
              <TouchableOpacity
                style={[
                  styles.closeButton,
                  { backgroundColor: "green", margin: 10, marginTop: 20 },
                ]}
                onPress={handleSaveImages}
              >
                <Text style={styles.closeButtonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.closeButton, { margin: 10, marginTop: 20 }]}
                onPress={() => {
                  setSelectedImages([]);
                  setSelectedCityForImages(null);
                  setModalVisibleImage(false);
                }}
              >
                <Text style={styles.closeButtonText}>Đóng</Text>
              </TouchableOpacity>
            </RowComponent>
          </View>
        </Modal>
        {/* Modal sua tt anh */}
        <Modal
          visible={modalVisibleImageInfEdit}
          onDismiss={() => {
            setSelectedImages([]);
            setSelectedCityForImages(null);
            setModalVisibleImageInfEdit(false);
          }}
        >
          <View style={styles.modalContent}>
            <View style={{ padding: 10 }}>
              <Text style={styles.modalTitle}>Sửa Thông Tin Ảnh</Text>
            </View>
            <View>
              {selectedImages.length > 0 ? (
                <View>
                  <ScrollView
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                    style={{ maxHeight: 100 }}
                  >
                    {selectedImages.map((imageUri, index) => (
                      <View key={index}>
                        <Image
                          source={{ uri: imageUri }}
                          style={[
                            styles.festivalImage,
                            {
                              width: 100,
                              height: 100,
                              marginRight: 2,
                              resizeMode: "cover",
                            },
                          ]}
                        />
                        <TouchableOpacity
                          style={styles.removeImageButton}
                          onPress={() => handleRemoveImage(index)}
                        >
                          <IconA name="close" size={20} color="white" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              ) : (
                <TouchableOpacity onPress={handleChooseImages}>
                  <Image
                    source={require("../../assets/images/addImage.png")}
                    style={[styles.festivalImage, { height: 100, width: 100 }]}
                  />
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.separator} />
            {selectedImages.length > 0 ? (
              <RowComponent>
                <TouchableOpacity onPress={handleChooseImages}>
                  <Image
                    source={require("../../assets/images/addImage.png")}
                    style={[
                      styles.festivalImage,
                      { height: 50, width: 50, marginRight: 40 },
                    ]}
                  />
                </TouchableOpacity>
                {selectedCityForImages && (
                  <TouchableOpacity
                    style={[styles.fixedRightButton, { width: 140 }]}
                    onPress={() => setModalVisibleCityImages(true)}
                  >
                    <Text>
                      {selectedCityForImages.name}{" "}
                      <IconA name="retweet" size={15} color="#000" />
                    </Text>
                  </TouchableOpacity>
                )}
              </RowComponent>
            ) : (
              <>
                {selectedCityForImages ? (
                  <TouchableOpacity
                    style={[styles.fixedRightButton, { width: 140 }]}
                    onPress={() => setModalVisibleCityImages(true)}
                  >
                    <Text>
                      {selectedCityForImages.name}{" "}
                      <IconA name="retweet" size={15} color="#000" />
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={[styles.fixedRightButton]}
                    onPress={() => setModalVisibleCityImages(true)}
                  >
                    <Text>
                      Chọn tỉnh{" "}
                      <IconA name="pluscircleo" size={15} color="#000" />
                    </Text>
                  </TouchableOpacity>
                )}
              </>
            )}
            {/* Các nút xử lý */}
            <RowComponent>
              <TouchableOpacity
                style={[
                  styles.closeButton,
                  { backgroundColor: "green", margin: 10, marginTop: 20 },
                ]}
                onPress={handleSaveImagesEditInfo}
              >
                <Text style={styles.closeButtonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.closeButton, { margin: 10, marginTop: 20 }]}
                onPress={() => {
                  setSelectedImages([]);
                  setSelectedCityForImages(null);
                  setModalVisibleImageInfEdit(false);
                }}
              >
                <Text style={styles.closeButtonText}>Đóng</Text>
              </TouchableOpacity>
            </RowComponent>
          </View>
        </Modal>

        {/* Chọn tỉnh thành cho ảnh */}
        <Modal
          visible={modalVisibleCityImages}
          onDismiss={() => setModalVisibleCityImages(false)}
        >
          <View style={[styles.modalContentCityImages]}>
            <Text style={[styles.modalTitle, { fontSize: 23 }]}>
              Chọn Tỉnh Thành Cho Ảnh
            </Text>
            {cities.length > 0 ? (
              <FlatList
                data={cities}
                keyExtractor={(item) => item.id}
                style={[styles.countryList]}
                renderItem={({ item }) => {
                  //Loc ra nhung thanh pho da chon
                  const isCitySelected = images.some(
                    (image) => image.city?.id === item.id
                  );
                  return (
                    <TouchableOpacity
                      style={styles.countryOption}
                      onPress={handCityImagesPress(item)}
                      disabled={isCitySelected}
                    >
                      <Text
                        style={[
                          styles.countryLabel,
                          isCitySelected && { color: "gray" },
                        ]}
                      >
                        {item.name}
                      </Text>
                    </TouchableOpacity>
                  );
                }}
              />
            ) : (
              <View>
                <Text>Chưa có tỉnh thành nào cho ảnh. </Text>
                <Text>Vui lòng thêm tỉnh thành cho bài viết trước.</Text>
              </View>
            )}
            <View style={styles.separator} />

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisibleCityImages(false)}
            >
              <Text style={styles.closeButtonText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </Modal>

        {/* Modal review post */}
        <Modal
          visible={modalReviewPost}
          style={styles.modalreview}
          onDismiss={() => setModalReviewPost(false)}
        >
          <ReviewPostUser
            locs={cities}
            imgs={images}
            contents={contentReviewPost}
          />
          <SectionComponent styles={{ marginBottom: -15 }}>
            <View style={styles.separator} />
            <TouchableOpacity
              style={[
                styles.closeButton,
                {
                  justifyContent: "center",
                  alignItems: "center",
                  width: "100%",
                },
              ]}
              onPress={() => setModalReviewPost(false)}
            >
              <Text style={[styles.closeButtonText]}>Đóng</Text>
            </TouchableOpacity>
          </SectionComponent>
        </Modal>

        {/* Modal loading */}
        {buttonPost ? (
          <Modal visible={buttonPost}>
            <View
              style={[styles.loadingOverlay, { width: "100%", height: "100%" }]}
            >
              <LottieView
                source={require("../../assets/images/travel.json")}
                autoPlay
                loop
                style={{
                  position: "absolute",
                  top: -270,
                  left: -105,
                  zIndex: 10,
                  width: 600,
                  height: 350,
                }}
              />
            </View>
          </Modal>
        ) : null}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  //Full app
  container: {
    flex: 1,
    backgroundColor: "white",
    // paddingTop: 50,
  },
  //Modal map
  containerMap: {
    textAlign: "center",
    width: "95%",
    height: 600,
    padding: 10,
    marginLeft: 10,
    marginRight: 10,
    marginBottom: 30,
    backgroundColor: "#fff",
  },

  map: {
    width: "100%",
    height: "76%",
  },
  //checkin
  checkin: {
    borderWidth: 1,
    borderColor: "#ccc",
    width: "48%",
    marginLeft: 15,
    height: 30,
    backgroundColor: appColors.gray3,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.6,
    shadowRadius: 3.5,
    elevation: 10,
  },
  //cities
  cities: {
    flexDirection: "row",
    height: 200,
    justifyContent: "flex-start",
  },
  leftButtons: {
    paddingLeft: 5,
    paddingTop: 1.3,
    flexDirection: "row",
  },
  fixedRightButton: {
    borderWidth: 1,
    borderColor: appColors.gray2,
    shadowColor: "#000",
    padding: 10,
    height: 40,
    width: 120,
    fontSize: 16,
    backgroundColor: appColors.gray3,
    borderRadius: 30,
    paddingLeft: 30,
  },
  buttoncities: {
    shadowColor: "#000",
    padding: 10,
    height: 40,
    width: 100,
    fontSize: 16,
    backgroundColor: appColors.btncity,
    borderRadius: 30,
    marginRight: 10,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.6,
    shadowRadius: 3.5,
    elevation: 10,
  },
  textbtncities: {
    textAlign: "center",
  },
  iconMUL: {
    position: "absolute",
    color: appColors.danger,
    fontSize: 15,
    right: 0,
    top: 0,
  },
  //them ngay
  dayContainer: {
    borderColor: appColors.gray,
    borderWidth: 1,
    margin: 15,
    padding: 10,
    backgroundColor: appColors.gray3,
    marginTop: 10,
    borderRadius: 2,
  },
  input: {
    height: 40,
    backgroundColor: "#fff",
    borderColor: "#ccc",
    borderWidth: 1,
    paddingHorizontal: 10,
    marginTop: 5,
  },
  addButton: {
    borderWidth: 1,
    borderRadius: 50,
    backgroundColor: appColors.btnDay,
    width: 150,
    marginTop: -10,
    padding: 10,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  //Modal city
  modalContent: {
    zIndex: 10,
    width: "90%",
    padding: 20,
    marginLeft: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    alignItems: "center",
  },
  modalContentCityImages: {
    zIndex: 100,
    width: "90%",
    padding: 20,
    marginLeft: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 25,
    fontWeight: "bold",
    marginBottom: 6,
  },
  countryList: {
    maxHeight: 200,
    width: "100%",
  },
  countryOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderColor: "#ccc",
    borderBottomWidth: 1,
    width: "100%",
  },
  countryLabel: {
    fontSize: 16,
    marginLeft: 10,
    flex: 1,
  },
  optionFlag: {
    width: 30,
    height: 20,
    resizeMode: "contain",
  },
  sheetContent: {
    padding: 30,
    borderRadius: 20,
  },
  festivalImage: {
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 12,
    width: 160,
    height: 160,
  },
  closeButton: {
    width: 100,
    height: 40,
    backgroundColor: "#f00",
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
    marginTop: 5,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  // Dấu ngang
  separator: {
    height: 1,
    width: "100%",
    backgroundColor: "#ccc",
    marginVertical: 10,
  },
  //Search map
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 10,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: "white",
  },
  searchButton: {
    backgroundColor: "#2196F3",
    padding: 10,
    borderRadius: 8,
    width: 40,
    height: 40,
    marginLeft: 8,
  },
  searchButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  //modal ảnh
  removeImageButton: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 50,
    padding: 1,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: 420,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },

  // Chọn đất nước
  countrySelector: {
    backgroundColor: "#ccc",
    borderRadius: 30,
    height: 33,
    width: 140,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#aaa",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.6,
    shadowRadius: 3.5,
    elevation: 10,
  },
  countryButton: {
    marginLeft: 10,
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  countryButtonText: {
    fontSize: 12,
    color: "#000",
    marginLeft: 5,
    flexShrink: 1,
  },
  countryFlag: {
    width: 22,
    height: 20,
    resizeMode: "contain",
  },
  modalreview: {
    position: "absolute",
    top: 10,
    width: "99%",
    height: "90%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    padding: 5,
    borderRadius: 5
  },
});

export default EditPostUser;
