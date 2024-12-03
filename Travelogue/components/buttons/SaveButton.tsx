import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import React, { useEffect, useState } from 'react'
import Icon from 'react-native-vector-icons/FontAwesome';
import { AntDesign } from '@expo/vector-icons';
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
    // Phân loại vì account có 2 cột saved : bài viết và tour
    const refColumn = type == 0 ? 'savedPostsList' : 'savedToursList'
    const refTable = type === 0 ? 'posts' : 'tours'
    const refSavedList = ref(database, `accounts/${userID}/${refColumn}/`);
    const refItemInSavedList = ref(database, `accounts/${userID}/${refColumn}/${dataID}`)
    const snapshot = await get(refItemInSavedList); // Kiểm tra xem dataID đã tồn tại chưa
    const refSavesOfTable = ref(database, `${refTable}/${dataID}/saves`)

    try {
      if (snapshot.exists()) {
        // Nếu đã tồn tại, xóa dataID khỏi savedList
        await remove(refItemInSavedList);

        console.log('Đã bỏ lưu ' + dataID);

        // Cập nhật saves của bài viết
        runTransaction(refSavesOfTable, (currentValue) => {
          return currentValue - 1; // Cập nhật dựa trên giá trị hiện tại
        }).then(() => {
          setSaveNum(saveNum - 1)
          if (type === 0) {
            setDataPosts([...updateArray(dataPosts, dataID, saveNum - 1)])
          } else {
            setDataTours([...updateArray(dataTours, dataID, saveNum - 1)])
          }
          console.log("Update save successfully committed!");
        }).catch((error) => {
          console.error("Transaction failed: ", error);
        });
        console.log('Đã bỏ save ' + dataID);
      } else {
        // Nếu không tồn tại, thêm vào savedList
        await update(refSavedList, {
          [dataID]: true, // Thêm dataID vào savedList
        });

        // Cập nhật saves của bài viết
        runTransaction(refSavesOfTable, (currentValue) => {
          return currentValue + 1; // Cập nhật dựa trên giá trị hiện tại
        }).then(() => {
          setSaveNum(saveNum + 1)
          if (type === 0) {
            setDataPosts([...updateArray(dataPosts, dataID, saveNum + 1)])
          } else {
            setDataTours([...updateArray(dataTours, dataID, saveNum + 1)])
          }
          console.log("Update save successfully committed!");
        }).catch((error) => {
          console.error("Transaction failed: ", error);
        });
        console.log('Đã bỏ save ' + dataID);
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật savedPosts:', error);
    }
    finally { // Đổi state
      setSaved(!saved);
    }
  }
  return (
    <TouchableOpacity delayPressOut={50} onPress={() => handleSave(data.id, userID)} {...props}>
      <Icon name={saved ? 'bookmark' : 'bookmark-o'} size={24} color={saved ? savedColor : unsavedColor} style={styles.container} />
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