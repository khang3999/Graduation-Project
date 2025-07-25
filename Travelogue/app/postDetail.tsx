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
import Markdown from 'react-native-markdown-display';
import Icon from "react-native-vector-icons/FontAwesome";
import IconMaterial from "react-native-vector-icons/MaterialCommunityIcons";
import { Rating } from "react-native-ratings";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { usePost } from "@/contexts/PostProvider";
import TabBar from "@/components/navigation/TabBar";
import { auth, database, getDownloadURL, onValue, storage, storageRef, uploadBytes } from "@/firebase/firebaseConfig";
import { ref, push, set, get, refFromURL, update, increment, runTransaction } from "firebase/database";
import { useAccount } from "@/contexts/AccountProvider";
import HeartButton from "@/components/buttons/HeartButton";
import ActionSheet, { ActionSheetRef } from 'react-native-actions-sheet';
import * as ImagePicker from 'expo-image-picker';
import CommentsActionSheet from "@/components/comments/CommentsActionSheet";
import { Comment, RatingComment } from '@/types/CommentTypes';
import { formatDate } from "@/utils/commons"
import { useHomeProvider } from "@/contexts/HomeProvider";
import { AntDesign, Ionicons, MaterialIcons } from '@expo/vector-icons';
import ImageModal from "react-native-image-modal";
import { backgroundColors, iconColors } from "@/assets/colors";
import { useAdminProvider } from "@/contexts/AdminProvider";
const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;



type Post = {
  id: string;
  author: {
    id: string;
    avatar: any;
    fullname: string;
  };
  comments: Record<string, Comment>;
  content: string;
  created_at: number;
  hashtag: string;
  images: Record<string, Record<string, { city_name: string; images_value: string[] }>>;
  likes: number;
  locations: Record<string, Record<string, string>>;
  post_status: string;
  reports: number;
  mode: string;
  view_mode: boolean;
  thumbnail: any,
  title: string
}
type PostItemProps = {
  item: Post;
  setIsScrollEnabled: (value: boolean) => void;
};

const flattenLocations = (locations: Record<string, Record<string, string>>) => {
  const flattenedArray = [];


  for (const country in locations) {
    for (const locationCode in locations[country]) {
      flattenedArray.push({
        country,
        locationCode,
        locationName: locations[country][locationCode],
      });
    }
  }

  return flattenedArray;
};


const flattenImages = (images: Record<string, Record<string, { city_name: string; images_value: string[] }>>) => {
  const flattenedArray: any[] = [];

  for (const country in images) {
    for (const locationCode in images[country]) {
      const cityData = images[country][locationCode];
      cityData.images_value.forEach((imageUrl) => {
        flattenedArray.push({
          country,
          locationCode,
          cityName: cityData.city_name,
          imageUrl,
        });
      });
    }
  }

  return flattenedArray;
};


const PostItem: React.FC<PostItemProps> = ({
  item,
  setIsScrollEnabled,
}) => {
  const TYPE = 'post';
  const MAX_LENGTH = 10;
  const commentAS = useRef<ActionSheetRef>(null);
  const [commentText, setCommentText] = useState("");
  const { userId }: any = useHomeProvider();
  const [comments, setComments] = useState(Object.values(item.comments || {}));
  const [longPressedComment, setLongPressedComment] = useState<Comment | null>(null);
  const totalComments = comments.length;
  const isPostAuthor = userId === item.author.id;
  const flattenedLocationsArray = flattenLocations(item.locations);
  const flattenedImagesArray = flattenImages(item.images);
  const [authorParentCommentId, setAuthorParentCommentId] = useState('')
  const { setSearchedAccountData, dataAccount, likedPostsList }: any = useAccount();
  const { prevScreen } = useLocalSearchParams();



  const handleCommentSubmit = async (parentComment: Comment, replyText: string) => {
    if (!userId.id || !dataAccount.avatar || !dataAccount.fullname) {
      console.error('Missing required author information');
      return;
    }
    // return;
    if (replyText.trim().length > 0) {
      const parentId = parentComment ? parentComment.id : null;
      // console.log('Parent comment:', parentComment);
      if (parentComment) {
        setAuthorParentCommentId(parentComment.author.id)
      }

      const newComment = {
        author: {
          id: dataAccount.id,
          avatar:
            dataAccount.avatar,
          fullname: dataAccount.fullname,
        },
        status_id: 1,
        reports: 0,
        content: replyText,
        parentId: parentId ? parentId : null,
        created_at: Date.now(),
      };
      try {
        const commentRef = ref(database, `posts/${item.id}/comments`)
        const newCommentRef = push(commentRef);

        if (newCommentRef.key) {
          const newCommentWithId = { ...newComment, id: newCommentRef.key };
          await set(newCommentRef, newCommentWithId);

          setComments((prevComments) => {
            if (parentId) {
              // Add as a reply with the correct `parentId`
              // Notify reply comment for parentId


              if (authorParentCommentId != dataAccount.id && authorParentCommentId != '') {
                handleAddNotify(newCommentRef.key, authorParentCommentId, parentId)
              }
              return addReplyToComment(prevComments, parentId, newCommentWithId);
            } else {
              // Add as a top-level Comment
              return [newCommentWithId, ...prevComments];
            }
          });

        }
        // Notify comment for auht post


        if (dataAccount.id != item.author.id) {
          handleAddNotify(newCommentRef.key, item.author.id, parentId)
        }
      } catch (error) {
        console.error("Error adding Comment:", error);
      }
    }
  }

  //Tao thong bao
  const handleAddNotify = async (commentId: any, account_id: any, parentId: any) => {

    // Tạo một tham chiếu đến nhánh 'notifications' trong Realtime Database
    const notifyRef = ref(database, `notifications/${account_id}`);

    // Tạo key tu dong cua firebase
    const newItemKey = push(notifyRef);
    const notify = {
      author_id: item.author.id,
      comment_id: commentId,
      commentator_id: dataAccount.id,
      commentator_name: dataAccount.fullname,
      created_at: Date.now(),
      id: newItemKey.key,
      image: item.thumbnail,
      post_id: item.id,
      type: parentId ? "reply" : "comment",
      read: false,
      type_post: "post"
    };
    // Sử dụng set() để thêm dữ liệu vào Firebase theo dạng key: value
    await set(newItemKey, notify)
      .then(() => {
        console.log('Data added successfully');
      })
      .catch((error) => {
        console.error('Error adding data: ', error);
      });

  };


  const addReplyToComment = (
    comments: Comment[],
    parentId: string,
    reply: Comment
  ): Comment[] => {
    return comments.map((Comment) => {
      if (Comment.id === parentId) {
        // Set the `parentId` for the new reply
        reply.parentId = parentId;
        return [Comment, reply];
      }
      return Comment;
    }).flat();
  };
  const openCommentModal = () => {
    if (commentAS.current) {
      commentAS.current.show();
    } else {
      console.error("Modalize reference is null");
    }
  };

  const handleDeleteComment = async (Comment: Comment) => {
    Alert.alert(
      "Xóa Comment",
      "Tất cả các Comment con của nó cũng sẽ bị xóa. Bạn có chắc chắn muốn xóa Comment này ?",
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            try {
              // Fetch all comments once
              const snapshot = await get(ref(database, `posts/${item.id}/comments`));
              const commentsData = snapshot.val() as Record<string, Comment>;


              if (!commentsData) return;


              const pathsToDelete: Record<string, null> = {};


              const addCommentAndRepliesToDelete = (commentId: string) => {
                pathsToDelete[`posts/${item.id}/comments/${commentId}`] = null;
                Object.keys(commentsData).forEach((key) => {
                  if (commentsData[key].parentId === commentId) {
                    addCommentAndRepliesToDelete(key);
                  }
                });
              };


              addCommentAndRepliesToDelete(Comment.id);


              await update(ref(database), pathsToDelete);


              setComments((prevComments) =>
                prevComments.filter((c) => !Object.keys(pathsToDelete).includes(`posts/${item.id}/comments/${c.id}`))
              );

              console.log('Comment deleted successfully.', comments);

            } catch (error) {
              console.error("Error deleting Comment:", error);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };


  //handle report Comment
  const handleReportComment = (Comment: Comment) => {

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
    Markdown: isExpanded
      ? item.content.replace(/<br>/g, '\n')
      : `${item.content.replace(/<br>/g, '\n').slice(0, MAX_LENGTH)} ...`,
  };


  const handleGoToProfileScreen = async (accountId: any) => {
    if (accountId) {
      try {
        const refAccount = ref(database, `accounts/${accountId}`)
        const snapshot = await get(refAccount);
        if (snapshot.exists()) {
          const dataAccountJson = snapshot.val()
          console.log(dataAccountJson, 'adsd');

          await setSearchedAccountData(dataAccountJson)
          router.replace("/SearchResult");
        } else {
          console.log("No data account available");
        }
      } catch (error) {
        console.error("Error fetching data account: ", error);
      }
    }

  }

  useEffect(() => {
    // console.log(`PostItem render by liked: ${liked}`, data.id)
    console.log(likedPostsList, 'check detail');
  }, [likedPostsList])
  return (
    <View style={{ backgroundColor: backgroundColors.background1 }}>
      <View style={{ flex: 1, height: windowWidth }}>
        {/* Post Header */}
        <View style={styles.header}>
          <View style={[styles.row, { justifyContent: 'space-between', padding: 10 }]}>
            <TouchableOpacity style={styles.headerButton} onPress={() => {
              // if (prevScreen !== 'home') {
              router.back()
              // } 
            }}>
              <AntDesign name="arrowleft" size={24} color='white' />
            </TouchableOpacity>
            <View style={{}}>
              <MenuItem locations={item.locations} mode={item.mode} isAuthor={isPostAuthor} postId={item.id} userId={dataAccount.id} />
            </View>
          </View>
        </View>

        {/* Post Images Carousel */}
        <View style={{ backgroundColor: 'white', width: windowWidth, height: windowWidth, }}>
          <Carousel
            pagingEnabled={true}
            loop={false}
            width={windowWidth}
            height={windowWidth + 100}
            data={flattenedImagesArray}
            scrollAnimationDuration={300}
            renderItem={({ item, index }) => (
              <View style={styles.carouselItem}>
                <ImageModal swipeToDismiss={true}
                  resizeMode="cover"
                  imageBackgroundColor="#fff" style={styles.posts} source={{ uri: item.imageUrl }} />
                <View style={{ position: 'absolute', bottom: 140, width: '100%', justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }}>
                  <View style={styles.viewTextStyles}>
                    <Text style={styles.carouselText}>
                      {index + 1}/{flattenedImagesArray.length} - {item.cityName}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          />
        </View>
      </View>

      <View style={{ position: 'absolute', borderRadius: 600, width: windowWidth * 2, height: windowWidth * 2, left: -windowWidth / 2, top: windowWidth, justifyContent: 'center', alignItems: 'flex-end', overflow: 'hidden', backgroundColor: backgroundColors.background1 }}>
      </View>

      {/* CONTENT */}
      <View style={{ flex: 1, paddingHorizontal: 20, alignItems: 'center' }}>
        {/* BUTTON */}
        <View style={[styles.buttonRow, {}]}>
          {/* Button comment */}
          <View style={[styles.buttonItem, { gap: 10 }]}>
            <CommentButton
              style={[styles.buttonComment,]}
              onPress={openCommentModal}
            />
            <Text style={styles.totalComments}>{totalComments}</Text>
          </View>

          <HeartButton myStyle={styles.buttonItem} style={styles.buttonLike} data={item} type='post'></HeartButton>
          <SaveButton myStyle={styles.buttonItem} style={styles.buttonSave} data={item} type='post' />
        </View>

        {/* Author */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 0, marginTop: 80 }}>
          <TouchableOpacity style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }} onPress={() => handleGoToProfileScreen(item.author.id)}>
            <View style={{ width: 50, height: 50, borderRadius: 30, padding: 2, backgroundColor: 'white', elevation: 4, }}>
              <Image source={{ uri: item.author.avatar }} style={{ width: '100%', height: '100%', borderRadius: 30 }}></Image>
            </View>
            <Text style={{ fontWeight: '500', marginLeft: 10, fontSize: 16 }}>{item.author.fullname}</Text>
          </TouchableOpacity>
          <View>
            <Text style={{ fontStyle: 'italic' }}>{formatDate(item.created_at)}</Text>
          </View>
        </View>
        {/* Title */}
        <View style={styles.titleContainer}>
          <Image style={{ width: 40, height: 80, }} source={require('@/assets/images/mountainIcon.png')}></Image>
          <Text style={styles.textTitle} >{item.title}</Text>
        </View>
        {/* CHIP */}
        <View style={{ paddingHorizontal: 10 }}>
          <CheckedInChip items={Object.values(flattenedLocationsArray)} />
        </View>
        {/* BADGE */}
        {/* <View style={[styles.row, { justifyContent: 'space-evenly' }]}>
          <View style={[{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: iconColors.green2, padding: 10, borderRadius: 20, elevation: 4 }]}>
            <Ionicons name="calendar" size={22} color={iconColors.green1} />
            <Text style={{ paddingLeft: 10 }}>4 ngày</Text>
          </View>
        </View> */}

        {/* Post Description */}
        <View style={{ padding: 20, marginVertical: 20, backgroundColor: 'white', margin: 0, borderRadius: 30, elevation: 4, width: '100%' }}>
          <Markdown>
            {desc.Markdown}
          </Markdown>
          <TouchableOpacity onPress={() => toggleDescription(item.id)}>
            <Text>{isExpanded ? "Ẩn bớt" : "Xem thêm"}</Text>
          </TouchableOpacity>
        </View>
        {/* <Divider style={styles.divider} /> */}
      </View>


      {/* Comment Bottom Sheet */}
      <CommentsActionSheet
        commentRefAS={commentAS}
        commentsData={comments}
        onSubmitComment={handleCommentSubmit}
        accountId={dataAccount.id}
        onDelete={handleDeleteComment}
        postId={item.id}
        type={"post"}
      />
    </View>
  );
};

export default function PostsScreen() {
  // State to track whether full description is shown
  const { areasByProvinceName }: any = useAdminProvider();
  const { selectedPost, setSelectedPost }: any = usePost();
  const { initialIndex, postId, prevScreen } = useLocalSearchParams();

  const initialPage = parseInt(initialIndex as string, 10) ? parseInt(initialIndex as string, 10) : 0;
  const [isScrollEnabled, setIsScrollEnabled] = useState(true);
  const [dataPost, setDataPost] = useState<any>([])
  const [dataLocations, setDataLoctions] = useState<any>([])
  const memoriedPostItem = useMemo(() => selectedPost, [selectedPost]);

  const fetchPostById = async (postId: any) => {
    try {
      const refPost = ref(database, `posts/${postId}`)
      const refScore = ref(database, `posts/${postId}/scores`);

      // Cập nhật scores trước
      await runTransaction(refScore, (currentScore) => {
        return (currentScore || 0) + 1;
      });

      const snapshot = await get(refPost);
      if (snapshot.exists()) {
        const dataPostJson: any = snapshot.val()
        const dataLocations = dataPostJson.locations

        setDataLoctions(flattenLocations(dataLocations))
        setDataPost([dataPostJson])
      } else {
        console.log("No data city available");
      }
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  }

  const updateScoresForCities = async () => {
    for (const city of dataLocations) {
      try {
        const coutnryId = city.country
        const areaId = areasByProvinceName[city.locationName]
        const cityId = city.locationCode

        const refCityScores = ref(database, `cities/${coutnryId}/${areaId}/${cityId}/scores`)
        await runTransaction(refCityScores, (currentScore) => {
          return (currentScore || 0) + 1;
        });
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    }
  }

  useEffect(() => {
    if (postId) {
      fetchPostById(postId)
    }
  }, [postId])

  useEffect(() => {
    if (dataLocations.length === 0) return
    updateScoresForCities()
  }, [dataLocations])
  return (
    <View style={{ marginTop: 30, flex: 1 }}>
      <FlatList
        data={postId ? dataPost : memoriedPostItem}
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


    </View>
  );
}
const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 15,
    width: '100%',
    paddingHorizontal: 20,
    // backgroundColor: 'rgba(100,100,100,0.5)',

    // margin:20,
    // width: windowWidth,
    // height: 50,
    // overflow: 'hidden'
  },
  textTitle: {
    fontSize: 26,
    fontWeight: '600',
  },
  buttonComment: {
    padding: 0
  },
  buttonLike: {
    top: -30,
  },
  buttonSave: {
    // padding: 20
  },
  headerButton: {
    padding: 15,
    backgroundColor: 'rgba(100,100,100,0.5)',
    borderRadius: 40,
    // elevation: 4,
  },
  header: {
    position: 'absolute',
    backgroundColor: 'transparent',
    zIndex: 2,
    width: '100%',
    // paddingTop:40
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
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
  // rating Comment styles
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

  modalContainer: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
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
    fontSize: 18,
    fontWeight: "500",
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
    marginBottom: 35,
    marginTop: 10,
  },
  carouselItem: {
    flex: 1,
    alignSelf: 'center',
    justifyContent: "center",
    height: windowWidth,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
  },
  buttonRow: {
    position: 'absolute',
    top: 0,
    flexDirection: "row",
    width: '100%',
    justifyContent: 'space-between',
    paddingHorizontal: 20
  },
  buttonItem: {
    flexDirection: 'row',
    alignItems: "center",
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 80,
    elevation: 6,
    width: 65,
    height: 65
  },
  viewTextStyles: {
    // position: "absolute",
    // backgroundColor: "#392613",
    // top: 10,
    // left: windowWidth - 120,
    // borderRadius: 20,
    // paddingHorizontal: 7,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 10,
    borderRadius: 20,
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
    paddingHorizontal: 10,
    paddingBottom: 10,
    // padding:10,
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
    height: windowWidth + 100,
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
    backgroundColor: "#f9f9f9", // Light background for the Comment
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
