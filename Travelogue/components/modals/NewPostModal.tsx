import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Pressable, Modal, Alert, TextInput, Dimensions, RefreshControl } from 'react-native'
import React, { useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { useHomeProvider } from '@/contexts/HomeProvider'
import { Foundation, Ionicons } from '@expo/vector-icons'
import { PostModal } from '../homePage/PostItem'
import NewPostItem from '../homePage/NewPostItem'
import { ref } from 'firebase/database'
import { database, get } from '@/firebase/firebaseConfig'
import { router } from 'expo-router'
import { useAccount } from '@/contexts/AccountProvider'
import { backgroundColors, iconColors } from '@/assets/colors'
const { width, height } = Dimensions.get('window')

const NewPostModal = () => {
    const {
        modalNewPostVisible, setModalNewPostVisible,
        setReload, dataNewPostList, dataPosts, setIsLoading
    }: any = useHomeProvider()
    const { setSearchedAccountData }: any = useAccount();
    console.log('NewPostModal render');

    // Hàm tính những bài viết mới - DONE
    const dataFilteredNewPosts = useMemo(() => {
        if (!modalNewPostVisible || dataNewPostList?.length === 0) return [];

        const result = dataNewPostList.filter((postObj1: any) =>
            !dataPosts.some((postObj2: any) => postObj1.id === postObj2.id)
        );
        result.sort((postA: any, postB: any) => postB.created_at - postA.created_at);
        return result;
    }, [modalNewPostVisible, dataNewPostList]);

    const handleTapToViewPostDetail = useCallback((path: any, postId: string) => {
        router.push({
            pathname: path,
            params: { postId: postId },
        });
    }, [])

    const handleTapToViewProfile = useCallback((authorId: string) => {
        const fetchAndNavigate = async () => {
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
        }
        fetchAndNavigate()
    }, [])

    const newPostItem = useCallback((post: any) => {
        const postData: PostModal = post.item
        const itemIndex = post.index
        return (
            <NewPostItem
                // index={itemIndex}
                // userId={userId}
                data={postData}
                onTapToViewDetail={handleTapToViewPostDetail}
                onTapToViewProfile={handleTapToViewProfile}
            ></NewPostItem>
        )
    }, [])

    const handleTapOnReloadHomeScreen = useCallback(() => {
        setIsLoading(true)
        setReload((prev: Boolean) => !prev); // toggle reload
    }, [])

    return (
        <Modal
            animationType='slide'
            transparent={true}
            statusBarTranslucent={true}
            visible={modalNewPostVisible}
            // visible={true}
            onRequestClose={() => {
                Alert.alert('Modal has been closed.');
                setModalNewPostVisible(false);
            }}
        >
            <View style={styles.modalView}>
                <View style={[styles.modalBottomView, { height: '75%' }]}>
                    <View style={styles.modalTitleWrap}>
                        <Text style={styles.modalTitleText}>Bài viết mới</Text>
                        <View style={{ position: 'relative' }}>
                            <Ionicons name="newspaper" size={24} color={iconColors.green1} />
                            <View style={{ position: 'absolute', right: -12, top: -12 }}>
                                <Foundation name="burst-new" size={26} color="red" />
                            </View>
                        </View>
                    </View>
                    <FlatList
                        data={dataFilteredNewPosts}
                        // data={[...dataPosts]}
                        renderItem={newPostItem}
                        // renderItem={({item})=>{return (<View><Text>{item.id}</Text></View>)}}
                        ItemSeparatorComponent={() => <View style={{ height: 20 }} />}
                        contentContainerStyle={{ paddingVertical: 20 }}
                    />
                    <View style={styles.modalFooter}>
                        <TouchableOpacity
                            style={[styles.buttonModal, styles.buttonSearch]}
                            onPress={handleTapOnReloadHomeScreen}>
                            <Text style={[styles.textStyle, { color: 'white' }]}>Làm mới</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setModalNewPostVisible(false)}
                            style={[styles.buttonModal, styles.buttonCancel]}
                        >
                            <Text style={styles.textStyle}>Đóng</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.overPlay}></View>
            </View>
        </Modal>
    )
}

export default NewPostModal

const styles = StyleSheet.create({
    // Modal new posts
    modalView: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    modalBottomView: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        width: width,
        alignItems: 'center',
        zIndex: 4,
        borderBottomWidth: 1,
    },
    buttonSearch: {
        backgroundColor: iconColors.green1,
    },
    buttonCancel: {
        backgroundColor: backgroundColors.background1,
        borderWidth: 1,
        borderColor: iconColors.green1
    },
    buttonModal: {
        padding: 10,
        borderRadius: 5,
        margin: 10,
        width: 100,
        elevation: 4
    },
    modalTitleText: {
        fontSize: 24,
        fontWeight: '600',
        marginRight: 10,
    },
    modalTitleWrap: {
        backgroundColor: iconColors.green2,
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 10,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    modalFooter: {
        flexDirection: 'row',
        width: '100%',
        paddingVertical: 8,
        justifyContent: 'center',
        alignItems: 'center'
    },
    overPlay: {
        backgroundColor: 'black',
        // top: -40,
        height: height,
        width: '100%',
        position: 'absolute',
        opacity: 0.4,
        zIndex: 3
    },
    textStyle: {
        // color: 'white',
        fontWeight: '500',
        textAlign: 'center',
        fontSize: 16
    },

})