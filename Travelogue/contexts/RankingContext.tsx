import { database, get, ref, onValue, set } from "@/firebase/firebaseConfig";
import { limitToLast, orderByChild, query, startAt } from "firebase/database";
import { orderBy } from "lodash";
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import Toast from "react-native-toast-message-custom";

interface RankingContextType {
  citiesData: any[];
  postsData: any[];
  hasNewCitiesUpdates: boolean;
  hasNewPostsUpdates: boolean;
  currentScreen: string;
  setCurrentScreen: React.Dispatch<React.SetStateAction<string>>;
  isRefreshing: boolean;
  lastUpdateTime: Date | null;
  // refreshCitiesData: () => Promise<void>;
  // refreshPostsData: () => Promise<void>;
  fetchTrendingCity: () => Promise<void>;
  fetchTrendingPost: () => Promise<void>;
  fetchTrendingTour: () => Promise<void>;
  refreshTrendingAll: () => Promise<void>;
  postsData1: any[];
  toursData: any[];
}

// Global states
let globalCitiesData: any[] = [];
let globalPostsData: any[] = [];
let globalLastUpdateTime: Date | null = null;
let globalHasNewCitiesUpdates: boolean = false;
let globalHasNewPostsUpdates: boolean = false;
let globalLastCitiesSnapshot: string | null = null;
let globalLastPostsSnapshot: string | null = null;

const RankingContext = createContext<RankingContextType | null>(null);

export const RankingProvider = ({ children }: any) => {
  const [citiesData, setCitiesData] = useState<any[]>(globalCitiesData);
  const [postsData, setPostsData] = useState<any[]>(globalPostsData);
  const [toursData, setToursData] = useState<any[]>([]);
  const [postsData1, setPostsData1] = useState<any[]>(globalPostsData);
  const [hasNewCitiesUpdates, setHasNewCitiesUpdates] = useState(globalHasNewCitiesUpdates);
  const [hasNewPostsUpdates, setHasNewPostsUpdates] = useState(globalHasNewPostsUpdates);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(globalLastUpdateTime);
  const [currentScreen, setCurrentScreen] = useState('city');
  const [lastCitiesSnapshot, setLastCitiesSnapshot] = useState<string | null>(globalLastCitiesSnapshot);
  const [lastPostsSnapshot, setLastPostsSnapshot] = useState<string | null>(globalLastPostsSnapshot);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  // // tam an
  //   const refreshCitiesData = async () => {
  //     if (isRefreshing) return;

  //     setIsRefreshing(true);
  //     try {
  //       const cityRef = ref(database, "cities");
  //       const citySnapshot = await get(cityRef);
  //       const cityData = citySnapshot.val() || {};

  //       const formattedCityData = Object.keys(cityData).flatMap((countryKey) =>
  //         Object.keys(cityData[countryKey]).flatMap((area_id) =>
  //           Object.keys(cityData[countryKey][area_id]).map((cityKey) => {
  //             const cityInfo = cityData[countryKey][area_id][cityKey];
  //             return {
  //               id: cityKey,
  //               name: cityInfo.name || cityInfo.value || "",
  //               id_nuoc: countryKey,
  //               area_id: area_id,
  //               image: cityInfo.defaultImages?.[0] || "https://mediatech.vn/assets/images/imgstd.jpg",
  //               score: cityInfo.scores || 0,
  //             };
  //           })
  //         )
  //       );

  //       const sortedCityData = formattedCityData
  //         .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
  //         .slice(0, 50);

  //       globalCitiesData = sortedCityData;
  //       // setCitiesData(sortedCityData);
  //       setHasNewCitiesUpdates(false);

  //       // Save current cities snapshot
  //       const currentSnapshot = JSON.stringify(sortedCityData);
  //       globalLastCitiesSnapshot = currentSnapshot;
  //       setLastCitiesSnapshot(currentSnapshot);

  //     } catch (error) {
  //       console.error("Error fetching cities data:", error);
  //     } finally {
  //       setIsRefreshing(false);
  //     }
  //   };

  // Fetch trending city
  const fetchTrendingCity = useCallback(async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    try {
      const cityRef = ref(database, "cities/avietnam/");

      const snapshot = await get(cityRef);

      // const cityQuery = query(cityRef, orderByChild("scores"));
      // const trendingSnapshot = await get(cityQuery);
      if (snapshot.exists()) {
        const trendingData = snapshot.val();
        const dataProvincesArray: any[] = Object.values(trendingData)
          .flatMap((item: any) => Object.values(item))
          // .sort((a: any, b: any) => b.scores - a.scores);
          .sort((a: any, b: any) => b.scores - a.scores).slice(0, 15);
        // const trendingCitiesArray = Object.keys(trendingData)
        // console.log(dataProvincesArray, "Trending city data:");
        setCitiesData(dataProvincesArray);

        console.log("Trending city data fetched successfully.");
      } else {
        console.log("No trending city data found.");
      }

      // globalCitiesData = formattedTrendingData;
    } catch (error) {
      console.error("Error fetching trending city data:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Fetch trending post
  const fetchTrendingPost = useCallback(async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    try {
      const postsRef = ref(database, "posts/");
      // const postQuery = query(postsRef, orderByChild('scores'), limitToLast(2));
      const postQuery = query(postsRef, orderByChild('scores'), startAt(1), limitToLast(5));

      const snapshot = await get(postQuery);

      // const cityQuery = query(cityRef, orderByChild("scores"));
      // const trendingSnapshot = await get(cityQuery);
      if (snapshot.exists()) {
        const trendingData = snapshot.val();
        // const dataProvincesArray: any[] = Object.values(trendingData)
        //   .flatMap((item: any) => Object.values(item))
        //   .sort((a: any, b: any) => b.scores - a.scores).slice(0, 15);
        // const trendingCitiesArray = Object.keys(trendingData)
        // const dataPostsArray: any[] = Object.values(trendingData)
        const dataPostsArray: any[] = Object.values(trendingData).sort((a: any, b: any) => b.scores - a.scores);
        // console.log(dataPostsArray, "Trending post data:");
        setPostsData1(dataPostsArray);

        console.log("Trending post data fetched successfully.");
      } else {
        console.log("No trending post data found.");
      }

      // globalCitiesData = formattedTrendingData;
    } catch (error) {
      console.error("Error fetching trending post data:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Fetch trending tour
  const fetchTrendingTour = useCallback(async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    try {
      const toursRef = ref(database, "tours/");
      // const postQuery = query(postsRef, orderByChild('scores'), limitToLast(2));
      const tourQuery = query(toursRef, orderByChild('scores'), startAt(1), limitToLast(5));

      const snapshot = await get(tourQuery);
      if (snapshot.exists()) {
        const trendingData = snapshot.val();
        const dataToursArray: any[] = Object.values(trendingData).sort((a: any, b: any) => b.scores - a.scores);
        // console.log(dataToursArray, "Trending tour data:");
        setToursData(dataToursArray);

        console.log("Trending tour data fetched successfully.");
      } else {
        console.log("No trending tour data found.");
        setToursData([]);
      }

      // globalCitiesData = formattedTrendingData;
    } catch (error) {
      console.error("Error fetching trending tour data:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, []);


  const refreshTrendingAll = useCallback(async () => {
    console.log('refresh trending');
    // City
    await fetchTrendingCity();
    await fetchTrendingPost();
    await fetchTrendingTour();
  }, [fetchTrendingCity, fetchTrendingPost, fetchTrendingTour]);

  // CHẠY MỖI 1 tiếng
  useEffect(() => {
    // Fetch lần đầu 
    refreshTrendingAll();
    console.log('Update trending first time at: ', Date.now());
    // Sau đó cứ mỗi 1 giờ gọi lại
    intervalRef.current = setInterval(() => {
      refreshTrendingAll();
      console.log('Update trending 1h at: ', Date.now());

    }, 60 * 60 * 1000); // 1 giờ = 3600000 ms
    // Cleanup khi unmount
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [refreshTrendingAll])


  // const refreshPostsData = async () => {
  //   if (isRefreshing) return;

  //   setIsRefreshing(true);
  //   try {
  //     const postsRef = ref(database, "posts");
  //     const postsSnapshot = await get(postsRef);
  //     const postsData = postsSnapshot.val() || {};

  //     const formattedPostsData = Object.entries(postsData).map(([postId, post]: [string, any]) => {
  //       return {
  //         id: postId,
  //         created_at: post.created_at || Date.now(),
  //         author: post.author || {},
  //         image: post.thumbnail || [],
  //         scores: post.scores || 0,
  //         title: post.title || "",
  //       };
  //     });

  //     const sortedPostsData = formattedPostsData
  //       .sort((a, b) => b.scores - a.scores)
  //       .slice(0, 50);

  //     globalPostsData = sortedPostsData;
  //     setPostsData(sortedPostsData);
  //     setHasNewPostsUpdates(false);

  //     // Save current posts snapshot
  //     const currentSnapshot = JSON.stringify(sortedPostsData);
  //     globalLastPostsSnapshot = currentSnapshot;
  //     setLastPostsSnapshot(currentSnapshot);

  //   } catch (error) {
  //     console.error("Error fetching posts data:", error);
  //   } finally {
  //     setIsRefreshing(false);
  //   }
  // };

  // useEffect(() => {
  //   // Khôi phục state từ global
  //   // setCitiesData(globalCitiesData);
  //   setPostsData(globalPostsData);
  //   setLastUpdateTime(globalLastUpdateTime);
  //   setHasNewCitiesUpdates(globalHasNewCitiesUpdates);
  //   setHasNewPostsUpdates(globalHasNewPostsUpdates);
  //   setLastCitiesSnapshot(globalLastCitiesSnapshot);
  //   setLastPostsSnapshot(globalLastPostsSnapshot);

  //   // Initial fetch only if no global data
  //   if (globalCitiesData.length === 0) {
  //     refreshCitiesData();
  //   }
  //   if (globalPostsData.length === 0) {
  //     refreshPostsData();
  //   }

  //   // Listen for changes in both cities and posts
  //   const cityRef = ref(database, "cities");
  //   const postsRef = ref(database, "posts");

  //   const unsubscribeCities = onValue(cityRef, (snapshot) => {
  //     checkForCitiesUpdates(snapshot.val());
  //   });

  //   const unsubscribePosts = onValue(postsRef, (snapshot) => {
  //     checkForPostsUpdates(snapshot.val());
  //   });

  //   // Hourly refresh
  //   const interval = setInterval(() => {
  //     console.log("⏳ Cập nhật dữ liệu sau 1 tiếng...");
  //     refreshCitiesData();
  //     refreshPostsData();
  //   }, 60 * 60 * 1000);

  //   return () => {
  //     clearInterval(interval);
  //     unsubscribeCities();
  //     unsubscribePosts();
  //   };
  // }, []);

  // const checkForCitiesUpdates = (newData: any) => {
  //   if (!globalLastCitiesSnapshot) return;

  //   const currentData = JSON.parse(globalLastCitiesSnapshot);
  //   const hasChanged = JSON.stringify(currentData) !== JSON.stringify(newData);

  //   if (hasChanged) {
  //     globalHasNewCitiesUpdates = true;
  //     setHasNewCitiesUpdates(true);
  //   }
  // };

  // const checkForPostsUpdates = (newData: any) => {
  //   if (!globalLastPostsSnapshot) return;

  //   const currentData = JSON.parse(globalLastPostsSnapshot);
  //   const hasChanged = JSON.stringify(currentData) !== JSON.stringify(newData);

  //   if (hasChanged) {
  //     globalHasNewPostsUpdates = true;
  //     setHasNewPostsUpdates(true);
  //   }
  // };

  return (
    <RankingContext.Provider
      value={{
        citiesData,
        postsData,
        hasNewCitiesUpdates,
        hasNewPostsUpdates,
        isRefreshing,
        lastUpdateTime,
        currentScreen,
        setCurrentScreen,
        // refreshCitiesData,
        // refreshPostsData,
        fetchTrendingCity,
        fetchTrendingPost,
        fetchTrendingTour,
        refreshTrendingAll,
        postsData1,
        toursData
      }}
    >
      {children}
    </RankingContext.Provider>
  );
};

export const useRanking = () => {
  const context = useContext(RankingContext);
  if (!context) {
    throw new Error("useRanking must be used within a RankingProvider");
  }
  return context;
};