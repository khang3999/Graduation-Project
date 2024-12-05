import { View, Text, StyleSheet, Dimensions, Image } from 'react-native'
import Carousel from "react-native-reanimated-carousel";
const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

import React, { useEffect, useState } from 'react'
import { useLocalSearchParams } from 'expo-router';
import { useAdminProvider } from '@/contexts/AdminProvider';

const ImageReport = () => {
    const { imagesReport, setImagesReport }: any = useAdminProvider()
    const [dataImagesReport, setDataImagesReport] = useState([])
    useEffect(() => {
        if (imagesReport) {
            setDataImagesReport(imagesReport)
        }
    }, [imagesReport])
    // console.log("report    ", imagesReport);

    // Ensure images is parsed correctly
    if (!dataImagesReport.length) {
        return (
            <View style={styles.container}>
                <Text>No images available</Text>
            </View>
        );
    }


    return (

        <Carousel
            pagingEnabled
            loop={false}
            width={windowWidth}
            height={windowHeight}
            data={dataImagesReport}
            scrollAnimationDuration={300}
            renderItem={({ item, index }) => {
                // Ensure item is a string
                const imageUri = typeof item === 'string' ? item : '';
                return (
                    <View style={styles.carouselItem}>
                        <Image
                            style={[styles.posts, { resizeMode: 'contain' }]}
                            source={{ uri: imageUri }}
                        />
                        <View style={styles.viewTextStyles}>
                            <Text style={styles.carouselText}>
                            {index + 1}/{dataImagesReport.length}
                            </Text>
                        </View>
                    </View>
                );
            }}
        />
    );
};
const styles = StyleSheet.create({

    carouselItem: {
        flex: 1,

    }, viewTextStyles: {
        position: "absolute",
        backgroundColor: "#392613",
        top: 10,
        left: windowWidth - 70,
        borderRadius: 20,
        paddingHorizontal: 7,
      },  carouselText: {
        color: "#fff",
        fontSize: 14,
        textAlign: "center",
      },
    container: {
        flex: 1,
        width: "100%",
        marginTop: 10
    },


    posts: {
        width: "100%",
        height: "90%",
        top:15
    },



});
export default ImageReport