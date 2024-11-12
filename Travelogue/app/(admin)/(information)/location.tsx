import { View, Text, Platform, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Button, Checkbox, Divider } from 'react-native-paper';
import { SelectList } from 'react-native-dropdown-select-list'
import { ref } from '@firebase/database';
import { database, onValue } from '@/firebase/firebaseConfig';
import { get, update } from '@firebase/database'
import { TextInput } from 'react-native-gesture-handler';


const Location = () => {
    const [selectedCountry, setSelectedCountry] = useState("");
    const [selectedCity, setSelectedCity] = useState("");
    const [cityArea, setCityArea] = useState("");
    const [cityInformation, setCityInformation] = useState("");
    const [dataCountries, setDataCountries] = useState([])
    const [dataCities, setDataCities] = useState([])
    const [editText, setEditText] = useState(false)
    const inputRef: any = useRef(null);

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
                console.log("No data city available");
            }
        } catch (error) {
            console.error("Error fetching data: ", error);
        }
    }

    //Handle when selected countries
    const handleSelectedCountry = (val: any) => {
        setSelectedCountry(val)
        fetchCityByCountry(val)

    }
    //Handle when selected countries
    const handleSelectedCity = (val: any) => {
        setSelectedCity(val)
        if (val != "" && val != undefined) {
            const a: any = dataCities.find((e: any) => (e.key == val))
            setCityArea(a.area)
            setCityInformation(a.information)
        }
    }

    //Handle Save
    const handleSave = () => {
        setEditText(false)
        if (inputRef.current) {
            inputRef.current.blur();
        }

        const cityUpdateRef = ref(database, `cities/${selectedCountry}/${cityArea}/${selectedCity}`);
        Alert.alert(
            "Change information",
            "Are you sure you want to update information of " + selectedCity + " ?",
            [
                {
                    text: "Cancel", style: "cancel",

                }, {
                    text: "OK", onPress: () => {
                        update(cityUpdateRef, { "information": cityInformation })
                            .then(() => {
                                console.log('Data updated successfully!');
                            })
                            .catch((error) => {
                                console.error('Error updating data:', error);
                            });
                    }
                }])
    }



    return (
        <View style={{ padding: 15, backgroundColor: 'white' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', marginBottom: 15 }}>
                <SelectList
                    dropdownStyles={{ zIndex: 10, position: 'absolute', width: 170, backgroundColor: 'white', top: 40 }}

                    boxStyles={{ width: 170 }}
                    setSelected={(val: any) => handleSelectedCountry(val)}
                    data={dataCountries}
                    save="key"
                    placeholder='Countries'
                />
                <SelectList
                    dropdownStyles={{ zIndex: 10, position: 'absolute', width: 170, backgroundColor: 'white', top: 40 }}

                    boxStyles={{ width: 170 }}
                    setSelected={(val: any) => handleSelectedCity(val)}
                    data={dataCities}
                    save="key"
                    placeholder='Cities'

                />
            </View>
            <TouchableOpacity
                style={styles.imageBtn}
            >
                <Text style={styles.buttonText}>Imangeeeeee</Text>
            </TouchableOpacity>
            <TextInput
                ref={inputRef}
                style={styles.textArea}
                multiline={true}
                numberOfLines={4} // sets the height based on line count
                placeholder="Write your comment here..."
                value={cityInformation}
                onChangeText={setCityInformation}
                onFocus={() => setEditText(true)}
            />
            {editText && (
                <TouchableOpacity
                    style={styles.saveBtn}
                    onPress={handleSave}
                >
                    <Text style={styles.buttonText}>Save</Text>
                </TouchableOpacity>
            )}


        </View>


    )

};
const styles = StyleSheet.create({
    container: {
        padding: 10,
    },
    textArea: {
        height: 150,
        padding: 10,
        top: 100,
        textAlignVertical: 'top', // aligns text to the top in Android
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
    }, saveBtn: {
        top: 140,
        backgroundColor: '#2986cc',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        marginRight: 10,
    }, buttonText: {
        color: '#ffffff',
        textAlign: 'center',
        fontSize: 16,
    }, imageBtn: {
        top: 20,
        backgroundColor: '#2986cc',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 50,
        marginRight: 10,
        width: 100,
        height: 40,
        alignSelf: 'center'
    },
});

export default Location;
