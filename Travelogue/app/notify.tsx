import { database, storage } from '@/firebase/firebaseConfig';
import { onValue, ref, update, get } from '@firebase/database';
import React, { useState, useEffect } from 'react';
import { usePost } from '@/contexts/PostProvider';
import { router } from 'expo-router';

import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useHomeProvider } from '@/contexts/HomeProvider';

const NotificationsScreen = () => {
    const [notifications, setNotifications] = useState([]);
    const [accountId, setAccountId] = useState([]);
    const { selectedPost, setSelectedPost }: any = usePost()
    const { dataAccount }: any = useHomeProvider()

    useEffect(() => {
        setAccountId(dataAccount.id)
    }, [dataAccount])

    // Fetch data notifications by account id
    useEffect(() => {
        const onValueChange = ref(database, `notifications/${accountId}`);
        const notifications = onValue(onValueChange, (snapshot) => {
            if (snapshot.exists()) {
                const jsonData = snapshot.val();
                const dataArray: any = Object.values(jsonData).sort((a: any, b: any) => b.created_at - a.created_at);;
                setNotifications(dataArray);
            } else {
                console.log("No data available");
            }
        }, (error) => {
            console.error("Error fetching data:", error);
        });

        return () => notifications();
    }, [accountId]);
    // Fetch post by postID
    const fetchPostByPostId = async (postId: any) => {
        try {
            const refCity = ref(database, `posts/${postId}`);
            const snapshot = await get(refCity);
            if (snapshot.exists()) {
                const dataJson = snapshot.val();

                setSelectedPost([dataJson])

            } else {
                console.log("No data city available");
            }
        } catch (error) {
            console.error("Error fetching data: ", error);
        }

    };

    //handle read notify
    const handleRead = (notify: any) => {
        if (accountId) {
            const refNotify = ref(database, `notifications/${accountId}/${notify.id}`);

            update(refNotify, { read: true })
                .then(() => {
                    console.log('Data updated successfully!');
                })
                .catch((error) => {
                    console.error('Error updating data:', error);
                });
            fetchPostByPostId(notify.post_id)
            router.push({
                pathname: '/postDetail'
            })
        }

    }

    const renderItem = (notify: any) => {
        const timestamp = notify.item.created_at;
        const timeCreatedAt: any = new Date(timestamp);
        const timeAgo = (Date.now() - timeCreatedAt);
        let displayTime;
        if (timeAgo < 60 * 1000) { // Dưới một phút
            displayTime = `${Math.floor(timeAgo / 1000)} giây trước`;
        } else if (timeAgo < 60 * 60 * 1000) { // Dưới một giờ
            displayTime = `${Math.floor(timeAgo / (60 * 1000))} phút trước`;
        } else if (timeAgo < 24 * 60 * 60 * 1000) { // Dưới một ngày
            displayTime = `${Math.floor(timeAgo / (60 * 60 * 1000))} giờ trước`;
        } else {
            displayTime = `${Math.floor(timeAgo / (24 * 60 * 60 * 1000))} ngày trước`;
        }
        return (
            <TouchableOpacity
                style={[
                    styles.notificationItem,
                    {
                        backgroundColor: notify.item.read === false ? '#ebf5ff' : '#f9f9f9',
                    },
                ]}
                onPress={() => handleRead(notify.item)}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ flex: 2, paddingRight: 10 }}>
                        <Text style={styles.message}>
                            {notify.item.commentator_name} {notify.item.type === "comment" ? "đã bình luận vào bài viết của bạn" : "đã trả lời bình luận của bạn"}
                        </Text>
                        <Text style={styles.time}>{displayTime}</Text>
                    </View>
                    <Image
                        source={{ uri: notify.item.image }}
                        style={{ width: 70, height: 70, borderRadius: 25 }}
                    />
                </View>
            </TouchableOpacity>

        )
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={notifications}
                renderItem={renderItem}
                // keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContainer}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    listContainer: {
        paddingBottom: 20,
    },
    notificationItem: {
        padding: 16,
        marginBottom: 8,
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
    },
    message: {
        fontSize: 16,
        color: '#333',
    },
    time: {
        fontSize: 12,
        color: '#999',
        marginTop: 4,
    },
});

export default NotificationsScreen;
