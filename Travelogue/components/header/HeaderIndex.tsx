import { View, Text, StyleSheet } from 'react-native'
import React from 'react'

const HeaderIndex = () => {
  return (
    <View style={styles.header}>
      <Text>Header index</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    height: 70,
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 10,
  }
})

export default HeaderIndex