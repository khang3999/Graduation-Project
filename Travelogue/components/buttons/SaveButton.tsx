import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import React, { useEffect, useState } from 'react'
import Icon from 'react-native-vector-icons/FontAwesome';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { auth, database, ref } from '@/firebase/firebaseConfig';
import { get, remove, runTransaction, update } from '@firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAccount } from '@/contexts/AccountProvider';
import { useHomeProvider } from '@/contexts/HomeProvider';
import { useTourProvider } from '@/contexts/TourProvider';

const SaveButton = (props: any) => {
  // const userID = auth.currentUser?.uid
  const type = props.type
  const [saved, setSaved] = useState(false);
  const [userID, setUserID] = useState('')
  const [data, setData] = useState(props.data)
  const [saveNum, setSaveNum] = useState(props.data.saves)
  const { dataPosts, setDataPosts }: any = useHomeProvider()
  const { dataTours, setDataTours }: any = useTourProvider()


  const updateArray = (data: any, id: string, newSaveNumber: number) => {
    const temp = data.map((item: any) =>
      item.id === id ? { ...item, saves: newSaveNumber } : item
    )
    return temp
  };

  useEffect(() => {
    if (type === 0) {
      // Tìm item có id cụ thể
      const dataItem = dataPosts.find((item: any) => item.id === data.id);
      if (dataItem) {
        setSaveNum(dataItem.saves); // Cập nhật saveNum dựa trên item tìm thấy
      }
    } else {
      // Tìm item có id cụ thể
      const dataItem = dataTours.find((item: any) => item.id === data.id);
      if (dataItem) {
        setSaveNum(dataItem.saves); // Cập nhật saveNum dựa trên item tìm thấy
      }
    }

  }, [dataPosts, dataTours])

  // Lấy UserID
  useEffect(() => {
    const getUserId = async () => {
      try {
        const userId = await AsyncStorage.getItem("userToken");
        if (userId) {
          setUserID(userId);
        } else {
          console.log("User ID not found");
        }
      } catch (error) {
        console.error("Failed to retrieve user ID:", error);
      }
    };
    getUserId();
  }, [])

  // Render 1 lần từ db để load các bài đã save
  useEffect(() => {
    const checkIfSaved = async () => {
      const refColumn = type == 0 ? 'savedPostsList' : 'savedToursList'
      const refAccountList = ref(database, `accounts/${userID}/${refColumn}/${data.id}`);
      const snapshot = await get(refAccountList);

      // Cập nhật trạng thái saved dựa trên dữ liệu từ Firebase
      if (snapshot.exists()) {
        setSaved(true); // Nếu dataID đã tồn tại, đánh dấu là saved
      } else {
        setSaved(false); // Nếu không tồn tại, đánh dấu là unsaved
      }
    };

    if (userID) {
      checkIfSaved(); // Gọi hàm kiểm tra nếu có userID
    }
  }, [userID, dataPosts, dataTours]);


  // Hàm set save
  const handleSave = async (dataID: any, userID: any) => {
    const refColumn = type == 0 ? 'savedPostsList' : 'savedToursList';
    const refTable = type === 0 ? 'posts' : 'tours';
    const refSavedList = ref(database, `accounts/${userID}/${refColumn}/`);
    const refItemInSavedList = ref(database, `accounts/${userID}/${refColumn}/${dataID}`);
    const snapshot = await get(refItemInSavedList);
    const refSavesOfTable = ref(database, `${refTable}/${dataID}/scores`);
  
    // Lấy danh sách các tỉnh thành từ `locations`
    const locations = data.locations; // Đảm bảo `data.locations` chứa thông tin các tỉnh thành
    console.log("Locations:", locations);
  
    try {
      if (snapshot.exists()) {
        // Unsave
        await remove(refItemInSavedList);
        console.log('Đã bỏ lưu ' + dataID);
  
        // Giảm 2 điểm
        await runTransaction(refSavesOfTable, (currentValue) => {
          return (currentValue || 0) - 2;
        });
  
        // Giảm 2 điểm cho từng tỉnh thành
        if (locations) {
          for (const countryKey in locations) {
            const provinces = locations[countryKey];
            for (const provinceID in provinces) {
              console.log("Tìm provinceID:", provinceID);
  
              // Dò vào bảng cities để tìm tỉnh thành
              const citiesRef = ref(database, `cities/${countryKey}`);
              const citiesSnapshot = await get(citiesRef);
  
              if (citiesSnapshot.exists()) {
                const citiesData = citiesSnapshot.val();
                let found = false;
  
                for (const regionKey in citiesData) {
                  if (citiesData[regionKey][provinceID]) {
                    console.log("Tìm thấy provinceID:", provinceID);
                    console.log("countryKey:", countryKey);
                    console.log("regionKey:", regionKey);
  
                    // Cập nhật scores cho tỉnh thành
                    const refProvinceScores = ref(database, `cities/${countryKey}/${regionKey}/${provinceID}/scores`);
                    await runTransaction(refProvinceScores, (currentValue) => {
                      return (currentValue || 0) - 2; // Giảm 2 điểm
                    });
  
                    found = true;
                    break;
                  }
                }
  
                if (!found) {
                  console.warn(`Không tìm thấy regionKey cho provinceID: ${provinceID}`);
                }
              }
            }
          }
        }
  
        setSaveNum(saveNum - 1);
        const updatedData = updateArray(type === 0 ? dataPosts : dataTours, dataID, saveNum - 1);
        type === 0 ? setDataPosts(updatedData) : setDataTours(updatedData);
      } else {
        // Save
        await update(refSavedList, { [dataID]: true });
        console.log('Đã lưu ' + dataID);
  
        // Tăng 2 điểm
        await runTransaction(refSavesOfTable, (currentValue) => {
          return (currentValue || 0) + 2;
        });
  
        // Tăng 2 điểm cho từng tỉnh thành
        if (locations) {
          for (const countryKey in locations) {
            const provinces = locations[countryKey];
            for (const provinceID in provinces) {
              console.log("Tìm provinceID:", provinceID);
  
              // Dò vào bảng cities để tìm tỉnh thành
              const citiesRef = ref(database, `cities/${countryKey}`);
              const citiesSnapshot = await get(citiesRef);
  
              if (citiesSnapshot.exists()) {
                const citiesData = citiesSnapshot.val();
                let found = false;
  
                for (const regionKey in citiesData) {
                  if (citiesData[regionKey][provinceID]) {
                    console.log("Tìm thấy provinceID:", provinceID);
                    console.log("countryKey:", countryKey);
                    console.log("regionKey:", regionKey);
  
                    // Cập nhật scores cho tỉnh thành
                    const refProvinceScores = ref(database, `cities/${countryKey}/${regionKey}/${provinceID}/scores`);
                    await runTransaction(refProvinceScores, (currentValue) => {
                      return (currentValue || 0) + 2; // Tăng 2 điểm
                    });
  
                    found = true;
                    break;
                  }
                }
  
                if (!found) {
                  console.warn(`Không tìm thấy regionKey cho provinceID: ${provinceID}`);
                }
              }
            }
          }
        }
  
        setSaveNum(saveNum + 1);
        const updatedData = updateArray(type === 0 ? dataPosts : dataTours, dataID, saveNum + 1);
        type === 0 ? setDataPosts(updatedData) : setDataTours(updatedData);
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật savedPosts:', error);
    } finally {
      setSaved(!saved);
    }
  };
  return (
    <TouchableOpacity delayPressOut={50} onPress={() => handleSave(data.id, userID)} style={props.myStyle}>
      <Ionicons name={saved ? 'bookmark' : 'bookmark-outline'} size={24} color={saved ? savedColor : unsavedColor} style={styles.container} />
    </TouchableOpacity>
  )
}
// Style
const savedColor = '#ffd43b'
const unsavedColor = 'black'
const styles = StyleSheet.create({
  container: {
    top: 1
  }
})
export default SaveButton