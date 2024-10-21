import { Text, View } from "react-native";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";


const CheckInMap = () => {
  // ZOOM
  const pinch = Gesture.Pinch();
  // MOVE
  const pan = Gesture.Pan();
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* content */}
      <GestureDetector gesture={pan}>
        <GestureDetector gesture={pinch}>
          <Animated.View style={{ width: 500, height: 500, backgroundColor: 'red' }}>
            <Text>
              ádasdasdas
            </Text>
          </Animated.View>
        </GestureDetector>
      </GestureDetector>
    </GestureHandlerRootView>

  )
}

export default CheckInMap