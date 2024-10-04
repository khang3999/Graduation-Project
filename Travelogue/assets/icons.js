import { AntDesign, Entypo, FontAwesome5 } from "@expo/vector-icons";

export const icons = {
    index: (props) => <AntDesign name="home" size={24} color="black" {...props}/>,
    tour: (props) => <Entypo name="compass" size={24} color="black" {...props}/>,
    map: (props) => <FontAwesome5 name="map-marked-alt" size={24} color="black" {...props}/>,
    profile: (props) => <FontAwesome5 name="user" size={24} color="black" {...props}/>,
    
}