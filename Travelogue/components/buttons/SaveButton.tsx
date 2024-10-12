import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import React, { useEffect, useState } from 'react'
import Icon  from 'react-native-vector-icons/FontAwesome';
import { AntDesign } from '@expo/vector-icons';

const SaveButton = (props: any) => {
  const [saved, setSaved] = useState(false);
  // Render 1 lần từ db để load các bài đã like
  useEffect(() => {
    // 
  }, []);

  // Hàm set like
  const handleLike = () => {
    // Set lại state
    setSaved(!saved)
    // Fetch dữ liệu

  }
  return (
    <TouchableOpacity delayPressOut={50} onPress={handleLike} {...props}>
      <Icon name={saved ? 'bookmark' : 'bookmark-o'} size={24} color={saved ? savedColor : unsavedColor} style={styles.container} />
    </TouchableOpacity>
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