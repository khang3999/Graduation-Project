import React, { useState, useRef, useMemo, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  Modal,
  TouchableOpacity,
  FlatList,
  Alert,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import BottomSheet from "react-native-gesture-bottom-sheet";
import Icon from "react-native-vector-icons/FontAwesome";
import { ImageSlider } from "react-native-image-slider-banner";
import { RowComponent, SectionComponent } from "@/components";
import { database, ref, onValue } from "@/firebase/firebaseConfig";
import { ScrollView } from "react-native-gesture-handler";
import { set } from "lodash";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { update } from "firebase/database";

const Map = () => {
  const [countryData, setCountryData] = useState([]);
  const [areaData, setAreaData] = useState([]);
  const [cityData, setCityData] = useState([]);
  const [points, setPoints] = useState([]);

  // Lua chon kieu points
  const festivalTypeOptions = [
    {
      id: "all",
      label: "Chọn tất cả",
      type: "all",
    },
    {
      id: "festival",
      label: "Lễ hội",
      type: "festival",
    },
    {
      id: "landmark",
      label: "Danh lam",
      type: "landmark",
    },
  ];

  useEffect(() => {
    const countriesRef = ref(database, "countries");
    const areaRef = ref(database, "areas");
    const pointRef = ref(database, "points");
    const cityRef = ref(database, "cities");

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
    // Lấy dữ liệu từ firebase (khu vực)
    onValue(areaRef, (snapshot) => {
      const data = snapshot.val() || {};
      console.log(data);
      // Chuyển từ đối tượng thành mảng

      const formattedDataAreas = Object.keys(data).flatMap((countryId) =>
        Object.keys(data[countryId]).map((key) => ({
          id: key,
          countryId,
          ...data[countryId][key],
        }))
      );
      setAreaData(formattedDataAreas);
      console.log("Area Data:");
    });
    console.log("Area Data:", areaData);

    onValue(cityRef, (snapshot) => {
      const data = snapshot.val() || {};

      // Duyệt qua tất cả các quốc gia
      const formattedData = Object.keys(data).flatMap((countryKey) => {
        return Object.keys(data[countryKey]).flatMap((area_id) => {
          return Object.keys(data[countryKey][area_id]).map((cityKey) => ({
            id: cityKey,
            area_id: area_id,
            id_nuoc: countryKey,
            ...data[countryKey][area_id][cityKey],
          }));
        });
      });

      setCityData(formattedData);
      // console.log("Cty:", formattedData);
    });

    // Lấy dữ liệu từ firebase (points)
    onValue(pointRef, (snapshot) => {
      const data = snapshot.val() || {};
      // console.log("____________________")
      // console.log(data);

      const formattedPoints = Object.keys(data).flatMap((countryId) => {
        const countryPoints = data[countryId];
        // console.log("countryPoints:", countryPoints);

        return Object.keys(countryPoints).flatMap((type) => {
          const typePoints = countryPoints[type];
          // console.log("typePoints:", typePoints);

          return Object.keys(typePoints).flatMap((pointId) => {
            const point = typePoints[pointId];
            // console.log("point:", point);

            return Object.keys(point).map((pointKey) => ({
              id: pointKey,
              countryId: countryId,
              cityId: pointId,
              type: type,
              ...point[pointKey],
            }));
          });
        });
      });
      console.log("formattedPoints:", formattedPoints);
      setPoints(formattedPoints);
    });
  }, []);

  const mapViewRef = useRef(null);
  const [mapLat] = useState(16.494413736992392);
  const [mapLong] = useState(105.18357904627919);
  const [mapRegion] = useState({
    latitude: mapLat,
    longitude: mapLong,
    latitudeDelta: 8,
    longitudeDelta: 10,
  });
  // Selected đất nước và khu vực
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedArea, setSelectedArea] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedFestivalType, setSelectedFestivalType] = useState("all");
  const [selectedFestival, setSelectedFestival] = useState(null);
  // Modal
  const [modalVisibleCountry, setModalVisibleCountry] = useState(false);
  const [modalVisibleArea, setModalVisibleArea] = useState(false);
  const [modalVisibleCity, setModalVisibleCity] = useState(false);
  const [modalFestivalType, setmodalFestivalType] = useState(false);
  //Bottom sheet
  const bottomSheetRef = useRef(null);
  //Xu ly lại chỗ khu vực phụ thuộc vào quốc gia
  const [filteredAreaData, setFilteredAreaData] = useState(areaData);
  const [filteredCityData, setFilteredCityData] = useState(cityData);
  //Scroll View
  const scrollViewRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  //lấy id của tp
  const [idCities, setIdCities] = useState([]);

  //Thay đổi quốc gia
  const handleCountryChange = (country) => {
    // console.log("Selected Country1:", country);
    if (country !== null) {
      const { latitude, longitude } = country;
      // sử dụng animateToRegion
      if (mapViewRef.current) {
        mapViewRef.current.animateToRegion(
          {
            latitude: latitude,
            longitude: longitude,
            latitudeDelta: 8.0,
            longitudeDelta: 10,
          },
          1000
        );
      }

      setSelectedCountry(country.id);
      setSelectedArea(null);
      setSelectedCity(null);

      // console.log("Selected Country:", country);
      // console.log("Selected Country id:", country.id);
    }

    setModalVisibleCountry(false);
  };
  //Xử lý khu vực theo nước
  useEffect(() => {
    if (selectedCountry) {
      // console.log("Selected Country:", selectedCountry);
      setFilteredAreaData(
        // console.log("Area Data:", areaData),
        areaData.filter((area) => area.countryId === selectedCountry)
      );
      // console.log("Filtered Area Data:", filteredAreaData);
      // setSelectedArea(filteredAreaData.id);
      // console.log("Selected Area:", selectedArea);
    }
  }, [selectedCountry]);

  //Xử lý chọn thành phố theo khu vực
  useEffect(() => {
    if (selectedArea) {
      // console.log("Selected Area:", selectedArea);
      const filteredData = cityData.filter(
        (city) => city.area_id && city.area_id.includes(selectedArea)
      );
      setFilteredCityData(filteredData);
      // console.log("Filtered City Data:", filteredData);
      setSelectedCity(null);
    } else {
      // console.log("____________________");
      // console.log("cityData:", cityData);
      setFilteredCityData(cityData);
    }
  }, [selectedArea, cityData]);

  // Cập nhật idCities khi filteredCityData thay đổi
  useEffect(() => {
    setIdCities(filteredCityData.map((city) => city.id));
    console.log(
      "idCities:",
      filteredCityData.map((city) => city.id)
    );
  }, [filteredCityData]);

  // Thay đổi khu vực
  const handleAreaChange = (area) => {
    if (area !== null) {
      const { latitude, longitude } = area;
      // sử dụng animateToRegion
      if (mapViewRef.current) {
        mapViewRef.current.animateToRegion(
          {
            latitude: latitude,
            longitude: longitude,
            latitudeDelta: 5,
            longitudeDelta: 5,
          },
          1000
        );
      }
      setSelectedArea(area.id);
      // console.log("Selected Area:", area.label);
    }
    setModalVisibleArea(false);
  };
  // Thay doi thanh pho
  const handleCityChange = (city) => {
    if (city !== null) {
      const { latitude, longitude } = city;
      // sử dụng animateToRegion
      if (mapViewRef.current) {
        mapViewRef.current.animateToRegion(
          {
            latitude: latitude,
            longitude: longitude,
            latitudeDelta: 1,
            longitudeDelta: 1,
          },
          1000
        );
      }
      setSelectedCity(city.id);
      // console.log("Selected Area:", area.label);
    }
    setModalVisibleCity(false);
  };

  // Thay đổi type lễ hội
  const handleFestivalChange = (value) => {
    // console.log("Selected Festival Type:", value);
    setSelectedFestivalType(value.id);
    setmodalFestivalType(false);
  };
  // Points phụ thuộc vào quốc gia và loại lễ hội
  const filteredPoints = useMemo(() => {
    console.log(selectedFestivalType);

    if (!selectedCountry) {
      return points;
    }
    // hiển thị các point theo điều kiện
    return points.filter((point) => {
      if (selectedFestivalType) {
        if (selectedFestivalType === "all") {
          if (selectedCountry && point.countryId !== selectedCountry) {
            return false;
          }
          if (selectedCity && point.cityId !== selectedCity) {
            return false;
          }

          if (idCities) {
            if (idCities.includes(point.cityId)) {
              return true;
            }
            return false;
          }
        }
        if (point.type !== selectedFestivalType) {
          return false;
        }
      }

      return true;
    });
  }, [points, selectedCountry, selectedFestivalType, selectedCity, idCities]);

  // xử lý cuộn scroll
  const handleScroll = (event) => {
    //CHiều rộng nội dung
    const contentWidth = event.nativeEvent.contentSize.width;
    //Chiều rộng man hình
    const scrollWidth = event.nativeEvent.layoutMeasurement.width;
    //Vị trí cuộn
    const scrollX = event.nativeEvent.contentOffset.x;
    // console.log("contentWidth:", contentWidth);
    // console.log("scrollWidth:", scrollWidth);
    // console.log("scrollX:", scrollX);

    setShowLeftArrow(scrollX > 0);
    setShowRightArrow(scrollX + scrollWidth < contentWidth);
  };

  // Xu ly bottom sheet
  const openBottomSheet = (point) => {
    // console.log("Point:", point);

    // Đặt state và mở BottomSheet
    setSelectedFestival(point);

    if (bottomSheetRef.current) {
      bottomSheetRef.current.show();
    }
  };

  //Lưu các vi tri của điểm
  const handleSavePoint = async (content, type, location) => {
    const userId = await AsyncStorage.getItem("userToken");
    // console.log("User:", userId);
    // console.log("Content:", content);
    // console.log("Type:", location);
    if (userId) {
      const userRef = ref(database, `accounts/${userId}/behavior`);
       const updatedUserData = {
        content: content,
        location: location,
      };
        await update(userRef, updatedUserData);
    }
    if (type === "post") {
      Alert.alert("Thông báo", "Đã lưu bài viết");
    }
    if (type === "tour") {
      Alert.alert("Thông báo", "Đã lưu tour");
    }
  };

  // selectedFestival && console.log("Selected Festival:", selectedFestival);
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.header}></View>
        {/* Map của Google Map */}

        <MapView style={styles.map} ref={mapViewRef} initialRegion={mapRegion}>
          {filteredPoints.map((point) => {
            // console.log("pointhello:", point);
            // Chọn màu sắc cho Marker
            const pinColor =
              point.type === "landmark"
                ? "blue"
                : point.type === "festival"
                ? "red"
                : "green";

            const latitude = point.latitude;
            const longitude = point.longitude;
            return (
              <Marker
                key={point.id}
                coordinate={{ latitude, longitude }}
                title={point.title}
                pinColor={pinColor}
                onPress={() => {
                  openBottomSheet(point);
                }}
              />
            );
          })}
        </MapView>
        {/* Chọn khu vực và lễ hội danh lam */}
        <RowComponent styles={{ marginTop: 30 }} justify="center">
          <View style={styles.containerScroll}>
            {showLeftArrow && (
              <TouchableOpacity
                style={styles.arrowButton}
                onPress={() =>
                  scrollViewRef.current.scrollTo({ x: 0, animated: true })
                }
              >
                <Text style={styles.arrowText}>&lt;</Text>
              </TouchableOpacity>
            )}
            <ScrollView
              ref={scrollViewRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              onScroll={handleScroll}
            >
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
                      size={20}
                      style={{ padding: 10 }}
                      color="#000"
                    />
                  </TouchableOpacity>
                </View>
              </SectionComponent>
              {/* khu vực */}
              <SectionComponent>
                <View style={styles.areaSelector}>
                  <TouchableOpacity
                    onPress={() => setModalVisibleArea(true)}
                    style={styles.areaButton}
                  >
                    <Text
                      style={styles.areaButtonText}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {selectedArea != null
                        ? areaData.find((area) => area.id === selectedArea)
                            ?.label
                        : "Tất cả khu vực"}
                    </Text>
                    <Icon
                      name="angle-down"
                      size={20}
                      style={{ padding: 10 }}
                      color="#000"
                    />
                  </TouchableOpacity>
                </View>
              </SectionComponent>
              {/* Thanh Pho  */}
              <SectionComponent>
                <View style={styles.areaSelector}>
                  <TouchableOpacity
                    onPress={() => setModalVisibleCity(true)}
                    style={styles.areaButton}
                  >
                    <Text
                      style={styles.areaButtonText}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {selectedCity != null
                        ? cityData.find((city) => city.id === selectedCity)
                            ?.name
                        : "Tất cả tỉnh thành"}
                    </Text>
                    <Icon
                      name="angle-down"
                      size={20}
                      style={{ padding: 10 }}
                      color="#000"
                    />
                  </TouchableOpacity>
                </View>
              </SectionComponent>
              {/* Lễ hội danh lam */}
              <SectionComponent>
                <View style={styles.festivalSelector}>
                  <TouchableOpacity
                    onPress={() => setmodalFestivalType(true)}
                    style={styles.festivalButton}
                  >
                    <Text
                      style={styles.countryButtonText}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {selectedFestivalType != null
                        ? festivalTypeOptions.find(
                            (option) => option.id === selectedFestivalType
                          )?.label
                        : "Chọn tất cả"}
                    </Text>
                    <Icon
                      name="angle-down"
                      size={20}
                      style={{ padding: 10 }}
                      color="#000"
                    />
                  </TouchableOpacity>
                </View>
              </SectionComponent>
            </ScrollView>
            {showRightArrow && (
              <TouchableOpacity
                style={styles.arrowButton}
                onPress={() =>
                  scrollViewRef.current.scrollTo({ x: 450, animated: true })
                }
              >
                <Text style={styles.arrowText}>&gt;</Text>
              </TouchableOpacity>
            )}
          </View>
        </RowComponent>
        {/* Modal chọn quốc gia */}
        <Modal visible={modalVisibleCountry} transparent={true}>
          <View style={styles.modalOverlay}>
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

        {/* Modal chọn khu vực */}
        <Modal visible={modalVisibleArea} transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Chọn Khu Vực</Text>
              {selectedCountry === null ? (
                <Text style={styles.warningText}>
                  Vui lòng chọn quốc gia trước khi chọn khu vực
                </Text>
              ) : (
                <FlatList
                  data={filteredAreaData}
                  keyExtractor={(item) => item.id}
                  style={styles.countryList}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.countryOption}
                      onPress={() => handleAreaChange(item)}
                    >
                      <Text style={styles.countryLabel}>{item.label}</Text>
                    </TouchableOpacity>
                  )}
                />
              )}
              <View style={styles.separator} />
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisibleArea(false)}
              >
                <Text style={styles.closeButtonText}>Đóng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        {/* Modal chọn khu vực */}
        <Modal visible={modalVisibleCity} transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Chọn Thành Phố</Text>
              {selectedArea === null ? (
                <Text style={styles.warningText}>
                  Vui lòng chọn khu vực trước khi chọn thành phố
                </Text>
              ) : (
                <FlatList
                  data={filteredCityData}
                  keyExtractor={(item) => item.id}
                  style={styles.countryList}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.countryOption}
                      onPress={() => handleCityChange(item)}
                    >
                      <Text style={styles.countryLabel}>{item.name}</Text>
                    </TouchableOpacity>
                  )}
                />
              )}
              <View style={styles.separator} />
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisibleCity(false)}
              >
                <Text style={styles.closeButtonText}>Đóng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        {/* Modal chọn type lễ hội */}
        <Modal visible={modalFestivalType} transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Chọn thể loại</Text>
              <FlatList
                data={festivalTypeOptions}
                keyExtractor={(item) => item.id}
                style={styles.countryList}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.countryOption}
                    onPress={() => handleFestivalChange(item)}
                  >
                    <Text style={styles.countryLabel}>{item.label}</Text>
                  </TouchableOpacity>
                )}
              />
              <View style={styles.separator} />
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setmodalFestivalType(false)}
              >
                <Text style={styles.closeButtonText}>Đóng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        {/* BottomSheet le hoi */}
        <BottomSheet hasDraggableIcon ref={bottomSheetRef} height={460}>
          {selectedFestival && (
            <View style={styles.sheetContent}>
              <Text style={styles.modalTitle}>{selectedFestival.title}</Text>
              <Text style={styles.commentsText}>
                {selectedFestival.content}
              </Text>

              {/* Kiểm tra số lượng ảnh */}
              {Array.isArray(selectedFestival.images) ? (
                <ImageSlider
                  data={selectedFestival.images.map((image) => ({
                    img: image,
                  }))}
                  preview={false}
                  autoPlay={true}
                  caroselImageStyle={{
                    marginTop: -30,
                    width: 400,
                    height: 250,
                    resizeMode: "stretch",
                    overflow: "hidden",
                  }}
                  indicatorContainerStyle={{
                    position: "absolute",
                    bottom: -15,
                  }}
                />
              ) : selectedFestival.images ? (
                <Image
                  style={styles.festivalImage}
                  source={{ uri: selectedFestival.images }}
                  resizeMode="cover"
                />
              ) : (
                <Text>Không có ảnh nào</Text>
              )}

              {/*  */}
              <Text style={styles.dateText}>
                <Text style={{ fontWeight: "bold" }}>Ngày</Text>:{" "}
                {selectedFestival.start} -{selectedFestival.end}
              </Text>

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() => {
                    handleSavePoint(
                      selectedFestival.title,
                      "tour",
                      selectedFestival.cityId
                    );
                  }}
                >
                  <Icon name="file-text-o" size={20} color="#000" />
                  <Text style={styles.buttonText}>Bài viết</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() => {
                    handleSavePoint(
                      selectedFestival.title,
                      "post",
                      selectedFestival.cityId
                    );
                  }}
                >
                  <Icon name="picture-o" size={20} color="#000" />
                  <Text style={styles.buttonText}>Tours</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </BottomSheet>
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    position: "absolute",
    zIndex: 100,
    padding: 10,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fff",
  },
  // Chọn khu vuc
  areaSelector: {
    backgroundColor: "#ccc",
    borderRadius: 30,
    height: 50,
    width: 160,
    borderWidth: 1,
    borderColor: "#aaa",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.6,
    shadowRadius: 3.5,
    elevation: 10,
  },
  areaButton: {
    marginLeft: 10,
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  areaButtonText: {
    fontSize: 16,
    color: "#000",
    marginLeft: 10,
    flexShrink: 1,
  },
  // Chọn lễ hội danh lam
  festivalSelector: {
    backgroundColor: "#ccc",
    borderRadius: 30,
    height: 50,
    width: 160,
    borderWidth: 1,
    borderColor: "#aaa",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.6,
    shadowRadius: 3.5,
    elevation: 10,
  },
  festivalButton: {
    marginLeft: 10,
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  festivalButtonText: {
    fontSize: 16,
    color: "#000",
    marginLeft: 10,
    flexShrink: 1,
  },
  // Chọn đất nước
  countrySelector: {
    backgroundColor: "#ccc",
    borderRadius: 30,
    height: 50,
    width: 160,
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
    fontSize: 16,
    color: "#000",
    marginLeft: 10,
    flexShrink: 1,
  },
  countryFlag: {
    width: 30,
    height: 20,
    resizeMode: "contain",
  },
  // Map gg map
  map: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },

  // Modal chọn quốc gia
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "90%",
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    alignItems: "center",
    maxHeight: "70%",
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
    padding: 16,
    borderRadius: 20,
  },
  festivalImage: {
    width: "100%",
    height: 250,
  },
  closeButton: {
    width: 100,
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
  //
  // Rating và bình luận
  ratingText: {
    fontSize: 14,
  },
  commentsText: {
    fontSize: 14,
    marginBottom: 10,
  },
  dateText: {
    fontSize: 14,
    marginTop: 10,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 10,
  },
  iconButton: {
    flexDirection: "row",
    padding: 12,
    paddingLeft: 36,
    width: "45%",
    borderColor: "#aaa",
    backgroundColor: "#ccc",
    borderRadius: 10,
    shadowColor: "#000",
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  buttonText: {
    marginLeft: 14,
    fontSize: 16,
    fontWeight: "bold",
  },
  imageSlider: {
    borderRadius: 10,
  },
  //Scroll View
  containerScroll: {
    flexDirection: "row",
    alignItems: "center",
  },
  arrowButton: {
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 20,
    marginTop: -20,
    elevation: 10,
    marginHorizontal: 5,
  },
});

export default Map;
