import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const MODERN_CROPS = [
  { emoji: '🍄', name: 'Mushroom', profit: '₹15k/mo', time: '45 days', color: '#7b5ea7', bg: '#f3e5f5' },
  { emoji: '🌿', name: 'Microgreens', profit: '₹20k/mo', time: '14 days', color: '#2e7d32', bg: '#e8f5e9' },
  { emoji: '🌱', name: 'Stevia', profit: '₹25k/mo', time: '90 days', color: '#00695c', bg: '#e0f2f1' },
  { emoji: '🥦', name: 'Exotic Veg', profit: '₹40k/mo', time: '75 days', color: '#e65100', bg: '#fff3e0' },
  { emoji: '🌾', name: 'Lemongrass', profit: '₹50k/mo', time: '90 days', color: '#558b2f', bg: '#f1f8e9' },
  { emoji: '💧', name: 'Hydroponics', profit: '₹80k/mo', time: '60 days', color: '#1565c0', bg: '#e3f2fd' },
];

const TIPS = [
  { emoji: '💡', tip: 'Mushrooms grow best in dark humid rooms at 25–28°C', category: 'Mushroom' },
  { emoji: '💡', tip: 'Microgreens are ready in 7–14 days and sell at ₹280/kg', category: 'Microgreens' },
  { emoji: '💡', tip: 'Sell directly to restaurants — they pay 40% more than mandis', category: 'Selling' },
  { emoji: '💡', tip: 'Use neem oil spray to control pests organically', category: 'Pest Control' },
  { emoji: '💡', tip: 'Stevia needs well-drained soil and full sunlight', category: 'Stevia' },
];

export default function ExploreScreen() {
  const router = useRouter();
  const { t }  = useTranslation();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🔭 Explore</Text>
        <Text style={styles.headerSub}>Discover modern farming opportunities</Text>
      </View>

      {/* Modern Crops */}
      <Text style={styles.sectionTitle}>🌱 Modern Crops</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cropScroll} contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}>
        {MODERN_CROPS.map((crop, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.cropChip, { backgroundColor: crop.bg }]}
            onPress={() => router.push('/learn')}>
            <Text style={styles.cropChipEmoji}>{crop.emoji}</Text>
            <Text style={[styles.cropChipName, { color: crop.color }]}>{crop.name}</Text>
            <Text style={[styles.cropChipProfit, { color: crop.color }]}>{crop.profit}</Text>
            <View style={[styles.cropChipBadge, { backgroundColor: crop.color + '20' }]}>
              <Text style={[styles.cropChipTime, { color: crop.color }]}>⏱ {crop.time}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
      <View style={styles.quickGrid}>
        {[
          { emoji: '🌍', label: 'Land Quiz', route: '/land', color: '#1a6b3c', bg: '#e8f5e9' },
          { emoji: '💰', label: 'Calculator', route: '/calculator', color: '#f57f17', bg: '#fffde7' },
          { emoji: '🤖', label: 'Ask AI', route: '/chat', color: '#4a148c', bg: '#f3e5f5' },
          { emoji: '🔍', label: 'Disease', route: '/disease', color: '#b71c1c', bg: '#ffebee' },
          { emoji: '📋', label: 'My Plan', route: '/plan', color: '#bf360c', bg: '#fbe9e7' },
          { emoji: '📈', label: 'Mandi', route: '/mandi', color: '#1565c0', bg: '#e3f2fd' },
        ].map((item, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.quickCard, { backgroundColor: item.bg }]}
            onPress={() => router.push(item.route as any)}>
            <Text style={styles.quickEmoji}>{item.emoji}</Text>
            <Text style={[styles.quickLabel, { color: item.color }]}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Farming Tips */}
      <Text style={styles.sectionTitle}>💡 Farming Tips</Text>
      {TIPS.map((item, i) => (
        <View key={i} style={styles.tipCard}>
          <View style={styles.tipLeft}>
            <Text style={styles.tipEmoji}>{item.emoji}</Text>
          </View>
          <View style={styles.tipRight}>
            <Text style={styles.tipCategory}>{item.category}</Text>
            <Text style={styles.tipText}>{item.tip}</Text>
          </View>
        </View>
      ))}

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: '#f0f4f0' },
  header:           { backgroundColor: '#1a6b3c', paddingTop: 56, paddingBottom: 24, paddingHorizontal: 20, borderBottomLeftRadius: 28, borderBottomRightRadius: 28, marginBottom: 20 },
  headerTitle:      { fontSize: 26, fontWeight: '800', color: '#fff', marginBottom: 4 },
  headerSub:        { fontSize: 13, color: 'rgba(255,255,255,0.75)' },
  sectionTitle:     { fontSize: 15, fontWeight: '700', color: '#1a1a1a', paddingHorizontal: 16, marginBottom: 12, marginTop: 8 },
  cropScroll:       { marginBottom: 20 },
  cropChip:         { width: 130, borderRadius: 18, padding: 14, alignItems: 'center' },
  cropChipEmoji:    { fontSize: 32, marginBottom: 8 },
  cropChipName:     { fontSize: 14, fontWeight: '800', marginBottom: 4 },
  cropChipProfit:   { fontSize: 13, fontWeight: '700', marginBottom: 8 },
  cropChipBadge:    { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  cropChipTime:     { fontSize: 11, fontWeight: '600' },
  quickGrid:        { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 10, marginBottom: 20 },
  quickCard:        { width: '30%', borderRadius: 16, padding: 14, alignItems: 'center', aspectRatio: 1, justifyContent: 'center' },
  quickEmoji:       { fontSize: 26, marginBottom: 6 },
  quickLabel:       { fontSize: 11, fontWeight: '700', textAlign: 'center' },
  tipCard:          { backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 14, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'flex-start', elevation: 1 },
  tipLeft:          { width: 36, height: 36, borderRadius: 10, backgroundColor: '#fff8e1', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  tipEmoji:         { fontSize: 18 },
  tipRight:         { flex: 1 },
  tipCategory:      { fontSize: 11, color: '#f57f17', fontWeight: '700', marginBottom: 3 },
  tipText:          { fontSize: 13, color: '#444', lineHeight: 19 },
});