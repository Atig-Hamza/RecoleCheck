import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';
// @ts-expect-error getReactNativePersistence exists at runtime in firebase v12
import { getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBLEgyST0DR4zZWOKShTKvjWDVmZj1RxSY",
  authDomain: "recoltecheck-e31ac.firebaseapp.com",
  projectId: "recoltecheck-e31ac",
  storageBucket: "recoltecheck-e31ac.firebasestorage.app",
  messagingSenderId: "381564855160",
  appId: "1:381564855160:web:3114cee843d33a4b6ade8d",
  measurementId: "G-FR9FFPMLGK",
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const db = getFirestore(app);