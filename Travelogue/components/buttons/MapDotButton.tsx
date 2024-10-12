import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import React from 'react'
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5'
import { Item } from 'react-native-paper/lib/typescript/components/Drawer/Drawer'

const MapDotButton = (props: any) => {
    const handleTap = () => {
        // Show comment bottom sheet

    }
    return (
        <TouchableOpacity delayPressOut={50} onPress={handleTap} {...props}>
            <FontAwesome5Icon name="map-marked-alt" size={22} color="black" />
        </TouchableOpacity>
    )
}
export default MapDotButton