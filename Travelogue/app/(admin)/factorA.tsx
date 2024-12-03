import { View, Text, Alert, TextInput, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { database, onValue, ref } from '@/firebase/firebaseConfig';
import { update } from '@firebase/database';

const Factor = () => {
  const [dataFactorReport, setDataFactorReport] = useState([]);
  const [initDataFactorReport, setInitDataFactorReport] = useState([]);
  const [updatedDataReport, setUpdatedDataReport] = useState({});

  // Fetch report data from Firebase
  useEffect(() => {
    const reportRef = ref(database, 'factors/report');
    const reportListener = onValue(
      reportRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const jsonData = snapshot.val();
          const dataArray:any = Object.entries(jsonData).map(([key, value]) => ({
            name: key,
            factor: value,
          }));
          setDataFactorReport(dataArray);
          setInitDataFactorReport(dataArray);
        } else {
          console.log('No data available');
        }
      },
      (error) => {
        console.error('Error fetching data:', error);
      }
    );

    // Cleanup listener on component unmount
    return () => reportListener();
  }, []);

  // Save changes to Firebase
  const handleSaveReport = () => {
    const reportRef = ref(database, 'factors/report');
    Alert.alert(
      'Change factor',
      'Are you sure you want to change factors of the report?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => {
            setDataFactorReport([]);
            setDataFactorReport(initDataFactorReport);
            setUpdatedDataReport({});
          },
        },
        {
          text: 'OK',
          onPress: () => {
            update(reportRef, updatedDataReport)
              .then(() => {
                console.log('Data updated successfully!');
                setUpdatedDataReport({}); // Clear updated data after saving
              })
              .catch((error) => {
                console.error('Error updating data:', error);
              });
          },
        },
      ]
    );
  };

  // Render individual factor report item
  const renderFactorsReportItem = (factor:any) => (
    <View style={styles.item}>
      <Text style={styles.title}>{factor.item.name}</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        defaultValue={factor.item.factor.toString()} // Ensure it's a string
        onChangeText={(text) => {
          setUpdatedDataReport((prevData) => ({
            ...prevData,
            [factor.item.name]: text, // Update factor by name
          }));

          // // Update local data for UI feedback
          // setDataFactorReport((prevData:any) =>
          //   prevData.map((factor:any) =>
          //     factor.name === item.name ? { ...factor, factor: text } : factor
          //   )
          // );
        }}
      />
    </View>
  );

  return (
    <View style={{ marginTop: 30 }}>
      <View style={styles.container}>
        <Text style={styles.category}>Report</Text>
        {dataFactorReport.length > 0 ? (
          <FlatList
            data={dataFactorReport}
            renderItem={renderFactorsReportItem}
            // keyExtractor={(item) => item.name}
            removeClippedSubviews={false}
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
    color: '#777777',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  category: {
    fontSize: 18,
    fontStyle: 'italic',
    marginLeft: 20,
    fontWeight: '500',
  },
  title: {
    fontSize: 14,
    padding: 20,
    marginLeft: 25,
    flex: 3,
    color: '#444444',
  },
  input: {
    height: 35,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 20,
    marginHorizontal: 20,
    borderRadius: 10,
    flex: 2,
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
  },
});

export default Factor;
