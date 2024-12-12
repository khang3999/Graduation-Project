import { View, StyleSheet, Text } from 'react-native';
import React from 'react';
import { Chip } from 'react-native-paper';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { router } from 'expo-router';

interface Location {
  country: string;
  locationCode: string;
  locationName: string;
}

interface CheckedInChipProps {
  items: Location[];
}

export default function CheckedInChip({ items }: CheckedInChipProps) {
  console.log(items);
  return (
    <View style={styles.container}>
      {items.map((item, index) => (
        <TouchableOpacity key={index} onPress={()=>router.push({
          pathname: '/gallery',
          params: {idCountry: item.country, idCity: item.locationCode},
        })}>
        <Chip key={index} style={styles.chipItem}>
          <Text style={styles.chipText}>{item.locationName}</Text>
        </Chip>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical:10,
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
