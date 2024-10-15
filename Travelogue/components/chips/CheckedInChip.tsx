import { View, StyleSheet } from 'react-native'
import React from 'react'
import { Chip } from 'react-native-paper';

interface CheckedInChipProps {
    items: string[];
  }

export default function CheckedInChip({items}: CheckedInChipProps) {
  return (
    <View style={styles.container}>
        {items.map((item, index) => (
        <Chip key={index} style={styles.chipItem} >{item}</Chip>             
    ))}
    </View>
  )
}
const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        flexWrap: 'wrap',
      },
      chipItem: {
        margin: 5,
        backgroundColor: '#C1E1C1',
        alignSelf: 'flex-start',
        paddingHorizontal: 10,        
      },     
})
