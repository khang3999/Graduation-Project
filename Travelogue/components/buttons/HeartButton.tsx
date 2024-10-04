import { View, Text, Pressable, StyleSheet, TouchableOpacity, TouchableHighlight, TouchableHighlightComponent } from 'react-native'
import React, { useEffect, useState } from 'react'
import { AntDesign } from '@expo/vector-icons'


const HeartButton = ({...props}) => {
    const [liked, setLiked] = useState(false);
    // Render 1 lần từ db để load các bài đã like
    useEffect(() => {
        // 
    }, []);

    // Hàm set like
    const handleLike = () => {
        // Set lại state
        setLiked(!liked)
        // Fetch dữ liệu

    }
    return (
        <TouchableOpacity delayPressOut={50} onPress={handleLike} {...props}>
            <AntDesign
                name={liked ? 'heart' : 'hearto'}
                size={24}
                color={liked ? likedColor : unlikedColor} />
        </TouchableOpacity>
    )
}

// Style
const likedColor = 'red'
const unlikedColor = 'black'
export default HeartButton