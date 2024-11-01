import React, { useEffect, useState } from "react";
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
} from "react-native";
import IconA from "react-native-vector-icons/AntDesign";
import Icon from "react-native-vector-icons/Fontisto";
import { ArrowLeft } from "iconsax-react-native";
import { router } from "expo-router";
import { appColors } from "@/constants/appColors";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import {
  ButtonComponent,
  RowComponent,
  SectionComponent,
  InputComponent,
  TextComponent,
} from "@/components";
import { Modal } from "react-native-paper";
import { database, onValue, ref } from "@/firebase/firebaseConfig";
import MapView, { Marker } from "react-native-maps";
import * as ImagePicker from "expo-image-picker";

const AddPostUser = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [citiesData, setCitiesData] = useState<{ id: string; name: string }[]>(
    []
  );

  const [cities, setCities] = useState<{ id: string; name: string }[]>([]);

  //Modal
  const [modalVisibleCity, setModalVisibleCity] = useState(false);
  const [modalVisibleMap, setModalVisibleMap] = useState(false);
  const [modalVisibleCityImages, setModalVisibleCityImages] = useState(false);
  const [modalVisibleImage, setModalVisibleImage] = useState(false);
  const [modalVisibleImageInfEdit, setModalVisibleImageInfEdit] =
    useState(false);
  const [modalVisibleTimePicker, setModalVisibleTimePicker] = useState(false);

  //loading
  const [loadingLocation, setLoadingLocation] = useState(false);

  //Chon giờ 
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);

  //Chosse ảnh
  //lưu trữ ảnh được chọn tạm thời
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  //lưu trữ thông tin thành phố đã chọn
  const [selectedCityForImages, setSelectedCityForImages] = useState<{
    id: string;
    name: string;
  } | null>(null);
  // lưu trữ hình ảnh cùng với thành phố tương ứng
  const [images, setImages] = useState<
    { city: { id: string; name: string } | null; images: string[] }[]
  >([]);
  //Lưu vi trí muốn sửa tt ảnh
  const [indexEditImage, setIndexEditImage] = useState<number | null>(null);

  //map
  const [region, setRegion] = useState({
    latitude: 17.65005783136121,
    longitude: 106.40283940732479,
    latitudeDelta: 9,
    longitudeDelta: 9,
  });
  // interface Location {
  //   name: string;
  //   latitude: number;
  //   longitude: number;
  // }

  const [selectedLocation, setSelectedLocation] = useState<{
    name: string;
    latitude: number;
    longitude: number;
  } | null>(null);

  const [days, setDays] = useState<
    {
      title: string;
      description: string;
      activities: { time: string; activity: string }[];
    }[]
  >([]);

  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);
  const [selectedActivityIndex, setSelectedActivityIndex] = useState<
    number | null
  >(null);

  // *********************************************************************
  // Xử lý Thành Phố Bài Viết
  // *********************************************************************

  //Lấy data từ cty fb
  useEffect(() => {
    const cityRef = ref(database, "cities");
    onValue(cityRef, (snapshot) => {
      const data = snapshot.val() || {};

      const formattedData = Object.keys(data).flatMap((countryKey) => {
        const cityData = data[countryKey];
        // console.log("countryData:", countryData);

        return Object.keys(cityData)
          .filter((cityKey) => cityData[cityKey].id_nuoc === "avietnam")
          .map((cityKey) => ({
            id: cityKey,
            ...cityData[cityKey],
          }));
      });

      setCitiesData(formattedData);
      // console.log("$$$$$$$$$$$$$$$$$$");
      // // console.log("Cty:", formattedData);
      // console.log(citiesData)
    });
  }, []);
  //Cac tinh thanh duoc chon
  const handCityPress = (city: { id: string; name: string }) => () => {
    setCities([{ id: city.id, name: city.name }, ...cities]);
    setModalVisibleCity(false);
  };

  //Remove tinh thanh de chon
  const removeCity = (cityId: String) => {
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
      console.error("Error", error);
      alert("Có lỗi xảy ra khi lấy thông tin vị trí.");
    }
  };
  //Search map
  const handleSearch = async () => {
    setLoadingLocation(true);
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
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.length > 0) {
        const location = data[0];
        setRegion({
          latitude: parseFloat(location.lat),
          longitude: parseFloat(location.lon),
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
        setLoadingLocation(false);
      } else {
        setLoadingLocation(false);
        alert("Không tìm thấy địa điểm.");
      }
    } catch (error) {
      setLoadingLocation(false);
      console.error("Error fetching location:", error);
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
          "activity",
          selectedLocation.name
        );
        //Huy all index
        // setSelectedDayIndex(null);
        // setSelectedActivityIndex(null);
       
        setModalVisibleMap(false);
        setSelectedLocation(null);
        setRegion({
          latitude: 17.65005783136121,
          longitude: 106.40283940732479,
          latitudeDelta: 9,
          longitudeDelta: 9,
        });
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
    const newDays = [...days];
    //Thêm đối tượng time and activity vào mảng activities
    newDays[dayIndex].activities.push({ time: "", activity: "" });
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
    key: "time" | "activity",
    value: string
  ) => {
    const newDays = [...days];
    newDays[dayIndex].activities[activityIndex][key] = value;
    setDays(newDays);
  };

  //Chọn gio
  const showTimePicker = (dayIndex: number, activityIndex: number, time: string) => {
    // console.log("Chon gio");
    setSelectedTime(new Date(`2024-01-01T${time || "00:00"}`));
    // console.log("Time:", time);
    console.log(selectedTime);
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
        const previousTime = newDays[selectedDayIndex].activities[selectedActivityIndex - 1].time;
        
        if (previousTime) {
          const currentTime = new Date(`2024-01-01T${formattedTime}:00`);
          const prevTime = new Date(`2024-01-01T${previousTime}:00`);
  
          console.log("currentTime:", currentTime);
  
          if (currentTime <= prevTime) {
            Alert.alert("Thông báo", "Thời gian của hoạt động này phải lớn hơn hoạt động trước.");
            setModalVisibleTimePicker(false);
            return;
          }
        }
      }
      if (selectedActivityIndex < newDays[selectedDayIndex].activities.length - 1) {
        const nextTime = newDays[selectedDayIndex].activities[selectedActivityIndex + 1].time;
  
        if (nextTime) {
          const currentTime = new Date(`2024-01-01T${formattedTime}:00`);
          const nexTime = new Date(`2024-01-01T${nextTime}:00`);
  
          if (currentTime >= nexTime) {
            Alert.alert("Thông báo", "Thời gian của hoạt động này phải nhỏ hơn hoạt động sau.");
            setModalVisibleTimePicker(false);
            return;
          }
        }
      }
  
      // cập nhật thời gian
      newDays[selectedDayIndex].activities[selectedActivityIndex].time = formattedTime;
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
    console.log("Chuyen map");
    setModalVisibleMap(true);
    setSelectedDayIndex(dayIndex);
    setSelectedActivityIndex(activityIndex);
  };
  //Mo modal map de sua
  const handleOpenMapEdit = async (
    dayIndex: number,
    activityIndex: number,
    activity: string 
  ) => {
    console.log(activity);
    setLoadingLocation(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          activity
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
        setRegion({
          latitude: parseFloat(location.lat),
          longitude: parseFloat(location.lon),
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });

        setSelectedLocation({
          name: activity,
          latitude: parseFloat(location.lat),
          longitude: parseFloat(location.lon),
        });
        setLoadingLocation(false);
      }
    } catch (error) {
      setLoadingLocation(false);
      Alert.alert(
        " Vui lòng kiểm tra lại kết nối mạng."
      );
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
    const selectedCity = { id: city.id, name: city.name };
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

  return (
    <View style={styles.container}>
      <RowComponent justify="flex-start">
        <ArrowLeft
          size="32"
          style={{ marginBottom: 15 }}
          onPress={() => {
            router.replace("/(tabs)/");
          }}
          color="#000"
        />
        <TextComponent
          text="Hành trình mới"
          size={24}
          styles={{
            fontWeight: "800",
            margin: 5,
            marginLeft: 90,
            marginBottom: 20,
          }}
        />
      </RowComponent>

      <ScrollView>
        {/* Check in */}
        <SectionComponent>
          <TouchableOpacity
            style={styles.checkin}
            onPress={() => {
              console.log("Chuyen map check in");
            }}
          >
            <RowComponent justify="space-between">
              <Text>Check in lên bản đồ của bạn</Text>
              <Icon
                name="checkbox-active"
                size={14}
                style={{ marginLeft: 10 }}
                color={appColors.success}
              />
            </RowComponent>
          </TouchableOpacity>
        </SectionComponent>

        {/* Cities */}
        <SectionComponent styles={styles.cities}>
          <ScrollView
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.leftButtons}
          >
            {cities.map((city) => (
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
            ))}
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
                { width: 40, paddingLeft: 10, marginLeft: 10 },
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
        <SectionComponent styles={{ marginTop: -135, marginBottom: -15 }}>
          <InputComponent
            value={title}
            placeholder="Nhập tiêu đề bài viết"
            onChange={(val) => setTitle(val)}
            textStyle={{ fontSize: 16, fontWeight: "500", color: "#000" }}
            inputStyle={{ height: 40, backgroundColor: appColors.gray3 }}
          />
        </SectionComponent>

        {/* Content */}
        <SectionComponent>
          <InputComponent
            value={content}
            placeholder="Mô tả chung cho bài viết"
            onChange={(val) => setContent(val)}
            textStyle={{ fontSize: 16, fontWeight: "500", color: "#000" }}
            inputStyle={{
              width: "100%",
              height: 140,
              borderRadius: 0,
              backgroundColor: appColors.gray3,
            }}
            multiline={true}
          />
        </SectionComponent>

        {/*  ngày đã thêm */}
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
            <RowComponent justify="space-between">
              <Text style={{ marginTop: -20, fontSize: 15 }}>
                Ngày {dayIndex + 1}
              </Text>
              <InputComponent
                inputStyle={{
                  width: 260,
                  height: 30,
                  borderRadius: 0,
                  backgroundColor: appColors.btnDay,
                }}
                textStyle={{ color: "#000" }}
                placeholder={`Mô tả tiêu đề ngày ${dayIndex + 1}`}
                value={day.title}
                onChange={(text) => updateDay(dayIndex, "title", text)}
              />
            </RowComponent>

            {/* Activities */}
            <View style={{ marginTop: 20 }}>
              {/* Danh sach hoat dong cua ngay do */}
              {day.activities.map((activity, activityIndex) => (
                <View key={activityIndex} style={{ marginTop: -10 }}>
                  <RowComponent justify="center" styles={{ maxHeight: 70 }}>
                    <TouchableOpacity
                      style={{
                        width: 100,
                        height: "75%",
                        borderRadius: 0,
                        marginTop: -18,
                        backgroundColor: appColors.btnaddActivity,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                      //Chon gio
                      onPress={() => showTimePicker(dayIndex, activityIndex, activity.time)}
                    >
                      <Text style={{ color: "#000" }}>
                        {activity.time || "Chọn giờ"}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        // console.log(activity);
                        if (activity.activity) {
                          handleOpenMapEdit(dayIndex, activityIndex, activity.activity);
                        } else {
                          handleOpenMap(dayIndex, activityIndex);
                        }
                      }}
                    >
                      <InputComponent
                        disabled={true}
                        inputStyle={{
                          width: 230,
                          borderRadius: 0,
                          backgroundColor: appColors.white,
                        }}
                        textStyle={{ color: "#000" }}
                        placeholder="Địa điểm hoạt động"
                        multiline={true}
                        value={activity.activity}
                        onChange={(text) =>
                          updateActivity(
                            dayIndex,
                            activityIndex,
                            "activity",
                            text
                          )
                        }
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{ marginTop: -20, marginLeft: 2 }}
                      onPress={() => deleteActivity(dayIndex, activityIndex)}
                    >
                      <IconA
                        name="minuscircle"
                        size={20}
                        color={appColors.danger}
                      />
                    </TouchableOpacity>
                  </RowComponent>
                </View>
              ))}
            </View>

            {/* Nut them hoat dong */}
            <SectionComponent>
              <TouchableOpacity
                style={[styles.addButton, { marginTop: 10 }]}
                onPress={() => addActivity(dayIndex)}
              >
                <Text style={{ fontSize: 13 }}>Thêm Hoạt Động</Text>
                <IconA name="pluscircleo" size={15} color="#000" />
              </TouchableOpacity>
            </SectionComponent>

            <InputComponent
              inputStyle={{
                borderRadius: 0,
                backgroundColor: appColors.inputDay,
                height: 100,
              }}
              placeholder="Nhập mô tả cho ngày"
              value={day.description}
              multiline={true}
              onChange={(text) => updateDay(dayIndex, "description", text)}
            />
          </SectionComponent>
        ))}

        {/* Nút thêm ngày */}
        <SectionComponent>
          <TouchableOpacity
            style={[
              styles.addButton,
              { backgroundColor: appColors.btnaddActivity },
            ]}
            onPress={addDay}
          >
            <Text style={{ fontSize: 16 }}>Thêm ngày</Text>
            <IconA name="pluscircleo" size={15} color="#000" />
          </TouchableOpacity>
        </SectionComponent>

        {/* Hình ảnh */}
        <SectionComponent styles={{ marginTop: 10 }}>
          {images.length > 0 ? (
            <View>
              <TouchableOpacity
                style={styles.festivalImage}
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
      <SectionComponent>
        <RowComponent
          styles={{
            width: 300,
            height: 30,
            padding: 5,
            marginTop: 10,
            marginBottom: -10,
          }}
          justify="space-between"
        >
          <TextComponent
            text="Public"
            size={14}
            styles={{
              fontWeight: "light",
              marginLeft: 65,
              backgroundColor: isPublic ? appColors.success : appColors.gray3,
              borderRadius: 50,
              padding: 5,
              width: 100,
              height: 26,
              textAlign: "center",
            }}
          />
          <Switch value={isPublic} onValueChange={(val) => setIsPublic(val)} />
          <TextComponent
            text="Private"
            size={14}
            styles={{
              fontWeight: "heavy",
              backgroundColor: !isPublic ? appColors.success : appColors.gray3,
              borderRadius: 50,
              padding: 5,
              width: 100,
              height: 26,
              textAlign: "center",
            }}
          />
        </RowComponent>
      </SectionComponent>

      {/* Nút chia sẻ */}
      <ButtonComponent
        text="Chia sẻ"
        textStyles={{ fontWeight: "bold", fontSize: 30 }}
        color={appColors.primary}
        onPress={() => {}}
      />
      {/* Chọn tỉnh thành cho bài viết */}
      <Modal
        visible={modalVisibleCity}
        onDismiss={() => setModalVisibleCity(false)}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Chọn Thành Phố</Text>
          {citiesData.length > 0 ? (
            <FlatList
              data={citiesData}
              keyExtractor={(item) => item.id}
              style={styles.countryList}
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
            <Text>No cities</Text>
          )}
          <View style={styles.separator} />
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setModalVisibleCity(false)}
          >
            <Text style={styles.closeButtonText}>Đóng</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Chon map */}
      <Modal
        visible={modalVisibleMap}
        onDismiss={() => {
          setSelectedLocation(null);
          setRegion({
            latitude: 17.65005783136121,
            longitude: 106.40283940732479,
            latitudeDelta: 9,
            longitudeDelta: 9,
          });
          setModalVisibleMap(false);
        }}
      >
        <View style={[styles.containerMap]}>
          <Text style={[styles.modalTitle, { marginLeft: 10 }]}>
            Chọn địa điểm
          </Text>
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
              <Icon
                name="search"
                size={16}
                color="white"
                style={{ marginRight: 5 }}
              />
            </TouchableOpacity>
          </View>
          <View style={{ height: 550 }}>
            <MapView
              style={styles.map}
              region={region}
              onRegionChangeComplete={setRegion}
              onPress={handleMapPress}
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
          <Text style={styles.modalTitle}>Chọn Tỉnh Thành Cho Ảnh</Text>
          {citiesData.length > 0 ? (
            <FlatList
              data={citiesData}
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
            <Text>No cities</Text>
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
    </View>
  );
};

const styles = StyleSheet.create({
  //Full app
  container: {
    flex: 1,
    backgroundColor: "white",
    padding: 10,
    paddingTop: 50,
  },
  //Modal map
  containerMap: {
    textAlign: "center",
    width: 390,
    height: 600,
    padding: 10,
    marginLeft: 10,
    marginBottom: 30,
    backgroundColor: "#fff",
  },

  map: {
    width: "100%",
    height: "76%",
  },
  //checkin
  checkin: {
    width: 250,
    height: 30,
    backgroundColor: appColors.gray3,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  //cities
  cities: {
    flexDirection: "row",
    height: 200,
    justifyContent: "flex-start",
  },
  leftButtons: {
    flexDirection: "row",
  },
  fixedRightButton: {
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
    margin: 15,
    padding: 10,
    backgroundColor: appColors.gray3,
    marginTop: 10,
    borderRadius: 10,
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
    borderRadius: 50,
    backgroundColor: appColors.btnDay,
    width: 150,
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
});

export default AddPostUser;
