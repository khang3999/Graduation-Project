import { View, Text, StyleSheet, Button } from 'react-native'
import React from 'react'
import { FontAwesome5 } from '@expo/vector-icons';
import LikeButton from './buttons/HeartButton';
import CommentButton from './buttons/CommentButton';

const ActionBar = () => {
    return (
        <View style={styles.container}>
           <LikeButton style={styles.buttonItem}></LikeButton>
           <CommentButton style={styles.buttonItem}></CommentButton>
           <LikeButton style={styles.buttonItem}></LikeButton>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: '#7d7d7d',
        width: 150,
        justifyContent: 'space-around',
        paddingVertical: 6,
        borderRadius: 999,
        elevation: 5,
    },
    buttonItem: {
        alignItems: 'center',
        flex: 1,
        gap: 4,
    }
});

export default ActionBar