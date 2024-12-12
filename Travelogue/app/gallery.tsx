import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import React, { useEffect, useState } from "react";
import { useNavigationState, useRoute } from "@react-navigation/native";
import { List } from "react-native-paper";
import ListPoints from "@/components/listPoints/ListPoints";
import { database, onValue } from "@/firebase/firebaseConfig";
import { ref } from "firebase/database";
import { RowComponent, TextComponent } from "@/components";
import { ArrowLeft } from "iconsax-react-native";
import { router } from "expo-router";
import { appColors } from "@/constants/appColors";
import GalleryPosts from "@/components/gallery/GalleryPosts";

const Gallery = () => {
  const route = useRoute();
  const { idCity, idCountry }: any = route.params;
  const cities = {
    id_city: idCity,
    id_country: idCountry,
  };  
  console.log(cities);
  const [dataCity, setDataCity] = useState<any>([]);


  const navigationState = useNavigationState((state) => state);
  useEffect(() => {
    // In ra các màn hình trong stack
    console.log('Danh sách các màn hình trong stack:');
    navigationState.routes.forEach((route, index) => {
      console.log(`Màn hình ${index + 1}: ${route.name}`);
    });
  }, [navigationState]);

  //Lay id cua thanh pho va quoc gia
  useEffect(() => {
    const countryRef = ref(database, `cities/${idCountry}`);

    onValue(countryRef, (snapshot) => {
      const countryData = snapshot.val();
      if (countryData) {
        let cityData = null;

        // Duyệt qua các khu vực
        for (const area in countryData) {
          if (countryData[area][idCity]) {
            cityData = countryData[area][idCity];
            break;
          }
        }

        if (cityData) {
          // console.log(cityData);
          setDataCity(cityData);
        } else {
          console.log("City not found");
          setDataCity(null);
        }
      }
    });
  }, [idCity, idCountry]);
  // console.log(dataCity);
  const [tab, setTab] = useState("information");
  console.log(idCity, idCountry);
  return (
    <View style={styles.container}>
      {/* <RowComponent justify="flex-start" styles={{ padding: 10, marginLeft: -100 }} >
        <ArrowLeft
          size="32"
          onPress={() => {
            router.back();
          }}
          color="#000"
        />
        <TextComponent
          text="Khám phá"
          size={24}
          styles={{
            fontWeight: "800",
            margin: 5,
            marginLeft: "20%",
          }}
        />
      </RowComponent> */}
      <View style={{ backgroundColor: appColors.btnDay, width: 100, height: 45, borderRadius: 30, marginBottom: 10 }}>
        <Text style={{ textAlign: "center", lineHeight: 45, fontSize: 16, fontWeight: 'bold', color: appColors.white }}>
          {dataCity.name}
        </Text>
      </View>
      {/* Phần trên */}
      <View style={styles.topSection}>
        <GalleryPosts dataCity={dataCity} />
      </View>

      {/* Phần dưới */}
      <View style={styles.bottomSection}>
        <View style={styles.tabHeader}>
          {/* Information Tab */}
          <TouchableOpacity
            style={[styles.tab, tab === "information" && styles.activeTab]}
            onPress={() => setTab("information")}
          >
            <Text
              style={[
                styles.tabText,
                tab === "information" && styles.activeTabText,
              ]}
            >
              Thông tin
            </Text>
          </TouchableOpacity>

          {/* Featured Points Tab */}
          <TouchableOpacity
            style={[styles.tab, tab === "featured" && styles.activeTab]}
            onPress={() => setTab("featured")}
          >
            <Text
              style={[
                styles.tabText,
                tab === "featured" && styles.activeTabText,
              ]}
            >
              Địa điểm nổi bật
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content Section */}
        <View style={styles.content}>
          {tab === "information" ? (
            <View>
              {
                dataCity?.information ? (
                  <ScrollView>
                    <Text>{dataCity.information}</Text>
                  </ScrollView>
                ) : (
                  <Text>Không có thông tin</Text>
                )
              }
            </View>
          ) : (
            <ListPoints cities={cities} />
          )}
        </View>
      </View>
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
    flex: 0.7,
    width: "100%",
  },

  tabHeader: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#000",
  },
  tabText: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#666",
  },
  activeTabText: {
    color: "#000",
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    padding: 10,
  },
});

export default Gallery;
