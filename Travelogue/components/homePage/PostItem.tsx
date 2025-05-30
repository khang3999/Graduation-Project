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

const { width } = Dimensions.get('window')
const TYPE = 0 // 0: post, 1: tour
export type PostModal = {
    author: {
        avatar: string,
        fullname: string,
        id: string
    },
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
    mode: number,
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

    // useEffect(() => {
    // // console.log(`PostItem render by liked: ${liked}`, data.id)
    // console.log(likedPostsList, 'check');
    // },[likedPostsList])
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
    return (
        <View style={styles.itemWrap}>
            {/* Đưa paperprovider ra ngoài */}
            < PaperProvider >
                {/* <Link href={{ pathname: "/postDetail", params: { id: data.id.toString() } }} asChild><Text>aaa</Text></Link> */}

                <TouchableOpacity style={styles.item}
                    onPress={() => onTapToViewDetail?.('postDetail', data.id)}
                >
                    {/* Label */}
                    <View style={{ borderRadius: 30, position: 'absolute', backgroundColor: 'rgba(100,100,100,0.1)', zIndex: 1, width: '100%', height: '100%' }}></View>

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
                            <LiveModeButton type="1"></LiveModeButton>
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
                                            style={{ backgroundColor: 'white', width: 50, height: 40 }}
                                            icon="map-marker-radius"
                                            iconColor={iconColors.green1}
                                            size={26}
                                            onPress={() => setIndexVisibleMenu(index)}
                                            accessibilityLabel="Menu button"
                                        />
                                    </View>
                                }
                            >
                                {allLocations.map((location: any) => {
                                    return (
                                        <TouchableOpacity key={location?.id} onPress={() => handleTapOnLocationInMenu?.(location?.id, location.country, userId)}>
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
                    {/* Action button */}
                    <View style={styles.footer}>
                        <View style={styles.actionBar}>
                            <View style={[styles.btn, {
                                paddingHorizontal: 10, zIndex: 3
                            }]}>
                                <HeartButton data={data} type={TYPE} liked={liked}></HeartButton>
                            </View>
                            {/* <View style={[styles.btn, { width: 60, marginLeft: 0, zIndex: 3 }]}> */}
                                <SaveButton myStyle={[styles.btn, { width: 60, marginLeft: 0, zIndex: 3 }]} data={data} type={TYPE}></SaveButton>
                            {/* </View> */}
                        </View>
                        {/* Topic */}
                        <View style={styles.topicContainer}>
                            <Text numberOfLines={2} ellipsizeMode='tail' textBreakStrategy='balanced' style={styles.topicText}>{data.title}</Text>
                        </View>
                    </View>
                </TouchableOpacity>
            </PaperProvider>
        </View >
    )
}

const styles = StyleSheet.create({
    topicText: {
        fontSize: 18,
        fontWeight: '500',
        textAlign: 'left',
        marginBottom: 4,
        color: 'white',
    },
    topicContainer: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: "rgba(10, 10, 10, 0.6)",
        borderRadius: 20,
        padding: 10,
        marginBottom: 10,
        marginRight: 10
    },
    item: {
        position: "relative",
        borderRadius: 30,
    },
    itemWrap: {
        backgroundColor: 'white',
        height: 420,
        elevation: 6,
        borderRadius: 30
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
        flexDirection: 'row',
        alignItems: 'flex-end',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'flex-end',
        // padding: 10,
    },
    imagePost: {
        // height: 400,
        height: '100%',
        width: width - 40,
        // backgroundColor: 'red',
        borderRadius: 30,
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
        top: 70,
    },
    liveModeWrap: {
    },
    flagBtn: {
        alignSelf: 'flex-end',
    },
    avatar: {
        borderRadius: 90,
        width: 40,
        height: 40,
    },
    avatarWrap: {
        borderRadius: 90,
        width: 40,
        height: 40,
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
        flexDirection: 'row',
        backgroundColor: 'white',
        maxWidth: 200,
        padding: 6,
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
