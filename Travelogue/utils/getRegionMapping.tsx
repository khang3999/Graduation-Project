import { database } from "@/firebase/firebaseConfig";
import { ref, get } from "firebase/database";

export const getRegionMapping = async () => {
  const citiesRef = ref(database, "cities"); 
  try {
    const snapshot = await get(citiesRef); 

    if (snapshot.exists()) {
      const rawData = snapshot.val(); 
      //key , value
      const regionMapping: Record<string, { id_nuoc: string; area_id: string }> = {};

      // Duyệt qua tất cả các quốc gia 
      for (const country in rawData) {
        // Các khu vực của mỗi quốc gia
        const regions = rawData[country]; 
        for (const region in regions) {
          // Các thành phố trong khu vực
          const locations = regions[region]; 
          // Duyệt qua từng thành phố (cityId) và ánh xạ các thuộc tính
          for (const cityId in locations) {
            // Gắn id_nuoc từ tên quốc gia và area_id từ tên khu vực
            regionMapping[cityId] = {
              id_nuoc: country,
              area_id: region, 
            };
          }
        }
      }
      // console.log("Region mapping", regionMapping);
      return regionMapping; 
    } else {
      console.warn("No region");
      return {};
    }
  } catch (error) {
    console.error("Error ", error);
    return {}; 
  }
};
