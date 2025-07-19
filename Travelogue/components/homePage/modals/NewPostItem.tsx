import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { PostModal } from '../PostItem';
import { formatDate, fortmatContent } from '@/utils/commons';
import { Badge } from 'react-native-paper';
import { router } from 'expo-router';
import { ref } from 'firebase/database';
import { database, update } from '@/firebase/firebaseConfig';
import { useHomeProvider } from '@/contexts/HomeProvider';
import { useAdminProvider } from '@/contexts/AdminProvider';
import Markdown from 'react-native-markdown-display';
import { indexOf } from 'lodash';
import { backgroundColors, iconColors } from '@/assets/colors';
const { width } = Dimensions.get('window')


type Props = {
    data: PostModal,
    onTapToViewDetail?: (path: any, postId: string) => void | undefined
    onTapToViewProfile?: (authorId: string) => void | undefined,
};



const NewPostItem = ({ data, onTapToViewDetail, onTapToViewProfile }: Props) => {
    const { userId }: any = useHomeProvider()
    const { areasByProvinceName }: any = useAdminProvider()

    // console.log(data,'têttetetete');

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
                onPress={() => onTapToViewDetail?.('postDetail', data.id)}
            >
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', elevation: 4, borderRadius: 10, aspectRatio: 1 }}>
                    <Image style={{ width: '100%', borderRadius: 10, aspectRatio: 1 }} source={{ uri: data.thumbnail }}></Image>
                </View>
                <View style={{ flex: 1.5, paddingLeft: 10 }}>
                    <View style={{ flexDirection: 'row' }}>
                        {/* <Text style={styles.textTitle}> {data.title}</Text> */}
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
                                        ={{ margin: 0, paddingHorizontal: 8, backgroundColor: iconColors.green2, color: 'black' }}>{location.name}</Badge>
                                </TouchableOpacity>
                            )
                        })}

                    </View>
                    <View style={{ paddingHorizontal: 10 }}>
                        <Text style={styles.textTitle}> {data.title}</Text>
                        <Text numberOfLines={2} > {data.content?.split('<br><br>')[1].trim() || ''}</Text>
                    </View>
                    {/* <Text style={{ fontStyle: 'italic', fontSize: 12, alignSelf: 'flex-end' }}>{formatDate(data.created_at)}</Text> */}
                </View>
            </TouchableOpacity>
        </View >
    )
}


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
        justifyContent: 'center',
        alignItems: 'center',
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
export default React.memo(NewPostItem, (prevProps: Props, nextProps: Props) => {
    if (!prevProps.data || !nextProps.data) return false;
    const prevTemp = prevProps.data
    const nextTemp = nextProps.data
    return (
        prevTemp.id === nextTemp.id
        && prevTemp.content === nextTemp.content
        && prevTemp.created_at === nextTemp.created_at
        && prevTemp.likes === nextTemp.likes
        && prevTemp.title === nextTemp.title
        && prevTemp.status_id === nextTemp.status_id
        && prevTemp.saves === nextTemp.saves
        && prevTemp.scores === nextTemp.scores
        && prevTemp.mode === nextTemp.mode
        && prevTemp.reports === nextTemp.reports
    )
})