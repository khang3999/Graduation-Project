import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  FlatList,
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

const post: Post[] = [
  {
    author: {
      avatar: require("@/assets/images/tom.png"),
      username: "Tran Phuc",
    },
    comments: {
      comment_1: {
        accountID: {
          avatar: require("@/assets/images/trua_he.png"),
          username: "Joker PC",
        },
        comment_status: "active",
        content: "Dep lam",
        reports: 0,
        created_at: "04 August, 2024",
        children: [
          {
            accountID: {
              avatar: require("@/assets/images/jerry.png"),
              username: "Heo PC",
            },
            comment_status: "active",
            content: "Cam on!",
            reports: 0,
            created_at: "04 August, 2024",
          },
        ],
      },
      comment_2: {
        accountID: {
          avatar: require("@/assets/images/tom.png"),
          username: "khang",
        },
        comment_status: "active",
        content: "Dep lam",
        reports: 0,
        created_at: "04 August, 2024",
      },
      comment_3: {
        accountID: {
          avatar: require("@/assets/images/tom.png"),
          username: "Thu",
        },
        comment_status: "active",
        content: "Tam Tam",
        reports: 0,
        created_at: "04 August, 2024",
        children: [
          {
            accountID: {
              avatar: require("@/assets/images/jerry.png"),
              username: "Heo PC",
            },
            comment_status: "active",
            content: "Cam on!",
            reports: 0,
            created_at: "04 August, 2024",
          },
        ],
      },
    },
    content:
      "<h1>HEADER</h1><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit es se cillum dolore eu fugiat nulla pariatur.</p><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur</p>",
    created_at: "04 August, 2024",
    hashtag: "#vietnam #travel #hanoi",
    images: [
      "data:image/png;base64,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",
      "data:image/png;base64,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",
    ],

    likes: 3,
    locations: {
      vietnam: {
        "1": "Hà Nội",
        "2": "Cao Bằng",
      },
    },
    post_status: "active",
    price_id: 1,
    reports: 0,
    view_mode: true,
  },
];

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
          <Image source={item.author.avatar} style={styles.miniAvatar} />
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

  // Function to toggle description
  const toggleDescription = useCallback(() => {
    setShowFullDescription((prev) => !prev);
  }, []);
  const memoriedPostItem = useMemo(() => post, []);

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
