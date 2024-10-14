import { Image, StyleSheet, Platform, Text, ActivityIndicator } from "react-native";

import HeaderProfile from "@/components/profile/HeaderProfile";
import GalleryTabView from "@/components/profile/GalleryTabView";
import React, { useEffect } from "react";
import { getCurrentUserData } from "@/services/userService";

export default function ProfileScreen() {
  const [userData, setUserData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await getCurrentUserData();
        setUserData(data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }     
    };
    fetchUserData();
  }, []);
 
  if(loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (!userData) {
    return <Text>No user data available</Text>;
  }
  
  console.log(userData);
  
  return (
    <>
      <HeaderProfile />
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
