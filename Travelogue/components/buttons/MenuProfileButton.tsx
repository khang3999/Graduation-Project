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
import AsyncStorage from "@react-native-async-storage/async-storage";
interface MenuPopupButtonProps {
  menuIcon: string;
  isDisplay: boolean;
  isSearched: boolean;
}

const MenuProfileButton: React.FC<MenuPopupButtonProps> = ({ menuIcon, isDisplay,isSearched }) => {
  const [isModalVisible, setModalVisible] = useState(false);
  // Position of the menu
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<TouchableOpacity>(null);


  const toggleModal = () => {
    if (!isModalVisible) {
      // Measure the position of the button before showing the menu
      buttonRef.current?.measure((fx: number, fy: number, width: number, height: number, px: number, py: number) => {
        setMenuPosition({
          top: py + height - 20, // Place the menu right below the button
          left: px - 130, // Align it with the left side of the button
        });
      });
    }
    setModalVisible(!isModalVisible);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('user');
      Alert.alert("Đăng xuất thành công", "Bạn đã đăng xuất khỏi tài khoản.");
      router.replace("/LoginScreen");
    } catch (error) {
      Alert.alert("Lỗi", "Đăng xuất không thành công. Vui lòng thử lại.");
    }
  };
  const handleEditProfile = () => {
    router.push("/Editing");
  }
  if (!isDisplay) {
    return;
  }
  const handleChangePassword =() =>{
    router.push('/ChangePassword')
    return
  }
  // Handle the report user
  const handleReportAcccount = () => {

  }

  return (
    <View style={styles.container}>
      {/* Button to open the menu */}
      <TouchableOpacity
        ref={buttonRef}
        onPress={toggleModal}
        style={styles.button}
      >
        <Icon size={24} name="menu" style={styles.icon} />
      </TouchableOpacity>

      {/* Menu Modal */}
      {isModalVisible && !isSearched ? (
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

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={handleEditProfile}
                >
                  {/* cspell: disable-next-line */}
                  <Text style={styles.menuText}>Thay đổi hồ sơ</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.menuItem}
                onPress={handleChangePassword}
                >
                  {/* cspell: disable-next-line */}
                  <Text style={styles.menuText}>Thay đổi mật khẩu</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
                  {/* cspell: disable-next-line */}
                  <Text style={styles.menuText}>Đăng xuất</Text>
                </TouchableOpacity>
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
              <TouchableOpacity
                style={styles.menuItem}      
                onPress={handleReportAcccount}        
              >
                {/* cspell: disable-next-line */}
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

// Styles for the components
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
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  menuText: {
    fontSize: 16,
    color: '#333',
  },
});

export default MenuProfileButton;