import { View, Text, Pressable, StyleSheet, TouchableOpacity, TouchableHighlight, TouchableHighlightComponent } from 'react-native'
import React, { useEffect, useState } from 'react'
import { AntDesign } from '@expo/vector-icons'
import Icon from 'react-native-vector-icons/FontAwesome';
import { auth, database, ref } from '@/firebase/firebaseConfig';
import { get, remove, runTransaction, update } from '@firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { formatNumberLike } from '@/utils';


const HeartButton = (props: any) => {
    // const userID = auth.currentUser?.uid
    const type = props.type
    const data = props.data
    const [userID, setUserID] = useState('')
    const [liked, setLiked] = useState(false);
    const [likeNum, setLikeNum] = useState(data.likes)

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


    // Render 1 lần từ db để load các bài đã like
    useEffect(() => {
        const checkIfLiked = async () => {
            const refColumn = type == 0 ? 'likedPostsList':'likedToursList'
            const refAccountList = ref(database, `accounts/${userID}/${refColumn}/${data.id}`);
            const snapshot = await get(refAccountList);

            // Cập nhật trạng thái saved dựa trên dữ liệu từ Firebase
            if (snapshot.exists()) {
                setLiked(true); // Nếu postID đã tồn tại, đánh dấu là saved
            } else {
                setLiked(false); // Nếu không tồn tại, đánh dấu là unsaved
            }
        };

        if (userID) {
            checkIfLiked(); // Gọi hàm kiểm tra nếu có userID
        }
    }, [userID]);

    // Hàm set like
    const handleLike = async (dataID: any, userID: any) => {
        // Cập nhật list like của account
        // Phan loại
        const refColumn = type == 0 ? 'likedPostsList':'likedToursList'
        const refTable = type == 0 ? 'posts':'tours'
        // Các ref
        const refLikedList = ref(database, `accounts/${userID}/${refColumn}/`);
        const refItemInLikedList = ref(database, `accounts/${userID}/${refColumn}/${dataID}`)
        const snapshot = await get(refItemInLikedList); // Kiểm tra xem postID đã tồn tại chưa
        const refLikesOfTable = ref(database, `${refTable}/${dataID}/likes`)

        try {
            if (snapshot.exists()) {
                // Nếu đã tồn tại, xóa postID khỏi savedList
                await remove(refItemInLikedList);
                setLikeNum(likeNum - 1)
                // Cập nhật like của bài viết
                runTransaction(refLikesOfTable, (currentValue) => {
                    return currentValue - 1; // Cập nhật dựa trên giá trị hiện tại
                }).then(() => {
                    console.log("Update like successfully committed!");
                }).catch((error) => {
                    console.error("Transaction failed: ", error);
                });
                console.log('Đã bỏ thích ' + dataID);
            } else {
                // Nếu không tồn tại, thêm vào savedList
                await update(refLikedList, {
                    [dataID]: true, // Thêm postID vào savedList
                });

                setLikeNum(likeNum + 1)

                // Cập nhật like của bài viết
                runTransaction(refLikesOfTable, (currentValue) => {
                    return currentValue + 1; // Cập nhật dựa trên giá trị hiện tại
                }).then(() => {
                    console.log("Update like successfully committed!");
                }).catch((error) => {
                    console.error("Transaction failed: ", error);
                });
                console.log(`Đã thêm ${dataID} vào likedList`);
            }
        } catch (error) {
            console.error('Lỗi khi cập nhật likedList:', error);
        }
        finally { // Đổi state
            setLiked(!liked);
        }

    }
    return (
        <>
            <TouchableOpacity delayPressOut={50} onPress={() => handleLike(data.id, userID)} {...props}>
                <AntDesign
                    name={liked ? 'heart' : 'hearto'}
                    size={24}
                    color={liked ? likedColor : unlikedColor} />
            </TouchableOpacity>
            <Text style={{ fontWeight: '500'}}>{formatNumberLike(likeNum)}</Text>
        </>

    )
}

// Style
const likedColor = 'red'
const unlikedColor = 'black'
export default HeartButton