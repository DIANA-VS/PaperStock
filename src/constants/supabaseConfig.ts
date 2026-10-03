import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// TODO: Reemplaza estos dos valores con los de tu propio proyecto de Supabase
// (Project Settings > API > Project URL / anon public key)
const SUPABASE_URL = 'https://zmmhyaalautubrsmdqhw.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_eDKD1qCUmIQ_Qb4rOnPXtw_8xrcJbGp';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
