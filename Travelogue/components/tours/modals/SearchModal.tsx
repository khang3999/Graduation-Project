import { Dimensions, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useCallback } from 'react'
import { useTourProvider } from '@/contexts/TourProvider';
import { database, get, ref } from '@/firebase/firebaseConfig';
import { backgroundColors, iconColors } from '@/assets/colors';
import { FontAwesome, FontAwesome5, FontAwesome6, Ionicons } from '@expo/vector-icons';
import { MultipleSelectList, SelectList } from 'react-native-dropdown-select-list';
import { useHomeProvider } from '@/contexts/HomeProvider';
import { Province } from '@/model/ProvinceModal';

const { width, height } = Dimensions.get('window')

//TOUR
const SearchModal = () => {

  const {
    // ModalSearch
    // selectedTypeSearch, setSelectedTypeSearch,
    selectedTypeSearch,
    dataTypeSearch,
    modalSearchVisible, setModalSearchVisible,
    setIsLoading,
    dataInput,
    selectedCountry,
    setSearch,
    selectedCities, setSelectedCities,
    dataCities, setDataCities
  }: any = useTourProvider()
  const { dataCountries }: any = useHomeProvider()
  console.log('reeeeee');

  // Hàm search . Khi tap vào button search thì lưu giá trị các biến đã chọn qua 1 biến khác để hiển thị ở home, và set lại giá trị default cho các biến đó
  const handleTapOnSearchButton = useCallback(() => {
    // if (!(dataInput === '' && selectedCountry === null && selectedCities.length === 0)) {
    if (!(dataInput.current === '' && selectedCountry.current === null && selectedCities.length === 0)) {
      setIsLoading(true)
      setSearch((prev: Boolean) => !prev) // Chay ham search
    }
    // Chi dong modal
    setModalSearchVisible(false)
  }, [])

  // Hàm đóng modal search
  const handleTapOnCloseButtonModalSearch = useCallback(() => {
    dataInput.current = ''
    selectedCountry.current = null
    setSelectedCities([])
    setDataCities([])
    setModalSearchVisible(false)
  }, [])

  // Fetch data cities theo quốc gia
  const fetchCityByCountry = useCallback(async (countryId: any) => {
    try {
      const refCity = ref(database, `cities/${countryId}`)
      const snapshot = await get(refCity);
      if (snapshot.exists()) {
        // const dataCityJson = snapshot.val()
        const dataRegions = snapshot.val() as Record<string, Record<string, Province>>;


        const dataCitiesArray = Object.entries(dataRegions)
          .flatMap(([_, cities]) =>
            Object.entries(cities).map(([cityId, cityData]: [string, any]) => ({
              key: cityId,
              value: cityData.value
            }))
          );
        // const dataCitiesArray: Province[] = Object.values(dataRegions)
        //   .flatMap(item => Object.values(item))
        setDataCities(dataCitiesArray)
      } else {
        console.log("No data city available");
      }
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  }, [])

  const handleSelecteCountry = useCallback((val: any) => {
    // Fetch city tương ứng tương ứng (chính)
    fetchCityByCountry(val)
    // Lưu lại quốc gia đang chọn ra biến thành phần 2.1. Chuyển thành {key:'a', value:'b'} (để set giá trị mặc định có cũng được không cũng được) khi nào lưu default Option thì mở ra
    // Xử lí dữ liệu cho biến selectedCountry
    const country = dataCountries.find((country: any) => country.key === val);
    // setSelectedCountry(country)
    selectedCountry.current = country
  }, [])
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalSearchVisible}
      statusBarTranslucent={true}
      onRequestClose={() => {
        // Alert.alert('Modal has been closed.');
        setModalSearchVisible(!modalSearchVisible);
      }}>
      <View style={styles.modalView}>
        <View style={styles.modalBottomView}>
          <View style={styles.modalTitleWrap}>
            <Text style={styles.modalTitleText}>Bộ lọc</Text>
            <Ionicons name="filter" size={24} color={iconColors.green1} />
          </View>
          <View style={{ width: 350 }}>
            <View style={styles.wrapLabelModalFilter}>
              <Text style={styles.textLabelModalFilter}>Nội dung</Text>
              <FontAwesome5 name="signature" size={18} color={iconColors.green1} />
            </View>
            <TextInput
              style={{ borderWidth: 1, borderRadius: 10, paddingHorizontal: 8, height: 48 }}
              placeholder="Nhập nội dung tìm kiếm"
              onChangeText={(str) => dataInput.current = str}
            // onChangeText={(str) => setDataInput(str)}
            />
            <View style={styles.wrapLabelModalFilter}>
              <Text style={styles.textLabelModalFilter}>Quốc gia</Text>
              <FontAwesome name="globe" size={20} color={iconColors.green1} />
            </View>
            <SelectList
              setSelected={(val: any) => handleSelecteCountry(val)}
              data={dataCountries}
              maxHeight={120}
              save="key"
              placeholder='Chọn quốc gia'
              searchPlaceholder='Nhập tên quốc gia'
              notFoundText='Không tìm thấy quốc gia'
            // onSelect={(val: any)=>{console.log(val)}}
            // defaultOption={selectedCountry}
            />
            <View style={styles.wrapLabelModalFilter}>
              <Text style={styles.textLabelModalFilter}>Tỉnh/Thành phố</Text>
              <FontAwesome6 name="tree-city" size={18} color={iconColors.green1} />
            </View>
            <MultipleSelectList
              setSelected={(val: any) => setSelectedCities(val)}
              data={dataCities}
              save="key"
              // onSelect={() => alert(selectedMultiList)}
              label="Categories"
              placeholder='Chọn tỉnh/thành phố'
              searchPlaceholder='Nhập tên tỉnh/thành phố'
              notFoundText='Không tìm thấy tỉnh/thành phố'
              maxHeight={230}
            />
            <View style={styles.wrapLabelModalFilter}>
              <Text style={styles.textLabelModalFilter}>Kiểu sắp xếp</Text>
              <FontAwesome6 name="filter" size={18} color={iconColors.green1} />
            </View>
            <SelectList
              search={false}
              setSelected={(val: number) => selectedTypeSearch.current = val}
              data={dataTypeSearch}
              maxHeight={120}
              save="key"
              defaultOption={{ key: 1, value: 'Mặc định' }}
            // onSelect={(val: any)=>{console.log(val)}}
            // defaultOption={selectedCountry}
            />
          </View>
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.buttonModal, styles.buttonSearch]}
              onPress={handleTapOnSearchButton}>
              <Text style={[styles.textStyle, { color: 'white' }]}>Áp dụng</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.buttonModal, styles.buttonCancel]}
              onPress={handleTapOnCloseButtonModalSearch}>
              <Text style={styles.textStyle}>Hủy</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.overPlay}></View>
      </View>
    </Modal>
  )
}

export default SearchModal

const styles = StyleSheet.create({
  modalFooter: {
    flexDirection: 'row',
    width: '100%',
    paddingVertical: 8,
    justifyContent: 'center',
    alignItems: 'center'
  },
  // Modal new posts
  modalView: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalBottomView: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    width: width,
    alignItems: 'center',
    zIndex: 4,
    borderBottomWidth: 1,
  },
  // Modal filter
  wrapLabelModalFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 6
  },
  textLabelModalFilter: {
    fontWeight: '500',
    marginVertical: 8,
    marginRight: 4,
    // backgroundColor:'green'
  },
  overPlay: {
    backgroundColor: 'black',
    // top: -40,
    height: height,
    width: '100%',
    position: 'absolute',
    opacity: 0.4,
    zIndex: 3
  },
  textStyle: {
    // color: 'white',
    fontWeight: '500',
    textAlign: 'center',
    fontSize: 16
  },
  buttonSearch: {
    backgroundColor: iconColors.green1,
  },
  buttonCancel: {
    backgroundColor: backgroundColors.background1,
    borderWidth: 1,
    borderColor: iconColors.green1
  },
  buttonModal: {
    padding: 10,
    borderRadius: 5,
    margin: 10,
    width: 100,
    elevation: 4
  },
  modalTitleText: {
    fontSize: 24,
    fontWeight: '600',
    marginRight: 10,
  },
  modalTitleWrap: {
    backgroundColor: iconColors.green2,
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
})