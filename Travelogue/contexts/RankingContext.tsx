import { database, get, ref, onValue, set } from "@/firebase/firebaseConfig";
import React, { createContext, useContext, useEffect, useState } from "react";


interface RankingContextType {
  citiesData: any[];
  postsData: any[];
  hasNewUpdates: boolean;
  isRefreshing: boolean;
  lastUpdateTime: Date | null;
  refreshData: () => Promise<void>;
}

// Global states
let globalCitiesData: any[] = [];
let globalPostsData: any[] = [];
let globalLastUpdateTime: Date | null = null;
let globalHasNewUpdates: boolean = false;
let globalLastDataSnapshot: string | null = null;

const RankingContext = createContext<RankingContextType | null>(null);

export const RankingProvider = ({ children }: { children: React.ReactNode }) => {
  const [citiesData, setCitiesData] = useState<any[]>(globalCitiesData);
  const [postsData, setPostsData] = useState<any[]>(globalPostsData);
  const [hasNewUpdates, setHasNewUpdates] = useState(globalHasNewUpdates);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(globalLastUpdateTime);
  const [lastDataSnapshot, setLastDataSnapshot] = useState<string | null>(globalLastDataSnapshot);

  const fetchData = async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      // Fetch cities data (giữ nguyên phần này)
      const cityRef = ref(database, "cities");
      const citySnapshot = await get(cityRef);
      const cityData = citySnapshot.val() || {};

      const formattedCityData = Object.keys(cityData).flatMap((countryKey) =>
        Object.keys(cityData[countryKey]).flatMap((area_id) =>
          Object.keys(cityData[countryKey][area_id]).map((cityKey) => {
            const cityInfo = cityData[countryKey][area_id][cityKey];
            return {
              id: cityKey,
              name: cityInfo.name,
              id_nuoc: countryKey,
              area_id: area_id,
              image: cityInfo.defaultImages?.[0] || null,
              score: cityInfo.scores || 0,
            };
          })
        )
      );

      // Fetch posts data
      const postsRef = ref(database, "posts");
      const postsSnapshot = await get(postsRef);
      const postsData = postsSnapshot.val() || {};

      const formattedPostsData = Object.entries(postsData).map(([postId, post]: [string, any]) => {
        return {
          id: postId,
          created_at: post.created_at || Date.now(),
          author: post.author || {},
          image: post.thumbnail || [],
          scores: post.scores || 0,
          title : post.title || "",

        };
      });

      // Sort posts by likes
      const sortedPostsData = formattedPostsData
        .sort((a, b) => b.scores - a.scores)
        .slice(0, 50);

      const sortedCityData = formattedCityData
        .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
        .slice(0, 50);

      // Update states
      globalCitiesData = sortedCityData;
      globalPostsData = sortedPostsData;
      globalLastUpdateTime = new Date();
      globalHasNewUpdates = false;
      
      setCitiesData(sortedCityData);
      setPostsData(sortedPostsData);
      setLastUpdateTime(globalLastUpdateTime);
      setHasNewUpdates(false);

    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    // Khôi phục state từ global
    setCitiesData(globalCitiesData);
    setPostsData(globalPostsData);
    setLastUpdateTime(globalLastUpdateTime);
    setHasNewUpdates(globalHasNewUpdates);
    setLastDataSnapshot(globalLastDataSnapshot);

    // Initial fetch only if no global data
    if (globalCitiesData.length === 0) {
      fetchData();
    }

    // Listen for changes in both cities and posts
    const cityRef = ref(database, "cities");
    const postsRef = ref(database, "posts");

    const unsubscribeCities = onValue(cityRef, (snapshot) => {
      checkForUpdates(snapshot.val(), "cities");
    });

    const unsubscribePosts = onValue(postsRef, (snapshot) => {
      checkForUpdates(snapshot.val(), "posts");
    });

    // Hourly refresh
    const interval = setInterval(() => {
      console.log("⏳ Cập nhật dữ liệu sau 1 tiếng...");
      fetchData();
    }, 60 * 60 * 1000);

    return () => {
      clearInterval(interval);
      unsubscribeCities();
      unsubscribePosts();
    };
  }, []);

  const checkForUpdates = (newData: any, type: 'cities' | 'posts') => {
    if (!globalLastDataSnapshot) return;
    
    const currentData = JSON.parse(globalLastDataSnapshot);
    const hasChanged = JSON.stringify(currentData[type]) !== JSON.stringify(newData);
    
    if (hasChanged) {
      globalHasNewUpdates = true;
      setHasNewUpdates(true);
    }
  };

  return (
    <RankingContext.Provider
      value={{
        citiesData,
        postsData,
        hasNewUpdates,
        isRefreshing,
        lastUpdateTime,
        refreshData: fetchData
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