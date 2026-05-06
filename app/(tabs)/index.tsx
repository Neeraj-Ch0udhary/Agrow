import { useRouter } from 'expo-router';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="light-content" backgroundColor="#1a6b3c" />

      <View style={styles.header}>
        <View style={styles.logoRow}>
          <View style={styles.logoMark}>
            <Text style={styles.logoLeaf}>🌿</Text>
          </View>
          <Text style={styles.appName}>Agrow</Text>
        </View>
        <Text style={styles.tagline}>From land to marketplace</Text>
        <TouchableOpacity style={styles.profileButton} onPress={() => router.push('/profile')}>
          <Text style={styles.profileButtonText}>👤 My Profile</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.welcomeCard}>
        <Text style={styles.welcomeTitle}>Namaste, Kisan! 👋</Text>
        <Text style={styles.welcomeText}>
          Discover modern farming techniques that earn 3x more than traditional crops.
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Your Farming Journey</Text>

      <TouchableOpacity style={[styles.stageCard, { borderLeftColor: '#1a6b3c' }]} onPress={() => router.push('/land')}>
        <Text style={styles.stageEmoji}>🌍</Text>
        <View style={styles.stageText}>
          <Text style={styles.stageTitleText}>Land Assessment</Text>
          <Text style={styles.stageDesc}>Find the best crop for your land & budget</Text>
        </View>
        <Text style={styles.arrow}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.stageCard, { borderLeftColor: '#f5a623' }]} onPress={() => router.push('/learn')}>
        <Text style={styles.stageEmoji}>📚</Text>
        <View style={styles.stageText}>
          <Text style={styles.stageTitleText}>Learn & Plan</Text>
          <Text style={styles.stageDesc}>Step-by-step guides for modern farming</Text>
        </View>
        <Text style={styles.arrow}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.stageCard, { borderLeftColor: '#4caf50' }]} onPress={() => router.push('/grow')}>
        <Text style={styles.stageEmoji}>🌱</Text>
        <View style={styles.stageText}>
          <Text style={styles.stageTitleText}>Grow</Text>
          <Text style={styles.stageDesc}>Daily support while your crop is growing</Text>
        </View>
        <Text style={styles.arrow}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.stageCard, { borderLeftColor: '#e91e63' }]} onPress={() => router.push('/sell')}>
        <Text style={styles.stageEmoji}>🏪</Text>
        <View style={styles.stageText}>
          <Text style={styles.stageTitleText}>Sell</Text>
          <Text style={styles.stageDesc}>Connect with buyers, get the best price</Text>
        </View>
        <Text style={styles.arrow}>›</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.stageCard, { borderLeftColor: '#1565c0' }]} onPress={() => router.push('/mandi')}>
  <Text style={styles.stageEmoji}>📈</Text>
  <View style={styles.stageText}>
    <Text style={styles.stageTitleText}>Mandi Prices</Text>
    <Text style={styles.stageDesc}>Live crop prices from mandis across India</Text>
  </View>
  <Text style={styles.arrow}>›</Text>
</TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  profileButton:     { marginTop: 14, backgroundColor: '#155e34', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, alignSelf: 'flex-start' },
profileButtonText: { color: '#a8d5b5', fontSize: 13, fontWeight: '600' },
  container: { flex: 1, backgroundColor: '#f5f7f5' },
  header: { backgroundColor: '#1a6b3c', paddingTop: 60, paddingBottom: 30, paddingHorizontal: 24 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  logoMark: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#155e34', alignItems: 'center', justifyContent: 'center' },
  logoLeaf: { fontSize: 24 },
  appName: { fontSize: 32, fontWeight: 'bold', color: '#ffffff' },
  tagline: { fontSize: 14, color: '#a8d5b5' },
  welcomeCard: { backgroundColor: '#ffffff', margin: 16, padding: 20, borderRadius: 12, elevation: 3 },
  welcomeTitle: { fontSize: 18, fontWeight: '600', color: '#1a1a1a', marginBottom: 8 },
  welcomeText: { fontSize: 14, color: '#666666', lineHeight: 22 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#1a1a1a', paddingHorizontal: 16, marginBottom: 12 },
  stageCard: { backgroundColor: '#ffffff', marginHorizontal: 16, marginBottom: 12, padding: 18, borderRadius: 12, borderLeftWidth: 4, flexDirection: 'row', alignItems: 'center', elevation: 2 },
  stageEmoji: { fontSize: 28, marginRight: 14 },
  stageText: { flex: 1 },
  stageTitleText: { fontSize: 15, fontWeight: '600', color: '#1a1a1a', marginBottom: 4 },
  stageDesc: { fontSize: 13, color: '#888888' },
  arrow: { fontSize: 22, color: '#cccccc' },
});