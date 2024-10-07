import { View, Text, StyleSheet, Image, Dimensions } from "react-native";
import React from "react";
import Carousel from "react-native-reanimated-carousel";
// import ActionBar from "@/components/ActionBar";
import LikeButton from "@/components/buttons/HeartButton";
import CommentButton from "@/components/buttons/CommentButton";
import SaveButton from "@/components/buttons/SaveButton";

const windowWidth = Dimensions.get("window").width;
const data = [
  {
    id: 1,
    post: require("@/assets/images/tom_post_1.png"),
  },
  {
    id: 2,
    post: require("@/assets/images/tom_post_2.png"),
  },
];
export default function PostsScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.row}>
          <Image
            source={require("@/assets/images/tom.png")}
            style={styles.miniAvatar}
          />
          <View style={styles.column}>
            <Text style={styles.username}>Tom</Text>
            <Text style={styles.time}>5 minutes ago</Text>
          </View>
        </View>
        <Text>:</Text>
      </View>
      <Carousel
        loop
        width={windowWidth}
        height={windowWidth}
        // mode="parallax"
        data={data}
        scrollAnimationDuration={500}
        renderItem={({ item }) => (
          <View style={styles.carouselItem}>
            <Image style={styles.posts} source={item.post} />
            <View style={styles.viewTextStyles}>
              <Text
                style={{ textAlign: "center", fontSize: 14, color: "#fff" }}
              >
                {item.id}/{data.length}
              </Text>
            </View>
          </View>
        )}
      />
      <View style={{marginBottom:200}}>
        <View style={styles.buttonContainer}>
          <View style={styles.buttonRow}>
            <LikeButton style={styles.buttonItem} />
            <CommentButton style={styles.buttonItem} />
          </View>
          <SaveButton style={styles.buttonItem} />
        </View>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
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
    left: windowWidth - 50,
    borderRadius: 20,
    paddingHorizontal: 7,
  },
  container: {
    flex: 1,
    backgroundColor: "yellow",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
  },
  miniAvatar: {
    width: 40,
    height: 40,
    borderRadius: 25,
    borderColor: "#ccc",
    borderWidth: 1,
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
});
