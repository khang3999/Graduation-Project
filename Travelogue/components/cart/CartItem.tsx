import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from "react-native";
const { width } = Dimensions.get('window')
const pad = 20

const CartItem = ({ onPress, data }: { data: any, onPress: () => void }) => {
  return (
    <TouchableOpacity style={styles.cartItem} onPress={onPress}>
      <Text style={styles.cartItemText}>{data.title}</Text>
      <View style={{ width: "100%", aspectRatio: 1, borderRadius: 10, elevation: 4, alignSelf: 'flex-end' }}>
        <Image
          style={{ width: "100%", aspectRatio: 1, borderRadius: 10 }}
          source={{ uri: data.images[0] || "https://mediatech.vn/assets/images/imgstd.jpg" }}>
        </Image>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cartItem: {
    backgroundColor: "#fff",
    padding: 20,
    width: (width - 3 * pad) / 2,
    borderRadius: 8,
    elevation: 5,
    justifyContent: "space-between",
    alignItems: "center",
  },
  cartItemText: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 10,
    textAlign: 'center'
  },
});

export default CartItem;
