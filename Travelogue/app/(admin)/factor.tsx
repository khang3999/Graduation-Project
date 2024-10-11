import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native'
import React from 'react'

const Factor = () => {
  return (
    <ScrollView style={{ marginTop: 30 }}>
      <Text style={styles.category}>Artical post</Text>

      {/* Like */}
      <View style={styles.item}>
        <Text style={styles.title}>Like</Text>
        <TextInput style={styles.input} >
          <Text>1</Text>
        </TextInput>
      </View>
      {/* Comment */}
      <View style={styles.item}>
        <Text style={styles.title}>Comment</Text>
        <TextInput style={styles.input} >
          <Text>1</Text>
        </TextInput>
      </View>
      {/* Behavior */}
      <View style={styles.item}>
        <Text style={styles.title}>Behavior</Text>
        <TextInput style={styles.input} >
          <Text>1</Text>
        </TextInput>
      </View>
      {/* Rating */}
      <View style={styles.item}>
        <Text style={styles.title}>Rating</Text>
        <TextInput style={styles.input} >
          <Text>1</Text>
        </TextInput>
      </View>
      {/* Buttons */}
      <View style={{ display: 'flex', justifyContent: 'center', flexDirection: 'row' }}>
        <TouchableOpacity style={styles.approveBtn}>
          <Text style={styles.approveText}>Save</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.line} />

      <Text style={styles.category}>Report</Text>
      {/* Post */}
      <View style={styles.item}>
        <Text style={styles.title}>Post</Text>
        <TextInput style={styles.input} >
          <Text>1</Text>
        </TextInput>
      </View>
      {/* Comment */}
      <View style={styles.item}>
        <Text style={styles.title}>Comment</Text>
        <TextInput style={styles.input} >
          <Text>1</Text>
        </TextInput>
      </View>
      {/* Account */}
      <View style={styles.item}>
        <Text style={styles.title}>Account</Text>
        <TextInput style={styles.input} >
          <Text style={{ alignItems: 'center' }}>1</Text>
        </TextInput>
      </View>
      {/* Buttons */}
      <View style={{ display: 'flex', justifyContent: 'center', flexDirection: 'row' }}>
        <TouchableOpacity style={styles.approveBtn}>
          <Text style={styles.approveText}>Save</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>

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
export default Factor