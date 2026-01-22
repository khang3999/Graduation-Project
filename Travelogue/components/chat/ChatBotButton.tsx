import React, { useRef, useEffect } from 'react';
import { TouchableOpacity, StyleSheet, View, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ChatBotButtonProps {
  onPress: () => void;
}

const ChatBotButton: React.FC<ChatBotButtonProps> = ({ onPress }) => {
  // Hiệu ứng gợn sóng
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.6,
            duration: 1200,
            useNativeDriver: true,
            easing: Easing.out(Easing.ease),
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 1200,
            useNativeDriver: true,
            easing: Easing.out(Easing.ease),
          }),
          Animated.timing(opacityAnim, {
            toValue: 0.5,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [scaleAnim, opacityAnim]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.ripple,
          {
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
        ]}
      />
      <TouchableOpacity style={styles.fab} onPress={onPress} activeOpacity={0.8}>
        <Ionicons name="chatbubble-ellipses" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 70,
    right: 24,
    zIndex: 2000,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ripple: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007bff',
    opacity: 0.5,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
});

export default ChatBotButton;
