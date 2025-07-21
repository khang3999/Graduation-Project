import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import Icon from 'react-native-vector-icons/FontAwesome';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { auth, database, get, onValue, ref, update } from '@/firebase/firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAccount } from '@/contexts/AccountProvider';
import { useHomeProvider } from '@/contexts/HomeProvider';
import { useTourProvider } from '@/contexts/TourProvider';
import { remove, runTransaction } from 'firebase/database';

const SaveButton = (props: any) => {
  const { id } = props.data
  const type = props.type === 'post' ? 'savedPostsList' : 'savedToursList'
  const [isSaved, setIsSaved] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false)
  const [savedList, setSavedList] = useState<any[]>([])
  const { userId }: any = useHomeProvider()

  useEffect(() => {
    const savedRef = ref(database, `accounts/${userId}/${type}`);
    const unsubscribe = onValue(savedRef, (snapshot) => {
      if (snapshot.exists()) {
        const dataSavedList = snapshot.val();
        const savedListId = Object.keys(dataSavedList)
        console.log(savedListId);
        setSavedList(savedListId);
        setIsSaved(savedListId.includes(id))
      } else {
        console.log(`No data saved ${type} list available`);
      }
    }, (error) => {
      console.error("Error fetching data:", error);
    });

    return () => {
      unsubscribe(); // Sử dụng unsubscribe để hủy listener
    };
  }, [userId])
  // Hàm set save
  const handleSave = useCallback(async () => {
    if (isSaved) return
    try {
      // Cập nhật vào danh sách 
      const refSavedList = ref(database, `accounts/${userId}/${type}/`);
      await update(refSavedList, { [id]: true })

      // Tăng lượt saves
      const table = props.type === 'post' ? 'posts' : 'tours';
      const refTable = ref(database, `${table}/${id}/saves`);
      await runTransaction(refTable, (currentValue) => {
        return (typeof currentValue === 'number' && currentValue >= 0 ? currentValue : 0) + 1;
      });
    } catch (error) {
      console.error(`Lỗi khi cập nhật : ${type}`, error);
    }
    finally {
      setIsSaved(true);
      setIsProcessing(false)
    }
  }, [id, props.type, userId, type]);

  // Hàm remove
  const handleRemove = useCallback(async () => {
    if (!isSaved) return
    try {
      // Xóa khỏi danh sách
      const refItemInSavedList = ref(database, `accounts/${userId}/${type}/${id}`);
      await remove(refItemInSavedList)

      // Giảm lượt saves
      const table = props.type === 'post' ? 'posts' : 'tours';
      const refTable = ref(database, `${table}/${id}/saves`);
      await runTransaction(refTable, (currentValue) => {
        return (typeof currentValue === 'number' && currentValue > 0 ? currentValue - 1 : 0);
      });
    } catch (error) {
      console.error(`Lỗi khi cập nhật : ${type}`, error);
    } finally {
      setIsSaved(false);
      setIsProcessing(false)
    }
  }, [isSaved, userId, type, id])

  const handleTapOnButton = () => {
    setIsProcessing(true)
  }
  useEffect(() => {
    if (isProcessing) {
      isSaved ? handleRemove() : handleSave()
    }
  }, [isProcessing])
  return (
    <View>
      {isProcessing &&
        <View style={{ width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 5, position: 'absolute', borderRadius: 90 }}></View>
      }
      <TouchableOpacity delayPressOut={50} onPress={isSaved ? handleRemove : handleSave} style={props.myStyle}>
        <Ionicons name={isSaved ? 'bookmark' : 'bookmark-outline'} size={24} color={isSaved ? savedColor : unsavedColor} style={{ top: 1 }} />
      </TouchableOpacity>
    </View>
  )
}
// Style
const savedColor = '#ffd43b'
const unsavedColor = 'black'
const styles = StyleSheet.create({
  container: {
    top: 1
  }
})
export default SaveButton