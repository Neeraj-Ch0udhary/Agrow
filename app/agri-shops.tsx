import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator, Linking, ScrollView,
  StyleSheet, Text, TouchableOpacity, View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ONLINE_STORES = [
  { name: 'BigHaat',     emoji: '🌱', desc: 'Seeds, fertilizers, pesticides',    url: 'https://www.bighaat.com',         color: '#1a6b3c', bg: '#e8f5e9' },
  { name: 'AgroStar',    emoji: '⭐', desc: 'Agri inputs delivered to farm',     url: 'https://www.agrostar.in',         color: '#e65100', bg: '#fff3e0' },
  { name: 'DeHaat',      emoji: '🚜', desc: 'Seeds, crop advice, market linkage',url: 'https://www.dehaat.com',          color: '#1565c0', bg: '#e3f2fd' },
  { name: 'Gramophone',  emoji: '🌾', desc: 'Smart farming inputs & advisory',   url: 'https://www.myglamophone.com',    color: '#6a1b9a', bg: '#f3e5f5' },
  { name: 'Ninjacart',   emoji: '🥦', desc: 'Fresh produce marketplace',         url: 'https://www.ninjacart.in',        color: '#00695c', bg: '#e0f2f1' },
  { name: 'Jai Kisan',   emoji: '💰', desc: 'Agri credit and input financing',   url: 'https://www.jaikisan.co',         color: '#f57f17', bg: '#fffde7' },
];

const SEARCH_CATEGORIES = [
  { label: '🌱 Seeds Shop',         query: 'seeds shop near me'          },
  { label: '🧪 Fertilizer Shop',    query: 'fertilizer shop near me'     },
  { label: '🪴 Nursery',            query: 'plant nursery near me'       },
  { label: '🚜 Farm Equipment',     query: 'farm equipment shop near me' },
  { label: '🌾 Krishi Kendra',      query: 'krishi kendra near me'       },
  { label: '🏪 Agro Centre',        query: 'agro centre near me'         },
  { label: '💊 Pesticide Shop',     query: 'pesticide shop near me'      },
  { label: '🌿 Organic Inputs',     query: 'organic farming inputs near me' },
];

const HELPLINES = [
  { emoji: '📞', name: 'Kisan Call Centre',        number: '18001801551', desc: 'Free • 24/7 • All farming help',        color: '#1a6b3c', bg: '#e8f5e9' },
  { emoji: '🌾', name: 'PM Kisan Helpline',        number: '155261',      desc: 'PM Kisan scheme queries',               color: '#1565c0', bg: '#e3f2fd' },
  { emoji: '🧪', name: 'Soil Testing Helpline',    number: '18001801551', desc: 'Soil health card queries',              color: '#e65100', bg: '#fff3e0' },
  { emoji: '🏦', name: 'Agri Insurance (PMFBY)',   number: '18001801551', desc: 'Crop insurance claims and queries',     color: '#6a1b9a', bg: '#f3e5f5' },
];

export default function AgriShopsScreen() {
  const router = useRouter();
  const [city, setCity]       = useState('');
  const [loading, setLoading] = useState(true);
  const [lat, setLat]         = useState<number | null>(null);
  const [lon, setLon]         = useState<number | null>(null);

  useEffect(() => { getLocation(); }, []);

  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') { setLoading(false); return; }

      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setLat(loc.coords.latitude);
      setLon(loc.coords.longitude);

      const geo = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
      if (geo[0]) {
        setCity(geo[0].city || geo[0].district || geo[0].region || '');
      }
    } catch (e) {
      console.log('Location error:', e);
    } finally {
      setLoading(false);
    }
  };

  const openGoogleMaps = (query: string) => {
    let url: string;
    if (lat && lon) {
      // Use coordinates for precise nearby search
      url = `https://www.google.com/maps/search/${encodeURIComponent(query)}/@${lat},${lon},14z`;
    } else {
      url = `https://www.google.com/maps/search/${encodeURIComponent(query)}`;
    }
    Linking.openURL(url);
  };

  const callHelpline = (number: string) => {
    Linking.openURL(`tel:${number}`);
  };

  return (
    <SafeAreaView style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>🌾 Agri Shops</Text>
          <Text style={styles.headerSub}>
            {loading ? 'Getting your location...' : city ? `Near ${city}` : 'Find shops near you'}
          </Text>
        </View>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* Location status */}
        {loading ? (
          <View style={styles.locationCard}>
            <ActivityIndicator color="#1a6b3c" />
            <Text style={styles.locationText}>Getting your location...</Text>
          </View>
        ) : (
          <View style={styles.locationCard}>
            <Text style={styles.locationEmoji}>📍</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.locationTitle}>
                {city ? `Showing results near ${city}` : 'Location ready'}
              </Text>
              <Text style={styles.locationSub}>
                Tap any category to open Google Maps with nearby shops
              </Text>
            </View>
          </View>
        )}

        {/* Search categories */}
        <Text style={styles.sectionTitle}>🔍 Find Nearby Shops</Text>
        <Text style={styles.sectionSub}>Tap to open Google Maps with shops near you</Text>

        <View style={styles.categoriesGrid}>
          {SEARCH_CATEGORIES.map((cat, i) => (
            <TouchableOpacity
              key={i}
              style={styles.categoryCard}
              onPress={() => openGoogleMaps(cat.query)}
              activeOpacity={0.8}>
              <Text style={styles.categoryLabel}>{cat.label}</Text>
              <Text style={styles.categoryArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Open Maps button */}
        <TouchableOpacity
          style={styles.mapsBtn}
          onPress={() => openGoogleMaps('krishi kendra agricultural shop seeds fertilizer near me')}>
          <Text style={styles.mapsBtnEmoji}>🗺️</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.mapsBtnTitle}>Open All Agri Shops on Map</Text>
            <Text style={styles.mapsBtnSub}>See all nearby shops at once in Google Maps</Text>
          </View>
          <Text style={styles.mapsBtnArrow}>›</Text>
        </TouchableOpacity>

        {/* Online stores */}
        <Text style={styles.sectionTitle}>🛒 Order Online — Delivered to Farm</Text>
        <Text style={styles.sectionSub}>Get seeds, fertilizers and tools delivered directly</Text>

        {ONLINE_STORES.map((store, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.storeCard, { borderLeftColor: store.color }]}
            onPress={() => Linking.openURL(store.url)}
            activeOpacity={0.8}>
            <View style={[styles.storeIconBox, { backgroundColor: store.bg }]}>
              <Text style={styles.storeEmoji}>{store.emoji}</Text>
            </View>
            <View style={styles.storeInfo}>
              <Text style={[styles.storeName, { color: store.color }]}>{store.name}</Text>
              <Text style={styles.storeDesc}>{store.desc}</Text>
              <Text style={styles.storeUrl}>{store.url.replace('https://www.', '')}</Text>
            </View>
            <View style={[styles.visitBtn, { backgroundColor: store.color }]}>
              <Text style={styles.visitBtnText}>Visit →</Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* Helplines */}
        <Text style={styles.sectionTitle}>📞 Farming Helplines</Text>
        <Text style={styles.sectionSub}>Free government helplines for farmers</Text>

        {HELPLINES.map((h, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.helplineCard, { borderLeftColor: h.color }]}
            onPress={() => callHelpline(h.number)}
            activeOpacity={0.8}>
            <View style={[styles.helplineIconBox, { backgroundColor: h.bg }]}>
              <Text style={styles.helplineEmoji}>{h.emoji}</Text>
            </View>
            <View style={styles.helplineInfo}>
              <Text style={[styles.helplineName, { color: h.color }]}>{h.name}</Text>
              <Text style={styles.helplineDesc}>{h.desc}</Text>
            </View>
            <View style={[styles.callBtn, { backgroundColor: h.color }]}>
              <Text style={styles.callBtnText}>📞 {h.number}</Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* Tip */}
        <View style={styles.tipCard}>
          <Text style={styles.tipEmoji}>💡</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.tipTitle}>Pro Tip</Text>
            <Text style={styles.tipText}>
              Search "कृषि केंद्र" or "बीज भंडार" in Google Maps for better results in Hindi-speaking areas.
            </Text>
          </View>
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: '#f0f4f0' },
  header:           { backgroundColor: '#1a6b3c', paddingTop: 12, paddingBottom: 14, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn:          { color: '#a8d5b5', fontSize: 15, fontWeight: '600' },
  headerCenter:     { alignItems: 'center', flex: 1 },
  headerTitle:      { fontSize: 17, fontWeight: '800', color: '#fff' },
  headerSub:        { fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  content:          { padding: 16 },
  locationCard:     { backgroundColor: '#fff', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20, elevation: 2 },
  locationEmoji:    { fontSize: 28 },
  locationTitle:    { fontSize: 14, fontWeight: '700', color: '#1a1a1a', marginBottom: 2 },
  locationSub:      { fontSize: 12, color: '#888' },
  locationText:     { fontSize: 14, color: '#888', marginLeft: 12 },
  sectionTitle:     { fontSize: 15, fontWeight: '800', color: '#1a1a1a', marginBottom: 4 },
  sectionSub:       { fontSize: 12, color: '#888', marginBottom: 14 },
  categoriesGrid:   { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 },
  categoryCard:     { width: '47%', backgroundColor: '#fff', borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', elevation: 2 },
  categoryLabel:    { fontSize: 13, fontWeight: '600', color: '#1a1a1a', flex: 1 },
  categoryArrow:    { fontSize: 18, color: '#1a6b3c', fontWeight: '700' },
  mapsBtn:          { backgroundColor: '#1a6b3c', borderRadius: 16, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 24, elevation: 3 },
  mapsBtnEmoji:     { fontSize: 28 },
  mapsBtnTitle:     { fontSize: 14, fontWeight: '800', color: '#fff', marginBottom: 3 },
  mapsBtnSub:       { fontSize: 11, color: 'rgba(255,255,255,0.8)' },
  mapsBtnArrow:     { fontSize: 24, color: 'rgba(255,255,255,0.6)' },
  storeCard:        { backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 12, borderLeftWidth: 4, elevation: 2 },
  storeIconBox:     { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  storeEmoji:       { fontSize: 24 },
  storeInfo:        { flex: 1 },
  storeName:        { fontSize: 14, fontWeight: '800', marginBottom: 2 },
  storeDesc:        { fontSize: 11, color: '#666', marginBottom: 2 },
  storeUrl:         { fontSize: 10, color: '#aaa' },
  visitBtn:         { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  visitBtnText:     { color: '#fff', fontSize: 12, fontWeight: '700' },
  helplineCard:     { backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 12, borderLeftWidth: 4, elevation: 2 },
  helplineIconBox:  { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  helplineEmoji:    { fontSize: 22 },
  helplineInfo:     { flex: 1 },
  helplineName:     { fontSize: 13, fontWeight: '800', marginBottom: 2 },
  helplineDesc:     { fontSize: 11, color: '#666' },
  callBtn:          { paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10 },
  callBtnText:      { color: '#fff', fontSize: 11, fontWeight: '700' },
  tipCard:          { backgroundColor: '#fff8e1', borderRadius: 14, padding: 16, flexDirection: 'row', gap: 12, marginTop: 8, borderWidth: 1, borderColor: '#ffe082' },
  tipEmoji:         { fontSize: 24 },
  tipTitle:         { fontSize: 13, fontWeight: '800', color: '#f57f17', marginBottom: 4 },
  tipText:          { fontSize: 12, color: '#795548', lineHeight: 18 },
});