import { View, Text, Image, StyleSheet, Pressable, TextInput ,ScrollView} from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";



export default function EditingProfileScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView >
      <View style={styles.container}>
        <Image
          style={styles.avatar}
          source={require("@/assets/images/tom.png")}
        />
        <Pressable style={styles.editButton}>
          <Text style={styles.editText}>Edit picture or avatar</Text>
        </Pressable>

        <View style={styles.infoContainer}>
        <View style={styles.row}>
            <Text style={styles.infoText}>Name:</Text>
            <TextInput style={styles.username} placeholder="Name"></TextInput>
          </View>
          <View style={styles.row}>
            <Text style={styles.infoText}>Username:</Text>
            <TextInput style={styles.username} placeholder="Username"></TextInput>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.infoText}>Email:</Text>
            <TextInput style={styles.username} placeholder="Email"></TextInput>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.infoText}>Phone:</Text>
            <TextInput style={styles.username} placeholder="0123-455-667"></TextInput>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.infoText}>Address:</Text>
            <TextInput style={styles.username} placeholder="Address"></TextInput>
          </View>
          
          <Pressable style={styles.saveButton} onPress={router.back}>
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </Pressable>
        </View>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  container: {
    alignItems: "center",
    padding: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    resizeMode: "cover",
    borderColor: "#ccc",
    borderWidth: 2,
    borderRadius: 60,
    marginBottom: 20,
  },
  editButton: {
    backgroundColor: "#4949D3",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginBottom: 20,
  },
  editText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  infoContainer: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingBottom: 10,
    marginBottom: 15,
  },
  infoText: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#333",
  },
  username: {
    fontSize: 16,
    color: "#666",
  },
  saveButton: {
    backgroundColor: "#4949D3",
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 20,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
});