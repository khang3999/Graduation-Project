import React, { useState, useRef, useMemo, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  Modal,
  TouchableOpacity,
  FlatList,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import BottomSheet from "react-native-gesture-bottom-sheet";
import Icon from "react-native-vector-icons/FontAwesome";
import { ImageSlider } from "react-native-image-slider-banner";
import { RowComponent, SectionComponent } from "@/components";
import { database, ref, onValue, get } from "@/firebase/firebaseConfig";
import { ScrollView } from "react-native-gesture-handler";
import { useNavigation } from "@react-navigation/native";
import { router } from "expo-router";

const Map = () => {
  const [countryData, setCountryData] = useState([]);
  const [areaData, setAreaData] = useState([]);
  const [cityData, setCityData] = useState([]);
  const [points, setPoints] = useState([]);
  const navigation = useNavigation();

  const [filteredCityData, setFilteredCityData] = useState([]);
  const [cityLoading, setCityLoading] = useState(true);
  const [areaLoading, setAreaLoading] = useState(true);

  // ...existing code...
  useEffect(() => {
    if (!selectedCountry) {
      setCityData([]);
      setAreaData([]);
      setCityLoading(false);
      setAreaLoading(false);
      return;
    }
    setCityLoading(true);
    setAreaLoading(true);
    const cityRef = ref(database, `provinces/${selectedCountry}/data`);
    const unsubscribeCity = onValue(cityRef, (snapshot) => {
      const data = snapshot.val() || {};
      //  data -> cityId -> cityData
      const formattedCities = Object.keys(data)
        .map((cityId) => {
          const city = data[cityId];
          return {
            id: cityId,
            name: city.value || city.title || city.name || "", 
            area_id: city.areaId, 
            latitude:
              Array.isArray(city.geocode) && city.geocode[0]?.latitude
                ? city.geocode[0].latitude
                : city.latitude,
            longitude:
              Array.isArray(city.geocode) && city.geocode[0]?.longitude
                ? city.geocode[0].longitude
                : city.longitude,
            ...city,
          };
        })
        .filter(
          (city) =>
            typeof city.latitude === "number" &&
            typeof city.longitude === "number" &&
            !isNaN(city.latitude) &&
            !isNaN(city.longitude) &&
            city.name
        );
      setCityData(formattedCities);
      setCityLoading(false);
    });
    const areasRef = ref(database, `areas/${selectedCountry}`);
    const unsubscribeArea = onValue(areasRef, (snapshot) => {
      const data = snapshot.val() || {};
      const formattedAreas = Object.keys(data).map((key) => ({
        id: key,
        label: data[key].label || key,
        latitude: data[key].latitude || 0,
        longitude: data[key].longitude || 0,
        countryId: selectedCountry,
        cityIds: data[key].cityIds || [],
      }));
      setAreaData(formattedAreas);
      setAreaLoading(false);
    });
    return () => {
      unsubscribeCity();
      unsubscribeArea();
    };
  }, [selectedCountry]);

  useEffect(() => {
    const countriesRef = ref(database, "countries");
    const pointRef = ref(database, "pointsNew");

    // Lấy dữ liệu từ firebase (qgia)
    onValue(countriesRef, (snapshot) => {
      const data = snapshot.val() || {};
      const formattedDataCountry = Object.keys(data).map((key) => ({
        id: key,
        ...data[key],
      }));
      setCountryData(formattedDataCountry);
      console.log("Country Data:", formattedDataCountry); // Thêm dòng này
    });

    // Lấy dữ liệu từ firebase (points)
    onValue(pointRef, (snapshot) => {
      const data = snapshot.val() || {};

      const formattedPoints = Object.keys(data).flatMap((countryId) => {
        const countryData = data[countryId] || {};
        return Object.keys(countryData).flatMap((cityId) => {
          const cityPoints = countryData[cityId] || {};
          return Object.keys(cityPoints).map((pointId) => {
            const point = cityPoints[pointId];

            // Improved coordinate extraction with validation
            let validLatitude = null;
            let validLongitude = null;

            // Check for geocode array first
            if (Array.isArray(point.geocode) && point.geocode.length > 0) {
              const firstGeocode = point.geocode[0];
              if (
                firstGeocode &&
                typeof firstGeocode.latitude === "number" &&
                typeof firstGeocode.longitude === "number" &&
                !isNaN(firstGeocode.latitude) &&
                !isNaN(firstGeocode.longitude) &&
                !(
                  firstGeocode.latitude === 0 && firstGeocode.longitude === 0
                ) &&
                !(
                  firstGeocode.latitude === 21.023897 &&
                  firstGeocode.longitude === 105.844719
                )
              ) {
                validLatitude = firstGeocode.latitude;
                validLongitude = firstGeocode.longitude;
              }
            }

            // Fall back to direct properties if geocode wasn't valid
            if (validLatitude === null && validLongitude === null) {
              if (
                typeof point.latitude === "number" &&
                typeof point.longitude === "number" &&
                !isNaN(point.latitude) &&
                !isNaN(point.longitude) &&
                !(point.latitude === 0 && point.longitude === 0) &&
                !(
                  point.latitude === 21.023897 && point.longitude === 105.844719
                )
              ) {
                validLatitude = point.latitude;
                validLongitude = point.longitude;
              }
            }

            return {
              id: pointId,
              countryId: countryId,
              cityId: cityId,
              latitude: validLatitude,
              longitude: validLongitude,
              ...point,
            };
          });
        });
      });

      setPoints(formattedPoints);
    });
  }, []);
  // console.log("Points:", points);

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
  const [selectedFestival, setSelectedFestival] = useState(null);
  // Modal
  const [modalVisibleCountry, setModalVisibleCountry] = useState(false);
  const [modalVisibleArea, setModalVisibleArea] = useState(false);
  const [modalVisibleCity, setModalVisibleCity] = useState(false);
  //Bottom sheet
  const bottomSheetRef = useRef(null);
  //Scroll View
  const scrollViewRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  //lấy id của tp
  const [idCities, setIdCities] = useState([]);

  //Thay đổi quốc gia
  const handleCountryChange = (country) => {
    if (country !== null) {
      // Lấy tọa độ, nếu không có thì dùng mặc định
      const latitude = country.latitude || 16.494413736992392;
      const longitude = country.longitude || 105.18357904627919;
      if (mapViewRef.current) {
        mapViewRef.current.animateToRegion(
          {
            latitude,
            longitude,
            latitudeDelta: 8.0,
            longitudeDelta: 10,
          },
          1000
        );
      }
      setSelectedCountry(country.id);
      setSelectedArea(null);
      setSelectedCity(null);

      // Load areas for selected country
      const areasRef = ref(database, `areas/${country.id}`);
      onValue(areasRef, (snapshot) => {
        const data = snapshot.val() || {};
        const formattedAreas = Object.keys(data).map((key) => ({
          id: key,
          label: data[key].label || key,
          latitude: data[key].latitude || 0,
          longitude: data[key].longitude || 0,
          countryId: country.id,
          cityIds: data[key].cityIds || [],
        }));
        setAreaData(formattedAreas);
      });
    }
    setModalVisibleCountry(false);
  };
 
  //Xử lý chọn thành phố theo khu vực
  useEffect(() => {
    if (cityLoading || areaLoading) return; // Chỉ filter khi đã load xong
    if (selectedArea) {
      // Lấy cityIds từ area đã chọn
      const area = areaData.find(a => a.id === selectedArea);
      if (area && area.cityIds && area.cityIds.length > 0) {
        const filteredData = cityData.filter(city =>
          area.cityIds.map(String).includes(String(city.id))
        );
        setFilteredCityData(filteredData);
      } else {
        // Fallback: filter theo area_id như cũ
        const filteredData = cityData.filter(
          (city) => city.area_id && city.area_id.includes(selectedArea)
        );
        setFilteredCityData(filteredData);
      }
      setSelectedCity(null);
    } else {
      setFilteredCityData(cityData);
    }
  }, [selectedArea, cityData, areaData, cityLoading, areaLoading]);

  // Cập nhật idCities khi filteredCityData thay đổi
  useEffect(() => {
    setIdCities(filteredCityData.map((city) => city.id));
  }, [filteredCityData]);

  // Thay đổi khu vực
  const handleAreaChange = (area) => {
    if (area !== null) {
      // Check if area has valid coordinates
      if (mapViewRef.current && area.latitude && area.longitude) {
        mapViewRef.current.animateToRegion(
          {
            latitude: area.latitude,
            longitude: area.longitude,
            latitudeDelta: 5,
            longitudeDelta: 5,
          },
          1000
        );
      }
      setSelectedArea(area.id); // Chỉ set trực tiếp, không setIdCities nữa
      // Không cần setIdCities ở đây, useEffect sẽ tự cập nhật
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

  // Points phụ thuộc vào quốc gia và loại lễ hội
  const filteredPoints = useMemo(() => {
    if (!selectedCountry) {
      return points;
    }
    return points.filter((point) => {
      if (selectedCountry && point.countryId !== selectedCountry) {
        return false;
      }
      // Chỉ lọc theo idCities nếu đã chọn khu vực
      if (selectedArea && idCities && !idCities.map(String).includes(String(point.cityId))) {
        return false;
      }
      if (selectedCity && String(point.cityId) !== String(selectedCity)) {
        return false;
      }
      return true;
    });
  }, [points, selectedCountry, selectedArea, selectedCity, idCities]);

  // xử lý cuộn scroll
  const handleScroll = (event) => {
    const contentWidth = event.nativeEvent.contentSize.width;
    const scrollWidth = event.nativeEvent.layoutMeasurement.width;
    const scrollX = event.nativeEvent.contentOffset.x;

    setShowLeftArrow(scrollX > 0);
    setShowRightArrow(scrollX + scrollWidth < contentWidth - 2); // -2 để tránh lỗi làm tròn
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
    // const userId = await AsyncStorage.getItem("userToken");
    // if (userId) {
    //   const refBehavior = ref(database, `accounts/${userId}/behavior`);

    //   const dataUpdate = {
    //     content: content,
    //     location: [location],
    //   };

    //   await update(refBehavior, dataUpdate);
    //   // const snapshot = await get(userRef);
    //   // let existingData = snapshot.val();

    //   // // Kiểm tra xem location có tồn tại
    //   // let locationArray = existingData?.location || [];
    //   // // console.log(locationArray)

    //   // // Thêm địa điểm mới
    //   // if (!locationArray.includes(location)) {
    //   //   locationArray.push(location);

    //   //   const updatedLocation = {
    //   //     location: locationArray,
    //   //   };
    //   //   // Lưu lại dữ liệu đã cập nhật vào Firebase
    //   //   await update(userRef, updatedLocation);
    //   // }
    //   //   // Cập nhật lại dữ liệu
    //   //   if (content) {
    //   //   const updatedUserData = {
    //   //     content: content,
    //   //   };
    //   //   await update(userRef, updatedUserData);
    //   // }
    // }
    // Thông báo tùy thuộc vào type
    console.log(content, "mmmm");
    if (type === "post") {
      // 2. Chuyển về home hoặc tour
      // navigation.navigate("index");
      bottomSheetRef.current.close();
      router.replace({
        pathname: "/",
        params: { selectedCityId: location, content: content },
      });
    }
    if (type === "tour") {
      // 2. Chuyển về home hoặc tour
      // navigation.navigate("tour");
      bottomSheetRef.current.close();
      router.replace({
        pathname: "/tour",
        params: { selectedCityId: location, content: content },
      });
    }
  };

  const parseContent = (content) => {
    if (!content) return "";
    // Thay thế các thẻ xuống dòng thành \n trước khi loại bỏ HTML
    let text = content
      .replace(/<\s*br\s*\/?>/gi, "\n")
      .replace(/<\s*div\s*[^>]*>/gi, "\n")
      .replace(/<\s*\/div\s*>/gi, "\n")
      .replace(/<\s*p\s*[^>]*>/gi, "\n")
      .replace(/<\s*\/p\s*>/gi, "\n");
    // Loại bỏ tất cả thẻ HTML còn lại
    text = text.replace(/<[^>]+>/g, "");
    // Thay thế các entity HTML phổ biến
    text = text.replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
    // Chuẩn hóa: loại bỏ các dòng chỉ chứa khoảng trắng
    text = text.split('\n').map(line => line.trim()).filter(line => line.length > 0).join('\n');
    return text;
  };

  // selectedFestival && console.log("Selected Festival:", selectedFestival);
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        {/* <View style={styles.header}></View> */}
        {/* Map của Google Map */}
        <MapView style={styles.map} ref={mapViewRef} initialRegion={mapRegion}>
          {filteredPoints
            .filter((point) => {
              // Chỉ giữ lại điểm có tọa độ thực (khác 0,0)
              return (
                point.latitude &&
                point.longitude &&
                (point.latitude !== 0 || point.longitude !== 0) &&
                !isNaN(point.latitude) &&
                !isNaN(point.longitude)
              );
            })
            .map((point) => (
              <Marker
                key={`${point.countryId}_${point.cityId}_${point.id}`}
                coordinate={{
                  latitude: point.latitude,
                  longitude: point.longitude,
                }}
                title={point.title}
                pinColor={
                  point.type === "landmark"
                    ? "blue"
                    : point.type === "festival"
                    ? "red"
                    : "green"
                }
                onPress={() => openBottomSheet(point)}
              />
            ))}
        </MapView>
        {/* Chọn khu vực và lễ hội danh lam */}
        <RowComponent styles={{ marginTop: 10 }} justify="center">
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
            )
            }
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
              ) : areaData.length === 0 ? (
                <Text style={styles.warningText}>
                  Không có khu vực nào cho quốc gia này
                </Text>
              ) : (
                <FlatList
                  data={areaData}
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
        {/* Modal chọn thành phố */}
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
        {/* BottomSheet le hoi */}
        <BottomSheet hasDraggableIcon ref={bottomSheetRef} height={650}>
          {selectedFestival && (
            <View style={styles.sheetContent}>
              <Text style={styles.modalTitle}>{selectedFestival.title}</Text>
              <RowComponent>
                <Text style={{ fontWeight: "900" }}>Lưu ý: </Text>
                <Text style={{ color: "red" }}>
                  Hãy dùng 2 ngón để kéo nội dung lên
                </Text>
              </RowComponent>
              <View style={{ borderColor: "#ccc", borderWidth: 1 }}>
                <ScrollView
                  style={{
                    maxHeight: 150,
                    minHeight: 150,
                    marginBottom: 10,
                    padding: 5,
                  }}
                >
                  <Text style={styles.commentsText}>
                    {parseContent(selectedFestival.content)}
                  </Text>
                </ScrollView>
              </View>

              {/* Kiểm tra số lượng ảnh */}
              {Array.isArray(selectedFestival.images) ? (
                <ImageSlider
                  data={selectedFestival.images.map((image) => ({
                    img: image,
                  }))}
                  preview={false}
                  autoPlay={true}
                  caroselImageStyle={{
                    marginTop: 10,
                    width: 400,
                    height: 280,
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
                {selectedFestival.type === "landmark" ? (
                  <Text style={{ fontWeight: "bold" }}>Khung Giờ:</Text>
                ) : (
                  <Text style={{ fontWeight: "bold" }}>Ngày:</Text>
                )}{" "}
                {selectedFestival.start} -{selectedFestival.end}
              </Text>

              <View style={styles.buttonRow}>
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
                  <Icon name="file-text-o" size={20} color="#000" />
                  <Text style={styles.buttonText}>Bài viết</Text>
                </TouchableOpacity>

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
