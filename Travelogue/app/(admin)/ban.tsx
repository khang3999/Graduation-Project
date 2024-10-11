import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native'
import React, { useState } from 'react'
import { FlatList, TextInput } from 'react-native-gesture-handler'

interface BanWord {
  id: string;
  name: string;
}

const initialBanWords: BanWord[] = [
  { id: '1', name: 'User 1' },
  { id: '2', name: 'User 2' },
  { id: '3', name: 'User 3' },
  { id: '4', name: 'User 4' },
];

const Ban = () => {
  const [inputText, setInputText] = useState('');
  const [banWords, setBanWords] = useState<BanWord[]>(initialBanWords);
  const [filteredData, setFilteredData] = useState(banWords);
  const [isDisabled, setIsDisabled] = useState(false);

  const handleAdd = () => {
    if (inputText.trim()) {
      const newItem = { id: (banWords.length + 1).toString(), name: inputText };
      const newBanWords = [...banWords, newItem];
      setBanWords(newBanWords);
      setFilteredData(newBanWords);
      setInputText('');
      setIsDisabled(false);
    }
  };

  const handleTextChange = (text: string) => {
    setInputText(text);
    const filtered = banWords.filter(item => item.name.includes(text));
    setFilteredData(filtered);

    if (filtered.length > 0 && filtered.some(item => item.name === text)) {
      setIsDisabled(true);
    } else {
      setIsDisabled(false);
    }
  };

  const unblockBanWord = (banWordId: string) => {
    Alert.alert(
      "Remove word",
      "Are you sure you want to remove this word?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "OK", onPress: () => {
            const newBanWords = banWords.filter(banWord => banWord.id !== banWordId);
            setBanWords(newBanWords);
            setFilteredData(newBanWords);
          }
        }
      ]
    );
  };

  const renderBanWordsItem = ({ item }: { item: BanWord }) => (
    <View style={styles.item}>
      <View>
        <Text style={styles.name}>{item.name}</Text>
      </View>
      <TouchableOpacity
        style={styles.remove}
        onPress={() => unblockBanWord(item.id)}
      >
        <Text style={{ color: '#ffffff' }}>Remove</Text>
      </TouchableOpacity>
    </View>
  );

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
          onPress={handleAdd}
          disabled={isDisabled}
        >
          <Text style={{ color: '#ffffff' }}>Add</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.container}>
        {filteredData.length > 0 ? (
          <FlatList
            data={filteredData}
            keyExtractor={(item) => item.id}
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
    backgroundColor: '#999999', // Màu xám cho button khi disabled
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
