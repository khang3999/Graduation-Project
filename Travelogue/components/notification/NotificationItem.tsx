import { View, Text, Image, StyleSheet, ImageSourcePropType } from "react-native";
import React from "react";

interface NotificationItemProps {
  title: string;
  image: ImageSourcePropType;
  time: string;
}

export default function NotificationItem({ title, image, time }: NotificationItemProps) {
  return (
    <View style={styles.row}>
      <Image
        style={styles.avatar}
        source={image}
      />
      <View style={styles.column}>
        <Text style={styles.notificationText} numberOfLines={3} ellipsizeMode="tail">
          {title}
        </Text>
        <Text style={styles.timeText}>{time}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 30,
  },
  row: {
    flexDirection: "row",    
    marginHorizontal: 10,
    marginVertical: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    resizeMode: "contain",
    borderColor: "grey",
    borderWidth: 2,
    borderRadius: 100,
    marginLeft: 10,
  },
  column: {
    flexDirection: "column",
    marginTop: 15,
  },
  notificationText: {
    fontWeight: "normal",
    fontSize: 16,
    justifyContent: "flex-start",
    marginHorizontal: 10,
    color: "#333",
  },
  timeText: {
    marginHorizontal: 10,
    color: "#999",
    marginTop: 5,

  },
  username: {
    fontWeight: "bold",
    fontSize: 18,
    padding: 10,
    marginLeft: 10,
  },
  button: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 1,
    paddingHorizontal: 32,
    borderRadius: 6,
    elevation: 2,
    backgroundColor: "#CDCDCD",
    marginHorizontal: 15,
  },
  editText: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "bold",
    letterSpacing: 0.25,
    color: "#2C2C2C",
  },
});
