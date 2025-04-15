import { router } from "expo-router";
import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Modal,
} from "react-native";
import Icon from "react-native-vector-icons/AntDesign";

interface ImageItem {
  id: string;
  uri: string;
  isTour?: boolean;
  height: number;
  isDefault?: boolean;
  name: string;
  avatar: string;
}

const SCREEN_WIDTH = Dimensions.get("window").width;
const GALLERY_PADDING = 5;
const NUM_COLUMNS = 3;
const COLUMN_GAP = 8;
const GALLERY_WIDTH = SCREEN_WIDTH - GALLERY_PADDING * 10;
// Tính lại chiều rộng mỗi cột
const COLUMN_WIDTH =
  (GALLERY_WIDTH - COLUMN_GAP * (NUM_COLUMNS - 1)) / NUM_COLUMNS;
// Sử dụng kích thước cố định cho mỗi hình ảnh (ví dụ: hình vuông 150x150)
const IMAGE_SIZE = 160;

const splitImagesIntoColumns = (data: ImageItem[], numColumns: number) => {
  const columns: ImageItem[][] = Array.from({ length: numColumns }, () => []);
  data.forEach((item: ImageItem, index: number) => {
    columns[index % numColumns].push(item);
  });
  return columns;
};

const extractImagesData = (postImages: any, defaultImages: string[]) => {
  const images: ImageItem[] = [];
  // Sử dụng kích thước cố định cho height
  let height = IMAGE_SIZE;

  if (postImages) {
    if (postImages.tours) {
      Object.values(postImages.tours).forEach((tour: any) => {
        if (tour.images && tour.images.length > 0) {
          images.push({
            id: tour.idPost,
            name: tour.name,
            avatar: tour.avatar,
            uri: tour.images[0],
            height,
            isTour: true,
          });
        }
      });
    }
    if (postImages.posts) {
      Object.values(postImages.posts).forEach((post: any) => {
        if (post.images && post.images.length > 0) {
          images.push({
            id: post.idPost,
            name: post.name,
            avatar: post.avatar,
            uri: post.images[0],
            height,
          });
        }
      });
    }
  }

  if (images.length === 0) {
    defaultImages.forEach((uri, index) => {
      images.push({
        id: `default-${index}`,
        uri,
        height,
        isDefault: true,
        name: "",
        avatar: "",
      });
    });
  }
  return images;
};

export default function GalleryPosts({ dataCity }: any) {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  let images: ImageItem[] = [];
  if (dataCity.postImages || dataCity.defaultImages) {
    images = extractImagesData(dataCity.postImages, dataCity.defaultImages);
  }
  const columns = splitImagesIntoColumns(images, NUM_COLUMNS);

  const openModal = (imageUri: string) => {
    setSelectedImage(imageUri);
    setModalVisible(true);
  };

  const closeModal = () => {
    setSelectedImage(null);
    setModalVisible(false);
  };

  return (
    <>
      <ScrollView contentContainerStyle={styles.galleryContainer}>
        <View style={styles.columnsWrapper}>
          {columns.map((column, columnIndex) => (
            <View style={styles.column} key={columnIndex}>
              {column.map((image) => (
                <View
                  key={image.id}
                  style={[
                    styles.imageContainer,
                    { height: image.height, width: COLUMN_WIDTH },
                  ]}
                >
                  <TouchableOpacity
                    onPress={() => {
                      if (image.isDefault) {
                        openModal(image.uri);
                      } else if (image.isTour) {
                        router.push({
                          pathname: "/tourDetail",
                          params: { tourId: image.id },
                        });
                      } else {
                        router.push({
                          pathname: "/postDetail",
                          params: { postId: image.id },
                        });
                      }
                    }}
                  >
                    {!image.isDefault && (
                      <View style={styles.imageWrapper}>
                        <Image
                          source={{ uri: image.uri }}
                          style={styles.image}
                        />
                        <View style={styles.overlay}>
                          <Image
                            source={{ uri: image.avatar }}
                            style={styles.avatar}
                          />
                          <Text style={styles.imageText}>{image.name}</Text>
                        </View>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ))}
          {!dataCity.postImages && (
            <View>
              <Text
                style={{
                  fontSize: 15,
                  fontStyle: "italic",
                  color: "red",
                  width: 500,
                  fontWeight: "bold",
                }}
              >
                Chưa có bài viết liên quan đến tỉnh (thành) này.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Modal hiển thị ảnh mặc định */}
      <Modal visible={modalVisible} transparent={true} animationType="fade">
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
            <Icon name="closecircleo" size={25} />
          </TouchableOpacity>
          {selectedImage && (
            <Image source={{ uri: selectedImage }} style={styles.fullImage} />
          )}
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  galleryContainer: {
    paddingHorizontal: GALLERY_PADDING,
    paddingTop: 12,
    paddingBottom: 40,
  },
  columnsWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  column: {
    flex: 1,
    marginRight: COLUMN_GAP,
  },
  imageContainer: {
    marginBottom: 8,
  },
  imageWrapper: {
    position: "relative",
    borderRadius: 8,
    overflow: "hidden",
    width: "100%",
    height: "100%",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  overlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 5,
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  imageText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
    flexWrap: "wrap",
    flex: 1,
  },
  noPostContainer: {
    alignItems: "center",
    paddingTop: 40,
  },
  noPostText: {
    fontSize: 15,
    fontStyle: "italic",
    color: "red",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  fullImage: {
    width: "90%",
    height: "70%",
    resizeMode: "contain",
  },
  closeButton: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 1,
  },
});
