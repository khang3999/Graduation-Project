import {
  View,
  Text,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  TouchableHighlight,
  TouchableHighlightComponent,
} from "react-native";
import React, { useEffect, useState } from "react";
import { AntDesign } from "@expo/vector-icons";
import Icon from "react-native-vector-icons/FontAwesome";
import { auth, database, ref } from "@/firebase/firebaseConfig";
import { get, remove, update } from "@firebase/database";

const HeartButton = (props: any) => {
  const userID = auth.currentUser?.uid;

  const [liked, setLiked] = useState(false);
  // Render 1 lần từ db để load các bài đã like
  useEffect(() => {
    const checkIfSaved = async () => {
      const refPosts = ref(
        database,
        `accounts/${userID}/likedPosts/${props.postID}`
      );

      const snapshot = await get(refPosts);

      // Cập nhật trạng thái saved dựa trên dữ liệu từ Firebase
      if (snapshot.exists()) {
        setLiked(true); // Nếu postID đã tồn tại, đánh dấu là saved
      } else {
        setLiked(false); // Nếu không tồn tại, đánh dấu là unsaved
      }
    };

    if (userID) {
      checkIfSaved(); // Gọi hàm kiểm tra nếu có userID
    }
  }, []);

  // Hàm set like
  const handleLike = async (postID: any, userID: any) => {
    const refLikePosts = ref(database, `accounts/${userID}/likedPosts/`);
    const refPost = ref(database, `accounts/${userID}/likedPosts/${postID}`);

    const snapshot = await get(refPost); // Check if postID already exists

    try {
      if (snapshot.exists()) {
        // If it exists, remove postID from likedPosts
        await remove(refPost);

        console.log("Unliked " + postID);
      } else {
        // If it does not exist, add to likedPosts
        await update(refLikePosts, {
          [postID]: true, // Add postID to likedPosts
        });

        console.log(`Liked ${postID}`);
      }
    } catch (error) {
      console.error("Error updating likedPosts:", error);
    } finally {
      // Change state
      setLiked(!liked);
    }
  };
  return (
    <TouchableOpacity
      delayPressOut={50}
      onPress={() => handleLike(props.postID, userID)}
      {...props}
    >
      <AntDesign
        name={liked ? "heart" : "hearto"}
        size={24}
        color={liked ? likedColor : unlikedColor}
      />
    </TouchableOpacity>
  );
};

// Style
const likedColor = "red";
const unlikedColor = "black";
export default HeartButton;
