import * as React from "react";
import {
  View,
  useWindowDimensions,
  Text,
  Image,
  Dimensions,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { TabView, SceneMap, TabBar, TabBarProps } from "react-native-tab-view";
import MaterialIcons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { database, auth, get } from "@/firebase/firebaseConfig";
import { ref, onValue, off, Unsubscribe } from "firebase/database";
import { usePost } from "@/contexts/PostProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAccount } from "@/contexts/AccountProvider";

const { width } = Dimensions.get("window");
const itemWidth = width / 3;
type Comment = {
  accountID: {
    avatar: any; // Change to ImageSourcePropType if needed
    username: string;
  };
  comment_status: string;
  content: string;
  reports: number;
  children?: Comment[];
  created_at: string;
};

type Post = {
  id: string;
  author: {
    avatar: any; // Change to ImageSourcePropType if needed
    username: string;
  };
  comments: Record<string, Comment>;
  content: string;
  created_at: string;
  hashtag: string;
  thumbnail: string;
  images: string[];
  likes: number;
  locations: Record<string, Record<string, string>>;
  match: number;
  point: number;
  status: string;
  price_id: number;
  reports: number;
  view_mode: boolean;
};

type PostItemProps = {
  item: Post;
  showFullDescription: boolean;
  toggleDescription: () => void;
};

export default function GalleryTabView() {
  const layout = useWindowDimensions();
  const userId = auth.currentUser?.uid;
  const { selectedPost, setSelectedPost } = usePost();

  const [isLoading, setIsLoading] = React.useState(true);
  const [index, setIndex] = React.useState(0);
  const [createdPosts, setCreatedPosts] = React.useState<Post[]>([]);
  const [routes] = React.useState([
    { key: "first" },
    { key: "second" },
    { key: "third" },
  ]);

  //fetching created posts from firebase
  const fetchCreatedPosts = async () => {
    try {
      if (userId) {
        const userRef = ref(database, `accounts/${userId}/createdPosts`);
        onValue(userRef, async (snapshot) => {
          const data = snapshot.val();
          if (data) {
            // Get the post IDs as an array
            const postIds = Object.keys(data);

            // Use an array to store listeners so you can unsubscribe later
            const unsubscribeListeners: Unsubscribe[] = []; 

            // Create an array to hold posts
            const posts: Post[] = [];

            postIds.forEach((postId, index) => {
              const postRef = ref(database, `postsPhuc/${postId}`);

              // Listen for changes to each post using nested onValue
              const unsubscribe = onValue(postRef, (postSnapshot) => {
                const postData = postSnapshot.val();
                if (postData) {
                  // Update the post at the correct index
                  posts[index] = postData;
                  setCreatedPosts([...posts]); // Update state with a new array reference to trigger re-render
                }
              });

              // Add each unsubscribe function to the array for cleanup
              unsubscribeListeners.push(() => unsubscribe());
            });
            // Clean up listeners when the component unmounts
            return () => {
              unsubscribeListeners.forEach((unsubscribe) => unsubscribe());
            };
          }
        });
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      await fetchCreatedPosts(); // Set up Firebase listener for real-time updates
      setIsLoading(false);
    };
    initialize();

    return () => {
      if (userId) {
        const userRef = ref(database, `accounts/${userId}/createdPosts`);
        off(userRef);
      }
    };
  }, [userId]);

  const FirstRoute = () => {
    // console.log(createdPosts[0].author.avatar, "avatar 1");
    return (
      <View style={{ flex: 1, paddingBottom: 70 }}>
        <FlatList
          style={{ flex: 1 }}
          data={createdPosts}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => {
                router.push({
                  pathname: "/post",
                }); 
                setSelectedPost([item]);
              }}
            >
              <Image
                source={{ uri: item.thumbnail }}
                style={styles.imagesGallery}
              />
            </Pressable>
          )}
          keyExtractor={(item) => item.id.toString()}
          numColumns={3}
        />
      </View>
    );
  };

  const SecondRoute = () => (
    <View style={{ flex: 1, paddingBottom: 70, backgroundColor: "orange" }}>
      <FlatList
        style={{ flex: 1 }}
        data={createdPosts}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => {
              router.push({
                pathname: "/post",
              });
            }}
          >
            <Image
              source={{ uri: item.thumbnail }}
              style={styles.imagesGallery}
            />
          </Pressable>
        )}
        keyExtractor={(item) => item.id}
        numColumns={3}
      />
    </View>
  );

  const ThirdRoute = () => (
    <View style={{ flex: 1, paddingBottom: 70, backgroundColor: "green" }}>
      <FlatList
        style={{ flex: 1 }}
        data={createdPosts}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => {
              router.push({
                pathname: "/post",
              });
            }}
          >
            <Image
              source={{ uri: item.thumbnail }}
              style={styles.imagesGallery}
            />
          </Pressable>
        )}
        keyExtractor={(item) => item.id}
        numColumns={3}
      />
    </View>
  );

  const renderScene = SceneMap({
    first: FirstRoute,
    second: SecondRoute,
    third: ThirdRoute,
  });

  const renderTabBar = (props: TabBarProps<any>) => (
    <TabBar
      {...props}
      renderIcon={({ route, focused, color }) => (
        <MaterialIcons
          name={
            route.key === "first"
              ? "logo-tableau"
              : route.key === "second"
              ? "pricetags-outline"
              : "map-outline"
          }
          size={24}
          color={focused ? "black" : "grey"}
        />
      )}
      indicatorStyle={{ backgroundColor: "black" }}
      style={{ backgroundColor: "#f2f2f2" }}
    />
  );

  if (isLoading) {
    return;
    <View style={{ flex: 2.2 }}>
      <ActivityIndicator size="large" color="#0000ff" />;
    </View>;
  }

  return (
    <View style={{ flex: 2.2 }}>
      <TabView
        lazy
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
        renderTabBar={renderTabBar}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  imagesGallery: {
    width: itemWidth,
    height: itemWidth,
    marginTop: 2,
    marginBottom: 0,
    marginRight: 2,
  },
});
