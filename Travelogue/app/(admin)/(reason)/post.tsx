import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { FlatList, TextInput } from 'react-native-gesture-handler'
import { set, ref, database, onValue } from "@/firebase/firebaseConfig";
import { push, remove } from '@firebase/database';
import { AntDesign } from '@expo/vector-icons';

const Post = () => {
  const [inputText, setInputText] = useState('');
  const [isDisabled, setIsDisabled] = useState(false);
  const [reasons, setReasons] = useState([]);
  const [filteredData, setFilteredData] = useState([]);


  useEffect(() => {
    // Lắng nghe dữ liệu từ Firebase Realtime Database theo thời gian thực
    const onValueChange = ref(database, 'reasons/post/');
    // Lắng nghe thay đổi trong dữ liệu
    const words = onValue(onValueChange, (snapshot) => {
      if (snapshot.exists()) {
        const jsonData = snapshot.val();
        // Chuyển đổi object thành array
        const dataArray: any = Object.entries(jsonData).map(([key, value]) => ({
          id: key,
          name: value,
        }));
        setReasons(dataArray);
      } else {
        setReasons([]);  // Đảm bảo xóa hết dữ liệu khi không còn phần tử nào
        setFilteredData([]);  // Cập nhật lại giao diện
        console.log("No data available");
      }
    }, (error) => {
      console.error("Error fetching data:", error);
    });

    // Cleanup function để hủy listener khi component unmount
    return () => words();
  }, []);

  useEffect(() => {
    setFilteredData(reasons)
    console.log('Filter: ', reasons);

  }, [reasons])

  const handleAdd = async () => {
    if (inputText.trim()) {
      // Tạo một tham chiếu đến nhánh 'reasons/post' trong Realtime Database
      const wordsRef = ref(database, 'reasons/post');

      // Tạo key tu dong cua firebase
      const newItemKey = push(wordsRef);

      // Sử dụng set() để thêm dữ liệu vào Firebase theo dạng key: value
      await set(newItemKey, inputText)
        .then(() => {
          // Reset input sau khi thêm li do
          setInputText('');
          setIsDisabled(false);
          console.log('Data added successfully');
        })
        .catch((error) => {
          console.error('Error adding data: ', error);
        });

    }
  };
  const handleRemove = (reasonId: string) => {
    const refRemove = ref(database, `/reasons/post/${reasonId}`)
    Alert.alert(
      "Xác nhận xóa",
      "Bạn chắc chắn muốn xóa?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "OK", onPress: () => {
            remove(refRemove).then(() => {
              // Reset input sau khi thêm từ
              setInputText('');
              setIsDisabled(false);
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

  const handleTextChange = (text: string) => {
    setInputText(text);
    const filtered = reasons.filter((item: { id: any, name: string }) => item.name.includes(text));

    setFilteredData(filtered);

    if (filtered.length > 0 && filtered.some((item: { id: any, name: any }) => item.name === text)) {
      setIsDisabled(true);
    } else {
      setIsDisabled(false);
    }
  };

  const renderReasonItem = (reason: any) => {
    return (
      <View style={styles.item}>
        <View style={{flexDirection:'row'}}>
          <Text style={styles.name}>{reason.item.name}</Text>
          <AntDesign name="delete" size={24}  style={{width:'10%', color:'red'}} onPress={()=>handleRemove(reason.item.id)}/>

        </View>
      </View>
    )
  };
  return (
    <View>
      <View style={styles.addBar}>
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={handleTextChange}
          placeholder='Thêm lí do mới'
        />
        <TouchableOpacity
          style={[styles.addBtn, isDisabled && styles.disabledBtn]}
          onPress={() => handleAdd()}
          disabled={isDisabled}
        >
          <Text style={{ color: '#ffffff' }}>Thêm</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.container}>
        {filteredData.length > 0 ? (
          <FlatList
            data={filteredData}
            // keyExtractor={(item) => item.id}
            renderItem={renderReasonItem}
          />
        ) : (
          <Text style={styles.noAccountsText}>No reason</Text>
        )}
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
  addBar: {
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
  addBtn: {
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
    backgroundColor: '#2986cc',
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
    width: '90%'
  },
});

export default Post