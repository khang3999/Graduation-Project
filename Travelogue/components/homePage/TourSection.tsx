import { View, Text, FlatList, StyleSheet, Image, ScrollView, Dimensions, TouchableOpacity, Pressable } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import Carousel from 'react-native-reanimated-carousel';
import { database, onValue, ref, update } from '@/firebase/firebaseConfig';
import { types } from '@babel/core';
import { useHomeProvider } from '@/contexts/HomeProvider';
import SkeletonTourHome from '../skeletons/SkeletonTourHome';
import { router } from 'expo-router';
import { useTourProvider } from '@/contexts/TourProvider';

const { width } = Dimensions.get('window');
const TourSection = () => {
    // const [dataTours, setDataTours] = useState([])
    const { dataTours, loadedTours,
        dataToursSorted, setDataToursSorted
    }: any = useHomeProvider();
    const { setSelectedTour }: any = useTourProvider()
    const {dataAccount}:any = useHomeProvider()
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
        return (
            <Pressable style={styles.tourItem} key={tour.item.id}
                onPress={() => {
                    router.push({
                        pathname: "/tourDetail",
                        params: { tourId: tour.item.id },
                    });
                }}>
                <View style={styles.imageWrap}>
                    <View style={styles.locationWrap}>
                        <Carousel
                            loop
                            width={(width - 40) / 3}
                            height={30}
                            autoPlay={true}
                            data={allLocations}
                            autoPlayInterval={0}
                            scrollAnimationDuration={3000}
                            style={{ borderTopLeftRadius: 10, borderTopRightRadius: 10 }}
                            // onSnapToItem={(index) => console.log('current index:', index)}
                            renderItem={({ item }) => (
                                <TouchableOpacity key={item.id} style={{ flex: 1, justifyContent: 'center'}} onPress={()=>handleTapOnLocationInMenu(item.id, item.country)}>
                                    <View style={{ backgroundColor: 'grey', opacity: 0.6, width: '100%', height: 30, position: 'absolute' }}></View>
                                    <Text style={{ textAlign: 'center', fontSize: 14, color: 'white' }}>
                                        {item.name + ""}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                    <Image
                        style={styles.image}
                        source={{ uri: tour.item.thumbnail }}
                    />
                </View>
                <View style={styles.overPlay}></View>
            </Pressable>
        )
    }

    return (
        <View style={styles.container}>
            <Text style={[styles.textCategory, { width: 'auto', marginTop: 12 }]}>Tour du lịch siêu hot</Text>
            {loadedTours ?
                <FlatList
                    // ref={flatListTourRef}
                    horizontal={true}
                    // scrollToOffset={ }
                    data={dataToursSorted}
                    renderItem={tourItem}
                    keyExtractor={(tour: any) => tour.id}
                    contentContainerStyle={{ marginBottom: 8, paddingHorizontal: 10, paddingVertical: 10 }}
                    ItemSeparatorComponent={() => <View style={{ width: 10, }} />}
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
    textCategory: {
        fontSize: 14,
        backgroundColor: '#f0f0f0',
        borderTopRightRadius: 10,
        borderBottomRightRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 5,
        fontWeight: '500',
        alignSelf: 'flex-start',
        elevation: 10
    },
    textLocation: {
        color: 'white'
    },
    overPlay: {
        backgroundColor: 'black',
        position: 'absolute',
        width: "100%",
        height: "100%",
        // zIndex: 3,
        opacity: 0.4,
        borderRadius: 10,
    },
    locationWrap: {
        position: 'absolute',
        zIndex: 4,
        height: 30,
        top: 0
    },
    image: {
        width: (width - 40) / 3,
        height: "100%",
        borderRadius: 10,
    },
    imageWrap: {
        position: 'relative',
    },
    tourItem: {
        position: 'relative',
        // backgroundColor: 'green',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        height: 90,
        elevation: 6
    },
    container: {
        flexDirection: 'column',
        justifyContent: 'center',
    }
})
export default TourSection