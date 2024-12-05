import React, { useEffect, useState } from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  Platform,
  Alert,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import IconA from "react-native-vector-icons/AntDesign";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import { Button, RadioButton } from "react-native-paper";
import { RowComponent } from "@/components";
import { useRoute } from "@react-navigation/native";
import Toast from "react-native-toast-message-custom";
import {
  database,
  getDownloadURL,
  onValue,
  ref,
  set,
  storage,
  storageRef,
  uploadBytes,
} from "@/firebase/firebaseConfig";
import { push } from "firebase/database";
import { router } from "expo-router";

const NewPoint = () => {
  const festivalTypeOptions = [
    { id: "festival", label: "Lễ hội", type: "festival" },
    { id: "landmark", label: "Danh lam", type: "landmark" },
  ];

  const [name, setName] = useState("");
  const [longitude, setLongitude] = useState("");
  const [latitude, setLatitude] = useState("");
  const [content, setContent] = useState("");
  const [timeStartDate, setTimeStartDate] = useState<any>(null);
  const [timeEndDate, setTimeEndDate] = useState<any>(null);
  const [timeStartTime, setTimeStartTime] = useState<any>(null);
  const [timeEndTime, setTimeEndTime] = useState<any>(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [defaultImages, setDefaultImages] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string>("festival");
  const [loading, setLoading] = useState(false);
  const route = useRoute();
  const { idCity, idCountry }: any = route.params;
  const local = 'vi-VN'
  const [dataCountries, setDataCountries]:any = useState([])



  //Countries
  useEffect(() => {
    const refCountries = ref(database, `countries`)
    const unsubscribe = onValue(refCountries, (snapshot) => {
      if (snapshot.exists()) {
        const jsonDataCountries = snapshot.val();
        const countriesArray: any = Object.keys(jsonDataCountries).map(key => ({
          key,
          value: jsonDataCountries[key].label,
        }));
        
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

  const handleRemoveImage = (index: number) => {
    const updatedImages = [...defaultImages];
    updatedImages.splice(index, 1);
    setDefaultImages(updatedImages);
  };

  const handleChooseImages = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled) {
      const selectedUris = result.assets.map((item) => item.uri);
      setDefaultImages([...selectedUris, ...defaultImages]);
    }
  };
  //Chọn ngày bắt đầu
  const onChangeStartDate = (event: any, selectedDate: any) => {
    setShowStartPicker(false);
    if (selectedDate) {
      if (selectedOption === "festival") {
        if (timeEndDate && selectedDate > timeEndDate) {
          Alert.alert("Lỗi", "Ngày bắt đầu không thể sau ngày kết thúc.");
        } else {
          setTimeStartDate(selectedDate);
        }
      } else {
        if (timeEndTime && selectedDate > timeEndTime) {
          Alert.alert("Lỗi", "Giờ bắt đầu không thể sau giờ kết thúc.");
        } else {
          setTimeStartTime(selectedDate);
        }
      }
    }
  };
  //Chọn ngày kết thúc
  const onChangeEndDate = (event: any, selectedDate: any) => {
    setShowEndPicker(false);
    if (selectedDate) {
      if (selectedOption === "festival") {
        if (timeStartDate && selectedDate < timeStartDate) {
          Alert.alert("Lỗi", "Ngày bắt đầu không thể sau ngày kết thúc.");
        } else {
          setTimeEndDate(selectedDate);
        }
      } else {
        if (timeStartTime && selectedDate < timeStartTime) {
          Alert.alert("Lỗi", "Giờ bắt đầu không thể sau giờ kết thúc.");
        } else {
          setTimeEndTime(selectedDate);
        }
      }
    }
  };
  useEffect(() => {
    if (
      name &&
      longitude &&
      latitude &&
      content &&
      defaultImages.length > 0 &&
      ((selectedOption === "festival" && timeStartDate && timeEndDate) ||
        (selectedOption === "landmark" && timeStartTime && timeEndTime))
    ) {
      setIsReady(true);
    } else {
      setIsReady(false);
    }
  }, [
    name,
    longitude,
    latitude,
    content,
    defaultImages,
    timeStartDate,
    timeEndDate,
    timeStartTime,
    timeEndTime,
  ]);

  // Lưu những ảnh đã chọn lên storage
  const uploadImagesToStorage = async (pointId: any) => {
    const uploadedImageUrls = [];

    for (const imageUri of defaultImages) {
      const imageName = imageUri.substring(imageUri.lastIndexOf("/") + 1);
      const imageRef = storageRef(storage, `mapPoints/${pointId}/${imageName}`);

      const response = await fetch(imageUri);
      const blob = await response.blob();
      await uploadBytes(imageRef, blob);

      const downloadURL = await getDownloadURL(imageRef);
      uploadedImageUrls.push(downloadURL);
    }

    return uploadedImageUrls;
  };

  const handleSave = async () => {
    if (isReady) {
      setLoading(true);
      if (isNaN(Number(longitude)) || isNaN(Number(latitude))) {
        Toast.show({
          type: "error",
          text1: "Lỗi",
          text2: "Kinh độ và vĩ độ phải là số",
        });
        setLoading(false);
        return;
      }

      const pointRef = ref(
        database,
        `points/${idCountry}/${selectedOption}/${idCity}`
      );
      const newPointRef = push(pointRef);
      const pointId = newPointRef.key;

      const imageUrls = await uploadImagesToStorage(pointId);
      const data = {
        title: name,
        longitude: Number(longitude),
        latitude: Number(latitude),
        content,
        start:
          selectedOption === "festival"
            ? timeStartDate.toLocaleDateString(local).slice(0, 10)
            : timeStartTime.toLocaleTimeString().slice(0, 4),
        end:
          selectedOption === "festival"
            ? timeEndDate.toLocaleDateString(local).slice(0, 10)
            : timeEndTime.toLocaleTimeString().slice(0, 4),
        images: imageUrls,
      };

      set(newPointRef, data)
        .then(() => {
          setLoading(false);
          //phong
          setName("");
          setLongitude("");
          setLatitude("");
          setContent("");
          setTimeStartDate(null);
          setTimeEndDate(null);
          setTimeStartTime(null);
          setTimeEndTime(null);
          setDefaultImages([]);
          setSelectedOption("festival");
          setIsReady(false);

          router.push("/(admin)/(information)/festival");
          Toast.show({
            type: "success",
            text1: "Thành công",
            text2: "Thêm điểm mới thành công",
          });
        })
        .catch((error) => {
          setLoading(false);
          console.error("Error adding data: ", error);
        });
    }
  };
  return (
    <View style={styles.container}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>

        <Text>#{dataCountries.find((country:any)=>country.key === idCountry)?.value}</Text>
        <Text>#{idCity}</Text>
      </View>
      <ScrollView>
        <Text style={styles.label}>Tên</Text>
        <TextInput
          placeholder="Nhập tên"
          value={name}
          onChangeText={setName}
          style={styles.input} />

        <Text style={styles.label}>Vĩ độ</Text>
        <TextInput
          placeholder="Nhập vĩ độ"
          value={latitude}
          onChangeText={setLatitude}
          keyboardType="numeric"
          style={styles.input}
        />

        <Text style={styles.label}>Kinh độ</Text>
        <TextInput
          placeholder="Nhập kinh độ"
          value={longitude}
          onChangeText={setLongitude}
          keyboardType="numeric"
          style={styles.input}
        />

        <Text style={styles.label}>Nội dung</Text>
        <TextInput
          placeholder="Nhập nội dung"
          value={content}
          numberOfLines={10}
          multiline={true}
          onChangeText={setContent}
          style={styles.input}
        />

        <Text style={styles.label}>Chọn loại</Text>
        <RadioButton.Group
          onValueChange={(newValue) => setSelectedOption(newValue)}
          value={selectedOption}
        >
          {festivalTypeOptions.map((option) => (
            <View key={option.id} style={styles.radioItem}>
              <RadioButton value={option.type} />
              <Text style={styles.radioLabel}>{option.label}</Text>
            </View>
          ))}
        </RadioButton.Group>

        <Text style={styles.label}>Thêm ảnh</Text>
        <RowComponent>
          <TouchableOpacity onPress={handleChooseImages}>
            <Image
              source={require("@/assets/images/addImage.png")}
              style={[styles.festivalImage, { margin: 10 }]}
            />
          </TouchableOpacity>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {defaultImages.map((imageUri, index) => (
              <View key={index}>
                <Image
                  source={{ uri: imageUri }}
                  style={[styles.festivalImage, { marginRight: 10 }]}
                />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => handleRemoveImage(index)}
                >
                  <IconA name="closecircle" size={16} color="white" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </RowComponent>

        <Text style={styles.label}>Chọn thời gian bắt đầu</Text>
        <TouchableOpacity onPress={() => setShowStartPicker(true)}>
          <Text style={styles.timeText}>
            {selectedOption === "festival"
              ? timeStartDate
                ? timeStartDate.toLocaleDateString(local).slice(0, 10)
                : "Chọn ngày"
              : timeStartTime
                ? timeStartTime.toLocaleTimeString().slice(0, 4)
                : "Chọn giờ"}{" "}
          </Text>
        </TouchableOpacity>

        <Text style={styles.label}>Chọn thời gian kết thúc</Text>
        <TouchableOpacity onPress={() => setShowEndPicker(true)}>
          <Text style={styles.timeText}>
            {selectedOption === "festival"
              ? timeEndDate
                ? timeEndDate.toLocaleDateString(local).slice(0, 10)
                : "Chọn ngày"
              : timeEndTime
                ? timeEndTime.toLocaleTimeString().slice(0, 4)
                : "Chọn giờ"}{" "}
          </Text>
        </TouchableOpacity>

        {showStartPicker && (
          <DateTimePicker
            mode={selectedOption === "festival" ? "date" : "time"}
            value={
              selectedOption === "festival"
                ? timeStartDate || new Date()
                : timeStartTime || new Date()
            }
            onChange={onChangeStartDate}

          />
        )}

        {showEndPicker && (
          <DateTimePicker
            mode={selectedOption === "festival" ? "date" : "time"}
            value={
              selectedOption === "festival"
                ? timeEndDate || new Date()
                : timeEndTime || new Date()
            }
            onChange={onChangeEndDate}
          />
        )}

        <Button mode="contained" onPress={handleSave} disabled={!isReady}>
          Lưu
        </Button>
      </ScrollView>
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
    flex: 1,
    padding: 16,
  },
  label: {
    fontWeight: "bold",
    marginVertical: 8,
  },
  input: {
    borderWidth: 1,
    padding: 8,
    borderRadius: 4,
  },
  festivalImage: {
    width: 100,
    height: 100,
    borderRadius: 4,
  },
  removeImageButton: {
    position: "absolute",
    top: 5,
    right: 16,
    backgroundColor: "brgba(0,0,0,0.5)",
    borderRadius: 50,
    padding: 3,
  },
  radioItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  radioLabel: {
    fontSize: 16,
  },
  timeText: {
    fontSize: 16,
    color: "black",
    padding: 8,
    borderWidth: 1,
    borderRadius: 4,
    textAlign: "center",
    marginVertical: 8,
  },
});

export default NewPoint;
