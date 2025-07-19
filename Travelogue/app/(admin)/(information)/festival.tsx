import { View, Text, Platform, Alert, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Checkbox, Divider } from 'react-native-paper';
import { SelectList } from 'react-native-dropdown-select-list'
import { ref } from '@firebase/database';
import { database, onValue, get } from '@/firebase/firebaseConfig';
import { remove } from '@firebase/database'
import { TextInput } from 'react-native-gesture-handler';
import { green100 } from 'react-native-paper/lib/typescript/styles/themes/v2/colors';
import { router } from 'expo-router';
import { AntDesign, Entypo } from '@expo/vector-icons';
import Toast from 'react-native-toast-message-custom';
import { useHomeProvider } from '@/contexts/HomeProvider';
import { Province } from '@/model/ProvinceModal';
import { Point } from '@/model/PointModal';
import { iconColors } from '@/assets/colors';
import { add } from 'lodash';


const Festival = () => {
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedPoint, setSelectedPoint] = useState<number | null>(null);
  const [cityArea, setCityArea] = useState("");
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [cityInformation, setCityInformation] = useState("");
  // const [dataCountries, setDataCountries] = useState([])
  const [dataCities, setDataCities] = useState<any>([]);
  const [editText, setEditText] = useState(false)
  const inputRef: any = useRef(null);
  const [isReady, setIsReady] = useState(false)
  const { dataCountries }: any = useHomeProvider();

  const type = [
    { key: 1, value: "landmark" }, { key: 2, value: "festival" },]

  // Fetch data cities theo quốc gia
  // Lấy các tỉnh/ thành của quốc gia - XONG
  const fetchCitiesByCountry = useCallback(async (countryId: any) => {
    try {
      const refProvinces = ref(database, `cities/${countryId}`)
      const snapshot = await get(refProvinces);
      if (snapshot.exists()) {
        const dataProvinces = snapshot.val() as Record<string, any>;
        const dataRegions = snapshot.val() as Record<string, Record<string, Province>>;
        const dataCitiesArray: Province[] = Object.values(dataRegions)
          .flatMap(item => Object.values(item))
          .sort((a: Province, b: Province) => {
            return a.value.localeCompare(b.value);
          });
        // Thêm phần tử default
        dataCitiesArray.unshift(new Province());

        setDataCities(dataCitiesArray);
      } else {
        console.log("FetchCityByCountry: No data available1");
      }
    } catch (error) {
      console.error("FetchCityByCountry: Error fetching data: ", error);
    }
  }, [])
  // Real time listening Firebase- Khi thêm thủ công vào Firebase thì sẽ tự động cập nhật dữ liệu
  useEffect(() => {
    if (!selectedCountry && (!selectedCity || selectedCity == '-1')) return
    // setIsReady(true)
    const refPoints = ref(database, `pointsNew/${selectedCountry}/${selectedCity}/`)

    // Lắng nghe dữ liệu từ Firebase Realtime Database theo thời gian thực
    const unsubscribe = onValue(refPoints, (snapshot) => {
      if (snapshot.exists()) {
        const dataPoints = snapshot.val() as Record<string, Point>;
        const pointArr = Object.entries(dataPoints).map(([key, value]) => ({
          key, // same as: key: key
          value: value.title,
          address: value.address,
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
    return () => unsubscribe();
  }, [selectedCity])

  // const fetchDataPoints = useCallback(async (selectedCountry: any, selectedCity: any) => {
  //   console.log(selectedCity, selectedCountry, 'check');
  //   try {
  //     const refPoints = ref(database, `pointsNew/${selectedCountry}/${selectedCity}/`)
  //     const snapshot = await get(refPoints);
  //     if (snapshot.exists()) {
  //       const dataPoints = snapshot.val() as Record<string, Point>;
  //       const pointArr = Object.entries(dataPoints).map(([key, value]) => ({
  //         key, // same as: key: key
  //         value: value.title
  //       }));
  //       setFilteredData(pointArr);
  //     } else {
  //       console.log("Fetch data Points: No data available11");
  //       setFilteredData([]);
  //     }
  //   } catch (error) {
  //     console.error("Error: data points by City fetching data ", error);
  //   }
  // }, [])
  //When selectedCity & selectCountry & selectedPoint is ready
  // useEffect(() => {
  //   if (selectedCity != "" && selectedCountry != "" && selectedPoint != null) {
  //     setIsReady(true)
  //   }
  // }, [selectedCity, selectedCountry, selectedPoint])


  //Handle when selected countries
  const handleSelectedCountry = useCallback(async (val: any) => {
    if (!val) return
    if (val === 'avietnam') {
      await fetchCitiesByCountry(val)
    } else {
      Alert.alert('Chưa hỗ trợ quốc gia này');
    }

    setIsReady(false)
    setSelectedCountry(val);
    setSelectedCity('-1');
    setFilteredData([]);
  }, [fetchCitiesByCountry])

  //Handle when selected countries
  const handleSelectedCity = useCallback((val: any) => {
    if (!val) return
    if (val != '-1') {
      setIsReady(true)
    }
    else {
      setIsReady(false)
    }
    setSelectedCity(val);
  }, [selectedCountry]);
  // }, [fetchDataPoints, selectedCountry]);

  // Find type
  const getValueFromKey = (key: any) => {
    const item = type.find((item) => item.key === key);
    return item ? item.value : null;
  };


  const handleAdd = useCallback(() => {
    if (!selectedCity || selectedCity == '-1') {
      Alert.alert("Có vấn đề gì đó!", "Có vẻ bạn chưa chọn tỉnh/thành phố.", [
        { text: "OK", onPress: () => console.log("OK Pressed") }
      ]);
      return;
    } else {
      // Dữ liệu mà bạn muốn truyền
      const data = {
        idCity: selectedCity,
        idCountry: selectedCountry,
        nameCity: dataCities.find((item: any) => item.key === selectedCity)?.value || '',
        nameCountry: dataCountries.find((item: any) => item.key === selectedCountry)?.value || ''
      };
      router.push({
        pathname: "/newPoint",
        params: data,
      });
    }
  }, [selectedCity, selectedCountry, dataCities, selectedCountry]);
  // Remove
  const handleRemove = (id: string) => {
    // const type = getValueFromKey(selectedPoint)
    const refP = ref(database, `pointsNew/${selectedCountry}/${selectedCity}/${id}`);
    Alert.alert(
      "Xóa địa điểm",
      "Bạn chắc chắn muốn xóa địa điểm này chứ?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Đồng ý",
          onPress: () => {
            remove(refP).then(() => {
              console.log('Xóa dữ liệu thành công');
            })
              .catch((error) => {
                console.error('Error removing data: ', error);
              }); // Xóa từ khỏi Realtime Database
          },
        }
      ]
    );

  };

  const renderPointsItem = (item: any) => {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 20, paddingHorizontal: 15, backgroundColor: '#fff', borderRadius: 20, elevation: 2 }}>
        <View style={styles.item}>
          <Text style={styles.name}>{item.item.value}</Text>
          <Text style={{ paddingTop: 6 }}>{item.item.address}</Text>
        </View>
        <View style={{ flex: 0.2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
          <AntDesign name="delete" size={24} style={{ color: 'red' }} onPress={() => handleRemove(item.item.key)} />
        </View>
      </View>

    )
  };

  return (
    <View style={{ flex: 1, padding: 15, backgroundColor: 'white' }}>
      {/* <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
        <Entypo name="info" size={14} color="#999999" />
        <Text style={{ paddingLeft: 5, fontStyle: 'italic', color: "gray" }}>Quản lý thông tin về các địa điểm của từng tỉnh/thành phố</Text>
      </View> */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-evenly",
          marginBottom: 15,
        }}>
        <SelectList
          dropdownStyles={{
            zIndex: 10,
            position: "absolute",
            width: 170,
            backgroundColor: "white",
            top: 40,
          }}
          boxStyles={{ width: 170 }}
          setSelected={(val: any) => handleSelectedCountry(val)}
          data={dataCountries}
          save="key"
          placeholder="Quốc gia"
        />
        <SelectList
          dropdownStyles={{
            zIndex: 10,
            position: "absolute",
            width: 170,
            backgroundColor: "white",
            top: 40,
          }}
          boxStyles={{ width: 170 }}
          setSelected={(val: any) => handleSelectedCity(val)}
          data={dataCities}
          save="key"
          defaultOption={{ key: '', value: '' }}
          placeholder="Thành phố"

        />
      </View>
      {/* <View style={{ flexDirection: 'row', justifyContent: "space-between", marginHorizontal: 20 }}>
        {type.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginVertical: 4,
            }}
            onPress={() => {
              setIsReady(false)
              setSelectedPoint(item.key)
            }}
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
            <Text>{item.value === "landmark" ? "Danh lam thắng cảnh":"Lễ hội"}</Text>
          </TouchableOpacity>
        ))}
      </View> */}
      <View style={styles.addBar}>
        {
          isReady && (
            <TouchableOpacity style={styles.addBtn} onPress={handleAdd}>
              <Text style={{ color: '#ffffff', fontSize: 24 }} >+</Text>
            </TouchableOpacity>
          )}
      </View>
      <View style={styles.containerFlat}>
        {filteredData.length > 0 ? (
          <FlatList
            data={filteredData}
            keyExtractor={(item: any) => item.id}
            renderItem={renderPointsItem}
            contentContainerStyle={styles.containerFlatList}
            ItemSeparatorComponent={() => <View style={{ height: 20, }} />}
          />
        ) : (
          <Text style={styles.noAccountsText}>Không có dữ liệu</Text>
        )}
      </View>

    </View>


  )

};
const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  containerFlat: {
    marginVertical: 20,
    paddingHorizontal: 10,
    // height: "75%",
    flex: 1,
    borderColor: "red",
    borderWidth: 1,
    borderRadius: 30,
    backgroundColor: '#f5f5f5',

  },
  containerFlatList: {
    paddingVertical: 10, // khoảng cách trên và dưới của FlatList
    paddingHorizontal: 20, // khoảng cách hai bên của FlatList
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
  },
  selectList: {
    width: 170,
    // zIndex: 10, // Giúp hiển thị SelectList không bị đẩy xuống dưới khi mở
  },
  item: {
    flex: 1
    // backgroundColor: '#fff',
    // padding: 16,
    // margin: 10,
    // borderRadius: 20,
    // flexDirection: 'row',
    // justifyContent: 'space-between',
    // alignItems: 'center',
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 1 },
    // shadowOpacity: 0.2,
    // shadowRadius: 2,
    // elevation: 2,
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
    alignItems: 'center',
    marginRight: 10,
  },
  addBtn: {
    backgroundColor: iconColors.green1,
    paddingHorizontal: 20,
    borderRadius: 8,
    elevation: 4
  },
});

export default Festival;
