import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
} from "react-native";
import React, { useCallback, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { getImageUrl, updateUserData, updateUserPosts } from "@/services/userService";
import debounce from "lodash/debounce";
import { set, update } from "lodash";
import { auth } from "@/firebase/firebaseConfig";
import { useAccount } from "@/contexts/AccountProvider";
import LottieView from "lottie-react-native";
import { useHomeProvider } from "@/contexts/HomeProvider";

export default function EditingProfileScreen() {  
  const { dataAccount }: any = useHomeProvider();
  
  const initialAvatarUrl =  dataAccount.avatar;
  const [selectedImage, setSelectedImage] = React.useState<string | null>(
    initialAvatarUrl || null
  );
  const [localUserData, setLocalUserData] =  React.useState(dataAccount);
  const [isLoading, setIsLoading] = React.useState(false);

  const pickImageAsync = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      const newImage = result.assets[0].uri;
      setSelectedImage(newImage);
    } else {
      alert("Image picker was cancelled");
    }
  };

  const validateInputs = () => {
    let valid = true;
    let errors = { fullname: "", phone: "" };

    if (
      !localUserData.fullname ||
      (typeof localUserData.fullname === "string" &&
        localUserData.fullname.trim().length === 0)
    ) {
      Alert.alert("Thông báo", "Full name is required.");
      valid = false;
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (
      !localUserData.phone ||
      !phoneRegex.test(localUserData.phone as string)
    ) {
      errors.phone = "Phone number must be 10 digits.";
      Alert.alert(
        "Thông báo",
        "Vui lòng nhập số điện thoại hợp lệ (10-12 số)."
      );
      valid = false;
    }
    return valid;
  };

  const handleSaveChangesButton = async () => {
    if(!validateInputs()) {
      return;
    }
    
    if (dataAccount) {
      
    try {
      setIsLoading(true);
      // Step 1: Update user data
      await updateUserData(dataAccount.id, localUserData, selectedImage);

      // Immediately set loading to false and notify the user
      setIsLoading(false);
      alert("User data updated successfully!");
      router.back();

      // Step 2: Asynchronously start updating posts in the background
      await updateUserPosts(dataAccount.id, localUserData);
      
      // Step 3: Asynchronously start updating tours in the background
      
    } catch (error) {
      alert("Failed to update user data: " + error);
      setIsLoading(false);
    }
    } else {
      alert("No user is currently logged in.");
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setLocalUserData((prev: typeof localUserData) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (isLoading) {
    return (
      <Modal transparent={true} animationType="none" visible={isLoading}>
      <View style={styles.loadingOverlay}>
        <LottieView
          source={require("@/assets/images/editing.json")}
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
    <SafeAreaView style={styles.safeArea}>
      <ScrollView>
        <View style={styles.container}>
          <Image style={styles.avatar} source={{ uri: selectedImage || "a" }} />
          <Pressable style={styles.editButton} onPress={pickImageAsync}>
            <Text style={styles.editText}>Edit picture or avatar</Text>
          </Pressable>

          <View style={styles.infoContainer}>
            <View style={styles.row}>
              <Text style={styles.infoText}>Fullname:</Text>
              <TextInput
                style={styles.username}
                placeholder="fullname"
                value={localUserData.fullname as string}
                onChangeText={(text) => handleInputChange("fullname", text)}
              ></TextInput>
            </View>
            <View style={styles.row}>
              <Text style={styles.infoText}>Phone:</Text>
              <TextInput
                style={styles.username}
                placeholder="0123-455-667"
                value={localUserData.phone as string}
                onChangeText={(text) => handleInputChange("phone", text)}
                keyboardType="numeric"
              ></TextInput>
            </View>
            <Pressable
              style={styles.saveButton}
              onPress={handleSaveChangesButton}
            >
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  safeArea: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    alignItems: "center",
    padding: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    resizeMode: "cover",
    borderColor: "#ccc",
    borderWidth: 2,
    borderRadius: 60,
    marginBottom: 20,
  },
  editButton: {
    backgroundColor: "#C1E1C1",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginBottom: 20,
  },
  editText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "grey",
  },
  infoContainer: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingBottom: 10,
    marginBottom: 15,
  },
  infoText: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#333",
  },
  username: {
    fontSize: 16,
    color: "#666",
  },
  saveButton: {
    backgroundColor: "#C1E1C1",
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 20,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "grey",
  },
});
