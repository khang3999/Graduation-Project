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

const windowWidth = Dimensions.get("window").width;
type Comment = {
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
  showFullDescription: boolean;
  toggleDescription: () => void;
};


const renderComments = (comments: Comment[], level = 0) => {
  return comments.map((comment, index) => (
    <View
      key={index}
      style={[styles.commentContainer, { marginLeft: level * 20 }]}
    >
      {/* Avatar */}
      <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
        <Image source={comment.accountID.avatar} style={styles.miniAvatar} />
        {/* Username */}
        <View style={{ flexDirection: "column", marginLeft: 10 }}>
          <Text style={styles.commentUsername}>
            {comment.accountID.username}
          </Text>
          {/* Comment Content */}
          <Text style={styles.commentText}>{comment.content}</Text>

          <View style={{ flexDirection: "row" }}>
            {/* Reply Button*/}
            <TouchableOpacity>
              <Text style={styles.replyButton}>Reply</Text>
            </TouchableOpacity>
            {/* Report Button*/}
            <TouchableOpacity>
              <Text style={styles.replyButton}>Report</Text>
            </TouchableOpacity>
          </View>
        </View>
        {/* Comment Time */}
        <Text style={styles.commentTime}>{comment.created_at}</Text>
      </View>

      {/* Nested Children Comments */}
      {comment.children && renderComments(comment.children, level + 1)}
    </View>
  ));
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
  showFullDescription,
  toggleDescription,
}) => {
  const commentModalRef = useRef<Modalize>(null);
  const ratingModalRef = useRef<Modalize>(null);

  const MAX_LENGTH = 100;

  const openCommentModal = () => {
    if (commentModalRef.current) {
      commentModalRef.current.open(); // Safely access the ref
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

  const desc = {
    html: showFullDescription
      ? item.content
      : `${item.content.slice(0, MAX_LENGTH)} ...`,
  };
  return (
    <View>
      {/* Post Header */}
      <View style={styles.row}>
        <View style={styles.row}>
          <Image source={{uri : item.author.avatar}} style={styles.miniAvatar} />
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
            <LikeButton style={styles.buttonItem} />
            <Text style={styles.totalLikes}>{item.likes}</Text>
            <CommentButton
              style={styles.buttonItem}
              onPress={openCommentModal}
            />
          </View>
          <SaveButton style={styles.buttonItem} />
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
        <TouchableOpacity onPress={toggleDescription}>
          <Text>{showFullDescription ? "Show less" : "Show more"}</Text>
        </TouchableOpacity>
      </View>
      <Divider style={styles.divider} bold={true} />
      {/* Comment Bottom Sheet */}
      <Modalize
        ref={commentModalRef}
        modalHeight={600}
        avoidKeyboardLikeIOS={true}
        handlePosition="inside"
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalHeaderText}>
            Comments for {item.author.username}'s post
          </Text>
          {Object.values(item.comments).length > 0 ? (
            renderComments(Object.values(item.comments))
          ) : (
            <Text>No comments yet. Be the first to comment!</Text>
          )}
        </View>
      </Modalize>
      {/* Rating Bottom Sheet */}
      <Modalize
        ref={ratingModalRef}
        modalHeight={500}
        handlePosition="inside"
        avoidKeyboardLikeIOS={true}
      >
        <View style={styles.ratingContainer}>
          <Rating
            showRating
            onFinishRating={(rating:number) => console.log(rating)}
            imageSize={60}
            minValue={1}
            style={{marginBottom:10}}
          />
          <View style={styles.ratingButtonWrapper}>
            <TouchableOpacity style={[styles.ratingButton, { padding: 10 }]}>
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
  const [showFullDescription, setShowFullDescription] = useState(false); 
  const {selectedPost, setSelectedPost} = usePost();
  

  // console.log(postData[0].author.avatar, "avatar 2");
  
  // Function to toggle description
  const toggleDescription = useCallback(() => {
    setShowFullDescription((prev) => !prev);
  }, []);
  const memoriedPostItem = useMemo(() => selectedPost, [selectedPost]);

  return (
    <FlatList
      data={memoriedPostItem}
      renderItem={({ item }) => (
        <PostItem
          item={item}
          showFullDescription={showFullDescription}
          toggleDescription={toggleDescription}
        />
      )}
      keyExtractor={(item, index) => index.toString()}
      style={styles.container}
    ></FlatList>
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
  ratingContainer: { marginTop: 50, paddingVertical: 10, flexDirection:'column' },
  ratingLabel: { fontSize: 16, marginRight: 5, fontWeight: "bold" },
  ratingValue: { marginLeft: 10, fontWeight: "bold", marginTop: 10 },
  ratingButton: {
    flexDirection: "row",},
  ratingButtonWrapper: {
    marginHorizontal: 130,
    marginTop: 30,
    backgroundColor:'red',
    borderRadius:10,
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
  container: {
    flex: 1,
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
});
