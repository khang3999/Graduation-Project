import { Text, View, StyleSheet } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import AvatarProfile from "./AvatarProfile";
import {
  IconButton,
  MD3Colors,
  Menu,
  Provider,
  Divider,
} from "react-native-paper";
import React from "react";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { Link, router, useRouter} from "expo-router";
import MenuItem from "@/components/buttons/MenuButton";

const Plus = () => (
  <IconButton
    icon="plus"
    iconColor={MD3Colors.error10}
    size={24}
    onPress={() => console.log("Plus button pressed")}
    style={styles.button}
    accessible={true}
    accessibilityLabel="Add button"
  />
);

const Bell = () => (
  <IconButton
    icon="bell-outline"
    iconColor={MD3Colors.error10}
    size={24}
    onPress={() => router.push("/notification")}
    style={styles.button}
    accessible={true}
    accessibilityLabel="Notifications button"
  />
);


export default function HeaderProfile() {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.row}>
          <Text style={styles.username}>tranhieuphuc12</Text>
          <MaterialIcons name="keyboard-arrow-down" size={24} color="black" />
        </View>
        <View style={styles.headerButton}>
          <Plus />
          <Bell />          
          <MenuItem menuIcon="dots-horizontal" />
        </View>
      </View>
      <AvatarProfile />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    flex: 1,
    marginTop: 20,
  },
  username: {
    fontWeight: "bold",
    fontSize: 18,
    margin: 2,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  headerButton: {
    flexDirection: "row",
    justifyContent: "space-evenly",    
  },
  button: {
    margin: 0,
  },
  menuContent: {
    backgroundColor: "#f2f2f2",
  },
  menuItem: {
    paddingVertical: 5,
  },
});
