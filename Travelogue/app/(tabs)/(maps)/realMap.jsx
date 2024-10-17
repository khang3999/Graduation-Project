import React, { useState, useRef, useEffect } from "react";
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
  // Dữ liệu các lễ hội
  const festivals = [
    {
      id: 1,
      title: "Lễ hội hoa Đà Lạt",
      latitude: 11.9429,
      longitude: 108.455,
      images: [
        "https://owa.bestprice.vn/images/articles/uploads/ruc-ro-le-hoi-hoa-o-da-lat-5ece160609332.jpg",
        "https://lh5.googleusercontent.com/p/AF1QipMzaDc46CVhoKxmQWR6TXqrnXhqea8n8RIQFUaV=w675-h390-n-k-no",
        "https://image.bnews.vn/MediaUpload/Org/2022/02/04/144341-danh-lam-thang-canh-vinh-ha-long.jpg",
      ],
      rating: 4.5,
      comments: "Lễ hội đẹp với nhiều loại hoa.",
      type: "festival",
      startDate: "2024-12-20",
      endDate: "2024-12-30",
    },
    {
      id: 2,
      title: "Vịnh Hạ Long",
      latitude: 20.9101,
      longitude: 107.1839,
      images: [
        "https://upload.wikimedia.org/wikipedia/commons/6/64/Halong_Bay_2.jpg",
      ],
      rating: 4.9,
      comments: "Một trong những kỳ quan thiên nhiên thế giới.",
      type: "landmark",
    },
    {
      id: 3,
      title: "Lễ hội Tết Nguyên Đán",
      latitude: 14.0583,
      longitude: 108.2772,
      images: [
        "https://www.thanhnien.vn/Uploaded/hongha/2022_01_27/viet-nam-7152-20220127165711491.jpeg",
      ],
      rating: 5.0,
      comments: "Lễ hội lớn nhất của người Việt.",
      type: "festival",
      startDate: "2025-01-25",
      endDate: "2025-02-02",
    },
    {
      id: 4,
      title: "Lễ hội Pháo Đài",
      latitude: 21.0285,
      longitude: 105.8542,
      images: [
        "https://www.vietnamonline.com/images/upload/2020/03/23/the-festivals-2020/3.jpg",
      ],
      rating: 4.2,
      comments: "Lễ hội văn hóa truyền thống ở Hà Nội.",
      type: "festival",
      startDate: "2024-10-01",
      endDate: "2024-10-05",
    },
  ];

  // // Dữ liệu các quốc gia
  // const countryData = [
  //   {
  //     id: "vietnam",
  //     label: "VietNam",
  //     latitude: 17.65005783136121,
  //     longitude: 105.40283940732479,
  //     image: "https://inuvdp.com/wp-content/uploads/2022/05/logo-la-co-01.jpg",
  //   },
  //   {
  //     id: "thailand",
  //     label: "Thailand",
  //     latitude: 15.87,
  //     longitude: 100.9925,
  //     image:
  //       "https://seeklogo.com/images/T/thailand-flag-logo-AC65995692-seeklogo.com.png",
  //   },
  //   {
  //     id: "japan",
  //     label: "Japan",
  //     latitude: 36.2048,
  //     longitude: 138.2529,
  //     image:
  //       "https://seeklogo.com/images/J/Japan-logo-95CBBFE790-seeklogo.com.png",
  //   },
  //   {
  //     id: "southkorea",
  //     label: "South Korea",
  //     latitude: 35.9078,
  //     longitude: 127.7669,
  //     image:
  //       "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQewfnFo0VDCF0JhqDv1GisWfqPULWJvjLJmw&s",
  //   },
  //   {
  //     id: "china",
  //     label: "China",
  //     latitude: 35.8617,
  //     longitude: 104.1954,
  //     image:
  //       "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR8A47nB2JnLyB9OFUXuTrjgPmRarECQjy_Vg&s",
  //   },
  // ];

  // const areaData = [
  //   // Các khu vực của Việt Nam
  //   {
  //     id: "region-all",
  //     label: "Tất cả khu vực",
  //     latitude: 17.65005783136121,
  //     longitude: 105.40283940732479,
  //     countryId: "vietnam",
  //   },
  //   {
  //     id: "region-northwest",
  //     label: "Tây Bắc Bộ",
  //     latitude: 21.3331,
  //     longitude: 103.9328,
  //     countryId: "vietnam",
  //   },
  //   {
  //     id: "region-northeast",
  //     label: "Đông Bắc Bộ",
  //     latitude: 22.3964,
  //     longitude: 104.0498,
  //     countryId: "vietnam",
  //   },
  //   {
  //     id: "region-redriverdelta",
  //     label: "Đồng bằng sông Hồng",
  //     latitude: 20.9123,
  //     longitude: 106.1553,
  //     countryId: "vietnam",
  //   },
  //   {
  //     id: "region-northcentral",
  //     label: "Bắc Trung Bộ",
  //     latitude: 18.2809,
  //     longitude: 105.6916,
  //     countryId: "vietnam",
  //   },
  //   {
  //     id: "region-southcentralcoast",
  //     label: "Duyên hải Nam Trung Bộ",
  //     latitude: 14.0583,
  //     longitude: 108.2772,
  //     countryId: "vietnam",
  //   },
  //   {
  //     id: "region-centralhighlands",
  //     label: "Tây Nguyên",
  //     latitude: 13.0820,
  //     longitude: 108.2772,
  //     countryId: "vietnam",
  //   },
  //   {
  //     id: "region-southeast",
  //     label: "Đông Nam Bộ",
  //     latitude: 10.8231,
  //     longitude: 106.6297,
  //     countryId: "vietnam",
  //   },
  //   {
  //     id: "region-mekongdelta",
  //     label: "Đồng bằng sông Cửu Long",
  //     latitude: 10.2251,
  //     longitude: 105.9640,
  //     countryId: "vietnam",
  //   },
  //   // Các khu vực của Thái Lan
  //   {
  //     id: "region-alls",
  //     label: "Tất cả khu vực",
  //     latitude: 15.87,
  //     longitude: 100.9925,
  //     countryId: "thailand",
  //   },
  //   {
  //     id: "region-bangkok",
  //     label: "Bangkok và Trung Thái",
  //     latitude: 13.7563,
  //     longitude: 100.5018,
  //     countryId: "thailand",
  //   },
  //   {
  //     id: "region-chiangmai",
  //     label: "Chiang Mai và Bắc Thái",
  //     latitude: 18.7061,
  //     longitude: 98.9817,
  //     countryId: "thailand",
  //   },
  //   // Các khu vực của Nhật Bản
  //   {
  //     id: "region-allx",
  //     label: "Tất cả khu vực",
  //     latitude: 36.2048,
  //     longitude: 138.2529,
  //     countryId: "japan",
  //   },
  //   {
  //     id: "region-kanto",
  //     label: "Khu vực Kanto",
  //     latitude: 35.6895,
  //     longitude: 139.6917,
  //     countryId: "japan",
  //   },
  //   {
  //     id: "region-kansai",
  //     label: "Khu vực Kansai",
  //     latitude: 34.6937,
  //     longitude: 135.5023,
  //     countryId: "japan",
  //   },
  //   // Các khu vực của Hàn Quốc
  //   {
  //     id: "dđregion-all",
  //     label: "Tất cả khu vực",
  //     latitude: 35.9078,
  //     longitude: 127.7669,
  //     countryId: "southkorea",
  //   },
  //   {
  //     id: "region-seoul",
  //     label: "Seoul và Gyeonggi",
  //     latitude: 37.5665,
  //     longitude: 126.978,
  //     countryId: "southkorea",
  //   },
  //   {
  //     id: "region-busan",
  //     label: "Busan và Đông Nam Hàn",
  //     latitude: 35.1796,
  //     longitude: 129.0756,
  //     countryId: "southkorea",
  //   },
  //   // Các khu vực của Trung Quốc
  //   {
  //     id: "region-allxx",
  //     label: "Tất cả khu vực",
  //     latitude: 35.8617,
  //     longitude: 104.1954,
  //     countryId: "china",
  //   },
  //   {
  //     id: "region-beijing",
  //     label: "Bắc Kinh và Bắc Trung Quốc",
  //     latitude: 39.9042,
  //     longitude: 116.4074,
  //     countryId: "china",
  //   },
  //   {
  //     id: "region-shenzhen",
  //     label: "Thâm Quyến và Nam Trung Quốc",
  //     latitude: 22.3964,
  //     longitude: 114.1095,
  //     countryId: "china",
  //   },
  // ];
  //Lấu dữ liệu từ firebase về quốc gia
  
  useEffect(() => {
    const countriesRef = ref(database, 'countries');
    const areaRef = ref(database, 'areas');
    onValue(countriesRef, (snapshot) => {
      const data = snapshot.val() || {};
      // console.log(data);
      // Chuyển từ đối tượng thành mảng
      const formattedDataCountry = Object.keys(data).map(key => ({ id: key, ...data[key] }));
      // console.log(formattedDataCountry);
      setCountryData(formattedDataCountry);
      // console.log("Country Data:", countryData);
    });
    onValue(areaRef, (snapshot) => {
      const data = snapshot.val() || {};
      // console.log(data);
      // Chuyển từ đối tượng thành mảng
      const formattedDataAreas = Object.keys(data).map(key => ({ id: key, ...data[key] }));
      // console.log(formattedDataAreas);
      setAreaData(formattedDataAreas);
    });

  }, []);

  const mapViewRef = useRef(null);
  const [mapLat] = useState(16.494413736992392);
  const [mapLong] = useState( 105.18357904627919);
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
  const [selectedFestivalType, setSelectedFestivalType] = useState(null);
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
        mapViewRef.current.animateToRegion({
          latitude: latitude,
          longitude: longitude,
          latitudeDelta: 8.0,
          longitudeDelta: 10,
        }, 1000); 
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
        mapViewRef.current.animateToRegion({
          latitude: latitude,
          longitude: longitude,
          latitudeDelta: 5,
          longitudeDelta: 5,
        }, 1000);
      }
      setSelectedArea(area.id);
      // console.log("Selected Area:", area.label);
    }
    setModalVisibleArea(false);
  };


  // Thay đổi type lễ hội
  const handleFestivalChange = (value, index) => {
    // console.log("Số vị trí:", value);
    // console.log("Số index:", index);
    setSelectedFestivalType(index);
    // console.log("Selected Country:", selectedFestivalType);

    setmodalFestivalType(false);
  };

  const openBottomSheet = (festival) => {
    setSelectedFestival(festival);
    if (bottomSheetRef.current) {
      bottomSheetRef.current.show();
    }
  };
  // Search lễ hội theo type
  const filteredFestivals = selectedFestivalType
    ? festivals.filter(
        (festival) =>
          festival.type ===
          festivalTypeOptions[selectedFestivalType].type.toLowerCase()
      )
    : festivals;
  // Search khu vực theo id của quốc gia

  // console.log("Selected Country:", selectedCountry);

  // console.log("Filtered Area Data:", filteredAreaData);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image source={require("@/assets/images/logo.png")} />
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
        <MapView
        style={styles.map}
        ref={mapViewRef}
        initialRegion={mapRegion} 
        >
          {filteredFestivals.map((festival) => (
            <Marker
              key={festival.id}
              coordinate={{
                latitude: festival.latitude,
                longitude: festival.longitude,
              }}
              title={festival.title}
              pinColor={festival.type === "landmark" ?  "blue" : "red"}
          //     pinColor = festival.type === "landmark" ? "blue" 
          // : festival.type === "city" ? "green"
          // : "red";
              onPress={(e) => {
                e.persist();
                openBottomSheet(festival);
              }}
            />
          ))}
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
                    ? festivalTypeOptions[selectedFestivalType].label
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