import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import Carousel from "react-native-reanimated-carousel";
import CommentButton from "@/components/buttons/CommentButton";
import SaveButton from "@/components/buttons/SaveButton";
import { Divider } from "react-native-paper";
import CheckedInChip from "@/components/chips/CheckedInChip";
import Markdown from "react-native-markdown-display";
import HeartButton from "@/components/buttons/HeartButton";
import { useLocalSearchParams } from "expo-router";
import { ScrollView } from "react-native-gesture-handler";
import { RowComponent, SectionComponent } from "@/components";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { onValue, ref } from "firebase/database";
import { database } from "@/firebase/firebaseConfig";
import AntDesign from "react-native-vector-icons/AntDesign";
import Icon from "react-native-vector-icons/FontAwesome";
import { Entypo } from "@expo/vector-icons";
import { appColors } from "@/constants/appColors";

const windowWidth = Dimensions.get("window").width;

const ReviewPostTour = ({ locs, contents, imgs, discount, money }: any) => {
  const images = imgs;
  const locations = locs;
  const [avatar, setAvatar] = useState(
    "https://firebasestorage.googleapis.com/v0/b/travelogue-abb82.appspot.com/o/defaultAvatar%2Favatar.png?alt=media&token=1d512fe7-5ddd-4a3e-b675-ae0948023964"
  );
  const [fullname, setFullname] = useState("");
  // const hashtags = hashs;
  useEffect(() => {
    const fetchUserData = async () => {
      //Lay avatar fullname id user
      const userId = await AsyncStorage.getItem("userToken");
      // console.log("userId:", userId);
      const userRef = ref(database, `accounts/${userId}`);
      onValue(userRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setAvatar(data.avatar);
          setFullname(data.fullname);
        }
      });
    };
    fetchUserData();
  }, []);

  const flattenLocations = (
    locations: { area_id: string; id: string; id_nuoc: string; name: string }[]
  ) => {
    return locations.map((location) => ({
      country: location.id_nuoc,
      locationCode: location.id,
      locationName: location.name,
    }));
  };

  const flattenImages = (
    images: {
      city: { area_id: string; id: string; id_nuoc: string; name: string };
      images: string[];
    }[]
  ) => {
    const flattenedArray: any[] = [];
    images.forEach((imageGroup) => {
      const { city, images } = imageGroup;
      images.forEach((imageUrl) => {
        // console.log("Image URL:", imageUrl);
        flattenedArray.push({
          country: city.id_nuoc,
          locationCode: city.id,
          cityName: city.name,
          imageUrl,
        });
      });
    });
    return flattenedArray;
  };

  const flattenedLocationsArray = flattenLocations(locations);
  const flattenedImagesArray = flattenImages(images);
  const dates = new Date();
  const formattedDate = `${dates.getDate()}/${
    dates.getMonth() + 1
  }/${dates.getFullYear()}`;

  const desc =
    typeof contents === "string"
      ? contents.replace(/<br>/g, "\n")
      : contents.join(" ").replace(/<br>/g, "\n");

  return (
    <ScrollView style={{ borderColor: "#ccc", borderWidth: 1 }}>
      {/* Post Header */}
      <View style={styles.headerContainer}>
        <View style={styles.row}>
          <Image source={{ uri: avatar }} style={styles.miniAvatar} />
          <View style={styles.column}>
            <Text style={styles.username}>{fullname}</Text>
            <Text style={styles.time}>{formattedDate}</Text>
          </View>
        </View>
      </View>

      {/* Post Images Carousel */}
      <Carousel
        pagingEnabled={true}
        loop={false}
        width={windowWidth}
        height={windowWidth}
        data={flattenedImagesArray}
        scrollAnimationDuration={300}
        renderItem={({ item, index }) => (
          <View style={styles.carouselItem}>
            <Image style={styles.posts} source={{ uri: item.imageUrl }} />
            <View style={styles.viewTextStyles}>
              <Text style={styles.carouselText}>
                {index + 1}/{flattenedImagesArray.length} - {item.cityName}
              </Text>
            </View>
          </View>
        )}
      />

      {/* Buttons */}
      <View>
        <View style={styles.buttonContainer}>
          <View style={styles.buttonRow}>
            <TouchableOpacity delayPressOut={50}>
              <AntDesign name={"hearto"} size={24} color={"black"} />
            </TouchableOpacity>
            <Text style={styles.totalLikes}> 0</Text>
            <CommentButton style={styles.buttonItem} />
          </View>
          {/* {hashtags && hashtags.map((hash: any) => {
              return (
                <TouchableOpacity key={hash} delayPressOut={50}>
                  <Text>{hash}</Text>
                </TouchableOpacity>
              );
            })} */}
        
        </View>
      </View>

      <RowComponent styles={{padding: 10}}>
      <TouchableOpacity delayPressOut={50}>
            <Icon name={"bookmark-o"} size={24} color={"blac"} />
          </TouchableOpacity>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={styles.ratingLabel}>Rating: </Text>
            <TouchableOpacity style={styles.ratingButton} >
              <Icon name="smile-o" size={40} color="black" />
              <Text style={styles.ratingValue}>
                0.0/5.0
              </Text>
            </TouchableOpacity>
          </View>
          {discount !== 0 ? (
            <View style={styles.priceBackground}>
              <View style={styles.priceWrap}>
                <Entypo
                  style={{ paddingHorizontal: 8 }}
                  name="price-tag"
                  size={24}
                  color="#824b24"
                />
                <View style={{ paddingRight: 10 }}>
                  <Text
                    style={{
                      textDecorationLine: "line-through",
                      color: "grey",
                    }}
                  >
                    {money.toLocaleString("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    })}
                  </Text>
                  <Text style={{ fontSize: 18 }}>
                    {(money - (money * discount) / 100).toLocaleString(
                      "vi-VN",
                      { style: "currency", currency: "VND" }
                    )}
                  </Text>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.priceBackground}>
              <View style={styles.priceWrap}>
                <Entypo
                  style={{ paddingHorizontal: 8 }}
                  name="price-tag"
                  size={24}
                  color="#824b24"
                />
                <View style={{ paddingRight: 10 }}>
                  <Text style={{ fontSize: 18 }}>
                    {money.toLocaleString("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    })}
                  </Text>
                </View>
              </View>
            </View>
          )}
      </RowComponent>

      {/* Location Chips */}
      <CheckedInChip items={flattenedLocationsArray} />

    

      {/* Post Description */}
      <View style={styles.descriptionContainer}>
        <Markdown>{desc}</Markdown>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  ratingTitle: {
    marginLeft: 10,
    fontWeight: "bold",
    fontSize: 20,
    color: "white",
    marginTop: 3,
  },
  ratingWrapper: {
    paddingVertical: 10,
    flexDirection: "column",
  },
  ratingLabel: { fontSize: 16, marginRight: 5, fontWeight: "bold" },
  ratingValue: { marginLeft: 10, fontWeight: "bold", marginTop: 10 },
  ratingButton: {
    flexDirection: "row",
  },
  ratingButtonWrapper: {
    marginHorizontal: 130,
    marginTop: 30,
    backgroundColor: "red",
    borderRadius: 10,
  },
  ratingButtonContainer: {
    marginLeft: 15,
    marginBottom: 10,
    width: 90,
  },
  headerContainer: {
    padding: 15,
  },
  row: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  miniAvatar: {
    width: 40,
    height: 40,
    borderRadius: 25,
    borderColor: "#ccc",
    borderWidth: 1,
  },
  totalLikes: {
    marginRight: 10,
    marginTop: 1,
    fontSize: 16,
    fontWeight: "bold",
  },
  username: {
    fontSize: 16,
    marginLeft: 10,
    fontWeight: "bold",
  },
  time: {
    marginLeft: 10,
    color: "grey",
  },
  column: {
    flexDirection: "column",
  },
  posts: {
    width: windowWidth,
    height: windowWidth,
  },
  carouselText: {
    color: "#fff",
    fontSize: 14,
    textAlign: "center",
  },
  divider: {
    marginVertical: 35,
  },
  carouselItem: {
    flex: 1,
    justifyContent: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
  },
  buttonRow: {
    flexDirection: "row",
    width: 150,
    paddingVertical: 6,
  },
  buttonItem: {
    alignItems: "center",
    marginHorizontal: 10,
  },
  viewTextStyles: {
    position: "absolute",
    backgroundColor: "#392613",
    top: 10,
    left: windowWidth - 150,
    borderRadius: 20,
    paddingHorizontal: 7,
  },
  descriptionContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  priceLabel: {
    fontSize: 20,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 50,
    paddingHorizontal: 10,
   
  },
  priceWrap: {
    flexDirection: "row",
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    height: 50,
    width: 150,
  },
  priceBackground: {
    position: "absolute",
    backgroundColor: "red",
    paddingLeft: 6,
    borderRadius: 10,
    bottom: 0,
    left: 220,
    borderWidth: 1,
    borderColor: appColors.gray3,
  },
});

export default ReviewPostTour;
