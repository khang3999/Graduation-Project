// app/services/userService.ts
import { database, ref, get, storage, auth, update } from "@/firebase/firebaseConfig";
import { getDownloadURL, ref as storageRef, uploadBytes } from "firebase/storage";


const getCurrentUserData = async () => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("No user is currently logged in");
    }
    const userRef = ref(database, `accounts/${user.uid}`);
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      console.log("No data available");
      return null;
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
};

 const getImageUrl = async (imagePath: string) => {
  try {
    const imageRef = storageRef(storage, imagePath);
    const url = await getDownloadURL(imageRef);
    return url;
  } catch (error) {
    console.error("Error fetching image URL:", error);
    throw error;
  }
};

const updateUserData = async (userId:string | string[] | null, userData:any, selectedImage:string | null) => {
  if (!userId) {
    throw new Error("No user ID provided");
  }
  try {
    let avatarUrl = userData.avatar;
    const userRef = ref(database, `accounts/${userId}`);
    if (selectedImage && selectedImage !== userData.avatar) {
      const imageRef = storageRef(storage, `accounts/${userId}/papers`);
      const response = await fetch(selectedImage);
      const blob = await response.blob();
      await uploadBytes(imageRef, blob);
      avatarUrl = await getDownloadURL(imageRef);

    }
    const updatedUserData = {
      ...userData,
      avatar: avatarUrl,
    };
    
    await update(userRef, updatedUserData);
    console.log("User data updated successfully");
  } catch (error) {
    console.error("Error updating user data:", error);
    throw error;
  }
}


export { getCurrentUserData, getDownloadURL, updateUserData,getImageUrl };
