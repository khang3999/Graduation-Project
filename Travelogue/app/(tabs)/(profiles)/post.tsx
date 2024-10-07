import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from "react-native";
import React, { useCallback, useMemo, useState,  } from "react";
import Carousel from "react-native-reanimated-carousel";
// import ActionBar from "@/components/ActionBar";
import LikeButton from "@/components/buttons/HeartButton";
import CommentButton from "@/components/buttons/CommentButton";
import SaveButton from "@/components/buttons/SaveButton";
import { Divider } from 'react-native-paper';

const windowWidth = Dimensions.get("window").width;
type Post = {
  id: number;
  image: any; // Change this to ImageSourcePropType if you have specific images from react-native types
};

type PostData = {
  id: number;
  avatar: any; // Change to ImageSourcePropType if needed
  username: string;
  time: string;
  posts: Post[];
  description: string;
};

const data: PostData[] = [
  {
    id: 1,
    avatar: require("@/assets/images/tom.png"),
    username: "Tom",
    time: "5 minutes ago",
    posts: [
      { id: 1, image: require("@/assets/images/tom_post_1.png") },
      { id: 2, image: require("@/assets/images/tom_post_2.png") },
    ],
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
  },
  
  
];

const maxLength = 100;

type PostItemProps = {
  item: PostData;
  showFullDescription: boolean;
  toggleDescription: () => void;
};

const PostItem: React.FC<PostItemProps> = ({ item, showFullDescription, toggleDescription }) => {
  return(
  <View key={item.id}>
        <View style={styles.row}>
          <View style={styles.row}>
            <Image source={item.avatar} style={styles.miniAvatar} />
            <View style={styles.column}>
              <Text style={styles.username}>{item.username}</Text>
              <Text style={styles.time}>{item.time}</Text>
            </View>
          </View>
          <Text>:</Text>
        </View>
        <Carousel     
        panGestureHandlerProps={{
          activeOffsetX: [-10, 10],
        }}
        pagingEnabled={true}
          loop={false}
          width={windowWidth}
          height={windowWidth}            
          data={item.posts}        
          scrollAnimationDuration={300}
          renderItem={({ item: post }) => (
            <View style={styles.carouselItem}>
              <Image style={styles.posts} source={post.image} />
              <View style={styles.viewTextStyles}>
                <Text style={styles.carouselText}>
                  {post.id}/{item.posts.length}                    
                </Text>
              </View>
            </View>
          )}
        />
        <View>
          <View style={styles.buttonContainer}>
            <View style={styles.buttonRow}>
              <LikeButton style={styles.buttonItem} />
              <CommentButton style={styles.buttonItem} />
            </View>
            <SaveButton style={styles.buttonItem} />
          </View>
        </View>
        <View style={{ paddingHorizontal: 15}}>
          <Text>
            {showFullDescription ? item.description : `${item.description.slice(0, maxLength)} ...`}
          </Text>
          <TouchableOpacity onPress={toggleDescription}>
            <Text>{showFullDescription ? "Show less" : "Show more"}</Text>
          </TouchableOpacity>
        </View>
        <Divider style={styles.divider} bold={true}/>
      </View>
)
};

export default function PostsScreen() {
  // State to track whether full description is shown
  const [showFullDescription, setShowFullDescription] = useState(false);

  // Function to toggle description
  const toggleDescription = useCallback(() => {
    setShowFullDescription((prev) => !prev);
  },[])
  const memoriedPostItem = useMemo(() => data, []);

  return (
    <FlatList
    data={memoriedPostItem}
    renderItem={({ item }) => (
      <PostItem
        item={item}
        showFullDescription={showFullDescription}
        toggleDescription={toggleDescription}
      />
    )}
    keyExtractor={(item) => item.id.toString()}
    style={styles.container}
    scrollEnabled={false}
    ></FlatList>
    
  );
}
const styles = StyleSheet.create({
  carouselText:{
    color: "#fff",
    fontSize: 14,
    textAlign: "center",
  },
  divider:{
    marginVertical: 35
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
    left: windowWidth - 50,
    borderRadius: 20,
    paddingHorizontal: 7,
  },
  container: {
    flex: 1,
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
