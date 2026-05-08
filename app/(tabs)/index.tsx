import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, Dimensions, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import i18n, { changeLanguage } from '../../lib/i18n';

const { width } = Dimensions.get('window');
const CARD_SIZE = (width - 48) / 2;

const CARDS = [
  { key: 'land',       color: '#1a6b3c', bg: '#e8f5e9', emoji: '🌍', route: '/land' },
  { key: 'learn',      color: '#e65100', bg: '#fff3e0', emoji: '📚', route: '/learn' },
  { key: 'grow',       color: '#2e7d32', bg: '#c8e6c9', emoji: '🌱', route: '/grow' },
  { key: 'sell',       color: '#880e4f', bg: '#fce4ec', emoji: '🏪', route: '/sell' },
  { key: 'mandi',      color: '#1565c0', bg: '#e3f2fd', emoji: '📈', route: '/mandi' },
  { key: 'calculator', color: '#f57f17', bg: '#fffde7', emoji: '💰', route: '/calculator' },
  { key: 'chat',       color: '#4a148c', bg: '#f3e5f5', emoji: '🤖', route: '/chat' },
  { key: 'disease',    color: '#b71c1c', bg: '#ffebee', emoji: '🔍', route: '/disease' },
  { key: 'plan',       color: '#bf360c', bg: '#fbe9e7', emoji: '📋', route: '/plan' },
];

function GridCard({ item, index, t, router }: any) {
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const pressAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 400, delay: index * 60, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, delay: index * 60, friction: 6, useNativeDriver: true }),
    ]).start();
  }, []);

  const onPressIn  = () => Animated.spring(pressAnim, { toValue: 0.93, useNativeDriver: true }).start();
  const onPressOut = () => Animated.spring(pressAnim, { toValue: 1, friction: 4, useNativeDriver: true }).start();

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: Animated.multiply(scaleAnim, pressAnim) }] }}>
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={() => router.push(item.route)}
        style={[styles.gridCard, { backgroundColor: item.bg, width: CARD_SIZE, height: CARD_SIZE }]}>
        <View style={[styles.emojiBox, { backgroundColor: item.color + '22' }]}>
          <Text style={styles.gridEmoji}>{item.emoji}</Text>
        </View>
        <Text style={[styles.gridTitle, { color: item.color }]} numberOfLines={2}>
          {t(`home.cards.${item.key}.title`)}
        </Text>
        <View style={[styles.gridDot, { backgroundColor: item.color }]} />
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const { t }  = useTranslation();
  const headerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerAnim, { toValue: 1, duration: 700, useNativeDriver: true }).start();
  }, []);

  const toggleLang = () => changeLanguage(i18n.language === 'en' ? 'hi' : 'en');

  const rows = [];
  for (let i = 0; i < CARDS.length; i += 2) {
    rows.push(CARDS.slice(i, i + 2));
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="light-content" backgroundColor="#1a6b3c" />

      {/* Header */}
      <Animated.View style={[styles.header, { opacity: headerAnim }]}>
        <View style={styles.headerTop}>
          <View style={styles.logoRow}>
            <View style={styles.logoMark}>
              <Text style={styles.logoLeaf}>🌿</Text>
            </View>
            <View>
              <Text style={styles.appName}>{t('common.appName')}</Text>
              <Text style={styles.tagline}>{t('common.tagline')}</Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.langToggle} onPress={toggleLang}>
              <Text style={styles.langToggleText}>{i18n.language === 'en' ? 'हिं' : 'EN'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.profileBtn} onPress={() => router.push('/profile')}>
              <Text style={styles.profileBtnText}>👤</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Welcome Banner */}
        <View style={styles.welcomeBanner}>
          <View style={styles.welcomeLeft}>
            <Text style={styles.welcomeTitle}>{t('home.namaste')}</Text>
            <Text style={styles.welcomeSubtitle}>{t('home.welcomeText')}</Text>
          </View>
          <Text style={styles.welcomeIllustration}>🌾</Text>
        </View>
      </Animated.View>

      {/* Grid */}
      <View style={styles.gridSection}>
        <Text style={styles.sectionLabel}>{t('home.journeyTitle')}</Text>
        {rows.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.gridRow}>
            {row.map((item, colIndex) => (
              <GridCard
                key={item.key}
                item={item}
                index={rowIndex * 2 + colIndex}
                t={t}
                router={router}
              />
            ))}
            {/* Fill empty slot if odd number */}
            {row.length === 1 && <View style={{ width: CARD_SIZE }} />}
          </View>
        ))}
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:           { flex: 1, backgroundColor: '#f0f4f0' },
  header:              { backgroundColor: '#1a6b3c', paddingTop: 52, paddingBottom: 28, paddingHorizontal: 20, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  headerTop:           { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  logoRow:             { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logoMark:            { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  logoLeaf:            { fontSize: 22 },
  appName:             { fontSize: 22, fontWeight: '800', color: '#ffffff', letterSpacing: 0.5 },
  tagline:             { fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 1 },
  headerActions:       { flexDirection: 'row', gap: 8, alignItems: 'center' },
  langToggle:          { backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  langToggleText:      { color: '#ffffff', fontSize: 13, fontWeight: '700' },
  profileBtn:          { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  profileBtnText:      { fontSize: 18 },
  welcomeBanner:       { backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  welcomeLeft:         { flex: 1, marginRight: 12 },
  welcomeTitle:        { fontSize: 17, fontWeight: '700', color: '#ffffff', marginBottom: 6 },
  welcomeSubtitle:     { fontSize: 12, color: 'rgba(255,255,255,0.8)', lineHeight: 18 },
  welcomeIllustration: { fontSize: 48 },
  gridSection:         { paddingHorizontal: 16, paddingTop: 24 },
  sectionLabel:        { fontSize: 13, fontWeight: '700', color: '#666', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 16 },
  gridRow:             { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  gridCard:            { borderRadius: 24, padding: 18, justifyContent: 'space-between', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8 },
  emojiBox:            { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  gridEmoji:           { fontSize: 28 },
  gridTitle:           { fontSize: 15, fontWeight: '800', lineHeight: 20, flex: 1 },
  gridDot:             { width: 6, height: 6, borderRadius: 3, marginTop: 8 },
});