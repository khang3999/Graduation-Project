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
import HeaderProfileSkeleton from "@/components/skeletons/HeaderProfileSkeleton";

export default function ProfileScreen() {
  const { accountData, setAccountData } = useAccount();
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
      await syncUserDataWithFirebase(); // Set up Firebase listener for real-time updates
    };
    initialize();

    // Clean up the listener when the component unmounts
    return () => {
      const userRef = ref(database, `users/${userId}`);
      off(userRef); // Detach the listener
    };
  }, [userId]);

  if (!accountData) {
    return <Text>No user data available</Text>;
  }

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
