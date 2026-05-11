import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const TOP_PRICES = [
  { emoji: '🍄', name: 'Oyster Mushroom', price: 140, change: 12,  state: 'Delhi' },
  { emoji: '🌿', name: 'Microgreens',     price: 280, change: 25,  state: 'Delhi' },
  { emoji: '🥦', name: 'Broccoli',        price: 65,  change: -8,  state: 'Karnataka' },
  { emoji: '🫑', name: 'Colored Capsicum',price: 85,  change: 15,  state: 'Maharashtra' },
  { emoji: '🌱', name: 'Stevia',          price: 180, change: 8,   state: 'MP' },
  { emoji: '🍅', name: 'Cherry Tomato',   price: 120, change: 20,  state: 'Delhi' },
  { emoji: '🌾', name: 'Lemongrass',      price: 35,  change: -3,  state: 'UP' },
  { emoji: '🌾', name: 'Wheat',           price: 22,  change: 1,   state: 'UP' },
];

const MOCK_MARKET = [
  { id: '1', emoji: '🍄', crop: 'Oyster Mushrooms', qty: 50,  price: 135, state: 'Haryana',     name: 'Neeraj Choudhary', phone: '9306565217' },
  { id: '2', emoji: '🌿', crop: 'Microgreens',      qty: 20,  price: 260, state: 'Punjab',      name: 'Gurpreet Singh',   phone: '9812345678' },
  { id: '3', emoji: '🥦', crop: 'Broccoli',         qty: 100, price: 60,  state: 'Karnataka',   name: 'Ravi Kumar',       phone: '9845678901' },
  { id: '4', emoji: '🌱', crop: 'Stevia',           qty: 30,  price: 170, state: 'Maharashtra', name: 'Suresh Patil',     phone: '9765432109' },
];

export default function MarketScreen() {
  const router  = useRouter();
  const [mode, setMode]     = useState<'prices' | 'market'>('prices');
  const [search, setSearch] = useState('');

  const filtered = MOCK_MARKET.filter(item =>
    item.crop.toLowerCase().includes(search.toLowerCase()) ||
    item.state.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      {/* ── Header ── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🏪 Marketplace</Text>
        <Text style={styles.headerSub}>Buy, sell and track prices</Text>
      </View>

      {/* ── Post Button ── */}
      <TouchableOpacity
        style={styles.postBtn}
        onPress={() => router.push('/post-listing')}>
        <View style={styles.postBtnLeft}>
          <Text style={styles.postBtnEmoji}>📦</Text>
          <View>
            <Text style={styles.postBtnTitle}>Post Your Harvest</Text>
            <Text style={styles.postBtnSub}>Connect with buyers directly</Text>
          </View>
        </View>
        <View style={styles.postBtnArrow}>
          <Text style={styles.postBtnArrowText}>›</Text>
        </View>
      </TouchableOpacity>

      {/* ── Quick Actions ── */}
      <View style={styles.quickRow}>
        <TouchableOpacity style={[styles.quickCard, { backgroundColor: '#e3f2fd' }]} onPress={() => router.push('/mandi')}>
          <Text style={styles.quickEmoji}>📈</Text>
          <Text style={[styles.quickLabel, { color: '#1565c0' }]}>Full Mandi{'\n'}Prices</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.quickCard, { backgroundColor: '#fffde7' }]} onPress={() => router.push('/calculator')}>
          <Text style={styles.quickEmoji}>💰</Text>
          <Text style={[styles.quickLabel, { color: '#f57f17' }]}>Profit{'\n'}Calculator</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.quickCard, { backgroundColor: '#f3e5f5' }]} onPress={() => router.push('/chat')}>
          <Text style={styles.quickEmoji}>🤖</Text>
          <Text style={[styles.quickLabel, { color: '#4a148c' }]}>Ask{'\n'}Agrow AI</Text>
        </TouchableOpacity>
      </View>

      {/* ── Toggle ── */}
      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.toggleBtn, mode === 'prices' && styles.toggleBtnActive]}
          onPress={() => setMode('prices')}>
          <Text style={[styles.toggleText, mode === 'prices' && styles.toggleTextActive]}>
            📊 Prices
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, mode === 'market' && styles.toggleBtnActive]}
          onPress={() => setMode('market')}>
          <Text style={[styles.toggleText, mode === 'market' && styles.toggleTextActive]}>
            🛒 Listings
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Search ── */}
      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder={mode === 'prices' ? 'Search crop or state...' : 'Search listings...'}
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

      {/* ── Prices Mode ── */}
      {mode === 'prices' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔥 Top Prices Today</Text>
          {TOP_PRICES
            .filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.state.toLowerCase().includes(search.toLowerCase()))
            .map((item, i) => (
            <View key={i} style={styles.priceCard}>
              <Text style={styles.priceEmoji}>{item.emoji}</Text>
              <View style={styles.priceInfo}>
                <Text style={styles.priceName}>{item.name}</Text>
                <Text style={styles.priceState}>📍 {item.state}</Text>
              </View>
              <View style={styles.priceRight}>
                <Text style={styles.priceValue}>₹{item.price}/kg</Text>
                <View style={[styles.changeBadge, { backgroundColor: item.change >= 0 ? '#e8f5e9' : '#ffebee' }]}>
                  <Text style={[styles.changeText, { color: item.change >= 0 ? '#1a6b3c' : '#e53935' }]}>
                    {item.change >= 0 ? '▲' : '▼'} ₹{Math.abs(item.change)}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* ── Market Listings Mode ── */}
      {mode === 'market' && (
        <View style={styles.section}>
          <View style={styles.listingsHeader}>
            <Text style={styles.sectionTitle}>🛒 Available Listings</Text>
            <Text style={styles.listingsCount}>{filtered.length} listings</Text>
          </View>

          {filtered.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyEmoji}>📦</Text>
              <Text style={styles.emptyTitle}>No listings found</Text>
              <Text style={styles.emptySub}>Be the first to post your harvest!</Text>
              <TouchableOpacity style={styles.emptyBtn} onPress={() => router.push('/post-listing')}>
                <Text style={styles.emptyBtnText}>+ Post Now</Text>
              </TouchableOpacity>
            </View>
          ) : (
            filtered.map((item, i) => (
              <View key={i} style={styles.listingCard}>
                {/* Card Header */}
                <View style={styles.listingHeader}>
                  <View style={styles.listingIconBox}>
                    <Text style={styles.listingEmoji}>{item.emoji}</Text>
                  </View>
                  <View style={styles.listingInfo}>
                    <Text style={styles.listingCrop}>{item.crop}</Text>
                    <Text style={styles.listingLocation}>📍 {item.state}</Text>
                  </View>
                  <View style={styles.listingPriceBox}>
                    <Text style={styles.listingPrice}>₹{item.price}</Text>
                    <Text style={styles.listingPriceUnit}>/kg</Text>
                  </View>
                </View>

                {/* Details Row */}
                <View style={styles.listingDetails}>
                  <View style={styles.listingDetail}>
                    <Text style={styles.listingDetailLabel}>Quantity</Text>
                    <Text style={styles.listingDetailValue}>{item.qty} kg</Text>
                  </View>
                  <View style={styles.listingDivider} />
                  <View style={styles.listingDetail}>
                    <Text style={styles.listingDetailLabel}>Total Value</Text>
                    <Text style={styles.listingDetailValue}>₹{(item.qty * item.price).toLocaleString('en-IN')}</Text>
                  </View>
                  <View style={styles.listingDivider} />
                  <View style={styles.listingDetail}>
                    <Text style={styles.listingDetailLabel}>Seller</Text>
                    <Text style={styles.listingDetailValue} numberOfLines={1}>{item.name.split(' ')[0]}</Text>
                  </View>
                </View>

                {/* Call Button */}
                <TouchableOpacity
                  style={styles.callBtn}
                  onPress={() => Linking.openURL(`tel:${item.phone}`)}>
                  <Text style={styles.callBtnText}>📞 Call Seller — {item.name}</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      )}

      {/* ── Coming Soon Banner ── */}
      <View style={styles.comingSoon}>
        <Text style={styles.comingSoonEmoji}>🚀</Text>
        <Text style={styles.comingSoonTitle}>Live Marketplace Coming Soon!</Text>
        <Text style={styles.comingSoonText}>
          Post your harvest and connect with verified restaurants, supermarkets and buyers across India.
        </Text>
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:           { flex: 1, backgroundColor: '#f0f4f0' },

  // Header
  header:              { backgroundColor: '#1565c0', paddingTop: 56, paddingBottom: 28, paddingHorizontal: 20, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  headerTitle:         { fontSize: 26, fontWeight: '800', color: '#fff', marginBottom: 4 },
  headerSub:           { fontSize: 13, color: 'rgba(255,255,255,0.75)' },

  // Post Button
  postBtn:             { backgroundColor: '#1a6b3c', marginHorizontal: 16, marginTop: 16, borderRadius: 18, padding: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', elevation: 4 },
  postBtnLeft:         { flexDirection: 'row', alignItems: 'center', gap: 14 },
  postBtnEmoji:        { fontSize: 32 },
  postBtnTitle:        { fontSize: 16, fontWeight: '800', color: '#fff', marginBottom: 3 },
  postBtnSub:          { fontSize: 12, color: 'rgba(255,255,255,0.75)' },
  postBtnArrow:        { width: 32, height: 32, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  postBtnArrowText:    { fontSize: 20, color: '#fff', fontWeight: '700' },

  // Quick Actions
  quickRow:            { flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginTop: 12 },
  quickCard:           { flex: 1, borderRadius: 16, padding: 14, alignItems: 'center', elevation: 1 },
  quickEmoji:          { fontSize: 24, marginBottom: 6 },
  quickLabel:          { fontSize: 11, fontWeight: '700', textAlign: 'center', lineHeight: 16 },

  // Toggle
  toggleRow:           { flexDirection: 'row', marginHorizontal: 16, marginTop: 16, backgroundColor: '#e8e8e8', borderRadius: 14, padding: 4 },
  toggleBtn:           { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 11 },
  toggleBtnActive:     { backgroundColor: '#fff', elevation: 2 },
  toggleText:          { fontSize: 13, fontWeight: '600', color: '#888' },
  toggleTextActive:    { color: '#1a1a1a', fontWeight: '700' },

  // Search
  searchBox:           { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', marginHorizontal: 16, marginTop: 10, borderRadius: 14, paddingHorizontal: 14, elevation: 1 },
  searchIcon:          { fontSize: 16, marginRight: 8 },
  searchInput:         { flex: 1, fontSize: 14, color: '#1a1a1a', paddingVertical: 12 },
  clearBtn:            { fontSize: 14, color: '#aaa', paddingLeft: 8 },

  // Section
  section:             { paddingHorizontal: 16, marginTop: 16 },
  sectionTitle:        { fontSize: 15, fontWeight: '700', color: '#1a1a1a', marginBottom: 12 },

  // Price Cards
  priceCard:           { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 10, flexDirection: 'row', alignItems: 'center', elevation: 1 },
  priceEmoji:          { fontSize: 28, marginRight: 12 },
  priceInfo:           { flex: 1 },
  priceName:           { fontSize: 14, fontWeight: '600', color: '#1a1a1a', marginBottom: 3 },
  priceState:          { fontSize: 11, color: '#888' },
  priceRight:          { alignItems: 'flex-end' },
  priceValue:          { fontSize: 15, fontWeight: '800', color: '#1a1a1a', marginBottom: 4 },
  changeBadge:         { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  changeText:          { fontSize: 11, fontWeight: '600' },

  // Listings
  listingsHeader:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  listingsCount:       { fontSize: 13, color: '#888', fontWeight: '500' },
  listingCard:         { backgroundColor: '#fff', borderRadius: 18, padding: 16, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6 },
  listingHeader:       { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  listingIconBox:      { width: 48, height: 48, borderRadius: 14, backgroundColor: '#e8f5e9', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  listingEmoji:        { fontSize: 24 },
  listingInfo:         { flex: 1 },
  listingCrop:         { fontSize: 16, fontWeight: '700', color: '#1a1a1a', marginBottom: 3 },
  listingLocation:     { fontSize: 12, color: '#888' },
  listingPriceBox:     { alignItems: 'flex-end' },
  listingPrice:        { fontSize: 20, fontWeight: '800', color: '#1a6b3c' },
  listingPriceUnit:    { fontSize: 11, color: '#888' },
  listingDetails:      { flexDirection: 'row', backgroundColor: '#f8f8f8', borderRadius: 12, padding: 12, marginBottom: 12 },
  listingDetail:       { flex: 1, alignItems: 'center' },
  listingDetailLabel:  { fontSize: 10, color: '#aaa', fontWeight: '500', marginBottom: 4 },
  listingDetailValue:  { fontSize: 13, fontWeight: '700', color: '#1a1a1a' },
  listingDivider:      { width: 1, backgroundColor: '#e0e0e0' },
  callBtn:             { backgroundColor: '#e8f5e9', borderRadius: 12, padding: 13, alignItems: 'center', borderWidth: 1, borderColor: '#c8e6c9' },
  callBtnText:         { fontSize: 14, fontWeight: '700', color: '#1a6b3c' },

  // Empty state
  emptyCard:           { backgroundColor: '#fff', borderRadius: 18, padding: 32, alignItems: 'center', elevation: 1 },
  emptyEmoji:          { fontSize: 48, marginBottom: 12 },
  emptyTitle:          { fontSize: 16, fontWeight: '700', color: '#1a1a1a', marginBottom: 6 },
  emptySub:            { fontSize: 13, color: '#888', marginBottom: 16 },
  emptyBtn:            { backgroundColor: '#1a6b3c', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 20 },
  emptyBtnText:        { color: '#fff', fontWeight: '700', fontSize: 14 },

  // Coming soon
  comingSoon:          { backgroundColor: '#1565c0', marginHorizontal: 16, marginTop: 8, borderRadius: 18, padding: 24, alignItems: 'center' },
  comingSoonEmoji:     { fontSize: 36, marginBottom: 10 },
  comingSoonTitle:     { fontSize: 16, fontWeight: '800', color: '#fff', marginBottom: 8, textAlign: 'center' },
  comingSoonText:      { fontSize: 13, color: 'rgba(255,255,255,0.8)', textAlign: 'center', lineHeight: 20 },
});