import {
  Alert,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ReactNativeZoomableView } from "@openspacelabs/react-native-zoomable-view";
import VietNamMap from "@/components/maps/VietNamMap";
import { useHomeProvider } from "@/contexts/HomeProvider";
import { createRef, useCallback, useEffect, useState } from "react";
import { SelectList } from "react-native-dropdown-select-list";
import { ref, remove } from "firebase/database";
import { database, get, onValue, set, update } from "@/firebase/firebaseConfig";
import { Dropdown, SelectCountry } from "react-native-element-dropdown";
import { Divider } from "react-native-paper";
import {
  Entypo,
  FontAwesome,
  FontAwesome6,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
  PanGestureHandler,
} from "react-native-gesture-handler";
import { useMapCheckinProvider } from "@/contexts/MapCheckinProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Link, router, useFocusEffect } from "expo-router";
import Toast from "react-native-toast-message-custom";
import { TabActions, useNavigation } from "@react-navigation/native";
import LottieView from "lottie-react-native";

const { width } = Dimensions.get("window");

const CheckInMap = () => {
  const navigation = useNavigation();
  const [dataCountries, setDataCountries] = useState([]);
  const [dataAreas, setDataAreas] = useState([]);
  const [dataCities, setDataCities] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedArea, setSelectedArea] = useState(null);
  const [hasFetched, setHasFetched] = useState(null);
  // const [selectedCity, setSelectedCity] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const translateX = useSharedValue(width);
  const [reload, setReload] = useState(false)
  const [userId, setUserId] = useState(null);
  const { dataAccount, setDataAccount } = useHomeProvider();
  const {
    selectedCity,
    setSelectedCity,
    checkedCityColor,
    selectedCityId,
    setSelectedCityId,
    dataCheckedCities,
    setDataCheckedCities,
    cityRemoved,
    setCityIdRemoved,
  } = useMapCheckinProvider();

  // Login state
  useEffect(() => {
    const fetchUserId = async () => {
      const userId = await AsyncStorage.getItem("userToken");
      setUserId(userId);
    };
    fetchUserId();
  }, []);

  // Fetch checkin list by country
  const fetchCheckinList = async (accountId) => {
    const refCheckin = ref(database, `accounts/${accountId}/checkInList`);
    try {
      const snapshot = await get(refCheckin);
      if (snapshot.exists()) {
        const data = snapshot.val();
        // Tieu chi 1: co tat ca selectedCities trong postLocation
        const allCitiesCheckedByCountry = Object.keys(data).flatMap(
          (country) => {
            return Object.entries(data[country]).map(([cityCode, cityName]) => {
              return { [cityCode]: cityName };
            });
          }
        );
        setSelectedArea(null);
        setSelectedCityId(null);
        setSelectedCity(null);
        setDataCheckedCities(allCitiesCheckedByCountry);
      } else {
        console.log("check");
      }
    } catch (error) {
      console.error("Cannot find <checkin> on firebase", error);
    }
  };
  // Lấy các tỉnh đã checkin lần đầu sau khi đã có dữ liệu của account
  useEffect(() => {
    if (dataAccount) {
      fetchCheckinList(dataAccount.id);
    }
  }, [dataAccount, reload]);

  // useEffect(() => {
  //   setHasFetched(false)
  // }, [dataAccount, selectedCountry]);

  useFocusEffect(
    useCallback(() => {
      // Kiểm tra khi màn hình focus và cả 2 biến đều có dữ liệu
      if (dataAccount) {
        console.log("map checkin focus");
        setSelectedArea(null);
        setSelectedCityId(null);
        setSelectedCity(null);
        fetchCheckinList(dataAccount.id);
      }
      return () => {
        console.log("Map Check in screen is unfocused");
      };
    }, [dataAccount]) // Cập nhật khi các giá trị này thay đổi
  );
  // Lấy các quốc gia
  useEffect(() => {
    const refCountries = ref(database, `countries`);
    const unsubscribe = onValue(
      refCountries,
      (snapshot) => {
        if (snapshot.exists()) {
          const jsonDataCountries = snapshot.val();
          const countriesArray = Object.keys(jsonDataCountries).map((key) => ({
            label: jsonDataCountries[key].label,
            value: key,
            image: {
              uri: jsonDataCountries[key].image,
            },
          }));
          // console.log(countriesArray);
          setSelectedArea(null);
          setSelectedCityId(null);
          setSelectedCity(null);
          setSelectedCountry(countriesArray[0]);
          setDataCountries(countriesArray);
        } else {
          console.log("No data available1");
        }
      },
      (error) => {
        console.error("Error fetching data:", error);
      }
    );

    return () => {
      unsubscribe(); // Sử dụng unsubscribe để hủy listener
    };
  }, []);

  // Lấy vùng theo quốc gia
  const fetchAreasByCountry = async (countryId) => {
    try {
      const refAreas = ref(database, `areas/${countryId}`);
      const snapshot = await get(refAreas);
      if (snapshot.exists()) {
        const dataAreasJson = snapshot.val();
        const dataAreasArray = Object.entries(dataAreasJson).map(
          ([key, value]) => ({
            label: value.label,
            value: key,
          })
        );
        // console.log(dataAreasArray);
        setDataAreas(dataAreasArray);
      } else {
        console.log("No data post available");
      }
    } catch (error) {
      console.error("Error fetching area data search: ", error);
    }
  };

  // Lấy vùng của việt nam (chạy lần đầu) vì default là việt nam
  useEffect(() => {
    if (selectedCountry) {
      fetchAreasByCountry(selectedCountry.value);
    }
  }, [selectedCountry]);

  // Fetch data cities theo vùng miền
  const fetchCitiesByArea = async (countryId, areaId) => {
    try {
      const refCities = ref(database, `cities/${countryId}/${areaId}`);
      const snapshot = await get(refCities);
      if (snapshot.exists()) {
        const dataCitiesJson = snapshot.val();
        const dataCitiesArray = Object.keys(dataCitiesJson).map((key) => ({
          label: dataCitiesJson[key].name,
          value: key,
        }));
        setDataCities(dataCitiesArray);
      } else {
        console.log("No data cities available");
      }
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  };

  // Hàm Update lên firebase
  const updateCityToFirebase = async (selectedCity, selectedCountryId) => {
    try {
      const refCheckinListByCountry = ref(
        database,
        `accounts/${dataAccount.id}/checkInList/${selectedCountryId}`
      );
      const countrySnapshot = await get(refCheckinListByCountry);
      // Data update
      const dataUpdate = { [selectedCity.value]: selectedCity.label };
      if (countrySnapshot.exists()) {
        // Nếu quốc gia đã tồn tại, cập nhật dữ liệu của các thành phố
        await update(refCheckinListByCountry, dataUpdate);
      } else {
        // Nếu quốc gia chưa tồn tại, tạo quốc gia mới và thêm dữ liệu thành phố
        await set(refCheckinListByCountry, dataUpdate);
        console.log("Country and city data added successfully");
      }

      // Toast thông báo
      Toast.show({
        type: "success",
        position: "top",
        text1: `Check in thành công!`,
        text2: `Bạn đã thêm tỉnh ${selectedCity.label} vào danh sách.`,
        visibilityTime: 3000,
        icon: "success",
        text1Style: { fontSize: 16 },
        text2Style: { fontSize: 14 },
      });
    } catch (error) {
      // Alert khi firebase không có connect
      console.error("Error updating/adding city: ", error);
    }
  };

  // Hàm Check in
  const handleCheckIn = (selectedCity, selectedCountryId) => {
    if (selectedCountryId && selectedCity) {
      // Show dialog
      Alert.alert(
        "Xác nhận check in",
        `Bạn có muốn check in tỉnh ${selectedCity.label}`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "OK",
            onPress: () => {
              // Check in lên firebase
              updateCityToFirebase(selectedCity, selectedCountryId);
              setReload(!reload)
            },
          },
        ]
      );
    } else {
      Toast.show({
        type: "error",
        position: "top",
        text1: "Có vấn đề gì đó!",
        text2: `Có vẻ bạn chưa chọn tỉnh check in.`,
        visibilityTime: 3000,
        icon: "error",
        text1Style: { fontSize: 16 },
        text2Style: { fontSize: 14 },
      });
    }
  };

  // Hàm Update lên firebase
  const removeCityToFirebase = async (selectedCity, selectedCountryId) => {
    try {
      const refCheckinListByCountry = ref(
        database,
        `accounts/${dataAccount.id}/checkInList/${selectedCountryId}`
      );
      const countrySnapshot = await get(refCheckinListByCountry);

      if (countrySnapshot.exists()) {
        // Nếu quốc gia đã tồn tại thì mới hợp lẹ để xóa
        const cityRef = ref(
          database,
          `accounts/${dataAccount.id}/checkInList/${selectedCountryId}/${selectedCity.value}`
        );
        // Xóa thành phố khỏi danh sách
        setCityIdRemoved(selectedCity); // Lưu lại thành phố vừa bị xóa để tô màu lại
        setReload(!reload)
        await remove(cityRef);
        // Toast thông báo
        Toast.show({
          type: "success",
          position: "top",
          text1: `Check out thành công!`,
          text2: `Bạn đã xóa tỉnh ${selectedCity.label} ra khỏi danh sách.`,
          visibilityTime: 3000,
          icon: "success",
          text1Style: { fontSize: 16 },
          text2Style: { fontSize: 14 },
        });
      } else {
        console.log("Chưa checkin tỉnh này");
      }
    } catch (error) {
      // Alert khi firebase không có connect
      console.error("Error remove city: ", error);
    }
  };

  // Hàm Check out
  const handleCheckOut = (selectedCity, selectedCountryId) => {
    if (selectedCountryId && selectedCity) {
      if (
        dataCheckedCities.some((city) =>
          city.hasOwnProperty(selectedCity.value)
        )
      ) {
        // Show dialog
        Alert.alert(
          "Xác nhận hủy check in",
          `Bạn có muốn hủy check in tỉnh ${selectedCity.label} `,
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "OK",
              onPress: () => {
                // Gọi hàm checkout
                removeCityToFirebase(selectedCity, selectedCountryId);
              },
            },
          ]
        );
      } else {
        Toast.show({
          type: "error",
          position: "top",
          text1: "Có vấn đề gì đó!",
          text2: `Có vẻ tỉnh ${selectedCity.label} chưa được check in.`,
          visibilityTime: 3000,
          icon: "error",
          text1Style: { fontSize: 16 },
          text2Style: { fontSize: 14 },
        });
      }
    } else {
      Toast.show({
        type: "error",
        position: "top",
        text1: "Có vấn đề gì đó!",
        text2: `Có vẻ bạn chưa chọn tỉnh để check out.`,
        visibilityTime: 3000,
        icon: "error",
        text1Style: { fontSize: 16 },
        text2Style: { fontSize: 14 },
      });
    }
  };

  // Hàm xem chi tiết tỉnh
  const handleTapOnGallery = () => {
    if (selectedCity) {
      router.push({
        pathname: "/galleryCities",
        params: { idCity: selectedCity.value, idCountry: selectedCountry.value },
      });
      // console.log(selectedCity.value, selectedCountry.value);
    } else {
      Toast.show({
        type: "error",
        position: "top",
        text1: "Có vấn đề gì đó!",
        text2: `Có vẻ bạn chưa chọn tỉnh.`,
        visibilityTime: 3000,
        icon: "error",
        text1Style: { fontSize: 16 },
        text2Style: { fontSize: 14 },
      });
    }
  };

  // Hàm xem bài viết và tour
  const handleTapByButton = async (selectedCity, tabscreen) => {
    if (selectedCity && tabscreen) {
      // Lưu id địa điểm lên behavior và chuyển về home
      //1. Lưu lên firebase
      // const refBehavior = ref(database, `accounts/${userId}/behavior`);
      // const dataUpdate = {
      //   content: "",
      //   location: [selectedCity.value],
      // };
      // await update(refBehavior, dataUpdate);
      // 2. Chuyển về home hoặc tour
      if (tabscreen === 'index') {
        router.replace({
          pathname: "/",
          params: { selectedCityId: selectedCity.value, content: '' }
        })
      } else if (tabscreen === 'tour') {
        router.replace({
          pathname: "/tour",
          params: { selectedCityId: selectedCity.value, content: '' }
        })
      }
    } else {
      Toast.show({
        type: "error",
        position: "top",
        text1: "Có vấn đề gì đó!",
        text2: `Có vẻ bạn chưa chọn tỉnh.`,
        visibilityTime: 3000,
        icon: "error",
        text1Style: { fontSize: 16 },
        text2Style: { fontSize: 14 },
      });
    }
  };

  //  // Hàm xem tour
  //  const handleTapOnShowTour = async (locationId) => {
  //   // Lưu id địa điểm lên behavior và chuyển về home
  //   //1. Lưu lên firebase
  //   const refBehaviorsLocation = ref(database, `accounts/${userId}/behavior`)
  //   const dataUpdate = {
  //     'content': '',
  //     'location': [locationId]
  //   }
  //   await update(refBehaviorsLocation, dataUpdate);
  //   // 2. Chuyển về home
  //   // const jumpToAction = TabActions.jumpTo('index'); // Tên của Tab.Screen mục tiêu
  //   // navigation.dispatch(jumpToAction);
  //   navigation.navigate('tour')
  // }
  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.hearder}>
        <View style={styles.sortContainer}>
          <View style={{ flexDirection: "row", marginBottom: 6 }}>
            {/* Chọn quốc gia */}
            <SelectCountry
              style={[styles.dropdown, { flex: 1.1, marginRight: 6 }]}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              imageStyle={styles.imageStyle}
              inputSearchStyle={[styles.inputSearchStyle, { borderRadius: 10 }]}
              iconStyle={styles.iconStyle}
              value={selectedCountry ? selectedCountry.value : ""}
              data={dataCountries ? dataCountries : []}
              search
              maxHeight={210}
              labelField="label"
              valueField="value"
              imageField="image"
              placeholder="Quốc gia"
              searchPlaceholder="Tìm kiếm..."
              onChange={(item) => {
                fetchAreasByCountry(item.value);
                setSelectedCityId(null);
                setSelectedCity(null);
                setSelectedArea(null);
                setSelectedCountry(item);
              }}
            />
            {/* Chọn khu vực */}
            <Dropdown
              style={[styles.dropdown, { flex: 2 }]}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              inputSearchStyle={[styles.inputSearchStyle, { borderRadius: 10 }]}
              iconStyle={styles.iconStyle}
              data={dataAreas ? dataAreas : []}
              search
              maxHeight={230}
              labelField="label"
              valueField="value"
              placeholder="Khu vực"
              searchPlaceholder="Tìm kiếm..."
              value={selectedArea ? selectedArea.value : ""}
              onChange={(item) => {
                fetchCitiesByArea(selectedCountry.value, item.value);
                setSelectedCityId(null);
                setSelectedCity(null);
                setSelectedArea(item);
              }}
              onFocus={() => console.log("focus")}
            />
          </View>
          <View
            style={{ flexDirection: "row", justifyContent: "space-around" }}
          >
            {/* Chọn tình thành */}
            <Dropdown
              style={[styles.dropdown, { maxWidth: 170, flex: 1 }]}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              inputSearchStyle={[styles.inputSearchStyle, { borderRadius: 10 }]}
              iconStyle={styles.iconStyle}
              data={dataCities ? dataCities : []}
              search
              maxHeight={280}
              labelField="label"
              valueField="value"
              placeholder="Tỉnh thành"
              searchPlaceholder="Tìm kiếm..."
              value={selectedCity ? selectedCity.value : ""}
              onChange={(item) => {
                setSelectedCityId(item.value);
                setSelectedCity(item);
              }}
            />
            <TouchableOpacity
              style={[styles.btnHeader, { backgroundColor: '#c6f2c6', borderColor: '#d1d1d1' }]}
              onPress={() => handleCheckIn(selectedCity, selectedCountry.value)}
            >
              <MaterialCommunityIcons
                name="book-check-outline"
                size={24}
                color="black"
              />
              <Text style={styles.actionBtnText}>Đánh dấu</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btnHeader, { backgroundColor: '#f87171', borderWidth: 1, borderColor: '#d1d1d1' }]}
              onPress={() =>
                handleCheckOut(selectedCity, selectedCountry.value)
              }
            >
              <MaterialCommunityIcons
                name="book-remove-outline"
                size={24}
                color="black"
              />
              <Text style={styles.actionBtnText}>Hủy</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View
          style={{
            flexDirection: "row",
            paddingHorizontal: 10,
            marginTop: 10,
            justifyContent: "space-around",
            alignItems: "center",
          }}
        >
          <TouchableOpacity
            style={[styles.btnHeader, { backgroundColor: '#f7dab9' }]}
            onPress={() => handleTapByButton(selectedCity, "index")}
          >
            <FontAwesome6 name="newspaper" size={24} color="black" />
            <Text style={styles.actionBtnText}>Xem bài viết</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btnHeader, { backgroundColor: '#f7dab9' }]}
            onPress={() => handleTapByButton(selectedCity, "tour")}
          >
            <Entypo name="compass" size={24} color="black" />
            <Text style={styles.actionBtnText}>Xem tour</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btnHeader, { backgroundColor: '#f7dab9' }]}
            onPress={() => handleTapOnGallery()}
          >
            <FontAwesome6 name="images" size={24} color="black" />
            <Text style={styles.actionBtnText}>Khám phá</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.information}>
          <MaterialCommunityIcons name="map-marker-radius" size={24} color="#ce181e" />
          {/* <Entypo name="location" size={24} color="#ce181e" /> */}
          {/* <Text>{selectedCity ? selectedCity.label : 'Chưa xác định'}</Text>
          <Text>{selectedArea ? selectedArea.label : "Chưa xác định"}</Text>
          <Text>{selectedCountry ? selectedCountry.label : "Chưa xác định"}</Text> */}
          <Text style={{ fontWeight: "500", fontSize: 16, paddingLeft: 8 }}>
            {selectedCountry && selectedCity
              ? `${selectedCity.label}, ${selectedCountry.label}`
              : `Chưa chọn`}
          </Text>
        </View>
      </View>
      {selectedCountry ? (
        selectedCountry.value === "avietnam" ? (
          <ReactNativeZoomableView
            maxZoom={3}
            minZoom={1}
            zoomStep={0.5}
            initialZoom={1}
            bindToBorders={true}
            onZoomAfter={this.logOutZoomState}
            style={{
              padding: 10,
              flex: 1,
            }}
          >
            <VietNamMap></VietNamMap>
          </ReactNativeZoomableView>
        ) : (
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 28, color: '#c9c9c9', textAlign: 'center', marginTop: 40 }}>Tạm thời chưa có dữ liệu</Text>
            <LottieView
              autoPlay
              style={{
                position: "absolute",
                left: 0,
                width: width,
                height: 520,
              }}
              source={require('@/assets/images/worldMap.json')}
            />
          </View>
        )
      ) : (
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 28, color: '#c9c9c9', textAlign: 'center', marginTop: 40 }}>Đang tải dữ liệu bản đồ</Text>
          <LottieView
            autoPlay
            style={{
              position: "absolute",
              left: 0,
              width: width,
              height: 520,
            }}
            source={require('@/assets/images/worldMap.json')}
          />
        </View>
      )}
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  actionBtnText: {
    marginLeft: 6,
    // backgroundColor: 'green',
    alignSelf: "center",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    paddingTop: 10,
    paddingBottom: 60,
    width: 40,
    // width: width,
    alignItems: "center",
    zIndex: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  btnHeader: {
    justifyContent: "center",
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 6,
    flexDirection: "row",
    backgroundColor: "#ea4f4f",
    elevation: 6
  },
  imageStyle: {
    width: 25,
    height: 18,
    borderRadius: 2,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
    marginLeft: 4,
    paddingRight: 0,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  dropdown: {
    // flex: 1,
    minHeight: 36,
    backgroundColor: "#eeeeee",
    borderRadius: 10,
    paddingHorizontal: 6,
    borderWidth: 1,
    elevation: 10,
  },
  information: {
    flexDirection: "row",
    marginTop: 20,
    justifyContent: 'center'
  },
  sortContainer: {
    paddingHorizontal: 10,
    // backgroundColor:'red',
    width: "100%",
  },
  hearder: {
    // flex:1
    backgroundColor: 'white',
    paddingTop: 10,
  },
  container: {
    flex: 1,
    justifyContent: "center",
  },
});

export default CheckInMap;
