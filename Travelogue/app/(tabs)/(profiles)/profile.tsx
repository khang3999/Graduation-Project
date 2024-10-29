import {
  Image,
  StyleSheet,
  Platform,
  Text,
  ActivityIndicator,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  View,
  TextInput,
  FlatList,
} from "react-native";

import HeaderProfile from "@/components/profile/HeaderProfile";
import GalleryTabView from "@/components/profile/GalleryTabView";
import React, { useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { database, auth } from "@/firebase/firebaseConfig";
import { ref, onValue, off } from "firebase/database";
import { useAccount } from "@/contexts/AccountProvider";
import HeaderProfileSkeleton from "@/components/skeletons/HeaderProfileSkeleton";
import { TouchableOpacity } from "react-native-gesture-handler";

export default function ProfileScreen() {
  const { accountData, setAccountData } = useAccount();
  const userId = auth.currentUser?.uid;
  const { height: SCREEN_HEIGHT } = Dimensions.get("window");
  const [isSearchModalVisible, setIsSearchModalVisible] = useState(false);
  const modalAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const [recentSearches, setRecentSearches] = useState<string[]>([
    "React Native",
    "Clean Architecture",
    "Machine Learning",
  ]);
  //search bar state
  const [accountsData, setAccountsData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const syncUserDataWithFirebase = async () => {
    const userRef = ref(database, `accounts/${userId}`);
    // Realtime listener to update data when Firebase data changes
    onValue(userRef, async (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setAccountData(data); // Update state
      }
    });
  };
  
  useEffect(() => {
    const initialize = async () => {
      await syncUserDataWithFirebase(); 
    };
    initialize();

    // Clean up the listener when the component unmounts
    return () => {
      const userRef = ref(database, `users/${userId}`);
      off(userRef); 
    };
  }, [userId]);

  const openSearchModal = () => {
    setIsSearchModalVisible(true);
    Animated.timing(modalAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeSearchModal = () => {
    Animated.timing(modalAnim, {
      toValue: SCREEN_HEIGHT,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setIsSearchModalVisible(false));
  };


  if (!accountData) {
    return <Text>No user data available</Text>;
  }

  return (
    <>
      <HeaderProfile userData={accountData} onModalOpen={openSearchModal} onModalClose={closeSearchModal} />
      <GalleryTabView />
      {/* Recent Search Modal */}
      {isSearchModalVisible && (
        <Animated.View
          style={[
            styles.searchModal,
            { transform: [{ translateY: modalAnim }] },
          ]}
        >       
          <View style={styles.modalContent}>
            <Text style={styles.recentSearchText}>Recent Searches</Text>
            <FlatList
              data={recentSearches}
              keyExtractor={(item, index) => `${item}-${index}`}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => console.log(`${item} Tapped!`)}>
                <Text style={styles.searchItem}>{item}</Text>
                </TouchableOpacity>
              )}
            /> 
          </View>
        </Animated.View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  searchItem: {
    paddingVertical: 10,
    fontSize: 16,
    color: '#333',
  },
  searchModal: {
    position: "absolute",
    top: 100,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    padding: 20,
  },
  recentSearchText: {
    fontWeight: "bold",
    marginVertical: 10,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
});
