import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import i18n, { changeLanguage } from '../../lib/i18n';

export default function HomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const toggleLang = () => {
    changeLanguage(i18n.language === 'en' ? 'hi' : 'en');
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="light-content" backgroundColor="#1a6b3c" />
      <View style={styles.header}>
        <View style={styles.topRow}>
          <View style={styles.logoRow}>
            <View style={styles.logoMark}>
              <Text style={styles.logoLeaf}>🌿</Text>
            </View>
            <Text style={styles.appName}>{t('common.appName')}</Text>
          </View>
          <View style={styles.topButtons}>
            <TouchableOpacity style={styles.langToggle} onPress={toggleLang}>
              <Text style={styles.langToggleText}>{i18n.language === 'en' ? 'हिं' : 'EN'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.profileButton} onPress={() => router.push('/profile')}>
              <Text style={styles.profileButtonText}>👤</Text>
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.tagline}>{t('common.tagline')}</Text>
      </View>

      <View style={styles.welcomeCard}>
        <Text style={styles.welcomeTitle}>{t('home.namaste')}</Text>
        <Text style={styles.welcomeText}>{t('home.welcomeText')}</Text>
      </View>

      <Text style={styles.sectionTitle}>{t('home.journeyTitle')}</Text>

      {[
        { key: 'land', color: '#1a6b3c', emoji: '🌍', route: '/land' },
        { key: 'learn', color: '#f5a623', emoji: '📚', route: '/learn' },
        { key: 'grow', color: '#4caf50', emoji: '🌱', route: '/grow' },
        { key: 'sell', color: '#e91e63', emoji: '🏪', route: '/sell' },
        { key: 'mandi', color: '#1565c0', emoji: '📈', route: '/mandi' },
        { key: 'calculator', color: '#f9a825', emoji: '💰', route: '/calculator' },
        { key: 'chat', color: '#7b5ea7', emoji: '🤖', route: '/chat' },
        { key: 'disease', color: '#e53935', emoji: '🔍', route: '/disease' },
        { key: 'plan', color: '#ff6f00', emoji: '📋', route: '/plan' },
      ].map((item) => (
        <TouchableOpacity
          key={item.key}
          style={[styles.stageCard, { borderLeftColor: item.color }]}
          onPress={() => router.push(item.route as any)}>
          <Text style={styles.stageEmoji}>{item.emoji}</Text>
          <View style={styles.stageText}>
            <Text style={styles.stageTitleText}>{t(`home.cards.${item.key}.title`)}</Text>
            <Text style={styles.stageDesc}>{t(`home.cards.${item.key}.desc`)}</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
      ))}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:         { flex: 1, backgroundColor: '#f5f7f5' },
  header:            { backgroundColor: '#1a6b3c', paddingTop: 52, paddingBottom: 24, paddingHorizontal: 20 },
  topRow:            { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  logoRow:           { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoMark:          { width: 42, height: 42, borderRadius: 21, backgroundColor: '#155e34', alignItems: 'center', justifyContent: 'center' },
  logoLeaf:          { fontSize: 22 },
  appName:           { fontSize: 28, fontWeight: 'bold', color: '#ffffff' },
  topButtons:        { flexDirection: 'row', gap: 8, alignItems: 'center' },
  langToggle:        { backgroundColor: '#155e34', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#4caf50' },
  langToggleText:    { color: '#ffffff', fontSize: 13, fontWeight: '700' },
  profileButton:     { backgroundColor: '#155e34', width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  profileButtonText: { fontSize: 18 },
  tagline:           { fontSize: 13, color: '#a8d5b5' },
  welcomeCard:       { backgroundColor: '#ffffff', margin: 16, padding: 20, borderRadius: 12, elevation: 3 },
  welcomeTitle:      { fontSize: 18, fontWeight: '600', color: '#1a1a1a', marginBottom: 8 },
  welcomeText:       { fontSize: 14, color: '#666666', lineHeight: 22 },
  sectionTitle:      { fontSize: 16, fontWeight: '600', color: '#1a1a1a', paddingHorizontal: 16, marginBottom: 12 },
  stageCard:         { backgroundColor: '#ffffff', marginHorizontal: 16, marginBottom: 12, padding: 18, borderRadius: 12, borderLeftWidth: 4, flexDirection: 'row', alignItems: 'center', elevation: 2 },
  stageEmoji:        { fontSize: 28, marginRight: 14 },
  stageText:         { flex: 1 },
  stageTitleText:    { fontSize: 15, fontWeight: '600', color: '#1a1a1a', marginBottom: 4 },
  stageDesc:         { fontSize: 13, color: '#888888' },
  arrow:             { fontSize: 22, color: '#cccccc' },
});