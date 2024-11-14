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

const updateUserData = async (userId:string , userData:any, selectedImage:string | null) => {
  if (!userId) {
    throw new Error("No user ID provided");
  }
  try {
    let avatarUrl = userData.avatar;
    const userRef = ref(database, `accounts/${userId}`);
    if (selectedImage && selectedImage !== userData.avatar) {
      const imageRef = storageRef(storage, `accounts/${userId}/papers/avatar.png`);
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

const updateUserPosts = async (userId: string, localUserData: any) => {
  try {
    const userPostsSnapshot = await get(ref(database, 'posts'));

    if (userPostsSnapshot.exists()) {
      const updates: Record<string, any> = {};

      // Find posts authored by the user and prepare updates
      userPostsSnapshot.forEach((postSnapshot) => {
        const post = postSnapshot.val();
        if (post.author.id === userId) {
          const postKey = postSnapshot.key;

          updates[`posts/${postKey}/author`] = {
            avatar: localUserData.avatar || post.author.avatar,
            fullname: localUserData.fullname || post.author.fullname,
            id: userId,
          };
        }
      });

      // Apply the batch update in the background
      await update(ref(database), updates);
      console.log("All related posts updated successfully in the background.");
    }
  } catch (error) {
    console.error("Failed to update posts:", error);
  }
};

const updateUserTours = async (userId: string, localUserData: any) => {
  try {
    const userToursSnapshot = await get(ref(database, 'tours'));

    if (userToursSnapshot.exists()) {
      const updates: Record<string, any> = {};

      // Find tours authored by the user and prepare updates
      userToursSnapshot.forEach((tourSnapshot) => {
        const tour = tourSnapshot.val();
        if (tour.author.id === userId) {
          const tourKey = tourSnapshot.key;

          updates[`tours/${tourKey}/author`] = {
            avatar: localUserData.avatar || tour.author.avatar,
            fullname: localUserData.fullname || tour.author.fullname,
            id: userId,
          };
        }
      });

      // Apply the batch update in the background
      await update(ref(database), updates);
      console.log("All related tours updated successfully in the background.");
    }
  } catch (error) {
    console.error("Failed to update tours:", error);
  }
}

export { getCurrentUserData, getDownloadURL, updateUserData,getImageUrl, updateUserPosts };
