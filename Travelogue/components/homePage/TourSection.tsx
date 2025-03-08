import { View, Text, FlatList, StyleSheet, Image, ScrollView, Dimensions, TouchableOpacity, Pressable } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import Carousel from 'react-native-reanimated-carousel';
import { database, onValue, ref, update } from '@/firebase/firebaseConfig';
import { types } from '@babel/core';
import { useHomeProvider } from '@/contexts/HomeProvider';
import SkeletonTourHome from '../skeletons/SkeletonTourHome';
import { router } from 'expo-router';
import { useTourProvider } from '@/contexts/TourProvider';
import { IconButton, MD3Colors } from 'react-native-paper';
import { Feather, FontAwesome, FontAwesome6, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Marquee } from '@animatereactnative/marquee';
import { averageRating } from "@/utils/commons"
import SaveButton from '../buttons/SaveButton';


const { width } = Dimensions.get('window');
const TourSection = () => {
    // const [dataTours, setDataTours] = useState([])
    const { dataTours, loadedTours,
        dataToursSorted, setDataToursSorted
    }: any = useHomeProvider();
    const { setSelectedTour }: any = useTourProvider()
    const { dataAccount }: any = useHomeProvider()
    const flatListTourRef: any = useRef(null)
    useEffect(() => {
        if (flatListTourRef.current) {
            flatListTourRef.current.scrollToOffset({ offset: 0, animated: true });
        }
    }, [dataToursSorted]);

    const handleTapOnLocationInMenu = async (selectedCityId: any, selectedCountryId: any) => {
        // Update hành vi lên firebase
        const userId = dataAccount.id
        // 1. Lưu lên firebase
        const refBehavior = ref(database, `accounts/${userId}/behavior`);
        const dataUpdate = {
            content: "",
            location: [selectedCityId],
        };
        await update(refBehavior, dataUpdate);

        router.push({
            pathname: "/gallery",
            params: { idCity: selectedCityId, idCountry: selectedCountryId },
        });
    }
    const tourItem = (tour: any) => {
        const locations: any = tour.item.locations
        const allLocations: any[] = Object.keys(locations).flatMap((country: any) => //Object.keys(locations): lấy được mảng ["avietnam", "japan"]
            // Lấy các giá trị (địa điểm) của từng country (vd: Hà Nội, Cao Bằng)
            Object.entries(locations[country]).map(([id, name]) => ({
                id,
                name,
                country
            }))
        );

        const originalPrice = tour.item.money
        const promotionalPrice = tour.item.money * (100 - tour.item.discountTour) / 100
        return (
            // <View style={styles.tourItemContainer}>
            <TouchableOpacity style={styles.tourItem} key={tour.item.id}
                onPress={() => {
                    router.push({
                        pathname: "/tourDetail",
                        params: { tourId: tour.item.id },
                    });
                }}>
                <View style={styles.tourItemHeader}>
                    <Image source={{ uri: tour.item.author.avatar }} style={{ width: 'auto', height: '100%', borderRadius: 20, aspectRatio: 1 }}>
                    </Image>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <FontAwesome name="bookmark-o" size={30} color="black" />
                    </View>
                </View>
                <View style={styles.tourItemImageSection}>
                    <View style={{ backgroundColor: 'white', borderRadius: 20, flex: 1, elevation: 6, }}>
                        <Image
                            style={styles.image}
                            source={{ uri: tour.item.thumbnail }}
                        />
                    </View>
                </View>
                <View style={styles.tourItemContentSection}>
                    <View style={{ paddingHorizontal: 20, paddingVertical: 10 }}>
                        <Text style={styles.tourItemTitle} numberOfLines={1} ellipsizeMode='tail'>{tour.item.title}</Text>

                        {/* <View style={{ flexDirection: 'row', alignItems: 'center' }}> */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 10, justifyContent: 'space-between' }}>
                            {/* Time */}
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Ionicons name="calendar" size={22} color="black" />
                                <Text style={{ fontSize: 18, paddingLeft: 10 }}>4 ngày</Text>
                            </View>
                            {/* Rating */}
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <FontAwesome6 name="ranking-star" size={22} color="black" />
                                <Text style={{ fontSize: 18, paddingRight: 4, paddingLeft: 10 }}>{averageRating(tour.item.ratingSummary.totalRatingValue, tour.item.ratingSummary.totalRatingCounter).toFixed(1)}</Text>
                                <View style={{ alignItems: 'center', justifyContent: 'center' }} >
                                    <FontAwesome name="star" size={18} color="#FFD700" />
                                </View>
                            </View>
                        </View>
                        {/* </View> */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <View>
                                <FontAwesome6 name="money-check-dollar" size={24} color="black" />
                            </View>
                            {tour.item.discountTour !== 0 ?
                                <View style={styles.tourPriceContainer}>
                                    <Text style={styles.tourOriginalPrice}>{originalPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</Text>
                                    <Text style={styles.tourDiscountedPrice}>{promotionalPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</Text>
                                </View>
                                :
                                <View style={[styles.tourPriceContainer, { justifyContent: 'flex-end' }]}>
                                    <Text style={styles.tourDiscountedPrice}>{originalPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</Text>
                                </View>
                            }
                            {/* <Text style={{fontSize: 18, color:'#c1c1c1'}}> <Text style={{fontSize:22}}>|</Text>|1</Text> */}
                            <View style={{ width: 2, height: 26, backgroundColor: '#c1c1c1', marginHorizontal: 6 }}></View>
                            <Text style={{ fontSize: 18, color: "#c1c1c1" }}>1</Text>
                            <Ionicons name="people" size={20} color="#c1c1c1" />
                        </View>

                    </View>
                    <View style={[styles.dotCustom, { left: -10 }]}></View>
                    <View style={[styles.dotCustom, { right: -10 }]}></View>
                </View>
                <View style={styles.tourFooterSection}>
                    {/* <Feather name="phone-call" size={24} color="black" />
                    <Text style={{ color: 'black', fontSize: 18, fontWeight: '500', fontStyle: 'italic' }}>Liên hệ</Text> */}
                    <View style={styles.locationWrap}>
                        {/* <View style={{ height: '100%', paddingHorizontal: 16, marginRight: 10, backgroundColor: 'white', borderColor: '#ff0000', justifyContent: 'center', borderRightWidth: 5 }} >
                            <MaterialCommunityIcons name="flag-variant-outline" size={24} color="black" />
                        </View> */}
                        <Marquee style={{ flex: 1 }} spacing={0} speed={1} >
                            <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' }}>
                                {allLocations.map((location: any) => (
                                    <TouchableOpacity
                                        key={location.id}
                                        style={{ paddingHorizontal: 10 }}
                                        onPress={() => handleTapOnLocationInMenu(location.id, location.country)}>
                                        <Text style={{}}>{location.name}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </Marquee>
                        <View>
                            {/* <Carousel
                                loop
                                width={(width * 2 / 3) - 120}
                                height={28}
                                autoPlay={true}
                                data={allLocations}
                                autoPlayInterval={0}
                                scrollAnimationDuration={3000}
                                renderItem={({ item }) => (
                                    <TouchableOpacity key={item.id} style={{ flex: 1, justifyContent: 'center' }} onPress={() => handleTapOnLocationInMenu(item.id, item.country)}>
                                        <Text style={{ textAlign: 'center', fontSize: 15 }}>
                                            {item.name + ""}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            /> */}
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
            // </View>

        )
    }

    return (
        <View style={{}}>
            {loadedTours ?
                <FlatList
                    // ref={flatListTourRef}
                    horizontal={true}
                    // scrollToOffset={ }
                    data={dataToursSorted}
                    renderItem={tourItem}
                    keyExtractor={(tour: any) => tour.id}
                    contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
                    ItemSeparatorComponent={() => <View style={{ width: 20 }} />}
                // pagingEnabled
                >
                </FlatList>
                :
                <View style={{ paddingTop: 10, display: 'flex', flexDirection: 'row', gap: 10, paddingLeft: 10, paddingBottom: 20 }}>
                    <SkeletonTourHome />
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
        backgroundColor: '#EAEAEA',
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
        backgroundColor: '#f96161',
        // backgroundColor: 'blue',
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