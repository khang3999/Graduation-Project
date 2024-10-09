import React from 'react';
import { Alert } from 'react-native';
import * as Facebook from 'expo-facebook';
import Icon from 'react-native-vector-icons/FontAwesome'; 
import ButtonComponent from '@/components/buttons/ButtonComponent';
import { auth, FacebookAuthProvider, signInWithCredential } from '@/firebase/firebaseConfig';

const FacebookLoginButton = () => {
  // const handleFacebookLogin = async () => {
  //   try {
  //     // Initialize Facebook
  //     await Facebook.initializeAsync({
  //       appId: '1042817677331180', // Your Facebook App ID
  //     });

  //     // Log in with read permissions
  //     const { type, token } = await Facebook.logInWithReadPermissionsAsync({
  //       permissions: ['public_profile', 'email'],
  //     });

  //     if (type === 'success') {
  //       // Create a Facebook credential with the token
  //       const facebookCredential = FacebookAuthProvider.credential(token);
        
  //       // Sign in with the credential
  //       const userCredential = await signInWithCredential(auth, facebookCredential);
  //       const user = userCredential.user;
        
  //       // Extract user information
  //       const email = user.email;
  //       const provider = "facebook";
  //       const displayName = user.displayName;

  //       console.log('Logged in with Facebook:', { email, provider, displayName });

  //       // Optional: send user data to your server
  //       sendDataToServer(email, provider, token, displayName);

  //     } else {
  //       Alert.alert('Login cancelled');
  //     }
  //   } catch (error) {
  //     console.error('Login Error:', error);
  //     Alert.alert('Login failed', error.message || 'An unknown error occurred');
  //   }
  // };

  // const sendDataToServer = (email: string | null, provider: string, token: string, displayName: string | null) => {
  //   // Logic to send user data to your server
  //   console.log('Sending data to server:', { email, provider, token, displayName });
  // };

  return (
    <ButtonComponent
      icon={<Icon name="facebook" size={20} color="blue" />}
      iconFlex="left"
      color="white"
      textColor="blue"
      text="Đăng nhập bằng Facebook"
      styles={{
        margin: 10,
        borderColor: 'gray', 
        borderWidth: 0.3,
      }}
      // onPress={handleFacebookLogin}
    />
  );
};

export default FacebookLoginButton;
