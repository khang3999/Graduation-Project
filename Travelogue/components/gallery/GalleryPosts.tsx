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
  name: string;
  avatar: string;
}

// Screen or parent container width
const GALLERY_WIDTH = 346.7;
const NUM_COLUMNS = 3;

// Calculate the width of each column
const COLUMN_WIDTH = GALLERY_WIDTH / NUM_COLUMNS - 8;


const FIXED_HEIGHTS = [150, 200, 250];


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
  let heightIndex = 0;
  // Check if postImages exists
  if (postImages) {

    // // Extract images from tours
    if (postImages.tours) {
      Object.values(postImages.tours).forEach((tour: any) => {
        if (tour.images && tour.images.length > 0) {
          const image = tour.images[0];
          images.push({
            id: tour.idPost,
            name: tour.name,
            avatar: tour.avatar,
            uri: image,
            height: FIXED_HEIGHTS[heightIndex % FIXED_HEIGHTS.length],
          });
          heightIndex++;

        }
      });
    }
    // Extract images from posts
    if (postImages.posts) {
      Object.values(postImages.posts).forEach((post: any) => {
        if (post.images && post.images.length > 0) {
          const image = post.images[0];
          images.push({
            id: post.idPost,
            name: post.name,
            avatar: post.avatar,
            uri: image,
            height: FIXED_HEIGHTS[heightIndex % FIXED_HEIGHTS.length],
          });
          heightIndex++;
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
        height: FIXED_HEIGHTS[heightIndex % FIXED_HEIGHTS.length],
        isDefault: true,
      });
      heightIndex++;
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
                      console.log('id', image.id);
                    } else {
                      router.push({
                        pathname: "/postDetail",
                        params: { postId: image.id },
                      });
                      console.log('id', image.id);
                      console.log('avatar', image.avatar);
                    }

                  }}
                >
                  {!image.isDefault ? (
                    <View style={styles.imageWrapper}>
                      <Image source={{ uri: image.uri }} style={styles.image} />
                      <View style={styles.overlay}>
                        <Image
                          source={{
                            uri: image.avatar,
                          }}
                          style={styles.avatar}
                        />
                        <Text style={styles.imageText}>{image.name}</Text>
                      </View>
                    </View>
                  ) : (
                    <View style={styles.imageWrapper}>
                      <Image source={{ uri: image.uri }} style={styles.image} />
                    </View>
                  )}
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
  }, imageWrapper: {
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  imageText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    flexWrap: 'wrap',
    flex: 1,
  },
});
