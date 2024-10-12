import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import { TouchableOpacity } from 'react-native'
import Icon  from 'react-native-vector-icons/FontAwesome5'

const BellButton = (props: any) => {
  // Hàm set like
  const handleComment = ({ ...props }) => {
    // Show comment bottom sheet

}
return (
    <TouchableOpacity delayPressOut={50} onPress={handleComment} {...props}>
        <Icon name="bell" size={24} color="black" style={styles.container}/>
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

export default BellButton