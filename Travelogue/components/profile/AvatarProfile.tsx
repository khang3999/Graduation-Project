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
import { useAccount } from "@/contexts/AccountProvider";


interface AvatarProfileProps {
  isSearched: boolean;
}

export default function AvatarProfile({ isSearched }: AvatarProfileProps) {
  const { accountData, searchedAccountData } = useAccount();

  const data = isSearched ? searchedAccountData : accountData

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Image style={styles.avatar} source={{ uri: data.avatar }} />

        <Text style={styles.username} numberOfLines={3} ellipsizeMode="tail">{data.fullname}</Text>

        <View style={styles.column}>
          <Text style={styles.infoText}>{data.totalPosts ?? null}</Text>
          <Text style={styles.infoText}>posts</Text>
        </View>

      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingTop: 10 ,

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
