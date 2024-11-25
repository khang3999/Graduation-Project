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
import React, { useEffect, useRef, useState } from "react";
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

const Location = () => {
  const [selectedCountry, setSelectedCountry] = useState();
  const [selectedCity, setSelectedCity] = useState();
  const [cityArea, setCityArea] = useState("");
  const [cityInformation, setCityInformation] = useState("");
  const [dataCountries, setDataCountries] = useState([]);
  const [dataCities, setDataCities] = useState<any>([]);
  const [editText, setEditText] = useState(false);
  const inputRef: any = useRef(null);
  const [defaultImages, setdefaultImages] = useState<string[]>([]);
  const [disabled, setDisabled] = useState(true);
  const [loading, setLoading] = useState(false);

  //Countries
  useEffect(() => {
    const refCountries = ref(database, `countries`);
    const unsubscribe = onValue(
      refCountries,
      (snapshot) => {
        if (snapshot.exists()) {
          const jsonDataCountries = snapshot.val();
          const countriesArray: any = Object.keys(jsonDataCountries).map(
            (key) => ({
              key,
              value: jsonDataCountries[key].label,
            })
          );
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
  // Fetch data cities theo quốc gia
  const fetchCityByCountry = (countryId: any) => {
    try {
      const refCity = ref(database, `cities/${countryId}`);
      
      // Real-time listener
      onValue(refCity, (snapshot) => {
        if (snapshot.exists()) {
          const dataCityJson = snapshot.val();
          const dataCitiesArray: any = Object.entries(dataCityJson).flatMap(
            ([region, cities]: any) =>
              Object.entries(cities).map(([cityCode, cityInfo]: any) => ({
                key: cityCode,
                value: cityInfo.name,
                area: cityInfo.area_id,
                information: cityInfo.information,
                defaultImages: cityInfo.defaultImages,
              }))
          );
          setDataCities(dataCitiesArray);
          // Optionally set selected city
          // setSelectedCity(dataCitiesArray[0].key);
        } else {
          console.log("No data city available");
        }
      });
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  }
  //Handle when selected countries
  const handleSelectedCountry = (val: any) => {
    // setDataCities([])
    setCityInformation("");
    setCityArea("");
    setdefaultImages([]);
    fetchCityByCountry(val)
    setSelectedCountry(val);
  };
  //Handle when selected countries
  const handleSelectedCity = (val: any) => {
    console.log(val);
    
    if (val != "" && val != undefined) {
      const a: any = dataCities.find((e: any) => e.key == val);
      setCityArea(a.area);
      setCityInformation(a.information);
      if (a.defaultImages) {
        setdefaultImages(a.defaultImages);
      } else {
        setdefaultImages([]);
      }
      setDisabled(false);
      setSelectedCity(val);
    }

  };
//   console.log("defaultImages", defaultImages);
  const uploadImagesToStorage = async () => {
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
  };

  //Handle Save
  const handleSave = async () => {
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
      setEditText(false);
      if (inputRef.current) {
        inputRef.current.blur();
      }

      const cityUpdateRef = ref(
        database,
        `cities/${selectedCountry}/${cityArea}/${selectedCity}`
      );

      Alert.alert(
        "Change information",
        "Are you sure you want to update information of " + selectedCity + " ?",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "OK",
            onPress: async () => {
                setLoading(true);
              const defaultImages = await uploadImagesToStorage();

              update(cityUpdateRef, {
                information: cityInformation,
                defaultImages: defaultImages,
              })
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
      );
    }
  };
  //Xóa ảnh
  const handleRemoveImage = (index: number) => {
    setEditText(true);
    const updatedImages = [...defaultImages];
    updatedImages.splice(index, 1);
    setdefaultImages(updatedImages);
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
        setdefaultImages([...selectedUris, ...defaultImages]);
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
        }}
      >
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
          placeholder="Countries"
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
          defaultOption={{key:'',value:''}}
          // placeholder={
          //   dataCities.length > 0 ? dataCities[0].value  : "Cities"
          // }
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
      <TextInput
        ref={inputRef}
        style={styles.textArea}
        multiline={true}
        numberOfLines={4} // sets the height based on line count
        placeholder="Write your comment here..."
        value={cityInformation}
        onChangeText={setCityInformation}
        onFocus={() => setEditText(true)}
      />
      {editText && (
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.buttonText}>Save</Text>
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
