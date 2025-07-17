import { database, get, onValue } from "@/firebase/firebaseConfig";
import { useNavigationState, useRoute } from "@react-navigation/native";
import { router, useFocusEffect } from "expo-router";
import { ref, runTransaction } from "firebase/database";
import { ArrowLeft } from "iconsax-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import formatScore from "@/utils/formatScore";
import { MaterialIcons } from "@expo/vector-icons";
import ListPoints from "@/components/listPoints/ListPoints";
import GalleryPosts from "@/components/gallery/GalleryPosts";

const { width } = Dimensions.get("window");
const getValidImageUri = (uri?: string | null) =>
  uri && uri.trim() !== ""
    ? uri
    : "https://mediatech.vn/assets/images/imgstd.jpg";
const GalleryCities = () => {
  const [selectedTab, setSelectedTab] = useState("Chung");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showFullText, setShowFullText] = useState(false);
  const [isTextTruncated, setIsTextTruncated] = useState(false);
  const route = useRoute();
  const { idCity, idCountry, idArea }: any = route.params;
  const cities = { id_city: idCity, id_country: idCountry };
  const [dataCity, setDataCity] = useState<any>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const [images, setImages] = useState<string[]>([])

  // useEffect(() => {
  //   const countryRef = ref(database, `cities/${idCountry}`);
  //   onValue(countryRef, (snapshot) => {
  //     const countryData = snapshot.val();
  //     if (countryData) {
  //       let cityData = null;
  //       for (const area in countryData) {
  //         if (countryData[area][idCity]) {
  //           cityData = countryData[area][idCity];
  //           break;
  //         }
  //       }
  //       setDataCity(cityData);
  //     }
  //   });
  // }, [idCity, idCountry]);

  const fetchCityData = useCallback(async (idCity: string, idCountry: string) => {
    try {
      const countryRef = ref(database, `cities/${idCountry}`);
      const snapshot = await get(countryRef)
      if (snapshot.exists()) {
        const countryDataWithArea = snapshot.val();
        let cityData = null;
        let images: any[] = []
        for (const area in countryDataWithArea) {
          if (countryDataWithArea[area][idCity]) {
            cityData = countryDataWithArea[area][idCity];
            images.push(...cityData.defaultImages)

            const postImages: any[] = cityData.postImages && Object.values(cityData.postImages?.posts) // Mảng các bài viết
            const tourImages: any[] = cityData.tourImages && Object.values(cityData.tourImages.tours) // Mảng các tour

            postImages?.forEach(post => {
              images.push(...post.images)
            });
            tourImages?.forEach(tour => {
              images.push(...tour.images)
            });
            break;
          }
        }
        setImages(images)
        setDataCity(cityData);
      } else {
        console.log("Gallery city: No trending city data found.");
      }
    } catch (error) {
      console.error("Error fetching City data:", error);
    }
  }, [])

  useEffect(() => {
    fetchCityData(idCity, idCountry)
  }, [idCity, idCountry, fetchCityData]);

  useEffect(() => {
    if (dataCity?.defaultImages?.length > 0) {
      let index = 0;
      setSelectedImage(dataCity.defaultImages[0]);
      const interval = setInterval(() => {
        index = (index + 1) % dataCity.defaultImages.length;
        setSelectedImage(dataCity.defaultImages[index]);
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [dataCity]);

  useEffect(() => {
    if (!selectedImage || !dataCity?.defaultImages) return;
    const idx = dataCity.defaultImages.indexOf(selectedImage);
    if (idx !== -1 && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ x: idx * 156, animated: true });
    }
  }, [selectedImage]);

  // // console.log("City Data:", dataCity);
  // const upScoreTrending = useCallback(async () => {
  //   try {
  //     const cityRef = ref(database, `cities/${idCountry}/${idArea}/${idCity}/scores/`);

  //     await runTransaction(cityRef, (currentValue) => {
  //       return (currentValue || 0) + 1;
  //     });
  //   } catch (error) {
  //     console.error("Up score treding failed: ", error);
  //   }
  // }, [])
  // Tăng scores trending mỗi khi màn hình được mở
  useFocusEffect(
    useCallback(() => {
      const upScoreTrending = async () => {
        try {
          const cityRef = ref(database, `cities/${idCountry}/${idArea}/${idCity}/scores/`);
          await runTransaction(cityRef, (currentValue) => {
            return (currentValue || 0) + 1;
          });
        } catch (error) {
          console.error("Up score trending failed: ", error);
        }
      };
      upScoreTrending();
      return () => {
        console.log("Screen unfocused!");
      };
    }, [idCountry, idArea, idCity])
  );

  const handleTextLayout = (e: any) => {
    const { lines } = e.nativeEvent;
    if (lines.length > 14) setIsTextTruncated(true);
  };

  const renderTabContent = () => {
    switch (selectedTab) {
      case "Chung":
        return (
          <>
            <ScrollView
              horizontal
              style={styles.imageScroll}
              showsHorizontalScrollIndicator={false}
              ref={scrollViewRef}
            >
              {images.map((img: string, i: number) => (
                <TouchableOpacity key={i} onPress={() => setSelectedImage(img)}>
                  <Image
                    source={{ uri: getValidImageUri(img) }}
                    style={[
                      styles.detailImage,
                      selectedImage === img && styles.detailImageActive,
                    ]}
                  />
                </TouchableOpacity>
              ))}
            </ScrollView >
            <View style={styles.detailsContainer}>
              <Text style={styles.detailsTitle}>Thông tin chi tiết</Text>

              {/* Text wrapper with gradient hint */}
              <View style={styles.textWrapper}>
                <ScrollView style={styles.scrollViewContainer}>
                  <Text
                    style={styles.detailsText}
                    numberOfLines={showFullText ? undefined : 14}
                    onTextLayout={handleTextLayout}
                  >
                    {dataCity?.information}
                  </Text>
                </ScrollView>
                {/* Gradient fade to hint more content */}
                {isTextTruncated && !showFullText && (
                  <LinearGradient
                    colors={["transparent", "#f9f9f9"]}
                    style={styles.fadeOverlay}
                  />
                )}
              </View>

              {/* Read more / collapse buttons */}
              {isTextTruncated && !showFullText && (
                <TouchableOpacity onPress={() => setShowFullText(true)}>
                  <Text style={styles.readMore}>Đọc thêm</Text>
                </TouchableOpacity>
              )}
              {showFullText && (
                <TouchableOpacity onPress={() => setShowFullText(false)}>
                  <Text style={styles.readMore}>Thu gọn</Text>
                </TouchableOpacity>
              )}
            </View>
          </>
        );
      case "Bài viết":
        return (
          <View style={{ padding: 20 }}>
            <GalleryPosts dataCity={dataCity} />
          </View>
        );
      case "Địa điểm":
        return <ListPoints cities={cities} />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.backButton}>
        <ArrowLeft size={26} color="#fff" onPress={() => router.back()} />
      </View>

      {selectedImage && (
        <Image
          source={{ uri: getValidImageUri(selectedImage) }}
          style={styles.headerImage}
        />
      )}

      <View style={styles.headerTextContainer}>
        <Text style={styles.title}>{dataCity?.value}</Text>
        <Text style={styles.subtitle}>
          {dataCity?.idCountry === "avietnam"
            ? "Việt Nam"
            : dataCity?.idCountry
              ? dataCity.idCountry.charAt(0).toUpperCase() +
              dataCity.idCountry.slice(1)
              : "Unknown"}
        </Text>
        <View style={styles.rating}>
          <Text style={styles.ratingText}>{formatScore(dataCity?.scores)}</Text>
          <MaterialIcons name="sports-score" size={16} color="#FF3300" />
        </View>
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.tabsContainer}>
          {["Chung", "Bài viết", "Địa điểm"].map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setSelectedTab(tab)}
              style={
                selectedTab === tab ? styles.tabActive : styles.tabInactive
              }
            >
              <Text
                style={
                  selectedTab === tab
                    ? styles.tabTextActive
                    : styles.tabTextInactive
                }
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <ScrollView style={styles.tabContent}>{renderTabContent()}</ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f9f9" },
  backButton: {
    position: "absolute",
    top: 45,
    left: 22,
    zIndex: 10,
    backgroundColor: "rgba(0,0,0,0.08)",
    borderRadius: 20,
    padding: 5,
  },
  headerImage: { width: "100%", height: "40%", resizeMode: "cover" },
  headerTextContainer: {
    position: "absolute",
    top: 100,
    alignSelf: "center",
    alignItems: "center",
    zIndex: 10,
  },
  title: {
    fontSize: 35,
    fontWeight: "bold",
    color: "#EEEEEE",
    textShadowColor: "#000",
    paddingHorizontal: 10,
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 2,
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 16,
    color: "#fff",
    textShadowColor: "#000",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 2,
  },
  rating: {
    marginTop: 6,
    backgroundColor: "white",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#EEEEEE",
    elevation: 5,
  },
  ratingText: {
    fontWeight: "bold",
    marginRight: 4,
    fontSize: 14,
    color: "#000",
  },

  contentContainer: {
    flex: 1,
    marginTop: -30,
    backgroundColor: "#f9f9f9",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 16,
    zIndex: 5,
  },
  tabsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginHorizontal: 20,
    backgroundColor: "#eee",
    borderRadius: 20,
    padding: 6,
  },
  tabInactive: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  tabActive: {
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  tabTextInactive: { color: "#999", fontWeight: "500" },
  tabTextActive: { color: "#333", fontWeight: "bold" },

  tabContent: { flex: 1 },
  imageScroll: { marginTop: 16, paddingHorizontal: 20 },
  detailImage: {
    width: 140,
    height: 140,
    borderRadius: 16,
    marginRight: 16,
    marginBottom: 10,
  },
  detailImageActive: { borderColor: "#00c4a9", borderWidth: 2 },
  detailsContainer: { paddingHorizontal: 20, marginTop: 10 },
  detailsTitle: { fontWeight: "bold", fontSize: 16, marginBottom: 6 },
  textWrapper: {
    position: "relative",
  },
  scrollViewContainer: {
    maxHeight: 230,
  },
  detailsText: { fontSize: 14, color: "#666" },
  fadeOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 50,
    justifyContent: "flex-end",
    alignItems: "center",
    zIndex: 10,
  },
  readMore: { color: "#008080", fontWeight: "600", marginTop: 6 },
  fadeIcon: { marginBottom: 4 },
});

export default GalleryCities;
