import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const CROPS = [
  { emoji: '🍄', name: 'Oyster Mushrooms', profit: '₹8,000–15,000/month', time: '45 days', investment: '₹3,000', color: '#7b5ea7', steps: ['Buy oyster mushroom spawn from local supplier', 'Fill bags with rice straw or sawdust', 'Inoculate bags with spawn and seal them', 'Keep in a dark humid room at 25–28°C', 'Mist with water 2–3 times daily', 'Harvest when caps are fully open in 3–4 weeks'] },
  { emoji: '🌿', name: 'Microgreens', profit: '₹10,000–20,000/month', time: '7–14 days', investment: '₹2,000', color: '#4caf50', steps: ['Buy seeds — sunflower, radish, pea, mustard', 'Fill shallow trays with coconut coir or soil', 'Spread seeds densely and water gently', 'Cover with a dome or cloth for 2–3 days', 'Place in sunlight once sprouts appear', 'Harvest with scissors just above soil level'] },
  { emoji: '🌱', name: 'Stevia', profit: '₹15,000–25,000/month', time: '3 months', investment: '₹5,000', color: '#26a69a', steps: ['Buy stevia saplings from a certified nursery', 'Plant in well-drained soil with good sunlight', 'Water regularly but avoid waterlogging', 'Apply organic compost every 30 days', 'Harvest leaves before flowering begins', 'Dry leaves and sell to pharma/food companies'] },
  { emoji: '🥦', name: 'Exotic Vegetables', profit: '₹20,000–40,000/month', time: '60–90 days', investment: '₹10,000', color: '#f5a623', steps: ['Choose crops — broccoli, zucchini, colored capsicum', 'Prepare raised beds with rich compost soil', 'Sow seeds or transplant seedlings', 'Water daily and add drip irrigation if possible', 'Control pests with neem oil spray', 'Sell directly to restaurants and supermarkets'] },
];

export default function LearnScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>{t('common.back')}</Text>
      </TouchableOpacity>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.headerSection}>
          <Text style={styles.headerTitle}>{t('learn.title')}</Text>
          <Text style={styles.headerSub}>{t('learn.subtitle')}</Text>
        </View>
        {CROPS.map((crop, i) => (
          <View key={i} style={[styles.cropCard, { borderLeftColor: crop.color }]}>
            <View style={styles.cropHeader}>
              <Text style={styles.cropEmoji}>{crop.emoji}</Text>
              <View style={styles.cropInfo}>
                <Text style={styles.cropName}>{crop.name}</Text>
                <Text style={[styles.cropProfit, { color: crop.color }]}>{crop.profit}</Text>
              </View>
            </View>
            <View style={styles.cropStats}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>{t('learn.readyIn')}</Text>
                <Text style={styles.statValue}>{crop.time}</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>{t('learn.investment')}</Text>
                <Text style={styles.statValue}>{crop.investment}</Text>
              </View>
            </View>
            <Text style={styles.stepsTitle}>{t('learn.howToStart')}</Text>
            {crop.steps.map((step, j) => (
              <View key={j} style={styles.stepRow}>
                <View style={[styles.stepNum, { backgroundColor: crop.color }]}>
                  <Text style={styles.stepNumText}>{j + 1}</Text>
                </View>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
          </View>
        ))}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#f5f7f5' },
  backButton:   { padding: 16, paddingTop: 52 },
  backText:     { fontSize: 16, color: '#1a6b3c', fontWeight: '600' },
  headerSection: { paddingHorizontal: 20, paddingBottom: 16 },
  headerTitle:  { fontSize: 24, fontWeight: '700', color: '#1a1a1a', marginBottom: 6 },
  headerSub:    { fontSize: 14, color: '#888' },
  cropCard:     { backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 16, borderRadius: 14, padding: 18, borderLeftWidth: 4, elevation: 2 },
  cropHeader:   { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  cropEmoji:    { fontSize: 36, marginRight: 12 },
  cropInfo:     { flex: 1 },
  cropName:     { fontSize: 17, fontWeight: '700', color: '#1a1a1a', marginBottom: 4 },
  cropProfit:   { fontSize: 14, fontWeight: '600' },
  cropStats:    { flexDirection: 'row', gap: 12, marginBottom: 16 },
  statBox:      { flex: 1, backgroundColor: '#f9f9f9', borderRadius: 8, padding: 10 },
  statLabel:    { fontSize: 11, color: '#aaa', marginBottom: 4 },
  statValue:    { fontSize: 13, fontWeight: '600', color: '#1a1a1a' },
  stepsTitle:   { fontSize: 13, fontWeight: '600', color: '#888', marginBottom: 10 },
  stepRow:      { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  stepNum:      { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', marginRight: 10, marginTop: 1 },
  stepNumText:  { color: '#fff', fontSize: 11, fontWeight: '700' },
  stepText:     { flex: 1, fontSize: 13, color: '#444', lineHeight: 20 },
});