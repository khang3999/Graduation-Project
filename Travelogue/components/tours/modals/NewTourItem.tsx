import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useMemo } from 'react'
import { TourModal } from '../../homePage/TourItem'
import { useHomeProvider } from '@/contexts/HomeProvider';
import { database, ref, update } from '@/firebase/firebaseConfig';
import { router } from 'expo-router';
import { Badge } from 'react-native-paper';
import { formatDate } from '@/utils/commons';
const { width } = Dimensions.get('window')

type Props = {
    data: TourModal,
    onTapToViewDetail?: (path: any, postId: string) => void | undefined
    onTapToViewProfile?: (authorId: string) => void | undefined,
};
const NewTourItem = ({ data, onTapToViewDetail, onTapToViewProfile }: Props) => {
    const { userId }: any = useHomeProvider()

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
    const promotionalPrice = data.money * (100 - data.discountTour) / 100
    return (
        <View key={data.id} style={styles.itemNewPostWrap}>
            <TouchableOpacity style={styles.authorNewPost} onPress={() => onTapToViewProfile?.(data.author.id)}>
                <Image style={{ width: 30, height: 30, borderRadius: 90 }} source={{ uri: data.author.avatar }} />
                <Text style={{ fontWeight: '500', paddingHorizontal: 4 }} numberOfLines={1}>
                    {data.author.fullname}
                </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.itemNewPostContent}
                onPress={() => onTapToViewDetail?.('tourDetail', data.id)}
            >
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', elevation: 4, borderRadius: 10, }}>
                    <Image style={{ width: '100%', borderRadius: 10, aspectRatio: 1 }} source={{ uri: data.thumbnail }}></Image>
                </View>
                <View style={{ flex: 1.5, paddingLeft: 10 }}>
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={styles.textTitle} numberOfLines={1}> {data.title}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', flex: 1, alignItems: 'flex-start', flexWrap: 'wrap', padding: 2 }}>
                        <Text style={{ fontWeight: '500', textAlign: 'center' }}>Địa điểm: </Text>
                        {allLocations.map((location) => {
                            return (
                                <TouchableOpacity
                                    key={location?.id}
                                    onPress={() => handleTapOnLocationInMenu?.(location?.id, location.country, userId)}>
                                    <Badge size={22} key={location.id} style
                                        ={{ marginHorizontal: 2, paddingHorizontal: 8 }}>{location.name}</Badge>
                                </TouchableOpacity>
                            )
                        })}
                    </View>
                    <View style={{ flexDirection: 'row', alignSelf: 'flex-end' }}>
                        <Text style={{ flex: 1, fontSize: 16, alignSelf: 'flex-end', textAlignVertical: 'bottom', lineHeight: 20, }}> {(data.discountTour !== 0 ? promotionalPrice : data.money).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</Text>
                        <Text style={{ fontStyle: 'italic', fontSize: 12, flex: 1, alignSelf: 'flex-end', lineHeight: 20, }}>{formatDate(data.created_at)}</Text>
                    </View>

                </View>
            </TouchableOpacity>
        </View >
    )
}

export default NewTourItem

const styles = StyleSheet.create({
    textTitle: {
        flex: 1,
        paddingHorizontal: 4,
        fontSize: 20,
        fontWeight: '500',
        textAlign: 'center',
        marginBottom: 4
    },
    itemNewPostContent: {
        flexDirection: 'row',
        borderRadius: 10,
        padding: 8,
        backgroundColor: '#f9f9f9',
        elevation: 4,
        shadowRadius: 12,
        marginVertical: 8,
    },
    authorNewPost: {
        flexDirection: 'row',
        borderRadius: 90,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 4,
        alignSelf: 'flex-start',
        elevation: 4,
    },
    itemNewPostWrap: {
        borderRadius: 10,
        width: width - 30,
        padding: 10,
        backgroundColor: '#eeeeee',
        elevation: 4,
        shadowRadius: 12,
        // marginBottom: 15,
        marginHorizontal: 8
    },
})