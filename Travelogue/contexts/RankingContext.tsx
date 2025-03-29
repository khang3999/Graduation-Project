import { database, get, ref, onValue } from "@/firebase/firebaseConfig";
import React, { createContext, useContext, useEffect, useState } from "react";

interface RankingContextType {
  citiesData: any[];
  hasNewUpdates: boolean;
  isRefreshing: boolean;
  lastUpdateTime: Date | null;
  refreshData: () => Promise<void>;
}

// Tạo biến global để lưu trữ tất cả state
let globalCitiesData: any[] = [];
let globalLastUpdateTime: Date | null = null;
let globalHasNewUpdates: boolean = false;
let globalLastDataSnapshot: string | null = null;

const RankingContext = createContext<RankingContextType | null>(null);

export const RankingProvider = ({ children }: { children: React.ReactNode }) => {
  const [citiesData, setCitiesData] = useState<any[]>(globalCitiesData);
  const [hasNewUpdates, setHasNewUpdates] = useState(globalHasNewUpdates);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(globalLastUpdateTime);
  const [lastDataSnapshot, setLastDataSnapshot] = useState<string | null>(globalLastDataSnapshot);

  const fetchData = async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      const cityRef = ref(database, "cities");
      const snapshot = await get(cityRef);
      const data = snapshot.val() || {};

      const formattedData = Object.keys(data).flatMap((countryKey) =>
        Object.keys(data[countryKey]).flatMap((area_id) =>
          Object.keys(data[countryKey][area_id]).map((cityKey) => {
            const cityData = data[countryKey][area_id][cityKey];
            return {
              id: cityKey,
              name: cityData.name,
              id_nuoc: countryKey,
              area_id: area_id,
              image: cityData.defaultImages?.[0] || null,
              score: cityData.scores || 0,
            };
          })
        )
      );

      const sortedData = formattedData
        .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
        .slice(0, 50);

      // Cập nhật tất cả global state
      globalCitiesData = sortedData;
      globalLastUpdateTime = new Date();
      globalHasNewUpdates = false;
      globalLastDataSnapshot = JSON.stringify(data);
      
      // Cập nhật local state
      setCitiesData(sortedData);
      setLastUpdateTime(globalLastUpdateTime);
      setHasNewUpdates(false);
      setLastDataSnapshot(globalLastDataSnapshot);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    // Khôi phục state từ global
    setCitiesData(globalCitiesData);
    setLastUpdateTime(globalLastUpdateTime);
    setHasNewUpdates(globalHasNewUpdates);
    setLastDataSnapshot(globalLastDataSnapshot);

    // Initial fetch only if no global data
    if (globalCitiesData.length === 0) {
      fetchData();
    }

    // Check for updates
    const cityRef = ref(database, "cities");
    const unsubscribe = onValue(cityRef, (snapshot) => {
      const newData = snapshot.val() || {};
      const newDataString = JSON.stringify(newData);
      
      if (globalLastDataSnapshot && newDataString !== globalLastDataSnapshot) {
        // Cập nhật cả global và local state
        globalHasNewUpdates = true;
        setHasNewUpdates(true);
      }
    });

    // Hourly refresh
    const interval = setInterval(() => {
      console.log("⏳ Cập nhật dữ liệu sau 1 tiếng...");
      fetchData();
    }, 60 * 60 * 1000);

    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, []);

  return (
    <RankingContext.Provider
      value={{
        citiesData,
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