import { View, StyleSheet } from 'react-native';
import React from 'react';
import { Chip } from 'react-native-paper';

interface Location {
  country: string;
  locationCode: string;
  locationName: string;
}

interface CheckedInChipProps {
  items: Location[]; 
}

export default function CheckedInChip({ items }: CheckedInChipProps) {
  return (
    <View style={styles.container}>
      {items.map((item, index) => (
        <Chip key={index} style={styles.chipItem}>
          {item.locationName}
        </Chip>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chipItem: {
    margin: 5,
    fontSize: 10,
    backgroundColor: '#C1E1C1',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
  },
});
