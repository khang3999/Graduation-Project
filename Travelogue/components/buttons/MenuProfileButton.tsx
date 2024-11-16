import { auth, database, get, onValue, push, ref, update } from "@/firebase/firebaseConfig";
import React, { useState, useRef, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  TouchableWithoutFeedback,
  FlatList,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { router } from "expo-router";
import { signOut } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message-custom";
import { asyncStorageEmitter } from "@/utils/emitter";
import { MaterialIcons } from '@expo/vector-icons';
import { useAccount } from "@/contexts/AccountProvider";
interface MenuPopupButtonProps {
  menuIcon: string;
  isDisplay: boolean;
  isSearched: boolean;
}

const MenuProfileButton: React.FC<MenuPopupButtonProps> = ({ menuIcon, isDisplay, isSearched }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  // Position of the menu
  const {searchedAccountData}:any = useAccount();
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<TouchableOpacity>(null);

  //Report
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedReason, setSelectedReason] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [reasonsAccount, setReasonsAccount] = useState([])
  const [dataReason, setDataReason] = useState([])
  const [typeReport, setTypeReport] = useState('')
  const [idAccount, setIdAccount] = useState('')
  const [reasonsComment, setReasonsComment] = useState([])

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
    setIsModalVisible(!isModalVisible);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      await AsyncStorage.removeItem('userToken');
      asyncStorageEmitter.emit("userTokenChanged");
      await AsyncStorage.removeItem('user');
      Toast.show({
        type: "success",
        text1: "Đăng xuất thành công",
        text2: `Tạm biệt bạn hẹn gặp lại...`,
        // visibilityTime: 3000,
      });
      router.replace("/LoginScreen");
    } catch (error) {
      Alert.alert("Lỗi", "Đăng xuất không thành công. Vui lòng thử lại.");
    }
  };
  const handleEditProfile = () => {
    router.push("/editing");
  }
  
  const handleChangePassword = () => {
    router.push('/changePassword')
    return
  }

  //Report 
  // Reason account
  useEffect(() => {
    // Lắng nghe dữ liệu từ Firebase Realtime Database theo thời gian thực
    const onValueChange = ref(database, 'reasons/account/');
    // Lắng nghe thay đổi trong dữ liệu
    const reason = onValue(onValueChange, (snapshot) => {
      if (snapshot.exists()) {
        const jsonData = snapshot.val();
        // Chuyển đổi object thành array
        const dataArray: any = Object.entries(jsonData).map(([key, value]) => ({
          id: key,
          name: value,
        }));
        setReasonsAccount(dataArray);
      } else {
        console.log("No data available");
      }
    }, (error) => {
      console.error("Error fetching data:", error);
    });

    // Cleanup function để hủy listener khi component unmount
    return () => reason();
  }, []);


  const handleReport = (reason: any) => {
    setSelectedReason(reason);
    setModalVisible(false);
    setShowConfirmation(true);
    setTimeout(() => {
      setShowConfirmation(false);
    }, 3000);
    reportAccount(reason)
  };
  //Update report
  const reportAccount = async (reason: any) => {
    let item: any = {
      reason: {

      }
    }
    const reportRef = ref(database, `reports/account/${idAccount}`);
    // Tạo key tu dong cua firebase
    const newItemKey = push(ref(database, `reports/account/${idAccount}/reason/`));
    const snapshot = await get(reportRef);
    if (snapshot.exists()) {
      item = snapshot.val();

    }
    const reasonKey = newItemKey.key as string;
    const itemNew = {
      account_id: idAccount,
      reason: {
        ...item.reason,
        [reasonKey]: reason
      },
      status_id: 1
    }
    await update(reportRef, itemNew)
      .then(() => {
        console.log('Data added successfully');
      })
      .catch((error) => {
        console.error('Error adding data: ', error);
      });

  };
  const handlePressReport = () => {
    setModalVisible(true)
    setIsModalVisible(false)
    setIdAccount(searchedAccountData.id)
    setDataReason(reasonsAccount)
  }

  if (!isDisplay) {
    return;
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
                  onPress={handlePressReport}
                >
                  {/* cspell: disable-next-line */}
                  <Text style={styles.menuText}>Báo cáo</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      )}
        {/* Report Modal */}
        <Modal
        transparent={true}
        animationType="slide"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select a reason for report</Text>
            <FlatList
              data={dataReason}
              keyExtractor={(_,index) => index.toString()}
              renderItem={(item: any) => (
                <TouchableOpacity
                  style={styles.reasonItem}
                  onPress={() => handleReport(item.item.name)}
                >
                  <Text style={styles.reasonText}>{item.item.name}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <MaterialIcons name="cancel" size={24} color="red" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Confirmation message */}
      {showConfirmation && (
        <View style={styles.confirmationBox}>
          <Text style={styles.confirmationText}>Your report has been submitted!</Text>
        </View>
      )}
    </View>
  );
};

// Styles for the components
const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  reasonItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderColor: '#ddd',
    width: '100%',
  },
  reasonText: {
    fontSize: 16,
  },
  confirmationBox: {
    position: 'absolute',
    bottom: 30,
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: '90%',
    alignSelf: 'center',
  },
  confirmationText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
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