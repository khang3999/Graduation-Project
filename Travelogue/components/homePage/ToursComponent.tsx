import { View, Text, ScrollView, Dimensions, StyleSheet } from 'react-native'
import React from 'react'
const widthTourItem = Dimensions.get('window').width - 20;

const ToursComponent = () => {
        /// TOUR ITEM
    // Tour item
    const tourItem = (item: any) => (
        <View >
            <Text ></Text>
        </View>
    );
  return (
            <View>
                {/* <FlatList style={styles.toursList} horizontal={true} data={[]} renderItem={tourItem}>
                </FlatList> */}
                <ScrollView style={styles.toursList} horizontal={true}>
                    <View style={[styles.tourItem, { width: widthTourItem }]}>
                        {/* Thông tin tour */}
                        <View style={styles.tourInformation}>
                            {/* <Image
                                source={require('@/assets/images/logo.png')}
                                resizeMode="contain"
                                style={styles.avatarCompany}
                            /> */}
                            <View style={styles.avatarCompany}></View>
                            <Text numberOfLines={1} ellipsizeMode="tail" className='px-[8px] font-bold'>Công ty Du lịch ABCádasd</Text>
                            <Text numberOfLines={1} className='px-[2px]'>Phone: 0123456789</Text>
                            <Text numberOfLines={1} className='px-[2px] italic text-[12px]'>07 tháng 10, 2024</Text>
                        </View>
                        {/* Hình ảnh tour */}
                        <View style={styles.tourImage}>

                        </View>
                        <View style={styles.dotTop}></View>
                        <View style={styles.dotBottom}></View>
                    </View>
                </ScrollView>
            </View>
  )
}

const styles = StyleSheet.create({
    avatarCompany: {
        width: 40,
        height: 40,
        marginBottom: 10,
        borderRadius: 90,
        backgroundColor: 'white'
    },
    dotBottom: {
        backgroundColor: 'white',
        width: 26,
        height: 26,
        borderRadius: 99,
        position: 'absolute',
        bottom: 0,
        transform: [{ translateY: 13 }],
        left: 160 - 16,
    },
    dotTop: {
        backgroundColor: 'white',
        width: 26,
        height: 26,
        borderRadius: 99,
        position: 'absolute',
        transform: [{ translateY: - 13 }],
        left: 160 - 16,
    },
    tourImage: {
        backgroundColor: 'grey',
        height: 150,
        flex: 1
    },
    tourInformation: {
        backgroundColor: 'grey',
        height: 150,
        width: 160,
        borderRightWidth: 6,
        borderStyle: 'dotted',
        borderColor: 'white',
        alignItems: 'center',
        paddingVertical: 15,
        justifyContent: 'center'
    },
    tourItem: {
        flexDirection: 'row',
        marginHorizontal: 10,
        borderRadius: 15,
        overflow: 'hidden'
    },
    toursList: {
        flexDirection: 'row'
    },
})

export default ToursComponent