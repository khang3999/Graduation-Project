import { Text, View, StyleSheet, Image, Pressable } from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import Feather from "@expo/vector-icons/Feather";
import Entypo from "@expo/vector-icons/Entypo";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Ionicons from "@expo/vector-icons/Ionicons";
import {router} from 'expo-router';
import React from "react";

export default function AvatarProfile() {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Image
          style={styles.avatar}
          source={require("@/assets/images/tom.png")}
        />
        <View style={styles.column}>
          <Text style={styles.infoText}>1.000</Text>
          <Text style={styles.infoText}>thich</Text>
        </View>
        <View style={styles.column}>
          <Text style={styles.infoText}>59</Text>
          <Text style={styles.infoText}>bai viet</Text>
        </View>
      </View>
      <Text style={styles.username}>Tom</Text>
      <Pressable
        style={styles.button}
        onPressIn={() => router.push("/editing")}
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
