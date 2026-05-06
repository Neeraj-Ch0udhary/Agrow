import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator, Alert,
    SafeAreaView,
    StyleSheet,
    Text, TextInput, TouchableOpacity,
    View
} from 'react-native';
import { supabase } from '../lib/supabase';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }
    setLoading(true);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        Alert.alert('Success! 🎉', 'Account created! Please check your email to verify.');
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
      <View style={styles.header}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoEmoji}>🌿</Text>
        </View>
        <Text style={styles.appName}>Agrow</Text>
        <Text style={styles.tagline}>Modern farming for every Indian farmer</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.formTitle}>{isSignUp ? 'Create Account' : 'Welcome Back'}</Text>
        <Text style={styles.formSub}>{isSignUp ? 'Join thousands of modern farmers' : 'Login to continue your farming journey'}</Text>

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="your@email.com"
          placeholderTextColor="#aaa"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your password"
          placeholderTextColor="#aaa"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={styles.authButton}
          onPress={handleAuth}
          disabled={loading}>
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.authButtonText}>{isSignUp ? 'Create Account' : 'Login'}</Text>
          }
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.switchButton}
          onPress={() => setIsSignUp(!isSignUp)}>
          <Text style={styles.switchText}>
            {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
            <Text style={styles.switchLink}>{isSignUp ? 'Login' : 'Sign Up'}</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: '#f5f7f5' },
  header:         { backgroundColor: '#1a6b3c', paddingTop: 60, paddingBottom: 40, alignItems: 'center' },
  logoCircle:     { width: 80, height: 80, borderRadius: 40, backgroundColor: '#155e34', alignItems: 'center', justifyContent: 'center', marginBottom: 16, borderWidth: 2, borderColor: '#4caf50' },
  logoEmoji:      { fontSize: 38 },
  appName:        { fontSize: 36, fontWeight: 'bold', color: '#fff', marginBottom: 6 },
  tagline:        { fontSize: 13, color: '#a8d5b5' },
  form:           { flex: 1, padding: 24, paddingTop: 32 },
  formTitle:      { fontSize: 24, fontWeight: '700', color: '#1a1a1a', marginBottom: 6 },
  formSub:        { fontSize: 14, color: '#888', marginBottom: 28 },
  label:          { fontSize: 13, fontWeight: '600', color: '#444', marginBottom: 8 },
  input:          { backgroundColor: '#fff', borderRadius: 12, padding: 16, fontSize: 15, color: '#1a1a1a', marginBottom: 16, elevation: 2 },
  authButton:     { backgroundColor: '#1a6b3c', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 8, elevation: 2 },
  authButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  switchButton:   { marginTop: 20, alignItems: 'center' },
  switchText:     { fontSize: 14, color: '#888' },
  switchLink:     { color: '#1a6b3c', fontWeight: '700' },
});