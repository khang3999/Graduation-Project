import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import React, { useState, useEffect, Children } from 'react';
import { FlatList, TextInput } from 'react-native-gesture-handler';
import { set, ref, database, onValue } from "@/firebase/firebaseConfig";
import { push, remove } from '@firebase/database';

const Ban = () => {
  const [inputText, setInputText] = useState('');
  const [banWords, setBanWords] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isDisabled, setIsDisabled] = useState(false);

  useEffect(() => {
    // Lắng nghe dữ liệu từ Firebase Realtime Database theo thời gian thực
    const onValueChange = ref(database, 'words/');
    // Lắng nghe thay đổi trong dữ liệu
    const words = onValue(onValueChange, (snapshot) => {
      if (snapshot.exists()) {
        const jsonData = snapshot.val();
        // Chuyển đổi object thành array
        const dataArray: any = Object.entries(jsonData).map(([key, value]) => ({
          id: key,
          name: value,
        }));
        setBanWords(dataArray);
      } else {
        setBanWords([]);  // Đảm bảo xóa hết dữ liệu khi không còn phần tử nào
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
    setFilteredData(banWords)
    console.log('Filter: ', banWords);

  }, [banWords])

  const handleAdd = async () => {
    if (inputText.trim()) {
      // Tạo một tham chiếu đến nhánh 'words' trong Realtime Database
      const wordsRef = ref(database, 'words');

      // Tạo key tu dong cua firebase
      const newItemKey = push(wordsRef);
      console.log(newItemKey);
      

      // Sử dụng set() để thêm dữ liệu vào Firebase theo dạng key: value
      await set(newItemKey, inputText)
        .then(() => {
          // Reset input sau khi thêm từ
          setInputText('');
          setIsDisabled(false);
          console.log('Data added successfully');
        })
        .catch((error) => {
          console.error('Error adding data: ', error);
        });

    }
  };


  const handleTextChange = (text: string) => {
    setInputText(text);
    const filtered = banWords.filter((item: { id: any, name: string }) => item.name.includes(text));

    setFilteredData(filtered);

    if (filtered.length > 0 && filtered.some((item: { id: any, name: any }) => item.name === text)) {
      setIsDisabled(true);
    } else {
      setIsDisabled(false);
    }
  };

  const unblockBanWord = (banWordId: string) => {
    const refRemove = ref(database, `/words/${banWordId}`)
    Alert.alert(
      "Remove word",
      "Are you sure you want to remove this word?",
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

  const renderBanWordsItem = (word: any) => {
    return (
      <View style={styles.item}>
        <View>
          <Text style={styles.name}>{word.item.name}</Text>
        </View>
        <TouchableOpacity
          style={styles.remove}
          onPress={() => unblockBanWord(word.item.id)}
        >
          <Text style={{ color: '#ffffff' }}>Remove</Text>
        </TouchableOpacity>
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
        />
        <TouchableOpacity
          style={[styles.addBtn, isDisabled && styles.disabledBtn]}
          onPress={() => handleAdd()}
          disabled={isDisabled}
        >
          <Text style={{ color: '#ffffff' }}>Add</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.container}>
        {filteredData.length > 0 ? (
          <FlatList
            data={filteredData}
            // keyExtractor={(item) => item.id}
            renderItem={renderBanWordsItem}
          />
        ) : (
          <Text style={styles.noAccountsText}>No words</Text>
        )}
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
  },
});

export default Ban;
