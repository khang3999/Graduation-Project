import { router } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, Dimensions, FlatList, TouchableOpacity, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign';


interface ImageItem {
  id: string;
  uri: string;
  isTour?: boolean; // Flag to indicate if the image is from
  height: number; // Randomized height for the image
  isDefault?: boolean;
}

// Screen or parent container width
const GALLERY_WIDTH = 346.7;
const NUM_COLUMNS = 3;

// Calculate the width of each column
const COLUMN_WIDTH = GALLERY_WIDTH / NUM_COLUMNS - 8;

// Generate random heights for images
const generateRandomHeight = () => Math.floor(Math.random() * 100) + 150; // Heights between 150 and 250


// Split images into columns
const splitImagesIntoColumns = (data: ImageItem[], numColumns: number) => {
  const columns: ImageItem[][] = Array.from({ length: numColumns }, () => []);
  data.forEach((item: ImageItem, index: number) => {
    columns[index % numColumns].push(item);
  });
  return columns;
};

// Function to extract image data in the required format
const extractImagesData = (postImages: any, defaultImages: string[]) => {
  const images: any[] = [];

  // Check if postImages exists
  if (postImages) {

    // // Extract images from tours
    if (postImages.tours) {
      Object.values(postImages.tours).forEach((tour: any) => {
        if (tour.images) {
          tour.images.forEach((image: string) => {
            images.push({
              id: tour.idPost,
              uri: image,
              isTour: true,
              height: generateRandomHeight(),
            });
          });
        }
      });
    }
    // Extract images from posts
    if (postImages.posts) {
      Object.values(postImages.posts).forEach((post: any) => {
        if (post.images) {
          post.images.forEach((image: string) => {
            images.push({
              id: post.idPost,
              uri: image,
              height: generateRandomHeight(),
            });
          });
        }
      });
    }

  }

  // If no postImages exist, fallback to defaultImages
  if (images.length === 0) {
    defaultImages.forEach((uri, index) => {
      images.push({
        id: `default-${index}`,
        uri,
        height: generateRandomHeight(),
        isDefault: true,
      });
    });
  }

  return images;
};


export default function GalleryPosts({ dataCity }: any) {
  if (!dataCity.postImages || dataCity.postImages.length === 0) {
    return (
      <View>
        <Text >No posts yet</Text>
      </View>
    );
  }
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const images = extractImagesData(dataCity.postImages, dataCity.defaultImages);
  // Distribute images across columns
  const columns = splitImagesIntoColumns(images, NUM_COLUMNS);

  const openModal = (imageUri: string) => {
    setSelectedImage(imageUri);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedImage(null);
  };
  

  

  // Render a FlatList to handle scrolling and rendering
  return (
  <>
    <FlatList
      data={columns}
      keyExtractor={(_, index) => `column-${index}`}
      contentContainerStyle={styles.galleryContainer}
      horizontal={false}
      renderItem={({ item: column, index: columnIndex }) => (
        <View style={styles.column} key={columnIndex}>
          {column.map((image) => (
            <View
              key={image.id}
              style={[styles.imageContainer, { height: image.height }]}
            >
              <TouchableOpacity
                key={image.id}
                onPress={() => {
                  const isTour = image.isTour ? true : false;
                  const isDefault = image.isDefault ? true : false;
                  if (isDefault) {
                    openModal(image.uri)
                    return;
                  }

                  if (isTour) {
                    router.push({
                      pathname: "/tourDetail",
                      params: { tourId: image.id },
                    });
                    console.log("Tour", column);
                  } else {
                    router.push({
                      pathname: "/postDetail",
                      params: { postId: image.id },
                    });
                  }

                }}
              >
                <Image source={{ uri: image.uri }} style={styles.image} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    />
     {/* Image Viewer Modal */}
     <Modal visible={modalVisible} transparent={true} animationType="fade">
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
            <Icon name="closecircleo" size={25} ></Icon>
          </TouchableOpacity>
          {selectedImage && (
            <Image source={{ uri: selectedImage }} style={styles.fullImage} />
          )}
        </View>
      </Modal>
  </>
  );
};

const styles = StyleSheet.create({
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
  closeText: {
    color: 'rgba(0, 0, 0, 0.9)',
    fontSize: 18,
    fontWeight: "bold",
  },
  galleryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  column: {
    width: COLUMN_WIDTH,
  },
  imageContainer: {
    width: '100%',
    marginBottom: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    // resizeMode: 'cover',
  },
});