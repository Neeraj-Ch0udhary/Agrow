import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StatusBar, StyleSheet, Text, View } from 'react-native';

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/login');
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a6b3c" />
      <View style={styles.logoCircle}>
        <Text style={styles.logoEmoji}>🌿</Text>
      </View>
      <Text style={styles.appName}>Agrow</Text>
      <Text style={styles.tagline}>From land to marketplace</Text>
      <View style={styles.divider} />
      <Text style={styles.subTagline}>Modern farming for every Indian farmer</Text>
      <View style={styles.dotsRow}>
        <View style={[styles.dot, styles.dotActive]} />
        <View style={styles.dot} />
        <View style={styles.dot} />
      </View>
      <Text style={styles.bottomText}>🇮🇳 Made for Indian Farmers</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a6b3c', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  logoCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#155e34', alignItems: 'center', justifyContent: 'center', marginBottom: 24, borderWidth: 2, borderColor: '#4caf50' },
  logoEmoji: { fontSize: 48 },
  appName: { fontSize: 52, fontWeight: 'bold', color: '#ffffff', marginBottom: 8, letterSpacing: 2 },
  tagline: { fontSize: 16, color: '#a8d5b5', marginBottom: 24, letterSpacing: 1 },
  divider: { width: 48, height: 2, backgroundColor: '#4caf50', borderRadius: 2, marginBottom: 20 },
  subTagline: { fontSize: 13, color: '#81c784', textAlign: 'center', lineHeight: 20, marginBottom: 48 },
  dotsRow: { flexDirection: 'row', gap: 8, marginBottom: 60 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#2e7d32' },
  dotActive: { backgroundColor: '#ffffff', width: 24 },
  bottomText: { position: 'absolute', bottom: 40, fontSize: 13, color: '#4caf50' },
});