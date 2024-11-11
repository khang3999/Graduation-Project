import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import React, { useEffect, useState } from 'react'
import Icon from 'react-native-vector-icons/FontAwesome';
import { AntDesign } from '@expo/vector-icons';
import { auth, database, ref } from '@/firebase/firebaseConfig';
import { get, remove, update } from '@firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAccount } from '@/contexts/AccountProvider';

const SaveButton = (props: any) => {
  // const userID = auth.currentUser?.uid
  const type = props.type
  const [saved, setSaved] = useState(false);
  const [userID, setUserID] = useState('')
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
      const refColumn = type == 0 ? 'savedPostsList':'savedToursList'
      const refAccountList = ref(database, `accounts/${userID}/${refColumn}/${props.dataID}`);
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
  }, [userID]);


  // Hàm set save
  const handleSave = async (dataID: any, userID: any) => {
    // Phân loại vì account có 2 cột saved : bài viết và tour
    const refColumn = type == 0 ? 'savedPostsList':'savedToursList'

    const refSavedList = ref(database, `accounts/${userID}/${refColumn}/`);
    const refItemInSavedList = ref(database, `accounts/${userID}/${refColumn}/${dataID}`)
    const snapshot = await get(refItemInSavedList); // Kiểm tra xem dataID đã tồn tại chưa

    try {
      if (snapshot.exists()) {
        // Nếu đã tồn tại, xóa dataID khỏi savedList
        await remove(refItemInSavedList);
        console.log('Đã bỏ lưu ' + dataID);
      } else {
        // Nếu không tồn tại, thêm vào savedList
        await update(refSavedList, {
          [dataID]: true, // Thêm dataID vào savedList
        });
        console.log(`Đã thêm ${dataID} vào savedList`);
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật savedPosts:', error);
    }
    finally { // Đổi state
      setSaved(!saved);
    }
  }
  return (
    <TouchableOpacity delayPressOut={50} onPress={() => handleSave(props.dataID, userID)} {...props}>
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