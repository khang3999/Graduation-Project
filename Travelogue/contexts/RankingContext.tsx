import { database, get, ref, onValue, set } from "@/firebase/firebaseConfig";
import React, { createContext, useContext, useEffect, useState } from "react";

interface RankingContextType {
  citiesData: any[];
  postsData: any[];
  hasNewCitiesUpdates: boolean;
  hasNewPostsUpdates: boolean;
  isRefreshing: boolean;
  lastUpdateTime: Date | null;
  refreshCitiesData: () => Promise<void>;
  refreshPostsData: () => Promise<void>;
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
  const [hasNewCitiesUpdates, setHasNewCitiesUpdates] = useState(globalHasNewCitiesUpdates);
  const [hasNewPostsUpdates, setHasNewPostsUpdates] = useState(globalHasNewPostsUpdates);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(globalLastUpdateTime);
  const [lastCitiesSnapshot, setLastCitiesSnapshot] = useState<string | null>(globalLastCitiesSnapshot);
  const [lastPostsSnapshot, setLastPostsSnapshot] = useState<string | null>(globalLastPostsSnapshot);

  const refreshCitiesData = async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
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

      const sortedCityData = formattedCityData
        .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
        .slice(0, 50);

      globalCitiesData = sortedCityData;
      setCitiesData(sortedCityData);
      setHasNewCitiesUpdates(false);

      // Save current cities snapshot
      const currentSnapshot = JSON.stringify(sortedCityData);
      globalLastCitiesSnapshot = currentSnapshot;
      setLastCitiesSnapshot(currentSnapshot);

    } catch (error) {
      console.error("Error fetching cities data:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const refreshPostsData = async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
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
          title: post.title || "",
        };
      });

      const sortedPostsData = formattedPostsData
        .sort((a, b) => b.scores - a.scores)
        .slice(0, 50);

      globalPostsData = sortedPostsData;
      setPostsData(sortedPostsData);
      setHasNewPostsUpdates(false);

      // Save current posts snapshot
      const currentSnapshot = JSON.stringify(sortedPostsData);
      globalLastPostsSnapshot = currentSnapshot;
      setLastPostsSnapshot(currentSnapshot);

    } catch (error) {
      console.error("Error fetching posts data:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    // Khôi phục state từ global
    setCitiesData(globalCitiesData);
    setPostsData(globalPostsData);
    setLastUpdateTime(globalLastUpdateTime);
    setHasNewCitiesUpdates(globalHasNewCitiesUpdates);
    setHasNewPostsUpdates(globalHasNewPostsUpdates);
    setLastCitiesSnapshot(globalLastCitiesSnapshot);
    setLastPostsSnapshot(globalLastPostsSnapshot);

    // Initial fetch only if no global data
    if (globalCitiesData.length === 0) {
      refreshCitiesData();
    }
    if (globalPostsData.length === 0) {
      refreshPostsData();
    }

    // Listen for changes in both cities and posts
    const cityRef = ref(database, "cities");
    const postsRef = ref(database, "posts");

    const unsubscribeCities = onValue(cityRef, (snapshot) => {
      checkForCitiesUpdates(snapshot.val());
    });

    const unsubscribePosts = onValue(postsRef, (snapshot) => {
      checkForPostsUpdates(snapshot.val());
    });

    // Hourly refresh
    const interval = setInterval(() => {
      console.log("⏳ Cập nhật dữ liệu sau 1 tiếng...");
      refreshCitiesData();
      refreshPostsData();
    }, 60 * 60 * 1000); 

    return () => {
      clearInterval(interval);
      unsubscribeCities();
      unsubscribePosts();
    };
  }, []);

  const checkForCitiesUpdates = (newData: any) => {
    if (!globalLastCitiesSnapshot) return;
    
    const currentData = JSON.parse(globalLastCitiesSnapshot);
    const hasChanged = JSON.stringify(currentData) !== JSON.stringify(newData);
    
    if (hasChanged) {
      globalHasNewCitiesUpdates = true;
      setHasNewCitiesUpdates(true);
    }
  };

  const checkForPostsUpdates = (newData: any) => {
    if (!globalLastPostsSnapshot) return;
    
    const currentData = JSON.parse(globalLastPostsSnapshot);
    const hasChanged = JSON.stringify(currentData) !== JSON.stringify(newData);
    
    if (hasChanged) {
      globalHasNewPostsUpdates = true;
      setHasNewPostsUpdates(true);
    }
  };

  return (
    <RankingContext.Provider
      value={{
        citiesData,
        postsData,
        hasNewCitiesUpdates,
        hasNewPostsUpdates,
        isRefreshing,
        lastUpdateTime,
        refreshCitiesData,
        refreshPostsData
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