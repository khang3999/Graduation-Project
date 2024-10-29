import React, { useState, useRef, useEffect } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
  Modal,
  FlatList,
  TouchableWithoutFeedback,
} from "react-native";
import IconFeather from "react-native-vector-icons/Feather";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const SearchButton = ({
  setDisplay,
  onModalOpen,
  onModalClose
}: {
  setDisplay: (value: boolean) => void;
  onModalOpen: () => void;
  onModalClose: () => void;
}) => {
  const [searchText, setSearchText] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Animations
  const widthAnim = useRef(new Animated.Value(50)).current;
  const cancelOpacity = useRef(new Animated.Value(0)).current;
  
  
  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: isExpanded ? SCREEN_WIDTH * 0.8 : 50, // Expand or collapse
      duration: 400,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start();


    Animated.timing(cancelOpacity, {
      toValue: isExpanded ? 1 : 0, // Fade in/out cancel button
      duration: 1000,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [isExpanded]);


  return (
    <View style={styles.container}>
      <Animated.View style={[styles.searchBox, { width: widthAnim }]}>
        <TouchableOpacity
          onPress={() => {
            setIsExpanded(true);
            setDisplay(false);
            onModalOpen();
          }}
        >
          <IconFeather name="search" size={20} />
        </TouchableOpacity>
        {isExpanded && (
          <TextInput
            style={styles.input}
            placeholder="Search"
            placeholderTextColor="#888"
            value={searchText}
            onChangeText={setSearchText}
            autoFocus={true}
          />
        )}
      </Animated.View>
      {isExpanded && (
        <Animated.View style={{ opacity: cancelOpacity }}>
          <TouchableOpacity
            onPress={() => {
              setSearchText("");
              setIsExpanded(false);
              setDisplay(true);
              onModalClose();
            }}
          >
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
         
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingLeft: 10,
  },
  input: {
    flex: 1,
    padding: 8,
    fontSize: 16,
  },
  icon: {
    marginHorizontal: 5,
  },
  cancelButton: {    
    color: '#007aff',
    fontSize: 16,
  },  
});
export default SearchButton;
