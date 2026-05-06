import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

type CropPrice = {
  name: string;
  emoji: string;
  category: string;
  price: number;
  unit: string;
  change: number;
  min: number;
  max: number;
  market: string;
  state: string;
};

const MANDI_DATA: CropPrice[] = [
  { name: 'Oyster Mushroom', emoji: '🍄', category: 'Modern', price: 140, unit: 'kg', change: 12, min: 120, max: 160, market: 'Azadpur Mandi', state: 'Delhi' },
  { name: 'Button Mushroom', emoji: '🍄', category: 'Modern', price: 95, unit: 'kg', change: -5, min: 80, max: 110, market: 'Vashi APMC', state: 'Maharashtra' },
  { name: 'Microgreens', emoji: '🌿', category: 'Modern', price: 280, unit: 'kg', change: 25, min: 250, max: 320, market: 'Azadpur Mandi', state: 'Delhi' },
  { name: 'Broccoli', emoji: '🥦', category: 'Exotic', price: 65, unit: 'kg', change: -8, min: 55, max: 80, market: 'Bengaluru APMC', state: 'Karnataka' },
  { name: 'Colored Capsicum', emoji: '🫑', category: 'Exotic', price: 85, unit: 'kg', change: 15, min: 70, max: 100, market: 'Pune APMC', state: 'Maharashtra' },
  { name: 'Zucchini', emoji: '🥒', category: 'Exotic', price: 45, unit: 'kg', change: 5, min: 38, max: 55, market: 'Vashi APMC', state: 'Maharashtra' },
  { name: 'Cherry Tomato', emoji: '🍅', category: 'Exotic', price: 120, unit: 'kg', change: 20, min: 100, max: 140, market: 'Azadpur Mandi', state: 'Delhi' },
  { name: 'Stevia', emoji: '🌱', category: 'Medicinal', price: 180, unit: 'kg', change: 8, min: 160, max: 200, market: 'Indore Mandi', state: 'MP' },
  { name: 'Ashwagandha', emoji: '🌿', category: 'Medicinal', price: 220, unit: 'kg', change: 18, min: 190, max: 250, market: 'Neemuch Mandi', state: 'MP' },
  { name: 'Lemongrass', emoji: '🌾', category: 'Medicinal', price: 35, unit: 'kg', change: -3, min: 28, max: 42, market: 'Kannauj Mandi', state: 'UP' },
  { name: 'Wheat', emoji: '🌾', category: 'Traditional', price: 22, unit: 'kg', change: 1, min: 20, max: 24, market: 'Hapur Mandi', state: 'UP' },
  { name: 'Rice', emoji: '🍚', category: 'Traditional', price: 28, unit: 'kg', change: -2, min: 25, max: 32, market: 'Karnal Mandi', state: 'Haryana' },
  { name: 'Mustard', emoji: '🌼', category: 'Traditional', price: 55, unit: 'kg', change: 3, min: 50, max: 60, market: 'Alwar Mandi', state: 'Rajasthan' },
];

const CATEGORIES = ['All', 'Modern', 'Exotic', 'Medicinal', 'Traditional'];

export default function MandiScreen() {
  const router = useRouter();
  const [filter, setFilter]       = useState('All');
  const [search, setSearch]       = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [prices, setPrices]       = useState(MANDI_DATA);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      // Simulate price fluctuation on refresh
      setPrices(prev => prev.map(crop => ({
        ...crop,
        price: crop.price + Math.floor(Math.random() * 6) - 3,
        change: Math.floor(Math.random() * 30) - 10,
      })));
      setLastUpdated(new Date());
      setRefreshing(false);
    }, 1500);
  };

  const filtered = prices.filter(crop => {
    const matchCategory = filter === 'All' || crop.category === filter;
    const matchSearch   = crop.name.toLowerCase().includes(search.toLowerCase()) ||
                          crop.state.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  const topGainer = [...prices].sort((a, b) => b.change - a.change)[0];
  const topLoser  = [...prices].sort((a, b) => a.change - b.change)[0];

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1a6b3c']} />}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>📈 Mandi Prices</Text>
            <Text style={styles.headerSub}>Pull down to refresh prices</Text>
          </View>
          <View style={styles.updatedBadge}>
            <Text style={styles.updatedText}>
              🕐 {lastUpdated.getHours()}:{String(lastUpdated.getMinutes()).padStart(2, '0')}
            </Text>
          </View>
        </View>

        {/* Top Movers */}
        <View style={styles.moversRow}>
          <View style={[styles.moverCard, { borderLeftColor: '#4caf50' }]}>
            <Text style={styles.moverLabel}>🔼 Top Gainer</Text>
            <Text style={styles.moverName}>{topGainer.emoji} {topGainer.name}</Text>
            <Text style={styles.moverGain}>+₹{topGainer.change}/kg</Text>
          </View>
          <View style={[styles.moverCard, { borderLeftColor: '#e53935' }]}>
            <Text style={styles.moverLabel}>🔽 Top Loser</Text>
            <Text style={styles.moverName}>{topLoser.emoji} {topLoser.name}</Text>
            <Text style={styles.moverLoss}>₹{topLoser.change}/kg</Text>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search crop or state..."
            placeholderTextColor="#aaa"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Category Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[styles.filterChip, filter === cat && styles.filterChipActive]}
              onPress={() => setFilter(cat)}>
              <Text style={[styles.filterChipText, filter === cat && styles.filterChipTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Price Cards */}
        <View style={styles.priceList}>
          {filtered.map((crop, i) => (
            <View key={i} style={styles.priceCard}>
              <View style={styles.priceLeft}>
                <Text style={styles.cropEmoji}>{crop.emoji}</Text>
                <View>
                  <Text style={styles.cropName}>{crop.name}</Text>
                  <Text style={styles.cropMarket}>📍 {crop.market}, {crop.state}</Text>
                </View>
              </View>
              <View style={styles.priceRight}>
                <Text style={styles.cropPrice}>₹{crop.price}/{crop.unit}</Text>
                <View style={[styles.changeBadge, { backgroundColor: crop.change >= 0 ? '#e8f5e9' : '#ffebee' }]}>
                  <Text style={[styles.changeText, { color: crop.change >= 0 ? '#2e7d32' : '#e53935' }]}>
                    {crop.change >= 0 ? '▲' : '▼'} ₹{Math.abs(crop.change)}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Min Max Note */}
        <View style={styles.noteCard}>
          <Text style={styles.noteText}>
            💡 Prices are indicative based on recent mandi data. Always verify with your local mandi before selling.
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:           { flex: 1, backgroundColor: '#f5f7f5' },
  backButton:          { padding: 16, paddingTop: 52 },
  backText:            { fontSize: 16, color: '#1a6b3c', fontWeight: '600' },
  header:              { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 16 },
  headerTitle:         { fontSize: 24, fontWeight: '700', color: '#1a1a1a' },
  headerSub:           { fontSize: 12, color: '#888', marginTop: 2 },
  updatedBadge:        { backgroundColor: '#e8f5e9', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  updatedText:         { fontSize: 12, color: '#2e7d32', fontWeight: '500' },
  moversRow:           { flexDirection: 'row', gap: 12, paddingHorizontal: 16, marginBottom: 16 },
  moverCard:           { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 14, borderLeftWidth: 4, elevation: 2 },
  moverLabel:          { fontSize: 11, color: '#888', marginBottom: 6 },
  moverName:           { fontSize: 13, fontWeight: '600', color: '#1a1a1a', marginBottom: 4 },
  moverGain:           { fontSize: 14, fontWeight: '700', color: '#2e7d32' },
  moverLoss:           { fontSize: 14, fontWeight: '700', color: '#e53935' },
  searchBox:           { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 12, paddingHorizontal: 14, marginBottom: 12, elevation: 2 },
  searchIcon:          { fontSize: 16, marginRight: 8 },
  searchInput:         { flex: 1, fontSize: 14, color: '#1a1a1a', paddingVertical: 12 },
  filterRow:           { paddingHorizontal: 16, marginBottom: 16 },
  filterChip:          { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#fff', marginRight: 8, elevation: 1 },
  filterChipActive:    { backgroundColor: '#1a6b3c' },
  filterChipText:      { fontSize: 13, color: '#888', fontWeight: '500' },
  filterChipTextActive: { color: '#fff' },
  priceList:           { paddingHorizontal: 16 },
  priceCard:           { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 2 },
  priceLeft:           { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  cropEmoji:           { fontSize: 28 },
  cropName:            { fontSize: 14, fontWeight: '600', color: '#1a1a1a', marginBottom: 3 },
  cropMarket:          { fontSize: 11, color: '#888' },
  priceRight:          { alignItems: 'flex-end' },
  cropPrice:           { fontSize: 16, fontWeight: '700', color: '#1a1a1a', marginBottom: 4 },
  changeBadge:         { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  changeText:          { fontSize: 12, fontWeight: '600' },
  noteCard:            { backgroundColor: '#fff8e1', marginHorizontal: 16, borderRadius: 12, padding: 14, marginTop: 8 },
  noteText:            { fontSize: 12, color: '#f57f17', lineHeight: 18 },
});