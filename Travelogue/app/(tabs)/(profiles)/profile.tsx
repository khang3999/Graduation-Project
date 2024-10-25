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
import { useAccount } from "@/contexts/AccountProvider";


export default function ProfileScreen() {
  const { accountData, setAccountData } = useAccount();
  const [loading, setLoading] = React.useState(true);
  const userId = auth.currentUser?.uid;


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
      setLoading(true);      
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

  if (!accountData) {
    return <Text>No user data available</Text>;
  }

  // console.log(userData);

  return (
    <>
      <HeaderProfile userData={accountData} />
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
