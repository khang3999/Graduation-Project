import { View, Text, Pressable, StyleSheet, TouchableOpacity, TouchableHighlight, TouchableHighlightComponent } from 'react-native'
import React, { useEffect, useState } from 'react'
import { AntDesign, FontAwesome, FontAwesome5, FontAwesome6 } from '@expo/vector-icons'
import Icon from 'react-native-vector-icons/FontAwesome';

const CommentButton = (props: any) => {
    // Hàm set like
    const handleTap = () => {
        // Show comment bottom sheet

    }
    return (
        <TouchableOpacity delayPressOut={50} onPress={handleTap} {...props}>
            <Icon name="comment-o" size={24} color="black" style={styles.container}/>
        </TouchableOpacity>
    )
}

// Style
const likedColor = 'red'
const unlikedColor = 'black'
const styles = StyleSheet.create({
    container: {
        bottom: 1 
    }
})
export default CommentButton