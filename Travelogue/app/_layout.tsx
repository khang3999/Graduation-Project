import { Stack } from 'expo-router/stack';
import { createStackNavigator, Header } from "@react-navigation/stack";

export default function Layout() {
    return (
        <Stack
            screenOptions={{
              headerShown:false
            }}>
            <Stack.Screen name="(tabs)" options={{headerShown: false}}/>
            <Stack.Screen name="(user)" options={{headerShown: false}}/>
            <Stack.Screen name="(admin)"/>
        </Stack>
    );
}
