import { View, Text, FlatList, StyleSheet, Image, ScrollView, Dimensions, TouchableOpacity, Pressable } from 'react-native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import Carousel from 'react-native-reanimated-carousel';
import { database, get, onValue, ref, update } from '@/firebase/firebaseConfig';
import { types } from '@babel/core';
import { useHomeProvider } from '@/contexts/HomeProvider';
import SkeletonTourHome from '../skeletons/SkeletonTourHome';
import { router, useFocusEffect } from 'expo-router';
import { useTourProvider } from '@/contexts/TourProvider';
import { IconButton, MD3Colors } from 'react-native-paper';
import { Feather, FontAwesome, FontAwesome6, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Marquee } from '@animatereactnative/marquee';
import { averageRating } from "@/utils/commons"
import SaveButton from '../buttons/SaveButton';
import { backgroundColors, iconColors } from '@/assets/colors';
import { useAccount } from '@/contexts/AccountProvider';
import TourItem, { TourModal } from './TourItem';


const { width } = Dimensions.get('window');
const TYPE = 1
const TourSection = () => {
    // const [dataTours, setDataTours] = useState([])
    const {
        dataToursSorted,
        reload,
        isLoading,
        setIsLoading
    }: any = useHomeProvider();
    const { setSearchedAccountData, likedPostsList, setLikedPostsList, }: any = useAccount();
    const flatListTourRef: any = useRef(null)
    // useEffect(() => {
    //     if (flatListTourRef.current) {
    //         flatListTourRef.current.scrollToOffset({ offset: 0, animated: true });
    //     }
    // }, [reload]);

    useFocusEffect(
        useCallback(() => {
            setIsLoading(true)
            // Scroll to first item in list 
            if (flatListTourRef.current) {
                flatListTourRef.current.scrollToOffset({ offset: 0, animated: true });
            }
        }, [reload])
    )


    // CÁC HÀM XỬ LÍ SỰ KIỆN
    // Hàm xem chi tiết bài viết
    const handleTapToViewTourDetail = useCallback((path: any, tourId: string) => {
        router.push({
            pathname: path,
            params: { tourId: tourId },
        });
    }, [])
    
    // Định nghĩa hàm xử lý sự kiện khi người dùng nhấn vào chủ bài viết để xem chi tiết trang cá nhân - DONE
    const handleTapToViewProfile = useCallback(async (authorId: string) => {
        if (!authorId) {
            console.log('Go to profile fail: check authorId');
            return
        }
        try {
            const refAccount = ref(database, `accounts/${authorId}`)
            const snapshot = await get(refAccount);
            if (snapshot.exists()) {
                const dataAccountJson = snapshot.val()
                await setSearchedAccountData(dataAccountJson)
                router.push("/SearchResult");
            } else {
                console.log("Go to profile: No data account available");
            }
        } catch (error) {
            console.error("Go to profile: Error fetching data account: ", error);
        }
    }, [])

    const tourItem = useCallback((tour: any) => {
        const tourData: TourModal = tour.item
        const itemIndex = tour.index
        return (
            <TourItem
                // key={tourData.id}
                data={tourData}
                index={itemIndex}
                liked={tourData.id in likedPostsList}
                onTapToViewDetail={handleTapToViewTourDetail}
                onTapToViewProfile={handleTapToViewProfile}
            />
        )

    }, [])

    return (
        <View style={{}}>
            {!isLoading ?
                <FlatList
                    ref={flatListTourRef}
                    horizontal={true}
                    // scrollToOffset={ }
                    data={dataToursSorted}
                    renderItem={tourItem}
                    keyExtractor={(tour: any) => tour.id}
                    contentContainerStyle={{ padding: 20 }}
                    ItemSeparatorComponent={() => <View style={{ width: 20 }} />}
                // pagingEnabled
                >
                </FlatList>
                :
                <View style={{ paddingTop: 20, display: 'flex', flexDirection: 'row', gap: 20, paddingLeft: 20, paddingBottom: 20 }}>
                    <SkeletonTourHome />
                    <SkeletonTourHome />
                </View>
            }
        </View >
    )
}
const styles = StyleSheet.create({
    tourDiscountedPrice: {
        fontSize: 18,
        // fontFamily: 'NotoSans_600SemiBold',
    },
    tourOriginalPrice: {
        textDecorationLine: 'line-through',
        // fontFamily: 'NotoSans_500Medium',
        color: '#c1c1c1'
    },
    tourPriceContainer: {
        flex: 1,
        // paddingVertical: 8,
        marginLeft: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        // backgroundColor:'red'
    },
    dotCustom: {
        position: 'absolute',
        width: 20,
        height: 20,
        borderRadius: 50,
        backgroundColor: backgroundColors.background1,
        top: -10,
    },
    locationWrap: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: 'white',
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderTopWidth: 3,
        borderStyle: 'dotted',
        borderColor: '#d3d3d3',
    },
    tourItemTitle: {
        fontSize: 20,
        // fontFamily: 'NotoSans_600SemiBold',
        fontWeight: '500',
        marginBottom: 0
    },
    image: {
        flex: 1,
        borderRadius: 20,
        elevation: 10,
        // overlayColor: 'white'
    },
    tourFooterSection: {
        flexDirection: 'row',
        backgroundColor: iconColors.green5,
        // backgroundColor: '#7B9A6D',
        height: '12%',
        width: '100%',
        justifyContent: 'center',
        alignItems: 'flex-start',
        overflow: 'hidden',
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    tourItemContentSection: {
        width: '100%',
        height: '28%',
        // padding: 10,
        borderTopWidth: 3,
        borderStyle: 'dashed',
        borderColor: '#d3d3d3',
        justifyContent: 'space-around',
    },
    tourItemImageSection: {
        width: '100%',
        height: '50%',
        padding: 14,
        // paddingBottom: 20,
        borderRadius: 20,
    },
    tourItemHeader: {
        width: '100%',
        height: '10%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        // backgroundColor: 'red',
        paddingHorizontal: 14,
        paddingTop: 10,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    tourItem: {
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
        height: 460,
        width: width * 2 / 3,
        // overflow: 'hidden',
        elevation: 4
    }
})
export default TourSection