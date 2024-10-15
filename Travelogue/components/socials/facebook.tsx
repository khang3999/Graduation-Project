// import React, { useEffect } from 'react';
// import { Alert } from 'react-native';
// import * as Facebook from 'expo-auth-session/providers/facebook';
// import Icon from 'react-native-vector-icons/FontAwesome';
// import ButtonComponent from '@/components/buttons/ButtonComponent';
// import { auth, FacebookAuthProvider, signInWithCredential } from '@/firebase/firebaseConfig';

// const FACEBOOK_APP_ID = '1042817677331180';
// const redirectUri = 'https://travelogue-abb82.firebaseapp.com/__/auth/handler';

// const FacebookLoginButton = () => {
//   const [request, response, promptAsync] = Facebook.useAuthRequest({
//     clientId: FACEBOOK_APP_ID,
//     redirectUri,
//   });

//   useEffect(() => {
//     if (response?.type === 'success') {
//       const { access_token } = response.params;

//       const credential = FacebookAuthProvider.credential(access_token);
//       signInWithCredential(auth, credential)
//         .then((userCredential) => {
//           const { displayName } = userCredential.user;
//           Alert.alert('Logged in!', `Hi ${displayName}!`);
//         })
//         .catch((error) => {
//           console.error('Firebase Login Error:', error);
//           Alert.alert('Error', `Firebase Login Error: ${error.message}`);
//         });
//     }
//   }, [response]);

//   return (
//     <ButtonComponent
//       icon={<Icon name="facebook" size={20} color="blue" />}
//       iconFlex="left"
//       color="white"
//       textColor="blue"
//       text="Đăng nhập bằng Facebook"
//       styles={{
//         margin: 10,
//         borderColor: 'gray',
//         borderWidth: 0.3,
//       }}
//       onPress={() => {
//         promptAsync();
//       }}
//     />
//   );
// };

// export default FacebookLoginButton;