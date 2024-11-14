import { View, StyleSheet, Text } from 'react-native';
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
          <Text style={styles.chipText}>{item.locationName}</Text>
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
    backgroundColor: '#C1E1C1',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    maxWidth: '100%',
  },
  chipText: {
    flexWrap: 'wrap',
    maxWidth: '100%',
    flexShrink: 1, // Allows text to wrap without truncation
  },
});
