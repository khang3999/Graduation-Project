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
  TouchableWithoutFeedback,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { router } from "expo-router";
import { signOut } from "firebase/auth";
import { appColors } from "@/constants/appColors";
import {Button, Divider} from "react-native-paper";

interface MenuPopupButtonProps {
  isAuthor: () => boolean;
}

const MenuPopupButton: React.FC<MenuPopupButtonProps> = ({isAuthor}) => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 }); // Position of the menu
  const buttonRef = useRef<TouchableOpacity>(null); // To measure the button's position
  // Function to toggle modal visibility
  const toggleModal = () => {
    if (!isModalVisible) {
      // Measure the position of the button before showing the menu
      buttonRef.current?.measure((fx: number, fy: number, width: number, height: number, px: number, py: number) => {
        setMenuPosition({
          top: py + height - 20, // Place the menu right below the button
          left: px - 140, // Align it with the left side of the button
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
      <Icon size={24} name="dots-horizontal" style={styles.icon} />
    </TouchableOpacity>

    {/* Menu Modal */}
    {isAuthor() && isModalVisible ? (
      <Modal
        transparent={true}
        visible={isModalVisible}
        animationType="fade"
        onRequestClose={toggleModal}
      >
        <TouchableWithoutFeedback onPress={toggleModal}>
          <View style={styles.overlay}>
            <View
              style={[
                styles.menu,
                { top: menuPosition.top, left: menuPosition.left },
              ]}
            >
              <TouchableOpacity style={styles.menuItem}>
                <Icon name="image-outline" size={20} style={styles.menuIcon}/>
                <Text style={styles.menuText}>Chỉnh Sửa</Text> 
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem}>
                <Icon name="trash-can-outline" size={20} style={styles.menuIcon} />
                <Text style={styles.menuText}>Xóa</Text>
              </TouchableOpacity>
              {/* <TouchableOpacity style={styles.menuItem}>
                <Icon name="send" size={20} style={styles.menuIcon} />
                <Text style={styles.menuText}>Báo cáo</Text>
              </TouchableOpacity> */}
            </View>
          </View>

        </TouchableWithoutFeedback>

      </Modal>
    ) : (
      <Modal
      transparent={true}
      visible={isModalVisible}
      animationType="fade"
      onRequestClose={toggleModal}
    >
      <TouchableWithoutFeedback onPress={toggleModal}>
        <View style={styles.overlay}>
          <View
            style={[
              styles.menu,
              { top: menuPosition.top, left: menuPosition.left },
            ]}
          >           
            <TouchableOpacity style={styles.menuItem}>
              <Icon name="send" size={20} style={styles.menuIcon} />
              <Text style={styles.menuText}>Báo cáo</Text>
            </TouchableOpacity>
          </View>
        </View>

      </TouchableWithoutFeedback>

    </Modal>
    )}
  </View>
  );
};
const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  button: {
    padding: 8,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
  },
  icon: {
    color: '#333',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  menu: {
    position: 'absolute',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingVertical: 5,
    width: 180,
    elevation: 5, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  menuItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  menuText: {
    fontSize: 16,
    color: '#333',
  },
  menuIcon: {
    marginRight: 10,

  }
});

export default MenuPopupButton;
