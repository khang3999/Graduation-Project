import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { set, ref, database, onValue } from "@/firebase/firebaseConfig";
import { push, remove, update } from '@firebase/database';
import { FlatList } from 'react-native-gesture-handler';

const Factor = () => {
  const [dataFactorPost, setDataFactorPost] = useState<any>([]);
  const [dataFactorReport, setDataFactorReport] = useState([]);
  const [initDataFactorPost, setInitDataFactorPost] = useState([]);
  const [initDataFactorReport, setInitDataFactorReport] = useState([]);
  const [updatedDataPost, setUpdatedDataPost] = useState({});
  const [updatedDataReport, setUpdatedDataReport] = useState({});
  const [isCancel, setIsCancel] = useState(false)

  //Du lieu post
  useEffect(() => {
    // Lắng nghe dữ liệu từ Firebase Realtime Database theo thời gian thực
    const onValueChange = ref(database, 'factors/post');
    // Lắng nghe thay đổi trong dữ liệu
    const post = onValue(onValueChange, (snapshot) => {
      if (snapshot.exists()) {
        const jsonData = snapshot.val();
        // Chuyển đổi object thành array
        const dataArray: any = Object.entries(jsonData).map(([key, value]) => ({
          name: key,
          factor: value,
        }));
        setDataFactorPost(dataArray);
        setInitDataFactorPost(dataArray);
      } else {
        console.log("No data available");
      }
    }, (error) => {
      console.error("Error fetching data:", error);
    });

    // Cleanup function để hủy listener khi component unmount
    return () => post();
  }, []);
  //Du lieu report
  useEffect(() => {
    // Lắng nghe dữ liệu từ Firebase Realtime Database theo thời gian thực
    const onValueChange = ref(database, 'factors/report');
    // Lắng nghe thay đổi trong dữ liệu
    const report = onValue(onValueChange, (snapshot) => {
      if (snapshot.exists()) {
        const jsonData = snapshot.val();
        // Chuyển đổi object thành array
        const dataArray: any = Object.entries(jsonData).map(([key, value]) => ({
          name: key,
          factor: value,
        }));
        setDataFactorReport(dataArray);
        setInitDataFactorReport(dataArray);
      } else {
        console.log("No data available");
      }
    }, (error) => {
      console.error("Error fetching data:", error);
    });

    // Cleanup function để hủy listener khi component unmount
    return () => report();
  }, []);
  
  //Save Change post
  const handleSavePost = () => {
    const postRef = ref(database, 'factors/post');
    Alert.alert(
      "Change factor",
      "Are you sure you want to change factors of post ?",
      [
        { text: "Cancel", style: "cancel",
      onPress:()=>{
        setDataFactorPost([])
        setDataFactorPost(initDataFactorPost);
        setUpdatedDataPost({});
      }},
        {
          text: "OK", onPress: () => {
            
            update(postRef, updatedDataPost)
              .then(() => {
                console.log('Data updated successfully!');
              })
              .catch((error) => {
                console.error('Error updating data:', error);
              });
          }
        }
      ]
    );
  };
  //Save Change report
  const handleSaveReport = () => {
    const reportRef = ref(database, 'factors/report');
    Alert.alert(
      "Change factor",
      "Are you sure you want to change factors of report ?",
      [
        { text: "Cancel", style: "cancel",
        onPress:()=>{
          setDataFactorReport([])
          setDataFactorReport(initDataFactorReport);
          setUpdatedDataReport({});
        }},
        {
          text: "OK", onPress: () => {
            update(reportRef, updatedDataReport)
              .then(() => {
                console.log('Data updated successfully!');
              })
              .catch((error) => {
                console.error('Error updating data:', error);
              });
          }
        }
      ]
    );
  };

//Render Post
  const renderFactorsPostItem = (factor: any) => {
    console.log('factor ',factor);
    
    return (
      <View style={styles.item}>
        <Text style={styles.title}>{factor.item.name}</Text>
        <TextInput
          keyboardType='numeric'
          style={styles.input}
          defaultValue={factor.item.factor}
          onChangeText={(text) => {
            setUpdatedDataPost((prevData) => ({
              ...prevData,
              [factor.item.name]: text,
            }));
          }}
        ></TextInput>
      </View>
    )
  };

//Render Report
  const renderFactorsReportItem = (factor: any) => {
    return (
      <View style={styles.item}>
        <Text style={styles.title}>{factor.item.name}</Text>
        <TextInput style={styles.input} 
        keyboardType='numeric'
         defaultValue={factor.item.factor}
         onChangeText={(text) => {
           setUpdatedDataReport((prevData) => ({
             ...prevData,
             [factor.item.name]: text,
           }));
         }}>
        </TextInput>
      </View>
    )
  };

  return (
    <View style={{ marginTop: 30 }}>
      <View style={styles.container}>
        <Text style={styles.category}>Artical post</Text>
        {dataFactorPost.length > 0 ? (
          <FlatList
            data={dataFactorPost}
            // keyExtractor={(item) => item.id}
            renderItem={renderFactorsPostItem}
          />
        ) : (
          <Text style={styles.noAccountsText}>No data</Text>
        )}
        <View style={{ display: 'flex', justifyContent: 'center', flexDirection: 'row' }}>
          <TouchableOpacity style={styles.approveBtn} onPress={handleSavePost}>
            <Text style={styles.approveText}>Save</Text>
          </TouchableOpacity>
        </View>

      </View>
      <View style={styles.container}>
        <Text style={styles.category}>Report</Text>
        {dataFactorReport.length > 0 ? (
          <FlatList
            data={dataFactorReport}
            // keyExtractor={(item) => item.id}
            renderItem={renderFactorsReportItem}
          />
        ) : (
          <Text style={styles.noAccountsText}>No data</Text>
        )}
        <View style={{ display: 'flex', justifyContent: 'center', flexDirection: 'row' }}>
          <TouchableOpacity style={styles.approveBtn} onPress={handleSaveReport}>
            <Text style={styles.approveText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>

    </View>

  )
}
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
  line: {
    height: 1,
    backgroundColor: '#d3d3d3',
    marginHorizontal: 20,
    marginVertical: 30,

  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  category: {
    fontSize: 18,
    fontStyle: 'italic',
    marginLeft: 20,
    fontWeight: 500
  },
  title: {
    fontSize: 14,
    padding: 20,
    marginLeft: 25,
    flex: 3,
    color: '#444444'
  },
  input: {
    height: 35,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 20,
    marginHorizontal: 20,
    borderRadius: 10,
    flex: 2
  },
  approveBtn: {
    backgroundColor: '#2986cc',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    width: 100,
    marginTop: 10,
    justifyContent: 'center',
  },
  approveText: {
    color: '#ffffff',
    textAlign: 'center',
    fontSize: 20,
  }
})
export default Factor