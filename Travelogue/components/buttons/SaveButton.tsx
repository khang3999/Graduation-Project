import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import React, { useEffect, useState } from 'react'
import Icon from 'react-native-vector-icons/FontAwesome';
import { AntDesign } from '@expo/vector-icons';
import { auth, database, ref } from '@/firebase/firebaseConfig';
import { get, remove, update } from '@firebase/database';

const SaveButton = (props: any) => {
  const userID = auth.currentUser?.uid

  const [saved, setSaved] = useState(false);
  // Render 1 lần từ db để load các bài đã save
  useEffect(() => {
    const checkIfSaved = async () => {
      const refPost = ref(database, `accounts/${userID}/savedPosts/${props.postID}`);
      const snapshot = await get(refPost);

      // Cập nhật trạng thái saved dựa trên dữ liệu từ Firebase
      if (snapshot.exists()) {
        setSaved(true); // Nếu postID đã tồn tại, đánh dấu là saved
      } else {
        setSaved(false); // Nếu không tồn tại, đánh dấu là unsaved
      }
    };

    if (userID) {
      checkIfSaved(); // Gọi hàm kiểm tra nếu có userID
    }
  }, []);


  // Hàm set save
  const handleSave = async (postID: any, userID: any) => {
    const refSavedList = ref(database, `accounts/${userID}/savedPosts/`);
    const refPost = ref(database, `accounts/${userID}/savedPosts/${postID}`)
    const snapshot = await get(refPost); // Kiểm tra xem postID đã tồn tại chưa

    try {
      if (snapshot.exists()) {
        // Nếu đã tồn tại, xóa postID khỏi savedList
        await remove(refPost);
        console.log('Đã bỏ lưu '+postID);
      } else {
        // Nếu không tồn tại, thêm vào savedList
        await update(refSavedList, {
          [postID]: true, // Thêm postID vào savedList
        });
        console.log(`Đã thêm ${postID} vào savedPosts`);
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật savedPosts:', error);
    }
    finally { // Đổi state
      setSaved(!saved);
    }
  }
  return (
    <TouchableOpacity delayPressOut={50} onPress={() => handleSave(props.postID, userID)} {...props}>
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