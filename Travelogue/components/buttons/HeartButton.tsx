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
            } else {
                // LIKE: chưa tồn tại -> thêm vào danh sách
                await update(refLikedList, {
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
            }
        } catch (error) {
            console.error('Lỗi khi cập nhật likedList:', error);
        } finally {
            setDisabled(false);
            setLiked(!liked);
        }
    };
    
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
