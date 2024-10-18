import { View, Text, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { ref as databaseRef } from 'firebase/database';
import { ref as storageRef } from 'firebase/storage';
import { database, onValue, storage } from '@/firebase/firebaseConfig';
import Svg, { Image, Path, SvgUri, SvgXml } from 'react-native-svg';
import { GestureHandlerRootView, PinchGestureHandler } from 'react-native-gesture-handler';
import VietNamMap from '@/components/maps/VietNamMap';

const CheckInMap = () => {
  const [selectedCountry, setSelectedCountry] = useState('avietnam')
  const [uriSvgMap, setUriSvgMap] = useState('')
  useEffect(() => {
    const refCountry = databaseRef(database, `countries/${selectedCountry}`);
    const unsubscribe = onValue(refCountry, (snapshot) => {
      if (snapshot.exists()) {
        const jsonDataCountry = snapshot.val();
        // Chuyển đổi object thành array bang values cua js
        // const jsonArrayCountry: any = Object.values(jsonDataCountry)
        // Set du lieu
        // console.log(jsonDataCountry.svgMap);
        setUriSvgMap(jsonDataCountry.svgMap)
      } else {
        console.log("No data available");
      }
    }, (error) => {
      console.error("Error fetching data:", error);
    });

    return () => {
      unsubscribe(); // Sử dụng unsubscribe để hủy listener
    };

  }, [selectedCountry])
  return (
    <>
      <VietNamMap></VietNamMap>
    </>
  )
}

export default CheckInMap