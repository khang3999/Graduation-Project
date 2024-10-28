import { View, Text, FlatList, StyleSheet, Image, ScrollView, Dimensions, TouchableOpacity, Pressable } from 'react-native'
import React, { useEffect, useState } from 'react'
import Carousel from 'react-native-reanimated-carousel';
import { database, onValue, ref } from '@/firebase/firebaseConfig';
import { types } from '@babel/core';
import { useHomeProvider } from '@/contexts/HomeProvider';

const { width } = Dimensions.get('window');
const TourSection = () => {
    // const [dataTours, setDataTours] = useState([])
    const { dataTours }: any = useHomeProvider();

    // useEffect(() => {
    //     // Tạo đường dẫn tham chiếu tới nơi cần lấy bảng posts
    //     const refTours = ref(database, 'tours/')
    //     const unsubscribe = onValue(refTours, (snapshot) => {
    //         if (snapshot.exists()) {
    //             const jsonDataTours = snapshot.val();
    //             // Chuyển đổi object thành array bang values cua js
    //             const jsonArrayTours: any = Object.values(jsonDataTours)
    //             // Set du lieu
    //             setDataTours(jsonArrayTours)
    //         } else {
    //             console.log("No data available");
    //         }
    //     }, (error) => {
    //         console.error("Error fetching data:", error);
    //     });

    //     return () => {
    //         unsubscribe(); // Sử dụng unsubscribe để hủy listener
    //     };
    // }, [])
    const carouselLocation = () => {
        <View style={{ flex: 1 }}>
            <Carousel
                loop
                width={width}
                height={width / 2}
                autoPlay={true}
                data={[...new Array(6).keys()]}
                scrollAnimationDuration={1000}
                onSnapToItem={(index) => console.log('current index:', index)}
                renderItem={({ index }) => (
                    <View style={{ flex: 1, borderWidth: 1, justifyContent: 'center', }}>
                        <Text style={{ textAlign: 'center', fontSize: 30 }}>
                            {index}
                        </Text>
                    </View>
                )}
            />
        </View>
    }

    const tourItem = (tour: any) => {
        const locations = tour.item.locations
        const nameLocations = Object.keys(locations).flatMap((country: any) => //Object.keys(locations): lấy được mảng ["avietnam", "japan"]
            // Lấy các giá trị (địa điểm) của từng country (vd: Hà Nội, Cao Bằng)
            Object.entries(locations[country]).map(([id, name]) => ({
                id,
                name
            }))
        );
        return (
            <Pressable style={styles.tourItem}>
                <View style={styles.imageWrap}>
                    <View style={styles.locationWrap}>
                        <Carousel
                            loop
                            width={(width - 40) / 3}
                            height={30}
                            autoPlay={true}
                            data={nameLocations}
                            autoPlayInterval={0}
                            scrollAnimationDuration={3000}
                            // onSnapToItem={(index) => console.log('current index:', index)}
                            renderItem={({item}) => (
                                <View key={item.id} style={{ flex: 1, justifyContent: 'center'}}>
                                    <View style={{backgroundColor:'grey', opacity:0.6, width:'100%', height: 30, position:'absolute'}}></View>
                                    <Text style={{ textAlign: 'center', fontSize: 14, color:'white' }}>
                                        {item.name+""}
                                    </Text>
                                </View>
                            )}
                        />
                    </View>
                    {/* <View style={styles.locationWrap}>
                        {nameTours.map((nameTour: any) => {
                            return (
                                <Text style={styles.textLocation} key={nameTour.id}>{nameTour.name}</Text>
                            )
                        })}
                    </View> */}

                    <Image
                        style={styles.image}
                        source={{ uri: tour.item.images }}
                    />
                </View>
                <View style={styles.overPlay}></View>
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
    textLocation: {
        color: 'white'
    },
    overPlay: {
        backgroundColor: 'black',
        position: 'absolute',
        width: "100%",
        height: "100%",
        // zIndex: 3,
        opacity: 0.4,
        borderRadius: 10,
    },
    locationWrap: {
        position: 'absolute',
        zIndex: 4,
        height: 30,
        top:30
    },
    image: {
        width: (width - 40) / 3,
        height: "100%",
        borderRadius: 10,
    },
    imageWrap: {
        position: 'relative',
    },
    tourItem: {
        position: 'relative',
        // backgroundColor: 'green',
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