import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

const REMEMBER_ME_KEY       = 'agrow_remember_me';
const SAVED_PASSWORD_KEY    = 'agrow_saved_password';
const BIOMETRIC_ENABLED_KEY = 'agrow_biometric_enabled';

/**
 * Signs the user out of Supabase.
 *
 * What is preserved:
 *   - agrow_saved_email      → always kept so the "Continue as …" hint shows on next open
 *   - agrow_biometric_enabled → kept so biometric quick-login still works next time
 *   - agrow_saved_password   → kept ONLY if biometric is enabled (needed for re-auth)
 *
 * What is cleared:
 *   - agrow_remember_me      → reset to false so the checkbox starts unchecked
 *   - agrow_saved_password   → cleared when biometric is NOT enabled
 */
export async function logout() {
  const biometricEnabled = await AsyncStorage.getItem(BIOMETRIC_ENABLED_KEY);

  // Always clear Remember Me flag on logout
  await AsyncStorage.setItem(REMEMBER_ME_KEY, 'false');

  // Clear password only when biometric is not set up
  // (biometric re-auth needs the stored password to work on next launch)
  if (biometricEnabled !== 'true') {
    await AsyncStorage.removeItem(SAVED_PASSWORD_KEY);
  }

  // Email and biometric flag are intentionally NOT removed so the
  // login screen can show the "Continue as <email>" hint and the
  // biometric quick-login button on the next visit.

  await supabase.auth.signOut();
}