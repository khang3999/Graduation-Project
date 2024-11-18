import { auth, database, get, getDownloadURL, onValue, push, ref, storageRef, update, uploadBytes } from "@/firebase/firebaseConfig";
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
  Pressable,
  Image
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { router } from "expo-router";
import { signOut } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message-custom";
import { asyncStorageEmitter } from "@/utils/emitter";
import { MaterialIcons } from '@expo/vector-icons';
import { useAccount } from "@/contexts/AccountProvider";
import * as ImagePicker from 'expo-image-picker';
import IconMaterial from "react-native-vector-icons/MaterialCommunityIcons";
import { set } from "lodash";
import { getStorage } from "firebase/storage";
interface MenuPopupButtonProps {
  menuIcon: string;
  isDisplay: boolean;
  isSearched: boolean;
}

const MenuProfileButton: React.FC<MenuPopupButtonProps> = ({ menuIcon, isDisplay, isSearched }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  // Position of the menu
  const { searchedAccountData }: any = useAccount();
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<TouchableOpacity>(null);
  const [reportImages, setReportImages] = useState<string[]>([]);

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
    setModalVisible(false);
    setShowConfirmation(true);
    setTimeout(() => {
      setShowConfirmation(false);
    }, 3000);
    reportAccount(reason)
    setSelectedReason(null);
    setReportImages([]);
  };
  //Update report
  const reportAccount = async (reason: any) => {
    let item: any = {
      reason: {
      }
    }
    const uploadImages = async (images: string[]) => {
      const imageUrls = [];
      const storage = getStorage(); // Get the Firebase Storage instance
      for (const imageUri of images) {
        const filename = imageUri.substring(imageUri.lastIndexOf('/') + 1);
        const imageRef = storageRef(storage, `reports/${idAccount}/${filename}`);
        const response = await fetch(imageUri);
        const blob = await response.blob();
        await uploadBytes(imageRef, blob);
        const downloadUrl = await getDownloadURL(imageRef);
        imageUrls.push(downloadUrl);
      }
      return imageUrls;
    };

    let imageUrls: string[] = [];
    if (reportImages.length > 0) {
      imageUrls = await uploadImages(reportImages);
    }
    const reportRef = ref(database, `reports/account/${idAccount}`);
    // Tạo key tu dong cua firebase
    const newItemKey = push(ref(database, `reports/account/${idAccount}/reason/`));
    const newImageKey = push(ref(database, `reports/account/${idAccount}/images/`));
    const snapshot = await get(reportRef);
    if (snapshot.exists()) {
      item = snapshot.val();
    }
    const reasonKey = newItemKey.key as string;
    const imageKey = newImageKey.key as string;
    const itemNew = {
      account_id: idAccount,
      reason: {
        ...item.reason,
        [reasonKey]: reason
      },
      status_id: 1,
      images: {
        ...item.images,
        [imageKey]: imageUrls,
      }
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

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled) {
      const selectedImages = result.assets.map((image) => image.uri);
      setReportImages((prevImages) => [...prevImages, ...selectedImages]);
    }
  };

  const removeImage = (uri: string) => {
    setReportImages((prevImages) => prevImages.filter(imageUri => imageUri !== uri));
  };


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
            <Text style={styles.modalTitle}>Hãy chọn 1 lý do báo cáo</Text>
            <FlatList
              data={dataReason}
              keyExtractor={(_, index) => index.toString()}
              renderItem={(item: any) => (
                <TouchableOpacity
                  style={[styles.reasonItem, selectedReason === item.item.name && styles.selectedReasonItem,]}
                  onPress={() => {
                    setSelectedReason(item.item.name);
                  }}
                >
                  <Text style={styles.reasonText}>{item.item.name}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <MaterialIcons name="cancel" size={24} color="red" />
            </TouchableOpacity>
            <View style={styles.imagePickerContainer}>
              {reportImages.length == 0 && (
                <Pressable style={styles.imagePickerButton} onPress={pickImage}>
                  <IconMaterial name="image-plus" size={20} color="#2196F3" style={styles.imagePickerIconButton} />
                  <Text style={styles.imagePickerTextButton}>Thêm ảnh ( Nếu có )</Text>
                </Pressable>
              )}
              {reportImages.length > 0 && (
                <View style={styles.selectedImageContainer}>
                  {reportImages.map((uri, index) => (
                    <View key={index} style={styles.imageWrapper}>
                      <Image source={{ uri }} style={styles.selectedImage} />
                      <TouchableOpacity style={styles.removeButton} onPress={() => removeImage(uri)}>
                        <IconMaterial name="close-circle" size={20} color="grey" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>
            <TouchableOpacity
              onPress={() => handleReport(selectedReason)}
              style={styles.sendButton}
            >
              <Text style={styles.sendButtonText}>Gửi</Text>
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
  selectedReasonItem: {
    backgroundColor: '#d3d3d3',
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "grey",
  },
  sendButton: {
    backgroundColor: "#C1E1C1",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 20,
  },
  removeButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 10,
  },
  selectedImageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 10,
  },
  imageWrapper: {
    margin: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
  },
  selectedImage: {
    width: 100,
    height: 100,
  },
  imagePickerTextButton: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  imagePickerIconButton: {
    marginRight: 10,
  },
  imagePickerContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  imagePickerButton: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    borderColor: '#ccc',
    borderWidth: 1,
  },
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
    borderRadius: 10,
    marginBottom: 2,
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