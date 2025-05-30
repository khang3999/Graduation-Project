import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import { TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome5'
import { backgroundColors, iconColors } from '@/assets/colors'

const BellButton = (props: any) => {
    // Hàm set like
    const handleComment = ({ ...props }) => {
        // Show comment bottom sheet

    }
    return (
        <TouchableOpacity delayPressOut={50} onPress={handleComment} {...props} style={styles.container}>
            <Icon name="bell" size={24} color="black" />
        </TouchableOpacity>
    )
}

// Style
const likedColor = 'red'
const unlikedColor = 'black'
const styles = StyleSheet.create({
    container: {
        // bottom: 1 
        backgroundColor: backgroundColors.background1,
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        elevation: 4,
        borderWidth: 1,
        borderColor: iconColors.green2,
    }
})

export default BellButton