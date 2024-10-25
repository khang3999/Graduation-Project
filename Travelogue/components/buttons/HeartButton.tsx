import { View, Text, Pressable, StyleSheet, TouchableOpacity, TouchableHighlight, TouchableHighlightComponent } from 'react-native'
import React, { useEffect, useState } from 'react'
import { AntDesign } from '@expo/vector-icons'
import Icon from 'react-native-vector-icons/FontAwesome';
import { auth, database, ref } from '@/firebase/firebaseConfig';
import { get, remove, update } from '@firebase/database';


const HeartButton = (props: any) => {
    const userID = auth.currentUser?.uid
    
    const [liked, setLiked] = useState(false);
    // Render 1 lần từ db để load các bài đã like
    useEffect(() => {
        const checkIfSaved = async () => {
            const refPost = ref(database, `accounts/${userID}/likedList/${props.postID}`);
            
            const snapshot = await get(refPost);

            // Cập nhật trạng thái saved dựa trên dữ liệu từ Firebase
            if (snapshot.exists()) {
                setLiked(true); // Nếu postID đã tồn tại, đánh dấu là saved
            } else {
                setLiked(false); // Nếu không tồn tại, đánh dấu là unsaved
            }
        };

        if (userID) {
            checkIfSaved(); // Gọi hàm kiểm tra nếu có userID
        }
    }, []);

    // Hàm set like
    const handleLike =  async (postID: any, userID: any) => {
        const refLikeList = ref(database, `accounts/${userID}/likedList/`);
        const refPost = ref(database, `accounts/${userID}/likedList/${postID}`)
        const snapshot = await get(refPost); // Kiểm tra xem postID đã tồn tại chưa

        try {
            if (snapshot.exists()) {
                // Nếu đã tồn tại, xóa postID khỏi savedList
                await remove(refPost);
                console.log('Đã bỏ thích ' + postID);
            } else {
                // Nếu không tồn tại, thêm vào savedList
                await update(refLikeList, {
                    [postID]: true, // Thêm postID vào savedList
                });
                console.log(`Đã thêm ${postID} vào likedList`);
            }
        } catch (error) {
            console.error('Lỗi khi cập nhật likedList:', error);
        }
        finally { // Đổi state
            setLiked(!liked);
        }

    }
    return (
        <TouchableOpacity delayPressOut={50} onPress={() => handleLike(props.postID, userID)} {...props}>
            <AntDesign
                name={liked ? 'heart' : 'hearto'}
                size={24}
                color={liked ? likedColor : unlikedColor} />
        </TouchableOpacity>
    )
}

// Style
const likedColor = 'red'
const unlikedColor = 'black'
export default HeartButton