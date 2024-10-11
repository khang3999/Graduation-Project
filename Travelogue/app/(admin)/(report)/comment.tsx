
import UnlockBtn from '@/components/buttons/UnlockBtn';
import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';

// Định nghĩa kiểu dữ liệu cho một tài khoản
interface Comment {
  id: string;
  name: string;
  commentContent: string;
  isBlocked: boolean;
}

// Giả lập danh sách tài khoản bị block
const initialBlockedcomments: Comment[] = [
  { id: '1', name: 'User 1', commentContent: 'Xau qua', isBlocked: true },
  { id: '2', name: 'User 2', commentContent: 'Thay ghe' , isBlocked: false},
  { id: '3', name: 'User 3', commentContent: 'Dung di' , isBlocked: true},
  { id: '4', name: 'User 4', commentContent: 'Cho' , isBlocked: true},
];

export default function AccountManagementScreen() {
  const [comments, setcomments] = useState<Comment[]>(initialBlockedcomments);
  // Hàm gỡ block cho tài khoản
  const unblockcomment= (commentId: string) => {
    Alert.alert(
      "Unblock Account",
      "Are you sure you want to unblock this account?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "OK", onPress: () => {
          setcomments(precomments =>
            precomments.filter(comment => comment.id !== commentId)
          );
         


        }}
      ]
    );
  };

  // Render từng item trong danh sách
  const rendercommentItem = ({ item }: { item: Comment }) => (
    <View style={styles.accountItem}>
      <View>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.commentContent}>{item.commentContent}</Text>
      </View>
      <TouchableOpacity
        style={styles.unblockButton}
        onPress={() => unblockcomment(item.id)}
      >
        <Text style={styles.buttonText}>Unlock</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      
      {comments.length > 0 ? (
        <FlatList
          data={comments}
          keyExtractor={(item) => item.id}
          renderItem={rendercommentItem}
        />
      ) : (
        <Text style={styles.noAccountsText}>No blocked accounts</Text>
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
  commentContent: {
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
