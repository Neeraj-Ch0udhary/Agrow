import { useRouter } from 'expo-router';
import {
  SafeAreaView, ScrollView, StyleSheet,
  Text, TouchableOpacity, View
} from 'react-native';

const BUYERS = [
  {
    emoji: '🍽️',
    title: 'Restaurants & Hotels',
    want: 'Exotic vegetables, mushrooms, microgreens',
    tip: 'Visit directly with a sample. Chefs love fresh local produce.',
    color: '#1a6b3c',
    bg: '#e8f5e9',
  },
  {
    emoji: '🏪',
    title: 'Supermarkets',
    want: 'Packaged microgreens, mushrooms, organic veggies',
    tip: 'Contact the store manager. Bring quality certification if possible.',
    color: '#1565c0',
    bg: '#e3f2fd',
  },
  {
    emoji: '☁️',
    title: 'Cloud Kitchens',
    want: 'Regular fresh supply of any modern crop',
    tip: 'They need consistent daily supply — great for long-term contracts.',
    color: '#6a1b9a',
    bg: '#f3e5f5',
  },
  {
    emoji: '💊',
    title: 'Pharma Companies',
    want: 'Stevia, ashwagandha, medicinal herbs',
    tip: 'Look for local pharma buyers or FMCG companies in your state.',
    color: '#e65100',
    bg: '#fff3e0',
  },
  {
    emoji: '📱',
    title: 'Online (Direct)',
    want: 'Anything fresh and organic',
    tip: 'Sell on WhatsApp groups, Instagram, or local Facebook groups.',
    color: '#00838f',
    bg: '#e0f7fa',
  },
];

const SELLING_TIPS = [
  { emoji: '📸', tip: 'Take good photos of your produce before approaching buyers' },
  { emoji: '⚖️', tip: 'Always weigh and grade your produce before selling' },
  { emoji: '🤝', tip: 'Build relationships — repeat buyers pay 20–30% more' },
  { emoji: '📋', tip: 'Keep a record of every sale for tax and planning purposes' },
];

export default function SellScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>🏪 Sell</Text>
          <Text style={styles.headerSub}>Find buyers and sell at the best price</Text>
        </View>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* Marketplace CTA */}
        <TouchableOpacity
          style={styles.marketplaceCard}
          onPress={() => router.push('/(tabs)/market')}>
          <Text style={styles.marketplaceEmoji}>🚀</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.marketplaceTitle}>Post on Agrow Marketplace</Text>
            <Text style={styles.marketplaceSub}>List your harvest and connect directly with verified buyers near you.</Text>
          </View>
          <Text style={styles.marketplaceArrow}>›</Text>
        </TouchableOpacity>

        {/* Who to sell to */}
        <Text style={styles.sectionLabel}>Who to Sell to Right Now</Text>

        {BUYERS.map((buyer, i) => (
          <View key={i} style={[styles.buyerCard, { borderLeftColor: buyer.color }]}>
            <View style={styles.buyerTop}>
              <View style={[styles.buyerEmojiBox, { backgroundColor: buyer.bg }]}>
                <Text style={styles.buyerEmoji}>{buyer.emoji}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.buyerTitle, { color: buyer.color }]}>{buyer.title}</Text>
                <Text style={styles.buyerWant}>
                  <Text style={styles.buyerWantLabel}>They want: </Text>
                  {buyer.want}
                </Text>
              </View>
            </View>
            <View style={[styles.buyerTipRow, { backgroundColor: buyer.bg }]}>
              <Text style={styles.bulbEmoji}>💡</Text>
              <Text style={[styles.buyerTip, { color: buyer.color }]}>{buyer.tip}</Text>
            </View>
          </View>
        ))}

        {/* Selling tips */}
        <Text style={styles.sectionLabel}>Selling Tips</Text>
        <View style={styles.tipsCard}>
          {SELLING_TIPS.map((item, i) => (
            <View key={i} style={[styles.tipRow, i < SELLING_TIPS.length - 1 && styles.tipRowBorder]}>
              <Text style={styles.tipEmoji}>{item.emoji}</Text>
              <Text style={styles.tipText}>{item.tip}</Text>
            </View>
          ))}
        </View>

        {/* Ask AI */}
        <TouchableOpacity style={styles.aiCard} onPress={() => router.push('/chat')}>
          <Text style={styles.aiEmoji}>🤖</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.aiTitle}>Need selling advice?</Text>
            <Text style={styles.aiSub}>Ask Agrow AI for pricing strategy and buyer contacts in your area.</Text>
          </View>
          <Text style={styles.aiArrow}>›</Text>
        </TouchableOpacity>

        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:          { flex: 1, backgroundColor: '#f0f4f0' },
  header:             { backgroundColor: '#880e4f', paddingTop: 52, paddingBottom: 16, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backText:           { color: '#f8bbd0', fontSize: 15, fontWeight: '600' },
  headerCenter:       { alignItems: 'center' },
  headerTitle:        { fontSize: 18, fontWeight: '800', color: '#fff' },
  headerSub:          { fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  content:            { padding: 16 },
  marketplaceCard:    { backgroundColor: '#1a6b3c', borderRadius: 18, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 20, elevation: 3 },
  marketplaceEmoji:   { fontSize: 32 },
  marketplaceTitle:   { fontSize: 15, fontWeight: '800', color: '#fff', marginBottom: 4 },
  marketplaceSub:     { fontSize: 12, color: 'rgba(255,255,255,0.8)', lineHeight: 17 },
  marketplaceArrow:   { fontSize: 24, color: 'rgba(255,255,255,0.6)', fontWeight: '300' },
  sectionLabel:       { fontSize: 11, fontWeight: '700', color: '#888', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 },
  buyerCard:          { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, borderLeftWidth: 4, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4 },
  buyerTop:           { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  buyerEmojiBox:      { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  buyerEmoji:         { fontSize: 22 },
  buyerTitle:         { fontSize: 15, fontWeight: '800', marginBottom: 3 },
  buyerWant:          { fontSize: 12, color: '#666', lineHeight: 17 },
  buyerWantLabel:     { fontWeight: '700', color: '#444' },
  buyerTipRow:        { flexDirection: 'row', alignItems: 'flex-start', gap: 8, borderRadius: 10, padding: 10 },
  bulbEmoji:          { fontSize: 14 },
  buyerTip:           { fontSize: 12, flex: 1, lineHeight: 17, fontWeight: '500' },
  tipsCard:           { backgroundColor: '#fff', borderRadius: 16, padding: 4, marginBottom: 16, elevation: 2 },
  tipRow:             { flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: 14 },
  tipRowBorder:       { borderBottomWidth: 0.5, borderBottomColor: '#f0f0f0' },
  tipEmoji:           { fontSize: 20 },
  tipText:            { flex: 1, fontSize: 13, color: '#444', lineHeight: 20 },
  aiCard:             { backgroundColor: '#4a148c', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, elevation: 2 },
  aiEmoji:            { fontSize: 28 },
  aiTitle:            { fontSize: 14, fontWeight: '800', color: '#fff', marginBottom: 2 },
  aiSub:              { fontSize: 11, color: 'rgba(255,255,255,0.75)' },
  aiArrow:            { fontSize: 22, color: 'rgba(255,255,255,0.5)' },
});