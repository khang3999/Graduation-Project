import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { set, ref, database, onValue } from "@/firebase/firebaseConfig";
import { remove, update, push } from '@firebase/database';
import { useNavigation } from '@react-navigation/native';
import DropDownPicker from 'react-native-dropdown-picker';



const PackageComponent = () => {
  const [editingPackageId, setEditingPackageId] = useState<string | null>(null);
  const [dataPackage, setDataPackage] = useState([]);
  const [localDataPackage, setLocalDataPackage] = useState<any>([]);
  const [updatedDataPackage, setUpdatedDataPackage] = useState({});

  useEffect(() => {
    // Lắng nghe dữ liệu từ Firebase Realtime Database theo thời gian thực
    const onValueChange = ref(database, 'packages');
    // Lắng nghe thay đổi trong dữ liệu
    const packages = onValue(onValueChange, (snapshot) => {
      if (snapshot.exists()) {
        const jsonData = snapshot.val();
        // Chuyển đổi object thành array
        const dataArray: any = Object.values(jsonData)
        // .map(([key, value]) => ({value}));
        console.log('data', dataArray);

        setDataPackage(dataArray);
        setLocalDataPackage(dataArray)
      } else {
        console.log("No data available");
      }
    }, (error) => {
      console.error("Error fetching data:", error);
    });

    // Cleanup function để hủy listener khi component unmount
    return () => packages();
  }, [])

  const handleAddPackage = async () => {
    console.log('aaa');

    // Tạo một tham chiếu đến nhánh 'packages' trong Realtime Database
    const packagesRef = ref(database, 'packages/');

    // Tạo key tu dong cua firebase
    const newItemKey = push(packagesRef);
    const item = {
      discount: 0,
      factor: 0,
      id: newItemKey.key,
      minAccumulated: 0,
      name: 'unknown',
      price: 0
    };

    console.log(newItemKey);

    // Sử dụng set() để thêm dữ liệu vào Firebase theo dạng key: value
    await set(newItemKey, item)
      .then(() => {
        console.log('Data added successfully');
      })
      .catch((error) => {
        console.error('Error adding data: ', error);
      });

  };

  const handleSavePackage = async () => {
    console.log('aaa');

    // Tạo một tham chiếu đến nhánh 'packages' trong Realtime Database
    const packageUpdateRef = ref(database, `packages/${editingPackageId}`);
    Alert.alert(
      "Change package",
      "Are you sure you want to update package ?",
      [
        {
          text: "Cancel", style: "cancel",
          onPress: () => {
            setLocalDataPackage([]);
            setLocalDataPackage(dataPackage);
            setUpdatedDataPackage({})
            setEditingPackageId(null)
          }
        }, {
          text: "OK", onPress: () => {
            update(packageUpdateRef, updatedDataPackage)
              .then(() => {
                setUpdatedDataPackage({})
                setEditingPackageId(null)
                console.log('Data updated successfully!');
              })
              .catch((error) => {
                console.error('Error updating data:', error);
              });
          }
        }])
  };

  const handleRemove = (pkg: any) => {
    const refRemove = ref(database, `packages/${pkg.id}`)
    Alert.alert(
      "Remove package",
      "Are you sure you want to remove this package?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "OK", onPress: () => {
            remove(refRemove).then(() => {
              console.log('Data remove successfully');
            })
              .catch((error) => {
                console.error('Error removing data: ', error);
              }); // Xóa từ khỏi Realtime Database
          }
        }
      ]
    );

  };
  //Render
  const renderPackage = (item: any) => {

    return (
      <View key={item.item.id}>
        <TextInput
          style={styles.category}
          defaultValue={item.item.name}
          onFocus={() => setEditingPackageId(item.item.id)}
          onChangeText={(text) => {
            setUpdatedDataPackage((prevData) => ({
              ...prevData,
              "name": text
            }));
          }}
        ></TextInput>
        <View style={styles.item}>
          <Text style={styles.title}>Price</Text>
          <TextInput

            style={styles.input}
            defaultValue={String(item.item.price)}
            onFocus={() => setEditingPackageId(item.item.id)}
            onChangeText={(text) => {
              setUpdatedDataPackage((prevData) => ({
                ...prevData,
                "price": text
              }));

            }}
          />
        </View>
        <View style={styles.item}>
          <Text style={styles.title}>Accumulated</Text>
          <TextInput
            style={styles.input}
            defaultValue={String(item.item.minAccumulated)}
            onFocus={() => setEditingPackageId(item.item.id)}
            onChangeText={(text) => {
              setUpdatedDataPackage((prevData) => ({
                ...prevData,
                "minAccumulated": text
              }));

            }}
          />


        </View>
        <View style={styles.item}>
          <Text style={styles.title}>Discount</Text>
          <TextInput
            style={styles.input}
            defaultValue={String(item.item.discount)}
            onFocus={() => setEditingPackageId(item.item.id)}
            onChangeText={(text) => {
              setUpdatedDataPackage((prevData) => ({
                ...prevData,
                "discount": text
              }));

            }}

          />
        </View>


        <View style={styles.buttonContainer}>
          {/* Hiển thị nút Save nếu gói đang được chỉnh sửa */}
          {editingPackageId === item.item.id && (
            <TouchableOpacity
              style={styles.saveBtn}
              onPress={handleSavePackage}
            >
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>

          )}
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => handleRemove(item.item)}
          >
            <Text style={styles.buttonText}>Delete</Text>
          </TouchableOpacity>

        </View>
        <View style={styles.line} />
      </View>

    )
  };


  return (
    <View style={{ marginTop: 30 }}>
      <View style={styles.addBar}>
        <TouchableOpacity style={styles.addBtn} onPress={handleAddPackage}>
          <Text style={{ color: '#ffffff' }} >Add</Text>
        </TouchableOpacity>

      </View>
      {localDataPackage.length > 0 ? (
        <FlatList
          data={localDataPackage}
          renderItem={renderPackage}
          removeClippedSubviews={false}
        />
      ) : (
        <Text style={styles.noAccountsText}>No data</Text>
      )}

    </View>
  );

};

// Styles
const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f2f2f2',
  },
  noAccountsText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 20,
    color: '#777777'
  },
  addBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
    marginRight: 20,
  },
  addBtn: {
    backgroundColor: '#5E8C31',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginLeft: 20,
    borderRadius: 8,
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  saveBtn: {
    backgroundColor: '#2986cc',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 10,
  },
  deleteBtn: {
    backgroundColor: '#cc0000',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  buttonText: {
    color: '#ffffff',
    textAlign: 'center',
    fontSize: 16,
  },
});

export default PackageComponent;

