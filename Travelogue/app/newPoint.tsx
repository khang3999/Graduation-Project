import React, { useCallback, useEffect, useState } from "react";
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
import { Point } from "@/model/PointModal";
import { update } from "lodash";

const NewPoint = () => {
  const festivalTypeOptions = [
    { id: "festival", label: "Lễ hội", type: "festival" },
    { id: "landmark", label: "Danh lam", type: "landmark" },
  ];

  const [name, setName] = useState("");
  const [longitude, setLongitude] = useState("");
  const [latitude, setLatitude] = useState("");
  const [content, setContent] = useState("");
  const [startDate, setStartDate] = useState<any>(null);
  const [endDate, setEndDate] = useState<any>(null);
  const [startTime, setStartTime] = useState<any>(null);
  const [endTime, setEndTime] = useState<any>(null);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [defaultImages, setDefaultImages] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string>("festival");
  const [loading, setLoading] = useState(false);
  const route = useRoute();
  const { idCity, idCountry, nameCity, nameCountry }: any = route.params;
  const local = 'vi-VN'
  const [dataCountries, setDataCountries]: any = useState([])



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

  const mergeDateAndTime = useCallback((date: Date, time: Date): Date => {
    const merged = new Date(date);
    merged.setHours(time.getHours());
    merged.setMinutes(time.getMinutes());
    merged.setSeconds(0);
    merged.setMilliseconds(0);
    return merged;
  }, []);

  //Chọn ngày bắt đầu
  const onChangeStartDate = useCallback((event: any, selectedDate: any) => {
    setShowStartDatePicker(false); // luôn tắt picker đi khi đổi ngày
    if (selectedDate) {
      // if (selectedOption === "festival") {
      if (endDate && selectedDate > endDate) {
        Alert.alert("Lỗi", "Ngày bắt đầu không thể sau ngày kết thúc.");
      } else {
        setStartDate(selectedDate);
      }
    }
  }, []);
  //Chọn ngày kết thúc
  const onChangeEndDate = useCallback((event: any, selectedDate: any) => {
    setShowEndDatePicker(false);
    if (selectedDate) {
      // if (selectedOption === "festival") {
      if (startDate && selectedDate < startDate) {
        Alert.alert("Lỗi", "Ngày kết thúc không thể trước ngày bắt đầu.");
      } else {
        setEndDate(selectedDate);
      }
    }
  }, []);

  //Chọn giờ bắt đầu
  const onChangeStartTime = useCallback((event: any, selectedTime: any) => {
    setShowStartTimePicker(false); // luôn tắt picker đi khi đổi giờ
    if (selectedTime) {
      // if (selectedOption === "festival") {
      if (endTime && selectedTime > endTime) {
        Alert.alert("Lỗi", "Giờ bắt đầu không thể sau giờ kết thúc.");
      } else {
        setStartTime(selectedTime);
      }
    }
  }, []);

  //Chọn giờ kết thúc
  const onChangeEndTime = useCallback((event: any, selectedTime: any) => {
    setShowEndTimePicker(false); // luôn tắt picker đi khi đổi giờ
    if (selectedTime) {
      // if (selectedOption === "festival") {
      if (startTime && selectedTime > startTime) {
        Alert.alert("Lỗi", "Giờ kết thúc không thể sau giờ bắt đầu.");
      } else {
        setEndTime(selectedTime);
      }
    }
  }, []);


  // useEffect(() => {
  //   if (
  //     name &&
  //     // longitude &&
  //     // latitude &&
  //     content
  //     // &&defaultImages.length > 0
  //     // &&((selectedOption === "festival" && timeStartDate && timeEndDate) ||
  //     //   (selectedOption === "landmark" && timeStartTime && timeEndTime))
  //   ) {
  //     setIsReady(true);
  //   } else {
  //     setIsReady(false);
  //   }
  // }, [
  //   name,
  //   longitude,
  //   latitude,
  //   content,
  //   defaultImages,
  //   startDate,
  //   endDate,
  //   startTime,
  //   endTime,
  // ]);

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
    // if (isReady) {
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

    const pointRef = ref(database, `pointsNew/${idCountry}/${idCity}/`
    );
    const newPointRef = push(pointRef);
    const pointId = newPointRef.key;

    const imageUrls = await uploadImagesToStorage(pointId);
    const data = {
      id: newPointRef.key || "",
      address: "",
      content: content,
      end: mergeDateAndTime(endDate, endTime).getTime() || 0,
      geocode: [{
        longitude: Number(longitude) || 0,
        latitude: Number(latitude) || 0,
      }],
      images: imageUrls || [''],
      start: mergeDateAndTime(startDate, startTime).getTime() || 0,
      title: name,
      updatedAt: new Date().getTime(),
    };

    set(newPointRef, data)
      .then(() => {
        setLoading(false);
        //phong
        setName("");
        setLongitude("");
        setLatitude("");
        setContent("");
        setStartDate(null);
        setEndDate(null);
        setStartTime(null);
        setEndTime(null);
        setDefaultImages([]);
        setSelectedOption("festival");
        setIsReady(false);

        // router.push("/(admin)/(information)/festival");
        router.back();
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
    // }
  };
  return (
    <View style={styles.container}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
        <Text>#{nameCity}</Text>
        <Text>#{nameCountry}</Text>
      </View>
      <ScrollView>
        <Text style={styles.label}>Tiêu đề</Text>
        <TextInput
          placeholder="Nhập tiêu đề"
          value={name}
          onChangeText={setName}
          style={styles.input} />

        <Text style={styles.label}>Kinh độ</Text>
        <TextInput
          placeholder="Nhập kinh độ"
          value={longitude}
          onChangeText={setLongitude}
          keyboardType="numeric"
          style={styles.input}
        />

        <Text style={styles.label}>Vĩ độ</Text>
        <TextInput
          placeholder="Nhập vĩ độ"
          value={latitude}
          onChangeText={setLatitude}
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

        {/* <Text style={styles.label}>Chọn loại</Text>
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
        </RadioButton.Group> */}

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

        <Text style={styles.label}>Ngày</Text>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={styles.textLabel}>Bắt đầu: </Text>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setShowStartDatePicker(true)}>
            <Text style={styles.timeText}>
              {startDate
                ? startDate.toLocaleDateString(local).slice(0, 10)
                : " Chọn ngày bắt đầu"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={styles.textLabel}>Kết thúc: </Text>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setShowEndDatePicker(true)}>
            <Text style={styles.timeText}>
              {endDate
                ? endDate.toLocaleDateString(local).slice(0, 10)
                : "Chọn ngày kết thúc"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* GIỜ */}
        <Text style={styles.label}>Giờ</Text>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={styles.textLabel}>Bắt đầu: </Text>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setShowStartTimePicker(true)}>
            <Text style={styles.timeText}>
              {startTime
                ? startTime.toLocaleTimeString().slice(0, 4)
                : "Chọn giờ bắt đầu"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={styles.textLabel}>Kết thúc</Text>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setShowEndTimePicker(true)}>
            <Text style={styles.timeText}>
              {endTime
                ? endTime.toLocaleTimeString().slice(0, 4)
                : "Chọn giờ kết thúc"}
            </Text>
          </TouchableOpacity>
        </View>

        {showStartDatePicker && (
          <DateTimePicker
            // mode={selectedOption === "festival" ? "date" : "time"}
            mode="date"
            value={startDate || new Date()}
            onChange={onChangeStartDate}
          />
        )}
        {showEndDatePicker && (
          <DateTimePicker
            // mode={selectedOption === "festival" ? "date" : "time"}
            mode="date"
            value={endDate || new Date()}
            onChange={onChangeEndDate}
          />
        )}

        {showStartTimePicker && (
          <DateTimePicker
            // mode={selectedOption === "festival" ? "date" : "time"}
            mode="time"
            value={startTime || new Date()}
            onChange={onChangeStartTime}
          />
        )}
        {showEndTimePicker && (
          <DateTimePicker
            // mode={selectedOption === "festival" ? "date" : "time"}
            mode="time"
            value={endTime || new Date()}
            onChange={onChangeEndTime}
          />
        )}

        <Button mode="contained" onPress={handleSave}
        // disabled={true}
        // disabled={!isReady}
        >
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
  textLabel: {
    padding: 16,
    textAlign: "center",
    marginVertical: 6,
    fontStyle: "italic",
  }
});

export default NewPoint;
