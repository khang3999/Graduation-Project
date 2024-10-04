import * as React from "react";
import {
  View,
  useWindowDimensions,
  Text,
  Image,
  Dimensions,
  StyleSheet,
  FlatList,
  Pressable,
} from "react-native";
import { TabView, SceneMap, TabBar, TabBarProps } from "react-native-tab-view";
import MaterialIcons from "@expo/vector-icons/Ionicons";

const { width } = Dimensions.get("window");
const itemWidth = width / 3;

const images = [
  { id: "1", uri: "@assets/images/tom.png" },
  { id: "2", uri: "@assets/images/tom.png" },
  { id: "3", uri: "@assets/images/tom.png" },
  { id: "4", uri: "@assets/images/tom.png" },
  { id: "5", uri: "@assets/images/tom.png" },
  { id: "6", uri: "@assets/images/tom.png" },
  { id: "7", uri: "@assets/images/tom.png" },
  { id: "8", uri: "@assets/images/tom.png" },
  { id: "9", uri: "@assets/images/tom.png" },
  { id: "10", uri: "@assets/images/tom.png" },
  { id: "11", uri: "@assets/images/tom.png" },
  { id: "12", uri: "@assets/images/tom.png" },
];

const FirstRoute = () => (
  <FlatList
    style={{ flex: 1 }}
    data={images}
    renderItem={({ item }) => (
      <Pressable onPress={()=>{console.log("Image Clicked");
      }}>
      <Image
        source={require("../../assets/images/tom.png")}
        style={styles.imagesGallery}
      />
      </Pressable>
    )}
    keyExtractor={(item) => item.id}
    numColumns={3}
  />
);

const SecondRoute = () => (
  <View style={{ flex: 1, backgroundColor: "#673ab7" }} />
);

const ThirdRoute = () => <View style={{ flex: 1, backgroundColor: "black" }} />;

const renderScene = SceneMap({
  first: FirstRoute,
  second: SecondRoute,
  third: ThirdRoute,
});

export default function GalleryTabView() {
  const layout = useWindowDimensions();

  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    { key: "first" },
    { key: "second" },
    { key: "third" },
  ]);
  const renderTabBar = (props: TabBarProps<any>) => (
    <TabBar
      {...props}
      renderIcon={({ route, focused, color }) => (
        <MaterialIcons
          name={
            route.key === "first"
              ? "logo-tableau"
              : route.key === "second"
              ? "pricetags-outline"
              : "map-outline"
          }
          size={24}
          color={focused ? "black" : "grey"}
        />
      )}
      indicatorStyle={{ backgroundColor: "black" }}
      style={{ backgroundColor: "#f2f2f2" }}
    />
  );

  return (
    <View style={{ flex: 2.2 }}>
      <TabView
        lazy
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
        renderTabBar={renderTabBar}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  imagesGallery: {
    width: itemWidth,
    height: itemWidth,
    marginTop: 2,
    marginBottom: 0,
    marginRight: 2,
  },
});
