import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const TOP_PRICES = [
  { emoji: '🍄', name: 'Oyster Mushroom', price: 140, change: 12, state: 'Delhi' },
  { emoji: '🌿', name: 'Microgreens', price: 280, change: 25, state: 'Delhi' },
  { emoji: '🥦', name: 'Broccoli', price: 65, change: -8, state: 'Karnataka' },
  { emoji: '🫑', name: 'Colored Capsicum', price: 85, change: 15, state: 'Maharashtra' },
  { emoji: '🌱', name: 'Stevia', price: 180, change: 8, state: 'MP' },
];

export default function MarketScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🏪 Marketplace</Text>
        <Text style={styles.headerSub}>Buy, sell and track prices</Text>
      </View>

      {/* Quick links */}
      <View style={styles.quickRow}>
        <TouchableOpacity style={[styles.quickBtn, { backgroundColor: '#e8f5e9' }]} onPress={() => router.push('/mandi')}>
          <Text style={styles.quickBtnEmoji}>📈</Text>
          <Text style={[styles.quickBtnText, { color: '#1a6b3c' }]}>Mandi Prices</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.quickBtn, { backgroundColor: '#e3f2fd' }]} onPress={() => router.push('/sell')}>
          <Text style={styles.quickBtnEmoji}>🛒</Text>
          <Text style={[styles.quickBtnText, { color: '#1565c0' }]}>Sell Harvest</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.quickBtn, { backgroundColor: '#fffde7' }]} onPress={() => router.push('/calculator')}>
          <Text style={styles.quickBtnEmoji}>💰</Text>
          <Text style={[styles.quickBtnText, { color: '#f57f17' }]}>Calculator</Text>
        </TouchableOpacity>
      </View>

      {/* Top prices today */}
      <Text style={styles.sectionTitle}>🔥 Top Prices Today</Text>
      {TOP_PRICES.map((item, i) => (
        <View key={i} style={styles.priceRow}>
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

      {/* Coming soon */}
      <View style={styles.comingSoon}>
        <Text style={styles.comingSoonEmoji}>🚀</Text>
        <Text style={styles.comingSoonTitle}>Live Marketplace Coming Soon!</Text>
        <Text style={styles.comingSoonText}>List your harvest and connect directly with verified buyers near you.</Text>
        <TouchableOpacity style={styles.notifyBtn}>
          <Text style={styles.notifyBtnText}>🔔 Notify Me When Live</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:         { flex: 1, backgroundColor: '#f0f4f0' },
  header:            { backgroundColor: '#1565c0', paddingTop: 56, paddingBottom: 24, paddingHorizontal: 20, borderBottomLeftRadius: 28, borderBottomRightRadius: 28, marginBottom: 20 },
  headerTitle:       { fontSize: 26, fontWeight: '800', color: '#fff', marginBottom: 4 },
  headerSub:         { fontSize: 13, color: 'rgba(255,255,255,0.75)' },
  quickRow:          { flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginBottom: 20 },
  quickBtn:          { flex: 1, borderRadius: 16, padding: 14, alignItems: 'center' },
  quickBtnEmoji:     { fontSize: 24, marginBottom: 6 },
  quickBtnText:      { fontSize: 11, fontWeight: '700', textAlign: 'center' },
  sectionTitle:      { fontSize: 15, fontWeight: '700', color: '#1a1a1a', paddingHorizontal: 16, marginBottom: 12 },
  priceRow:          { backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 14, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', elevation: 1 },
  priceEmoji:        { fontSize: 28, marginRight: 12 },
  priceInfo:         { flex: 1 },
  priceName:         { fontSize: 14, fontWeight: '600', color: '#1a1a1a', marginBottom: 3 },
  priceState:        { fontSize: 11, color: '#888' },
  priceRight:        { alignItems: 'flex-end' },
  priceValue:        { fontSize: 15, fontWeight: '800', color: '#1a1a1a', marginBottom: 4 },
  changeBadge:       { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  changeText:        { fontSize: 11, fontWeight: '600' },
  comingSoon:        { backgroundColor: '#1565c0', marginHorizontal: 16, borderRadius: 18, padding: 24, alignItems: 'center', marginTop: 8 },
  comingSoonEmoji:   { fontSize: 40, marginBottom: 12 },
  comingSoonTitle:   { fontSize: 16, fontWeight: '800', color: '#fff', marginBottom: 8, textAlign: 'center' },
  comingSoonText:    { fontSize: 13, color: 'rgba(255,255,255,0.8)', textAlign: 'center', lineHeight: 20, marginBottom: 16 },
  notifyBtn:         { backgroundColor: '#fff', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
  notifyBtnText:     { fontSize: 13, color: '#1565c0', fontWeight: '700' },
});