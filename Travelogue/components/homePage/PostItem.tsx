import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Divider, IconButton, Menu, PaperProvider } from 'react-native-paper'
import { Link, router } from 'expo-router'
import { formatDate } from '@/utils/commons'
import LiveModeButton from '../buttons/LiveModeButton'
import { iconColors } from '@/assets/colors'
import HeartButton from '../buttons/HeartButton'
import SaveButton from '../buttons/SaveButton'
import { database, get, ref, update } from '@/firebase/firebaseConfig'
import { useHomeProvider } from '@/contexts/HomeProvider'
import { useAccount } from '@/contexts/AccountProvider'
import { useAdminProvider } from '@/contexts/AdminProvider'
import { AntDesign, FontAwesome } from '@expo/vector-icons'
import { formatNumberLike } from '@/utils'

const { width } = Dimensions.get('window')
const TYPE = 0 // 0: post, 1: tour
export type PostModal = {
    author: {
        avatar: string,
        fullname: string,
        id: string
    },
    comments: any,
    content: string,
    created_at: number,
    id: string,
    images: {
        [country: string]: {
            [locationId: string]: {
                city_name: string,
                images_value: [string]
            }
        }
    },
    isCheckIn: boolean,
    likes: number,
    locations: {
        [country: string]: {
            [locationId: string]: string
        }
    },
    match: number,
    mode: string,
    reports: number,
    saves: number,
    scores: number,
    status_id: number,
    thumbnail: string,
    title: string
}
type Props = {
    data: PostModal,
    index: number,
    liked: boolean,
    // userId: string,
    // onTapLocationItemMenu?: (selectedCityId: string, selectedCountryId: string, userId: string) => void | undefined,
    onTapToViewDetail?: (path: any, postId: string) => void | undefined
    onTapToViewProfile?: (authorId: string) => Promise<void> | undefined,
};
const PostItem = ({ data, index, liked, onTapToViewDetail, onTapToViewProfile }: Props) => {
    const [indexVisibleMenu, setIndexVisibleMenu] = useState(-1);
    const { userId }: any = useHomeProvider()
    const { likedPostsList, setLikedPostsList }: any = useAccount()
    const { areasByProvinceName }: any = useAdminProvider()
    // useEffect(() => {
    // // console.log(`PostItem render by liked: ${liked}`, data.id)
    // console.log(likedPostsList, 'check');
    // },[likedPostsList])
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
        <View style={styles.itemWrap}>
            {/* Đưa paperprovider ra ngoài */}
            < PaperProvider >
                {/* <Link href={{ pathname: "/postDetail", params: { id: data.id.toString() } }} asChild><Text>aaa</Text></Link> */}

                <TouchableOpacity style={styles.item}
                    onPress={() => onTapToViewDetail?.('postDetail', data.id)}
                >
                    {/* Label */}
                    <View style={{ borderRadius: 20, position: 'absolute', backgroundColor: 'rgba(100,100,100,0.1)', zIndex: 1, width: '100%', height: '100%' }}></View>

                    <View style={styles.header}>
                        {/*Author*/}
                        <View style={styles.authorContent}>
                            <TouchableOpacity
                                style={styles.avatarWrap}
                                onPress={() => onTapToViewProfile?.(data.author.id)}
                            >
                                <Image style={styles.avatar} source={{ uri: data.author.avatar }}></Image>
                            </TouchableOpacity>
                            <View style={{ justifyContent: 'center', marginHorizontal: 4 }}>
                                <TouchableOpacity
                                    onPress={() => onTapToViewProfile?.(data.author.id)}
                                >
                                    <Text style={{ fontWeight: '600', }} numberOfLines={1}>
                                        {data.author.fullname}
                                    </Text>
                                </TouchableOpacity>
                                <Text style={{ fontSize: 12, fontStyle: 'italic' }}>{formatDate(data.created_at)}</Text>
                            </View>
                        </View>
                        {/* Live mode */}
                        <View style={styles.liveModeWrap}>
                            <LiveModeButton mode={data.mode}></LiveModeButton>
                        </View>
                        {/* Location */}
                        <View style={styles.flagBtn}>
                            {/* <Provider > */}
                            <Menu
                                style={styles.listLocations}
                                visible={indexVisibleMenu === index} // Thay the 1 bang index của post trong mang
                                onDismiss={() => setIndexVisibleMenu(-1)}
                                theme={''}
                                elevation={4}
                                // statusBarHeight={0}
                                anchorPosition='bottom'
                                contentStyle={{ backgroundColor: 'white', right: 26, }}
                                anchor={
                                    <View style={{ alignItems: "center" }}>
                                        <IconButton
                                            style={{ backgroundColor: 'white', width: 40, height: 30 }}
                                            icon="map-marker-radius"
                                            iconColor={iconColors.green1}
                                            size={22}
                                            onPress={() => setIndexVisibleMenu(index)}
                                            accessibilityLabel="Menu button"
                                        />
                                    </View>
                                }
                            >
                                {allLocations.map((location: any) => {
                                    return (
                                        <TouchableOpacity key={location?.id} onPress={() => handleTapOnLocationInMenu?.(location, userId)}>
                                            <Menu.Item title={location.name} titleStyle={styles.itemLocation} dense={true}></Menu.Item>
                                            <Divider />
                                        </TouchableOpacity>
                                    )
                                })
                                }
                            </Menu>
                            {/* </Provider> */}
                        </View>
                    </View>
                    <View style={styles.imagePostWrap}>
                        <Image style={styles.imagePost} source={{ uri: data.thumbnail }}></Image>
                    </View>

                    <View style={styles.footer}>
                        {/* Action button */}
                        <View style={styles.actionBar}>
                            {/* LIKE BUTTON */}
                            <View style={{ flexDirection: 'row', paddingHorizontal: 5, zIndex: 3, gap: 6, justifyContent: 'center', alignItems: 'center' }} >
                                <AntDesign name={'hearto'} size={22} color='white' />
                                <Text style={{ color: 'white' }}>{formatNumberLike(data.likes)}</Text>
                            </View>
                            {/* COMMENT BUTTON */}
                            <View style={{ flexDirection: 'row', paddingHorizontal: 5, zIndex: 3, gap: 6, justifyContent: 'center', alignItems: 'center' }} >
                                <FontAwesome name="comment-o" size={22} color="white" />
                                <Text style={{ color: 'white' }}>{data.comments ? formatNumberLike(Object.keys(data.comments).length) : '0'}</Text>
                            </View>
                        </View>
                        {/* Topic */}
                        <View style={styles.topicContainer}>
                            <Text numberOfLines={2} style={styles.topicText}>{data.title}</Text>
                        </View>
                    </View>
                </TouchableOpacity>
            </PaperProvider>
        </View >
    )
}

const styles = StyleSheet.create({
    topicText: {
        fontSize: 16,
        fontWeight: '500',
        textAlign: 'left',
        // marginBottom: 4,
        color: 'white',
    },
    topicContainer: {
        flex: 1,
        justifyContent: 'center',
        // backgroundColor: "rgba(10, 10, 10, 0.6)",
        backgroundColor: "rgba(255, 255, 255, 0.3)",
        borderRadius: 10,
        padding: 8,
    },
    item: {
        position: "relative",
        borderRadius: 20,
    },
    itemWrap: {
        backgroundColor: 'white',
        height: 420,
        elevation: 6,
        borderRadius: 20
    },
    btn: {
        backgroundColor: 'white',
        height: 40,
        borderRadius: 90,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        margin: 10,
    },
    actionBar: {
        flex: 1,
        gap: 10,
        flexDirection: 'row',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingVertical: 8,
        paddingHorizontal: 10,
        gap: 10,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    imagePost: {
        // height: 400,
        height: '100%',
        width: width - 40,
        // backgroundColor: 'red',
        borderRadius: 20,
    },
    imagePostWrap: {
        height: '100%',
        elevation: 4
    },
    itemLocation: {
        padding: 0,
        fontSize: 14,
        width: 'auto',
        textAlign: 'center',
    },
    listLocations: {
        width: 'auto',
        top: 50,
    },
    liveModeWrap: {
    },
    flagBtn: {
        alignSelf: 'flex-end',
    },
    avatar: {
        borderRadius: 90,
        width: 34,
        height: 34,
    },
    avatarWrap: {
        borderRadius: 90,
        width: 34,
        height: 34,
        backgroundColor: 'grey',
        elevation: 3
    },
    header: {
        // backgroundColor: 'red',
        flexDirection: 'row',
        width: '100%',
        position: 'absolute',
        justifyContent: 'space-between',
        padding: 10,
        paddingTop: 0,
        zIndex: 3,
    },
    authorContent: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: 'white',
        maxWidth: 200,
        padding: 4,
        marginTop: 10,
        borderRadius: 90,
        zIndex: 3,
        elevation: 4
    },
})
// export default PostItem
export default React.memo(PostItem, (prevProps: Props, nextProps: Props) => {
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
        && prevProps.liked === nextProps.liked
    )
})
