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
  Image,
} from "react-native";
import IconMaterial from "react-native-vector-icons/MaterialCommunityIcons";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { router } from "expo-router";
import { signOut } from "firebase/auth";
import { appColors } from "@/constants/appColors";
import { Button, Divider } from "react-native-paper";
import { database, ref, get, storage, update } from "@/firebase/firebaseConfig";
import { getDownloadURL, getStorage, ref as storageRef, uploadBytes } from "firebase/storage";
import { child, onValue, push, remove, runTransaction } from "@firebase/database";
import LottieView from "lottie-react-native";
import { MaterialIcons } from '@expo/vector-icons';
import { set } from "lodash";
import * as ImagePicker from 'expo-image-picker';
import { deleteFolder } from "@/services/storageService";
interface MenuPopupButtonProps {
  isAuthor: boolean;
  tourId: string;
  userId: string;
  locations: any;
}

const MenuPopupButton: React.FC<MenuPopupButtonProps> = ({ isAuthor, tourId, userId, locations }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 }); // Position of the menu
  const [isLoading, setIsLoading] = useState(false);
  const buttonRef = useRef<TouchableOpacity>(null); // To measure the button's position
  // Function to toggle modal visibility
  const [reportImages, setReportImages] = useState<string[]>([]);

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

  const formatLocations = Object.keys(locations).flatMap((countryKey) => {
    return Object.keys(locations[countryKey]).flatMap((cityKey) => {
      return {
        id: cityKey,
        name: locations[countryKey][cityKey],
        country: countryKey,
      };
    }
    );
  });
  const toggleModal = () => {
    if (!isModalVisible) {
      // Measure the position of the button before showing the menu
      buttonRef.current?.measure((fx: number, fy: number, width: number, height: number, px: number, py: number) => {
        setMenuPosition({
          top: py + height - 20, // Place the menu right below the button
          right: px - 140, // Align it with the left side of the button
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
                // Decrease the totalPosts count
                const totalPostsRef = ref(database, `accounts/${userId}/totalPosts`);
                await runTransaction(totalPostsRef, (currentValue: any) => {
                  return (currentValue || 0) - 1;
                });
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
                //loop through all locations and remove the post from the location
                formatLocations.forEach((location) => {
                  const countryRef = ref(database, `cities/${location.country}`);
                  //loop through all areas in the country
                  get(countryRef).then((countrySnapshot) => {
                    if (countrySnapshot.exists()) {
                      //loop through all cities in the area          
                      countrySnapshot.forEach((area) => {
                        area.forEach((city) => {
                          if (location.id === city.key) {
                            const areaKey = area.key;
                            //remove the post from the city
                            const tourRef = ref(database, `cities/${location.country}/${areaKey}/${location.id}/postImages/tours/${tourId}`);

                            remove(tourRef);

                          }
                        });

                      });
                    }
                  });
                });

                //delete all post images from storage
                deleteFolder(`tours/${tourId}/images`);

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
    if (!selectedReason) {
      Alert.alert('Lỗi', 'Vui lòng chọn lý do báo cáo');
      return;
    }
    setModalVisible(false);
    setShowConfirmation(true);
    setTimeout(() => {
      setShowConfirmation(false);
    }, 3000);
    if (typeReport === "post") {
      reportPost(reason)
      setSelectedReason(null);
      setReportImages([]);
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
      type: "tour",
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
  //Update report
  const reportPost = async (reason: any) => {
    let item: any = {
      reason: {

      }
    }
    const uploadImages = async (images: string[]) => {
      const imageUrls = [];
      const storage = getStorage(); // Get the Firebase Storage instance
      for (const imageUri of images) {
        const filename = imageUri.substring(imageUri.lastIndexOf('/') + 1);
        const imageRef = storageRef(storage, `reports/${idPost}/${filename}`);
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
    const reportRef = ref(database, `reports/post/${idPost}`);
    // Tạo key tu dong cua firebase
    const newItemKey = push(ref(database, `reports/post/${idPost}/reason/`));
    const newImageKey = push(ref(database, `reports/post/${idPost}/images/`));
    const snapshot = await get(reportRef);
    if (snapshot.exists()) {
      item = snapshot.val();

    }
    const reasonKey = newItemKey.key as string;
    const imageKey = newImageKey.key as string;
    const itemNew = {
      post_id: idPost,
      reason: {
        ...item.reason,
        [reasonKey]: reason
      },
      images: {
        ...item.images,
        [imageKey]: imageUrls,
      },
      type: "tour",
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
  const handleEditTour = () => {
    router.push({
      pathname: "/(article)/editPostTour",
      params: { tourId }
    });
    setIsModalVisible(false);
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
        <Icon size={24} name="dots-horizontal" color='white' />
      </TouchableOpacity>

      {/* Menu Modal */}
      {isAuthor && isModalVisible ? (
        <Modal
          style={{ position: 'absolute', right: 0, backgroundColor: 'red', zIndex: 100 }}

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
                  { top: 80, right: 10 },
                ]}
              >
                <TouchableOpacity style={styles.menuItem}
                  onPress={handleEditTour}>
                  <Icon name="application-edit" size={20} style={styles.menuIcon} />
                  <Text style={styles.menuText}>Sửa</Text>
                </TouchableOpacity>
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
          style={{ position: 'absolute', right: 0, backgroundColor: 'red', zIndex: 100 }}
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
                  { top: 80, right: 10 },
                ]}
              >
                <TouchableOpacity style={styles.menuItem} onPress={() => handlePressReport('post')}>
                  <Icon name="send" size={20} style={styles.menuIcon} />
                  <Text style={styles.menuText}>Báo cáooo</Text>
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
            <Text style={styles.modalTitle}>Chọn lý do báo cáo</Text>
            <FlatList
              data={dataReason}
              keyExtractor={(_, index) => index.toString()}
              renderItem={(item: any) => (
                <TouchableOpacity
                  style={[styles.reasonItem, selectedReason === item.item.name ? styles.selectedReasonItem : null,]}
                  onPress={() =>
                    setSelectedReason(item.item.name)
                  }
                >
                  <Text style={styles.reasonText}>{item.item.name}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={styles.closeButton} onPress={() => {
              setModalVisible(false)
            }}>
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
          <Text style={styles.confirmationText}>Đơn báo cáo của bạn đã được gởi!</Text>
        </View>
      )}
    </View>
  );
};
const styles = StyleSheet.create({
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
  selectedReasonItem: {
    backgroundColor: '#d3d3d3',
  },
  removeButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 10,
  },
  imageWrapper: {
    margin: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
  },
  selectedImageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 10,
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
    padding: 15,
    backgroundColor: 'rgba(100,100,100,0.5)',
    borderRadius: 40, 
    elevation:4,
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
