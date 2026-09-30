import { initializeApp, getApps } from 'firebase/app';
// @ts-ignore - getReactNativePersistence existe en tiempo de ejecución aunque el tipo no siempre se exporta
import { initializeAuth, getAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyCJPTP5SiKTKrEjOtJh0ckMSynKvqfwr6k',
  authDomain: 'paperstock-a0b28.firebaseapp.com',
  projectId: 'paperstock-a0b28',
  storageBucket: 'paperstock-a0b28.firebasestorage.app',
  messagingSenderId: '368643926839',
  appId: '1:368643926839:web:63debc0fd9c83ef46208b2',
  measurementId: 'G-QXGN91VZRC',
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (e) {
  // Si ya se inicializó antes (ej. recarga en caliente), reutilizamos la instancia existente
  auth = getAuth(app);
}

export { auth };
export const db = getFirestore(app);
export default app;
