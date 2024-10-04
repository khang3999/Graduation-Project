import { View, Text, Pressable, StyleSheet, TouchableOpacity, TouchableHighlight, TouchableHighlightComponent } from 'react-native'
import React, { useEffect, useState } from 'react'
import { AntDesign, FontAwesome, FontAwesome5, FontAwesome6 } from '@expo/vector-icons'
import Icon from 'react-native-vector-icons/FontAwesome';

const CommentButton = ({...props}) => {
    // Render 1 lần từ db để load các bài đã like
    useEffect(() => {
        // 
    }, []);

    // Hàm set like
    const handleComment = () => {
        // Show comment bottom sheet

    }
    return (
        <TouchableOpacity delayPressOut={50} onPress={handleComment} {...props}>
            {/* <FontAwesome name="comment-o" size={24} color="black" /> */}
            <Icon name="bookmark-o" size={24} color="black" />
        </TouchableOpacity>
    )
}

// Style
const likedColor = 'red'
const unlikedColor = 'black'
export default CommentButton