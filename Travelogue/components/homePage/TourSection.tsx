import { View, Text, FlatList, StyleSheet, Image, ScrollView, Dimensions, TouchableOpacity, Pressable } from 'react-native'
import React, { useEffect, useState } from 'react'
import Carousel from 'react-native-reanimated-carousel';
import { database, onValue, ref } from '@/firebase/firebaseConfig';
import { types } from '@babel/core';

const { width } = Dimensions.get('window');
const dataTours = [
    []
]
const TourSection = () => {
    const [dataTours, setDataTours] = useState([])

    useEffect(() => {
        // Tạo đường dẫn tham chiếu tới nơi cần lấy bảng posts
        const refTours = ref(database, 'tours/')
        const unsubscribe = onValue(refTours, (snapshot) => {
            if (snapshot.exists()) {
                const jsonDataTours = snapshot.val();
                // Chuyển đổi object thành array bang values cua js
                const jsonArrayTours: any = Object.values(jsonDataTours)
                // Set du lieu
                setDataTours(jsonArrayTours)
            } else {
                console.log("No data available");
            }
        }, (error) => {
            console.error("Error fetching data:", error);
        });

        return () => {
            unsubscribe(); // Sử dụng unsubscribe để hủy listener
        };
    }, [])

    const tourItem = (tour: any) => {
        return (
            <Pressable style={styles.tourItem}>
                <View style={styles.imageWrap}>
                    <Image
                        style={styles.image}
                        source={{ uri: tour.item.images }}
                    />
                </View>
            </Pressable>
        )
    }

    return (
        <View style={styles.container}>
            <FlatList
                horizontal={true}
                // scrollToOffset={}
                data={dataTours}
                renderItem={tourItem}
                keyExtractor={(tour: any) => tour.id}
                contentContainerStyle={{ marginBottom: 8, paddingHorizontal: 10, paddingVertical: 10 }}
                ItemSeparatorComponent={() => <View style={{ width: 10, }} />}
                pagingEnabled>
            </FlatList>
        </View>
    )
}
const styles = StyleSheet.create({
    image: {
        width: (width - 40) / 3,
        height: "100%",
        borderRadius: 10,
    },
    imageWrap: {
        // height: "100%",
    },
    tourItem: {
        backgroundColor: 'green',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        height: 90,
        elevation: 6
    },
    container: {
        flexDirection: 'row',
        justifyContent: 'center',
    }
})
export default TourSection