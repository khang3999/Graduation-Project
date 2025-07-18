import { View, StyleSheet, Text } from 'react-native';
import React, { useMemo } from 'react';
import { Chip } from 'react-native-paper';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { router } from 'expo-router';
import { useAdminProvider } from '@/contexts/AdminProvider';

interface Location {
  country: string;
  locationCode: string;
  locationName: string;
}

interface CheckedInChipProps {
  items: Location[];
}

export default function CheckedInChip({ items }: CheckedInChipProps) {
  // console.log(items);
  const { areasByProvinceName }: any = useAdminProvider();
  const dataChipsArray = useMemo(() => {
    return items.map((item) => {
      const idArea = areasByProvinceName[item.locationName] ?? 'unknown';

      return { ...item, idArea };
    })
  }, [areasByProvinceName, items])

  return (
    <View style={styles.container}>
      {dataChipsArray.map((item, index) => (
        <TouchableOpacity style={styles.chipItem} key={index} onPress={() => router.push({
          pathname: '/galleryCities',
          params: { idCountry: item.country, idCity: item.locationCode, idArea: item.idArea },
        })}>
          <Chip key={index} style={{ backgroundColor: 'white' }}>
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
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
    gap: 10
  },
  chipItem: {
    backgroundColor: 'white',
    alignSelf: 'center',
    padding: 6,
    borderRadius: 50,
    elevation: 4
  },
  chipText: {
    flexWrap: 'wrap',
    maxWidth: '100%',
    flexShrink: 1, // Allows text to wrap without truncation
  },
});
