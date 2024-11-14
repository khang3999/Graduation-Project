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
import { initial, set } from "lodash";
import GalleryTabViewSkeleton from "@/components/skeletons/GalleryTabViewSkeleton";
import { useFocusEffect } from '@react-navigation/native';
import { useTourProvider } from "@/contexts/TourProvider";
import { useHomeProvider } from "@/contexts/HomeProvider";

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


export default function GalleryTabView( {isSearched }: {isSearched: boolean}) {
  const layout = useWindowDimensions();
  const { selectedPost, setSelectedPost }:any= usePost();
  const {setSelectedTour}:any = useTourProvider();
  const {searchedAccountData }:any= useAccount();
  const {dataAccount}:any = useHomeProvider();
  const userId = isSearched ? searchedAccountData.id : dataAccount?.id;
  const [isLoading, setIsLoading] = React.useState(true);
  const [index, setIndex] = React.useState(0);
  const [createdPosts, setCreatedPosts] = React.useState<Post[] | null>(null);
  const [savedPosts, setSavedPosts] = React.useState<Post[]>([]);
  const [savedTours, setSavedToursList] = React.useState<Post[]>([]);
  
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
              const postRef = ref(database, `posts/${postId}`);
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
        const userRef = ref(database, `accounts/${userId}/savedPostsList`);
        onValue(userRef, async (snapshot) => {
          const data = snapshot.val();
          if (data) {
            // Get the post IDs as an array
            const postIds = Object.keys(data);

            const postFetches = postIds.map(async (postId) => {
              const postRef = ref(database, `posts/${postId}`);
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
  const fetchSavedTours = async () => {
    try {
      if (userId) {
        const userRef = ref(database, `accounts/${userId}/savedToursList`);
        onValue(userRef, async (snapshot) => {
          const data = snapshot.val();
          if (data) {
            // Get the post IDs as an array
            const tourIds = Object.keys(data);

            const tourFetches = tourIds.map(async (tourIds) => {
              const tourRef = ref(database, `tours/${tourIds}`);
              const tourSnapshot = await get(tourRef);
              return tourSnapshot.val();
            });

            const tours = await Promise.all(tourFetches);
            setSavedToursList(tours.filter(Boolean));
            
          } else {
            setSavedToursList([]);
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
        await fetchSavedTours();
  
        if (isActive) {
          setIsLoading(false);
        }
      };
      setSelectedPost(null)
      setSelectedTour(null)
      fetchData();      

      return () => {
        isActive = false; // Avoid state updates if the effect is cleaned up
  
        if (userId) {
          const createdPostsRef = ref(
            database,
            `accounts/${userId}/createdPosts`
          );
          const savedPostsRef = ref(database, `accounts/${userId}/savedPostsList`);
          const savedToursRef = ref(database, `accounts/${userId}/savedToursList`);
          off(createdPostsRef);
          off(savedPostsRef);
          off(savedToursRef);
        }
      };
    }, [userId])
  );

  const FirstRoute = () => {
    return (
      <View style={{ flex: 1, paddingBottom: 70 }}>
        {createdPosts && createdPosts.length === 0 ? (
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
                    pathname: "postDetail",
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
                  pathname: "postDetail",
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
      {savedTours.length === 0 ? (
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
          data={savedTours}
          renderItem={({ item, index }) => (
            <Pressable
              onPress={() => {
                router.push({
                  pathname: "tourDetail",
                  params: { initialIndex: index.toString() },
                });
                setSelectedTour(savedTours);
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
                ? "bookmark-outline"
                : "flag-outline"
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
