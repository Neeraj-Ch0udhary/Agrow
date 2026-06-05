import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator, Alert, Animated, KeyboardAvoidingView,
  Platform, ScrollView, StyleSheet, Text, TextInput,
  TouchableOpacity, View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';

// ── Storage keys ───────────────────────────────────────────────────────────
const REMEMBER_ME_KEY      = 'agrow_remember_me';
const SAVED_EMAIL_KEY      = 'agrow_saved_email';
const SAVED_PASSWORD_KEY   = 'agrow_saved_password';  // stored only when Remember Me is on
const BIOMETRIC_ENABLED_KEY = 'agrow_biometric_enabled';

// ── Validation helpers ─────────────────────────────────────────────────────
const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const isValidPhone = (v: string) => v === '' || /^[+\d\s\-()]{7,15}$/.test(v);

// ── Checkbox Component ─────────────────────────────────────────────────────
function Checkbox({ checked, onToggle, label }: { checked: boolean; onToggle: () => void; label: string }) {
  return (
    <TouchableOpacity style={styles.checkRow} onPress={onToggle} activeOpacity={0.7}>
      <View style={[styles.checkBox, checked && styles.checkBoxChecked]}>
        {checked && <Text style={styles.checkMark}>✓</Text>}
      </View>
      <Text style={styles.checkLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

// ── Input Field Component ──────────────────────────────────────────────────
function InputField({
  label, value, onChangeText, placeholder,
  secureTextEntry = false, keyboardType = 'default',
  showEye = false, error,
}: any) {
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);
  const isSecure = secureTextEntry && !visible;

  return (
    <View style={styles.fieldWrapper}>
      <Text style={[styles.label, focused && styles.labelFocused, !!error && styles.labelError]}>
        {label}
      </Text>
      <View style={[
        styles.inputWrapper,
        focused && styles.inputWrapperFocused,
        !!error && styles.inputWrapperError,
      ]}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#bbb"
          secureTextEntry={isSecure}
          keyboardType={keyboardType}
          autoCapitalize="none"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          blurOnSubmit={false}
        />
        {showEye && (
          <TouchableOpacity style={styles.eyeBtn} onPress={() => setVisible(v => !v)} activeOpacity={0.7}>
            <Text style={styles.eyeIcon}>{visible ? '🙈' : '👁️'}</Text>
          </TouchableOpacity>
        )}
      </View>
      {!!error && <Text style={styles.errorHint}>{error}</Text>}
    </View>
  );
}

// ── Main Login Screen ──────────────────────────────────────────────────────
export default function LoginScreen() {
  const router = useRouter();
  const { t }  = useTranslation();

  const [email, setEmail]                     = useState('');
  const [password, setPassword]               = useState('');
  const [fullName, setFullName]               = useState('');
  const [phone, setPhone]                     = useState('');
  const [state, setState]                     = useState('');
  const [loading, setLoading]                 = useState(false);
  const [isSignUp, setIsSignUp]               = useState(false);
  const [errors, setErrors]                   = useState<Record<string, string>>({});
  const [rememberMe, setRememberMe]           = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType]     = useState<'fingerprint' | 'face' | 'none'>('none');
  const [savedEmailForHint, setSavedEmailForHint] = useState(''); // shown as hint after logout

  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  // ── On mount: check biometric hardware + load saved prefs ─────────────
  useEffect(() => {
    (async () => {
      // Check biometric hardware
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled   = await LocalAuthentication.isEnrolledAsync();
      if (compatible && enrolled) {
        setBiometricAvailable(true);
        const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
        if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
          setBiometricType('face');
        } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
          setBiometricType('fingerprint');
        }
      }

      // Load saved Remember Me state + credentials
      const savedRemember  = await AsyncStorage.getItem(REMEMBER_ME_KEY);
      const savedEmail     = await AsyncStorage.getItem(SAVED_EMAIL_KEY);
      const savedPassword  = await AsyncStorage.getItem(SAVED_PASSWORD_KEY);
      const savedBiometric = await AsyncStorage.getItem(BIOMETRIC_ENABLED_KEY);

      if (savedRemember === 'true') {
        setRememberMe(true);
        if (savedEmail)    setEmail(savedEmail);
        if (savedPassword) setPassword(savedPassword);
      } else if (savedEmail) {
        // Even without full Remember Me, show the email hint after logout
        setSavedEmailForHint(savedEmail);
      }

      if (savedBiometric === 'true') {
        setBiometricEnabled(true);
      }
    })();
  }, []);

  // ── Auth state listener ────────────────────────────────────────────────
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
        router.replace('/(tabs)');
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
    ]).start();
  }, []);

  // ── Remember Me toggle ────────────────────────────────────────────────
  const handleRememberMeToggle = async () => {
    const next = !rememberMe;
    setRememberMe(next);
    await AsyncStorage.setItem(REMEMBER_ME_KEY, next ? 'true' : 'false');
    if (!next) {
      // Clear saved password when Remember Me is turned off
      await AsyncStorage.removeItem(SAVED_PASSWORD_KEY);
    }
  };

  // ── Biometric toggle ──────────────────────────────────────────────────
  const handleBiometricToggle = async () => {
    if (!biometricEnabled) {
      // Require biometric auth before enabling
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Verify your identity to enable biometric login',
        fallbackLabel: 'Use password',
      });
      if (!result.success) return;
    }
    const next = !biometricEnabled;
    setBiometricEnabled(next);
    await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, next ? 'true' : 'false');
    if (!next) {
      Alert.alert('Biometric login disabled', 'You\'ll need to enter your credentials manually.');
    } else {
      Alert.alert(
        'Biometric login enabled ✅',
        'Next time you open the app, tap the ' + (biometricType === 'face' ? 'Face ID' : 'fingerprint') + ' button to sign in instantly.',
      );
    }
  };

  // ── Biometric login ────────────────────────────────────────────────────
  const handleBiometricLogin = async () => {
    const savedEmail    = await AsyncStorage.getItem(SAVED_EMAIL_KEY);
    const savedPassword = await AsyncStorage.getItem(SAVED_PASSWORD_KEY);

    if (!savedEmail || !savedPassword) {
      Alert.alert(
        'Setup required',
        'Please log in with your email and password once, then enable biometric login in settings.',
      );
      return;
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: biometricType === 'face'
        ? 'Sign in with Face ID'
        : 'Sign in with your fingerprint',
      fallbackLabel: 'Use password',
      disableDeviceFallback: false,
    });

    if (result.success) {
      setLoading(true);
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email: savedEmail,
          password: savedPassword,
        });
        if (error) {
          Alert.alert('Biometric login failed', 'Credentials may have changed. Please log in manually.');
          await AsyncStorage.removeItem(BIOMETRIC_ENABLED_KEY);
          setBiometricEnabled(false);
        }
        // onAuthStateChange handles navigation
      } catch (err: any) {
        Alert.alert('Error', err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  // ── Validation ─────────────────────────────────────────────────────────
  const validate = () => {
    const errs: Record<string, string> = {};
    if (!email)                    errs.email    = 'Email is required';
    else if (!isValidEmail(email)) errs.email    = 'Enter a valid email address';
    if (!password)                 errs.password = 'Password is required';
    else if (password.length < 6)  errs.password = 'Password must be at least 6 characters';
    if (isSignUp) {
      if (!fullName.trim())        errs.fullName = 'Full name is required';
      if (!isValidPhone(phone))    errs.phone    = 'Enter a valid phone number';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Main auth handler ──────────────────────────────────────────────────
  const handleAuth = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;

        if (!data.session) {
          Alert.alert(
            'Check your email 📬',
            'We sent a confirmation link to ' + email + '. Tap it to activate your account, then come back and log in.',
          );
          setIsSignUp(false);
          setLoading(false);
          return;
        }

        if (data.user) {
          const { error: profileError } = await supabase.from('profiles').insert({
            id: data.user.id,
            full_name: fullName,
            phone,
            state,
          });
          if (profileError) {
            console.error('Profile insert failed:', profileError.message);
            Alert.alert(
              'Almost there',
              'Account created, but we couldn\'t save your profile details. You can update them in Settings.',
            );
          }
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        // ── Save credentials based on Remember Me & biometric settings ─
        await AsyncStorage.setItem(SAVED_EMAIL_KEY, email);

        if (rememberMe) {
          await AsyncStorage.setItem(REMEMBER_ME_KEY, 'true');
          await AsyncStorage.setItem(SAVED_PASSWORD_KEY, password);
        } else {
          await AsyncStorage.setItem(REMEMBER_ME_KEY, 'false');
          // Still save password if biometric is enabled (needed for biometric re-auth)
          if (biometricEnabled) {
            await AsyncStorage.setItem(SAVED_PASSWORD_KEY, password);
          } else {
            await AsyncStorage.removeItem(SAVED_PASSWORD_KEY);
          }
        }

        // Ask to enable biometric on first login if available and not yet configured
        const biometricPref = await AsyncStorage.getItem(BIOMETRIC_ENABLED_KEY);
        if (biometricAvailable && biometricPref === null) {
          const label = biometricType === 'face' ? 'Face ID' : 'fingerprint';
          Alert.alert(
            'Enable ' + label + ' login?',
            'Sign in faster next time using ' + label + '.',
            [
              { text: 'Not now', style: 'cancel', onPress: () => AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, 'false') },
              {
                text: 'Enable',
                onPress: async () => {
                  setBiometricEnabled(true);
                  await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, 'true');
                  await AsyncStorage.setItem(SAVED_PASSWORD_KEY, password);
                },
              },
            ],
          );
        }
      }
      // onAuthStateChange handles navigation
    } catch (error: any) {
      const msg: Record<string, string> = {
        'Invalid login credentials': 'Incorrect email or password. Please try again.',
        'Email not confirmed':        'Please confirm your email before logging in.',
        'User already registered':    'An account with this email already exists.',
      };
      Alert.alert('Error', msg[error.message] ?? error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email || !isValidEmail(email)) {
      Alert.alert('Enter your email first', 'Type your email address above, then tap "Forgot password?".');
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) Alert.alert('Error', error.message);
    else Alert.alert('Password reset sent 📬', 'Check your email for a reset link.');
  };

  const switchMode = () => {
    setIsSignUp(v => !v);
    setErrors({});
  };

  // ── Biometric button label ─────────────────────────────────────────────
  const biometricIcon = biometricType === 'face' ? '🪪' : '👆';
  const biometricLabel = biometricType === 'face' ? 'Sign in with Face ID' : 'Sign in with fingerprint';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          style={styles.flex}
          showsVerticalScrollIndicator={false}
          bounces={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={styles.scrollContent}
        >
          {/* ── Header ── */}
          <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoEmoji}>🌿</Text>
            </View>
            <Text style={styles.appName}>Agrow</Text>
            <Text style={styles.tagline}>{t('common.tagline')}</Text>
            <View style={styles.decorRow}>
              {['🌾', '🌱', '🌾', '🌱', '🌾'].map((icon, i) => (
                <Text key={i} style={[styles.decorIcon, { opacity: 0.25 + i * 0.1 }]}>{icon}</Text>
              ))}
            </View>
          </Animated.View>

          {/* ── Form Card ── */}
          <View style={styles.formCard}>

            {/* Tab row */}
            <View style={styles.tabRow}>
              <TouchableOpacity
                style={[styles.tab, !isSignUp && styles.tabActive]}
                onPress={() => { setIsSignUp(false); setErrors({}); }}
              >
                <Text style={[styles.tabText, !isSignUp && styles.tabTextActive]}>{t('login.welcomeBack')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, isSignUp && styles.tabActive]}
                onPress={() => { setIsSignUp(true); setErrors({}); }}
              >
                <Text style={[styles.tabText, isSignUp && styles.tabTextActive]}>{t('login.createAccount')}</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.formSub}>
              {isSignUp ? t('login.signupSub') : t('login.loginSub')}
            </Text>

            {/* ── Biometric quick-login button (login tab only, if enabled) ── */}
            {!isSignUp && biometricAvailable && biometricEnabled && (
              <TouchableOpacity style={styles.biometricQuickBtn} onPress={handleBiometricLogin} activeOpacity={0.8}>
                <Text style={styles.biometricQuickIcon}>{biometricIcon}</Text>
                <Text style={styles.biometricQuickText}>{biometricLabel}</Text>
              </TouchableOpacity>
            )}

            {/* Saved email hint after logout (when no full Remember Me) */}
            {!isSignUp && !rememberMe && savedEmailForHint && !email && (
              <TouchableOpacity
                style={styles.hintBanner}
                onPress={() => { setEmail(savedEmailForHint); setSavedEmailForHint(''); }}
                activeOpacity={0.8}
              >
                <Text style={styles.hintText}>Continue as <Text style={styles.hintEmail}>{savedEmailForHint}</Text> →</Text>
              </TouchableOpacity>
            )}

            {/* Sign-up extra fields */}
            {isSignUp && (
              <>
                <InputField
                  label={t('login.fullName')} value={fullName} onChangeText={setFullName}
                  placeholder={t('login.placeholders.fullName')} error={errors.fullName}
                />
                <InputField
                  label={t('login.phone')} value={phone} onChangeText={setPhone}
                  placeholder={t('login.placeholders.phone')} keyboardType="phone-pad" error={errors.phone}
                />
                <InputField
                  label={t('login.state')} value={state} onChangeText={setState}
                  placeholder={t('login.placeholders.state')}
                />
              </>
            )}

            {/* Email */}
            <InputField
              label={t('login.email')} value={email} onChangeText={setEmail}
              placeholder={t('login.placeholders.email')} keyboardType="email-address" error={errors.email}
            />

            {/* Password */}
            <InputField
              label={t('login.password')} value={password} onChangeText={setPassword}
              placeholder={t('login.placeholders.password')} secureTextEntry showEye error={errors.password}
            />

            {/* ── Remember Me + Forgot password row (login mode only) ── */}
            {!isSignUp && (
              <View style={styles.rememberRow}>
                <Checkbox
                  checked={rememberMe}
                  onToggle={handleRememberMeToggle}
                  label="Remember me"
                />
                <TouchableOpacity onPress={handleForgotPassword}>
                  <Text style={styles.forgotText}>Forgot password?</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* ── Biometric toggle (login mode only, if hardware available) ── */}
            {!isSignUp && biometricAvailable && (
              <View style={styles.biometricToggleRow}>
                <View style={styles.biometricToggleLeft}>
                  <Text style={styles.biometricToggleIcon}>{biometricIcon}</Text>
                  <View>
                    <Text style={styles.biometricToggleLabel}>
                      {biometricType === 'face' ? 'Face ID' : 'Fingerprint'} login
                    </Text>
                    <Text style={styles.biometricToggleSub}>
                      {biometricEnabled ? 'Tap the button above to sign in fast' : 'Enable for faster sign-in'}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[styles.togglePill, biometricEnabled && styles.togglePillOn]}
                  onPress={handleBiometricToggle}
                  activeOpacity={0.8}
                >
                  <View style={[styles.toggleThumb, biometricEnabled && styles.toggleThumbOn]} />
                </TouchableOpacity>
              </View>
            )}

            {/* Auth button */}
            <TouchableOpacity
              style={[styles.authButton, loading && styles.authButtonLoading]}
              onPress={handleAuth}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.authButtonText}>
                    {isSignUp ? t('login.createAccount') : t('login.login')} →
                  </Text>
              }
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Switch mode */}
            <TouchableOpacity style={styles.switchButton} onPress={switchMode}>
              <Text style={styles.switchText}>
                {isSignUp ? t('login.alreadyAccount') : t('login.noAccount')}
                <Text style={styles.switchLink}>
                  {isSignUp ? t('login.login') : t('login.createAccount')}
                </Text>
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.footerText}>🇮🇳 Made for Indian Farmers</Text>
          <View style={{ height: 32 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container:           { flex: 1, backgroundColor: '#f0f4f0' },
  flex:                { flex: 1 },
  scrollContent:       { flexGrow: 1 },

  // Header
  header:              { backgroundColor: '#1a6b3c', paddingTop: 40, paddingBottom: 48, alignItems: 'center', borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  logoCircle:          { width: 80, height: 80, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', marginBottom: 16, borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)' },
  logoEmoji:           { fontSize: 40 },
  appName:             { fontSize: 36, fontWeight: '800', color: '#fff', letterSpacing: 1, marginBottom: 6 },
  tagline:             { fontSize: 13, color: 'rgba(255,255,255,0.75)' },
  decorRow:            { flexDirection: 'row', gap: 10, marginTop: 20 },
  decorIcon:           { fontSize: 18 },

  // Form card
  formCard:            { backgroundColor: '#fff', marginHorizontal: 16, marginTop: -24, borderRadius: 24, padding: 24, elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12 },
  tabRow:              { flexDirection: 'row', backgroundColor: '#f5f5f5', borderRadius: 12, padding: 4, marginBottom: 20 },
  tab:                 { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  tabActive:           { backgroundColor: '#1a6b3c' },
  tabText:             { fontSize: 13, fontWeight: '600', color: '#888' },
  tabTextActive:       { color: '#fff' },
  formSub:             { fontSize: 13, color: '#999', marginBottom: 20, textAlign: 'center' },

  // Biometric quick login
  biometricQuickBtn:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#f0f9f4', borderRadius: 14, borderWidth: 1.5, borderColor: '#1a6b3c', paddingVertical: 14, marginBottom: 20 },
  biometricQuickIcon:  { fontSize: 22 },
  biometricQuickText:  { fontSize: 15, fontWeight: '600', color: '#1a6b3c' },

  // Hint banner
  hintBanner:          { backgroundColor: '#f0f9f4', borderRadius: 10, borderWidth: 1, borderColor: '#c3e6d0', padding: 12, marginBottom: 16, alignItems: 'center' },
  hintText:            { fontSize: 13, color: '#555' },
  hintEmail:           { fontWeight: '700', color: '#1a6b3c' },

  // Input fields
  fieldWrapper:        { marginBottom: 16 },
  label:               { fontSize: 12, fontWeight: '600', color: '#888', marginBottom: 8, letterSpacing: 0.5 },
  labelFocused:        { color: '#1a6b3c' },
  labelError:          { color: '#c0392b' },
  inputWrapper:        { backgroundColor: '#f8f8f8', borderRadius: 12, borderWidth: 1.5, borderColor: '#efefef', paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center' },
  inputWrapperFocused: { borderColor: '#1a6b3c', backgroundColor: '#f0f9f4' },
  inputWrapperError:   { borderColor: '#e74c3c', backgroundColor: '#fff5f5' },
  input:               { flex: 1, fontSize: 15, color: '#1a1a1a', paddingVertical: 14 },
  errorHint:           { fontSize: 11, color: '#c0392b', marginTop: 4, marginLeft: 4 },
  eyeBtn:              { paddingLeft: 10, paddingVertical: 10, justifyContent: 'center', alignItems: 'center' },
  eyeIcon:             { fontSize: 18 },

  // Remember me + forgot row
  rememberRow:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, marginTop: -4 },
  checkRow:            { flexDirection: 'row', alignItems: 'center', gap: 8 },
  checkBox:            { width: 20, height: 20, borderRadius: 5, borderWidth: 1.5, borderColor: '#ccc', backgroundColor: '#f8f8f8', alignItems: 'center', justifyContent: 'center' },
  checkBoxChecked:     { backgroundColor: '#1a6b3c', borderColor: '#1a6b3c' },
  checkMark:           { color: '#fff', fontSize: 12, fontWeight: '700' },
  checkLabel:          { fontSize: 13, color: '#555' },
  forgotText:          { fontSize: 13, color: '#1a6b3c', fontWeight: '600' },

  // Biometric toggle row
  biometricToggleRow:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fdf9', borderRadius: 14, borderWidth: 1, borderColor: '#d4eede', padding: 14, marginBottom: 20 },
  biometricToggleLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  biometricToggleIcon: { fontSize: 26 },
  biometricToggleLabel:{ fontSize: 14, fontWeight: '600', color: '#1a1a1a' },
  biometricToggleSub:  { fontSize: 11, color: '#999', marginTop: 2 },
  togglePill:          { width: 44, height: 26, borderRadius: 13, backgroundColor: '#ddd', justifyContent: 'center', paddingHorizontal: 3 },
  togglePillOn:        { backgroundColor: '#1a6b3c' },
  toggleThumb:         { width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff' },
  toggleThumbOn:       { alignSelf: 'flex-end' },

  // Auth button
  authButton:          { backgroundColor: '#1a6b3c', padding: 17, borderRadius: 14, alignItems: 'center', marginTop: 8, elevation: 3 },
  authButtonLoading:   { backgroundColor: '#2e7d32' },
  authButtonText:      { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },

  // Divider
  dividerRow:          { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 20 },
  dividerLine:         { flex: 1, height: 1, backgroundColor: '#f0f0f0' },
  dividerText:         { fontSize: 13, color: '#ccc', fontWeight: '500' },

  // Switch
  switchButton:        { alignItems: 'center' },
  switchText:          { fontSize: 14, color: '#888' },
  switchLink:          { color: '#1a6b3c', fontWeight: '700' },

  // Footer
  footerText:          { textAlign: 'center', fontSize: 12, color: '#aaa', marginTop: 24 },
});