import { database } from "@/firebase/firebaseConfig";
import { ref, get } from "firebase/database";
import { parseContent } from "@/utils/parseContent";
import { getRegionMapping } from "@/utils/getRegionMapping";

export const getDataPost = async (postId: string) => {
  const postRef = ref(database, `posts/${postId}`);

  type City = {
    id: string;
    name: string;
    id_nuoc: string;
    area_id: string;
  };

  type ImageData = {
    city: {
      id: string;
      name: string;
      id_nuoc: string;
      area_id: string;
    } | null;
    images: string[];
  };

  const cities: City[] = [];
  const images: ImageData[] = [];

  try {
    const snapshot = await get(postRef);

    if (snapshot.exists()) {
      const data = snapshot.val();

      // Tách content
      const content = data.content || "";
      const parsedData = content ? parseContent(content) : null;

      // Map locations
      const locationData = data.locations || {};
      const locationArray: { id: string; name: string }[] = [];
      
      Object.entries(locationData).forEach(([countryKey, countryLocations]) => {
        Object.entries(countryLocations as Record<string, string>).forEach(
          ([id, name]) => {
            locationArray.push({ id, name });
          }
        );
      });
      // console.log(locationArray);

      // Lấy regionMapping để ánh xạ thông tin về quốc gia
      const regionMapping = await getRegionMapping();

      locationArray.forEach(({ id, name }) => {
        // Lấy id quốc gia với id khu vực từ id city
        const regionInfo = regionMapping[id] || { };
        
        // Lưu vào cities, sử dụng id_nuoc và area_id 
        cities.push({
          id,
          name,
          id_nuoc: regionInfo.id_nuoc, 
          area_id: regionInfo.area_id, 
        });
      });

      // Map images
      const imageData = data.images; 
      // console.log(imageData);
      Object.entries(imageData).forEach(([countryKey, countryLocations]) => {
        Object.entries(countryLocations as Record<string, { city_name: string; images_value: string[] }>).forEach(([city_id, { city_name, images_value }]) => {
          // Tìm thông tin thành phố trong mảng cities
          const cityInfo = cities.find((city) => city.id === city_id) || null;
      
          // Thêm thông tin vào mảng images
          images.push({
            city: cityInfo
              ? {
                  id: city_id,
                  name: city_name,  // Tên thành phố lấy từ city_name trong imageData
                  id_nuoc: cityInfo.id_nuoc,
                  area_id: cityInfo.area_id,
                }
              : null,
            images: images_value || [], // Mảng ảnh, nếu không có ảnh thì là mảng rỗng
          });
        });
      });

      // console.log(cities);
      // console.log(images);

      //Return processed data
      return {
        title: parsedData?.title || "",
        content: parsedData?.content || "",
        days: parsedData?.days || [],
        status_id: data.status_id || 0,
        isCheckIn: data.isCheckIn || false,
        cities,
        images,
      };
    } else {
      console.log("No data available");
      return null;
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
};
