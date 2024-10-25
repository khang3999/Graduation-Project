import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import React, { useCallback, useMemo, useState, useRef } from "react";
import Carousel from "react-native-reanimated-carousel";
import { Modalize } from "react-native-modalize";
import LikeButton from "@/components/buttons/HeartButton";
import CommentButton from "@/components/buttons/CommentButton";
import SaveButton from "@/components/buttons/SaveButton";
import { Divider } from "react-native-paper";
import MenuItem from "@/components/buttons/MenuPostButton";
import CheckedInChip from "@/components/chips/CheckedInChip";
import RenderHtml from "react-native-render-html";
import Icon from "react-native-vector-icons/FontAwesome";
import { Rating, AirbnbRating } from "react-native-ratings";
import { useLocalSearchParams } from "expo-router";
import { usePost } from "@/contexts/PostProvider";
import TabBar from "@/components/navigation/TabBar";
import { database } from "@/firebase/firebaseConfig";
import { ref, push, set } from "firebase/database";
import { useAccount } from "@/contexts/AccountProvider";
import HeartButton from "@/components/buttons/HeartButton";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

type Comment = {
  id: string;
  accountID: {
    avatar: any; // Change to ImageSourcePropType if needed
    username: string;
  };
  comment_status: string;
  content: string;
  reports: number;
  children?: Comment[];
  created_at: string;
};

type Post = {
  id: string;
  author: {
    avatar: any; // Change to ImageSourcePropType if needed
    username: string;
  };
  comments: Record<string, Comment>;
  content: string;
  created_at: string;
  hashtag: string;
  images: string[];
  likes: number;
  locations: Record<string, Record<string, string>>;
  post_status: string;
  price_id: number;
  reports: number;
  view_mode: boolean;
};

type PostItemProps = {
  item: Post;
  setIsScrollEnabled: (value: boolean) => void;
};

const flattenComments = (comments: Comment[], level = 0) => {  
  
  let flatComments: { comment: Comment; level: number }[] = [];
  
  comments.forEach((comment) => {
    flatComments.push({ comment, level });
    if (comment.children) {
      const childComments = convertFirebaseObjectToArray(comment.children);
      flatComments = flatComments.concat(flattenComments(childComments, level + 1));
    }
  });

  return flatComments;
};

// Helper function to convert Firebase objects to an array
const convertFirebaseObjectToArray = (obj: any) => {
  if (!obj) return [];
  return Object.keys(obj).map((key) => ({
    id: key,
    ...obj[key],
  }));
};

type RatingButtonProps = {
  ratingValue: number;
  onPress: () => void;
};

const RatingButton: React.FC<RatingButtonProps> = ({
  ratingValue,
  onPress,
}) => {
  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <Text style={styles.ratingLabel}>Rating: </Text>
      <TouchableOpacity style={styles.ratingButton} onPress={onPress}>
        <Icon name="smile-o" size={40} color="black" />
        <Text style={styles.ratingValue}>{ratingValue}/5</Text>
      </TouchableOpacity>
    </View>
  );
};

const PostItem: React.FC<PostItemProps> = ({
  item,
  setIsScrollEnabled,
}) => {
  

  
  const commentModalRef = useRef<Modalize>(null);
  const ratingModalRef = useRef<Modalize>(null);

  const [commentText, setCommentText] = useState("");
  const [replyingTo, setReplyingTo] = useState<{
    id: string;
    username: string;
  } | null>(null);
  const { accountData } = useAccount();
  
  const [comments, setComments] = useState(Object.values(item.comments));
  const MAX_LENGTH = 100;
  const flattenedComments = flattenComments(comments);
  const totalComments = flattenedComments.length;

  const addComment = async () => {
    if (commentText.trim().length > 0) {
      const newComment = {
        accountID: {
          avatar:
          accountData.avatar,
          username: accountData.fullname,
        },
        comment_status: "active",
        reports: 0,
        content: commentText,
        children: [],
        created_at: new Date().toLocaleString("en-US", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
      };
      try {
        if (replyingTo) {
          // Add as a reply to an existing comment
          const parentCommentRef = ref(
            database,
            `postsPhuc/${item.id}/comments/${replyingTo.id}/children`
          );
          const newReplyRef = push(parentCommentRef);
          
          // Check if a key is generated
          if (newReplyRef.key) {
            
            const newReply = { ...newComment, id: newReplyRef.key };
            await set(newReplyRef, newReply);

            setComments((prevComments) =>
              addReplyToComment(prevComments, replyingTo.id, newReply)
            );
            setReplyingTo(null); // Reset reply state
          } else {
            console.error(
              "Error: Unable to generate a unique key for the reply."
            );
            // You might want to show a user-friendly error message here
          }
        } else {
          // Add as a new top-level comment
          const CommentsRef = ref(database, `postsPhuc/${item.id}/comments`);

          const newCommentRef = push(CommentsRef);
          if (newCommentRef.key) {
            const newTopLevelComment = { ...newComment, id: newCommentRef.key };
            await set(newCommentRef, newTopLevelComment);

            setComments((prevComments) => [newTopLevelComment, ...prevComments]);
        }
      }
        setCommentText(""); // Clear the input field
      } catch (error) {
        console.error("Error adding comment:", error);
      }
    }
  };
  const addReplyToComment = (
    comments: Comment[],
    commentId: string,
    reply: Comment
  ): Comment[] => {
    return comments.map((comment) => {
      if (comment.id === commentId) {
        // If the comment is the one we're replying to
        return {
          // Return a new comment object with the reply added to its children
          ...comment,
          children: comment.children ? [...comment.children, reply] : [reply],
        };
      } else if (comment.children) {
        // If the comment has children, recursively add the reply to the children
        return {
          ...comment,
          children: addReplyToComment(comment.children, commentId, reply), // Recursively add the reply to the children
        };
      }
      return comment;
    });
  };

  const openCommentModal = () => {
    if (commentModalRef.current) {
      commentModalRef.current.open(); // Safely access the ref
      setIsScrollEnabled(false);
    } else {
      console.error("Modalize reference is null");
    }
  };
  const openRatingModal = () => {
    if (ratingModalRef.current) {
      ratingModalRef.current.open(); // Safely access the ref
    } else {
      console.error("Modalize reference is null");
    }
  };
  const closeRatingModal = () => {
    if (ratingModalRef.current) {      
      ratingModalRef.current.close();
    } else {
      console.error("Modalize reference is null");
    }
  };
  const [expandedPosts, setExpandedPosts] = useState<{ [key: string]: boolean }>({})

    const toggleDescription = (postId: string) => {
      setExpandedPosts((prev) => ({
        ...prev,
        [postId]: !prev[postId],
      }));
    };
  
  const isExpanded = expandedPosts[item.id] || false;

  const desc = {
    html: isExpanded
      ? item.content
      : `${item.content.slice(0, MAX_LENGTH)} ...`,
  };
  return (
    <View>
      {/* Post Header */}
      <View style={styles.row}>
        <View style={styles.row}>
          <Image
            source={{ uri: item.author.avatar }}
            style={styles.miniAvatar}
          />
          <View style={styles.column}>
            <Text style={styles.username}>{item.author.username}</Text>
            <Text style={styles.time}>{item.created_at}</Text>
          </View>
        </View>
        <View style={{ zIndex: 1000 }}>
          <MenuItem menuIcon="dots-horizontal" />
        </View>
      </View>

      {/* Post Images Carousel */}
      <Carousel
        pagingEnabled={true}
        loop={false}
        width={windowWidth}
        height={windowWidth}
        data={item.images}
        scrollAnimationDuration={300}
        renderItem={({ item: imageUri, index }) => (
          <View style={styles.carouselItem}>
            <Image style={styles.posts} source={{ uri: imageUri }} />
            <View style={styles.viewTextStyles}>
              <Text style={styles.carouselText}>
                {index + 1}/{item.images.length}
              </Text>
            </View>
          </View>
        )}
      />
      <View>
        {/* Post Interaction Buttons */}
        <View style={styles.buttonContainer}>
          <View style={styles.buttonRow}>
            <HeartButton style={styles.buttonItem} postID={item.id}/>
            <Text style={styles.totalLikes}>{item.likes}</Text>
            <CommentButton
              style={styles.buttonItem}
              onPress={openCommentModal}
            />
            <Text style={styles.totalComments}>{totalComments}</Text>
          </View>
          <SaveButton style={styles.buttonItem} postID={item.id}/>
        </View>
        {/* Rating Button */}
        <View style={styles.ratingButtonContainer}>
          <RatingButton ratingValue={4} onPress={openRatingModal} />
        </View>
      </View>
      <CheckedInChip items={Object.values(item.locations.vietnam)} />
      {/* Post Description */}
      <View style={{ paddingHorizontal: 15 }}>
        <RenderHtml contentWidth={windowWidth} source={desc} />
        <TouchableOpacity onPress={()=>toggleDescription(item.id)}>
          <Text>{isExpanded ? "Show less" : "Show more"}</Text>
        </TouchableOpacity>
      </View>
      <Divider style={styles.divider} />
      {/* Comment Bottom Sheet */}
      <Modalize
        ref={commentModalRef}
        // adjustToContentHeight={false}
        modalHeight={600}
        alwaysOpen={0}
        handlePosition="inside"
        avoidKeyboardLikeIOS={true}
        onClosed={() => setIsScrollEnabled(true)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalHeaderText}>
              Comments for {item.author.username}'s post
            </Text>
            {/* Sticky comment */}
            {replyingTo && (
              <View style={styles.replyingToContainer}>
                <Text>Replying to {replyingTo.username}</Text>
                <TouchableOpacity onPress={() => setReplyingTo(null)}>
                  <Text style={styles.cancelReplyButton}>Cancel</Text>
                </TouchableOpacity>
              </View>
            )}
            <View style={styles.commentInputContainer}>
              <TextInput
                style={styles.commentInput}
                placeholder="Write a comment..."
                value={commentText}
                onChangeText={setCommentText}
                multiline
              />
              <TouchableOpacity
                style={styles.commentButton}
                onPress={addComment}
              >
                <Text style={styles.commentButtonText}>Post</Text>
              </TouchableOpacity>
            </View>
            {flattenedComments.length > 0 ? (
              <FlatList
                data={flattenedComments}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                  <View
                    style={[
                      styles.commentContainer,
                      { marginLeft: item.level * 20 },
                    ]}
                  >
                    <View
                      style={{ flexDirection: "row", alignItems: "flex-start" }}
                    >
                      <Image
                        source={{ uri: item.comment.accountID.avatar }}
                        style={styles.miniAvatar}
                      />
                      <View style={{ flexDirection: "column", marginLeft: 10 }}>
                        <Text style={styles.commentUsername}>
                          {item.comment.accountID.username}
                        </Text>
                        <Text style={styles.commentText}>
                          {item.comment.content}
                        </Text>
                        <View style={{ flexDirection: "row" }}>
                          <TouchableOpacity
                            onPress={() =>
                              setReplyingTo({
                                id: item.comment.id,
                                username: item.comment.accountID.username,
                              })
                            }
                          >
                            <Text style={styles.replyButton}>Reply</Text>
                          </TouchableOpacity>
                          <TouchableOpacity>
                            <Text style={styles.replyButton}>Report</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                      <Text style={styles.commentTime}>
                        {item.comment.created_at}
                      </Text>
                    </View>
                  </View>
                )}
                contentContainerStyle={{ paddingBottom: 60 }}
              />
            ) : (
              <Text>No comments yet. Be the first to comment!</Text>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modalize>
      {/* Rating Bottom Sheet */}
      <Modalize
        ref={ratingModalRef}
        modalHeight={400}
        handlePosition="inside"
        avoidKeyboardLikeIOS={true}
      >
        <View style={styles.ratingContainer}>
          <Rating
            showRating
            onFinishRating={(rating: number) => console.log(rating)}
            startingValue={5}            
            imageSize={60}
            minValue={1}
            style={{ marginBottom: 10 }}
            
          />
          <View style={styles.ratingButtonWrapper}>
            <TouchableOpacity style={[styles.ratingButton, { padding: 10 }]} onPress={closeRatingModal}>
              <Icon name="check" size={30} color="white" />
              <Text style={styles.ratingTitle}>Đánh Giá</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modalize>
    
    </View>
  );
};

export default function PostsScreen() {
  // State to track whether full description is shown
  
  const { selectedPost, setSelectedPost } = usePost();
  const { initialIndex } = useLocalSearchParams();
  const initialPage = parseInt(initialIndex as string, 10);
  const [isScrollEnabled, setIsScrollEnabled] = useState(true);


  const memoriedPostItem = useMemo(() => selectedPost, [selectedPost]);

  return (
    <>
      <FlatList
        data={memoriedPostItem}
        renderItem={({ item }) => (
          <PostItem
            item={item}            
            setIsScrollEnabled={setIsScrollEnabled}
          />
        )}
        keyExtractor={(item, index) => index.toString()}
        style={styles.container}
        scrollEnabled={isScrollEnabled}
        initialScrollIndex={initialPage}
        getItemLayout={(data, index) => ({
          length: windowHeight,
          offset: index * windowHeight,
          index,
        })}
      ></FlatList>
    </>
  );
}
const styles = StyleSheet.create({
  ratingTitle: {
    marginLeft: 10,
    fontWeight: "bold",
    fontSize: 20,
    color: "white",
    marginTop: 3,
  },
  ratingContainer: {
    marginTop: 50,
    paddingVertical: 10,
    flexDirection: "column",
  },
  ratingLabel: { fontSize: 16, marginRight: 5, fontWeight: "bold" },
  ratingValue: { marginLeft: 10, fontWeight: "bold", marginTop: 10 },
  ratingButton: {
    flexDirection: "row",
  },
  ratingButtonWrapper: {
    marginHorizontal: 130,
    marginTop: 30,
    backgroundColor: "red",
    borderRadius: 10,
  },
  ratingButtonContainer: {
    marginLeft: 15,
    marginBottom: 10,
    width: 90,
  },
  totalLikes: {
    marginRight: 10,
    marginTop: 1,
    fontSize: 16,
    fontWeight: "bold",
  },
  totalComments:{
    marginRight: 10,
    marginTop: 1,
    fontSize: 16,
    fontWeight: "bold",
  },
  commentsContainer: {
    marginBottom: 100,
  },
  carouselText: {
    color: "#fff",
    fontSize: 14,
    textAlign: "center",
  },
  divider: {
    marginVertical: 35,
  },
  carouselItem: {
    flex: 1,
    justifyContent: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
  },
  buttonRow: {
    flexDirection: "row",
    width: 150,
    paddingVertical: 6,
  },
  buttonItem: {
    alignItems: "center",
    marginHorizontal: 10,
  },
  viewTextStyles: {
    position: "absolute",
    backgroundColor: "#392613",
    top: 10,
    left: windowWidth - 50,
    borderRadius: 20,
    paddingHorizontal: 7,
  },
  replyingToContainer: {
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
    marginBottom: 10,
  },
  cancelReplyButton: {
    color: "#FF0000",
    marginTop: 5,
  },
  container: {
    flex: 1,
    width: "100%",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
  },
  miniAvatar: {
    width: 40,
    height: 40,
    borderRadius: 25,
    borderColor: "#ccc",
    borderWidth: 1,
  },
  username: {
    fontSize: 16,
    marginLeft: 10,
    fontWeight: "bold",
  },
  time: {
    marginLeft: 10,
    color: "grey",
  },
  commentTime: {
    color: "grey",
  },
  column: {
    flexDirection: "column",
  },
  posts: {
    width: windowWidth,
    height: windowWidth,
  },
  modalContent: {
    padding: 20,
    marginBottom: 80,
  },
  modalHeaderText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  commentContainer: {
    padding: 10,
    backgroundColor: "#f9f9f9", // Light background for the comment
    borderRadius: 10,
    marginBottom: 10,
    borderColor: "#e0e0e0",
  },
  commentUsername: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#333",
    marginRight:10,
  },
  commentText: {
    fontSize: 14,
    color: "#555",
    marginTop: 5,
  },
  replyButton: {
    color: "#1E90FF", // Blue color for the reply button
    fontSize: 12,
    marginTop: 5,
    marginRight: 10,
  },
  commentInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fff",
    marginBottom: 20,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    padding: 10,
    marginRight: 10,
  },
  commentButton: {
    backgroundColor: "#007BFF",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
  },
  commentButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
