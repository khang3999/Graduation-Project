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
import { useEffect, useState,useCallback } from "react";
import { database, auth, get } from "@/firebase/firebaseConfig";
import { ref, onValue, off, Unsubscribe } from "firebase/database";
import { usePost } from "@/contexts/PostProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAccount } from "@/contexts/AccountProvider";
import { initial } from "lodash";
import GalleryTabViewSkeleton from "@/components/skeletons/GalleryTabViewSkeleton";
import { useFocusEffect } from '@react-navigation/native';

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


export default function GalleryTabView({ userId, isSearched }: { userId: string, isSearched: boolean }) {
  const layout = useWindowDimensions();
  const { selectedPost, setSelectedPost } = usePost();

  const [isLoading, setIsLoading] = React.useState(true);
  const [index, setIndex] = React.useState(0);
  const [createdPosts, setCreatedPosts] = React.useState<Post[]>([]);
  const [savedPosts, setSavedPosts] = React.useState<Post[]>([]);
  const [likedPosts, setLikedPosts] = React.useState<Post[]>([]);
  
  const [routes] = React.useState(
    isSearched
      ? [{ key: "first" }]
      : [
          { key: "first" },
          { key: "second" },
          { key: "third" },
        ]
  );


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

            const postFetches = postIds.map(async (postId) => {
              const postRef = ref(database, `postsPhuc/${postId}`);
              const postSnapshot = await get(postRef);
              return postSnapshot.val();
            });

            const posts = await Promise.all(postFetches);
            setCreatedPosts(posts.filter(Boolean));
          } else {
            setCreatedPosts([]);
          }
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  //fetching created posts from firebase
  const fetchSavedPosts = async () => {
    try {
      if (userId) {
        const userRef = ref(database, `accounts/${userId}/savedPosts`);
        onValue(userRef, async (snapshot) => {
          const data = snapshot.val();
          if (data) {
            // Get the post IDs as an array
            const postIds = Object.keys(data);

            const postFetches = postIds.map(async (postId) => {
              const postRef = ref(database, `postsPhuc/${postId}`);
              const postSnapshot = await get(postRef);
              return postSnapshot.val();
            });

            const posts = await Promise.all(postFetches);
            setSavedPosts(posts.filter(Boolean));
          } else {
            setSavedPosts([]);
          }
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  //fetching hide posts from firebase
  const fetchLikedPosts = async () => {
    try {
      if (userId) {
        const userRef = ref(database, `accounts/${userId}/likedPosts`);
        onValue(userRef, async (snapshot) => {
          const data = snapshot.val();
          if (data) {
            // Get the post IDs as an array
            const postIds = Object.keys(data);

            const postFetches = postIds.map(async (postId) => {
              const postRef = ref(database, `postsPhuc/${postId}`);
              const postSnapshot = await get(postRef);
              return postSnapshot.val();
            });

            const posts = await Promise.all(postFetches);
            setLikedPosts(posts.filter(Boolean));
          } else {
            setLikedPosts([]);
          }
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
  
      const fetchData = async () => {
        setIsLoading(true);
  
        await fetchCreatedPosts();
        await fetchSavedPosts();
        await fetchLikedPosts();
  
        if (isActive) {
          setIsLoading(false);
        }
      };
  
      fetchData();
  
      return () => {
        isActive = false; // Avoid state updates if the effect is cleaned up
  
        if (userId) {
          const createdPostsRef = ref(
            database,
            `accounts/${userId}/createdPosts`
          );
          const savedPostsRef = ref(database, `accounts/${userId}/savedPosts`);
          const likedPostRef = ref(database, `accounts/${userId}/likedPosts`);
          off(createdPostsRef);
          off(savedPostsRef);
          off(likedPostRef);
        }
      };
    }, [userId])
  );

  const FirstRoute = () => {
    return (
      <View style={{ flex: 1, paddingBottom: 70 }}>
        {createdPosts.length === 0 ? (
          <>
            <Image
              source={require("@/assets/images/camera-circle.png")}
              style={styles.cameraCircle}
            />
            <Text style={styles.noPostText}>No posts yet</Text>
          </>
        ) : (
          <FlatList
            style={{ flex: 1 }}
            data={createdPosts}
            renderItem={({ item, index }) => (
              <Pressable
                onPress={() => {
                  router.push({
                    pathname: "/Post",
                    params: { initialIndex: index.toString() },
                  });
                  setSelectedPost(createdPosts);
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
        )}
      </View>
    );
  };

  const SecondRoute = () => (
    <View style={{ flex: 1, paddingBottom: 70 }}>
      {savedPosts.length === 0 ? (
        <>
          <Image
            source={require("@/assets/images/camera-circle.png")}
            style={styles.cameraCircle}
          />
          <Text style={styles.noPostText}>No posts yet</Text>
        </>
      ) : (
        <FlatList
          style={{ flex: 1 }}
          data={savedPosts}
          renderItem={({ item, index }) => (
            <Pressable
              onPress={() => {
                router.push({
                  pathname: "/Post",
                  params: { initialIndex: index.toString() },
                });
                setSelectedPost(savedPosts);
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
      )}
    </View>
  );

  const ThirdRoute = () => (
    <View style={{ flex: 1, paddingBottom: 70 }}>
      {likedPosts.length === 0 ? (
        <>
          <Image
            source={require("@/assets/images/camera-circle.png")}
            style={styles.cameraCircle}
          />
          <Text style={styles.noPostText}>No posts yet</Text>
        </>
      ) : (
        <FlatList
          style={{ flex: 1 }}
          data={likedPosts}
          renderItem={({ item, index }) => (
            <Pressable
              onPress={() => {
                router.push({
                  pathname: "/Post",
                  params: { initialIndex: index.toString() },
                });
                setSelectedPost(likedPosts);
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
      )}
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
                : "heart-outline"
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
    return <GalleryTabViewSkeleton />;
  }

  return (
    <View style={{ flex: 3 }}>
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
  cameraCircle: {
    alignSelf: "center",
    marginTop: 30,
  },
  noPostText: {
    alignSelf: "center",
    marginTop: 10,
    fontSize: 30,
    fontWeight: "bold",
    color: "#000",
  },
});
