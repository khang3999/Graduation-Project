import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  ScrollView,
  Button,
  Alert,
  TouchableOpacity,
  Image,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { ref, onValue, update } from "firebase/database";
import * as ImagePicker from "expo-image-picker";
import { database } from "@/firebase/firebaseConfig";
import IconA from "react-native-vector-icons/AntDesign";
import { router, useLocalSearchParams } from "expo-router";
import { getDataPost } from "./getDataPost";
import LottieView from "lottie-react-native";
import {
  InputComponent,
  RowComponent,
  SectionComponent,
  TextComponent,
} from "@/components";
import { appColors } from "@/constants/appColors";
import * as Location from "expo-location";

const EditPostLive = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [liveDays, setLiveDays] = useState<
    {
      title: string;
      date?: string;
      description: string;
      activities: { time: string; address: string; activity: string }[];
    }[]
  >([]);
  const [liveImages, setLiveImages] = useState<
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
  const [isLoading, setIsLoading] = useState(true);
  const [isPublic, setIsPublic] = useState(true);
  const [selectedLiveCityImages, setSelectedLiveCityImages] = useState<
    string[]
  >([]);
  const [isCheckIn, setIsCheckIn] = useState(true);
  const [liveModalVisible, setLiveModalVisible] = useState(false);
  const [selectedLiveCityName, setSelectedLiveCityName] = useState<string>("");
  const [citiesData, setCitiesData] = useState<
    {
      id_nuoc: string;
      id: string;
      name: string;
      area_id: string;
    }[]
  >([]);
  const [isActivityHandled, setIsActivityHandled] = useState(false);
  const [isAddingActivity, setIsAddingActivity] = useState(false);

  const { postId } = useLocalSearchParams();
  useEffect(() => {
    const cityRef = ref(database, "cities");
    onValue(cityRef, (snapshot) => {
      const data = snapshot.val() || {};

      // Duyệt qua tất cả các quốc gia và khu vực
      const formattedCities = Object.keys(data).flatMap((countryKey) =>
        Object.keys(data[countryKey]).flatMap((areaKey) =>
          Object.keys(data[countryKey][areaKey]).map((cityKey) => ({
            id: cityKey,
            name: data[countryKey][areaKey][cityKey].name,
            id_nuoc: countryKey,
            area_id: areaKey,
          }))
        )
      );

      setCitiesData(formattedCities);
    });
  }, [postId]);

  
  // console.log("ID Post:", postId);
  useEffect(() => {
    if (typeof postId === "string") {
      getDataPost(postId).then((data) => {
        if (data) {
          setTitle(data.title || "");
          setContent(data.content || "");
          setLiveDays(data.days || []);
          setLiveImages(data.images || []);
          setIsCheckIn(data.isCheckIn || false);
          setIsPublic(data.status_id === 1);

          console.log("Dữ liệu liveDays sau khi tải:", data.days);
        }
      });
    }
  }, [postId]);

  useEffect(() => {
    if (liveDays.length > 0 && !isActivityHandled) {
      console.log("liveDays đã được cập nhật:", liveDays);
      handleAddDayOrActivity();
    }
  }, [liveDays]);

  // console.log(liveDays);
  const handleAddDayOrActivity = async () => {
  setIsAddingActivity(true); // Bắt đầu trạng thái loading
  const currentTime = new Date();
  const formattedDate = `${currentTime
    .getDate()
    .toString()
    .padStart(2, "0")}/${(currentTime.getMonth() + 1)
    .toString()
    .padStart(2, "0")}/${currentTime.getFullYear()}`;

  console.log("Ngày hiện tại:", formattedDate);

  try {
    if (!liveDays || liveDays.length === 0) {
      console.log("liveDays trống, thêm ngày mới");
      await addLiveDay();
    } else if (liveDays[liveDays.length - 1]?.date !== formattedDate) {
      console.log("Thêm ngày mới");
      await addLiveDay();
    } else {
      console.log("Thêm hoạt động mới vào ngày hiện tại");
      await addActivityToCurrentDay();
    }
  } finally {
    setIsAddingActivity(false); 
  }
};
  // Thêm ngày mới vào danh sách
  const addLiveDay = async () => {
    try {
      const location = await getCurrentLocation();
      const currentTime = new Date();
      const formattedTime = `${currentTime
        .getHours()
        .toString()
        .padStart(2, "0")}:${currentTime
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;
      const formattedDate = `${currentTime
        .getDate()
        .toString()
        .padStart(2, "0")}/${(currentTime.getMonth() + 1)
        .toString()
        .padStart(2, "0")}/${currentTime.getFullYear()}`;

      console.log("Trước khi thêm ngày mới:", liveDays);

      setLiveDays((prevLiveDays) => [
        ...prevLiveDays,
        {
          title: `Ngày ${prevLiveDays.length + 1}`,
          date: formattedDate,
          description: "",
          activities: [
            {
              time: formattedTime,
              address: location?.address ?? "Unknown address",
              activity: "",
            },
          ],
        },
      ]);
      setIsAddingActivity(false); 
      console.log("Sau khi thêm ngày mới:", liveDays);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể lấy vị trí hiện tại.");
    }
  };
  // THêm hoat động mới vào ngày hiện tại
  const addActivityToCurrentDay = async () => {
    try {
      const location = await getCurrentLocation();
      const currentTime = new Date();
      const formattedTime = `${currentTime
        .getHours()
        .toString()
        .padStart(2, "0")}:${currentTime
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;

      console.log("Thêm hoạt động mới vào ngày hiện tại:", formattedTime);

      setLiveDays((prevLiveDays) => {
        const updatedDays = [...prevLiveDays];
        const lastDay = updatedDays[updatedDays.length - 1];

        lastDay.activities.push({
          time: formattedTime,
          address: location?.address ?? "Unknown address",
          activity: "",
        });

        return updatedDays;
      });
      setIsAddingActivity(false); 
      console.log("Sau khi thêm hoạt động:", liveDays);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể lấy vị trí hiện tại.");
    }
  };

  const updateLiveActivity = (
    dayIndex: number,
    activityIndex: number,
    key: "activity" | "description" | "title",
    value: string
  ) => {
    const newLiveDays = [...liveDays];
    if (key === "activity") {
      newLiveDays[dayIndex].activities[activityIndex].activity = value;
    } else if (key === "description") {
      newLiveDays[dayIndex].description = value;
    } else if (key === "title") {
      newLiveDays[dayIndex].title = value;
    }
    // console.log("Cập nhật liveDays:", newLiveDays);
    setLiveDays(newLiveDays);
  };
  const handleRemoveLiveImage = (index: number) => {
    const updatedImages = [...selectedLiveCityImages];
    updatedImages.splice(index, 1);
    setSelectedLiveCityImages(updatedImages);

    setLiveImages((prevImages) =>
      prevImages.map((city) =>
        city.city?.name === selectedLiveCityName
          ? { ...city, images: updatedImages }
          : city
      )
    );
    if (updatedImages.length === 0) {
      setLiveModalVisible(false);
    }
  };
  // Lấy vị trí hiện tại
  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Lỗi", "Quyền truy cập vị trí bị từ chối.");
        return null;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
      );
      const data = await response.json();

      if (!data || !data.address) {
        Alert.alert("Lỗi", "Không thể lấy thông tin địa chỉ.");
        return null;
      }

      // Loại bỏ mã bưu điện khỏi `display_name`
      const cleanedAddress = data.display_name
        .replace(/\d{5}(, )?/g, "")
        .trim();

      // Tách chuỗi địa chỉ thành mảng
      const addressParts = cleanedAddress.split(",");

      // Lấy phần thứ hai từ cuối lên
      let provinceName =
        addressParts.length >= 2
          ? addressParts[addressParts.length - 2].trim()
          : "Không xác định";

      // Loại bỏ từ "Thành phố" hoặc "Tỉnh" khỏi `provinceName`
      provinceName = provinceName.replace(/^(Thành phố|Tỉnh)\s+/i, "").trim();

      // console.log("Địa chỉ đầy đủ (đã loại bỏ mã bưu điện):", cleanedAddress);
      // console.log("Tên tỉnh/thành phố (đã loại bỏ tiền tố):", provinceName);

      return { latitude, longitude, address: cleanedAddress, provinceName };
    } catch (error) {
      Alert.alert("Lỗi", "Không thể lấy vị trí hiện tại.");
      console.error(error);
      return null;
    }
  };
  const openCamera = async () => {
    try {
      const pickerResult = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!pickerResult.canceled) {
        const newImageUri = pickerResult.assets[0].uri;

        // Lấy thông tin vị trí hiện tại
        const location = await getCurrentLocation();
        if (!location) {
          Alert.alert("Lỗi", "Không thể lấy vị trí hiện tại.");
          return;
        }

        // So sánh `provinceName` với dữ liệu `citiesData` đã tải
        const cityInfo = citiesData.find(
          (city) => city.name === location.provinceName
        );

        // Nếu không tìm thấy thông tin tỉnh/thành phố, sử dụng dữ liệu mặc định
        const cityData = cityInfo
          ? {
              id: cityInfo.id,
              id_nuoc: cityInfo.id_nuoc,
              name: cityInfo.name,
              area_id: cityInfo.area_id,
            }
          : {
              id: "unknown",
              id_nuoc: "unknown",
              name: location.provinceName || "Không xác định",
              area_id: "unknown",
            };

        // Cập nhật danh sách `liveImages`
        setLiveImages((prevImages) => {
          const existingCity = prevImages.find(
            (item) => item.city && item.city.id === cityData.id
          );

          if (existingCity) {
            // Nếu thành phố đã tồn tại, thêm ảnh mới vào danh sách `images`
            return prevImages.map((item) =>
              item.city && item.city.id === cityData.id
                ? { ...item, images: [...item.images, newImageUri] }
                : item
            );
          } else {
            // Nếu thành phố chưa tồn tại, thêm mục mới
            return [
              ...prevImages,
              {
                city: cityData,
                images: [newImageUri],
              },
            ];
          }
        });

        console.log("Ảnh đã lưu:", newImageUri);
        console.log("Thông tin tỉnh/thành phố:", cityData);
      } else {
        console.log("Chụp ảnh đã bị hủy.");
      }
    } catch (error) {
      console.error("Lỗi khi chụp ảnh:", error);
      Alert.alert("Lỗi", "Không thể chụp ảnh. Vui lòng thử lại.");
    }
  };
  // Hàm xử lý lưu bài viết
  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert("Lỗi", "Tiêu đề và nội dung không được để trống.");
      return;
    }

    const postRef = ref(database, `posts/${postId}`);
    const updatedData = {
      title,
      content,
      liveDays,
      images: liveImages,
    };

    try {
      await update(postRef, updatedData);
      Alert.alert("Thành công", "Bài viết đã được cập nhật.");
      router.back();
    } catch (error) {
      console.error("Lỗi khi cập nhật bài viết:", error);
      Alert.alert("Lỗi", "Không thể cập nhật bài viết. Vui lòng thử lại.");
    }
  };
  const groupedLiveImages = liveImages.reduce<
    { city: { id: string; name: string }; images: string[] }[]
  >((acc, imageCity) => {
    const existingCity = acc.find(
      (item) => imageCity.city && item.city.id === imageCity.city.id
    );
    if (existingCity) {
      existingCity.images = [...existingCity.images, ...imageCity.images];
    } else {
      if (imageCity.city) {
        acc.push({
          city: { id: imageCity.city.id, name: imageCity.city.name },
          images: [...imageCity.images],
        });
      }
    }
    return acc;
  }, []);
  //Xử lý xóa ảnh và xóa city của ảnh
  const handleRemoveImagesAndCityLive = (index: number) => {
    // Xóa toàn bộ mục tại vị trí `index`
    const updatedImages = [...liveImages];
    updatedImages.splice(index, 1);
    setLiveImages(updatedImages);

    // Đặt lại các state liên quan nếu cần
    setSelectedLiveCityImages([]);
    setSelectedLiveCityName("");
  };

  return  isAddingActivity ? (
    <View style={styles.loadingContainer}>
      <LottieView
        source={require("../../assets/images/load.json")}
        autoPlay
        loop
        style={{ width: 250, height: 250 }}
      />
      <Text style={{ marginTop: 10, fontSize: 16, color: appColors.gray }}>
         Đang cập nhật vị trí của bạn...
      </Text>
    </View>
  ) : (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : -125}
    >
      <ScrollView>
        {/* điều kiện để hiện */}
          <>
             <SectionComponent styles={{ marginTop: 35, marginBottom: -15 }}>
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
          </>

        {liveDays.map((day, dayIndex) => (
          <SectionComponent key={dayIndex} styles={styles.dayContainer}>
            <RowComponent
              styles={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  width: 120,
                  height: 30,
                  marginTop: 0,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    marginTop: -20,
                    fontSize: 15,
                    fontWeight: "bold",
                  }}
                >
                  Ngày {dayIndex + 1}
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: appColors.gray,
                    marginTop: 5,
                    marginBottom: -10,
                  }}
                >
                  ({day.date})
                </Text>
              </View>

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
                placeholder={`Nhập tiêu đề cho ngày ${dayIndex + 1}`}
                value={day.title}
                onChange={(text) =>
                  updateLiveActivity(dayIndex, 0, "title", text)
                }
              />
            </RowComponent>

            {/* Activities */}
            <View style={{ marginTop: 10 }}>
              {day.activities.map((activity, activityIndex) => (
                <View key={activityIndex}>
                  <RowComponent
                    justify="center"
                    styles={{ maxHeight: 70, marginBottom: 20 }}
                  >
                    <View
                      style={{
                        width: 70,
                        height: "100%",
                        justifyContent: "center",
                        alignItems: "center",
                        backgroundColor: appColors.btnaddActivity,
                        borderTopLeftRadius: 5,
                        borderBottomLeftRadius: 5,
                      }}
                    >
                      <Text style={{ color: "#000" }}>{activity.time}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <InputComponent
                        disabled={true}
                        inputStyle={{
                          width: "100%",
                          height: "100%",
                          marginTop: 20,
                          borderRadius: 0,
                          borderTopRightRadius: 5,
                          borderBottomRightRadius: 5,
                          borderColor: appColors.btnDay,
                          backgroundColor: appColors.white,
                        }}
                        textStyle={{ color: "#000" }}
                        value={activity.address}
                        onChange={() => {}}
                        multiline
                        scrollEnabled
                      />
                    </View>
                  </RowComponent>
                  <InputComponent
                    inputStyle={{
                      padding: 0,
                      margin: 0,
                      borderRadius: 5,
                      height: 80,
                      width: "100%",
                      borderColor: appColors.gray,
                    }}
                    placeholder={`Nhập mô tả cho hoạt động ${
                      activityIndex + 1
                    }`}
                    value={activity.activity}
                    multiline={true}
                    onChange={(text) =>
                      updateLiveActivity(
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

            <InputComponent
              inputStyle={{
                borderRadius: 5,
                backgroundColor: appColors.inputDay,
                height: 100,
                borderColor: appColors.gray,
              }}
              placeholder={`Nhập mô tả cho ngày ${dayIndex + 1}`}
              value={day.description}
              multiline={true}
              onChange={(text) =>
                updateLiveActivity(dayIndex, 0, "description", text)
              }
            />
          </SectionComponent>
        ))}

        {/* Ảnh */}
        <SectionComponent styles={{ marginTop: 10, marginBottom: 35 }}>
          <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
            {groupedLiveImages.map(
              (imageCity, index) =>
                imageCity.images.length > 0 && (
                  <View
                    key={index}
                    style={{ marginRight: 10, position: "relative" }}
                  >
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedLiveCityImages(imageCity.images || []);
                        setSelectedLiveCityName(
                          imageCity.city?.name || "Không xác định"
                        );
                        setLiveModalVisible(true);
                      }}
                    >
                      <Image
                        source={{ uri: imageCity.images[0] }}
                        style={[
                          styles.festivalImage,
                          { width: 100, height: 100 },
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
                            fontSize: 14,
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
                          backgroundColor: "rgba(0,0,0,0.5)",
                          borderRadius: 50,
                          marginTop: 2.7,
                        }}
                      >
                        <Text
                          style={{
                            color: "white",
                            fontWeight: "bold",
                            textAlign: "center",
                            fontSize: 16,
                          }}
                        >
                          {imageCity.images.length}
                        </Text>
                      </View>
                    </TouchableOpacity>

                    {/* Nút xóa toàn bộ ảnh */}
                    <TouchableOpacity
                      style={{
                        position: "absolute",
                        top: 5,
                        right: 5,
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                        borderRadius: 50,
                        padding: 5,
                      }}
                      onPress={() => handleRemoveImagesAndCityLive(index)}
                    >
                      <IconA name="close" size={20} color="white" />
                    </TouchableOpacity>
                  </View>
                )
            )}
          </ScrollView>
        </SectionComponent>

        {liveDays.length > 0 && (
          <TouchableOpacity style={styles.camera} onPress={openCamera}>
            <Image
              source={require("../../assets/images/camera.png")}
              style={[{ height: 100, width: 100, margin: 10 }]}
            />
          </TouchableOpacity>
        )}
      </ScrollView>
          {/* Modal live images */}
          <Modal
          visible={liveModalVisible}
          transparent={true} 
          onDismiss={() => setLiveModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={[styles.modalTitle, { fontSize: 35 }]}>
              {selectedLiveCityName}
            </Text>
            <ScrollView
              horizontal={true}
              showsHorizontalScrollIndicator={false}
            >
              {selectedLiveCityImages.map((imageUri, index) => (
                <View key={index} style={{ marginRight: 10 }}>
                  <Image
                    source={{ uri: imageUri }}
                    style={[styles.festivalImage, { width: 300, height: 300 }]}
                  />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => handleRemoveLiveImage(index)}
                  >
                    <IconA name="close" size={30} color="white" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={[
                styles.closeButton,
                { marginTop: 20, width: 140, height: 45 },
              ]}
              onPress={() => setLiveModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 8,
    marginBottom: 16,
  },
  dayContainer: {
    marginBottom: 16,
    padding: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
  },
  dayTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  activityContainer: {
    marginBottom: 16,
  },
  imageContainer: {
    marginRight: 16,
    alignItems: "center",
  },
  deleteImage: {
    color: "red",
    fontWeight: "bold",
    marginBottom: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  camera: {
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 12,
    margin: 10,
    width: 120,
    height: 120,
  },
  festivalImage: {
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 12,
    width: 160,
    height: 160,
  },
  //Modal city
  modalContent: {
    top: "25%",
    zIndex: 10,
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
  removeImageButton: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 50,
    padding: 5,
  },
  closeButton: {
    backgroundColor: "red",
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default EditPostLive;
