import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Modal,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import CartItem from "@/components/cart/CartItem";
import { ref } from "firebase/database";
import { database, get, onValue } from "@/firebase/firebaseConfig";
import RowComponent from "../RowComponent";
import MapView, { Marker } from "react-native-maps";
import { appColors } from "@/constants/appColors";
import { formatAddress } from "@/utils/formatAddress";
import SectionComponent from "../SectionComponent";
import Carousel from "react-native-reanimated-carousel";
import DetailPointSkeleton from "../skeletons/DetailPointSkeleton";
import RenderHTML from 'react-native-render-html';
import { iconColors } from "@/assets/colors";
const contentWidth = Dimensions.get('window').width;
const ListPoints = ({
  cities,
}: {
  cities: { id_country: string; id_city: string };
}) => {
  interface PointData {
    title: string;
    content: string;
    images: string[];
    latitude: number;
    longitude: number;
    id: string;
    end: string;
    start: string;
    address?: string;
    geocode: any[];
  }

  const [festivalData, setFestivalData] = useState<PointData[]>([]);
  const [landmarkData, setLandmarkData] = useState<PointData[]>([]);
  const [pointsListData, setPointsListData] = useState<any[]>([]);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<PointData | null>(
    null
  );
  const mapViewRef = useRef<MapView>(null);
  const [modalVisibleMap, setModalVisibleMap] = useState(false);
  const [region, setRegion] = useState({
    latitude: 17.65005783136121,
    longitude: 106.40283940732479,
    latitudeDelta: 9,
    longitudeDelta: 9,
  });

  const handleMap = async (item: any) => {
    console.log("))))))");
    try {
      const geoLat = (item.geocode?.[0]?.latitude) == 0 ? region.latitude : item.geocode?.[0]?.latitude
      const geoLon = (item.geocode?.[0]?.longitude) == 0 ? region.longitude : item.geocode?.[0]?.longitude

      // if (data && data.address) {
      // const addressFormat = formatAddress(data.address);
      setSelectedLocation(item);
      setLoadingLocation(false);
      if (geoLat == 0 && geoLon == 0) {
        alert("Không tìm thấy thông tin vị trí.");
      } else {
        mapViewRef.current?.animateToRegion({
          latitude: geoLat,
          longitude: geoLon,
          latitudeDelta: 0.00922,
          longitudeDelta: 0.00421,
        });
      }
    } catch (error) {
      setLoadingLocation(false);
      alert("Có lỗi xảy ra khi lấy thông tin vị trí.");
    }
  };

  const fetchPointsList = useCallback(async () => {
    try {
      const refPointsData = ref(database, `pointsNew/${cities.id_country}/${cities.id_city}`);
      const snapshot = await get(refPointsData)
      if (snapshot.exists()) {
        const pointsList = snapshot.val();
        const pointsListArray = Object.values(pointsList)
        console.log(pointsListArray);
        setPointsListData(pointsListArray)
      } else {
        console.log("Points list snapshot don't exists");
      }
    } catch (error) {
      console.error("Error fetching list points:", error);
    }


  }, [cities.id_country, cities.id_city])
  useEffect(() => {
    // Lấy dữ liệu từ firebase
    fetchPointsList()
  }, [cities.id_country, cities.id_city]);
  //   console.log(festivalData);
  //   console.log(landmarkData);
  const handleFestivalModal = async (item: PointData) => {
    console.log("Festival", item);
    await handleMap(item);
    setModalVisibleMap(true);
  };
  const handleLandmarkModal = (item: PointData) => {
    console.log("Landmark", item);
    handleMap(item);
    setModalVisibleMap(true);
  };
  console.log(selectedLocation);
  return (
    <>
      <View style={{}}>
        <FlatList
          data={pointsListData}
          horizontal
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 20 }}

          renderItem={({ item, index }) =>
            <CartItem
              onPress={() => {
                handleFestivalModal(item);
              }}
              key={index}
              data={item}
            />}
          ItemSeparatorComponent={() => <View style={{ width: 20 }} />}
          initialNumToRender={4}
          maxToRenderPerBatch={2}
        />

        <Text style={{ fontWeight: '500' }}>
          Tổng cộng: {pointsListData.length} địa điểm
        </Text>
      </View>
      {/* Modal */}
      <Modal
        style={{ flex: 1 }}
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
        <View style={{ flex: 1 }}>
          <Text style={{
            textAlign: 'center', width: '100%', padding: 10,
            fontWeight: "bold",
            fontSize: 18,
            backgroundColor: iconColors.green2
          }}>{selectedLocation?.title}</Text>

          {/* <ScrollView contentContainerStyle={{ flex: 1 }}> */}
          <View style={{}}>
            <MapView
              style={styles.map}
              initialRegion={region}
              onRegionChangeComplete={setRegion}
              mapType="hybrid"
              ref={mapViewRef}
              scrollEnabled={true}
              zoomEnabled={true}
            >
              {selectedLocation?.geocode?.[0]?.latitude != 0 && selectedLocation?.geocode?.[0]?.longitude != 0 && (
                <Marker
                  coordinate={{
                    latitude: selectedLocation?.geocode[0].latitude,
                    longitude: selectedLocation?.geocode[0].longitude,
                  }}
                  title={selectedLocation?.title}
                />
              )}
            </MapView>
            {loadingLocation && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color={appColors.danger} />
              </View>
            )}
          </View>

          {/* Thong tin */}
          <SectionComponent styles={{ flex: 11 }}>
            {selectedLocation ? (
              <>
                {/* <Text
                  style={{
                    textAlign: "center",
                    marginTop: 10,
                    fontWeight: "bold",
                    marginBottom: 10,
                    fontSize: 16,
                  }}
                >
                  {selectedLocation?.title}
                </Text> */}
                <ScrollView contentContainerStyle={{ width: "100%", paddingVertical: 20 }}>
                  <SectionComponent styles={{ height: 240 }}>
                    {selectedLocation?.images &&
                      selectedLocation?.images.length > 0 ? (
                      <Carousel
                        data={
                          Array.isArray(selectedLocation?.images)
                            ? selectedLocation?.images
                            : []
                        }
                        renderItem={({ item }) => (
                          <View style={styles.carouselItem}>
                            <Image
                              source={{ uri: item || "https://mediatech.vn/assets/images/imgstd.jpg" }}
                              style={styles.carouselImage}
                            />
                          </View>
                        )}
                        autoPlay={selectedLocation?.images.length > 1}
                        width={350}
                      />
                    ) : (
                      <Text>No images available</Text>
                    )}
                  </SectionComponent>

                  <SectionComponent>
                    <RowComponent>
                      <RowComponent>
                        <Text style={{ fontSize: 14, fontWeight: "bold" }}>
                          Bắt đầu:{" "}
                        </Text>
                        <Text>{selectedLocation?.start}</Text>
                      </RowComponent>
                      <RowComponent styles={{ marginLeft: 70 }}>
                        <Text style={{ fontSize: 14, fontWeight: "bold" }}>
                          Kết thúc:{" "}
                        </Text>
                        <Text>{selectedLocation?.end}</Text>
                      </RowComponent>
                    </RowComponent>
                    <RowComponent
                      styles={{
                        marginTop: 10,
                        flexDirection: "row",
                        alignItems: "flex-start",
                      }}
                    >
                      <Text style={{ fontSize: 14, fontWeight: "bold" }}>
                        Địa chỉ:{" "}
                      </Text>
                      <Text
                        style={{ fontSize: 14, flex: 1, flexWrap: "wrap" }}
                      >
                        {selectedLocation?.address}
                      </Text>
                    </RowComponent >

                    <RowComponent styles={{
                      marginTop: 10,
                      flexDirection: "row",
                      alignItems: "flex-start",
                    }}>
                      <RenderHTML
                        contentWidth={contentWidth}
                        source={{ html: selectedLocation?.content }}
                      />
                    </RowComponent>
                  </SectionComponent>
                </ScrollView>
              </>
            ) : (
              // Skeleton loading
              <>
                <DetailPointSkeleton />
              </>
            )}
          </SectionComponent>
          <View style={{ flexDirection: 'row', justifyContent: 'center', padding: 10 }}>
            <TouchableOpacity
              style={[styles.closeButton]}
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
          </View>

          {/* </ScrollView> */}
          {/* <RowComponent
            justify="space-around"
            styles={{ flex: 1, marginTop: 10 }}
          > */}

          {/* </RowComponent> */}
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
  topSection: {
    flex: 1,
    width: "100%",
    backgroundColor: "#ccc",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    marginBottom: 20,
    padding: 10,
  },
  topText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  bottomSection: {
    flex: 1,
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
  },
  leftItem: {
    flex: 1,
    backgroundColor: "#f8f8f8",
    justifyContent: "flex-start",
    alignItems: "center",
    padding: 15,
    marginRight: 10,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  rightItem: {
    flex: 1,
    backgroundColor: "#f8f8f8",
    justifyContent: "flex-start",
    alignItems: "center",
    padding: 15,
    marginLeft: 10,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  scrollContent: {
    paddingBottom: 20,
    alignItems: "center",
    padding: 10,
  },
  cartItem: {
    width: "100%",
    backgroundColor: "#fff",
    padding: 30,
    marginBottom: 15,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  cartItemText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  closeButton: {
    width: 120,
    height: 40,
    backgroundColor: iconColors.green1,
    borderRadius: 8,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: 350,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  map: {
    width: "100%",
    height: 300,
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
    padding: 10,
  },
  carouselItem: {
    width: 300,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: "auto",
  },
  carouselImage: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
});

export default ListPoints;
