import { View, Text, FlatList, StyleSheet, Image, ScrollView, Dimensions, TouchableOpacity } from 'react-native'
import React from 'react'
import Carousel from 'react-native-reanimated-carousel';

const { width } = Dimensions.get('window');

const TourList = () => {
    const tourItem = ()=>{
        return(
            <View style={styles.carouselItem} >
                <Text>1</Text>
               </View>
        )
    }

    return (
        <View style={styles.container}>
            <FlatList 
            style={styles.carousel} 
            horizontal={true} 
            data={[1,2,3,4]} 
            renderItem={tourItem} contentContainerStyle={{ paddingHorizontal: 10 }}
            ItemSeparatorComponent={() => <View style={{ width: 10, }} />}>
            </FlatList>
        </View>
    )
}
const styles = StyleSheet.create({
    image: {
        width: 'auto',
    },
    carouselItem: {
        backgroundColor: 'green',
        flex: 1,
        width: (width - 40)/3,
        borderRadius: 10
    },
    carousel: {
        // backgroundColor: 'blue',
        height: 100,
        borderTopWidth: 2,
        borderBottomWidth: 2
    },
    itemContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 150,
        height: 150,
        backgroundColor: 'lightblue',
        borderRadius: 10,
    },
    itemText: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    
    container: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginVertical: 10
    }
})
export default TourList