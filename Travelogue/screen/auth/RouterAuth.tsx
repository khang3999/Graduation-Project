import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from './LoginScreen';
import ForgotPasswordScreen from './ForgotPasswordScreen';
import RegisterScreen from './RegisterScreen';

const Stack = createStackNavigator();

const RouterAuth = () => {
  return (
    <Stack.Navigator initialRouteName="LoginScreen" screenOptions={{ cardStyle: { backgroundColor: 'white' } }}>
      <Stack.Screen name="LoginScreen"  component={LoginScreen} options={{headerShown: false}} />
      <Stack.Screen name="RegisterScreen" component={RegisterScreen} options={{headerShown: false}} />
      <Stack.Screen name="ForgotPasswordScreen" component={ForgotPasswordScreen} options={{headerShown: false}} />
    </Stack.Navigator>
  );
};

export default RouterAuth;
