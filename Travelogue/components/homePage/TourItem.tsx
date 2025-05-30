import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useMemo, useState } from 'react'
import { database, get, ref, update } from '@/firebase/firebaseConfig'
import { router } from 'expo-router'
import { useHomeProvider } from '@/contexts/HomeProvider'
import { FontAwesome, FontAwesome6, Ionicons } from '@expo/vector-icons'
import { averageRating } from '@/utils/commons'
import { backgroundColors, iconColors } from '@/assets/colors'
import SaveButton from '../buttons/SaveButton'
import { Marquee } from '@animatereactnative/marquee'

const { width } = Dimensions.get('window');
const TYPE = 1 // 0: post, 1: tour
export type TourModal = {
    author: {
        avatar: string,
        fullname: string,
        id: string
    },
    content: string,
    created_at: number,
    discountTour: number,
    hashtag: string,
    id: string,
    images: {
        [country: string]: {
            [locationId: string]: {
                city_name: string,
                images_value: [string]
            }
        }
    },
    // isCheckIn: boolean,
    likes: number,
    locations: {
        [country: string]: {
            [locationId: string]: string
        }
    },
    match: number,
    mode: number,
    money: number,
    package: {
        discount: number,
        hashtag: number,
        id: string,
        minAccumulated: number,
        name: string,
        price: number,
    },
    ratingSummary: {
        totalRatingCounter: number,
        totalRatingValue: number,
    }
    reports: number,
    saves: number,
    scores: number,
    status_id: number,
    thumbnail: string,
    title: string
}
type Props = {
    data: TourModal,
    index: number,
    liked: boolean,
    // userId: string,
    // onTapLocationItemMenu?: (selectedCityId: string, selectedCountryId: string, userId: string) => void | undefined,
    onTapToViewDetail?: (path: any, postId: string) => void | undefined
    onTapToViewProfile?: (authorId: string) => Promise<void> | undefined,
};

const TourItem = ({ data, index, liked, onTapToViewDetail, onTapToViewProfile }: Props) => {
    const { userId }: any = useHomeProvider()
    const [indexVisibleMenu, setIndexVisibleMenu] = useState(-1);


    const handleTapOnLocationInMenu = useCallback((selectedCityId: string, selectedCountryId: string, userId: string) => {
        const updateAndNavigate = async () => {
            // Update hành vi lên firebase
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
        updateAndNavigate()
    }, [])

    const allLocations = useMemo(() => {
        if (!data.locations) {
            return []
        }
        return Object.keys(data.locations).flatMap((country) =>
            Object.entries(data.locations[country]).map(([id, name]) => ({
                id,
                name,
                country,
            }))
        );
    }, []);

    const originalPrice = data.money
    const promotionalPrice = data.money * (100 - data.discountTour) / 100
    return (
        <TouchableOpacity style={styles.tourItem} key={data.id}
            onPress={() => onTapToViewDetail?.('/tourDetail', data.id)}
        >
            <View style={styles.tourItemHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity
                        onPress={() => onTapToViewProfile?.(data.author.id)}
                    >
                        <Image source={{ uri: data.author.avatar }} style={{ width: 'auto', height: '100%', borderRadius: 20, aspectRatio: 1 }}>
                        </Image>
                    </TouchableOpacity>

                    <Text style={{ marginLeft: 6, fontWeight: '500' }}>{data.author.fullname}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <SaveButton data={data} type={TYPE}></SaveButton>
                </View>
            </View>
            <View style={styles.tourItemImageSection}>
                <View style={{ backgroundColor: 'white', borderRadius: 20, flex: 1, elevation: 6, }}>
                    <Image
                        style={styles.image}
                        source={{ uri: data.thumbnail }}
                    />
                </View>
            </View>
            <View style={styles.tourItemContentSection}>
                <View style={{ paddingHorizontal: 20, paddingVertical: 10 }}>
                    <Text style={styles.tourItemTitle} numberOfLines={1} ellipsizeMode='tail'>{data.title}</Text>

                    {/* <View style={{ flexDirection: 'row', alignItems: 'center' }}> */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 10, justifyContent: 'space-between' }}>
                        {/* Time */}
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Ionicons name="calendar" size={22} color={iconColors.green1} />
                            <Text style={{ fontSize: 18, paddingLeft: 10 }}>4 ngày</Text>
                        </View>
                        {/* Rating */}
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <FontAwesome6 name="ranking-star" size={20} color={iconColors.green1} />
                            <Text style={{ fontSize: 18, paddingRight: 4, paddingLeft: 10 }}>{averageRating(data.ratingSummary.totalRatingValue, data.ratingSummary.totalRatingCounter).toFixed(1)}</Text>
                            <View style={{ alignItems: 'center', justifyContent: 'center' }} >
                                <FontAwesome name="star" size={18} color={iconColors.starRating} />
                            </View>
                        </View>
                    </View>
                    {/* </View> */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <View>
                            <FontAwesome6 name="money-check-dollar" size={24} color={iconColors.green1} />
                        </View>
                        {data.discountTour !== 0 ?
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
                        <View style={{ width: 2, height: 26, backgroundColor: iconColors.green1, marginHorizontal: 6 }}></View>
                        <Text style={{ fontSize: 18 }}>1</Text>
                        <Ionicons name="people" size={20} color={iconColors.green1} />
                    </View>
                </View>
                <View style={[styles.dotCustom, { left: -10, borderLeftWidth: 0, }]}></View>
                <View style={[styles.dotCustom, { right: -10 }]}></View>
            </View>
            <View style={styles.tourFooterSection}>
                <View style={styles.locationWrap}>
                    <Marquee style={{ flex: 1 }} spacing={0} speed={1} >
                        <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' }}>
                            {allLocations.map((location: any) => (
                                <TouchableOpacity
                                    key={location.id}
                                    style={{ paddingHorizontal: 10 }}
                                    onPress={() => handleTapOnLocationInMenu(location.id, location.country, userId)}>
                                    <Text style={{}}>{location.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </Marquee>
                </View>
            </View>
        </TouchableOpacity>
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

export default TourItem