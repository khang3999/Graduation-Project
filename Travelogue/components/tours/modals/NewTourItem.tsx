import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useMemo } from 'react'
import { TourModal } from '../../homePage/TourItem'
import { useHomeProvider } from '@/contexts/HomeProvider';
import { database, ref, update } from '@/firebase/firebaseConfig';
import { router } from 'expo-router';
import { Badge } from 'react-native-paper';
import { formatDate } from '@/utils/commons';
import { useAdminProvider } from '@/contexts/AdminProvider';
import { iconColors } from '@/assets/colors';
const { width } = Dimensions.get('window')

type Props = {
    data: TourModal,
    onTapToViewDetail?: (path: any, postId: string) => void | undefined
    onTapToViewProfile?: (authorId: string) => void | undefined,
};
const NewTourItem = ({ data, onTapToViewDetail, onTapToViewProfile }: Props) => {
    const { userId }: any = useHomeProvider()

    const { areasByProvinceName }: any = useAdminProvider()

    const handleTapOnLocationInMenu = useCallback(async (location: any, userId: string) => {
        const areaId = areasByProvinceName[location.name]
        // Update hành vi lên firebase
        // 1. Lưu lên firebase
        const refBehavior = ref(database, `accounts/${userId}/behavior`);
        const dataUpdate = {
            content: "",
            location: [location.id],
        };
        await update(refBehavior, dataUpdate);
        router.push({
            pathname: "/galleryCities",
            params: { idCity: location.id, idCountry: location.country, idArea: areaId },
        });
    }, [areasByProvinceName])

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
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <TouchableOpacity style={styles.authorNewPost} onPress={() => onTapToViewProfile?.(data.author.id)}>
                    <Image style={{ width: 30, height: 30, borderRadius: 90 }} source={{ uri: data.author.avatar }} />
                    <Text style={{ fontWeight: '500', paddingHorizontal: 4 }} numberOfLines={1}>
                        {data.author.fullname}
                    </Text>
                </TouchableOpacity>
                <Text style={{ fontStyle: 'italic', fontSize: 12, }}>{formatDate(data.created_at)}</Text>
            </View>

            <TouchableOpacity style={styles.itemNewPostContent}
                onPress={() => onTapToViewDetail?.('tourDetail', data.id)}
            >
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', elevation: 4, borderRadius: 10, aspectRatio: 1 }}>
                    <Image style={{ width: '100%', borderRadius: 10, aspectRatio: 1 }} source={{ uri: data.thumbnail }}></Image>
                </View>
                <View style={{ flex: 1.5, paddingLeft: 10 }}>
                    <View style={{ flexDirection: 'row' }}>
                        {/* <Text style={styles.textTitle} numberOfLines={1}> {data.title}</Text> */}
                    </View>
                    <View style={{ flexDirection: 'row', flex: 1, alignItems: 'flex-start', flexWrap: 'wrap', padding: 2 }}>
                        <Text style={{ fontWeight: '500', textAlign: 'center' }}>Địa điểm: </Text>
                        {allLocations.map((location) => {
                            return (
                                <TouchableOpacity
                                    style={{ marginBottom: 4, marginRight: 4 }}
                                    key={location?.id}
                                    onPress={() => handleTapOnLocationInMenu?.(location, userId)}>
                                    <Badge size={22} key={location.id} style
                                        ={{ marginHorizontal: 2, paddingHorizontal: 8, backgroundColor: iconColors.green2, color: 'black' }}>{location.name}</Badge>
                                </TouchableOpacity>
                            )
                        })}
                    </View>
                    <View style={{ paddingHorizontal: 10 }}>
                        <Text style={styles.textTitle}> {data.title}</Text>
                        <Text numberOfLines={2} > {data.content?.split('<br><br>')[1].trim() || ''}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignSelf: 'flex-end', justifyContent: 'flex-end', marginTop: 6 }}>
                        <Text style={{ fontSize: 16, alignSelf: 'flex-end', textAlignVertical: 'bottom', lineHeight: 20, fontWeight:'500' }}> {(data.discountTour !== 0 ? promotionalPrice : data.money).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</Text>
                        {/* <Text style={{ fontStyle: 'italic', fontSize: 12, flex: 1, alignSelf: 'flex-end', lineHeight: 20, }}>{formatDate(data.created_at)}</Text> */}
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
        justifyContent: 'center',
        alignItems: 'center',
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