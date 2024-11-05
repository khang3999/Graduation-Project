import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ReactNativeZoomableView } from '@openspacelabs/react-native-zoomable-view';
import VietNamMap from "@/components/maps/VietNamMap";
import { useHomeProvider } from "@/contexts/HomeProvider";
import { createRef, useEffect, useState } from "react";
import { SelectList } from "react-native-dropdown-select-list";
import { ref } from "firebase/database";
import { database, onValue } from "@/firebase/firebaseConfig";
import { Dropdown, SelectCountry } from 'react-native-element-dropdown';
import { Divider } from "react-native-paper";
const CheckInMap = () => {
  const [dataCountries, setDataCountries] = useState()
  const [selectedCountry, setSelectedCountry] = useState('avietnam');
  // const {dataCountries, setDataCountries} = useHomeProvider()
  const zoomableViewRef = createRef();
  // const zoomToArea = (areaId) => {
  //   zoomableViewRef.current.moveTo(-70, 0)
  //   zoomableViewRef.current.zoomBy(0.4)
  // }

  // Lấy các quốc gia 
  useEffect(() => {
    const refCountries = ref(database, `countries`)
    const unsubscribe = onValue(refCountries, (snapshot) => {
      if (snapshot.exists()) {
        const jsonDataCountries = snapshot.val();
        const countriesArray = Object.keys(jsonDataCountries).map(key => ({
          label: jsonDataCountries[key].label,
          value: key,
          image: {
            uri: jsonDataCountries[key].image
          }
        }));
        console.log(countriesArray);

        setDataCountries(countriesArray)
      } else {
        console.log("No data available1");
      }
    }, (error) => {
      console.error("Error fetching data:", error);
    });

    return () => {
      unsubscribe(); // Sử dụng unsubscribe để hủy listener
    };
  }, [])

  // // Fetch data cities theo quốc gia
  // const fetchCityByCountry = async (countryId) => {
  //   try {
  //     const refCity = ref(database, `cities/${countryId}`)
  //     const snapshot = await get(refCity);
  //     if (snapshot.exists()) {
  //       const dataCityJson = snapshot.val()
  //       const dataCitiesArray = Object.keys(dataCityJson).map(key => ({
  //         key,
  //         value: dataCityJson[key].name
  //       }));
  //       setDataCities(dataCitiesArray)
  //     } else {
  //       console.log("No data city available");
  //     }
  //   } catch (error) {
  //     console.error("Error fetching data: ", error);
  //   }
  // }
  // const handleSelecteCountry = () => {
  //   // Fetch city tương ứng tương ứng (chính)
  //   fetchCityByCountry(val)
  // }

  // const renderCountryItem = (country) => {
  //   console.log("a", country);
  //   return (
  //     <View key={country.value} style={{ flexDirection: 'row', margin: 10 }}>
  //       <Image style={{ width: 30, height: 20, marginRight: 6 }} source={{ uri: country.image }}></Image>
  //       <Text style={{ fontSize: 16 }}>{country.label}</Text>
  //     </View>
  //   )
  // }

  return (
    <View style={styles.container}>
      {/* <TouchableOpacity style={{ position: 'absolute', top: 0, left: 0, padding: 20, backgroundColor: 'red', zIndex: 10 }} onPress={zoomToArea}>
        <Text >tap me</Text>
      </TouchableOpacity> */}
      <View>
        <View style={styles.sortContainer}>
          <SelectCountry
            style={styles.dropdown}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            imageStyle={styles.imageStyle}
            inputSearchStyle={[styles.inputSearchStyle, { borderRadius: 10 }]}
            iconStyle={styles.iconStyle}
            value={selectedCountry}
            data={dataCountries ? dataCountries : []}
            search
            maxHeight={300}
            labelField="label"
            valueField="value"
            imageField="image"
            placeholder='Quốc gia'
            searchPlaceholder="Tìm kiếm..."
            // renderItem={renderCountryItem}
            onChange={e => {
              console.log(e.value);
              setSelectedCountry(e.value);
            }}
          />
          <Dropdown
            style={styles.dropdown}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            inputSearchStyle={[styles.inputSearchStyle, { borderRadius: 10 }]}
            iconStyle={styles.iconStyle}
            data={[]}
            search
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder="Khu vực"
            searchPlaceholder="Tìm kiếm..."
            value={''}
            onChange={item => {
              setValue(item.value);
            }}
          />
          <Dropdown
            style={styles.dropdown}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            inputSearchStyle={[styles.inputSearchStyle, { borderRadius: 10 }]}
            iconStyle={styles.iconStyle}
            data={[]}
            search
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder="Tỉnh thành"
            searchPlaceholder="Tìm kiếm..."
            value={''}
            onChange={item => {
              setValue(item.value);
            }}
          />
        </View>

        <View style={styles.information}>
          <Text>Quốc gia: Việt Nam</Text>
          <Text>Khu vực: Đồng bằng sông Hồng</Text>
          <Text>Tỉnh/ thành: Thủ đô Hà Nội</Text>
        </View>
      </View>

      {selectedCountry === 'avietnam' ?
        <ReactNativeZoomableView
          ref={zoomableViewRef}
          maxZoom={3}
          minZoom={1}
          zoomStep={0.5}
          initialZoom={1}
          bindToBorders={true}
          onZoomAfter={this.logOutZoomState}
          style={{
            padding: 10,
            // backgroundColor: 'red',
          }}
        >
          <VietNamMap></VietNamMap>
        </ReactNativeZoomableView>
        : <Text style={{ fontSize: 20 }}>Tạm thời chưa có dữ liệu</Text>}
    </View>


  )
}

const styles = StyleSheet.create({
  imageStyle: {
    width: 25,
    height: 18,
    borderRadius: 2,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
    marginLeft: 4,
    paddingRight: 0
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  dropdown: {
    flex: 1,
    minHeight: 40,
    backgroundColor: '#eeeeee',
    borderRadius: 10,
    paddingHorizontal: 3,
    borderWidth: 1,
    elevation: 10
  },
  information: {
    margin:10
  },
  sortContainer: {
    paddingHorizontal: 4,
    flexDirection: 'row',
    // position: 'absolute',
    backgroundColor: 'white',
    width: '100%',
    justifyContent: 'space-around',
    top: 0,
    left: 0,
    zIndex: 10,
    gap: 3
  },
  selectItem: {
    flex: 1,
    // position: 'absolute'
  },
  container: {
    position: 'relative',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CheckInMap