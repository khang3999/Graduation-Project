import { Stack } from 'expo-router/stack';
export default function Layout() {
    return (
        <Stack
            screenOptions={{
              contentStyle: {paddingTop: 40}  
            }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
    );
}