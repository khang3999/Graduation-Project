import React, { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Modal,
  ActivityIndicator,
  TouchableOpacity,
  Image,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import CartItem from "@/components/cart/CartItem";
import { ref } from "firebase/database";
import { database, onValue } from "@/firebase/firebaseConfig";
import RowComponent from "../RowComponent";
import LottieView from "lottie-react-native";
import MapView, { Marker } from "react-native-maps";
import { appColors } from "@/constants/appColors";
import { formatAddress } from "@/utils/formatAddress";
import SectionComponent from "../SectionComponent";
import Carousel from "react-native-reanimated-carousel";

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
  }

  const [festivalData, setFestivalData] = useState<PointData[]>([]);
  const [landmarkData, setLandmarkData] = useState<PointData[]>([]);
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

  const handleMap = async (item: PointData) => {
    console.log("))))))");
    console.log(item);
    const { id, title, latitude, longitude, images, end, start, content } =
      item;
    console.log(id, title, latitude, longitude, images, end, start, content);
    setLoadingLocation(true);
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
      if (data && data.address) {
        const addressFormat = formatAddress(data.address);
        setSelectedLocation({
          title,
          content,
          images,
          end,
          start,
          id,
          latitude,
          longitude,
          address: addressFormat,
        });
        mapViewRef.current?.animateToRegion({
          latitude,
          longitude,
          latitudeDelta: 0.00922,
          longitudeDelta: 0.00421,
        });

        setLoadingLocation(false);
      } else {
        setLoadingLocation(false);
        alert("Không tìm thấy thông tin vị trí.");
      }
    } catch (error) {
      setLoadingLocation(false);
      alert("Có lỗi xảy ra khi lấy thông tin vị trí.");
    }
  };

  useEffect(() => {
    // Lấy dữ liệu từ firebase
    const refFestival = ref(
      database,
      `points/${cities.id_country}/festival/${cities.id_city}`
    );
    const refLandmark = ref(
      database,
      `points/${cities.id_country}/landmark/${cities.id_city}`
    );
    onValue(refFestival, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const formattedData = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setFestivalData(formattedData);
      }
    });

    onValue(refLandmark, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const formattedData = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setLandmarkData(formattedData);
      }
    });
  }, [cities.id_country, cities.id_city]);
  //   console.log(festivalData);
  //   console.log(landmarkData);
  const handleFestivalModal = (item: PointData) => {
    console.log("Festival", item);
    handleMap(item);
    setModalVisibleMap(true);
  };
  const handleLandmarkModal = (item: PointData) => {
    console.log("Landmark", item);
    handleMap(item);
    setModalVisibleMap(true);
  };
  console.log(selectedLocation);
  return (
    <View style={styles.container}>
      {/* Phần trên */}
      <View style={styles.topSection}>
        <Text style={styles.topText}>ghjsdg</Text>
      </View>
      {/* Phần dưới, chia làm 2 phần */}
      <View style={styles.bottomSection}>
        <View style={styles.leftItem}>
          <Text style={styles.itemTitle}>Lễ Hội</Text>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {festivalData.map((item, index) => (
              <CartItem
                onPress={() => handleFestivalModal(item)}
                key={item.id}
                title={item.title}
              />
            ))}
          </ScrollView>
        </View>
        <View style={styles.rightItem}>
          <Text style={styles.itemTitle}>Địa Điểm</Text>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {landmarkData.map((item, index) => (
              <CartItem
                onPress={() => {
                  handleLandmarkModal(item);
                }}
                key={index}
                title={item.title}
              />
            ))}
          </ScrollView>
        </View>
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
          <RowComponent>
            <Text
              style={[styles.modalTitle, { marginBottom: 10 }]}
              numberOfLines={1}
            >
              Chi tiết: <Text style={{color: 'red'}}>{selectedLocation?.title}</Text>
            </Text>
          </RowComponent>

          <ScrollView contentContainerStyle={{ flex: 1 }}>
            <View style={{ height: 550 }}>
              <MapView
                style={styles.map}
                initialRegion={region}
                onRegionChangeComplete={setRegion}
                mapType="hybrid"
                ref={mapViewRef}
                scrollEnabled={true}
                zoomEnabled={true}
              >
                {selectedLocation && (
                  <Marker
                    coordinate={{
                      latitude: selectedLocation.latitude,
                      longitude: selectedLocation.longitude,
                    }}
                    title={selectedLocation.title}
                  />
                )}
              </MapView>
              {loadingLocation && (
                <View style={styles.loadingOverlay}>
                  <ActivityIndicator size="large" color={appColors.danger} />
                </View>
              )}

              {/* Thong tin */}
              <SectionComponent>
                {selectedLocation ? (
                  <>
                    <Text
                      style={{
                        textAlign: "center",
                        marginTop: 10,
                        fontWeight: "bold",
                        marginBottom: 10,
                        fontSize: 14,
                      }}
                    >
                      {selectedLocation?.title}
                    </Text>
                    <ScrollView contentContainerStyle={{ width: "100%" }}>
                      <SectionComponent styles={{ height: 220 }}>
                        {selectedLocation?.images &&
                        selectedLocation.images.length > 0 ? (
                          <Carousel
                            data={
                              Array.isArray(selectedLocation.images)
                                ? selectedLocation.images
                                : []
                            }
                            renderItem={({ item }) => (
                              <View style={styles.carouselItem}>
                                <Image
                                  source={{ uri: item }}
                                  style={styles.carouselImage}
                                />
                              </View>
                            )}
                            autoPlay={selectedLocation.images.length > 1}
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
                            <Text>{selectedLocation.start}</Text>
                          </RowComponent>
                          <RowComponent styles={{ marginLeft: 70 }}>
                            <Text style={{ fontSize: 14, fontWeight: "bold" }}>
                              Kết thúc:{" "}
                            </Text>
                            <Text>{selectedLocation.end}</Text>
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
                            Address:{" "}
                          </Text>
                          <Text
                            style={{ fontSize: 14, flex: 1, flexWrap: "wrap" }}
                          >
                            {selectedLocation?.address}
                          </Text>
                        </RowComponent>
                      </SectionComponent>
                    </ScrollView>
                  </>
                ) : (
                  <View>{/* Add Skeleton loaders here */}</View>
                )}
              </SectionComponent>
            </View>

            <RowComponent
              justify="space-around"
              styles={{ flex: 1, marginTop: 10 }}
            >
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
            </RowComponent>
          </ScrollView>
        </View>
      </Modal>
    </View>
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
    backgroundColor: appColors.primary,
    borderRadius: 8,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 15,
    position: "absolute",
    bottom: 10,
    left: "36%",
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
    height: 350,
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
