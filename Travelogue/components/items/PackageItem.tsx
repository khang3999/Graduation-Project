import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import React from 'react'
import { TextInput } from 'react-native-gesture-handler'

const PackageItem = (props:any) => {
  return (
    <View>
      <Text style={styles.category}>Pack 2</Text>
        {/* Price */}
        <View style={styles.item}>
          <Text style={styles.title}>Price</Text>
          <TextInput  style={styles.input} >
            <Text>{props.price}</Text>
          </TextInput>
        </View>
        {/* Min Accumulated */}
        <View style={styles.item}>
          <Text style={styles.title}>Min Accumulated</Text>
          <TextInput  style={styles.input} >
            <Text>{props.minAccumulated}</Text>
          </TextInput>
        </View>
        {/* Factor */}
        <View style={styles.item}>
          <Text style={styles.title}>Factor</Text>
          <TextInput  style={styles.input} >
            <Text>{props.factor}</Text>
          </TextInput>
        </View>
        {/* Buttons */}
        <View style={{ display: 'flex', justifyContent: 'center', flexDirection: 'row' }}>
          <TouchableOpacity style={styles.approveBtn}>
            <Text style={styles.approveText} >Save</Text>
          </TouchableOpacity>
        </View>
    </View>
  )
}
const styles = StyleSheet.create({
    line: {
      height: 1,               
      backgroundColor: '#d3d3d3', 
      marginHorizontal: 20,
      marginVertical:30,
            
    },
    item: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    category: {
      fontSize: 18,
      fontStyle: 'italic',
      marginLeft: 20,
      fontWeight: 500
    },
    title: {
      fontSize: 14,
      padding: 20,
      marginLeft: 25,
      flex: 3,
      color: '#444444'
    },
    input: {
      height: 35,
      borderColor: 'gray',
      borderWidth: 1,
      paddingHorizontal: 20,
      marginHorizontal: 20,
      borderRadius: 10,
      flex: 2
    },
    approveBtn: {
      backgroundColor: '#2986cc',
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 20,
      width: 100,
      marginTop: 10,
      justifyContent: 'center',
    },
    approveText: {
      color: '#ffffff',
      textAlign: 'center',
      fontSize: 20,
    }
  })
export default PackageItem