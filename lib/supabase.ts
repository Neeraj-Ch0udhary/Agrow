import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

const supabaseUrl = 'https://ermuiarpyrfyuhqzrrth.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVybXVpYXJweXJmeXVocXpycnRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwMzY2OTUsImV4cCI6MjA5MzYxMjY5NX0.S_iEGjKF8462vZTUCjh4tXuV7Xr12PzeiWnV9BZT_To';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});