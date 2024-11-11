import { View, Text, StyleSheet, ScrollView, FlatList, Image, TouchableOpacity } from 'react-native'
import React, { useRef, useState } from 'react'
import { TextInput, Dimensions } from 'react-native'
import { FontAwesome5IconButton } from 'react-native-vector-icons/FontAwesome5'
import BottomSheet from 'reanimated-bottom-sheet';
import MapDotButton from '../buttons/MapDotButton'
import DropDownPicker from 'react-native-dropdown-picker';
import { AntDesign } from '@expo/vector-icons'
import { Modalize } from 'react-native-modalize'
import { Modal } from 'react-native-paper'

const SearchBar = () => {
    // // Tạo tham chiếu cho Bottom Sheet
    // const bottomSheetRef = useRef(null);

    // // Nội dung bên trong Bottom Sheet
    // const renderContent = () => (
    //     <View style={styles.bottomSheetContent}>
    //         <Text style={styles.sheetText}>This is the Bottom Sheet Content</Text>
    //         <TouchableOpacity onPress={() => {
    //             if (bottomSheetRef.current) {
    //                 bottomSheetRef.current.snapTo(1);
    //             }
    //         }} style={styles.closeButton}>
    //             <Text style={styles.closeButtonText}>Close</Text>
    //         </TouchableOpacity>
    //     </View>
    // );
    return (
        <View style={styles.container}>
            {/* Nút mở Bottom Sheet */}
            <TouchableOpacity style={styles.openButton}>
                <Text style={styles.openButtonText}>Open Bottom Sheet</Text>
            </TouchableOpacity>

            {/* Bottom Sheet */}
            {/* <BottomSheet
                ref={bottomSheetRef}
                snapPoints={[300, 0]} // Điểm dừng của Bottom Sheet
                borderRadius={10}
                renderContent={renderContent}
            /> */}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    openButton: {
        padding: 10,
        backgroundColor: '#007bff',
        borderRadius: 5,
    },
    openButtonText: {
        color: '#fff',
        fontSize: 16,
    },
    bottomSheetContent: {
        backgroundColor: '#fff',
        padding: 20,
        height: 300,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sheetText: {
        fontSize: 16,
        marginBottom: 20,
    },
    closeButton: {
        padding: 10,
        backgroundColor: '#ff5c5c',
        borderRadius: 5,
    },
    closeButtonText: {
        color: '#fff',
        fontSize: 16,
    },
})
export default SearchBar