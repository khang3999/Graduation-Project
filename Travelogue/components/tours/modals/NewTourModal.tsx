import { Alert, Dimensions, FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useMemo } from 'react'
import { TourModal } from '@/components/homePage/TourItem'
import { useAccount } from '@/contexts/AccountProvider'
import { router } from 'expo-router'
import { database, get, ref } from '@/firebase/firebaseConfig'
import NewTourItem from './NewTourItem'
import { Foundation, Ionicons } from '@expo/vector-icons'
import { backgroundColors, iconColors } from '@/assets/colors'
const { width, height } = Dimensions.get('window')

type Props = {
    data: TourModal[],
    dataNew: TourModal[],
    modalNewPostVisible: boolean,
    setReload?: React.Dispatch<React.SetStateAction<boolean>>,
    setModalNewPostVisible?: React.Dispatch<React.SetStateAction<boolean>>,
    setIsLoading?: React.Dispatch<React.SetStateAction<boolean>>,
}
const NewTourModal = ({ data, dataNew, modalNewPostVisible, setReload, setModalNewPostVisible, setIsLoading }: Props) => {


    const { setSearchedAccountData }: any = useAccount();
    console.log('NewPostModal render');

    // Hàm tính những bài viết mới - DONE
    const dataFilteredNewPosts = useMemo(() => {
        if (!modalNewPostVisible || dataNew?.length === 0) return [];

        const result = dataNew.filter((postObj1: any) =>
            !data.some((postObj2: any) => postObj1.id === postObj2.id)
        );
        result.sort((postA: any, postB: any) => postB.created_at - postA.created_at);
        return result;
    }, [modalNewPostVisible, dataNew]);

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

    const newTourItem = useCallback((tour: any) => {
        const tourData: TourModal = tour.item
        const itemIndex = tour.index
        return (
            <NewTourItem
                // index={itemIndex}
                // userId={userId}
                data={tourData}
                onTapToViewDetail={handleTapToViewPostDetail}
                onTapToViewProfile={handleTapToViewProfile}
            ></NewTourItem>
        )
    }, [])

    const handleTapOnReloadHomeScreen = useCallback(() => {
        setIsLoading?.(true)
        setReload?.((prev: Boolean) => !prev) // toggle reload
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
                setModalNewPostVisible?.(false);
            }}
        >
            <View style={styles.modalView}>
                <View style={[styles.modalBottomView, { height: '75%' }]}>
                    <View style={styles.modalTitleWrap}>
                        <Text style={styles.modalTitleText}>Tour mới</Text>
                        <View style={{ position: 'relative' }}>
                            <Ionicons name="newspaper" size={22} color={iconColors.green1} />
                            <View style={{ position: 'absolute', right: -10, top: -12 }}>
                                <Foundation name="burst-new" size={24} color="red" />
                            </View>
                        </View>
                    </View>
                    <FlatList
                        data={dataFilteredNewPosts}
                        // data={[...data]}
                        renderItem={newTourItem}
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
                            onPress={() => setModalNewPostVisible?.(false)}
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

export default NewTourModal

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
    },
    buttonModal: {
        padding: 8,
        borderRadius: 5,
        // margin: 5,
        width: 90,
        borderWidth: 1,
        borderColor: iconColors.green1,
        elevation: 4
    },
    modalTitleText: {
        fontSize: 20,
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
        paddingVertical: 10,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 20
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
        // fontSize: 16
    },
})