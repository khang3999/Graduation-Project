import { View, Text, StyleSheet, ScrollView, FlatList, Image } from 'react-native'
import React, { useState } from 'react'
import { TextInput, Dimensions } from 'react-native'
import { FontAwesome5IconButton } from 'react-native-vector-icons/FontAwesome5'
import MapDotButton from '../buttons/MapDotButton'
import logHeight from '@/hooks/logHeight'
import DropDownPicker from 'react-native-dropdown-picker';

const SearchBar = () => {

    /// SEARCH BAR
    // dropdown List đóng hay mở
    const [open, setOpen] = useState(false);
    // Giá trị hiện tại đang hiển thị
    const [currentValue, setcurrentValue] = useState(null);
    const [items, setItems] = useState([
        { label: 'Chọn', value: '0' },
        { label: 'Địa danh', value: '1' },
        { label: 'Nội dung', value: '2' },
    ]);

    // const [selectedValue, setSelectedValue] = useState("option1");

    return (
        <View >
            <View style={styles.searchBar}>
                <TextInput style={styles.inputText} placeholder='Tìm kiếm' />
                <View style={styles.mapWrap} onLayout={logHeight}>
                    <MapDotButton style={styles.mapBtn} />
                </View>
                <View style={styles.dropDownList}>
                    <DropDownPicker
                        style={styles.dropDownContainer}
                        open={open}
                        value={currentValue}
                        items={items}
                        setOpen={setOpen}
                        setValue={setcurrentValue} // Set giá trị khi chọn
                        setItems={setItems} // Set lại mảng giá trị
                        placeholder='Chọn'
                    />
                </View>
            </View>
        </View>
    )
}

const onLayoutHandler = (event: any) => {
    const { width } = event.nativeEvent.layout;
    console.log('Element w:', width); // In ra chiều cao của element
};


const sizes = {
    searchBarHeight: 32
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
    searchBar: {
        display: 'flex',
        flexDirection: 'row',
        height: sizes.searchBarHeight,
        marginHorizontal: 10,
        marginTop: 8
    },
    inputText: {
        flex: 3,
        height: 'auto',
        backgroundColor: '#f0f0f0',
        borderBottomLeftRadius: 10,
        borderTopLeftRadius: 10,
        borderColor: 'black',
        borderWidth: 1,
        paddingHorizontal: 10
    },
    mapWrap: {
        justifyContent: 'center',
        borderColor: 'black',
        borderWidth: 1,
        borderLeftWidth: 0
    },
    mapBtn: {
        paddingHorizontal: 6,
        // backgroundColor: 'red',
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        marginTop: 20,
        fontSize: 18,
        textAlign: 'center',
    },
    dropDownList: {
        // flex: 1,
    },
    dropDownContainer: {
        borderLeftWidth: 0,
        borderTopLeftRadius: 0,
        borderBottomLeftRadius: 0,
        minHeight: sizes.searchBarHeight,
        elevation: 8,
        width: 110
    },
})
export default SearchBar