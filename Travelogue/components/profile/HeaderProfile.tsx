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

const MyComponent = () => {
  const [visible, setVisible] = React.useState(false);

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  return (
    <Provider>
      <View>
        <Menu
          visible={visible}
          onDismiss={closeMenu}
          anchor={
            <IconButton
              icon="menu"
              iconColor={MD3Colors.error10}
              size={24}
              onPress={openMenu}
              style={styles.button}
              accessible={true}
              accessibilityLabel="Menu button"
            />
          }
          contentStyle={styles.menuContent}
        >
          <Menu.Item
            onPress={() => console.log("Profile clicked")}
            title="Profile"
            leadingIcon={() => <Icon name="account" size={20} color="black" />}
            style={styles.menuItem}
          />
          <Menu.Item
            onPress={() => console.log("Settings clicked")}
            title="Settings"
            leadingIcon={() => <Icon name="cog" size={20} color="black" />}
            style={styles.menuItem}
          />
          <Divider />
          <Menu.Item
            onPress={() => console.log("Logout clicked")}
            title="Logout"
            leadingIcon={() => <Icon name="logout" size={20} color="black" />}
            style={styles.menuItem}
          />
        </Menu>
      </View>
    </Provider>
  );
};

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
          
          <MyComponent />
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
    marginEnd: 20,
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
