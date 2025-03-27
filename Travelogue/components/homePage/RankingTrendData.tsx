import { database, get, ref, onValue } from "@/firebase/firebaseConfig";
import { useEffect, useState } from "react";

const useRankingTrendData = () => {
  const [citiesData, setCitiesData] = useState<any[]>([]);
  const [hasNewUpdates, setHasNewUpdates] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);

  const fetchData = async () => {
    setIsRefreshing(true);
    console.log("📡 Fetching dữ liệu từ Firebase...");
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

    setCitiesData(
      formattedData
        .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
        .slice(0, 50)
    );
    setLastUpdateTime(new Date());
    setIsRefreshing(false);
    setHasNewUpdates(false);
  };

  useEffect(() => {
    // Initial fetch
    fetchData();

    // Set up real-time listener
    const cityRef = ref(database, "cities");
    const unsubscribe = onValue(cityRef, (snapshot) => {
      const data = snapshot.val() || {};
      const currentData = JSON.stringify(citiesData);
      const newData = JSON.stringify(
        Object.keys(data).flatMap((countryKey) =>
          Object.keys(data[countryKey]).flatMap((area_id) =>
            Object.keys(data[countryKey][area_id]).map((cityKey) => ({
              id: cityKey,
              name: data[countryKey][area_id][cityKey].name,
              id_nuoc: countryKey,
              area_id: area_id,
              image: data[countryKey][area_id][cityKey].defaultImages?.[0] || null,
              score: data[countryKey][area_id][cityKey].scores || 0,
            }))
          )
        )
      );

      if (currentData !== newData) {
        setHasNewUpdates(true);
      }
    });

    // Set up hourly refresh
    const interval = setInterval(() => {
      console.log("⏳ Cập nhật dữ liệu sau 1 tiếng...");
      fetchData();
    }, 60 * 1000 * 60);

    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, []);

  return {
    citiesData,
    hasNewUpdates,
    isRefreshing,
    lastUpdateTime,
    refreshData: fetchData
  };
};

export default useRankingTrendData;
