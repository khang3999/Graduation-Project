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
import { SectionComponent } from "@/components";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { onValue, ref } from "firebase/database";
import { database } from "@/firebase/firebaseConfig";
import AntDesign from "react-native-vector-icons/AntDesign";
import Icon from 'react-native-vector-icons/FontAwesome';

const windowWidth = Dimensions.get("window").width;

const ReviewPostUser = ({
  locs,
  contents,
  imgs,
}: {
  locs: any;
  contents: any;
  imgs: any;
}) => {
  const images = typeof imgs === "string" ? JSON.parse(imgs) : imgs;
  const locations = typeof locs === "string" ? JSON.parse(locs) : locs;
  const [avatar, setAvatar] = useState(
    "https://firebasestorage.googleapis.com/v0/b/travelogue-abb82.appspot.com/o/defaultAvatar%2Favatar.png?alt=media&token=1d512fe7-5ddd-4a3e-b675-ae0948023964"
  );
  const [fullname, setFullname] = useState("");

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
          <TouchableOpacity
            delayPressOut={50}
          >
            <Icon
              name={"bookmark-o"}
              size={24}
              color={"blac"}
            />
          </TouchableOpacity>
        </View>
      </View>

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
});

export default ReviewPostUser;
