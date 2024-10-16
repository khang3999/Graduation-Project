import { initializeApp } from '@firebase/app';
import { getAuth, FacebookAuthProvider, signInWithCredential, signInWithPopup } from '@firebase/auth';
import { getDatabase } from '@firebase/database'; 
import { ref, set, onValue, get, update} from "@firebase/database";

import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "@firebase/storage";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAXg7q7WhZy38dAadC-f6zEXtq-8FKV58A",
  authDomain: "travelogue-abb82.firebaseapp.com",
  databaseURL: "https://travelogue-abb82-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "travelogue-abb82",
  storageBucket: "travelogue-abb82.appspot.com",
  messagingSenderId: "722317549136",
  appId: "1:722317549136:web:d428aea2ab08fc7425bb55",
  measurementId: "G-H5NCLHNC83"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app); 
const storage = getStorage(app);

// Exporting Firebase services  
export { 
  update,
  auth, 
  database, 
  get,
  ref, 
  set, 
  storage, 
  onValue,
  storageRef, 
  uploadBytes, 
  getDownloadURL, 
  signInWithPopup,
  FacebookAuthProvider, 
  signInWithCredential 
};
