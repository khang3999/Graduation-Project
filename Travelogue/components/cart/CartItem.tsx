import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

const CartItem = ({ title, onPress }: { title: string; onPress: () => void }) => {
  return (
    <TouchableOpacity style={styles.cartItem} onPress={onPress}>
      <Text style={styles.cartItemText}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cartItem: {
    width: "100%",
    minHeight: 80,
    backgroundColor: "#fff",
    padding: 20,
    marginBottom: 15,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    justifyContent: "center", 
    alignItems: "center",
  },
  cartItemText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
});

export default CartItem;
