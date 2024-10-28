import {
  Text,
  View,
  StyleSheet,
  Image,
  Pressable,
  ActivityIndicator,
} from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import Feather from "@expo/vector-icons/Feather";
import Entypo from "@expo/vector-icons/Entypo";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { getImageUrl } from "@/services/userService";
import { set } from "lodash";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function AvatarProfile({ userData }: any) {
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAvatarUrl = async () => {
      try {
        //check if the avatar URL is cached in the local storage
        const cachedUrl = await AsyncStorage.getItem(`avatar_${userData.id}`);
        if(cachedUrl){
          setAvatarUrl(cachedUrl);
        }else{
        // Fetch the avatar URL from the server
        const url = await getImageUrl(userData.avatar);
        setAvatarUrl(url);
        // Cache the avatar URL in the local storage
        await AsyncStorage.setItem(`avatar_${userData.id}`, url);

      }
      } catch (error) {
        console.error("Error fetching avatar URL:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAvatarUrl();    
  }, [userData.avatar]);
  
  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Image style={styles.avatar} source={{ uri: avatarUrl }} />
        <View style={styles.column}>
          <Text style={styles.infoText}>{userData.totalLikes ?? null}</Text>
          <Text style={styles.infoText}>thich</Text>
        </View>
        <View style={styles.column}>
          <Text style={styles.infoText}>{userData.totalPosts ?? null}</Text>
          <Text style={styles.infoText}>bai viet</Text>
        </View>
      </View>
      <Text style={styles.username}>{userData.fullname}</Text>
      <Pressable
        style={styles.button}
        onPressIn={() =>
          router.push({ pathname: "/editing", params: userData })
        }
      >
        <Text style={styles.editText}>Edit Profile</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 30,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  avatar: {
    width: 100,
    height: 100,
    resizeMode: "contain",
    borderColor: "grey",
    borderWidth: 2,
    borderRadius: 100,
    marginLeft: 10,
  },
  column: {
    flexDirection: "column",
    marginTop: 15,
  },
  infoText: {
    fontWeight: "bold",
    fontSize: 18,
    textAlign: "center",
  },
  username: {
    fontWeight: "bold",
    fontSize: 18,
    padding: 10,
    marginLeft: 10,
  },
  button: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 1,
    paddingHorizontal: 32,
    borderRadius: 6,
    elevation: 2,
    backgroundColor: "#CDCDCD",
    marginHorizontal: 15,
  },
  editText: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "bold",
    letterSpacing: 0.25,
    color: "#2C2C2C",
  },
});
