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


export default function AvatarProfile({ userData }: any) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Image style={styles.avatar} source={{ uri: userData.avatar }} />

        <Text style={styles.username} numberOfLines={3} ellipsizeMode="tail">{userData.fullname}</Text>

        <View style={styles.column}>
          <Text style={styles.infoText}>{userData.totalPosts ?? null}</Text>
          <Text style={styles.infoText}>posts</Text>
        </View>
        {/* <Pressable
              style={styles.button}
              onPressIn={() =>
                router.push({ pathname: "/editing", params: userData })
              }
            >
              <Text style={styles.editText}>Edit Profile</Text>
            </Pressable> */}


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
    margin: 2,
    marginTop: 20,
    maxWidth: 120,
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
