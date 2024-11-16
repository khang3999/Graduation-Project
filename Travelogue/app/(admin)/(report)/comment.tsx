
import UnlockBtn from '@/components/buttons/UnlockBtn';
import { AntDesign, Feather } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { set, ref, database, onValue } from "@/firebase/firebaseConfig";
import { push, remove, update,get } from '@firebase/database';
import { usePost } from '@/contexts/PostProvider';
import { router } from 'expo-router';
import { useTourProvider } from '@/contexts/TourProvider';



export default function CommentReport() {
  const [dataCommentReport, setDataCommentReport] = useState([]);
  const keyResolve = 2;
  const [factorReport, setFactorReport] = useState(0);
  const { selectedPost, setSelectedPost }: any = usePost()
  const { selectedTour, setSelectedTour }: any = useTourProvider()


  //Du lieu Comment
  useEffect(() => {
    // Lắng nghe dữ liệu từ Firebase Realtime Database theo thời gian thực
    const onValueChange = ref(database, 'reports/comment');
    // Lắng nghe thay đổi trong dữ liệu
    const comment = onValue(onValueChange, (snapshot) => {
      if (snapshot.exists()) {
        const jsonData = snapshot.val();
        const jsonDataArr: any = Object.values(jsonData)
        // Lọc các bài có status != 2, da xu ly
        const filteredData = jsonDataArr.filter((comment: any) => (comment.status != keyResolve) && (Object.keys(comment.reason).length >= factorReport));
        setDataCommentReport(filteredData);
      } else {
        console.log("No data available");
      }
    }, (error) => {
      console.error("Error fetching data:", error);
    });
    // Cleanup function để hủy listener khi component unmount
    return () => comment();
  }, [factorReport]);

  //Du lieu factor 
  useEffect(() => {
    // Lắng nghe dữ liệu từ Firebase Realtime Database theo thời gian thực
    const onValueChange = ref(database, 'factors/report/comment');
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


  // Hàm gỡ lock cho comment
  const unlockComment = (commentID: string, postId: string, type:string) => {
    const refRemove = ref(database, `reports/comment/${[commentID]}`)
    const refComment = ref(database, `${type}s/${[postId]}/comments/${[commentID]}`)
    Alert.alert(
      "Unlock comment",
      "Are you sure you want to unlock this comment?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "OK", onPress: () => {
            // Xoa khoi bang report
            remove(refRemove).then(() => {
              console.log('Data remove successfully');
            })
              .catch((error) => {
                console.error('Error removing data: ', error);
              }); // Xóa từ khỏi Realtime Database
            //Cap nhat report cho comment sau khi unlock
            update(refComment, { reports: 0 })
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
  // Hàm hidden comment
  const hiddenComment = (commentId: string, postId: string, type:string) => {
    const refComment = ref(database, `${type}s/${[postId]}/comments/${[commentId]}`)
    const refReport = ref(database, `reports/comment/${[commentId]}`)
    Alert.alert(
      "Hidden comment",
      "Are you sure you want to hidden this comment?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "OK", onPress: () => {
            //Cap nhat status cho comment thanh hidden
            update(refComment, { status_id: 3 })
              .then(() => {
                console.log('Data updated successfully!');
              })
              .catch((error) => {
                console.error('Error updating data:', error);
              });
            //Cap nhat status cho report da xu ly
            update(refReport, { status_id : keyResolve })
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
   const fetchPostByPostId = async (postId: any, type:any) => {
    try {
      const refPost = ref(database, `${type}s/${postId}`);
      const snapshot = await get(refPost);
      if (snapshot.exists()) {
        const dataJson = snapshot.val();
       console.log(dataJson);
       type==="post"?setSelectedPost([dataJson]):setSelectedTour([dataJson])
      } else {
        console.log("No data city available");
      }
    } catch (error) {
      console.error("Error fetching data: ", error);
    }

  };

  //Chuyen sang post detail
  const handleNavigatePostDetail = (post: any, type:any) => {
    fetchPostByPostId(post,type)
    if (type==="tour") {
      router.push({
        pathname: '/tourDetail'
      })
    }
    else if (type==="post") {
      router.push({
        pathname: '/postDetail'
      })
    }
    

  }

  // Render từng item trong danh sách
  const renderCommentItem = (comment: any) => {
    return (
      <TouchableOpacity style={styles.accountItem} onPress={
        () => handleNavigatePostDetail(comment.item.post_id, comment.item.type)
      }>
        <View>

          <Text style={styles.name}>{comment.item.comment_id}</Text>
          {Object.values(comment.item.reason).map((reason: any) => {
            return (
              <Text style={styles.reason}>- {reason}</Text>
            )
          })}

        </View>
        <View style={{ flexDirection: 'row' }}>
          <AntDesign name="unlock" size={26} color='#3366CC' onPress={() => unlockComment(comment.item.comment_id, comment.item.post_id, comment.item.type)} />
          <Feather name="x-square" size={26} style={{ marginLeft: 25, color: 'red' }} onPress={() => hiddenComment(comment.item.id, comment.item.post_id, comment.item.type)} />
        </View>

      </TouchableOpacity>
    )
  };

  return (
    <View style={styles.container}>

      {dataCommentReport.length > 0 ? (
        <FlatList
          data={dataCommentReport}
          renderItem={renderCommentItem}
        />
      ) : (
        <Text style={styles.noAccountsText}>No comment</Text>
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
