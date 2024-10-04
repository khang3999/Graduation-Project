import { View, Text, StyleSheet, Button } from 'react-native'
import React from 'react'
import { FontAwesome5 } from '@expo/vector-icons';
import LikeButton from './buttons/HeartButton';

const ActionBar = () => {
    return (
        <View style={styles.container}>
           <LikeButton style={styles.buttonItem}></LikeButton>
           <LikeButton style={styles.buttonItem}></LikeButton>
           <LikeButton style={styles.buttonItem}></LikeButton>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: '#7d7d7d7d',
        width: 150,
        // paddingHorizontal: 20,
        borderRadius: 999,
        elevation: 5,
    },
    buttonItem: {
    }
});

console.log('acc rendered');
export default ActionBar