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
import { appColors } from "@/constants/appColors";
import { Button, Divider } from "react-native-paper";
import { database, ref, get, storage, update } from "@/firebase/firebaseConfig";
import { getDownloadURL, ref as storageRef, uploadBytes } from "firebase/storage";
import { child, onValue, push, remove } from "@firebase/database";
import LottieView from "lottie-react-native";
import { MaterialIcons } from '@expo/vector-icons';
import { set } from "lodash";
interface MenuPopupButtonProps {
  isAuthor: boolean;
  tourId: string;
  userId: string;
}

const MenuPopupButton: React.FC<MenuPopupButtonProps> = ({ isAuthor, tourId, userId }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 }); // Position of the menu
  const [isLoading, setIsLoading] = useState(false);
  const buttonRef = useRef<TouchableOpacity>(null); // To measure the button's position
  // Function to toggle modal visibility


  //Report
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedReason, setSelectedReason] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [reasonsPost, setReasonsPost] = useState([])
  const [dataReason, setDataReason] = useState([])
  const [typeReport, setTypeReport] = useState('')
  const [idPost, setIdPost] = useState('')
  const [idComment, setIdComment] = useState('')
  const [reasonsComment, setReasonsComment] = useState([])

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
    setIsModalVisible(!isModalVisible);
  };

  const handleDeleteTour = async () => {

    if (isAuthor) {
      Alert.alert(
        "Xác nhận",
        "Bạn có chắc chắn muốn xóa bài này?",
        [
          {
            text: "Hủy",
            onPress: () => {
              setIsModalVisible(false);
            },
            style: "cancel",
          },
          {
            text: "Xác nhận",
            onPress: async () => {
              try {
                setIsLoading(true);

                // Delete the tour\
                const tourRef = ref(database, `tours/${tourId}`);
                await remove(tourRef);
                console.log('tour deleted successfully');

                // Delete from author's created tours
                const userTourRef = ref(database, `accounts/${userId}/createdTours/${tourId}`);
                await remove(userTourRef);

                // Retrieve all users to check their likedtoursList and savedToursList
                const accountsRef = ref(database, 'accounts');
                const snapshot = await get(accountsRef);

                if (snapshot.exists()) {
                  snapshot.forEach((userSnapshot) => {
                    const userKey = userSnapshot.key;

                    // Check if the tourId exists in likedtoursList and remove it if found
                    const likedTours = userSnapshot.child(`likedToursList/${tourId}`);
                    if (likedTours.exists()) {
                      const likedTourRef = child(accountsRef, `${userKey}/likedToursList/${tourId}`);
                      remove(likedTourRef);
                    }

                    // Check if the tourId exists in savedToursList and remove it if found
                    const savedTours = userSnapshot.child(`savedToursList/${tourId}`);
                    if (savedTours.exists()) {
                      const savedTourRef = child(accountsRef, `${userKey}/savedToursList/${tourId}`);
                      remove(savedTourRef);
                    }
                  });
                }

                // Optionally, update the UI or state here if necessary
              } catch (error) {
                console.error('An error occurred while deleting the tour:', error);
              } finally {
                setIsLoading(false);
                setIsModalVisible(false);
                router.back();
              }
            },
          },
        ]
      );
    }
  }

  //Report 
  // Reason post
  useEffect(() => {
    // Lắng nghe dữ liệu từ Firebase Realtime Database theo thời gian thực
    const onValueChange = ref(database, 'reasons/post/');
    // Lắng nghe thay đổi trong dữ liệu
    const reason = onValue(onValueChange, (snapshot) => {
      if (snapshot.exists()) {
        const jsonData = snapshot.val();
        // Chuyển đổi object thành array
        const dataArray: any = Object.entries(jsonData).map(([key, value]) => ({
          id: key,
          name: value,
        }));
        setReasonsPost(dataArray);
      } else {
        console.log("No data available");
      }
    }, (error) => {
      console.error("Error fetching data:", error);
    });

    // Cleanup function để hủy listener khi component unmount
    return () => reason();
  }, []);
  // Reason comment
  useEffect(() => {
    // Lắng nghe dữ liệu từ Firebase Realtime Database theo thời gian thực
    const onValueChange = ref(database, 'reasons/comment/');
    // Lắng nghe thay đổi trong dữ liệu
    const reason = onValue(onValueChange, (snapshot) => {
      if (snapshot.exists()) {
        const jsonData = snapshot.val();
        // Chuyển đổi object thành array
        const dataArray: any = Object.entries(jsonData).map(([key, value]) => ({
          id: key,
          name: value,
        }));
        setReasonsComment(dataArray);
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
    if (typeReport === "post") {
      reportPost(reason)
    }
    else {
      reportComment(reason)
    }
  };

  //Update report
  const reportComment = async (reason: any) => {
    let item: any = {
      reason: {

      }
    }
    const reportRef = ref(database, `reports/comment/${idComment}`);
    // Tạo key tu dong cua firebase
    const newItemKey = push(ref(database, `reports/comment/${idComment}/reason/`));
    const snapshot = await get(reportRef);
    if (snapshot.exists()) {
      item = snapshot.val();

    }
    const reasonKey = newItemKey.key as string;
    const itemNew = {
      id: idComment,
      post_id: idPost,
      reason: {
        ...item.reason,
        [reasonKey]: reason
      },
      status: 1
    }
    await update(reportRef, itemNew)
      .then(() => {
        console.log('Data added successfully');
      })
      .catch((error) => {
        console.error('Error adding data: ', error);
      });

  };
  //Update report
  const reportPost = async (reason: any) => {
    let item: any = {
      reason: {

      }
    }
    const reportRef = ref(database, `reports/post/${idPost}`);
    // Tạo key tu dong cua firebase
    const newItemKey = push(ref(database, `reports/post/${idPost}/reason/`));
    const snapshot = await get(reportRef);
    if (snapshot.exists()) {
      item = snapshot.val();

    }
    const reasonKey = newItemKey.key as string;
    const itemNew = {
      post_id: idPost,
      reason: {
        ...item.reason,
        [reasonKey]: reason
      },
      status: 1
    }
    await update(reportRef, itemNew)
      .then(() => {
        console.log('Data added successfully');
      })
      .catch((error) => {
        console.error('Error adding data: ', error);
      });

  };


  const handlePressReport = (type: any) => {
    setModalVisible(true)
    setIsModalVisible(false)
    if (type === "post") {
      setDataReason(reasonsPost)
      setIdPost(tourId)           
      setTypeReport("post")
    }
    else if (type === "comment") {
      setDataReason(reasonsComment)
      setIdComment('') 
      setTypeReport("comment")
    }
  }

  if (isLoading) {
    return (
      <Modal transparent={true} animationType="none" visible={isLoading}>
        <View style={styles.loadingOverlay}>
          <LottieView
            source={require("@/assets/images/loading.json")}
            autoPlay
            loop
            style={{
              position: "absolute",
              top: 190,
              // top: -190,
              // left: -120,
              // zIndex: -10,
              width: 650,
              height: 320,
            }}
          />
        </View>
      </Modal>
    );
  }

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
      {isAuthor && isModalVisible ? (
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
                <TouchableOpacity style={styles.menuItem}
                  onPress={handleDeleteTour}>

                  <Icon name="trash-can-outline" size={20} style={styles.menuIcon} />
                  <Text style={styles.menuText}>Xóa</Text>
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
                <TouchableOpacity style={styles.menuItem} onPress={() => handlePressReport('post')}>
                  <Icon name="send" size={20} style={styles.menuIcon} />
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
              keyExtractor={(_, index) => index.toString()}
              renderItem={(item: any) => (
                <TouchableOpacity
                  style={styles.reasonItem}
                  onPress={() =>
                    handleReport(item.item.name)
                  }
                >
                  <Text style={styles.reasonText}>{item.item.name}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={styles.closeButton} onPress={() => {              
              setModalVisible(false)}}>
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
  loadingOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
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
