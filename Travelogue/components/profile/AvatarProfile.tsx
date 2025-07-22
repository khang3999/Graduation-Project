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
  const { dataAccount, setDataAccount, searchedAccountData } = useAccount();

  interface AccountData {
    avatar: string;
    fullname: string;
    totalPosts?: number;
  }

  const data: AccountData = isSearched ? searchedAccountData : dataAccount;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={{ paddingHorizontal: 10 }}>
          {isSearched &&
            <Text style={styles.username} numberOfLines={3} ellipsizeMode="tail">{data.fullname}</Text>}
          <Image style={styles.avatar} source={{ uri: data.avatar }} />
        </View>


        <View style={styles.column}>
          <Text style={styles.infoText}>{data.totalPosts ?? null}</Text>
          <Text style={styles.infoText}>Bài viết</Text>
        </View>

      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 15
  },
  avatar: {
    width: 120,
    height: 120,
    resizeMode: "contain",
    borderColor: "grey",
    borderWidth: 2,
    borderRadius: 100,
  },
  column: {
    flex: 1,
    flexDirection: "column",
    marginTop: 15,
  },
  infoText: {
    fontWeight: "500",
    fontSize: 18,
    textAlign: "center",
  },
  username: {
    fontWeight: "500",
    fontSize: 18,
    paddingBottom: 10,
    backgroundColor: "#CDCDCD",
    textAlign: 'center'
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
