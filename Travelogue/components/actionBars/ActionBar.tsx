import { View, Text, StyleSheet, Button } from 'react-native'
import React, { useEffect } from 'react'
import { FontAwesome5 } from '@expo/vector-icons';
import CommentButton from '../buttons/CommentButton';
import SaveButton from '../buttons/SaveButton';
import { auth } from '@/firebase/firebaseConfig';
import HeartButton from '../buttons/HeartButton';
import { formatNumberLike } from '@/utils';


const ActionBar = (props: any) => {
    const data = props.data // post or tour
    const type = props.type
    return (
        <View style={props.style}>
            <View style={styles.container}>
                <View style={[styles.buttonItem, {marginRight: 10}]}>
                    <HeartButton data={data} type={type}></HeartButton>
                </View>
                <View style={[styles.buttonItem, {marginRight: 10}]}>
                    <CommentButton ></CommentButton>
                    <Text style={{ fontWeight: '500' }}>{formatNumberLike(0)}</Text>
                </View>
                <View style={[styles.buttonItem]}>
                    <SaveButton dataID={data.id} type={type}></SaveButton>
                </View>
                {/* <SaveButton style={styles.buttonItem} postID={post.id}></SaveButton> */}
            </View>
        </View>

    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: 'white',
        minWidth: 150,
        justifyContent: 'space-around',
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 999,
        elevation: 5,
    },
    buttonItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        // minWidth: 50
        // flex: 1,
        gap: 4,
    }
});

export default ActionBar