import 'react-native-url-polyfill/auto';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// En la plataforma "web" (usada solo por herramientas internas de desarrollo,
// no por la app real en el celular), evitamos usar AsyncStorage porque intenta
// acceder a "window" antes de tiempo y provoca un error al iniciar el servidor.
const authStorage = Platform.OS === 'web' ? undefined : AsyncStorage;

// TODO: Reemplaza estos dos valores con los de tu propio proyecto de Supabase
// (Project Settings > API > Project URL / anon public key)
const SUPABASE_URL = 'https://zmmhyaalautubrsmdqhw.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_eDKD1qCUmIQ_Qb4rOnPXtw_8xrcJbGp';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: authStorage,
    autoRefreshToken: true,
    persistSession: Platform.OS !== 'web',
    detectSessionInUrl: false,
  },
});
