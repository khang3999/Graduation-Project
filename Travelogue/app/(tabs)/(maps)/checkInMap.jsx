import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ReactNativeZoomableView } from '@openspacelabs/react-native-zoomable-view';
import VietNamMap from "@/components/maps/VietNamMap";
import { useHomeProvider } from "@/contexts/HomeProvider";
import { createRef, useEffect, useState } from "react";
import { SelectList } from "react-native-dropdown-select-list";
import { ref } from "firebase/database";
import { database, get, onValue } from "@/firebase/firebaseConfig";
import { Dropdown, SelectCountry } from 'react-native-element-dropdown';
import { Divider } from "react-native-paper";
import { Entypo, FontAwesome, FontAwesome6, MaterialCommunityIcons } from "@expo/vector-icons";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { Gesture, GestureDetector, GestureHandlerRootView, PanGestureHandler } from "react-native-gesture-handler";
import { useMapCheckinProvider } from "@/contexts/MapCheckinProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get('window')

const CheckInMap = () => {
  const [dataCountries, setDataCountries] = useState([])
  const [dataAreas, setDataAreas] = useState([])
  const [dataCities, setDataCities] = useState([])
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedArea, setSelectedArea] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const translateX = useSharedValue(width);

  const [userId, setUserId] = useState(null)
  const { dataAccount, setDataAccount } = useHomeProvider()
  const {
    checkedCityColor,
    selectedCityId, setSelectedCityId,
    dataCheckedCities, setDataCheckedCities
  } = useMapCheckinProvider()

  // Login state
  useEffect(() => {
    const fetchUserId = async () => {
      const userId = await AsyncStorage.getItem("userToken");
      setUserId(userId);
    };
    fetchUserId()
  }, []);

  // Fetch checkin list by country
  const fetchCheckinList = async (accountId, countryId) => {
    const refCheckin = ref(database, `accounts/${accountId}/checkin/${countryId}`);
    try {
      const snapshot = await get(refCheckin);
      if (snapshot.exists()) {
        const data = snapshot.val()
        const allCitiesCheckedByCountry = Object.values(data)
        console.log('check', allCitiesCheckedByCountry);
        setDataCheckedCities(allCitiesCheckedByCountry)
      }
      else {
        console.log('check');
      }
    } catch (error) {
      console.error('Cannot find <checkin> on firebase', error);
    }
  }
  // Lấy các tỉnh đã checkin lần đầu sau khi đã có dữ liệu của account
  useEffect(() => {
    if (dataAccount && selectedCountry) {
      fetchCheckinList(dataAccount.id, selectedCountry.value)
    }
  }, [dataAccount, selectedCountry]);

  // Checkin tỉnh đã chọn 

  // Lấy các quốc gia 
  useEffect(() => {
    const refCountries = ref(database, `countries`)
    const unsubscribe = onValue(refCountries, (snapshot) => {
      if (snapshot.exists()) {
        const jsonDataCountries = snapshot.val();
        const countriesArray = Object.keys(jsonDataCountries).map(key => ({
          label: jsonDataCountries[key].label,
          value: key,
          image: {
            uri: jsonDataCountries[key].image
          }
        }));
        // console.log(countriesArray);

        setSelectedCountry(countriesArray[0])
        setDataCountries(countriesArray)
      } else {
        console.log("No data available1");
      }
    }, (error) => {
      console.error("Error fetching data:", error);
    });

    return () => {
      unsubscribe(); // Sử dụng unsubscribe để hủy listener
    };
  }, [])

  // Lấy vùng theo quốc gia
  const fetchAreasByCountry = async (countryId) => {
    try {
      const refAreas = ref(database, `areas/${countryId}`)
      const snapshot = await get(refAreas);
      if (snapshot.exists()) {
        const dataAreasJson = snapshot.val()
        const dataAreasArray = Object.entries(dataAreasJson).map(([key, value]) => ({
          label: value.label,
          value: key
        }));
        // console.log(dataAreasArray);
        setDataAreas(dataAreasArray)
      } else {
        console.log("No data post available");
      }
    } catch (error) {
      console.error("Error fetching area data search: ", error);

    }

  }

  // Lấy vùng của việt nam (chạy lần đầu) vì default là việt nam
  useEffect(() => {
    if (selectedCountry) {
      fetchAreasByCountry(selectedCountry.value)
    }
  }, [selectedCountry])

  // Fetch data cities theo vùng miền
  const fetchCitiesByArea = async (countryId, areaId) => {
    try {
      const refCities = ref(database, `cities/${countryId}/${areaId}`)
      const snapshot = await get(refCities);
      if (snapshot.exists()) {
        const dataCitiesJson = snapshot.val()
        const dataCitiesArray = Object.keys(dataCitiesJson).map(key => ({
          label: dataCitiesJson[key].name,
          value: key,
        }));
        setDataCities(dataCitiesArray)
      } else {
        console.log("No data cities available");
      }
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  }

  // Hàm Check in
  const handleCheckIn = (selectedCityId) => {
    // Show dialog
    Alert.alert(
      "Remove point",
      "Are you sure you want to remove this point?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "OK", onPress: () => {
            remove(refP).then(() => {
              console.log('Data remove successfully');
            })
              .catch((error) => {
                console.error('Error removing data: ', error);
              }); // Xóa từ khỏi Realtime Database
          }
        }
      ]
    );
  }


  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.hearder}>
        <View style={styles.sortContainer}>
          <View style={{ flexDirection: 'row', marginBottom: 6 }}>
            {/* Chọn quốc gia */}
            <SelectCountry
              style={[styles.dropdown, { flex: 1.1, marginRight: 6 }]}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              imageStyle={styles.imageStyle}
              inputSearchStyle={[styles.inputSearchStyle, { borderRadius: 10 }]}
              iconStyle={styles.iconStyle}
              value={selectedCountry ? selectedCountry.value : ''}
              data={dataCountries ? dataCountries : []}
              search
              maxHeight={210}
              labelField="label"
              valueField="value"
              imageField="image"
              placeholder='Quốc gia'
              searchPlaceholder="Tìm kiếm..."
              onChange={item => {
                fetchAreasByCountry(item.value)
                setSelectedCityId(null)
                setSelectedCity(null)
                setSelectedArea(null)
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
              value={selectedArea ? selectedArea.value : ''}
              onChange={item => {
                fetchCitiesByArea(selectedCountry.value, item.value)
                setSelectedCityId(null)
                setSelectedCity(null)
                setSelectedArea(item)
              }}
              onFocus={() => console.log('focus')}
            />
          </View>
          <View style={{ flexDirection: 'row' }}>
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
              value={selectedCity ? selectedCity.value : ''}
              onChange={item => {
                setSelectedCityId(item.value)
                setSelectedCity(item)
              }}
            />
          </View>
        </View>
        <View style={{ flexDirection: 'row', paddingHorizontal: 10, marginTop: 10, justifyContent: 'space-around', alignItems: 'center' }}>
          <TouchableOpacity style={styles.btnHeader}>
            <FontAwesome6 name="newspaper" size={24} color="black" />
            <Text style={styles.actionBtnText}>Xem bài biết</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnHeader}>
            <Entypo name="compass" size={24} color="black" />
            <Text style={styles.actionBtnText}>Xem Tour</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnHeader} onPress={() => handleCheckIn(selectedCityId)}>
            <MaterialCommunityIcons name="book-check-outline" size={24} color="black" />
            <Text style={styles.actionBtnText}>Check in</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.information}>
          <Entypo name="location" size={24} color="black" />
          {/* <Text>{selectedCity ? selectedCity.label : 'Chưa xác định'}</Text>
          <Text>{selectedArea ? selectedArea.label : "Chưa xác định"}</Text>
          <Text>{selectedCountry ? selectedCountry.label : "Chưa xác định"}</Text> */}
          <Text>{selectedCountry && selectedCity ? `${selectedCity.label}, ${selectedCountry.label}` : `Chưa chọn`}</Text>
        </View>

      </View>
      {selectedCountry ?
        (selectedCountry.value === 'avietnam' ?
          <ReactNativeZoomableView
            maxZoom={3}
            minZoom={1}
            zoomStep={0.5}
            initialZoom={1}
            bindToBorders={true}
            onZoomAfter={this.logOutZoomState}
            style={{
              padding: 10,
              flex: 1
            }}
          >
            <VietNamMap></VietNamMap>
          </ReactNativeZoomableView>
          : <Text style={{ fontSize: 20, flex: 1 }}>Tạm thời chưa có dữ liệu</Text>)
        : <Text style={{ fontSize: 20, flex: 1 }}>Loading</Text>}



    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  actionBtnText: {
    marginLeft: 6,
    // backgroundColor: 'green',
    alignSelf: 'center'
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    paddingTop: 10,
    paddingBottom: 60,
    width: 40,
    // width: width,
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
  btnHeader: {
    justifyContent: 'center',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 6,
    flexDirection: 'row',
    backgroundColor: '#ea4f4f'
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
    paddingRight: 0
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  dropdown: {
    // flex: 1,
    minHeight: 36,
    backgroundColor: '#eeeeee',
    borderRadius: 10,
    paddingHorizontal: 6,
    borderWidth: 1,
    elevation: 10
  },
  information: {
    flexDirection: 'row',
    margin: 10
  },
  sortContainer: {
    paddingHorizontal: 10,
    // backgroundColor:'red',
    width: '100%'
  },
  hearder: {
    // flex:1
    // backgroundColor:'green',
    paddingTop: 10
  },
  container: {
    flex: 1,
    justifyContent: 'center',
  },
});

export default CheckInMap