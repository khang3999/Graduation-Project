import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import React from 'react'
import Icon  from 'react-native-vector-icons/AntDesign'


const PlusButton = (props: any) => {
  // Hàm set like
  const handleComment = () => {
    // Show comment bottom sheet

  }
  return (
    <TouchableOpacity delayPressOut={50} onPress={handleComment} {...props}>
      <Icon name="plus" size={24} color="black" style={styles.container} />
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
export default PlusButton