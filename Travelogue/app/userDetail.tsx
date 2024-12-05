import { View, Text, Pressable, SafeAreaView, ScrollView, TextInput, Image, StyleSheet, TouchableOpacity } from 'react-native'
import React, { useEffect } from 'react'
import { database, get, getDownloadURL, ref, storage, storageRef } from '@/firebase/firebaseConfig';
import { LocalRouteParamsContext } from 'expo-router/build/Route';
import { router, useLocalSearchParams } from 'expo-router';

const getCurrentUserData = async (userId: String) => {
    try {
        if (!userId) {
            throw new Error("No user is currently logged in");
        }
        const userRef = ref(database, `accounts/${userId}`);
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
            return snapshot.val();
        } else {
            console.log("No data available");
            return null;
        }
    } catch (error) {
        console.error("Error fetching user data:", error);
        throw error;
    }
};
const getImageUrl = async (imagePath: string) => {
    try {
        const imageRef = storageRef(storage, imagePath);
        const url = await getDownloadURL(imageRef);
        return url;
    } catch (error) {
        console.error("Error fetching image URL:", error);
        throw error;
    }
};

export default function detail() {
    const [userData, setUserData] = React.useState<any>(null);
    // const userId = "5hHcZLibladWlKOMp9psuFsnqA53";
    const {userId} = useLocalSearchParams()

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getCurrentUserData(userId as String);
                setUserData(data);
            } catch (error) {
                console.error("Error fetching user data:", error);
            }

        };
        fetchData();

    }, [userId])


    if (!userData) {
        return (
            <View style={styles.loading}>
                <Text>Loading...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView>
                <View style={styles.container}>
                    <Image style={styles.avatar} source={{uri: userData.avatar}} />
                    <View style={styles.infoContainer}>
                        <View style={styles.row}>
                            <Text style={styles.infoText}>Fullname:</Text>
                            <Text
                                style={styles.username}
                            >{userData.fullname || ''}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.infoText}>Phone:</Text>
                            <Text
                                style={styles.username}
                            >{userData.phone || ''}</Text>
                        </View>
                        {/* <View style={styles.row}>
                            <Text style={styles.infoText}>Số đăng ký doanh nghiệp:</Text>
                            <Text
                                style={styles.username}
                            >{userData.business_license_id || ''}</Text>
                        </View> */}
                        <View style={styles.row}>
                            <Text style={styles.infoText}>Thời gian tạo:</Text>
                            <Text
                                style={styles.username}
                            >{userData.createdAt || ''}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.infoText}>Email:</Text>
                            <Text
                                style={styles.username}
                            >{userData.email || ''}</Text>
                        </View>
                        {/* <View style={styles.row}>
                            <Text style={styles.infoText}>Số CCCD:</Text>
                            <Text
                                style={styles.username}
                            >{userData.numberCCCD || ''}</Text>
                        </View> */}
                        {/* <View style={styles.row}>
                            <Text style={styles.infoText}>Ảnh CCCD:</Text>
                            <Image accessibilityViewIsModal={true} style={styles.cccd} source={{uri : userData.imageBackUrlCCCD}}></Image>
                            <Image style={styles.cccd} source={{uri : userData.imageFrontUrlCCCD}}></Image>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.infoText}>Ảnh số đăng ký:</Text>
                            <Image style={styles.cccd} source={{uri : userData.imageUrlBusinessLicense}}></Image>
                        </View> */}
                        <TouchableOpacity
                            style={styles.saveButton}
                            onPress={()=>{
                                router.back()
                            }}
                        >
                            <Text style={styles.saveButtonText}>Thoát</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}
const styles = StyleSheet.create({
    loadingOverlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    safeArea: {
        flex: 1,
        backgroundColor: "#f8f8f8",
        paddingBottom:10,
    },
    loading: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    container: {
        alignItems: "center",
        padding: 20,
    },
    avatar: {
        width: 120,
        height: 120,
        resizeMode: "cover",
        borderColor: "#ccc",
        borderWidth: 2,
        borderRadius: 60,
        marginBottom: 20,
    },
    cccd:{
        width: 120,
        height: 120,
        resizeMode: "cover",
        borderColor: "#ccc",
        borderWidth: 2,
        borderRadius: 5,
        marginBottom: 20,
    },

    editButton: {
        backgroundColor: "#C1E1C1",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        marginBottom: 20,
    },
    editText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "grey",
    },
    infoContainer: {
        width: "100%",
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
        paddingBottom: 10,
        marginBottom: 15,
    },
    infoText: {
        fontWeight: "bold",
        fontSize: 16,
        color: "#333",
    },
    username: {
        fontSize: 16,
        color: "#666",
    },
    saveButton: {
        backgroundColor: "#BBFFA2",
        paddingVertical: 15,
        borderRadius: 5,
        alignItems: "center",
        marginTop: 20,
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "grey",
    },
});
