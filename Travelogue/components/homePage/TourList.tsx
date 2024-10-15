import { View, Text, FlatList, StyleSheet, Image, ScrollView, Dimensions, TouchableOpacity } from 'react-native'
import React from 'react'
import Carousel from 'react-native-reanimated-carousel';

const { width } = Dimensions.get('window');
const dataTours = [
    []
]
const TourList = () => {
    const tourItem = () => {
        return (
            <TouchableOpacity style={styles.tourItem} >
                <Text>1</Text>
                {/* <Image
                    source={require('@/assets/images/logo.png')}
                    resizeMode="contain"
                /> */}
            </TouchableOpacity>
        )
    }

    return (
        <View style={styles.container}>
            <FlatList
                horizontal={true}
                data={[1, 2, 3, 4]}
                renderItem={tourItem}
                contentContainerStyle={{ marginBottom: 8, paddingHorizontal: 10, paddingVertical: 10 }}
                ItemSeparatorComponent={() => <View style={{ width: 10, }} />}>
            </FlatList>
        </View>
    )
}
const styles = StyleSheet.create({
    image: {
        width: 'auto',
    },
    tourItem: {
        backgroundColor: 'green',
        flex: 1,
        borderRadius: 10,
        width: (width - 40) / 3,
        height: 90,
        elevation: 8
    },
    container: {
        flexDirection: 'row',
        justifyContent: 'center',
    }
})
export default TourList