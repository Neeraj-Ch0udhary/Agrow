import { useRouter } from 'expo-router';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const BUYERS = [
  { type: 'Restaurants & Hotels', emoji: '🍽️', demand: 'Exotic vegetables, mushrooms, microgreens', tip: 'Visit directly with a sample. Chefs love fresh local produce.' },
  { type: 'Supermarkets', emoji: '🏪', demand: 'Packaged microgreens, mushrooms, organic veggies', tip: 'Contact the store manager. Bring quality certification if possible.' },
  { type: 'Cloud Kitchens', emoji: '📦', demand: 'Regular fresh supply of any modern crop', tip: 'They need consistent daily supply — great for long-term contracts.' },
  { type: 'Pharma Companies', emoji: '💊', demand: 'Stevia, ashwagandha, medicinal herbs', tip: 'Look for local pharma buyers or FMCG companies in your state.' },
  { type: 'Online (Direct)', emoji: '📱', demand: 'Anything fresh and organic', tip: 'Sell on WhatsApp groups, Instagram, or local Facebook groups.' },
];

export default function SellScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.headerSection}>
          <Text style={styles.headerTitle}>🏪 Marketplace</Text>
          <Text style={styles.headerSub}>Find buyers and sell at the best price</Text>
        </View>

        <View style={styles.comingCard}>
          <Text style={styles.comingEmoji}>🚀</Text>
          <Text style={styles.comingTitle}>Live Marketplace — Coming Soon</Text>
          <Text style={styles.comingText}>List your harvest and connect directly with verified buyers near you.</Text>
        </View>

        <Text style={styles.sectionLabel}>Who to sell to right now</Text>

        {BUYERS.map((buyer, i) => (
          <View key={i} style={styles.buyerCard}>
            <View style={styles.buyerHeader}>
              <Text style={styles.buyerEmoji}>{buyer.emoji}</Text>
              <Text style={styles.buyerType}>{buyer.type}</Text>
            </View>
            <View style={styles.demandRow}>
              <Text style={styles.demandLabel}>They want: </Text>
              <Text style={styles.demandText}>{buyer.demand}</Text>
            </View>
            <View style={styles.tipRow}>
              <Text style={styles.tipIcon}>💡</Text>
              <Text style={styles.tipText}>{buyer.tip}</Text>
            </View>
          </View>
        ))}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7f5' },
  backButton: { padding: 16, paddingTop: 52 },
  backText: { fontSize: 16, color: '#1a6b3c', fontWeight: '600' },
  headerSection: { paddingHorizontal: 20, paddingBottom: 16 },
  headerTitle: { fontSize: 24, fontWeight: '700', color: '#1a1a1a', marginBottom: 6 },
  headerSub: { fontSize: 14, color: '#888' },
  comingCard: { backgroundColor: '#1a6b3c', marginHorizontal: 16, borderRadius: 14, padding: 20, marginBottom: 24, alignItems: 'center' },
  comingEmoji: { fontSize: 36, marginBottom: 8 },
  comingTitle: { fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 8, textAlign: 'center' },
  comingText: { fontSize: 13, color: '#a8d5b5', textAlign: 'center', lineHeight: 20 },
  sectionLabel: { fontSize: 14, fontWeight: '600', color: '#888', paddingHorizontal: 20, marginBottom: 12 },
  buyerCard: { backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 12, borderRadius: 12, padding: 16, elevation: 2 },
  buyerHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  buyerEmoji: { fontSize: 24, marginRight: 10 },
  buyerType: { fontSize: 16, fontWeight: '700', color: '#1a1a1a' },
  demandRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 },
  demandLabel: { fontSize: 13, color: '#888', fontWeight: '600' },
  demandText: { fontSize: 13, color: '#444', flex: 1 },
  tipRow: { flexDirection: 'row', backgroundColor: '#f9f9f9', borderRadius: 8, padding: 10, alignItems: 'flex-start' },
  tipIcon: { fontSize: 14, marginRight: 8 },
  tipText: { fontSize: 13, color: '#555', flex: 1, lineHeight: 18 },
});