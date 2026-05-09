import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator, Animated, Dimensions, ScrollView,
  StatusBar, StyleSheet, Text, TouchableOpacity, View
} from 'react-native';
import i18n, { changeLanguage } from '../../lib/i18n';
import { supabase } from '../../lib/supabase';
import { fetchWeather, WeatherData } from '../../lib/weather';

const { width } = Dimensions.get('window');
const CARD_SIZE = (width - 52) / 2;

const CARDS = [
  { key: 'land',       color: '#1a6b3c', bg: '#e8f5e9', emoji: '🌍', route: '/land',       span: false },
  { key: 'learn',      color: '#e65100', bg: '#fff3e0', emoji: '📚', route: '/learn',      span: false },
  { key: 'grow',       color: '#2e7d32', bg: '#dcedc8', emoji: '🌱', route: '/grow',       span: false },
  { key: 'sell',       color: '#880e4f', bg: '#fce4ec', emoji: '🏪', route: '/sell',       span: false },
  { key: 'mandi',      color: '#1565c0', bg: '#e3f2fd', emoji: '📈', route: '/mandi',      span: false },
  { key: 'calculator', color: '#f57f17', bg: '#fffde7', emoji: '💰', route: '/calculator', span: false },
  { key: 'chat',       color: '#4a148c', bg: '#f3e5f5', emoji: '🤖', route: '/chat',       span: false },
  { key: 'disease',    color: '#b71c1c', bg: '#ffebee', emoji: '🔍', route: '/disease',    span: false },
  { key: 'plan',       color: '#bf360c', bg: '#fbe9e7', emoji: '📋', route: '/plan',       span: true  },
];



function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}

function GridCard({ item, index, t, router }: any) {
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const pressAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 350, delay: index * 55, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 350, delay: index * 55, useNativeDriver: true }),
    ]).start();
  }, []);

  const onPressIn  = () => Animated.spring(pressAnim, { toValue: 0.94, useNativeDriver: true, speed: 50 }).start();
  const onPressOut = () => Animated.spring(pressAnim, { toValue: 1, friction: 4, useNativeDriver: true }).start();

  const cardWidth = item.span ? width - 32 : CARD_SIZE;

  return (
    <Animated.View style={{
      opacity: fadeAnim,
      transform: [{ translateY: slideAnim }, { scale: pressAnim }],
      width: cardWidth,
    }}>
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={() => router.push(item.route)}
        style={[
          styles.card,
          {
            backgroundColor: item.bg,
            width: cardWidth,
            height: item.span ? 90 : CARD_SIZE,
            flexDirection: item.span ? 'row' : 'column',
            alignItems: item.span ? 'center' : 'flex-start',
          }
        ]}>
        <View style={[styles.iconBox, { backgroundColor: item.color + '20' }]}>
          <Text style={styles.emoji}>{item.emoji}</Text>
        </View>
        <View style={[styles.cardContent, item.span && { flex: 1, marginLeft: 14, marginBottom: 0 }]}>
          <Text style={[styles.cardTitle, { color: item.color }]} numberOfLines={2}>
            {t(`home.cards.${item.key}.title`)}
          </Text>
          <Text style={[styles.cardDesc, { color: item.color + '99' }]} numberOfLines={2}>
            {t(`home.cards.${item.key}.desc`)}
          </Text>
        </View>
        <View style={[styles.arrowBox, { backgroundColor: item.color + '18' }]}>
          <Text style={[styles.arrowText, { color: item.color }]}>›</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function HomeScreen() {
  const router       = useRouter();
  const { t }        = useTranslation();
  const headerFade   = useRef(new Animated.Value(0)).current;
  const headerSlide  = useRef(new Animated.Value(-16)).current;

  const [farmerName, setFarmerName]     = useState('Kisan');
  const [savedCrop, setSavedCrop]       = useState<string | null>(null);
  const [cropProgress, setCropProgress] = useState(0);
  const [daysLeft, setDaysLeft]         = useState(0);
  const [estEarning, setEstEarning]     = useState('₹0');
  const [loading, setLoading]           = useState(true);

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);

  const loadFarmerData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (!data) {
        await supabase.from('profiles').upsert({
          id: user.id, full_name: '', phone: '', state: '',
        });
        setLoading(false);
        return;
      }

      // Set name
      if (data.full_name?.trim()) {
        setFarmerName(data.full_name.trim().split(' ')[0]);
      }

      // Set crop and progress
      if (data.saved_crop?.trim()) {
        setSavedCrop(data.saved_crop);

        if (data.crop_start_date && data.crop_cycle_days > 0) {
          const start    = new Date(data.crop_start_date);
          const today    = new Date();
          const total    = data.crop_cycle_days;
          const gone     = Math.max(0, Math.floor((today.getTime() - start.getTime()) / 86400000));
          const left     = Math.max(0, total - gone);
          const progress = Math.min(100, Math.round((gone / total) * 100));

          setDaysLeft(left);
          setCropProgress(progress);

          if (data.crop_profit_max > 0) {
            const earned = Math.round((progress / 100) * data.crop_profit_max);
            setEstEarning(`₹${earned.toLocaleString('en-IN')}`);
          }
        }
      } else {
        // Reset if no crop
        setSavedCrop(null);
        setCropProgress(0);
        setDaysLeft(0);
        setEstEarning('₹0');
      }
    } catch (e: any) {
      console.log('Home load error:', e?.message);
    } finally {
      setLoading(false);
    }
  };

  // Animate header on mount
  useEffect(() => {
  Animated.parallel([
    Animated.timing(headerFade,  { toValue: 1, duration: 700, useNativeDriver: true }),
    Animated.timing(headerSlide, { toValue: 0, duration: 700, useNativeDriver: true }),
  ]).start();

  // Load real weather
  fetchWeather().then(data => {
    setWeather(data);
    setWeatherLoading(false);
  });
}, []);

  const toggleLang = () => changeLanguage(i18n.language === 'en' ? 'hi' : 'en');

  const regularCards = CARDS.filter(c => !c.span);
  const spanCards    = CARDS.filter(c => c.span);
  const rows: any[][] = [];
  for (let i = 0; i < regularCards.length; i += 2) {
    rows.push(regularCards.slice(i, i + 2));
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 32 }}>
      <StatusBar barStyle="light-content" backgroundColor="#1a6b3c" />

      {/* ── Header ── */}
      <Animated.View style={[styles.header, { opacity: headerFade, transform: [{ translateY: headerSlide }] }]}>
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

        {/* Greeting */}
        <View style={styles.greetingRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greetingTime}>{getGreeting()} 👋</Text>
            <Text style={styles.greetingName}>Namaste, {farmerName}!</Text>
            <Text style={styles.greetingSub}>Discover modern farming that earns 3× more</Text>
          </View>
          <Text style={styles.greetingArt}>🌾</Text>
        </View>

       {/* Weather */}
        <View style={styles.weatherCard}>
          {weatherLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : weather ? (
            <>
              <Text style={styles.weatherIcon}>{weather.icon}</Text>
              <View style={styles.weatherMiddle}>
                <Text style={styles.weatherTemp}>
                  {weather.temp}°C · {weather.condition}
                </Text>
                <Text style={styles.weatherDetails}>
                  💧 {weather.humidity}%  💨 {weather.wind} km/h · {weather.advice}
                </Text>
              </View>
              <View style={styles.weatherRight}>
                <Text style={styles.weatherCity}>{weather.city}</Text>
                <Text style={styles.weatherFeels}>Feels {weather.feelsLike}°C</Text>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.weatherIcon}>🌡️</Text>
              <View style={styles.weatherMiddle}>
                <Text style={styles.weatherTemp}>Weather unavailable</Text>
                <Text style={styles.weatherDetails}>Enable location for weather updates</Text>
              </View>
            </>
          )}
        </View>
      </Animated.View> {/* ← ADD THIS LINE */}

      {/* ── Stats Row ── */}
      <View style={styles.statsRow}>
        {[
          { emoji: '🌱', value: savedCrop ? '1' : '0', label: 'Active Crops' },
          { emoji: '💰', value: savedCrop ? estEarning : '₹0', label: 'This Month' },
          { emoji: '✅', value: '3', label: 'Tasks Today' },
        ].map((stat, i) => (
          <View key={i} style={styles.statCard}>
            <Text style={styles.statEmoji}>{stat.emoji}</Text>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* ── Active Crop Progress ── */}
      {loading ? (
        <View style={styles.cropCard}>
          <ActivityIndicator color="#1a6b3c" />
        </View>
      ) : savedCrop ? (
        <View style={styles.cropCard}>
          <View style={styles.cropHeader}>
            <View>
              <Text style={styles.cropLabel}>Active Crop</Text>
              <Text style={styles.cropName}>{savedCrop}</Text>
            </View>
            <View style={styles.daysLeftBadge}>
              <Text style={styles.daysLeftText}>
                {daysLeft > 0 ? `${daysLeft} days left` : 'Harvest ready! 🎉'}
              </Text>
            </View>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${Math.max(2, cropProgress)}%` as any }]} />
          </View>
          <View style={styles.cropFooter}>
            <Text style={styles.cropPercent}>{cropProgress}% complete</Text>
            <Text style={styles.cropEarning}>Est. {estEarning}</Text>
          </View>
        </View>
      ) : (
        <TouchableOpacity style={styles.noCropCard} onPress={() => router.push('/land')}>
          <Text style={styles.noCropEmoji}>🌍</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.noCropTitle}>No crop started yet</Text>
            <Text style={styles.noCropSub}>Take Land Assessment to get started →</Text>
          </View>
        </TouchableOpacity>
      )}

      {/* ── Grid Cards ── */}
      <View style={styles.gridSection}>
        <Text style={styles.sectionLabel}>{t('home.journeyTitle')}</Text>

        {rows.map((row, ri) => (
          <View key={ri} style={styles.row}>
            {row.map((item, ci) => (
              <GridCard key={item.key} item={item} index={ri * 2 + ci} t={t} router={router} />
            ))}
            {row.length === 1 && <View style={{ width: CARD_SIZE }} />}
          </View>
        ))}

        {spanCards.map((item, i) => (
          <GridCard key={item.key} item={item} index={regularCards.length + i} t={t} router={router} />
        ))}
      </View>
    </ScrollView>
    );
}    

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: '#f0f4f0' },
  header:          { backgroundColor: '#1a6b3c', paddingTop: 52, paddingBottom: 28, paddingHorizontal: 20, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  headerTop:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  logoRow:         { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logoMark:        { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' },
  logoLeaf:        { fontSize: 22 },
  appName:         { fontSize: 22, fontWeight: '800', color: '#fff', letterSpacing: 0.3 },
  tagline:         { fontSize: 11, color: 'rgba(255,255,255,0.65)', marginTop: 1 },
  headerActions:   { flexDirection: 'row', gap: 8, alignItems: 'center' },
  langToggle:      { backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' },
  langToggleText:  { color: '#fff', fontSize: 13, fontWeight: '700' },
  profileBtn:      { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' },
  profileBtnText:  { fontSize: 18 },
  greetingRow:     { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  greetingTime:    { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginBottom: 3 },
  greetingName:    { fontSize: 22, fontWeight: '800', color: '#fff', marginBottom: 4 },
  greetingSub:     { fontSize: 12, color: 'rgba(255,255,255,0.72)', lineHeight: 18 },
  greetingArt:     { fontSize: 48, marginLeft: 10 },
  weatherCard:     { backgroundColor: 'rgba(255,255,255,0.13)', borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  weatherIcon:     { fontSize: 32 },
  weatherMiddle:   { flex: 1 },
  weatherTemp:     { fontSize: 14, fontWeight: '700', color: '#fff', marginBottom: 3 },
  weatherDetails:  { fontSize: 11, color: 'rgba(255,255,255,0.75)' },
  weatherRight:    { alignItems: 'flex-end' },
  weatherCity:     { fontSize: 12, color: '#fff', fontWeight: '700', marginBottom: 2 },
  weatherFeels:    { fontSize: 10, color: 'rgba(255,255,255,0.7)' },
  statsRow:        { flexDirection: 'row', gap: 10, marginHorizontal: 16, marginTop: -18, marginBottom: 14 },
  statCard:        { flex: 1, backgroundColor: '#fff', borderRadius: 18, padding: 14, alignItems: 'center', elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.1, shadowRadius: 8 },
  statEmoji:       { fontSize: 22, marginBottom: 5 },
  statValue:       { fontSize: 15, fontWeight: '800', color: '#1a1a1a', marginBottom: 2 },
  statLabel:       { fontSize: 10, color: '#999', fontWeight: '500', textAlign: 'center' },
  cropCard:        { backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 18, padding: 18, marginBottom: 14, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6, minHeight: 80, justifyContent: 'center' },
  cropHeader:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  cropLabel:       { fontSize: 11, color: '#aaa', fontWeight: '600', marginBottom: 4 },
  cropName:        { fontSize: 18, fontWeight: '800', color: '#1a1a1a' },
  daysLeftBadge:   { backgroundColor: '#e8f5e9', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  daysLeftText:    { fontSize: 12, color: '#1a6b3c', fontWeight: '700' },
  progressBarBg:   { height: 8, backgroundColor: '#e8f5e9', borderRadius: 4, marginBottom: 10, overflow: 'hidden' },
  progressBarFill: { height: 8, backgroundColor: '#1a6b3c', borderRadius: 4 },
  cropFooter:      { flexDirection: 'row', justifyContent: 'space-between' },
  cropPercent:     { fontSize: 12, color: '#888' },
  cropEarning:     { fontSize: 13, color: '#1a6b3c', fontWeight: '700' },
  noCropCard:      { backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 18, padding: 16, marginBottom: 14, flexDirection: 'row', alignItems: 'center', gap: 12, elevation: 2, borderWidth: 1.5, borderColor: '#c8e6c9', borderStyle: 'dashed' },
  noCropEmoji:     { fontSize: 32 },
  noCropTitle:     { fontSize: 14, fontWeight: '700', color: '#444', marginBottom: 3 },
  noCropSub:       { fontSize: 12, color: '#1a6b3c', fontWeight: '600' },
  gridSection:     { paddingHorizontal: 16, paddingTop: 8, gap: 12 },
  sectionLabel:    { fontSize: 11, fontWeight: '700', color: '#888', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 4 },
  row:             { flexDirection: 'row', gap: 12 },
  card:            { borderRadius: 22, padding: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8 },
  iconBox:         { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  emoji:           { fontSize: 26 },
  cardContent:     { flex: 1, marginBottom: 8 },
  cardTitle:       { fontSize: 14, fontWeight: '800', lineHeight: 19, marginBottom: 3 },
  cardDesc:        { fontSize: 10, lineHeight: 14, flexShrink: 1 },
  arrowBox:        { width: 26, height: 26, borderRadius: 8, alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-end' },
  arrowText:       { fontSize: 17, fontWeight: '700', marginTop: -1 },
});