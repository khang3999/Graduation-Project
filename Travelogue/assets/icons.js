import { AntDesign, Entypo, FontAwesome, FontAwesome5, Fontisto, MaterialCommunityIcons } from "@expo/vector-icons";
import { iconColors } from "./colors";
export const icons = {
    index: (props) => <AntDesign name="home" size={26} color="black" {...props} />,
    // index: (props) => <Entypo name="home" size={26} color="black" {...props} />,
    // tour: (props) => <Entypo name="compass" size={26} color="black" {...props} />,
    tour: (props) => <Fontisto name="bus-ticket" size={26} color="black" {...props} />,
    '(maps)': (props) => < Fontisto name="map" size={24} color="black" {...props} />,
    '(profiles)': (props) => <FontAwesome5 name="user" size={24} color="black" {...props} />,
    'payment': (props) => <FontAwesome name="credit-card" size={26} color="black" {...props} />,
    'checkInMap': (props) => <FontAwesome5 name="map-marked-alt" size={20} color={iconColors.green1} {...props} />,
    'realMap': (props) => <MaterialCommunityIcons name="map-marker-distance" size={22} color="black" {...props} />
}