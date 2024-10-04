import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native'
import React from 'react'

const Factor = () => {
  return (
    <View style={{ marginTop: 30 }}>
      <Text style={styles.category}>Article post</Text>
      {/* Like */}
      <View style={styles.item}>
        <Text style={styles.title}>Like</Text>
        <TextInput placeholder='1' style={styles.input} />
      </View>

      {/* Comment */}
      <View style={styles.item}>
        <Text style={styles.title}>Comment</Text>
        <TextInput placeholder='1' style={styles.input} />
      </View>

      {/* Price */}
      <View style={styles.item}>
        <Text style={styles.title}>Price</Text>
        <TextInput placeholder='1' style={styles.input} />
      </View>

      {/* Behavior */}
      <View style={styles.item}>
        <Text style={styles.title}>Behavior</Text>
        <TextInput placeholder='1' style={styles.input} />
      </View>

      {/* Rating */}
      <View style={styles.item}>
        <Text style={styles.title}>Rating</Text>
        <TextInput placeholder='1' style={styles.input} />
      </View>

      {/* Accumulated */}
      <View style={styles.item}>
        <Text style={styles.title}>Accumulated</Text>
        <TextInput placeholder='1' style={styles.input} />
      </View>

      <Text style={styles.category}>Report</Text>
      {/* Post */}
      <View style={styles.item}>
        <Text style={styles.title}>Post</Text>
        <TextInput placeholder='1' style={styles.input} />
      </View>
      {/* Comment */}
      <View style={styles.item}>
        <Text style={styles.title}>Comment</Text>
        <TextInput placeholder='1' style={styles.input} />
      </View>
      {/* Account */}
      <View style={styles.item}>
        <Text style={styles.title}>Account</Text>
        <TextInput placeholder='1' style={styles.input} />
      </View>
      {/* Buttons */}
      <View style={{ display: 'flex', justifyContent: 'center', flexDirection:'row' }}>
        <TouchableOpacity style={styles.approveBtn}>
          <Text style={styles.approveText}>Save</Text>
        </TouchableOpacity>
      </View>

    </View>
  )
}
const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  category:{
    fontSize:18,
    fontStyle:'italic',
    marginLeft:20,
    fontWeight:500
  },
  title: {
    fontSize: 14,
    padding: 20,
    flex: 1,
    color:'#444444'
  },
  input: {
    height: 35,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 20,
    marginHorizontal: 10,
    borderRadius: 10,
    flex: 2
  },
  approveBtn: {
    backgroundColor: '#2986cc',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    width: 100,
    marginVertical: 50,
    justifyContent: 'center',
  },
  approveText: {
    color: '#ffffff',
    textAlign: 'center',
    fontSize: 20,
  }
})
export default Factor