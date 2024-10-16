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

const Map = () => {
  const [countryData, setCountryData] = useState([]);
  const [areaData, setAreaData] = useState([]);
  const [points, setPoints] = useState([]);

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

    onValue(countriesRef, (snapshot) => {
      const data = snapshot.val() || {};
      // console.log(data);
      // Chuyển từ đối tượng thành mảng
      const formattedDataCountry = Object.keys(data).map((key) => ({
        id: key,
        ...data[key],
      }));
      // console.log(formattedDataCountry);
      setCountryData(formattedDataCountry);
      // console.log("Country Data:", countryData);
    });
    onValue(areaRef, (snapshot) => {
      const data = snapshot.val() || {};
      // Chuyển từ đối tượng thành mảng
      const formattedDataAreas = Object.keys(data).map((key) => ({
        id: key,
        ...data[key],
      }));
      setAreaData(formattedDataAreas);
      console.log("Area Data:", areaData);
    });
    onValue(pointRef, (snapshot) => {
      const data = snapshot.val() || {};
      const formattedPoints = [];

      Object.keys(data).forEach((countryId) => {
        const countryPoints = data[countryId];
        Object.keys(countryPoints).forEach((type) => {
          const typePoints = countryPoints[type];
          Object.keys(typePoints).forEach((pointId) => {
            const point = typePoints[pointId];
            formattedPoints.push({
              id: `${countryId}_${type}_${pointId}`,
              countryId: countryId,
              cityId: pointId,
              type: type,
              ...point,
            });
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
  const [selectedFestival, setSelectedFestival] = useState(null);
  const [mapRegion, setMapRegion] = useState({
    latitude: mapLat,
    longitude: mapLong,
    latitudeDelta: 8,
    longitudeDelta: 10,
  });
  // Selected đất nước và khu vực
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedArea, setSelectedArea] = useState(null);
  const [selectedFestivalType, setSelectedFestivalType] = useState("all");
  // Modal
  const [modalVisibleCountry, setModalVisibleCountry] = useState(false);
  const [modalVisibleArea, setModalVisibleArea] = useState(false);
  const [modalFestivalType, setmodalFestivalType] = useState(false);
  const bottomSheetRef = useRef(null);
  //Xu ly lại chỗ khu vực phụ thuộc vào quốc gia
  const [filteredAreaData, setFilteredAreaData] = useState(areaData);

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

      // console.log("Selected Country:", country);
      // console.log("Selected Country id:", country.id);
    }

    setModalVisibleCountry(false);
  };

  useEffect(() => {
    if (selectedCountry) {
      // console.log("Selected Country:", selectedCountry);
      setFilteredAreaData(
        // console.log("Area Data:", areaData),
        areaData.filter((area) => area.countryId === selectedCountry)
      );
      // console.log("Filtered Area Data:", filteredAreaData);
      setSelectedArea(filteredAreaData.id);
      // console.log("Selected Area:", selectedArea);
    }
  }, [selectedCountry]);

  const handleAreaChange = (area) => {
    // const selectedAreaChosse = areaData.find((area) => area.id === area.id);
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

  // Thay đổi type lễ hội
  const handleFestivalChange = (value, index) => {
    setSelectedFestivalType(value.id);
    console.log("Selected type:", selectedFestivalType);

    setmodalFestivalType(false);
  };

  const openBottomSheet = (festival) => {
    setSelectedFestival(festival);
    if (bottomSheetRef.current) {
      bottomSheetRef.current.show();
    }
  };
  // Tính toán các điểm cần hiển thị dựa trên các bộ lọc
  const filteredPoints = useMemo(() => {
    return points.filter((point) => {
      console.log("_________________$_");
      console.log("Selected Country1:", selectedCountry);
      // Lọc theo quốc gia
      if (selectedCountry && point.countryId !== selectedCountry) {
        return false;
      }
      console.log("point:", point);
      // Lọc theo loại lễ hội
      if (selectedFestivalType) {
        // cho phép tất cả các loại
        if (selectedFestivalType === "all") {
          return true;
        }
        // chỉ cho phép các loại tương ứng
        if (point.type !== selectedFestivalType) {
          return false;
        }
      }
      return true;
    });
  }, [points, selectedCountry, selectedFestivalType]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image source={require("../../assets/images/logo.png")} />
          </View>
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
        </View>
        {/* Map của Google Map */}
        {/* <MapView
          style={styles.map}
          region={mapRegion}
          mapType="standard"
          onRegionChangeComplete={(region) => {
            // console.log("Latitude:", region.latitude);
            // console.log("Longitude:", region.longitude);
            setMapRegion(region);
          }}
        > */}
        <MapView style={styles.map} ref={mapViewRef} initialRegion={mapRegion}>
          {filteredPoints.map((point) => {
            console.log("pointhello:", point);

            for (const key in point) {
              if (point[key] && typeof point[key] === "object") {
                if (point[key].latitude && point[key].longitude) {
                  latitude = point[key].latitude;
                  longitude = point[key].longitude;
                  type = point.type;
                  start = point[key].start;
                  end = point[key].end;
                  title = point[key].title;
                  break;
                }
              }
            }
            // console.log("point.latitude:", latitude);
            // console.log("point.longitude:", longitude);
            // console.log("point.type:", type);
            // console.log("point.start:", start);
            // console.log("point.end:", end);
            // console.log("point.title:", title);

            // Chọn màu sắc cho Marker
            const pinColor =
              type === "landmark"
                ? "blue"
                : type === "festival"
                ? "red"
                : "green";

            return (
              <Marker
                key={point.id}
                coordinate={{
                  latitude: latitude,
                  longitude: longitude,
                }}
                title={title}
                pinColor={pinColor}
              />
            );
          })}
        </MapView>
        {/* Chọn khu vực và lễ hội danh lam */}
        <RowComponent justify="space-between">
          {/* khu vực */}
          <SectionComponent style={styles.addressButtonArea}>
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
                    ? areaData.find((area) => area.id === selectedArea)?.label
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
                  keyExtractor={(item) => item.id.toString()}
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
        {/* Modal chọn type lễ hội */}
        <Modal visible={modalFestivalType} transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Chọn thể loại</Text>
              <FlatList
                data={festivalTypeOptions}
                keyExtractor={(item) => item.id.toString()}
                style={styles.countryList}
                renderItem={({ item, index }) => (
                  <TouchableOpacity
                    style={styles.countryOption}
                    onPress={() => handleFestivalChange(item, index)}
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
        <BottomSheet hasDraggableIcon ref={bottomSheetRef} height={480}>
          {selectedFestival && (
            <View style={styles.sheetContent}>
              <Text style={styles.modalTitle}>{selectedFestival.title}</Text>
              <Text style={styles.ratingText}>
                Đánh giá: {selectedFestival.rating}{" "}
                <Icon name="star" size={16} color="#FFD700" />
              </Text>
              <Text style={styles.commentsText}>
                {selectedFestival.comments}
              </Text>

              {/* Kiểm tra số lượng ảnh */}
              {selectedFestival.images.length === 1 ? (
                // Th 1 ảnh
                <Image
                  style={styles.festivalImage}
                  source={{ uri: selectedFestival.images[0] }}
                  resizeMode="cover"
                />
              ) : (
                // Th Nhiều ảnh
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
                    resizeMode: "cover",
                    overflow: "hidden",
                  }}
                  indicatorContainerStyle={{
                    position: "absolute",
                    bottom: -15,
                  }}
                />
              )}
              {/*  */}
              <Text style={styles.dateText}>
                <Text style={{ fontWeight: "bold" }}>Ngày</Text>:{" "}
                {new Date(selectedFestival.startDate).toLocaleDateString()} -{" "}
                {new Date(selectedFestival.endDate).toLocaleDateString()}
              </Text>

              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.iconButton}>
                  <Icon name="file-text-o" size={20} color="#000" />
                  <Text style={styles.buttonText}>Bài viết</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.iconButton}>
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
  logoContainer: {
    marginRight: 5,
  },
  // Chọn khu vuc
  areaSelector: {
    backgroundColor: "#ccc",
    borderRadius: 30,
    height: 50,
    width: 160,
    marginTop: 95,
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
    marginTop: 95,
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
    marginTop: 10,
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
    padding: 30,
    borderRadius: 20,
  },
  festivalImage: {
    width: 400,
    height: 200,
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
});

export default Map;
