import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, Animated, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';

// ← Moved OUTSIDE component to prevent re-renders
function InputField({ label, value, onChangeText, placeholder, secureTextEntry = false, keyboardType = 'default' }: any) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.fieldWrapper}>
      <Text style={[styles.label, focused && styles.labelFocused]}>{label}</Text>
      <View style={[styles.inputWrapper, focused && styles.inputWrapperFocused]}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#bbb"
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize="none"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          blurOnSubmit={false}
        />
      </View>
    </View>
  );
}

export default function LoginScreen() {
  const router = useRouter();
  const { t }  = useTranslation();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone]       = useState('');
  const [state, setState]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleAuth = async () => {
    if (!email || !password) { Alert.alert('Error', 'Please enter email and password'); return; }
    if (isSignUp && !fullName) { Alert.alert('Error', 'Please enter your full name'); return; }
    setLoading(true);
    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data.user) await supabase.from('profiles').insert({ id: data.user.id, full_name: fullName, phone, state });
        Alert.alert('Success! 🎉', 'Account created! You can now login.');
        setIsSignUp(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.replace('/(tabs)');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        bounces={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="none">

        {/* Header */}
        <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoEmoji}>🌿</Text>
          </View>
          <Text style={styles.appName}>Agrow</Text>
          <Text style={styles.tagline}>{t('common.tagline')}</Text>
          <View style={styles.decorRow}>
            {[...Array(5)].map((_, i) => (
              <View key={i} style={[styles.decorDot, { opacity: 0.2 + i * 0.15 }]} />
            ))}
          </View>
        </Animated.View>

        {/* Form Card */}
        <View style={styles.formCard}>
          <View style={styles.tabRow}>
            <TouchableOpacity style={[styles.tab, !isSignUp && styles.tabActive]} onPress={() => setIsSignUp(false)}>
              <Text style={[styles.tabText, !isSignUp && styles.tabTextActive]}>{t('login.welcomeBack')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.tab, isSignUp && styles.tabActive]} onPress={() => setIsSignUp(true)}>
              <Text style={[styles.tabText, isSignUp && styles.tabTextActive]}>{t('login.createAccount')}</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.formSub}>{isSignUp ? t('login.signupSub') : t('login.loginSub')}</Text>

          {isSignUp && (
            <>
              <InputField label={t('login.fullName')} value={fullName} onChangeText={setFullName} placeholder={t('login.placeholders.fullName')} />
              <InputField label={t('login.phone')} value={phone} onChangeText={setPhone} placeholder={t('login.placeholders.phone')} keyboardType="phone-pad" />
              <InputField label={t('login.state')} value={state} onChangeText={setState} placeholder={t('login.placeholders.state')} />
            </>
          )}

          <InputField label={t('login.email')} value={email} onChangeText={setEmail} placeholder={t('login.placeholders.email')} keyboardType="email-address" />
          <InputField label={t('login.password')} value={password} onChangeText={setPassword} placeholder={t('login.placeholders.password')} secureTextEntry />

          <TouchableOpacity style={[styles.authButton, loading && styles.authButtonLoading]} onPress={handleAuth} disabled={loading}>
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.authButtonText}>{isSignUp ? t('login.createAccount') : t('login.login')} →</Text>
            }
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity style={styles.switchButton} onPress={() => setIsSignUp(!isSignUp)}>
            <Text style={styles.switchText}>
              {isSignUp ? t('login.alreadyAccount') : t('login.noAccount')}
              <Text style={styles.switchLink}>{isSignUp ? t('login.login') : t('login.createAccount')}</Text>
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footerText}>🇮🇳 Made for Indian Farmers</Text>
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:           { flex: 1, backgroundColor: '#f0f4f0' },
  header:              { backgroundColor: '#1a6b3c', paddingTop: 40, paddingBottom: 48, alignItems: 'center', borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  logoCircle:          { width: 80, height: 80, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', marginBottom: 16, borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)' },
  logoEmoji:           { fontSize: 40 },
  appName:             { fontSize: 36, fontWeight: '800', color: '#fff', letterSpacing: 1, marginBottom: 6 },
  tagline:             { fontSize: 13, color: 'rgba(255,255,255,0.75)' },
  decorRow:            { flexDirection: 'row', gap: 8, marginTop: 20 },
  decorDot:            { width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff' },
  formCard:            { backgroundColor: '#fff', marginHorizontal: 16, marginTop: -24, borderRadius: 24, padding: 24, elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12 },
  tabRow:              { flexDirection: 'row', backgroundColor: '#f5f5f5', borderRadius: 12, padding: 4, marginBottom: 20 },
  tab:                 { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  tabActive:           { backgroundColor: '#1a6b3c' },
  tabText:             { fontSize: 13, fontWeight: '600', color: '#888' },
  tabTextActive:       { color: '#fff' },
  formSub:             { fontSize: 13, color: '#999', marginBottom: 20, textAlign: 'center' },
  fieldWrapper:        { marginBottom: 16 },
  label:               { fontSize: 12, fontWeight: '600', color: '#888', marginBottom: 8, letterSpacing: 0.5 },
  labelFocused:        { color: '#1a6b3c' },
  inputWrapper:        { backgroundColor: '#f8f8f8', borderRadius: 12, borderWidth: 1.5, borderColor: '#efefef', paddingHorizontal: 16 },
  inputWrapperFocused: { borderColor: '#1a6b3c', backgroundColor: '#f0f9f4' },
  input:               { fontSize: 15, color: '#1a1a1a', paddingVertical: 14 },
  authButton:          { backgroundColor: '#1a6b3c', padding: 17, borderRadius: 14, alignItems: 'center', marginTop: 8, elevation: 3 },
  authButtonLoading:   { backgroundColor: '#2e7d32' },
  authButtonText:      { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },
  dividerRow:          { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 20 },
  dividerLine:         { flex: 1, height: 1, backgroundColor: '#f0f0f0' },
  dividerText:         { fontSize: 13, color: '#ccc', fontWeight: '500' },
  switchButton:        { alignItems: 'center' },
  switchText:          { fontSize: 14, color: '#888' },
  switchLink:          { color: '#1a6b3c', fontWeight: '700' },
  footerText:          { textAlign: 'center', fontSize: 12, color: '#aaa', marginTop: 24 },
});