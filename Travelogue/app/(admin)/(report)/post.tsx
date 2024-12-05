
import UnlockBtn from '@/components/buttons/UnlockBtn';
import { AntDesign, Feather } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { set, ref, database, onValue } from "@/firebase/firebaseConfig";
import { push, remove, update, get } from '@firebase/database';
import { router } from 'expo-router';
import { useAdminProvider } from '@/contexts/AdminProvider';
import { usePost } from '@/contexts/PostProvider';
import { useTourProvider } from '@/contexts/TourProvider';

export default function PostReport() {
  const [dataPostReport, setDataPostReport] = useState([]);
  const keyResolve = 2
  const [factorReport, setFactorReport] = useState(0);
  const { selectedPost, setSelectedPost }: any = usePost()
  const { imagesReport, setImagesReport }: any = useAdminProvider()


  //Du lieu post
  useEffect(() => {
    // Lắng nghe dữ liệu từ Firebase Realtime Database theo thời gian thực
    const onValueChange = ref(database, 'reports/post');
    // Lắng nghe thay đổi trong dữ liệu
    const post = onValue(onValueChange, (snapshot) => {
      if (snapshot.exists()) {
        const jsonData = snapshot.val();
        const jsonDataArr: any = Object.values(jsonData)

        // Lọc các bài có status != 2, da xu ly
        const filteredData = jsonDataArr.filter((post: any) => (post.status_id != keyResolve) && (Object.keys(post.reason).length >= factorReport));

        setDataPostReport(filteredData);
      } else {
        console.log("No data available");
      }
    }, (error) => {
      console.error("Error fetching data:", error);
    });

    // Cleanup function để hủy listener khi component unmount
    return () => post();
  }, [factorReport]);
  //Du lieu factor 
  useEffect(() => {
    // Lắng nghe dữ liệu từ Firebase Realtime Database theo thời gian thực
    const onValueChange = ref(database, 'factors/report/post');
    // Lắng nghe thay đổi trong dữ liệu
    const factor = onValue(onValueChange, (snapshot) => {
      if (snapshot.exists()) {
        const jsonData = snapshot.val();
        console.log(jsonData);

        setFactorReport(jsonData)
      } else {
        console.log("No data available");
      }
    }, (error) => {
      console.error("Error fetching data:", error);
    });

    // Cleanup function để hủy listener khi component unmount
    return () => factor();
  }, []);

  // Hàm gỡ lock cho post
  const unreportPost = (postId: string, type: string) => {
    const refRemove = ref(database, `reports/post/${[postId]}`)
    const refPost = ref(database, `${type}s/${[postId]}`)
    Alert.alert(
      "Gỡ báo cáo",
      "Bạn chắc chắn muốn gỡ báo cáo cho bài viết này?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "OK", onPress: () => {
            // Xoa khoi bang report
            remove(refRemove).then(() => {
              console.log('Data remove successfully');
            })
              .catch((error) => {
                console.error('Error removing data: ', error);
              }); // Xóa từ khỏi Realtime Database

          }
        }
      ]
    );
  };
  // Hàm hidden post
  const hiddenPost = (postId: string, type: string) => {
    const refPost = ref(database, `${type}s/${[postId]}`)
    const refReport = ref(database, `reports/post/${[postId]}`)
    Alert.alert(
      "Ẩn bài viết",
      "Bạn chắc chắc muốn ẩn bài viết bị vi phạm?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "OK", onPress: () => {
            //Cap nhat status cho post thanh hidden
            update(refPost, { status_id: 3 })
              .then(() => {
                console.log('Data updated successfully!');
              })
              .catch((error) => {
                console.error('Error updating data:', error);
              });
            //Cap nhat status cho report da xu ly
            update(refReport, { status_id: keyResolve })
              .then(() => {
                console.log('Data updated successfully!');
              })
              .catch((error) => {
                console.error('Error updating data:', error);
              });
          }
        }
      ]
    );
  };

  // Fetch post by postID
  // const fetchPostByPostId = async (postId: any, type: any) => {
  //   try {
  //     const refPost = ref(database, `${type}s/${postId}`);
  //     const snapshot = await get(refPost);
  //     if (snapshot.exists()) {
  //       const dataJson = snapshot.val();
  //       console.log(dataJson);
  //       type === "post" ? setSelectedPost([dataJson]) : setSelectedTour([dataJson])
  //     } else {
  //       console.log("No data city available");
  //     }
  //   } catch (error) {
  //     console.error("Error fetching data: ", error);
  //   }

  // };

  //Chuyen sang post detail
  const handleNavigatePostDetail = (post: any) => {
    setImagesReport(Object.values(post.images).flat())
    router.push({
      pathname: '/imageReport',

    })

  }

  // Render từng item trong danh sách
  const renderPostItem = (post: any) => {

    return (
      <TouchableOpacity key={post.item.id} style={styles.accountItem} onPress={
        () => handleNavigatePostDetail(post.item)
      }>
        <View style={{width:240}}>
          <Text style={styles.name}>{post.item.post_id}</Text>
          {Object.values(post.item.reason).map((reason: any) => {
            return (
              <Text style={styles.reason}>- {reason}</Text>
            )
          })}

        </View>
        <View style={{ flexDirection: 'row' }}>
          <AntDesign name="lock" size={26} color='#3366CC' style={{ bottom: 0 }} onPress={() => hiddenPost(post.item.post_id, post.item.type)} />
          <Feather name="x-square" size={26} style={{ marginLeft: 25, color: 'red', bottom: -1 }} onPress={() => unreportPost(post.item.post_id, post.item.type)} />
        </View>

      </TouchableOpacity>
    )
  };

  return (

    <View style={styles.container}>
      {
        (dataPostReport.length > 0) ? (
          <FlatList
            data={dataPostReport}
            renderItem={renderPostItem}
          />

        ) : (
          <Text style={styles.noAccountsText}>No post</Text>
        )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f2f2f2',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  accountItem: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 10,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
  },
  reason: {
    padding: 5,
    fontSize: 14,
    color: '#555',
  },
  unblockButton: {
    backgroundColor: '#2986cc',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  blockButton: {
    backgroundColor: '#ff5c5c',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  noAccountsText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 20,
    color: '#777',
  },
});
