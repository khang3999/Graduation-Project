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
import IconEntypo from "react-native-vector-icons/Entypo";
import IconAntDesign from "react-native-vector-icons/AntDesign";


export default function ProfileScreen() {
  interface AccountData {
    id: string;
    fullname: string;
    avatar: string;
  }

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
  const [searchedAccountsData, setSearchedAccountsData] = useState<AccountData[]>([]);
  const [filteredData, setFilteredData] = useState<AccountData[]>([]);


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
      const userRef = ref(database, `accounts/${userId}`);
      off(userRef);
    };
  }, [userId]);

  //get all accounts data
  useEffect(() => {
    const fetchData = () => {
      const usersRef = ref(database, "accounts");

      onValue(usersRef, (snapshot) => {
        const results: AccountData[] = [];
        snapshot.forEach((childSnapshot) => {
          const item = childSnapshot.val();
          results.push({ id: childSnapshot.key!, ...item });
        });
        setSearchedAccountsData(results);
      });
    };

    fetchData();
  }, []);

  const handleSearch = (term: string) => {
    if (term == "") return;

    const lowerTerm = term.trim().toLowerCase();

    const results = searchedAccountsData.filter((item, index) => {
      const itemName = item.fullname ? item.fullname.toLowerCase() : "";
      return itemName.includes(lowerTerm);
    });

    setFilteredData(results);

  };

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
      <HeaderProfile userData={accountData} onModalOpen={openSearchModal} onModalClose={closeSearchModal} handleSearch={handleSearch} />
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
              data={filteredData}
              keyExtractor={(item, index) => `${item}-${index}`}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => console.log(item.avatar, "item")}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'row' }}>
                      <Image style={styles.searchedAvatar} source={{ uri: item.avatar }} />
                      <Text style={styles.searchItem}>{item.fullname}</Text>
                    </View>
                    <TouchableOpacity onPress={() => console.log("Followed")}>
                      <IconAntDesign name="arrowright" size={30} style={styles.threeDot} />
                    </TouchableOpacity>
                  </View>
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
  searchedAvatar: {
    width: 60,
    height: 60,
    resizeMode: "cover",
    borderRadius: 60,
    marginBottom: 20,
  },
  searchItem: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    fontSize: 16,
    color: '#333',
  },
  threeDot: {
    paddingVertical: 15,
    color: 'grey'
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
