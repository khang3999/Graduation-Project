import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import React, { useState, useEffect, Children, useCallback } from 'react';
import { database, onValue, ref, get } from '@/firebase/firebaseConfig';
import { runTransaction, update } from '@firebase/database';
import { useRanking } from '@/contexts/RankingContext';
import { now } from 'lodash';

const Reset = () => {
  const [selected, setSelected] = useState("");
  const [selectedCities, setSelectedCities] = useState([]);
  const { citiesData } = useRanking()

  const resetScore = useCallback(async () => {
    if (!selected) {
      console.log("aaaaaa");

      return
    }
    try {
      const refReset = ref(database, selected)
      const snapshot = await get(refReset)
      if (snapshot.exists()) {
        const posts = snapshot.val()
        for (const selectedId of Object.keys(posts)) {
          const refPost = ref(database, `${selected}/${selectedId}/scores`)
          await runTransaction(refPost, () => {
            return 0
          })
        };

      }
      else {
        console.log("Reset fail");

      }
    } catch (error) {
      console.error("Reset fail: ", error);
    }
  }, [selected])
  const resetCitiesScore = useCallback(async () => {
    if (!selected) {
      console.log("cccc");

      return
    }
    try {

      for (const city of citiesData) {
        const refCity = ref(database, `cities/${city.idCountry}/${city.areaId}/${city.key}/scores`)
        await runTransaction(refCity, () => {
          return 0
        })
      };


    } catch (error) {
      console.error("Reset fail: ", error);
    }
  }, [selected, citiesData])

  const handleReset = (key: any) => {
    let notiKey = "";
    switch (key) {
      case ("cities"):
        notiKey = "Tỉnh thành";
        break;
      case ("posts"):
        notiKey = "Bài viết"
        break;
      case ("tours"):
        notiKey = "Tour"
        break;
    }
    if (new Date().getDate() !== 17) {
      Alert.alert(
        "Xác nhận làm mới điểm ",
        "Hôm nay không phải ngày đầu tháng, bạn chắc chắn muốn làm mới điểm của " + notiKey + " ?",
        [
          { text: "Huỷ", style: "cancel" },
          {
            text: "Đồng ý", onPress: () => {

                      setSelected(key)

                    }
                  }
                ]
              );
    }
    else {
      Alert.alert(
        "Xác nhận làm mới điểm ",
        "Bạn chắc chắn muốn làm mới điểm của " + notiKey + " ?",
        [
          { text: "Huỷ", style: "cancel" },
          {
            text: "Đồng ý", onPress: () => {

              setSelected(key)

            }
          }
        ]
      );
    }
  };

  useEffect(() => {
    if (!selected) {
      console.log("bbbb");

      return
    }
    if (selected != "cities") {
      resetScore()
    }
    else {
      resetCitiesScore()
    }
    setSelected("")
  }, [selected])



  return (
    <View>
      {/* Score Cities */}
      <View style={styles.items}>
        <Text style={styles.name}>Làm mới lại điểm của Tỉnh Thành</Text>
        <TouchableOpacity
          style={[styles.resetBtn]}
          onPress={() => handleReset("cities")}
        >
          <Text style={{ color: '#ffffff' }}>Reset</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.line} />
      {/* Score post */}
      <View style={styles.items}>
        <Text style={styles.name}>Làm mới lại điểm của Bài viết</Text>
        <TouchableOpacity
          style={[styles.resetBtn]}
          onPress={() => handleReset("posts")}
        >
          <Text style={{ color: '#ffffff' }}>Reset</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.line} />
      {/* Score Tour */}
      <View style={styles.items}>
        <Text style={styles.name}>Làm mới lại điểm của Tour</Text>
        <TouchableOpacity
          style={[styles.resetBtn]}
          onPress={() => handleReset("tours")}
        >
          <Text style={{ color: '#ffffff' }}>Reset</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.line} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f2f2f2',
  },
  noAccountsText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 20,
    color: '#777'
  },
  items: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 30
  },
  textInput: {
    height: 35,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 20,
    borderRadius: 10,
    flex: 3,
  },
  resetBtn: {
    backgroundColor: '#5E8C31',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginLeft: 20,
    borderRadius: 8,
  },
  disabledBtn: {
    backgroundColor: '#999999',
  },
  remove: {
    // backgroundColor: '#2986cc',
    backgroundColor: '#ff3d3d',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8
  },
  item: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 10,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
  },
  line: {
    height: 1,
    backgroundColor: '#d3d3d3',
    marginHorizontal: 20,
    marginVertical: 30,
  },
});

export default Reset;
