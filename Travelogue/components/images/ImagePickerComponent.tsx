import React from "react";
import { useState } from "react";
import { View, TouchableOpacity, Image, Modal, StyleSheet, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Camera, Gallery } from "iconsax-react-native";
import { TextComponent, ButtonComponent } from "@/components";
import { appColors } from "@/constants/appColors";

// Props
//HDSD
interface Props {
  // Ảnh đã chọn 
  image: string | null;
  // Ảnh mặc định
  placeholderImage: any;
   // Hàm xử lý khi chọn ảnh
  onImagePicked: (imageUri: string) => void;
}

const ImagePickerComponent = (props: Props) => {
  const { image, placeholderImage, onImagePicked } = props;

  const [isModalVisible, setIsModalVisible] = useState(false);

  const openModal = () => setIsModalVisible(true);
  const closeModal = () => setIsModalVisible(false);

  const openCamera = async () => {
    // const { status } = await ImagePicker.requestCameraPermissionsAsync();
    // if (status !== "granted") {
    //     Alert.alert(
    //       "Quyền truy cập bị từ chối",
    //       "Bạn cần cấp quyền truy cập vào camera để sử dụng tính năng này.",
    //       [{ text: "OK" }]
    //     );
    //     return;
    //   }
    const pickerResult = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!pickerResult.canceled) {
      onImagePicked(pickerResult.assets[0].uri);
      closeModal();
    }
  };

  const openGallery = async () => {
    // const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    // if (status !== "granted") {
    //   Alert.alert(
    //     "Quyền truy cập bị từ chối",
    //     "Bạn cần cấp quyền truy cập vào thư viện ảnh để sử dụng tính năng này.",
    //     [{ text: "OK" }]
    //   );
    //   return;
    // }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!pickerResult.canceled) {
      onImagePicked(pickerResult.assets[0].uri);
      closeModal();
    }
  };

  return (
    <View>
      <TouchableOpacity onPress={openModal}>
        {image ? (
          <Image style={styles.image} source={{ uri: image }} />
        ) : (
          <Image style={styles.image} source={placeholderImage} />
        )}
      </TouchableOpacity>

      <Modal transparent={true} visible={isModalVisible} onRequestClose={closeModal} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TextComponent
              text="Chọn file ảnh"
              size={25}
              styles={{ fontWeight: "bold", marginBottom: 20 }}
            />
            <ButtonComponent
              text="Chụp ảnh"
              icon={<Camera size={25} color={appColors.primary} />}
              styles={styles.modalButtonPrimary}
              color="#fff"
              textColor={appColors.primary}
              onPress={openCamera}
              textStyles={{ paddingRight: 45 }}
            />
            <ButtonComponent
              text="Chọn từ thư viện"
              icon={<Gallery size={25} color={appColors.primary} />}
              color="#fff"
              styles={styles.modalButtonPrimary}
              textColor={appColors.primary}
              onPress={openGallery}
            />
            <ButtonComponent
              text="Đóng"
              type="primary"
              styles={[styles.modalButtonPrimary, { width: "60%", height: 0, marginBottom: 20 }]}
              onPress={closeModal}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Style
const styles = StyleSheet.create({
  image: {
    width: "100%",
    height: 250,
    resizeMode: "contain",
    marginTop: 10,
    marginBottom: 20,
    borderColor: appColors.gray2,
    borderWidth: 1,
    borderRadius: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalButtonPrimary: {
    borderRadius: 5,
    marginVertical: 10,
    width: "100%",
  },
});

export default ImagePickerComponent;  