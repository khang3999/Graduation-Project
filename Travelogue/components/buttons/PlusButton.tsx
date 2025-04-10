import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import React from 'react'
import Icon from 'react-native-vector-icons/AntDesign'
import { backgroundColors, bagdeColors, iconColors } from '@/assets/colors'


const PlusButton = (props: any) => {
  // Hàm set like
  const handleComment = () => {
    // Show comment bottom sheet

  }
  return (
    <TouchableOpacity delayPressOut={50} onPress={handleComment} {...props} style={styles.container}>
      <Icon name="plus" size={24} color='black' />
    </TouchableOpacity>
  )
}

// Style
const styles = StyleSheet.create({
  container: {
    // bottom: 1
    backgroundColor: iconColors.green2,
    // backgroundColor: backgroundColors.background1,
    // padding: 8,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    elevation: 4,
    borderWidth: 1,
    borderColor: iconColors.green2,
  }
})
export default PlusButton