import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { ref, onValue, push, set, update, remove } from '@firebase/database';
import { database } from '@/firebase/firebaseConfig';

const PackageComponent = () => {
  const [editingPackageId, setEditingPackageId] = useState<string | null>(null);
  const [dataPackage, setDataPackage] = useState<any[]>([]);
  const [localDataPackage, setLocalDataPackage] = useState<any[]>([]);
  const [updatedDataPackage, setUpdatedDataPackage] = useState<any>({});

  useEffect(() => {
    const packagesRef = ref(database, 'packages');
    const listener = onValue(
      packagesRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const dataArray = Object.values(data).map((item: any) => ({
            ...item,
          }));
          setDataPackage(dataArray);
          setLocalDataPackage(dataArray);
        } else {
          setDataPackage([]);
          setLocalDataPackage([]);
        }
      },
      (error) => {
        console.error('Error fetching data:', error);
        setDataPackage([]);
        setLocalDataPackage([]);
      }
    );

    // Cleanup listener
    return () => {
      listener();
    };
  }, []);

  const handleAddPackage = async () => {
    const packagesRef = ref(database, 'packages/');
    const newPackageRef = push(packagesRef);
    const newItem = {
      id: newPackageRef.key,
      name: 'New Package',
      price: 0,
      minAccumulated: 0,
      discount: 0,
      hashtag: 0,
    };

    try {
      await set(newPackageRef, newItem);
      console.log('Package added successfully');
    } catch (error) {
      console.error('Error adding package:', error);
    }
  };

  const handleSavePackage = async () => {
    if (!editingPackageId) return;

    const packageUpdateRef = ref(database, `packages/${editingPackageId}`);
    Alert.alert(
      'Xác nhận lưu',
      'Bạn chắc chắn muốn lưu những thay đổi?',
      [
        {
          text: 'Hủy',
          style: 'cancel',
          onPress: () => {
            setUpdatedDataPackage({});
            setEditingPackageId(null);
            setLocalDataPackage(dataPackage); // Reset local data
          },
        },
        {
          text: 'OK',
          onPress: async () => {
            try {
              await update(packageUpdateRef, updatedDataPackage);
              console.log('Package updated successfully');
              setUpdatedDataPackage({});
              setEditingPackageId(null);
            } catch (error) {
              console.error('Error updating package:', error);
            }
          },
        },
      ]
    );
  };

  const handleRemove = (pkg: any) => {
    const packageRef = ref(database, `packages/${pkg.id}`);
    Alert.alert(
      'Xác nhận xóa',
      'Bạn chắc chắn muốn xóa gói hiện tại?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'OK',
          onPress: async () => {
            try {
              await remove(packageRef);
              console.log('Package removed successfully');
            } catch (error) {
              console.error('Error removing package:', error);
            }
          },
        },
      ]
    );
  };

  const renderPackage = (item: any) => {
    return (
      <View key={item.item.id}>
        <TextInput
          style={styles.category}
          defaultValue={item.item.name}
          onFocus={() => setEditingPackageId(item.item.id)}
          onChangeText={(text) => {
            setUpdatedDataPackage((prevData:any) => ({
              ...prevData,
              name: text,
            }));
          }}
        />
        <View style={styles.item}>
          <Text style={styles.title}>Giá gói</Text>
          <TextInput
            keyboardType="numeric"
            style={styles.input}
            defaultValue={String(item.item.price)}
            onFocus={() => setEditingPackageId(item.item.id)}
            onChangeText={(text) => {
              setUpdatedDataPackage((prevData:any) => ({
                ...prevData,
                price: Number(text),
              }));
            }}
          />
        </View>
        <View style={styles.item}>
          <Text style={styles.title}>Tích lũy tối thiểu</Text>
          <TextInput
            keyboardType="numeric"
            style={styles.input}
            defaultValue={String(item.item.minAccumulated)}
            onFocus={() => setEditingPackageId(item.item.id)}
            onChangeText={(text) => {
              setUpdatedDataPackage((prevData:any) => ({
                ...prevData,
                minAccumulated: Number(text),
              }));
            }}
          />
        </View>
        <View style={styles.item}>
          <Text style={styles.title}>Giảm giá {"(%)"}</Text>
          <TextInput
            keyboardType="numeric"
            style={styles.input}
            defaultValue={String(item.item.discount)}
            onFocus={() => setEditingPackageId(item.item.id)}
            onChangeText={(text) => {
              setUpdatedDataPackage((prevData:any) => ({
                ...prevData,
                discount: Number(text),
              }));
            }}
          />
        </View>
        <View style={styles.item}>
          <Text style={styles.title}>Số lượng hashtag</Text>
          <TextInput
            keyboardType="numeric"
            style={styles.input}
            defaultValue={String(item.item.hashtag)}
            onFocus={() => setEditingPackageId(item.item.id)}
            onChangeText={(text) => {
              setUpdatedDataPackage((prevData:any) => ({
                ...prevData,
                hashtag: Number(text),
              }));
            }}
          />
        </View>

        <View style={styles.buttonContainer}>
          {editingPackageId === item.item.id && (
            <TouchableOpacity style={styles.saveBtn} onPress={handleSavePackage}>
              <Text style={styles.buttonText}>Lưu</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => handleRemove(item.item)}
          >
            <Text style={styles.buttonText}>Xóa</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.line} />
      </View>
    );
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View>
        <View style={styles.addBar}>
          <TouchableOpacity style={styles.addBtn} onPress={handleAddPackage}>
            <Text style={{ color: '#ffffff' }}>Thêm</Text>
          </TouchableOpacity>
        </View>
        {localDataPackage.length > 0 ? (
          <FlatList
            data={localDataPackage}
            renderItem={renderPackage}
            keyExtractor={(item) => item.id}
            removeClippedSubviews={false}
          />
        ) : (
          <Text style={styles.noAccountsText}>Không có dữ liệu</Text>
        )}
      </View>
    </TouchableWithoutFeedback>
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
    margin: 20,
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
