import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import ActionBar from '../ActionBar'

const PostList = () => {
  return (
    <View style={styles.container}>
      <View style={styles.item}></View>
      <ActionBar style={styles.actionBar}></ActionBar>
    </View>
  )
}
const styles =StyleSheet.create({
    item:{
        height: 390,
        backgroundColor:'red',
        marginHorizontal: 10,
        marginVertical: 10,
        borderRadius: 15
    },
    actionBar:{
        position: 'absolute',
        bottom: 20,
        left: 20
    },
    container:{
        position: 'relative'
    }
})


export default PostList