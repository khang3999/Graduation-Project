import { AntDesign, Entypo, FontAwesome, FontAwesome5 } from "@expo/vector-icons";

export const icons = {
    index: (props) => <AntDesign name="home" size={26} color="black" {...props} />,
    tour: (props) => <Entypo name="compass" size={26} color="black" {...props} />,
    '(maps)': (props) => <FontAwesome5 name="map-marked-alt" size={26} color="black" {...props} />,
    '(profiles)': (props) => <FontAwesome5 name="user" size={26} color="black" {...props} />,
    'payment': (props) => <FontAwesome name="credit-card" size={26} color="black" {...props}/>,
    'checkInMap': (props) => <Entypo name="location" size={20} color="black" {...props}/>,
    'realMap':(props) => <FontAwesome name="map-signs" size={20} color="black" {...props}/>
}