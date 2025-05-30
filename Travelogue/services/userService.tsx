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

const updateUserData = async (userId:string , userData:any,setUserData:any, selectedImage:string | null) => {
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
    setUserData(updatedUserData);
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
    const avatar = await getImageUrl(`accounts/${userId}/papers/avatar.png`);
    if (userPostsSnapshot.exists()) {
      const updates: Record<string, any> = {};

      // Find posts authored by the user and prepare updates
      userPostsSnapshot.forEach((postSnapshot) => {
        const post = postSnapshot.val();
        const postKey = postSnapshot.key;

        // Update the post's main author information if it matches the userId
        if (post.author.id === userId) {
          updates[`posts/${postKey}/author`] = {
            avatar: avatar || post.author.avatar,
            fullname: localUserData.fullname || post.author.fullname,
            id: userId,
          };
        }

        // Iterate through each comment in the post to update comment author information
        if (post.comments) {
          Object.keys(post.comments).forEach((commentKey) => {
            const comment = post.comments[commentKey];

            // Update the author information in the comment if it matches the userId
            if (comment.author.id === userId) {
              updates[`posts/${postKey}/comments/${commentKey}/author`] = {
                avatar: avatar || comment.author.avatar,
                fullname: localUserData.fullname || comment.author.fullname,
                id: userId,
              };
            }
          });
        }
      });

      // Apply the batch update in the background
      await update(ref(database), updates);
      console.log("All related posts and comments updated successfully in the background.");
    }
  } catch (error) {
    console.error("Failed to update posts and comments:", error);
  }
};


const updateUserTours = async (userId: string, localUserData: any) => {
  try {
    const userToursSnapshot = await get(ref(database, 'tours'));
    const avatar = await getImageUrl(`accounts/${userId}/papers/avatar.png`);
    if (userToursSnapshot.exists()) {
      const updates: Record<string, any> = {};

      // Find tours authored by the user and prepare updates
      userToursSnapshot.forEach((tourSnapshot) => {
        const tour = tourSnapshot.val();
        const tourKey = tourSnapshot.key;
        if (tour.author.id === userId) {
          updates[`tours/${tourKey}/author`] = {
            avatar: avatar || tour.author.avatar,
            fullname: localUserData.fullname || tour.author.fullname,
            id: userId,
          };
        }
        if (tour.comments) {
          Object.keys(tour.comments).forEach((commentKey) => {
            const comment = tour.comments[commentKey];

            // Update the author information in the comment if it matches the userId
            if (comment.author.id === userId) {
              updates[`tours/${tourKey}/comments/${commentKey}/author`] = {
                avatar: avatar || comment.author.avatar,
                fullname: localUserData.fullname || comment.author.fullname,
                id: userId,
              };
            }
          });
        }
        
        if(tour.ratings){
          Object.keys(tour.ratings).forEach((ratingKey) => {
            const rating = tour.ratings[ratingKey];
            if (rating.author.id === userId) {
              updates[`tours/${tourKey}/ratings/${ratingKey}/author`] = {
                avatar: avatar || rating.author.avatar,
                fullname: localUserData.fullname || rating.author.fullname,
                id: userId,
              };
            }
          });
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

export { getCurrentUserData, getDownloadURL, updateUserData,getImageUrl, updateUserPosts , updateUserTours};
