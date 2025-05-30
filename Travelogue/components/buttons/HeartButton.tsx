import { View, Text, Pressable, StyleSheet, TouchableOpacity, TouchableHighlight, TouchableHighlightComponent } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { AntDesign } from '@expo/vector-icons'
import Icon from 'react-native-vector-icons/FontAwesome';
import { auth, database, ref } from '@/firebase/firebaseConfig';
import { get, remove, runTransaction, set, update } from '@firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { formatNumberLike } from '@/utils';
import { useHomeProvider } from '@/contexts/HomeProvider';
import { useTourProvider } from '@/contexts/TourProvider';
import eventEmitter from "@/utils/eventEmitter";
import { useAccount } from '@/contexts/AccountProvider';
import { list } from 'firebase/storage';
import { useFocusEffect } from 'expo-router';

type Props = {
    data: any,
    type: number,
    liked: boolean
}

const HeartButton = ({ data, type, liked }: Props) => {
    const { likedPostsList }: any = useAccount()
    const { userId }: any = useHomeProvider()
    const [isProcessing, setIsProcessing] = useState(false)
    // const [isLiked, setIsLiked] = useState(data.id in likedPostsList)
    const [isLiked, setIsLiked] = useState(liked)
    const [likeNum, setLikeNum] = useState(data.likes)
    // const [currentLiked, setCurrentLiked] = useState(liked)

    // Hàm set like
<<<<<<< HEAD
    const handleLike = async (dataID: any, userID: any) => {
        setDisabled(true);
    
        const refColumn = type === 0 ? 'likedPostsList' : 'likedToursList';
        const refTable = type === 0 ? 'posts' : 'tours';
    
        const refLikedList = ref(database, `accounts/${userID}/${refColumn}/`);
        const refItemInLikedList = ref(database, `accounts/${userID}/${refColumn}/${dataID}`);
        const snapshot = await get(refItemInLikedList);
    
        const refLikesOfTable = ref(database, `${refTable}/${dataID}/likes`);
        const refScoresOfTable = ref(database, `${refTable}/${dataID}/scores`);
    
        // Lấy danh sách các tỉnh thành từ `locations`
        const locations = data.locations; // Đảm bảo `data.locations` chứa thông tin các tỉnh thành
        console.log("Locations:", locations);
    
        try {
            if (snapshot.exists()) {
                // UNLIKE: đã tồn tại -> xóa khỏi danh sách
                await remove(refItemInLikedList);
    
                // Giảm 1 lượt thích
                await runTransaction(refLikesOfTable, (currentValue) => {
                    return (currentValue || 0) - 1;
                });
    
                // Giảm 2 điểm
                await runTransaction(refScoresOfTable, (currentValue) => {
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
    
                setLikeNum(likeNum - 1);
                if (type === 0) {
                    setDataPosts([...updateArray(dataPosts, dataID, likeNum - 1)]);
                } else {
                    setDataTours([...updateArray(dataTours, dataID, likeNum - 1)]);
                }
    
                console.log('Đã bỏ thích ' + dataID);
=======
    const toggleLike = async () => {
        // Nếu đang xử lý, không cho phép nhấn lại
        if (isProcessing) {
            return;
        }
        setIsProcessing(true)
        // CẬP NHẬT DANH SÁCH LIKED CỦA USER
        // Tạo đường dẫn đến  likedPost hay likedTour của user
        const typeName = type === 0 ? 'likedPostsList' : 'likedToursList'
        const refLikedList = ref(database, `accounts/${userId}/${typeName}`);
        const refItemInLikedList = ref(database, `accounts/${userId}/${typeName}/${data.id}`);
        // Tạo đường dẫn đến bài viết/tour
        const tableName = type === 0 ? 'posts' : 'tours'
        const refLikeNumberOfItemInTable = ref(database, `${tableName}/${data.id}/likes`)

        try {
            const snapshot = await get(refItemInLikedList);
            if (snapshot.exists()) {
                // Hủy bỏ like trong mảng likedList
                await remove(refItemInLikedList);
                // Cập nhật like của bài viết
                runTransaction(refLikeNumberOfItemInTable, (currentValue) => {
                    return currentValue - 1; // Cập nhật dựa trên giá trị hiện tại
                }).then(() => {
                    // setLikeNum((prev: any) => prev - 1);
                    setLikeNum(likeNum - 1);
                    // if (type === 0) {
                    //     setDataPosts(updateElementAtIndex(dataPosts, data.id, likeNum - 1))
                    // } else {
                    //     setDataTours(updateElementAtIndex(dataTours, data.id, likeNum - 1))
                    // }
                })
                console.log('Đã bỏ thích và giảm like của ' + data.id);
>>>>>>> main
            } else {
                // LIKE: chưa tồn tại -> thêm vào danh sách
                await update(refLikedList, {
<<<<<<< HEAD
                    [dataID]: true,
                });
    
                // Tăng 1 lượt thích
                await runTransaction(refLikesOfTable, (currentValue) => {
                    return (currentValue || 0) + 1;
                });
    
                // Tăng 2 điểm
                await runTransaction(refScoresOfTable, (currentValue) => {
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
    
                setLikeNum(likeNum + 1);
                if (type === 0) {
                    setDataPosts([...updateArray(dataPosts, dataID, likeNum + 1)]);
                } else {
                    setDataTours([...updateArray(dataTours, dataID, likeNum + 1)]);
                }
    
                console.log(`Đã thêm ${dataID} vào likedList`);
=======
                    [data.id]: true, // Thêm postId vào savedList
                });
                runTransaction(refLikeNumberOfItemInTable, (currentValue) => {
                    return currentValue + 1; // Cập nhật dựa trên giá trị hiện tại
                }).then(() => {
                    // setLikeNum((prev: any) => prev + 1);
                    setLikeNum(likeNum + 1);
                    // if (type === 0) {
                    //     setDataPosts(updateElementAtIndex(dataPosts, data.id, likeNum + 1))
                    // } else {
                    //     setDataTours(updateElementAtIndex(dataTours, data.id, likeNum + 1))
                    // }
                })
                console.log(`Đã thêm ${data.id} vào likedList và tăng like`);
>>>>>>> main
            }

        } catch (error) {
            console.error('Lỗi khi cập nhật likedList:', error);
<<<<<<< HEAD
        } finally {
            setDisabled(false);
            setLiked(!liked);
        }
    };
    
=======
        } finally { // Đổi state
            setIsProcessing(false)
            setIsLiked(!isLiked);
        }
    }

>>>>>>> main
    return (
        <View style={styles.container}>
            <TouchableOpacity disabled={isProcessing} delayPressOut={20} onPress={toggleLike} >
                <AntDesign
                    name={isLiked ? 'heart' : 'hearto'}
                    size={24}
                    color={isLiked ? likedColor : unlikedColor} />
            </TouchableOpacity>
            <Text style={{ marginLeft: 6, fontWeight: '500' }}>{formatNumberLike(likeNum)}</Text>
            {/* <Text style={{ marginLeft: 6, fontWeight: '500' }}>{formatNumberLike(100110999)}</Text> */}
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
