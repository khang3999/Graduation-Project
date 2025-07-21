import { View, Text, Pressable, StyleSheet, TouchableOpacity, TouchableHighlight, TouchableHighlightComponent, Touchable } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { AntDesign } from '@expo/vector-icons'
import Icon from 'react-native-vector-icons/FontAwesome';
import { auth, database, onValue, ref, update } from '@/firebase/firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { formatNumberLike } from '@/utils';
import { useHomeProvider } from '@/contexts/HomeProvider';
import { useTourProvider } from '@/contexts/TourProvider';
import eventEmitter from "@/utils/eventEmitter";
import { useAccount } from '@/contexts/AccountProvider';
import { list } from 'firebase/storage';
import { useFocusEffect } from 'expo-router';
import { remove, runTransaction } from 'firebase/database';

const updateArray = (array: any[], id: any, newLikes: number) => {
    return array.map(item =>
        item.id === id ? { ...item, likes: newLikes } : item
    );
};

const HeartButton = (props: any) => {
    const { id, likes } = props.data
    const type = props.type === 'post' ? 'likedPostsList' : 'likedToursList'
    const [isLiked, setIsLiked] = useState(false)
    const [likeNum, setLikeNum] = useState(likes)
    const [isProcessing, setIsProcessing] = useState(false)
    const [likedList, setLikedList] = useState<any[]>([])
    const { userId }: any = useHomeProvider()
    useEffect(() => {
        const likedRef = ref(database, `accounts/${userId}/${type}`);
        const unsubscribe = onValue(likedRef, (snapshot) => {
            if (snapshot.exists()) {
                const dataLikedList = snapshot.val();
                const likedListId = Object.keys(dataLikedList)
                console.log(likedListId);
                setLikedList(likedListId);
                setIsLiked(likedListId.includes(id))
            } else {
                console.log(`No data liked ${type} list available`);
            }
        }, (error) => {
            console.error("Error fetching data:", error);
        });

        return () => {
            unsubscribe(); // Sử dụng unsubscribe để hủy listener
        };
    }, [userId])

    // Hàm set like
    const handleLike = useCallback(async () => {
        if (isLiked) return
        try {

            // Cập nhật vào danh sách 
            const refLikedList = ref(database, `accounts/${userId}/${type}/`);
            await update(refLikedList, { [id]: true })

            // Tăng lượt saves
            const table = props.type === 'post' ? 'posts' : 'tours';
            const refTable = ref(database, `${table}/${id}/likes`);
            await runTransaction(refTable, (currentValue) => {
                return (typeof currentValue === 'number' && currentValue >= 0 ? currentValue : 0) + 1;
            }).then(() => setLikeNum((prev: number) => prev + 1));;
        } catch (error) {
            console.error(`Lỗi khi cập nhật : ${type}`, error);
        } finally {
            setIsLiked(true);
            setIsProcessing(false)

        }
    }, [id, props.type, userId, type]);

    // Handle remove
    const handleRemove = useCallback(async () => {
        if (!isLiked) return
        try {
            // Xóa khỏi danh sách 
            const refLikedList = ref(database, `accounts/${userId}/${type}/${id}`);
            await remove(refLikedList)

            // Giảm lượt likes
            const table = props.type === 'post' ? 'posts' : 'tours';
            const refTable = ref(database, `${table}/${id}/likes`);
            await runTransaction(refTable, (currentValue) => {
                return (typeof currentValue === 'number' && currentValue > 0 ? currentValue - 1 : 0);
            }).then(() => setLikeNum((prev: number) => prev - 1));

        } catch (error) {
            console.error(`Lỗi khi cập nhật : ${type}`, error);
        } finally {
            setIsLiked(false);
            setIsProcessing(false)
        }
    }, [isLiked, userId, type, id]);
    const handleTapOnButton = () => {
        setIsProcessing(true)
    }
    useEffect(() => {
        if (isProcessing) {
            isLiked ? handleRemove() : handleLike()
        }
    }, [isProcessing])

    return (
        <View style={props.style}>
            {isProcessing &&
                <View style={{ width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 5, position: 'absolute', borderRadius: 90 }}></View>
            }
            <TouchableOpacity disabled={isProcessing} style={props.myStyle} delayPressOut={50} onPress={handleTapOnButton} >
                <AntDesign
                    name={isLiked ? 'heart' : 'hearto'}
                    size={24}
                    color={isLiked ? likedColor : unlikedColor} />
                <Text style={{ marginLeft: 6, fontWeight: '500', fontSize:18 }}>{formatNumberLike(likeNum)}</Text>
            </TouchableOpacity>
        </View>
    )
}

// Style
const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    }
})
const likedColor = "red";
const unlikedColor = "black";
export default HeartButton;
