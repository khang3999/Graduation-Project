import * as React from "react";
import { View, useWindowDimensions, Text } from "react-native";
import { TabView, SceneMap, TabBar, TabBarProps } from "react-native-tab-view";
import MaterialIcons from "@expo/vector-icons/Ionicons";

const FirstRoute = () => (
  <View style={{ flex: 1, backgroundColor: "#ff4081" }} />
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

export default function TabViewExample() {
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
          color={focused ? 'black' : 'grey'}
        />
      )}
      indicatorStyle={{backgroundColor:'black'}}
      style={{backgroundColor:'white'}} 
    />
  );

  return (
    <View style={{ flex: 2.5 }}>
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
