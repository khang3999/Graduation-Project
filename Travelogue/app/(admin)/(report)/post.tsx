
import UnlockBtn from '@/components/buttons/UnlockBtn';
import { AntDesign, Feather } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { set, ref, database, onValue } from "@/firebase/firebaseConfig";
import { push, remove, update } from '@firebase/database';


export default function PostReport() {
  const [dataPostReport, setDataPostReport] = useState([]);
  const keyResolve = 2
  const [factorReport,setFactorReport] = useState(0);
  //Du lieu post
  useEffect(() => {
    // Lắng nghe dữ liệu từ Firebase Realtime Database theo thời gian thực
    const onValueChange = ref(database, 'reports/post');
    // Lắng nghe thay đổi trong dữ liệu
    const post = onValue(onValueChange, (snapshot) => {
      if (snapshot.exists()) {
        const jsonData = snapshot.val();
        const jsonDataArr: any = Object.values(jsonData)
        console.log(jsonDataArr);
        
       // Lọc các bài có status != 2, da xu ly
       const filteredData = jsonDataArr.filter((post: any) => (post.status != keyResolve)&&(Object.keys(post.reason).length >= factorReport));
       
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
  const unlockPost = (postId: string) => {
    const refRemove = ref(database, `reports/post/${[postId]}`)
    const refPost = ref(database, `posts/${[postId]}`)
    Alert.alert(
      "Unlock post",
      "Are you sure you want to unlock this post?",
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
            //Cap nhat report cho post sau khi unlock
            update(refPost, { reports: 0 })
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
  // Hàm hidden post
  const hiddenPost = (postId: string) => {
    const refPost = ref(database, `posts/${[postId]}`)
    const refReport = ref(database, `reports/post/${[postId]}`)
    Alert.alert(
      "Hidden post",
      "Are you sure you want to hidden this post?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "OK", onPress: () => {
            //Cap nhat status cho post thanh hidden
            update(refPost, { status: 3 })
              .then(() => {
                console.log('Data updated successfully!');
              })
              .catch((error) => {
                console.error('Error updating data:', error);
              });
            //Cap nhat status cho report da xu ly
            update(refReport, { status: keyResolve })
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

  // Render từng item trong danh sách
  const renderPostItem = (post: any) => {
    
    return (
      <View key={post.item.id} style={styles.accountItem}>
        <View>
          <Text style={styles.name}>{post.item.post_id}</Text>
          {Object.values(post.item.reason).map((reason: any) => {
            return (
              <Text style={styles.reason}>- {reason}</Text>
            )
          })}
        
        </View>
        <View style={{ flexDirection: 'row' }}>
          <AntDesign name="unlock" size={30} color='#3366CC' style={{ bottom: 0 }} onPress={() => unlockPost(post.item.id)} />
          <Feather name="x-square" size={30} style={{ marginLeft: 25, color: 'red', bottom: -1 }} onPress={() => hiddenPost(post.item.id)} />
        </View>

      </View>
    )
  };
  
  return (
    
    <View style={styles.container}>      
      {
      (dataPostReport.length>0)? (
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
