import { auth } from "@/firebase/firebaseConfig";
import React, { useState, useRef } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { router } from "expo-router";
import { signOut } from "firebase/auth";
import { appColors } from "@/constants/appColors";
import {Button, Divider} from "react-native-paper";

interface MenuPopupButtonProps {
  menuIcon: string;
}

const MenuPopupButton: React.FC<MenuPopupButtonProps> = ({ menuIcon }) => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 }); // Position of the menu
  const buttonRef = useRef(null); // To measure the button's position
  // Function to toggle modal visibility
  const toggleModal = () => {
    if (!isModalVisible) {
      // Measure the position of the button before showing the menu
      buttonRef.current.measure((fx, fy, width, height, px, py) => {
        setMenuPosition({
          top: py + height - 20, // Place the menu right below the button
          left: px - 130, // Align it with the left side of the button
        });
      });
    }
    setModalVisible(!isModalVisible);
  };

  return (
    <View style={styles.container}>
      {/* Button to open the menu */}
      <TouchableOpacity
        ref={buttonRef}
        onPress={toggleModal}
        style={styles.button}
      >
        <Icon size={24} name={menuIcon}></Icon>
      </TouchableOpacity>

      {/* Menu Modal */}
      {isModalVisible && (
        <Modal
          transparent={true}
          visible={isModalVisible}
          animationType="none"
          onRequestClose={toggleModal}
        >
          <TouchableOpacity
            style={styles.overlay}
            activeOpacity={1}
            onPressOut={toggleModal}
          >
            <View
              style={[
                styles.menu,
                { top: menuPosition.top, left: menuPosition.left },
              ]}
            >
              <Button
                icon="image-outline"
                mode="text"
                onPress={() => console.log("Pressed")}  
                textColor="#000"                                              
              >
                Edit
              </Button>
              <View style={styles.border} />
              <Button
                icon="trash-can-outline"
                mode="text"
                onPress={() => console.log("Pressed")}  
                textColor="#000"                              
              >
                Trash
              </Button>
              <View style={styles.border} />
              <Button
                icon="send"
                mode="text"
                onPress={() => console.log("Pressed")}  
                textColor="#000"                              
              >
                Report
              </Button>
              
           
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
};

// Styles for the components
const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    borderRadius: 5,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  menu: {
    position: "absolute",
    backgroundColor: "white",
    padding: 10,
    borderRadius: 15,
    alignItems: "center",
    elevation: 5, // Shadow for Android
    shadowColor: "#000", // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  border: {        
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    width: 150,
    alignItems: "center",
    borderRadius: 5,
  },
  menuText: {
    fontSize: 16,
    color: "#333",
  },
});

export default MenuPopupButton;
