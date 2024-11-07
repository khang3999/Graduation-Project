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
  Modal,
  Pressable,
  Alert,
} from "react-native";
import React, { useCallback, useMemo, useState, useRef, useEffect } from "react";
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
import IconMaterial from "react-native-vector-icons/MaterialCommunityIcons";
import { Rating } from "react-native-ratings";
import { useLocalSearchParams } from "expo-router";
import { usePost } from "@/contexts/PostProvider";
import TabBar from "@/components/navigation/TabBar";
import { auth, database, getDownloadURL, storage, storageRef, uploadBytes } from "@/firebase/firebaseConfig";
import { ref, push, set, get, refFromURL, update, increment } from "firebase/database";
import { useAccount } from "@/contexts/AccountProvider";
import HeartButton from "@/components/buttons/HeartButton";
import ActionSheet, { ActionSheetRef } from 'react-native-actions-sheet';
import * as ImagePicker from 'expo-image-picker';
import CommentsActionSheet from "@/components/comments/CommentsActionSheet";
import { CommentType, RatingComment } from '@/types/CommentTypes';
const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;


type RatingSummary = {
  totalRatingCounter: any;
  totalRatingValue: any;
};

type Comment = {
  id: string;
  author: {
    id: string
    avatar: any;
    username: string;
  };
  status_id: number;
  content: string;
  reports: number;
  parentId: string | null;
  created_at: string;
};

type Post = {
  id: string;
  author: {
    id: string;
    avatar: any;
    username: string;
  };
  comments: Record<string, Comment>;
  content: string;
  created_at: string;
  hashtag: string;
  images: string[];
  likes: number;
  locations: Record<string, Record<string, string>>;
  ratings: Record<string, RatingComment>;
  ratingSummary: RatingSummary;
  post_status: string;
  price_id: number;
  reports: number;
  view_mode: boolean;
};

type PostItemProps = {
  item: Post;
  setIsScrollEnabled: (value: boolean) => void;
};

type RatingButtonProps = {
  averageRating: number;
  onPress: () => void;
};

const RatingButton: React.FC<RatingButtonProps> = ({
  averageRating,
  onPress,
}) => {

  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <Text style={styles.ratingLabel}>Rating: </Text>
      <TouchableOpacity style={styles.ratingButton} onPress={onPress}>
        <Icon name="smile-o" size={40} color="black" />
        <Text style={styles.ratingValue}>{averageRating.toFixed(1)}/5.0</Text>
      </TouchableOpacity>
    </View>
  );
};

const PostItem: React.FC<PostItemProps> = ({
  item,
  setIsScrollEnabled,
}) => {


  const MAX_LENGTH = 100;
  const commentModalRef = useRef<Modalize>(null);
  const authorizedCommentAS = useRef<ActionSheetRef>(null);
  const unauthorizedCommentAS = useRef<ActionSheetRef>(null);
  const ratingCommentAS = useRef<ActionSheetRef>(null);
  const [ratingComments, setRatingComments] = useState(Object.values(item.ratings || {}));

  const [commentText, setCommentText] = useState("");
  const [replyingTo, setReplyingTo] = useState<{
    id: string;
    username: string;
  } | null>(null);

  const { accountData } = useAccount();
  const [comments, setComments] = useState(Object.values(item.comments || {}));
  const [longPressedComment, setLongPressedComment] = useState<Comment | null>(null);
  const [ratingImage, setRatingImage] = useState<string | null>(null);
  const [ratingCommentText, setRatingCommentText] = useState("");
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [ratingValue, setRatingValue] = useState(5);
  const totalComments = comments.length;
  const isPostAuthor = accountData.id === item.author.id;
  const [isLoading, setIsLoading] = useState(false);

  
  
  const addComment = async () => {
    if (commentText.trim().length > 0) {
      const newComment = {
        author: {
          id: accountData.id,
          avatar:
            accountData.avatar,
          username: accountData.fullname,
        },
        status_id: 1,
        reports: 0,
        content: commentText,
        parentId: replyingTo ? replyingTo.id : null,
        created_at: new Date().toLocaleString("en-US", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
      };
      try {
        const CommentsRef = ref(database, `postsPhuc/${item.id}/comments`);
        const newCommentRef = push(CommentsRef);

        if (newCommentRef.key) {
          const newCommentWithId = { ...newComment, id: newCommentRef.key };
          await set(newCommentRef, newCommentWithId);

          setComments((prevComments) => {
            if (replyingTo) {
              // Add as a reply with the correct `parentId`
              return addReplyToComment(prevComments, replyingTo.id, newCommentWithId);
            } else {
              // Add as a top-level comment
              return [newCommentWithId, ...prevComments];
            }
          });

          setReplyingTo(null); // Reset reply state after posting
        }
        setCommentText(""); // Clear the input field
      } catch (error) {
        console.error("Error adding comment:", error);
      }
    }
  };
  const handleRatingCommentSubmit = (comment: RatingComment, replyText: string) => {
    const parentId = comment.id;
    console.log('parentId', parentId);
    if (replyText.trim().length > 0 && comment) {
      const newRatingComment = {
        author: {
          id: accountData.id,
          avatar:
            accountData.avatar,
          username: accountData.fullname,
        },
        image: "",
        rating:-1,
        status_id: 1,
        reports: 0,
        content: replyText,
        parentId:parentId ? parentId: null,
        created_at: new Date().toLocaleString("en-US", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
      };
      try {
        const ratingsRef = ref(database, `postsPhuc/${item.id}/ratings`);
        const newRatingCommentRef = push(ratingsRef);

        if (newRatingCommentRef.key) {
          const newRatingCommentWithId = { ...newRatingComment, id: newRatingCommentRef.key };
          set(newRatingCommentRef, newRatingCommentWithId);

          setRatingComments((prevComments) => {
            return [...prevComments, { ...newRatingCommentWithId }];
          });
         
        }        

      } catch (error) {
        console.error("Error adding rating comment:", error);
      }
    }

  };
  const addReplyToComment = (
    comments: Comment[],
    parentId: string,
    reply: Comment
  ): Comment[] => {
    return comments.map((comment) => {
      if (comment.id === parentId) {
        // Set the `parentId` for the new reply
        reply.parentId = parentId;
        return [comment, reply];
      }
      return comment;
    }).flat();
  };
  const openCommentModal = () => {
    if (commentModalRef.current) {
      commentModalRef.current.open(); // Safely access the ref
      setIsScrollEnabled(false);
    } else {
      console.error("Modalize reference is null");
    }
  };
  const handleLongPressComment = (comment: Comment) => {
    //handle whether the account is the author of the comment    
    if (accountData.id === comment.author.id) {
      setLongPressedComment(comment);
      authorizedCommentAS.current?.show();
    } else {
      unauthorizedCommentAS.current?.show();
    }
  };
  const handleDeleteComment = async (comment: Comment) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this comment and all its replies?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              // Fetch all comments once
              const snapshot = await get(ref(database, `postsPhuc/${item.id}/comments`));
              const commentsData = snapshot.val() as Record<string, Comment>;


              if (!commentsData) return;


              const pathsToDelete: Record<string, null> = {};


              const addCommentAndRepliesToDelete = (commentId: string) => {
                pathsToDelete[`postsPhuc/${item.id}/comments/${commentId}`] = null;
                Object.keys(commentsData).forEach((key) => {
                  if (commentsData[key].parentId === commentId) {
                    addCommentAndRepliesToDelete(key);
                  }
                });
              };


              addCommentAndRepliesToDelete(comment.id);


              await update(ref(database), pathsToDelete);


              setComments((prevComments) =>
                prevComments.filter((c) => !Object.keys(pathsToDelete).includes(`postsPhuc/${item.id}/comments/${c.id}`))
              );

              console.log('Comment deleted successfully.', comments);

              authorizedCommentAS.current?.hide();
            } catch (error) {
              console.error("Error deleting comment:", error);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };
  const handleSubmitRating = async () => {
    const postId = item.id;
    const userId = accountData.id;
    setIsLoading(true);
    try {
      // Step 1: Reference to the user's rating in Realtime Database
      const userRatingRef = ref(database, `postsPhuc/${postId}/ratings/${userId}`);

      let imageUrl = "";

      // Step 2: Upload image to Firebase Storage with a unique ID if imageUri is provided
      if (ratingImage) {

        const uniqueImageId = push(ref(database)).key;
        if (uniqueImageId) {
          const imageRef = storageRef(storage, `posts/${postId}/images/${uniqueImageId}.jpg`);
          const img = await fetch(ratingImage);
          const bytes = await img.blob();
          await uploadBytes(imageRef, bytes);
          imageUrl = await getDownloadURL(imageRef);
        }
      }

      // Step 3: Prepare the rating data
      const rating = {
        author: {
          id: userId,
          avatar: accountData.avatar,
          username: accountData.fullname,
        },
        id: userRatingRef.key,
        content: ratingCommentText,
        image: imageUrl,
        created_at: new Date().toLocaleString("en-US", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
        rating: ratingValue,
        reports: 0,
        status_id: 0,
        parentId: null,
      };

      // Step 4: Reference to the rating summary in Realtime Database
      const summaryRef = ref(database, `postsPhuc/${postId}/ratingSummary`);

      // Step 5: Update the rating summary with new values
      const summaryUpdate = {
        totalRatingCounter: increment(1),
        totalRatingValue: increment(ratingValue),
      };

      // Step 6: Save the rating and update the summary in parallel
      await Promise.all([
        set(userRatingRef, rating),
        update(summaryRef, summaryUpdate),
      ]);

      console.log('Rating and image successfully added');

    } catch (error) {

      console.error('Error adding rating and image:', error);
    } finally {
      setIsLoading(false);
      setIsRatingModalOpen(false);
      ratingCommentAS.current?.show();
    }
  };
  const handleOpenRatingComments = async () => {

    const postId = item.id;
    const userId = accountData.id;

    // If the account is the author of the post, show the rating comments
    if (isPostAuthor) {
      ratingCommentAS.current?.show();
      return;
    } 

    // Reference to the user's rating in Realtime Database
    const userRatingRef = ref(database, `postsPhuc/${postId}/ratings/${userId}`);
    const previousRatingSnapshot = await get(userRatingRef);

    // If the user has already rated this post, show the rating comments
    if (previousRatingSnapshot.exists()) {
      ratingCommentAS.current?.show();
      return;
    }
    //Otherwise, open the rating modal
    setIsRatingModalOpen(true);
  }
  const averageRating = (totalRatingValue: number, totalRatingCounter: number) => {
    if (!(totalRatingCounter && totalRatingValue)) {
      return 0;
    }
    const average = totalRatingValue / totalRatingCounter;
    const roundedAverage = Math.ceil(average * 2) / 2;
    return roundedAverage;
  };
  const pickRatingImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);

    if (!result.canceled) {
      setRatingImage(result.assets[0].uri);
    }
  };

  //handle report comment
  const handleReportComment = (comment: Comment) => {

  }


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
          <MenuItem isAuthor={isPostAuthor} />
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
            <HeartButton style={styles.buttonItem} postID={item.id} />
            <Text style={styles.totalLikes}>{item.likes}</Text>
            <CommentButton
              style={styles.buttonItem}
              onPress={openCommentModal}
            />
            <Text style={styles.totalComments}>{totalComments}</Text>
          </View>
          <SaveButton style={styles.buttonItem} postID={item.id} />
        </View>
        {/* Rating Button */}
        <View style={styles.ratingButtonContainer}>
          <RatingButton averageRating={averageRating(item.ratingSummary.totalRatingValue, item.ratingSummary.totalRatingCounter)} onPress={handleOpenRatingComments} />
        </View>
      </View>
      <CheckedInChip items={Object.values(item.locations.vietnam)} />
      {/* Post Description */}
      <View style={{ paddingHorizontal: 15 }}>
        <RenderHtml contentWidth={windowWidth} source={desc} />
        <TouchableOpacity onPress={() => toggleDescription(item.id)}>
          <Text>{isExpanded ? "Show less" : "Show more"}</Text>
        </TouchableOpacity>
      </View>
      <Divider style={styles.divider} />
      {/* Comment Bottom Sheet */}
      <Modalize
        ref={commentModalRef}
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
            {comments.length > 0 ? (
              <FlatList
                data={comments}
                keyExtractor={(_, index) => index.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onLongPress={() => handleLongPressComment(item)}
                    style={[styles.commentContainer, { marginLeft: item.parentId ? 20 : 0 }]}>
                    <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
                      <Image source={{ uri: item.author.avatar }} style={styles.miniAvatar} />
                      <View style={{ marginLeft: 10 }}>
                        <Text style={styles.commentUsername}>{item.author.username}</Text>
                        <Text style={styles.commentText}>{item.content}</Text>
                        <View style={{ flexDirection: 'row' }}>
                          <TouchableOpacity style={styles.commentButtons} onPress={() => setReplyingTo({ id: item.id, username: item.author.username })}>
                            <IconMaterial name="message-reply-text-outline" size={20} color="#B1B1B1" style={{ marginRight: 5 }} />
                            <Text style={styles.replyButton}>Reply</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                      <Text style={styles.commentTime}>{item.created_at}</Text>
                    </View>
                  </TouchableOpacity>
                )}
                contentContainerStyle={{ paddingBottom: 60 }}
              />
            ) : (
              <Text>No comments yet. Be the first to comment!</Text>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modalize>

      {/* Action Sheet for author*/}
      <ActionSheet ref={authorizedCommentAS} containerStyle={styles.actionSheetContainer}>
        <View>
          <TouchableOpacity
            style={styles.actionOption}
            onPress={() => {
              if (longPressedComment) {
                handleDeleteComment(longPressedComment);
              }

            }}
          >
            <Text style={[styles.actionOptionText, styles.actionOptionTextDelete]}>
              Xóa bình luận
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionOption}
            onPress={() => authorizedCommentAS.current?.hide()}
          >
            <Text style={[styles.actionOptionText, styles.actionOptionTextCancel]}>
              Hủy
            </Text>
          </TouchableOpacity>
        </View>
      </ActionSheet>

      {/* Action Sheet for unauthorized account */}
      <ActionSheet ref={unauthorizedCommentAS} containerStyle={styles.actionSheetContainer}>
        <View>
          <TouchableOpacity
            style={styles.actionOption}
            onPress={() => {
              if (longPressedComment) {
                handleReportComment(longPressedComment);
              }

            }}
          >
            <Text style={[styles.actionOptionText, styles.actionOptionTextDelete]}>
              Báo cáo bình luận
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionOption}
            onPress={() => authorizedCommentAS.current?.hide()}
          >
            <Text style={[styles.actionOptionText, styles.actionOptionTextCancel]}>
              Hủy
            </Text>
          </TouchableOpacity>
        </View>
      </ActionSheet>
      {/* Rating Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isRatingModalOpen}
        onRequestClose={() => setIsRatingModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Đánh giá bài viết</Text>
            <Text style={styles.modalSubtitle}>
              Xin hãy nhận xét trung thực và đánh giá khách quan nhất.
            </Text>

            {/* Rating Component */}
            <View style={styles.ratingWrapper}>
              <Rating
                onFinishRating={(value: number) => setRatingValue(value)}
                startingValue={5}
                imageSize={50}
                minValue={1}
                style={{ marginBottom: 10 }}
              />
            </View>

            {/* Comment Input */}
            <View style={styles.ratingCommentInputContainer}>
              <TextInput
                placeholder="Nhận xét của bạn..."
                value={ratingCommentText}
                onChangeText={setRatingCommentText}
                style={styles.ratingCommentInput}
                multiline
              />
            </View>

            {/* Image picker */}
            <View style={styles.imagePickerContainer}>
              <Pressable style={styles.imagePickerButton} onPress={pickRatingImage}>
                <IconMaterial name="image-plus" size={20} color="#2196F3" style={styles.imagePickerIconButton} />
                <Text style={styles.imagePickerTextButton}>Thêm ảnh ( Nếu có )</Text>
              </Pressable>
              {ratingImage &&
                <View style={styles.selectedImageContainer}>
                  <Image
                    source={{ uri: ratingImage }}
                    style={styles.selectedImage}
                  />
                </View>
              }
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonModalRow}>
              <Pressable
                style={[styles.button, styles.buttonClose]}
                onPress={() => setIsRatingModalOpen(false)}
              >
                <Text style={styles.buttonText}>Đóng</Text>
              </Pressable>
              <Pressable
                style={[styles.button, styles.buttonSubmit]}
                onPress={handleSubmitRating}
              >
                <Text style={styles.buttonText}>Đăng</Text>
              </Pressable>
            </View>
          </View>
        </View>
        {/* Loading Indicator Overlay */}
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#ffffff" />
          </View>
        )}
      </Modal>
      {/* Rating Comments */}
      <CommentsActionSheet
        isPostAuthor={isPostAuthor}
        commentRefAS={ratingCommentAS}
        commentsData={ratingComments}
        onSubmitRatingComment={handleRatingCommentSubmit}
      />
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
      />
      {/* Loader overlay */}
      {/* {loading && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#B1B1B1" />
        </View>
      )} */}


    </>
  );
}
const styles = StyleSheet.create({
  // rating comment styles
  replyInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 10,
    marginTop: 15,

  },
  replyInput: {
    flex: 1,
    fontSize: 16,
    paddingHorizontal: 10,
  },
  replySubmitButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 10,
    marginLeft: 10,
  },
  replySubmitButtonText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 14,
  },
  replyButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  replyButtonText: {
    color: '#5a5a5a',
    fontSize: 14,
    marginLeft: 5,
  },
  marginBottom5: {
    marginBottom: 5,
  },
  topBorder: {
    borderTopWidth: 3,
    borderTopColor: '#B1B1B1',
    width: 50,
    alignSelf: 'center',
    paddingVertical: 5
  },
  ratingCommentsASContainer: {
    backgroundColor: '#f9f9f9',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 15,
    height: '80%',
  },
  ratingCommentsHeader: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  ratingCommentCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  ratingCommentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  ratingCommentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  ratingCommentUserInfo: {
    flexDirection: 'column',
  },
  ratingCommentAuthor: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  ratingCommentTime: {
    fontSize: 12,
    color: '#999',
  },
  ratingCommentText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 10,
  },
  ratingCommentImage: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    marginTop: 10,
    resizeMode: 'cover',
  },
  noCommentsText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 20,
  },
  //
  actionSheetContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  actionOption: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
  },
  actionOptionText: {
    fontSize: 18,
    color: '#007AFF',
    fontWeight: '500',
    textAlign: 'center',
  },
  actionOptionTextDelete: {
    color: '#FF3B30', // Red color for delete option
  },
  actionOptionTextCancel: {
    color: '#555555', // Grey color for cancel option
  },
  commentButtons: {
    flexDirection: "row",
    marginTop: 5,
  },
  // rating modal styles
  selectedImageContainer: {
    marginTop: 15,
    alignItems: 'center',
  },
  selectedImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  ratingImage: {
    width: 50,
    height: 50,
    borderRadius: 10,
    marginVertical: 10,
    alignSelf: 'flex-start',
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
    marginVertical: 20,
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
  ratingCommentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#fff',
  },
  ratingCommentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: '#f9f9f9',
    fontSize: 16,
    maxHeight: 100,
  },
  // rating modal
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent overlay
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10, // Ensures it appears above other content
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)', // Dimmed background
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
    color: '#666',
  },
  ratingContainer: {
    marginBottom: 30,
  },
  buttonModalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 5,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonClose: {
    backgroundColor: '#cccccc',
  },
  buttonSubmit: {
    backgroundColor: '#2196F3',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loaderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 24, 27, 0.62)',
    zIndex: 1,
  },
  ratingTitle: {
    marginLeft: 10,
    fontWeight: "bold",
    fontSize: 20,
    color: "white",
    marginTop: 3,
  },
  ratingWrapper: {
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
  totalComments: {
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
    marginRight: 10,
  },
  commentText: {
    fontSize: 14,
    color: "#555",
    marginTop: 5,
  },
  replyButton: {
    color: "grey", // Blue color for the reply button
    fontSize: 13,
    marginTop: 3,
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
