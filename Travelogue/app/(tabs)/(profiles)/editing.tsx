import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
} from "react-native";
import React, { useCallback, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { updateUserData } from "@/services/userService";
import debounce from "lodash/debounce";
import { update } from "lodash";
import { auth } from "@/firebase/firebaseConfig";

export default function EditingProfileScreen() {
  const localUser = useLocalSearchParams();
  
  const [selectedImage, setSelectedImage] = React.useState<string | null>(
    Array.isArray(localUser.avatar) ? localUser.avatar[0] : localUser.avatar
  );
  const [localUserData, setLocalUserData] = React.useState(localUser);

  console.log("userData", localUser);
  console.log("selectedImage", selectedImage);
  

  const pickImageAsync = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      const newImage = result.assets[0].uri;
      setSelectedImage(newImage);
      console.log("selectedImage", selectedImage);
    } else {
      alert("Image picker was cancelled");
    }
  };

  const handleSaveChangesButton = () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      updateUserData(currentUser.uid, localUserData, selectedImage)
        .then(() => {
          alert("User data updated successfully!");
          router.back();
        })
        .catch((error) => {
          alert("Failed to update user data: " + error.message);
        });
    } else {
      alert("No user is currently logged in.");
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setLocalUserData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

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
  safeArea: {
    flex: 1,
    backgroundColor: "#f8f8f8",
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
    backgroundColor: "#4949D3",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginBottom: 20,
  },
  editText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
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
    backgroundColor: "#4949D3",
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 20,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
});
