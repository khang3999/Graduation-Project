import {
  Image,
  StyleSheet,
  Platform,
  Text,
  ActivityIndicator,
} from "react-native";

import HeaderProfile from "@/components/profile/HeaderProfile";
import GalleryTabView from "@/components/profile/GalleryTabView";
import React, { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { database, auth } from "@/firebase/firebaseConfig";
import { ref, onValue, off } from "firebase/database";

export default function ProfileScreen() {
  const [userData, setUserData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const userId = auth.currentUser?.uid;

  const fetchStoredUserData = async () => {
    try {
      const storedData = await AsyncStorage.getItem("userData");
      if (storedData) {
        setUserData(JSON.parse(storedData));
      }
    } catch (error) {
      console.error("Error fetching data from AsyncStorage", error);
    }
  };

  const syncUserDataWithFirebase = async () => {
    const userRef = ref(database, `accounts/${userId}`);

    // Realtime listener to update data when Firebase data changes
    onValue(userRef, async (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setUserData(data); // Update state
        await AsyncStorage.setItem("userData", JSON.stringify(data)); // Update AsyncStorage
      }
    });
  };

  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      await fetchStoredUserData(); // Try to fetch from AsyncStorage first
      await syncUserDataWithFirebase(); // Set up Firebase listener for real-time updates
      setLoading(false);
    };
    initialize();

    // Clean up the listener when the component unmounts
    return () => {
      const userRef = ref(database, `users/${userId}`);
      off(userRef); // Detach the listener
    };
  }, [userId]);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (!userData) {
    return <Text>No user data available</Text>;
  }

  // console.log(userData);

  return (
    <>
      <HeaderProfile userData={userData} />
      <GalleryTabView />
    </>
  );
}

const styles = StyleSheet.create({
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
