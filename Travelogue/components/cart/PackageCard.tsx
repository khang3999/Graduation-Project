import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { Card } from "react-native-paper";
import RowComponent from "../RowComponent";
import { appColors } from "@/constants/appColors";
import Icon from "react-native-vector-icons/Foundation";

const PackageCard = (props: any) => {
  const {
    packageId,
    name,
    price,
    discount,
    hashtag,
    selectedPackage,
    onSelect,
    disabled,
  } = props;
  const discountedPrice = price - price * (discount / 100);
  const isSelected = selectedPackage === packageId;

  return (
    <Pressable disabled={disabled} onPress={() => onSelect(packageId)}>
      <Card
        style={[
          styles.card,
          isSelected && styles.selectedCard,
          disabled && styles.disableCard,
        ]}
      >
        <Card.Content>
          <Text style={[styles.name, disabled && styles.nameDisabled]}>
            {name}
          </Text>
          {discount > 0 && (
            <Icon
              name="burst-sale"
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                transform: [{ rotate: "45deg" }],
              }}
              size={40}
              color={disabled ? appColors.gray : appColors.primary}
            />
          )}
          <RowComponent>
            <View style={{ minWidth: 100 }}>
              <Text
                style={[
                  styles.originalPrice,
                  discount === 0 && styles.originalPriceNone,
                ]}
              >
                Giá:{" "}
                {new Intl.NumberFormat("vi-VN", {
                  style: "decimal",
                }).format(price || 0)}{" "}
                VND
              </Text>
              <Text
                style={[
                  styles.discountedPrice,
                  disabled && styles.priceDisabled,
                ]}
              >
                {new Intl.NumberFormat("vi-VN", {
                  style: "decimal",
                }).format(discountedPrice || 0)}{" "}
                VND
              </Text>
            </View>
            {/* Bên phải */}
            <View
              style={[
                styles.hashtagRight,
                disabled && styles.hashtagRightDisable,
              ]}
            >
              <Text style={styles.hashtagCount}>{hashtag}</Text>
              <Text style={{ color: appColors.white, margin: 4 }}>HASHTAG</Text>
            </View>
          </RowComponent>
        </Card.Content>
      </Card>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 10,
    padding: 5,
    backgroundColor: "#f8f9fa",
    borderRadius: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
  },
  nameDisabled: {
    color: appColors.gray,
  },
  originalPrice: {
    textDecorationLine: "line-through",
    color: "#888",
  },
  originalPriceNone: {
    textDecorationLine: "none",
    color: "#000",
  },
  discountedPrice: {
    color: "#d9534f",
    fontSize: 16,
    fontWeight: "bold",
  },
  hashtagCount: {
    color: appColors.white,
    marginTop: 5,
    fontSize: 20,
  },
  hashtagRight: {
    borderRadius: 10,
    padding: 2,
    margin: 5,
    backgroundColor: appColors.danger,
    alignItems: "center",
  },
  selectedCard: {
    borderColor: appColors.primary,
    borderWidth: 3,
    padding: 8,
    backgroundColor: appColors.btnDay,
  },
  disableCard: {
    backgroundColor: appColors.gray2,
  },
  hashtagRightDisable: {
    backgroundColor: appColors.gray,
  },
  priceDisabled: {
    color: appColors.gray,
  },
});

export default PackageCard;
