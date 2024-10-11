
import UnlockBtn from '@/components/buttons/UnlockBtn';
import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';

// Định nghĩa kiểu dữ liệu cho một tài khoản
interface Post {
  id: string;
  name: string;
  postContent: string;
  isBlocked: boolean;
}

// Giả lập danh sách tài khoản bị block
const initialBlockedPosts: Post[] = [
  { id: '1', name: 'User 1', postContent: 'Vinh Hy mua he', isBlocked: true },
  { id: '2', name: 'User 2', postContent: 'Nha Trang mat me' , isBlocked: false},
  { id: '3', name: 'User 3', postContent: 'Du lich tu tuc' , isBlocked: true},
  { id: '4', name: 'User 4', postContent: 'Du lich xanh' , isBlocked: true},
];

export default function AccountManagementScreen() {
  const [posts, setPosts] = useState<Post[]>(initialBlockedPosts);
  // Hàm gỡ block cho tài khoản
  const unblockPost= (postId: string) => {
    Alert.alert(
      "Unblock Account",
      "Are you sure you want to unblock this account?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "OK", onPress: () => {
          setPosts(prePosts =>
            prePosts.filter(post => post.id !== postId)
          );
        }}
      ]
    );
  };

  // Render từng item trong danh sách
  const renderPostItem = ({ item }: { item: Post }) => (
    <View style={styles.accountItem}>
      <View>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.postContent}>{item.postContent}</Text>
      </View>
      <TouchableOpacity
        style={styles.unblockButton}
        onPress={() => unblockPost(item.id)}
      >
        <Text style={styles.buttonText}>Unlock</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      
      {posts.length > 0 ? (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={renderPostItem}
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
  postContent: {
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
