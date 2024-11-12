import { database, onValue } from '@/firebase/firebaseConfig';
import { MaterialIcons } from '@expo/vector-icons';
import { push, ref, set, update, get } from 'firebase/database';
import React, { useEffect, useState } from 'react'
import { View, Button, Text, Modal, FlatList, TouchableOpacity, StyleSheet } from 'react-native';


const TestReport = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedReason, setSelectedReason] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [reasonsPost, setReasonsPost] = useState([])
  const [dataReason, setDataReason] = useState([])
  const [typeReport, setTypeReport] = useState('')
  const [idPost, setIdPost] = useState('post2')
  const [idComment, setIdComment] = useState('cm1')
  const [reasonsComment, setReasonsComment] = useState([])

  // Reason post
  useEffect(() => {
    // Lắng nghe dữ liệu từ Firebase Realtime Database theo thời gian thực
    const onValueChange = ref(database, 'reasons/post/');
    // Lắng nghe thay đổi trong dữ liệu
    const reason = onValue(onValueChange, (snapshot) => {
      if (snapshot.exists()) {
        const jsonData = snapshot.val();
        // Chuyển đổi object thành array
        const dataArray: any = Object.entries(jsonData).map(([key, value]) => ({
          id: key,
          name: value,
        }));
        setReasonsPost(dataArray);
      } else {
        console.log("No data available");
      }
    }, (error) => {
      console.error("Error fetching data:", error);
    });

    // Cleanup function để hủy listener khi component unmount
    return () => reason();
  }, []);
  // Reason comment
  useEffect(() => {
    // Lắng nghe dữ liệu từ Firebase Realtime Database theo thời gian thực
    const onValueChange = ref(database, 'reasons/comment/');
    // Lắng nghe thay đổi trong dữ liệu
    const reason = onValue(onValueChange, (snapshot) => {
      if (snapshot.exists()) {
        const jsonData = snapshot.val();
        // Chuyển đổi object thành array
        const dataArray: any = Object.entries(jsonData).map(([key, value]) => ({
          id: key,
          name: value,
        }));
        setReasonsComment(dataArray);
      } else {
        console.log("No data available");
      }
    }, (error) => {
      console.error("Error fetching data:", error);
    });

    // Cleanup function để hủy listener khi component unmount
    return () => reason();
  }, []);

  const handleReport = (reason: any) => {
    setSelectedReason(reason);
    setModalVisible(false);
    setShowConfirmation(true);
    setTimeout(() => {
      setShowConfirmation(false);
    }, 3000);
    if (typeReport==="post") {
      reportPost(reason)
    }
    else{
      reportComment(reason)
    }
  };

  //Update report
  const reportComment = async (reason:any) => {
    let item: any = {
      reason:{

      }
    }
    const reportRef = ref(database, `reports/comment/${idComment}`);
    // Tạo key tu dong cua firebase
    const newItemKey = push(ref(database, `reports/comment/${idComment}/reason/`));
    const snapshot = await get(reportRef);
    if (snapshot.exists()) {
      item = snapshot.val();

    }
    const reasonKey = newItemKey.key as string;
    const itemNew = {
      id: idComment,
      post_id: idPost,
      reason: {
        ...item.reason,
        [reasonKey] : reason
      },
      status: 1
    }
    await update(reportRef, itemNew)
      .then(() => {
        console.log('Data added successfully');
      })
      .catch((error) => {
        console.error('Error adding data: ', error);
      });

  };
  //Update report
  const reportPost = async (reason:any) => {
    let item: any = {
      reason:{

      }
    }
    const reportRef = ref(database, `reports/post/${idPost}`);
    // Tạo key tu dong cua firebase
    const newItemKey = push(ref(database, `reports/post/${idPost}/reason/`));
    const snapshot = await get(reportRef);
    if (snapshot.exists()) {
      item = snapshot.val();

    }
    const reasonKey = newItemKey.key as string;
    const itemNew = {
      post_id: idPost,
      reason: {
        ...item.reason,
        [reasonKey] : reason
      },
      status: 1
    }
    await update(reportRef, itemNew)
      .then(() => {
        console.log('Data added successfully');
      })
      .catch((error) => {
        console.error('Error adding data: ', error);
      });

  };


  const handlePressReport = (type: any) => {
    setModalVisible(true)
    if (type === "post") {
      setDataReason(reasonsPost)
      setTypeReport("post")
    }
    else if (type === "comment") {
      setDataReason(reasonsComment)
      setTypeReport("comment")
    }
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => handlePressReport("post")}
      >
        <Text>Post</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handlePressReport("comment")}
      >
        <Text>Comment</Text>
      </TouchableOpacity>

      {/* Modal for report reasons */}
      <Modal
        transparent={true}
        animationType="slide"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select a reason for report</Text>
            <FlatList
              data={dataReason}
              // keyExtractor={(item) => item.id}
              renderItem={(item: any) => (
                <TouchableOpacity
                  style={styles.reasonItem}
                  onPress={() => handleReport(item.item.name)}
                >
                  <Text style={styles.reasonText}>{item.item.name}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <MaterialIcons name="cancel" size={24} color="red" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Confirmation message */}
      {showConfirmation && (
        <View style={styles.confirmationBox}>
          <Text style={styles.confirmationText}>Your report has been submitted!</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
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
    padding: 10,
    borderRadius: 5,
  },
  confirmationText: {
    color: 'white',
    fontSize: 16,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
});

export default TestReport