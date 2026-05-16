import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator, Animated, Dimensions, ScrollView,
  StatusBar, StyleSheet, Text, TouchableOpacity, View
} from 'react-native';
import i18n, { changeLanguage } from '../../lib/i18n';
import { fs, hp, scale, wp } from '../../lib/responsive';
import { supabase } from '../../lib/supabase';
import { fetchWeather, WeatherData } from '../../lib/weather';

const { width } = Dimensions.get('window');
const CARD_WIDTH  = (width - wp(10)) / 2;
const CARD_HEIGHT = CARD_WIDTH * 0.9;

const CARDS = [
  { key: 'land',       color: '#1a6b3c', bg: '#e8f5e9', emoji: '🌍', route: '/land',       span: false },
  { key: 'learn',      color: '#e65100', bg: '#fff3e0', emoji: '📚', route: '/learn',      span: false },
  { key: 'grow',       color: '#2e7d32', bg: '#dcedc8', emoji: '🌱', route: '/grow',       span: false },
  { key: 'sell',       color: '#880e4f', bg: '#fce4ec', emoji: '🏪', route: '/sell',       span: false },
  { key: 'mandi',      color: '#1565c0', bg: '#e3f2fd', emoji: '📈', route: '/mandi',      span: false },
  { key: 'calculator', color: '#f57f17', bg: '#fffde7', emoji: '💰', route: '/calculator', span: false },
  { key: 'chat',       color: '#4a148c', bg: '#f3e5f5', emoji: '🤖', route: '/chat',       span: false },
  { key: 'disease',    color: '#b71c1c', bg: '#ffebee', emoji: '🔍', route: '/disease',    span: false },
  
  { key: 'plan',      color: '#bf360c', bg: '#fbe9e7', emoji: '📋', route: '/plan',      span: false },
{ key: 'checklist', color: '#1565c0', bg: '#e3f2fd', emoji: '✅', route: '/checklist', span: false },
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

  const iconSize = scale(46);
  const cardW    = item.span ? width - wp(8) : CARD_WIDTH;
  const cardH    = item.span ? scale(80) : CARD_HEIGHT;

  return (
    <Animated.View style={{
      opacity: fadeAnim,
      transform: [{ translateY: slideAnim }, { scale: pressAnim }],
      width: cardW,
    }}>
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={() => router.push(item.route)}
        style={[styles.card, {
          backgroundColor: item.bg,
          width: cardW,
          height: cardH,
          flexDirection: item.span ? 'row' : 'column',
          alignItems: item.span ? 'center' : 'flex-start',
          padding: scale(14),
        }]}>

        {/* Icon */}
        <View style={[styles.iconBox, {
          backgroundColor: item.color + '20',
          width: iconSize,
          height: iconSize,
          borderRadius: scale(13),
          marginBottom: item.span ? 0 : scale(8),
        }]}>
          <Text style={{ fontSize: scale(24) }}>{item.emoji}</Text>
        </View>

        {/* Text */}
        <View style={[styles.cardContent, item.span && { flex: 1, marginLeft: scale(12), marginBottom: 0 }]}>
          <Text style={[styles.cardTitle, {
            color: item.color,
            fontSize: fs(13),
          }]} numberOfLines={2}>
            {t(`home.cards.${item.key}.title`)}
          </Text>
          <Text style={[styles.cardDesc, {
            color: item.color + '99',
            fontSize: fs(10),
          }]} numberOfLines={2}>
            {t(`home.cards.${item.key}.desc`)}
          </Text>
        </View>

        {/* Arrow */}
        <View style={[styles.arrowBox, {
          backgroundColor: item.color + '18',
          width: scale(24),
          height: scale(24),
          borderRadius: scale(8),
        }]}>
          <Text style={[styles.arrowText, { color: item.color, fontSize: fs(16) }]}>›</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function HomeScreen() {
  const router      = useRouter();
  const { t }       = useTranslation();
  const headerFade  = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(-16)).current;

  const [farmerName, setFarmerName]     = useState('Kisan');
  const [savedCrop, setSavedCrop]       = useState<string | null>(null);
  const [cropProgress, setCropProgress] = useState(0);
  const [daysLeft, setDaysLeft]         = useState(0);
  const [estEarning, setEstEarning]     = useState('₹0');
  const [loading, setLoading]           = useState(true);
  const [weather, setWeather]           = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);

  const loadFarmerData = async () => {
    const timeout = setTimeout(() => setLoading(false), 6000);
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) { clearTimeout(timeout); setLoading(false); return; }

      const { data, error: profileError } = await supabase
        .from('profiles').select('*').eq('id', user.id).maybeSingle();

      if (profileError || !data) {
        if (!data) await supabase.from('profiles').upsert({ id: user.id, full_name: '', phone: '', state: '' });
        clearTimeout(timeout); setLoading(false); return;
      }

      if (data.full_name?.trim()) setFarmerName(data.full_name.trim().split(' ')[0]);

      if (data.saved_crop?.trim()) {
        setSavedCrop(data.saved_crop);
        if (data.crop_start_date && data.crop_cycle_days > 0) {
          const gone     = Math.max(0, Math.floor((Date.now() - new Date(data.crop_start_date).getTime()) / 86400000));
          const left     = Math.max(0, data.crop_cycle_days - gone);
          const progress = Math.min(100, Math.round((gone / data.crop_cycle_days) * 100));
          setDaysLeft(left);
          setCropProgress(progress);
          if (data.crop_profit_max > 0)
            setEstEarning(`₹${Math.round((progress / 100) * data.crop_profit_max).toLocaleString('en-IN')}`);
        }
      } else {
        setSavedCrop(null); setCropProgress(0); setDaysLeft(0); setEstEarning('₹0');
      }
    } catch (e: any) {
      console.log('Home error:', e?.message);
    } finally {
      clearTimeout(timeout); setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => {
    setLoading(true);
    loadFarmerData();
  }, []));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerFade,  { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(headerSlide, { toValue: 0, duration: 700, useNativeDriver: true }),
    ]).start();
    fetchWeather().then(d => { setWeather(d); setWeatherLoading(false); }).catch(() => setWeatherLoading(false));
  }, []);

  const toggleLang   = () => changeLanguage(i18n.language === 'en' ? 'hi' : 'en');
  const regularCards = CARDS.filter(c => !c.span);
  const spanCards    = CARDS.filter(c => c.span);
  const rows: any[][] = [];
  for (let i = 0; i < regularCards.length; i += 2) rows.push(regularCards.slice(i, i + 2));

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: hp(12) }}>
      <StatusBar barStyle="light-content" backgroundColor="#1a6b3c" />

      {/* ── Header ── */}
      <Animated.View style={[styles.header, { opacity: headerFade, transform: [{ translateY: headerSlide }] }]}>
        <View style={styles.headerTop}>
          <View style={styles.logoRow}>
            <View style={styles.logoMark}>
              <Text style={{ fontSize: scale(22) }}>🌿</Text>
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
              <Text style={{ fontSize: scale(18) }}>👤</Text>
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
          <Text style={{ fontSize: scale(44), marginLeft: scale(10) }}>🌾</Text>
        </View>

        {/* Weather */}
        <View style={styles.weatherCard}>
          {weatherLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : weather ? (
            <>
              <Text style={{ fontSize: scale(30) }}>{weather.icon}</Text>
              <View style={styles.weatherMiddle}>
                <Text style={styles.weatherTemp}>{weather.temp}°C · {weather.condition}</Text>
                <Text style={styles.weatherDetails}>💧 {weather.humidity}%  💨 {weather.wind} km/h · {weather.advice}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.weatherCity}>{weather.city}</Text>
                <Text style={styles.weatherFeels}>Feels {weather.feelsLike}°C</Text>
              </View>
            </>
          ) : (
            <>
              <Text style={{ fontSize: scale(28) }}>🌡️</Text>
              <View style={styles.weatherMiddle}>
                <Text style={styles.weatherTemp}>Weather unavailable</Text>
                <Text style={styles.weatherDetails}>Enable location for weather updates</Text>
              </View>
            </>
          )}
        </View>
      </Animated.View>

      {/* ── Stats Row ── */}
      <View style={styles.statsRow}>
        {[
          { emoji: '🌱', value: savedCrop ? '1' : '0', label: 'Active Crops' },
          { emoji: '💰', value: savedCrop ? estEarning : '₹0', label: 'This Month' },
          { emoji: '✅', value: '3', label: 'Tasks Today' },
        ].map((stat, i) => (
          <View key={i} style={styles.statCard}>
            <Text style={{ fontSize: scale(30), marginBottom: scale(4) }}>{stat.emoji}</Text>
            <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>
              {stat.value}
            </Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* ── Active Crop Progress ── */}
      {loading ? (
        <View style={styles.cropCard}><ActivityIndicator color="#1a6b3c" /></View>
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
          <Text style={{ fontSize: scale(32) }}>🌍</Text>
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
            {row.length === 1 && <View style={{ width: CARD_WIDTH }} />}
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
  header:          { backgroundColor: '#1a6b3c', paddingTop: hp(7), paddingBottom: hp(3.5), paddingHorizontal: wp(5), borderBottomLeftRadius: scale(30), borderBottomRightRadius: scale(30) },
  headerTop:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: scale(20) },
  logoRow:         { flexDirection: 'row', alignItems: 'center', gap: scale(12) },
  logoMark:        { width: scale(44), height: scale(44), borderRadius: scale(14), backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' },
  appName:         { fontSize: fs(22), fontWeight: '800', color: '#fff', letterSpacing: 0.3 },
  tagline:         { fontSize: fs(11), color: 'rgba(255,255,255,0.65)', marginTop: 1 },
  headerActions:   { flexDirection: 'row', gap: scale(8), alignItems: 'center' },
  langToggle:      { backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: scale(12), paddingVertical: scale(6), borderRadius: scale(20), borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' },
  langToggleText:  { color: '#fff', fontSize: fs(13), fontWeight: '700' },
  profileBtn:      { width: scale(36), height: scale(36), borderRadius: scale(18), backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' },
  greetingRow:     { flexDirection: 'row', alignItems: 'center', marginBottom: scale(16) },
  greetingTime:    { fontSize: fs(13), color: 'rgba(255,255,255,0.75)', marginBottom: scale(3) },
  greetingName:    { fontSize: fs(22), fontWeight: '800', color: '#fff', marginBottom: scale(4) },
  greetingSub:     { fontSize: fs(12), color: 'rgba(255,255,255,0.72)', lineHeight: scale(18) },
  weatherCard:     { backgroundColor: 'rgba(255,255,255,0.13)', borderRadius: scale(16), padding: scale(14), flexDirection: 'row', alignItems: 'center', gap: scale(12) },
  weatherMiddle:   { flex: 1 },
  weatherTemp:     { fontSize: fs(14), fontWeight: '700', color: '#fff', marginBottom: scale(3) },
  weatherDetails:  { fontSize: fs(11), color: 'rgba(255,255,255,0.75)' },
  weatherCity:     { fontSize: fs(12), color: '#fff', fontWeight: '700', marginBottom: scale(2) },
  weatherFeels:    { fontSize: fs(10), color: 'rgba(255,255,255,0.7)' },
  statsRow:        { flexDirection: 'row', gap: scale(10), marginHorizontal: wp(4), marginTop: scale(-18), marginBottom: scale(14) },
  statCard:        { flex: 1, backgroundColor: '#fff', borderRadius: scale(18), padding: scale(12), alignItems: 'center', elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.1, shadowRadius: 8 },
  statValue:       { fontSize: fs(14), fontWeight: '800', color: '#1a1a1a', marginBottom: scale(2) },
  statLabel:       { fontSize: fs(9), color: '#999', fontWeight: '500', textAlign: 'center' },
  cropCard:        { backgroundColor: '#fff', marginHorizontal: wp(4), borderRadius: scale(18), padding: scale(18), marginBottom: scale(14), elevation: 2, minHeight: scale(80), justifyContent: 'center' },
  cropHeader:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: scale(14) },
  cropLabel:       { fontSize: fs(11), color: '#aaa', fontWeight: '600', marginBottom: scale(4) },
  cropName:        { fontSize: fs(18), fontWeight: '800', color: '#1a1a1a' },
  daysLeftBadge:   { backgroundColor: '#e8f5e9', paddingHorizontal: scale(12), paddingVertical: scale(5), borderRadius: scale(20) },
  daysLeftText:    { fontSize: fs(12), color: '#1a6b3c', fontWeight: '700' },
  progressBarBg:   { height: scale(8), backgroundColor: '#e8f5e9', borderRadius: scale(4), marginBottom: scale(10), overflow: 'hidden' },
  progressBarFill: { height: scale(8), backgroundColor: '#1a6b3c', borderRadius: scale(4) },
  cropFooter:      { flexDirection: 'row', justifyContent: 'space-between' },
  cropPercent:     { fontSize: fs(12), color: '#888' },
  cropEarning:     { fontSize: fs(13), color: '#1a6b3c', fontWeight: '700' },
  noCropCard:      { backgroundColor: '#fff', marginHorizontal: wp(4), borderRadius: scale(18), padding: scale(16), marginBottom: scale(14), flexDirection: 'row', alignItems: 'center', gap: scale(12), elevation: 2, borderWidth: 1.5, borderColor: '#c8e6c9', borderStyle: 'dashed' },
  noCropTitle:     { fontSize: fs(14), fontWeight: '700', color: '#444', marginBottom: scale(3) },
  noCropSub:       { fontSize: fs(12), color: '#1a6b3c', fontWeight: '600' },
  gridSection:     { paddingHorizontal: wp(4), paddingTop: scale(8), gap: scale(12) },
  sectionLabel:    { fontSize: fs(11), fontWeight: '700', color: '#888', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: scale(4) },
  row:             { flexDirection: 'row', gap: scale(12) },
  card:            { borderRadius: scale(22), elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8 },
  iconBox:         { alignItems: 'center', justifyContent: 'center' },
  cardContent:     { flex: 1, marginBottom: scale(6) },
  cardTitle:       { fontWeight: '800', lineHeight: scale(18), marginBottom: scale(3) },
  cardDesc:        { lineHeight: scale(13), flexShrink: 1 },
  arrowBox:        { alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-end' },
  arrowText:       { fontWeight: '700', marginTop: -1 },
});