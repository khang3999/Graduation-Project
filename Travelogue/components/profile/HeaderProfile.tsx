import { Text, View, StyleSheet, Image } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import Feather from '@expo/vector-icons/Feather';
import Entypo from '@expo/vector-icons/Entypo';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AvatarProfile from './AvatarProfile'

export default function HeaderProfile() {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.row}>
          <Text style={styles.username}>tranhieuphuc12</Text>
          <MaterialIcons name="keyboard-arrow-down" size={24} color="black" />
        </View>
        <View style={styles.headerButton}>
          <AntDesign
            style={{ paddingRight: 10 }}
            name="plus"
            size={24}
            color="black"
          />
          <Feather
            style={{ paddingRight: 10 }}
            name="bell"
            size={24}
            color="black"
          />
          <Entypo name="menu" size={24} color="black" />
        </View>
      </View>
      <AvatarProfile/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    flex: 1,    
    marginTop:20,
  },
  username: {
    fontWeight: 'bold',
    fontSize: 18,
    margin: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerButton: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
});
