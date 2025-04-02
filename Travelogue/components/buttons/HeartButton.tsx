import { View, Text, Pressable, StyleSheet, TouchableOpacity, TouchableHighlight, TouchableHighlightComponent } from 'react-native'
import React, { useEffect, useState } from 'react'
import { AntDesign } from '@expo/vector-icons'
import Icon from 'react-native-vector-icons/FontAwesome';
import { auth, database, ref } from '@/firebase/firebaseConfig';
import { get, remove, runTransaction, update } from '@firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { formatNumberLike } from '@/utils';
import { useHomeProvider } from '@/contexts/HomeProvider';
import { useTourProvider } from '@/contexts/TourProvider';
import eventEmitter from "@/utils/eventEmitter";


const HeartButton = (props: any) => {
    // const userID = auth.currentUser?.uid
    const type = props.type
    // const data = props.data
    const [userID, setUserID] = useState('')
    const [liked, setLiked] = useState(false);
    const [data, setData] = useState(props.data)
    const [likeNum, setLikeNum] = useState(props.data.likes)
    const [disabled, setDisabled] = useState(false)
    const { dataPosts, setDataPosts }: any = useHomeProvider()
    const { dataTours, setDataTours }: any = useTourProvider()
    const updateArray = (data: any, id: string, newLikeNumber: number) => {
        const temp = data.map((item: any) =>
            item.id === id ? { ...item, likes: newLikeNumber } : item
        )
        return temp
    };

    useEffect(() => {
        if (type === 0) {
            // Tìm item có id cụ thể
            const dataItem = dataPosts.find((item: any) => item.id === data.id);
            if (dataItem) {
                setLikeNum(dataItem.likes); // Cập nhật likeNum dựa trên item tìm thấy
            }
        } else {
            // Tìm item có id cụ thể
            const dataItem = dataTours.find((item: any) => item.id === data.id);
            if (dataItem) {
                setLikeNum(dataItem.likes); // Cập nhật likeNum dựa trên item tìm thấy
            }
        }
    }, [dataPosts, dataTours])


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
            const refColumn = type == 0 ? 'likedPostsList' : 'likedToursList'
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
    }, [userID, dataPosts, dataTours]);

    // Hàm set like
    const handleLike = async (dataID: any, userID: any) => {
        setDisabled(true)
        // Cập nhật list like của account
        // Phan loại
        const refColumn = type === 0 ? 'likedPostsList' : 'likedToursList'
        const refTable = type === 0 ? 'posts' : 'tours'
        // Các ref
        const refLikedList = ref(database, `accounts/${userID}/${refColumn}/`);
        const refItemInLikedList = ref(database, `accounts/${userID}/${refColumn}/${dataID}`)
        const snapshot = await get(refItemInLikedList); // Kiểm tra xem postID đã tồn tại chưa
        const refLikesOfTable = ref(database, `${refTable}/${dataID}/likes`)

        try {
            if (snapshot.exists()) { // Đã like post/tour 
                // Nếu đã tồn tại, xóa postID khỏi likedList
                await remove(refItemInLikedList);
                // Cập nhật like của bài viết
                runTransaction(refLikesOfTable, (currentValue) => {
                    return currentValue - 1; // Cập nhật dựa trên giá trị hiện tại
                }).then(() => {
                    setLikeNum(likeNum - 1)
                    if (type === 0) {
                        setDataPosts([...updateArray(dataPosts, dataID, likeNum - 1)])
                    } else {
                        setDataTours([...updateArray(dataTours, dataID, likeNum - 1)])
                    }
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

                // Cập nhật like của bài viết
                runTransaction(refLikesOfTable, (currentValue) => {
                    return currentValue + 1; // Cập nhật dựa trên giá trị hiện tại
                }).then(() => {
                    setLikeNum(likeNum + 1)
                    if (type === 0) {
                        setDataPosts([...updateArray(dataPosts, dataID, likeNum + 1)])
                    } else {
                        setDataTours([...updateArray(dataTours, dataID, likeNum + 1)])
                    }
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
            setDisabled(false)
            setLiked(!liked);
        }

    }
    return (
        <View style={styles.container}>
            <TouchableOpacity disabled={disabled} delayPressOut={50} onPress={() => handleLike(data.id, userID)} {...props}>
                <AntDesign
                    name={liked ? 'heart' : 'hearto'}
                    size={24}
                    color={liked ? likedColor : unlikedColor} />
            </TouchableOpacity>
            {/* <Text style={{ marginLeft: 6, fontWeight: '500' }}>{formatNumberLike(likeNum)}</Text> */}
            <Text style={{ marginLeft: 6, fontWeight: '500' }}>{formatNumberLike(100110999)}</Text>
        </View>

    )
}

// Style
const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    }
})
const likedColor = "red";
const unlikedColor = "black";
export default HeartButton;
