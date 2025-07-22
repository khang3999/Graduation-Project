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
  StatusBar,
} from "react-native";
import React, { useCallback, useMemo, useState, useRef, useEffect } from "react";
import Carousel from "react-native-reanimated-carousel";
import { Modalize } from "react-native-modalize";
import LikeButton from "@/components/buttons/HeartButton";
import CommentButton from "@/components/buttons/CommentButton";
import SaveButton from "@/components/buttons/SaveButton";
import { Divider } from "react-native-paper";
import MenuItem from "@/components/buttons/MenuTourButton";
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
import { CommentType, Comment, RatingComment } from '@/types/CommentTypes';
import { averageRating, formatDate } from "@/utils/commons"
import { useTourProvider } from "@/contexts/TourProvider";
import { useHomeProvider } from "@/contexts/HomeProvider";
import RatingCommentsActionSheet from "@/components/comments/RatingCommentsActionSheet";
import ImageModal from "react-native-image-modal";
import { AntDesign, Entypo, FontAwesome, FontAwesome6, Ionicons } from "@expo/vector-icons";
import { backgroundColors, iconColors } from "@/assets/colors";
import { useAdminProvider } from "@/contexts/AdminProvider";
const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;


type RatingSummary = {
  totalRatingCounter: any;
  totalRatingValue: any;
};


type Tour = {
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
  ratings: Record<string, RatingComment>;
  ratingSummary: RatingSummary;
  post_status: string;
  reports: number;
  view_mode: boolean;
  thumbnail: string;
  discountTour: number;
  money: number;
  title: string
};

type TourItemProps = {
  item: Tour;
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
    <>
      {/* <Text style={styles.ratingLabel}>Đánh giá: </Text> */}
      <TouchableOpacity style={styles.buttonItem} onPress={onPress}>
        {/* <Icon name="smile-o" size={40} color="black" /> */}
        <Text style={styles.ratingValue}>{averageRating.toFixed(1)}</Text>
        <FontAwesome name="star" size={24} color="#F6CE00" style={{ marginLeft: 4 }} />
      </TouchableOpacity>
    </>
  );
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

// const averageRating = (totalRatingValue: number, totalRatingCounter: number) => {
//   if (!(totalRatingCounter && totalRatingValue)) {
//     return 0;
//   }
//   const average = totalRatingValue / totalRatingCounter;
//   const roundedAverage = Math.ceil(average * 2) / 2;
//   return roundedAverage;
// };
const TourItem: React.FC<TourItemProps> = ({
  item,
  setIsScrollEnabled,
}) => {
  const TYPE = 1;
  const MAX_LENGTH = 20;
  const commentAS = useRef<ActionSheetRef>(null);
  const ratingCommentAS = useRef<ActionSheetRef>(null);
  const [ratingComments, setRatingComments] = useState(Object.values(item.ratings || {}));
  const [averageRatingValue, setAverageRatingValue] = useState(averageRating(item.ratingSummary.totalRatingValue, item.ratingSummary.totalRatingCounter));

  // const { dataAccount }: any = useHomeProvider();
  const { setSearchedAccountData, dataAccount }: any = useAccount();
  const [comments, setComments] = useState(Object.values(item.comments || {}));
  const [longPressedComment, setLongPressedComment] = useState<Comment | null>(null);
  const [ratingImage, setRatingImage] = useState<string | null>(null);
  const [ratingCommentText, setRatingCommentText] = useState("");
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [ratingValue, setRatingValue] = useState(5);
  const totalComments = comments.length;
  const isPostAuthor = dataAccount.id === item.author.id;


  const flattenedLocationsArray = flattenLocations(item.locations);
  const flattenedImagesArray = flattenImages(item.images);
  const [isLoading, setIsLoading] = useState(false);
  const [authorParentCommentId, setAuthorParentCommentId] = useState('')
  const [bannedWords, setBannedWords] = useState<any[]>([])
  const originalPrice = item.money
  const promotionalPrice = item.money * (100 - item.discountTour) / 100

  const handleCommentSubmit = async (parentComment: Comment, replyText: string) => {
    if (!dataAccount.id || !dataAccount.avatar || !dataAccount.fullname) {
      console.error('Missing required author information');
      return;
    }
    if (parentComment) {
      setAuthorParentCommentId(parentComment.author.id)
    }
    if (replyText.trim().length > 0) {
      const parentId = parentComment ? parentComment.id : null;
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
        const commentRef = ref(database, `tours/${item.id}/comments`)
        const newCommentRef = push(commentRef);

        if (newCommentRef.key) {
          const newCommentWithId = { ...newComment, id: newCommentRef.key };
          await set(newCommentRef, newCommentWithId);

          setComments((prevComments) => {
            if (parentId) {
              // Add as a reply with the correct `parentId`
              if (authorParentCommentId != dataAccount.id && authorParentCommentId != '') {
                handleAddNotify(newCommentRef.key, authorParentCommentId, parentId)
              }
              return addReplyToComment(prevComments, parentId, newCommentWithId);
            } else {
              // Add as a top-level comment
              return [newCommentWithId, ...prevComments];
            }
          });

        }
        if (dataAccount.id != item.author.id) {
          handleAddNotify(newCommentRef.key, item.author.id, parentId)
        }
      } catch (error) {
        console.error("Error adding rating comment:", error);
      }
    }
  }
  const handleRatingCommentSubmit = (parentComment: RatingComment, replyText: string) => {
    if (replyText.trim().length > 0) {
      const parentId = parentComment ? parentComment.id : null;
      const newRatingComment = {
        author: {
          id: dataAccount.id,
          avatar:
            dataAccount.avatar,
          fullname: dataAccount.fullname,
        },
        image: "",
        rating: -1,
        status_id: 1,
        reports: 0,
        content: replyText,
        parentId: parentId ? parentId : null,
        created_at: Date.now(),
      };
      try {
        const ratingsRef = ref(database, `tours/${item.id}/ratings`);
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
      type_post: "tour"
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
    if (commentAS.current) {
      commentAS.current.show();
    } else {
      console.error("Modalize reference is null");
    }
  };

  const handleDeleteComment = async (comment: Comment) => {
    Alert.alert(
      "Xóa comment",
      "Tất cả các comment con của nó cũng sẽ bị xóa. Bạn có chắc chắn muốn xóa comment này ?",
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
              const snapshot = await get(ref(database, `tours/${item.id}/comments`));
              const commentsData = snapshot.val() as Record<string, Comment>;


              if (!commentsData) return;


              const pathsToDelete: Record<string, null> = {};


              const addCommentAndRepliesToDelete = (commentId: string) => {
                pathsToDelete[`tours/${item.id}/comments/${commentId}`] = null;
                Object.keys(commentsData).forEach((key) => {
                  if (commentsData[key].parentId === commentId) {
                    addCommentAndRepliesToDelete(key);
                  }
                });
              };


              addCommentAndRepliesToDelete(comment.id);


              await update(ref(database), pathsToDelete);


              setComments((prevComments) =>
                prevComments.filter((c) => !Object.keys(pathsToDelete).includes(`tours/${item.id}/comments/${c.id}`))
              );

              // console.log('Comment deleted successfully.', comments);

            } catch (error) {
              console.error("Error deleting comment:", error);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };
  const handleDeleteRatingComment = async (comment: RatingComment) => {
    Alert.alert(
      "Xóa comment",
      "Bạn có chắc chắn muốn xóa comment này ?",
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
              // Fetch all rating once
              const snapshot = await get(ref(database, `tours/${item.id}/ratings`));
              const ratingCommentsData = snapshot.val() as Record<string, RatingComment>;


              if (!ratingCommentsData) return;


              const pathsToDelete: Record<string, null> = {};


              const addCommentAndRepliesToDelete = (ratingCommentId: string) => {
                pathsToDelete[`tours/${item.id}/ratings/${ratingCommentId}`] = null;
                Object.keys(ratingCommentsData).forEach((key) => {
                  if (ratingCommentsData[key].parentId === ratingCommentId) {
                    addCommentAndRepliesToDelete(key);
                  }
                });
              };


              addCommentAndRepliesToDelete(comment.id);

              //remove rating summary in Realtime Database
              const summaryRef = ref(database, `tours/${item.id}/ratingSummary`);
              const summaryUpdate = {
                totalRatingCounter: increment(-1),
                totalRatingValue: increment(-comment.rating),
              };
              //update rating value when rating comments change
              setAverageRatingValue(averageRating(item.ratingSummary.totalRatingValue - comment.rating, item.ratingSummary.totalRatingCounter - 1));

              await update(summaryRef, summaryUpdate);
              await update(ref(database), pathsToDelete);




              setRatingComments((prevComments) =>
                prevComments.filter((c) => !Object.keys(pathsToDelete).includes(`tours/${item.id}/ratings/${c.id}`))
              );



              // console.log('Comment deleted successfully.', comments);

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
    const userId = dataAccount.id;
    setIsLoading(true);
    try {

      //Step 0: Check banned words
      // convert reply text to lowercase for easier comparison
      const replyTextLower = ratingCommentText.toLowerCase();

      // Check for banned words
      const bannedWord = bannedWords.find((word) => replyTextLower.includes(word.word.toLowerCase()));
      if (bannedWord) {
        Alert.alert('Từ ngữ vi phạm', `Bình luận của bạn chứa từ ngữ vi phạm: "${bannedWord.word}". Vui lòng chỉnh sửa bình luận của bạn trước khi gửi.`);
        return;
      }


      // Step 1: Reference to the user's rating in Realtime Database
      const userRatingRef = ref(database, `tours/${postId}/ratings/${userId}`);

      let imageUrl = "";

      // Step 2: Upload image to Firebase Storage with a unique ID if imageUri is provided
      if (ratingImage) {

        const uniqueImageId = push(ref(database)).key;
        if (uniqueImageId) {
          const imageRef = storageRef(storage, `tours/${postId}/images/${uniqueImageId}.jpg`);
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
          avatar: dataAccount.avatar,
          fullname: dataAccount.fullname,
        },
        id: userRatingRef.key!,
        content: ratingCommentText,
        image: imageUrl,
        created_at: Date.now(),
        rating: ratingValue,
        reports: 0,
        status_id: 0,
        parentId: null,
      };

      // Step 4: Reference to the rating summary in Realtime Database
      const summaryRef = ref(database, `tours/${postId}/ratingSummary`);

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

      setRatingComments((prevComments) => {
        return [rating, ...prevComments];
      });
      // Step 7: update rating value when rating comments change
      setAverageRatingValue(averageRating(item.ratingSummary.totalRatingValue + ratingValue, item.ratingSummary.totalRatingCounter + 1));

      console.log('Rating and image successfully added');
      setIsRatingModalOpen(false);
      ratingCommentAS.current?.show()
    } catch (error) {

      console.error('Error adding rating and image:', error);
    } finally {
      setIsLoading(false);
      ;
    }
  };
  const handleOpenRatingComments = async () => {

    const postId = item.id;
    const userId = dataAccount.id;

    // If the account is the author of the post, show the rating comments
    if (isPostAuthor) {
      ratingCommentAS.current?.show();
      return;
    }

    // Reference to the user's rating in Realtime Database
    const userRatingRef = ref(database, `tours/${postId}/ratings/${userId}`);
    const previousRatingSnapshot = await get(userRatingRef);

    // If the user has already rated this post, show the rating comments
    if (previousRatingSnapshot.exists()) {
      ratingCommentAS.current?.show();
      return;
    }
    //Otherwise, open the rating modal
    setIsRatingModalOpen(true);
  }

  const pickRatingImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({

      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });


    if (!result.canceled) {
      setRatingImage(result.assets[0].uri);
    }
  };


  //handle report comment
  const handleReportComment = (comment: Comment) => {

  }

  //handle report rating comment
  const handleReportRatingComment = (comment: RatingComment) => {

  }

  // Get banned words
  useEffect(() => {
    const onValueChange = ref(database, 'words/');
    const bannedWords = onValue(onValueChange, (snapshot) => {
      if (snapshot.exists()) {
        const jsonData = snapshot.val();
        // Chuyển đổi object thành array
        const dataArray: any = Object.entries(jsonData).map(([key, value]) => ({
          id: key,
          word: value,
        }));
        setBannedWords(dataArray);
      } else {
        console.log("No data available");
      }
    }, (error) => {
      console.error("Error fetching data:", error);
    });

    return () => bannedWords();
  }, []);



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
  return (
    <View style={{}}>
      <View style={{ flex: 1, height: windowWidth }}>
        {/* Post Header */}
        <View style={styles.header}>
          <View style={[styles.row, { justifyContent: 'space-between', padding: 10 }]}>
            <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
              <AntDesign name="arrowleft" size={24} color='white' />
            </TouchableOpacity>
            <View style={{}}>
              <MenuItem isAuthor={isPostAuthor} tourId={item.id} userId={dataAccount.id} locations={item.locations} />
            </View>
          </View>
        </View>

        {/* Post Images Carousel */}
        <View style={{ position: 'absolute', borderRadius: 600, width: windowWidth * 2, height: windowWidth * 2, flexDirection: 'row', left: -windowWidth / 2, top: -windowWidth, justifyContent: 'center', alignItems: 'flex-end', overflow: 'hidden' }}>
          <View style={{ backgroundColor: 'green', width: windowWidth, height: windowWidth, }}>
            <Carousel
              style={{}}
              // style={{ borderRadius: 900,}}
              pagingEnabled={true}
              loop={false}
              width={windowWidth}
              height={windowWidth}
              data={flattenedImagesArray}
              scrollAnimationDuration={300}
              renderItem={({ item, index }) => (
                <View style={styles.carouselItem}>
                  <ImageModal swipeToDismiss={true}
                    resizeMode="cover"
                    imageBackgroundColor="#fff" style={styles.posts} source={{ uri: item.imageUrl }} />

                  <View style={{ position: 'absolute', bottom: 65, width: '100%', justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }}>
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
        {/* BUTTON */}
        <View style={styles.buttonRow}>
          {/* Button comment */}
          <View style={[styles.buttonItem, { gap: 10 }]}>
            <CommentButton
              style={[styles.buttonComment,]}
              onPress={openCommentModal}
            />
            <Text style={styles.totalComments}>{totalComments}</Text>
          </View>
          <HeartButton myStyle={styles.buttonItem} style={styles.buttonLike} data={item} type='tour'></HeartButton>

          {/* Button Rating */}
          <View style={styles.buttonLike}>
            <RatingButton averageRating={averageRatingValue} onPress={handleOpenRatingComments} />
          </View>

          <SaveButton myStyle={styles.buttonItem} style={styles.buttonSave} data={item} type='tour' />
        </View>



      </View>

      {/* CONTENT */}
      <View style={{ flex: 1 }}>
        {/* Author */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20, marginTop: 30 }}>
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
        {/* CHIPS */}
        <View style={{ paddingHorizontal: 20 }}>
          <CheckedInChip items={Object.values(flattenedLocationsArray)} />
        </View>

        {/* BADGE */}
        {/* <View style={[styles.row, { justifyContent: 'space-evenly' }]}>
          <View style={[{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: iconColors.green2, padding: 10, borderRadius: 20, elevation: 4 }]}>
            <Ionicons name="calendar" size={22} color={iconColors.green1} />
            <Text style={{ paddingLeft: 10 }}>4 ngày</Text>
          </View>
        </View> */}

        {/* Tour Description */}
        <View style={{ padding: 20, marginVertical: 20, backgroundColor: 'white', margin: 10, borderRadius: 30, elevation: 4 }}>
          <Markdown>
            {desc.Markdown}
          </Markdown>

          <TouchableOpacity onPress={() => toggleDescription(item.id)}>
            <Text>{isExpanded ? "Ẩn bớt" : "Xem thêm"}</Text>
          </TouchableOpacity>
        </View>
        {/* <Divider style={styles.divider} /> */}
      </View>

      <View style={[styles.row, { bottom: 0, width: '100%', backgroundColor: backgroundColors.background1, gap: 10, borderTopWidth: 2, borderStyle: "dashed" }]}>
        <TouchableOpacity style={{ backgroundColor: iconColors.green2, paddingVertical: 12, paddingHorizontal: 20, borderRadius: 50, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', margin: 15, marginHorizontal: 30, flex: 1, elevation: 4, borderWidth: 1 }} >
          <FontAwesome6 name="phone-volume" size={20} color="black" />
          <Text style={{ fontWeight: '500', paddingLeft: 10 }}>LIÊN HỆ</Text>
        </TouchableOpacity>
        <View style={{
          borderRightWidth: 10, borderColor: iconColors.green1, height: '100%'
        }}></View>
        {/* Price */}
        <View style={{ backgroundColor: iconColors.green1, height: '100%', paddingHorizontal: 15, paddingVertical: 10 }}>
          {item.discountTour !== 0 ?  // Co discount
            <Text style={{ flex: 1, textDecorationLine: 'line-through', color: '#eeeeee', textAlignVertical: 'center', fontStyle: 'italic' }}>{originalPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</Text>
            :
            <></>
          }
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 18, fontWeight: '500', color: iconColors.green2 }}>
              {(item.discountTour !== 0 ? promotionalPrice : originalPrice).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
            </Text>
            <View style={{ width: 2, height: 25, backgroundColor: iconColors.green2, marginHorizontal: 6 }}></View>
            <Text style={{ fontSize: 18, fontWeight: '500', color: iconColors.green2 }}>1 </Text>
            <Ionicons name="people" size={20} color={iconColors.green2} />
          </View>
        </View>
      </View>

      {/* Comment Bottom Sheet */}
      <CommentsActionSheet
        isPostAuthor={isPostAuthor}
        commentRefAS={commentAS}
        // commentsData={comments}
        onSubmitComment={handleCommentSubmit}
        accountId={dataAccount.id}
        onDelete={handleDeleteComment}
        onReport={handleReportComment}
        postId={item.id}
        type={"tour"}
      />

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
      <RatingCommentsActionSheet
        isPostAuthor={isPostAuthor}
        commentRefAS={ratingCommentAS}
        commentsData={ratingComments}
        onSubmitRatingComment={handleRatingCommentSubmit}
        accountId={dataAccount.id}
        onDelete={handleDeleteRatingComment}
        onReport={handleReportComment}
        bannedWords={bannedWords}
        postId={item.id}
      />
    </View>
  );
};

export default function ToursScreen() {
  // State to track whether full description is shown
  const { areasByProvinceName }: any = useAdminProvider();


  const { selectedTour }: any = useTourProvider();
  const { initialIndex, tourId } = useLocalSearchParams();

  const initialPage = parseInt(initialIndex as string, 10) ? parseInt(initialIndex as string, 10) : 0;
  const [isScrollEnabled, setIsScrollEnabled] = useState(true);
  const [dataTour, setDataTour] = useState<any>([])
  const [dataLocations, setDataLoctions] = useState<any>([])


  const memoriedTourItem = useMemo(() => selectedTour, [selectedTour]);

  const fetchTourById = async (tourId: any) => {
    try {
      const refTour = ref(database, `tours/${tourId}`)
      const refScore = ref(database, `tours/${tourId}/scores`);

      // Cập nhật scores trước
      await runTransaction(refScore, (currentScore) => {
        return (currentScore || 0) + 1;
      });

      const snapshot = await get(refTour);
      if (snapshot.exists()) {
        const dataTourJson: any = snapshot.val()

        const dataLocations = dataTourJson.locations
        setDataLoctions(flattenLocations(dataLocations))
        setDataTour([dataTourJson])
      } else {
        console.log("No data tour available");
      }
    } catch (error) {
      console.error("Error fetching data tour: ", error);
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
    // Kiểm tra khi màn hình focus và cả 2 biến đều có dữ liệu
    if (tourId) {
      fetchTourById(tourId)
    }
  }, [tourId])

  useEffect(() => {
    if (dataLocations.length === 0) return
    updateScoresForCities()
  }, [dataLocations])
  return (
    <>
      <StatusBar
        barStyle={"dark-content"}
        // hidden={true}
        translucent={false}
        backgroundColor="white"
      />
      <FlatList
        data={tourId ? dataTour : memoriedTourItem}
        renderItem={({ item }) => (
          <TourItem
            item={item}
            setIsScrollEnabled={setIsScrollEnabled}
          />
        )}
        keyExtractor={(item, index) => index.toString()}
        style={styles.container}
        scrollEnabled={isScrollEnabled}
        //   initialScrollIndex={initialPage}
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
  buttonLike: {
    top: 30,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 15,
    paddingHorizontal: 20,
    // height: 50,
    overflow: 'hidden'
  },
  textTitle: {
    fontSize: 26,
    fontWeight: '600',
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
  priceLabel: {
    fontSize: 20,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 50,
    paddingHorizontal: 10
  },
  priceWrap: {
    flexDirection: 'row',
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    height: 50,
    width: 150,
  },
  priceBackground: {
    position: 'absolute',
    backgroundColor: 'red',
    paddingLeft: 6,
    borderRadius: 10,
    bottom: 0,
    left: 220,
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
  ratingValue: {
    fontWeight: "bold",
    fontSize: 18
  },
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
    // marginRight: 10,
    // marginTop: 1,
    fontSize: 18,
    fontWeight: "500",
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
    alignSelf: 'center',
    justifyContent: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
  },

  buttonComment: {
    padding: 0
  },
  buttonSave: {
    // padding: 20
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
  buttonRow: {
    position: 'absolute',
    bottom: 0,
    flexDirection: "row",
    width: '100%',
    justifyContent: 'space-between',
    paddingHorizontal: 20
  },
  viewTextStyles: {
    // position: "absolute",
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 10,
    borderRadius: 20,
  },
  container: {
    flex: 1,
    width: "100%",
    backgroundColor: backgroundColors.background1
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  posts: {
    width: windowWidth,
    height: windowWidth,
  },
});
