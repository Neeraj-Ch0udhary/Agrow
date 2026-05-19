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

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}

// ── Quick action pills (horizontal scroll) ────────────────────────────────
const QUICK_ACTIONS = [
  { emoji: '📈', label: 'Mandi',      route: '/mandi',      color: '#1565c0', bg: '#e3f2fd' },
  { emoji: '🤖', label: 'Agrow AI',   route: '/chat',       color: '#4a148c', bg: '#f3e5f5' },
  { emoji: '🔍', label: 'Disease',    route: '/disease',    color: '#b71c1c', bg: '#ffebee' },
  { emoji: '💰', label: 'Calculator', route: '/calculator', color: '#f57f17', bg: '#fffde7' },
  { emoji: '🏪', label: 'Agri Shops', route: '/agri-shops', color: '#00695c', bg: '#e0f2f1' },
  { emoji: '🔔', label: 'Alerts',     route: '/notifications', color: '#c62828', bg: '#ffebee' },
];

// ── Main feature cards (large, visual) ───────────────────────────────────
const FEATURE_CARDS = [
  {
    key: 'land',
    emoji: '🌍',
    title: 'Land Assessment',
    desc: 'Find the best crop for your land, budget & climate',
    route: '/land',
    color: '#1a6b3c',
    gradient: ['#1a6b3c', '#2e7d32'],
    dark: true,
    wide: false,
  },
  {
    key: 'learn',
    emoji: '📚',
    title: 'Crop Guides',
    desc: 'Step-by-step guides for 16 modern crops',
    route: '/learn',
    color: '#e65100',
    gradient: ['#fff3e0', '#ffe0b2'],
    dark: false,
    wide: false,
  },
  {
    key: 'checklist',
    emoji: '✅',
    title: 'Daily Checklist',
    desc: 'Today\'s farming tasks — phase by phase',
    route: '/checklist',
    color: '#1565c0',
    gradient: ['#1565c0', '#1976d2'],
    dark: true,
    wide: true, // full width
  },
  {
  key: 'grow',
  emoji: '🌱',
  title: 'Grow',
  desc: 'Daily farming support',
  route: '/grow',
  color: '#2e7d32',
  gradient: ['#2e7d32', '#388e3c'],
  dark: true,   // ← change to true so it uses solid green
  wide: false,
},
{
  key: 'sell',
  emoji: '🏪',
  title: 'Sell',
  desc: 'Find buyers, earn more',
  route: '/sell',
  color: '#880e4f',
  gradient: ['#880e4f', '#ad1457'],
  dark: true,   // ← change to true so it uses solid pink/maroon
  wide: false,
},
  {
    key: 'plan',
    emoji: '📋',
    title: 'Farming Plan',
    desc: 'AI generates your complete plan',
    route: '/plan',
    color: '#bf360c',
    gradient: ['#bf360c', '#d84315'],
    dark: true,
    wide: true,
  },
];

export default function HomeScreen() {
  const router      = useRouter();
  const { t }       = useTranslation();
  const headerFade  = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(-16)).current;

  const [farmerName,    setFarmerName]    = useState('Kisan');
  const [savedCrop,     setSavedCrop]     = useState<string | null>(null);
  const [cropProgress,  setCropProgress]  = useState(0);
  const [daysLeft,      setDaysLeft]      = useState(0);
  const [estEarning,    setEstEarning]    = useState('₹0');
  const [loading,       setLoading]       = useState(true);
  const [weather,       setWeather]       = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);

  const loadFarmerData = async () => {
    const timeout = setTimeout(() => setLoading(false), 6000);
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) { clearTimeout(timeout); setLoading(false); return; }

      const { data } = await supabase
        .from('profiles').select('*').eq('id', user.id).maybeSingle();

      if (!data) {
        await supabase.from('profiles').upsert({ id: user.id, full_name: '', phone: '', state: '' });
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
    fetchWeather()
      .then(d => { setWeather(d); setWeatherLoading(false); })
      .catch(() => setWeatherLoading(false));
  }, []);

  const toggleLang = () => changeLanguage(i18n.language === 'en' ? 'hi' : 'en');

  // Split feature cards into pairs and wide
  const pairCards = FEATURE_CARDS.filter(c => !c.wide);
  const wideCards = FEATURE_CARDS.filter(c => c.wide);
  const pairs: any[][] = [];
  for (let i = 0; i < pairCards.length; i += 2) pairs.push(pairCards.slice(i, i + 2));

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: hp(14) }}>
      <StatusBar barStyle="light-content" backgroundColor="#1a6b3c" />

      {/* ── HEADER ── */}
      <Animated.View style={[styles.header, {
        opacity: headerFade,
        transform: [{ translateY: headerSlide }],
      }]}>
        {/* Top bar */}
        <View style={styles.headerTop}>
          <View style={styles.logoRow}>
            <View style={styles.logoMark}>
              <Text style={{ fontSize: scale(20) }}>🌿</Text>
            </View>
            <View>
              <Text style={styles.appName}>Agrow</Text>
              <Text style={styles.tagline}>From land to marketplace</Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.iconBtn} onPress={toggleLang}>
              <Text style={styles.iconBtnText}>{i18n.language === 'en' ? 'हिं' : 'EN'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/notifications')}>
              <Text style={{ fontSize: scale(17) }}>🔔</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/profile')}>
              <Text style={{ fontSize: scale(17) }}>👤</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Greeting */}
        <View style={styles.greetingRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greetingTime}>{getGreeting()} 👋</Text>
            <Text style={styles.greetingName}>Namaste, {farmerName}!</Text>
            <Text style={styles.greetingSub}>Modern farming that earns 3× more</Text>
          </View>
          <Text style={{ fontSize: scale(50) }}>🌾</Text>
        </View>

        {/* Weather pill */}
        <View style={styles.weatherPill}>
          {weatherLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : weather ? (
            <>
              <Text style={{ fontSize: scale(22) }}>{weather.icon}</Text>
              <View style={{ flex: 1, marginLeft: scale(10) }}>
                <Text style={styles.weatherTemp}>{weather.temp}°C · {weather.condition}</Text>
                <Text style={styles.weatherSub}>💧{weather.humidity}% · 💨{weather.wind}km/h · {weather.advice}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.weatherCity}>{weather.city}</Text>
                <Text style={styles.weatherFeels}>Feels {weather.feelsLike}°C</Text>
              </View>
            </>
          ) : (
            <Text style={styles.weatherTemp}>🌡️ Weather unavailable</Text>
          )}
        </View>
      </Animated.View>

      {/* ── STATS ROW ── */}
      <View style={styles.statsRow}>
        {[
          { emoji: '🌱', value: savedCrop ? '1' : '0', label: 'Active Crops',  color: '#1a6b3c' },
          { emoji: '💰', value: savedCrop ? estEarning : '₹0', label: 'Est. Earned', color: '#f57f17' },
          { emoji: '✅', value: '3', label: 'Tasks Today', color: '#1565c0' },
        ].map((s, i) => (
          <View key={i} style={styles.statCard}>
            <Text style={styles.statEmoji}>{s.emoji}</Text>
            <Text style={[styles.statValue, { color: s.color }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>
              {s.value}
            </Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* ── ACTIVE CROP CARD ── */}
      {loading ? (
        <View style={styles.cropCard}>
          <ActivityIndicator color="#1a6b3c" />
        </View>
      ) : savedCrop ? (
        <TouchableOpacity style={styles.cropCard} onPress={() => router.push('/checklist')} activeOpacity={0.9}>
          <View style={styles.cropCardInner}>
            <View style={styles.cropLeft}>
              <Text style={styles.cropCardLabel}>🌱 Active Crop</Text>
              <Text style={styles.cropName}>{savedCrop}</Text>
              <View style={styles.progressBg}>
                <View style={[styles.progressFill, { width: `${Math.max(3, cropProgress)}%` as any }]} />
              </View>
              <Text style={styles.cropPercent}>{cropProgress}% complete</Text>
            </View>
            <View style={styles.cropRight}>
              <View style={styles.daysCircle}>
                <Text style={styles.daysNum}>{daysLeft}</Text>
                <Text style={styles.daysLabel}>days{'\n'}left</Text>
              </View>
              <Text style={styles.cropEarning}>{estEarning}</Text>
              <Text style={styles.cropEarningLabel}>estimated</Text>
            </View>
          </View>
          <View style={styles.cropCTA}>
            <Text style={styles.cropCTAText}>📋 View Today's Tasks →</Text>
          </View>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.noCropCard} onPress={() => router.push('/land')}>
          <Text style={{ fontSize: scale(36) }}>🌍</Text>
          <View style={{ flex: 1, marginLeft: scale(14) }}>
            <Text style={styles.noCropTitle}>No crop started yet</Text>
            <Text style={styles.noCropSub}>Take Land Assessment to get a personalized recommendation →</Text>
          </View>
        </TouchableOpacity>
      )}

      {/* ── QUICK ACTIONS (horizontal scroll) ── */}
      <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.quickScroll}
        contentContainerStyle={{ paddingHorizontal: wp(4), gap: scale(10) }}>
        {QUICK_ACTIONS.map((action, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.quickPill, { backgroundColor: action.bg }]}
            onPress={() => router.push(action.route as any)}
            activeOpacity={0.8}>
            <Text style={styles.quickPillEmoji}>{action.emoji}</Text>
            <Text style={[styles.quickPillLabel, { color: action.color }]}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ── FEATURE CARDS ── */}
      <Text style={styles.sectionTitle}>🗺️ Your Farming Journey</Text>
      <View style={styles.featureGrid}>

        {/* Wide card — Checklist */}
        {FEATURE_CARDS.filter(c => c.key === 'checklist').map(card => (
          <TouchableOpacity
            key={card.key}
            style={[styles.wideCard, { backgroundColor: card.color }]}
            onPress={() => router.push(card.route as any)}
            activeOpacity={0.88}>
            <View style={styles.wideCardContent}>
              <View>
                <Text style={styles.wideCardEmoji}>{card.emoji}</Text>
                <Text style={styles.wideCardTitle}>{card.title}</Text>
                <Text style={styles.wideCardDesc}>{card.desc}</Text>
              </View>
              <View style={styles.wideCardBadge}>
                <Text style={[styles.wideCardBadgeText, { color: card.color }]}>Open →</Text>
              </View>
            </View>
            {/* decorative circle */}
            <View style={[styles.wideCardCircle, { backgroundColor: 'rgba(255,255,255,0.08)' }]} />
          </TouchableOpacity>
        ))}

        {/* Pair row — Land + Learn */}
        {pairs.map((pair, ri) => (
  <View key={ri} style={styles.pairRow}>
    {pair.map((card) => (
      <TouchableOpacity
        key={card.key}
        style={[
          styles.pairCard,
          { backgroundColor: card.dark ? card.color : card.gradient[0] },
        ]}
        onPress={() => router.push(card.route as any)}
        activeOpacity={0.88}>
        {/* Fix — explicit Text with fontSize for emoji */}
        <Text style={{ fontSize: scale(32), marginBottom: scale(8) }}>
          {card.emoji}
        </Text>
        <Text style={[styles.pairTitle, { color: card.dark ? '#fff' : card.color }]}>
          {card.title}
        </Text>
        <Text
          style={[styles.pairDesc, { color: card.dark ? 'rgba(255,255,255,0.75)' : card.color + '99' }]}
          numberOfLines={2}>
          {card.desc}
        </Text>
        <View style={[styles.pairArrow, {
          backgroundColor: card.dark ? 'rgba(255,255,255,0.15)' : card.color + '18',
        }]}>
          <Text style={[styles.pairArrowText, { color: card.dark ? '#fff' : card.color }]}>›</Text>
        </View>
      </TouchableOpacity>
    ))}
  </View>
))}

        {/* Wide card — Farming Plan */}
        {FEATURE_CARDS.filter(c => c.key === 'plan').map(card => (
          <TouchableOpacity
            key={card.key}
            style={[styles.wideCard, { backgroundColor: card.color }]}
            onPress={() => router.push(card.route as any)}
            activeOpacity={0.88}>
            <View style={styles.wideCardContent}>
              <View>
                <Text style={styles.wideCardEmoji}>{card.emoji}</Text>
                <Text style={styles.wideCardTitle}>{card.title}</Text>
                <Text style={styles.wideCardDesc}>{card.desc}</Text>
              </View>
              <View style={styles.wideCardBadge}>
                <Text style={[styles.wideCardBadgeText, { color: card.color }]}>Generate →</Text>
              </View>
            </View>
            <View style={[styles.wideCardCircle, { backgroundColor: 'rgba(255,255,255,0.08)' }]} />
          </TouchableOpacity>
        ))}
      </View>

      {/* ── EXPLORE BANNER ── */}
      <TouchableOpacity
        style={styles.exploreBanner}
        onPress={() => router.push('/(tabs)/explore')}
        activeOpacity={0.9}>
        <View style={{ flex: 1 }}>
          <Text style={styles.exploreBannerTitle}>🌱 Explore 16 Modern Crops</Text>
          <Text style={styles.exploreBannerSub}>
            Mushrooms · Microgreens · Saffron · Hydroponics · and more
          </Text>
        </View>
        <View style={styles.exploreBannerArrow}>
          <Text style={styles.exploreBannerArrowText}>›</Text>
        </View>
      </TouchableOpacity>

      {/* ── MARKETPLACE BANNER ── */}
      <TouchableOpacity
        style={styles.marketBanner}
        onPress={() => router.push('/(tabs)/market')}
        activeOpacity={0.9}>
        <Text style={{ fontSize: scale(32) }}>🏪</Text>
        <View style={{ flex: 1, marginLeft: scale(14) }}>
          <Text style={styles.marketBannerTitle}>Agrow Marketplace</Text>
          <Text style={styles.marketBannerSub}>Post your harvest · Live prices · Direct buyers</Text>
        </View>
        <Text style={styles.marketBannerArrow}>›</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const CARD_HALF = (width - wp(10) - scale(12)) / 2;

const styles = StyleSheet.create({
  container:           { flex: 1, backgroundColor: '#f0f4f0' },

  // ── Header ──────────────────────────────────────────────────────────────
  header:              { backgroundColor: '#1a6b3c', paddingTop: hp(6.5), paddingBottom: hp(3), paddingHorizontal: wp(5), borderBottomLeftRadius: scale(32), borderBottomRightRadius: scale(32) },
  headerTop:           { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: scale(18) },
  logoRow:             { flexDirection: 'row', alignItems: 'center', gap: scale(10) },
  logoMark:            { width: scale(42), height: scale(42), borderRadius: scale(13), backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  appName:             { fontSize: fs(21), fontWeight: '800', color: '#fff', letterSpacing: 0.3 },
  tagline:             { fontSize: fs(10), color: 'rgba(255,255,255,0.6)', marginTop: 1 },
  headerActions:       { flexDirection: 'row', gap: scale(8), alignItems: 'center' },
  iconBtn:             { width: scale(36), height: scale(36), borderRadius: scale(18), backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  iconBtnText:         { color: '#fff', fontSize: fs(12), fontWeight: '700' },
  greetingRow:         { flexDirection: 'row', alignItems: 'center', marginBottom: scale(14) },
  greetingTime:        { fontSize: fs(12), color: 'rgba(255,255,255,0.7)', marginBottom: scale(3) },
  greetingName:        { fontSize: fs(24), fontWeight: '800', color: '#fff', marginBottom: scale(3) },
  greetingSub:         { fontSize: fs(11), color: 'rgba(255,255,255,0.65)', lineHeight: scale(17) },
  weatherPill:         { backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: scale(16), padding: scale(12), flexDirection: 'row', alignItems: 'center' },
  weatherTemp:         { fontSize: fs(13), fontWeight: '700', color: '#fff', marginBottom: scale(2) },
  weatherSub:          { fontSize: fs(10), color: 'rgba(255,255,255,0.7)' },
  weatherCity:         { fontSize: fs(11), color: '#fff', fontWeight: '700', marginBottom: scale(1) },
  weatherFeels:        { fontSize: fs(10), color: 'rgba(255,255,255,0.65)' },

  // ── Stats ────────────────────────────────────────────────────────────────
  statsRow:            { flexDirection: 'row', gap: scale(10), marginHorizontal: wp(4), marginTop: scale(-20), marginBottom: scale(14) },
  statCard:            { flex: 1, backgroundColor: '#fff', borderRadius: scale(18), padding: scale(14), alignItems: 'center', elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10 },
  statEmoji:           { fontSize: scale(22), marginBottom: scale(4) },
  statValue:           { fontSize: fs(15), fontWeight: '800', color: '#1a1a1a', marginBottom: scale(2) },
  statLabel:           { fontSize: fs(9), color: '#999', fontWeight: '500', textAlign: 'center' },

  // ── Crop card ────────────────────────────────────────────────────────────
  cropCard:            { backgroundColor: '#fff', marginHorizontal: wp(4), borderRadius: scale(20), padding: scale(18), marginBottom: scale(6), elevation: 3, shadowColor: '#1a6b3c', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 10, minHeight: scale(80), justifyContent: 'center' },
  cropCardInner:       { flexDirection: 'row', alignItems: 'flex-start', marginBottom: scale(12) },
  cropLeft:            { flex: 1, marginRight: scale(16) },
  cropCardLabel:       { fontSize: fs(11), color: '#aaa', fontWeight: '600', marginBottom: scale(4) },
  cropName:            { fontSize: fs(20), fontWeight: '800', color: '#1a1a1a', marginBottom: scale(10) },
  progressBg:          { height: scale(8), backgroundColor: '#e8f5e9', borderRadius: scale(4), marginBottom: scale(6), overflow: 'hidden' },
  progressFill:        { height: scale(8), backgroundColor: '#1a6b3c', borderRadius: scale(4) },
  cropPercent:         { fontSize: fs(11), color: '#888' },
  cropRight:           { alignItems: 'center' },
  daysCircle:          { width: scale(60), height: scale(60), borderRadius: scale(30), backgroundColor: '#e8f5e9', alignItems: 'center', justifyContent: 'center', marginBottom: scale(6), borderWidth: 2, borderColor: '#c8e6c9' },
  daysNum:             { fontSize: fs(18), fontWeight: '800', color: '#1a6b3c' },
  daysLabel:           { fontSize: fs(8), color: '#1a6b3c', textAlign: 'center', fontWeight: '600' },
  cropEarning:         { fontSize: fs(14), fontWeight: '800', color: '#1a6b3c' },
  cropEarningLabel:    { fontSize: fs(9), color: '#aaa' },
  cropCTA:             { backgroundColor: '#f0f9f4', borderRadius: scale(12), padding: scale(10), alignItems: 'center', borderWidth: 1, borderColor: '#c8e6c9' },
  cropCTAText:         { fontSize: fs(12), color: '#1a6b3c', fontWeight: '700' },

  noCropCard:          { backgroundColor: '#fff', marginHorizontal: wp(4), borderRadius: scale(20), padding: scale(18), marginBottom: scale(6), flexDirection: 'row', alignItems: 'center', elevation: 2, borderWidth: 1.5, borderColor: '#c8e6c9', borderStyle: 'dashed' },
  noCropTitle:         { fontSize: fs(15), fontWeight: '700', color: '#444', marginBottom: scale(4) },
  noCropSub:           { fontSize: fs(12), color: '#1a6b3c', fontWeight: '600', lineHeight: scale(17) },

  // ── Section title ────────────────────────────────────────────────────────
  sectionTitle:        { fontSize: fs(13), fontWeight: '800', color: '#1a1a1a', paddingHorizontal: wp(4), marginTop: scale(18), marginBottom: scale(10) },

  // ── Quick actions ─────────────────────────────────────────────────────────
  quickScroll:         { marginBottom: scale(4) },
  quickPill:           { flexDirection: 'row', alignItems: 'center', gap: scale(6), paddingHorizontal: scale(14), paddingVertical: scale(10), borderRadius: scale(30), elevation: 1 },
  quickPillEmoji:      { fontSize: scale(18) },
  quickPillLabel:      { fontSize: fs(12), fontWeight: '700' },

  // ── Feature grid ──────────────────────────────────────────────────────────
  featureGrid:         { paddingHorizontal: wp(4), gap: scale(12) },

  wideCard:            { borderRadius: scale(22), padding: scale(20), overflow: 'hidden', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.12, shadowRadius: 8, position: 'relative' },
  wideCardContent:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  wideCardEmoji:       { fontSize: scale(32), marginBottom: scale(6) },
  wideCardTitle:       { fontSize: fs(18), fontWeight: '800', color: '#fff', marginBottom: scale(4) },
  wideCardDesc:        { fontSize: fs(12), color: 'rgba(255,255,255,0.8)', lineHeight: scale(17) },
  wideCardBadge:       { backgroundColor: '#fff', paddingHorizontal: scale(16), paddingVertical: scale(8), borderRadius: scale(20) },
  wideCardBadgeText:   { fontSize: fs(13), fontWeight: '800' },
  wideCardCircle:      { position: 'absolute', width: scale(160), height: scale(160), borderRadius: scale(80), right: scale(-40), bottom: scale(-40) },

  pairRow:             { flexDirection: 'row', gap: scale(12) },
  pairCard:            { flex: 1, borderRadius: scale(20), padding: scale(16), elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 6, minHeight: scale(150) },
  pairEmoji:           { fontSize: scale(32), marginBottom: scale(8) },
  pairTitle:           { fontSize: fs(15), fontWeight: '800', marginBottom: scale(4) },
  pairDesc:            { fontSize: fs(11), lineHeight: scale(16), marginBottom: scale(12) },
  pairArrow:           { width: scale(28), height: scale(28), borderRadius: scale(9), alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-end' },
  pairArrowText:       { fontSize: fs(18), fontWeight: '700' },

  // ── Banners ───────────────────────────────────────────────────────────────
  exploreBanner:       { backgroundColor: '#1a6b3c', marginHorizontal: wp(4), marginTop: scale(12), borderRadius: scale(20), padding: scale(18), flexDirection: 'row', alignItems: 'center', elevation: 3 },
  exploreBannerTitle:  { fontSize: fs(15), fontWeight: '800', color: '#fff', marginBottom: scale(4) },
  exploreBannerSub:    { fontSize: fs(11), color: 'rgba(255,255,255,0.75)', lineHeight: scale(16) },
  exploreBannerArrow:  { width: scale(36), height: scale(36), borderRadius: scale(18), backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  exploreBannerArrowText: { fontSize: fs(20), color: '#fff', fontWeight: '300' },

  marketBanner:        { backgroundColor: '#fff', marginHorizontal: wp(4), marginTop: scale(12), borderRadius: scale(20), padding: scale(18), flexDirection: 'row', alignItems: 'center', elevation: 2, borderWidth: 1, borderColor: '#e0e0e0' },
  marketBannerTitle:   { fontSize: fs(15), fontWeight: '800', color: '#1a1a1a', marginBottom: scale(3) },
  marketBannerSub:     { fontSize: fs(11), color: '#888', lineHeight: scale(16) },
  marketBannerArrow:   { fontSize: fs(24), color: '#aaa', fontWeight: '300' },
});
