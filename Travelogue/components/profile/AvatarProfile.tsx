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
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Image style={styles.avatar} source={{ uri: userData.avatar }} />

        <View style={styles.column}>
          <Text style={styles.username}>{userData.fullname}</Text>
          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.infoText}>{userData.totalPosts ?? null}</Text>
              <Text style={styles.infoText}>posts</Text>
            </View>
            <Pressable
              style={styles.button}
              onPressIn={() =>
                router.push({ pathname: "/editing", params: userData })
              }
            >
              <Text style={styles.editText}>Edit Profile</Text>
            </Pressable>
          </View>
        </View>
      </View>
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
    width: 130,
    height: 130,
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
    marginBottom: 10,
  },
  button: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
    borderRadius: 6,    
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
