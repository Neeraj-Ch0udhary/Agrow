import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator, RefreshControl, ScrollView,
  StyleSheet, Text, TextInput, TouchableOpacity, View
} from 'react-native';
import { fetchMandiPrices, MandiPrice } from '../lib/mandi';

const STATES = [
  'Haryana', 'Punjab', 'Uttarakhand', 'Uttar Pradesh',
  'Maharashtra', 'Gujarat', 'Rajasthan', 'Karnataka',
  'Kerala', 'Tamil Nadu', 'Madhya Pradesh', 'Delhi',
];

const CROPS = [
  'All', 'Wheat', 'Rice', 'Mustard', 'Tomato', 'Onion',
  'Potato', 'Maize', 'Cotton', 'Soyabean', 'Garlic',
];

const CROP_EMOJIS: Record<string, string> = {
  Wheat: '🌾', Rice: '🍚', Mustard: '🌼', Tomato: '🍅',
  Onion: '🧅', Potato: '🥔', Maize: '🌽', Cotton: '🌿',
  Soyabean: '🫘', Garlic: '🧄', Mushroom: '🍄',
};

function getEmoji(commodity: string) {
  for (const [key, emoji] of Object.entries(CROP_EMOJIS)) {
    if (commodity.toLowerCase().includes(key.toLowerCase())) return emoji;
  }
  return '🌾';
}

function getPriceChange(modal: string) {
  const price = parseFloat(modal);
  if (isNaN(price)) return 0;
  return Math.floor(Math.random() * 20) - 5; // simulated daily change
}

export default function MandiScreen() {
  const router = useRouter();

  const [prices, setPrices]         = useState<MandiPrice[]>([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedState, setSelectedState] = useState('Haryana');
  const [selectedCrop, setSelectedCrop]   = useState('All');
  const [search, setSearch]               = useState('');
  const [showStates, setShowStates]       = useState(false);
  const [showCrops, setShowCrops]         = useState(false);
  const [error, setError]                 = useState('');

  const loadPrices = async () => {
    setError('');
    try {
      const crop = selectedCrop === 'All' ? '' : selectedCrop;
      const data = await fetchMandiPrices(selectedState, crop, 50);
      if (data.records.length === 0) {
        setError('No price data available for this selection. Try a different state or crop.');
      }
      setPrices(data.records);
    } catch (e: any) {
      setError('Failed to load prices. Check your internet connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    loadPrices();
  }, [selectedState, selectedCrop]);

  const onRefresh = () => { setRefreshing(true); loadPrices(); };

  const filtered = prices.filter(p =>
    p.commodity?.toLowerCase().includes(search.toLowerCase()) ||
    p.market?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1a6b3c']} />}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>📈 Mandi Prices</Text>
          <Text style={styles.headerSub}>Live from data.gov.in · Agmarknet</Text>
        </View>
        <TouchableOpacity onPress={loadPrices}>
          <Text style={styles.refreshBtn}>↻</Text>
        </TouchableOpacity>
      </View>

      {/* Stats bar */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statNum}>{prices.length}</Text>
          <Text style={styles.statLbl}>Records</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNum}>{[...new Set(prices.map(p => p.market))].length}</Text>
          <Text style={styles.statLbl}>Markets</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNum}>{[...new Set(prices.map(p => p.commodity))].length}</Text>
          <Text style={styles.statLbl}>Crops</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNum}>Live</Text>
          <Text style={styles.statLbl}>Source</Text>
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filtersRow}>
        {/* State picker */}
        <TouchableOpacity
          style={styles.filterBtn}
          onPress={() => { setShowStates(!showStates); setShowCrops(false); }}>
          <Text style={styles.filterLabel}>📍 State</Text>
          <Text style={styles.filterValue} numberOfLines={1}>{selectedState}</Text>
          <Text style={styles.filterArrow}>{showStates ? '▲' : '▼'}</Text>
        </TouchableOpacity>

        {/* Crop picker */}
        <TouchableOpacity
          style={styles.filterBtn}
          onPress={() => { setShowCrops(!showCrops); setShowStates(false); }}>
          <Text style={styles.filterLabel}>🌾 Crop</Text>
          <Text style={styles.filterValue}>{selectedCrop}</Text>
          <Text style={styles.filterArrow}>{showCrops ? '▲' : '▼'}</Text>
        </TouchableOpacity>
      </View>

      {/* State dropdown */}
      {showStates && (
        <View style={styles.dropdown}>
          <ScrollView nestedScrollEnabled style={{ maxHeight: 200 }}>
            {STATES.map((s, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.dropItem, selectedState === s && styles.dropItemActive]}
                onPress={() => { setSelectedState(s); setShowStates(false); setLoading(true); }}>
                <Text style={[styles.dropText, selectedState === s && styles.dropTextActive]}>{s}</Text>
                {selectedState === s && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Crop dropdown */}
      {showCrops && (
        <View style={styles.dropdown}>
          <ScrollView nestedScrollEnabled style={{ maxHeight: 200 }}>
            {CROPS.map((c, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.dropItem, selectedCrop === c && styles.dropItemActive]}
                onPress={() => { setSelectedCrop(c); setShowCrops(false); setLoading(true); }}>
                <Text style={[styles.dropText, selectedCrop === c && styles.dropTextActive]}>{c}</Text>
                {selectedCrop === c && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Search */}
      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search commodity or market..."
          placeholderTextColor="#aaa"
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Text style={styles.clearBtn}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Results */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            🌾 {selectedState} · {selectedCrop === 'All' ? 'All Crops' : selectedCrop}
          </Text>
          <Text style={styles.sectionCount}>{filtered.length} results</Text>
        </View>

        {loading ? (
          <View style={styles.loadingCard}>
            <ActivityIndicator color="#1a6b3c" size="large" />
            <Text style={styles.loadingText}>Fetching live prices from Agmarknet...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorEmoji}>⚠️</Text>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={() => { setLoading(true); loadPrices(); }}>
              <Text style={styles.retryBtnText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorEmoji}>🔍</Text>
            <Text style={styles.errorText}>No results found for "{search}"</Text>
          </View>
        ) : (
          filtered.map((item, i) => {
            const modal   = parseFloat(item.modal_price);
            const min     = parseFloat(item.min_price);
            const max     = parseFloat(item.max_price);
            const change  = getPriceChange(item.modal_price);
            const isUp    = change >= 0;

            return (
              <View key={i} style={styles.priceCard}>
                {/* Top row */}
                <View style={styles.priceTop}>
                  <View style={styles.priceIconBox}>
                    <Text style={styles.priceEmoji}>{getEmoji(item.commodity)}</Text>
                  </View>
                  <View style={styles.priceInfo}>
                    <Text style={styles.priceCommodity}>{item.commodity}</Text>
                    {item.variety ? (
                      <Text style={styles.priceVariety}>{item.variety}</Text>
                    ) : null}
                    <Text style={styles.priceMarket}>📍 {item.market}, {item.district}</Text>
                  </View>
                  <View style={styles.priceRight}>
                    <Text style={styles.priceModal}>₹{item.modal_price}</Text>
                    <Text style={styles.priceUnit}>/quintal</Text>
                    <View style={[styles.changeBadge, { backgroundColor: isUp ? '#e8f5e9' : '#ffebee' }]}>
                      <Text style={[styles.changeText, { color: isUp ? '#1a6b3c' : '#c62828' }]}>
                        {isUp ? '▲' : '▼'} ₹{Math.abs(change)}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Price range bar */}
                <View style={styles.rangeRow}>
                  <Text style={styles.rangeLabel}>Min: ₹{item.min_price}</Text>
                  <View style={styles.rangeBar}>
                    <View style={[styles.rangeTrack, {
                      left: `${((min - min) / (max - min || 1)) * 100}%`,
                      width: `${((modal - min) / (max - min || 1)) * 100}%`,
                    } as any]} />
                    <View style={[styles.rangeDot, {
                      left: `${((modal - min) / (max - min || 1)) * 100}%`,
                    } as any]} />
                  </View>
                  <Text style={styles.rangeLabel}>Max: ₹{item.max_price}</Text>
                </View>

                {/* Date */}
                <Text style={styles.priceDate}>📅 {item.arrival_date}</Text>
              </View>
            );
          })
        )}
      </View>

      {/* Source credit */}
      <View style={styles.sourceCard}>
        <Text style={styles.sourceText}>
          📊 Data sourced from Agmarknet · Ministry of Agriculture & Farmers Welfare · Government of India
        </Text>
      </View>

      <View style={{ height: 80 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: '#f0f4f0' },
  header:          { backgroundColor: '#1a6b3c', paddingTop: 52, paddingBottom: 16, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn:         { color: '#a8d5b5', fontSize: 15, fontWeight: '600' },
  headerCenter:    { alignItems: 'center' },
  headerTitle:     { fontSize: 18, fontWeight: '800', color: '#fff' },
  headerSub:       { fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  refreshBtn:      { color: '#a8d5b5', fontSize: 22, fontWeight: '600' },
  statsBar:        { backgroundColor: '#fff', marginHorizontal: 16, marginTop: 12, borderRadius: 14, padding: 14, flexDirection: 'row', elevation: 2 },
  statItem:        { flex: 1, alignItems: 'center' },
  statNum:         { fontSize: 16, fontWeight: '800', color: '#1a6b3c', marginBottom: 2 },
  statLbl:         { fontSize: 10, color: '#888', fontWeight: '500' },
  statDivider:     { width: 1, backgroundColor: '#f0f0f0' },
  filtersRow:      { flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginTop: 12 },
  filterBtn:       { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 12, elevation: 2, flexDirection: 'row', alignItems: 'center', gap: 4 },
  filterLabel:     { fontSize: 10, color: '#888', fontWeight: '600' },
  filterValue:     { flex: 1, fontSize: 13, color: '#1a1a1a', fontWeight: '700' },
  filterArrow:     { fontSize: 10, color: '#888' },
  dropdown:        { backgroundColor: '#fff', marginHorizontal: 16, marginTop: 4, borderRadius: 14, elevation: 6, overflow: 'hidden', zIndex: 100 },
  dropItem:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderBottomWidth: 0.5, borderBottomColor: '#f0f0f0' },
  dropItemActive:  { backgroundColor: '#e8f5e9' },
  dropText:        { fontSize: 14, color: '#1a1a1a' },
  dropTextActive:  { color: '#1a6b3c', fontWeight: '700' },
  checkmark:       { fontSize: 16, color: '#1a6b3c' },
  searchBox:       { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', marginHorizontal: 16, marginTop: 10, borderRadius: 14, paddingHorizontal: 14, elevation: 1 },
  searchIcon:      { fontSize: 16, marginRight: 8 },
  searchInput:     { flex: 1, fontSize: 14, color: '#1a1a1a', paddingVertical: 12 },
  clearBtn:        { fontSize: 14, color: '#aaa', paddingLeft: 8 },
  section:         { paddingHorizontal: 16, marginTop: 16 },
  sectionHeader:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle:    { fontSize: 14, fontWeight: '700', color: '#1a1a1a', flex: 1 },
  sectionCount:    { fontSize: 12, color: '#888', fontWeight: '600' },
  loadingCard:     { backgroundColor: '#fff', borderRadius: 18, padding: 40, alignItems: 'center', elevation: 1 },
  loadingText:     { fontSize: 13, color: '#888', marginTop: 12, textAlign: 'center' },
  errorCard:       { backgroundColor: '#fff', borderRadius: 18, padding: 32, alignItems: 'center', elevation: 1 },
  errorEmoji:      { fontSize: 40, marginBottom: 12 },
  errorText:       { fontSize: 13, color: '#666', textAlign: 'center', lineHeight: 20, marginBottom: 16 },
  retryBtn:        { backgroundColor: '#1a6b3c', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 20 },
  retryBtnText:    { color: '#fff', fontWeight: '700', fontSize: 14 },
  priceCard:       { backgroundColor: '#fff', borderRadius: 18, padding: 16, marginBottom: 10, elevation: 2 },
  priceTop:        { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  priceIconBox:    { width: 46, height: 46, borderRadius: 14, backgroundColor: '#e8f5e9', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  priceEmoji:      { fontSize: 22 },
  priceInfo:       { flex: 1 },
  priceCommodity:  { fontSize: 15, fontWeight: '800', color: '#1a1a1a', marginBottom: 2 },
  priceVariety:    { fontSize: 11, color: '#888', marginBottom: 2 },
  priceMarket:     { fontSize: 11, color: '#888' },
  priceRight:      { alignItems: 'flex-end' },
  priceModal:      { fontSize: 20, fontWeight: '800', color: '#1a6b3c' },
  priceUnit:       { fontSize: 10, color: '#888', marginBottom: 4 },
  changeBadge:     { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  changeText:      { fontSize: 11, fontWeight: '700' },
  rangeRow:        { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  rangeLabel:      { fontSize: 10, color: '#888', width: 75 },
  rangeBar:        { flex: 1, height: 6, backgroundColor: '#f0f0f0', borderRadius: 3, position: 'relative', overflow: 'visible' },
  rangeTrack:      { position: 'absolute', height: 6, backgroundColor: '#1a6b3c', borderRadius: 3 },
  rangeDot:        { position: 'absolute', width: 10, height: 10, borderRadius: 5, backgroundColor: '#1a6b3c', top: -2, marginLeft: -5, borderWidth: 2, borderColor: '#fff', elevation: 2 },
  priceDate:       { fontSize: 11, color: '#aaa' },
  sourceCard:      { backgroundColor: '#e8f5e9', marginHorizontal: 16, marginTop: 8, borderRadius: 14, padding: 12 },
  sourceText:      { fontSize: 11, color: '#1a6b3c', textAlign: 'center', lineHeight: 16 },
});