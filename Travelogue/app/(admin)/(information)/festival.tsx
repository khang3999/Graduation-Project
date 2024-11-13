import { View, Text, Platform, Alert, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Button, Checkbox, Divider } from 'react-native-paper';
import { SelectList } from 'react-native-dropdown-select-list'
import { ref } from '@firebase/database';
import { database, onValue } from '@/firebase/firebaseConfig';
import { get, update, set, push } from '@firebase/database'
import { TextInput } from 'react-native-gesture-handler';
import { green100 } from 'react-native-paper/lib/typescript/styles/themes/v2/colors';
import { router } from 'expo-router';


const Festival = () => {
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedPoint, setSelectedPoint] = useState(1);
  const [cityArea, setCityArea] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [cityInformation, setCityInformation] = useState("");
  const [dataCountries, setDataCountries] = useState([])
  const [dataCities, setDataCities] = useState([])
  const [editText, setEditText] = useState(false)
  const inputRef: any = useRef(null);
  const [isReady, setIsReady] = useState(false)
  const type = [
    { key: 1, value: "landmark" }, { key: 2, value: "festival" },]

  //Countries
  useEffect(() => {
    const refCountries = ref(database, `countries`)
    const unsubscribe = onValue(refCountries, (snapshot) => {
      if (snapshot.exists()) {
        const jsonDataCountries = snapshot.val();
        const countriesArray: any = Object.keys(jsonDataCountries).map(key => ({
          key,
          value: jsonDataCountries[key].label,
        }));
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
  // Fetch data cities theo quốc gia
  const fetchCityByCountry = async (countryId: any) => {
    // setDataCities([])
    try {
      const refCity = ref(database, `cities/${countryId}`)
      const snapshot = await get(refCity);
      if (snapshot.exists()) {
        const dataCityJson = snapshot.val()
        const dataCitiesArray: any = Object.entries(dataCityJson).flatMap(([region, cities]: any) =>
          Object.entries(cities).map(([cityCode, cityInfo]: any) => ({
            key: cityCode,
            value: cityInfo.name,
            area: cityInfo.area_id,
            information: cityInfo.information
          }))
        );
        setDataCities(dataCitiesArray)
      } else {
        setDataCities([])
        console.log("No data city available");
      }
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  }
  // Fetch data point theo city
  useEffect(() => {

    const type = getValueFromKey(selectedPoint)
    const onValueChange = ref(database, `points/${selectedCountry}/${type}/${selectedCity}`)
    console.log(onValueChange);

    // Lắng nghe dữ liệu từ Firebase Realtime Database theo thời gian thực
    const data = onValue(onValueChange, (snapshot) => {
      if (snapshot.exists()) {
        const dataPoints = snapshot.val()
        const pointArr: any = Object.values(dataPoints).map((key: any) => ({
          key,
          value: key.title,
        }));
        setFilteredData(pointArr)
      } else {
        setFilteredData([])
        console.log("No data point available");
      }
    }, (error) => {
      console.error("Error fetching data:", error);
    });

    // Cleanup function để hủy listener khi component unmount
    return () => data();

  }, [isReady])

  //When selectedCity & selectCountry & selectedPoint is ready
  useEffect(() => {
    if (selectedCity != "" && selectedCountry != "" && selectedPoint != null) {
      setIsReady(true)
    }

  }, [selectedCity, selectedCountry, selectedPoint])


  //Handle when selected countries
  const handleSelectedCountry = (val: any) => {
    setSelectedCountry(val)
    fetchCityByCountry(val)
  }
  //Handle when selected countries
  const handleSelectedCity = (val: any) => {
    setSelectedCity(val)

    if (val != null && val != undefined) {
      const a: any = dataCities.find((e: any) => (e.key == val))
      setCityArea(a.area)
      setCityInformation(a.information)
    }
  }
  // Find type
  const getValueFromKey = (key: any) => {
    const item = type.find((item) => item.key === key);
    return item ? item.value : null;
  };
  const handleAdd = async () => {
    // Dữ liệu mà bạn muốn truyền
    const data = {
      idCity: 'vn_2',
      idCountry: 'avietnam',
    };
  
    router.push({
      pathname: "/(admin)/newPoint", 
      params: data,          
    });
  };

  const renderPointsItem = (item: any) => {
    return (
      <View style={styles.item}>
        <View style={{ borderRadius: 30 }}>
          <Text style={styles.name}>{item.item.value}</Text>
        </View>
      </View>
    )
  };

  return (
    <View style={{ padding: 15, backgroundColor: 'white' }}>
      <View style={styles.selectContainer}>
        <SelectList
          dropdownStyles={{ zIndex: 10, position: 'absolute', width: 170, backgroundColor: 'white', top: 40 }}
          boxStyles={styles.selectList}
          setSelected={(val: any) => handleSelectedCountry(val)}
          data={dataCountries}
          save="key"
          placeholder='Countries'
        />
        <SelectList
          dropdownStyles={{ zIndex: 10, position: 'absolute', width: 170, backgroundColor: 'white', top: 40 }}
          boxStyles={styles.selectList}
          setSelected={(val: any) => handleSelectedCity(val)}
          data={dataCities}
          save="key"
          placeholder="Cities"
        />
      </View>
      <View style={{ flexDirection: 'row', justifyContent: "space-between", marginHorizontal: 20 }}>
        {type.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginVertical: 4,
            }}
            onPress={() => setSelectedPoint(item.key)}
          >
            <View
              style={{
                height: 20,
                width: 20,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: '#333',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 8,
              }}
            >
              {selectedPoint === item.key && (
                <View
                  style={{
                    height: 12,
                    width: 12,
                    borderRadius: 6,
                    backgroundColor: 'blue',
                  }}
                />
              )}
            </View>
            <Text>{item.value}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {
        isReady && (
          <View style={styles.addBar}>
            <TouchableOpacity style={styles.addBtn} onPress={handleAdd}>
              <Text style={{ color: '#ffffff' }} >+</Text>
            </TouchableOpacity>

          </View>
        )
      }
      <View style={styles.containerFlat}>
        {filteredData.length > 0 ? (
          <FlatList
            data={filteredData}
            // keyExtractor={(item) => item.id}
            renderItem={renderPointsItem}
            contentContainerStyle={styles.containerFlatList}
          />
        ) : (
          <Text style={styles.noAccountsText}>No data</Text>
        )}
      </View>

    </View>


  )

};
const styles = StyleSheet.create({
  container: {
    padding: 10,
  }, containerFlat: {
    marginVertical: 20,
    height: "75%",
    borderColor: "red",
    borderWidth: 1,
    borderRadius: 30,
    backgroundColor: '#f5f5f5',

  },
  containerFlatList: {
    paddingVertical: 10, // khoảng cách trên và dưới của FlatList
    paddingHorizontal: 16, // khoảng cách hai bên của FlatList
    borderRadius: 30,

  },
  textArea: {
    height: 150,
    padding: 10,
    textAlignVertical: 'top', // aligns text to the top in Android
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
  }, saveBtn: {
    backgroundColor: '#2986cc',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 10,
  }, buttonText: {
    color: '#ffffff',
    textAlign: 'center',
    fontSize: 16,
  },
  selectContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: 15,
    position: 'relative',
    zIndex: 10, // Giúp hiển thị SelectList phía trên các phần tử khác
  },
  selectList: {
    width: 170,
    zIndex: 10, // Giúp hiển thị SelectList không bị đẩy xuống dưới khi mở
  }, item: {
    backgroundColor: '#fff',
    padding: 16,
    margin: 10,
    borderRadius: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
  }, noAccountsText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 20,
    color: '#777'
  }, addBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    marginRight: 20,
  },
  addBtn: {
    backgroundColor: '#5E8C31',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginLeft: 20,
    borderRadius: 8,
  },
});

export default Festival;
