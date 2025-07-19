import {
  View,
  Text,
  Platform,
  Alert,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button, Checkbox, Divider } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import { SelectList } from "react-native-dropdown-select-list";
import { ref } from "@firebase/database";
import {
  database,
  getDownloadURL,
  onValue,
  storage,
  storageRef,
  uploadBytes,
} from "@/firebase/firebaseConfig";
import { get, update } from "@firebase/database";
import { ScrollView, TextInput } from "react-native-gesture-handler";
import IconA from "react-native-vector-icons/AntDesign";
import Toast from "react-native-toast-message-custom";
import { set } from "lodash";
import { useHomeProvider } from "@/contexts/HomeProvider";
import { Province } from "@/model/ProvinceModal";

const Location = () => {
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [cityArea, setCityArea] = useState("");
  const [cityInformation, setCityInformation] = useState("");
  const [longitude, setLongitude] = useState("");
  const [latitude, setLatitude] = useState("");

  const [cityData, setCityData] = useState<Province>();
  // const [dataCountries, setDataCountries] = useState([]);
  const [dataCities, setDataCities] = useState<any>([]);
  const [editText, setEditText] = useState(false);
  const informationRef: any = useRef(null);
  const longitudeRef: any = useRef(null);
  const latitudeRef: any = useRef(null);
  const [defaultImages, setDefaultImages] = useState<string[]>([]);
  const [disabled, setDisabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const { dataCountries }: any = useHomeProvider();

  // Lấy các tỉnh/ thành của quốc gia - XONG
  const fetchCitiesByCountry = useCallback(async (countryId: any) => {
    try {
      const refProvinces = ref(database, `cities/${countryId}`)
      const snapshot = await get(refProvinces);
      if (snapshot.exists()) {
        const dataProvinces = snapshot.val() as Record<string, any>;
        const dataRegions = snapshot.val() as Record<string, Record<string, Province>>;
        const dataCitiesArray: Province[] = Object.values(dataRegions)
          .flatMap(item => Object.values(item))
          .sort((a: Province, b: Province) => {
            return a.value.localeCompare(b.value);
          });
        // Thêm phần tử default
        dataCitiesArray.unshift(new Province());

        setDataCities(dataCitiesArray);
      } else {
        console.log("FetchCityByCountry: No data available1");
      }
    } catch (error) {
      console.error("FetchCityByCountry: Error fetching data: ", error);
    }
  }, [])

  // Fetch data of Province
  const fetchCityData = useCallback(async (cityId: string) => {
    const foundProvince = dataCities.find((p: Province) => p.key === cityId);
    let area = ''
    if (foundProvince) {
      area = foundProvince.areaId
      console.log("Tỉnh tìm thấy:", foundProvince.value); // An Giang
    } else {
      console.log("Không tìm thấy tỉnh");
    }
    try {
      const refDataCity = ref(database, `cities/${selectedCountry}/${area}/${cityId}`)
      const snapshot = await get(refDataCity);
      if (snapshot.exists()) {
        const dataCityJson = snapshot.val();
        console.log(dataCityJson, `at ${cityId}`);
        setCityInformation(dataCityJson.information);
        setDefaultImages(dataCityJson.defaultImages)
        setCityArea(dataCityJson.areaId)
        setLongitude(dataCityJson.longitude + "")
        setLatitude(dataCityJson.latitude + "")
      } else {
        console.log("FetchCityByCountry: No data available1");
      }
    } catch (error) {
      console.error("FetchCityByCountry: Error fetching data: ", error);
    }
  }, [selectedCountry, dataCities])
  //Handle when selected countries
  const handleSelectedCountry = useCallback((val: any) => {
    if (!val) return
    if (val === 'avietnam') {
      fetchCitiesByCountry(val)
    } else {
      Alert.alert('Chưa hỗ trợ quốc gia này');
    }
    setSelectedCountry(val);
    setSelectedCity('');

    // Set default
    setCityInformation("");
    setLongitude("")
    setLatitude("")
    setCityArea("");
    setDataCities([])
    setDefaultImages([]);
  }, [fetchCitiesByCountry]);

  //Handle when selected countries
  const handleSelectedCity = useCallback((val: any) => {
    if (!val) return
    if (val !== '-1') {
      setDisabled(false);
      fetchCityData(val)
    } else {
      Alert.alert('Chưa hỗ trợ tỉnh/thành phố này');
      console.log(val);
    }
    setSelectedCity(val);
  }, [fetchCityData]);
  //   console.log("defaultImages", defaultImages);
  const uploadImagesToStorage = useCallback(async () => {
    const uploadedImageUrls = [];

    for (const imageUri of defaultImages) {
      const imageName = imageUri.substring(imageUri.lastIndexOf("/") + 1);
      const imageRef = storageRef(storage, `cityImages/${imageName}`);

      const response = await fetch(imageUri);
      const blob = await response.blob();
      await uploadBytes(imageRef, blob);

      const downloadURL = await getDownloadURL(imageRef);
      uploadedImageUrls.push(downloadURL);
    }

    return uploadedImageUrls;
  }, [defaultImages]);

  //Handle Save
  const handleSave = useCallback(async () => {
    if (disabled) {
      Toast.show({
        type: "error",
        position: "top",
        text1: "Thông báo",
        text2: "Vui lòng chọn quốc gia và thành phố",
        visibilityTime: 2000,
        autoHide: true,
        topOffset: 30,
        bottomOffset: 40,
      });
    } else {
      Alert.alert(
        'Xác nhận',
        'Bạn có chắc muốn làm mới dữ liệu hiện tại. Quá trình sẽ tốn nhiều thời gian.',
        [
          {
            text: 'Hủy',
            style: 'cancel',
          },
          {
            text: 'Đồng ý',
            onPress: async () => {
              setLoading(true);
              const defaultImages = await uploadImagesToStorage();

              const cityUpdateRef = ref(database, `cities/${selectedCountry}/${cityArea}/${selectedCity}`
              );
              const dataUpdated = {
                information: cityInformation,
                defaultImages: defaultImages,
                longitude: longitude,
                latitude: latitude
              }
              await update(cityUpdateRef, dataUpdated)
                .then(() => {
                  setLoading(false);
                  console.log("Data updated successfully!");
                })
                .catch((error) => {
                  setLoading(false);
                  console.error("Error updating data:", error);
                });


            },
          },
        ]
      )
    }
    // Unfocus
    setEditText(false);
    // Unfocus
    // if (informationRef.current) {
    informationRef.current.blur();
    longitudeRef.current.blur();
    latitudeRef.current.blur();
    // }
  }, [disabled, uploadImagesToStorage, selectedCountry, cityArea, selectedCity, informationRef, longitude, latitude]);
  //Xóa ảnh
  const handleRemoveImage = (index: number) => {
    setEditText(true);
    const updatedImages = [...defaultImages];
    updatedImages.splice(index, 1);
    setDefaultImages(updatedImages);
  };
  //Upload anh
  const handleChooseImages = async () => {
    if (disabled == true) {
      Toast.show({
        type: "error",
        position: "top",
        text1: "Thông báo",
        text2: "Vui lòng chọn quốc gia và thành phố",
        visibilityTime: 2000,
        autoHide: true,
        topOffset: 30,
        bottomOffset: 40,
      });
    } else {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 1,
      });

      if (!result.canceled) {
        const selectedUris = result.assets.map((item) => item.uri);
        setDefaultImages([...selectedUris, ...defaultImages]);
      }
    }
  };

  return (
    <View style={{ padding: 15, backgroundColor: "white", flex: 1 }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-evenly",
          marginBottom: 15,
        }}>
        <SelectList
          dropdownStyles={{
            zIndex: 10,
            position: "absolute",
            width: 170,
            backgroundColor: "white",
            top: 40,
          }}
          boxStyles={{ width: 170 }}
          setSelected={(val: any) => handleSelectedCountry(val)}
          data={dataCountries}
          save="key"
          placeholder="Quốc gia"
        />
        <SelectList
          dropdownStyles={{
            zIndex: 10,
            position: "absolute",
            width: 170,
            backgroundColor: "white",
            top: 40,
          }}
          boxStyles={{ width: 170 }}
          setSelected={(val: any) => handleSelectedCity(val)}
          data={dataCities}
          save="key"
          defaultOption={{ key: '', value: '' }}
          placeholder="Thành phố"

        />
      </View>
      <Text style={{ fontSize: 14, fontWeight: "bold", marginBottom: 10 }}>
        Thêm ảnh
      </Text>
      {defaultImages ? (
        <View>
          <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
            <ScrollView
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              style={{ maxHeight: 100 }}
            >
              {defaultImages.map((imageUri, index) => (
                <View key={index}>
                  <Image
                    source={{ uri: imageUri }}
                    style={[
                      styles.festivalImage,
                      {
                        width: 100,
                        height: 100,
                        marginRight: 5,
                        resizeMode: "cover",
                      },
                    ]}
                  />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => handleRemoveImage(index)}
                  >
                    <IconA name="closecircle" size={20} color="white" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
          <TouchableOpacity
            style={{ marginTop: 10 }}
            onPress={() => {
              setEditText(true);
              handleChooseImages();
            }}
          >
            <Image
              source={require("../../../assets/images/addImage.png")}
              style={[styles.festivalImage]}
            />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          onPress={() => {
            setEditText(true);
            handleChooseImages();
          }}
        >
          <Image
            source={require("../../../assets/images/addImage.png")}
            style={[styles.festivalImage]}
          />
        </TouchableOpacity>
      )}

      <View style={[styles.row, { marginTop: 20, gap: 5 }]}>
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
          <Text> Kinh độ: </Text>
          {/* <Text>{longitude}</Text> */}
          <TextInput
            ref={longitudeRef}
            value={longitude}
            numberOfLines={1}
            multiline={false}
            style={styles.inputGeo}
            onChangeText={setLongitude}
            onFocus={() => setEditText(true)}
          />
        </View>

        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
          <Text> Vĩ độ: </Text>
          <TextInput
            ref={latitudeRef}
            value={latitude}
            numberOfLines={1}
            multiline={false}
            style={styles.inputGeo}
            onChangeText={setLatitude}
            onFocus={() => setEditText(true)}
          />
        </View>
      </View>
      <TextInput
        ref={informationRef}
        style={styles.textArea}
        multiline={true}
        numberOfLines={4} // sets the height based on line count
        placeholder="Nhập thông tin địa điểm ..."
        value={cityInformation}
        onChangeText={setCityInformation}
        onFocus={() => setEditText(true)}
      />

      {editText && (
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.buttonText}>Lưu</Text>
        </TouchableOpacity>
      )}
      {/* Loading */}
      {loading && (
        <View
          style={{
            position: "absolute",
            flex: 1,
            width: "108%",
            height: "108%",
            top: 0,
            left: 0,
            zIndex: 100,
            backgroundColor: "rgba(0, 0, 0, 0.1)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ActivityIndicator size="large" color="red" />
        </View>
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  inputGeo: {
    flex: 1,
    padding: 10,
    height: 40,
    // width: 100,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    textAlign: "right",
  },
  container: {
    padding: 10,
  },
  textArea: {
    height: 150,
    padding: 10,
    top: 20,
    textAlignVertical: "top",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
  },
  saveBtn: {
    top: 90,
    backgroundColor: "#2986cc",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 10,
  },
  buttonText: {
    color: "#ffffff",
    textAlign: "center",
    fontSize: 16,
  },
  imageBtn: {
    top: 20,
    backgroundColor: "#2986cc",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 50,
    marginRight: 10,
    width: 100,
    height: 40,
    alignSelf: "center",
  },
  festivalImage: {
    width: 100,
    height: 100,
  },
  removeImageButton: {
    position: "absolute",
    top: 5,
    right: 10,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 50,
    padding: 1,
  },
});

export default Location;
