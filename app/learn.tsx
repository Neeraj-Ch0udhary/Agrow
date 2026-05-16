import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import {
  SafeAreaView, ScrollView, StyleSheet,
  Text, TouchableOpacity, View
} from 'react-native';

export const CROPS = [
  {
    id: 'mushroom',
    emoji: '🍄',
    name: 'Oyster Mushrooms',
    profit: '₹8,000–15,000/month',
    time: '45 days',
    investment: '₹3,000',
    difficulty: 'Beginner',
    space: '50 sq ft',
    color: '#7b5ea7',
    bg: '#f3e5f5',
    tagline: 'Grow indoors, earn big — no land needed',
    description: 'Oyster mushrooms are the easiest modern crop to start. They grow in small dark rooms, require minimal investment, and produce harvests every 45 days. Restaurants pay premium prices for fresh supply.',
    requirements: [
      { icon: '🌡️', label: 'Temperature', value: '25–28°C' },
      { icon: '💧', label: 'Humidity', value: '80–90%' },
      { icon: '☀️', label: 'Light', value: 'Indirect / Dark' },
      { icon: '📦', label: 'Space', value: '50+ sq ft' },
    ],
    steps: [
      { title: 'Buy Spawn', desc: 'Purchase oyster mushroom spawn from a local supplier or online. Cost: ₹200–500 per kg.' },
      { title: 'Prepare Substrate', desc: 'Soak rice straw or wheat straw in water for 8–10 hours. Drain and let it cool completely.' },
      { title: 'Fill Bags', desc: 'Alternate layers of straw and spawn in polythene bags. Seal with cotton plugs to allow airflow.' },
      { title: 'Incubation', desc: 'Keep bags in a dark room at 25–28°C for 15–20 days until white mycelium covers the substrate.' },
      { title: 'Fruiting', desc: 'Move bags to a humid area. Mist with water 2–3 times daily. Mushrooms appear in 7–10 days.' },
      { title: 'Harvest', desc: 'Harvest when caps are fully open but before edges curl up. Twist and pull gently.' },
    ],
    buyers: ['Local restaurants', 'Supermarkets', 'Vegetable vendors', 'Hotels', 'Direct consumers'],
    tips: [
      'Sterilize bags properly — contamination is the #1 reason for failure',
      'Maintain humidity with a spray bottle or misting system',
      'One bag can give 2–3 flushes before exhausted',
      'Start with 20–30 bags to earn ₹3,000–5,000 per cycle',
    ],
    profit_breakdown: [
      { label: 'Investment (30 bags)', value: '₹3,000' },
      { label: 'Yield per cycle', value: '15–20 kg' },
      { label: 'Selling price', value: '₹100–150/kg' },
      { label: 'Revenue per cycle', value: '₹1,500–3,000' },
      { label: 'Monthly profit', value: '₹8,000–15,000' },
    ],
  },
  {
    id: 'microgreens',
    emoji: '🌿',
    name: 'Microgreens',
    profit: '₹10,000–20,000/month',
    time: '7–14 days',
    investment: '₹2,000',
    difficulty: 'Beginner',
    space: '30 sq ft',
    color: '#4caf50',
    bg: '#e8f5e9',
    tagline: 'Ready in 10 days — fastest cash crop',
    description: 'Microgreens are young vegetable greens harvested just after sprouting. They are nutrition-dense, sell at ₹300–600/kg, and can be grown on a terrace or balcony. Urban restaurants love them.',
    requirements: [
      { icon: '🌡️', label: 'Temperature', value: '18–24°C' },
      { icon: '💧', label: 'Humidity', value: '50–70%' },
      { icon: '☀️', label: 'Light', value: '4–6 hrs sunlight' },
      { icon: '📦', label: 'Space', value: '30+ sq ft' },
    ],
    steps: [
      { title: 'Choose Seeds', desc: 'Start with sunflower, radish, mustard, or peas. Buy from agri stores. Cost: ₹100–300/kg.' },
      { title: 'Prepare Trays', desc: 'Fill shallow trays (2 inches deep) with coconut coir or potting mix. Moisten the medium.' },
      { title: 'Sow Seeds', desc: 'Spread seeds densely across the tray. Press gently into the medium. Water lightly.' },
      { title: 'Germination', desc: 'Cover with a dome or cloth for 2–3 days in darkness. Seeds sprout within 24–48 hours.' },
      { title: 'Growing', desc: 'Remove cover once sprouts appear. Place in sunlight. Water from the bottom to prevent mold.' },
      { title: 'Harvest', desc: 'Cut with scissors just above soil level when 2–3 inches tall. Pack and deliver same day.' },
    ],
    buyers: ['Restaurants & cafes', 'Juice bars', 'Health food stores', 'Online delivery apps', 'Gyms & fitness centers'],
    tips: [
      'Bottom watering prevents damping-off (mold at soil level)',
      'Blackout period in germination is crucial — use a cardboard cover',
      'Sell fresh — microgreens have 5–7 day shelf life',
      'Sunflower and pea shoots fetch highest prices',
    ],
    profit_breakdown: [
      { label: 'Investment (10 trays)', value: '₹2,000' },
      { label: 'Yield per tray', value: '150–200g' },
      { label: 'Selling price', value: '₹300–600/kg' },
      { label: 'Revenue per cycle', value: '₹500–1,200' },
      { label: 'Monthly profit', value: '₹10,000–20,000' },
    ],
  },
  {
    id: 'stevia',
    emoji: '🌱',
    name: 'Stevia',
    profit: '₹15,000–25,000/month',
    time: '3 months',
    investment: '₹5,000',
    difficulty: 'Intermediate',
    space: '200 sq ft',
    color: '#26a69a',
    bg: '#e0f2f1',
    tagline: 'Natural sweetener — pharma companies buy everything',
    description: 'Stevia is a natural zero-calorie sweetener. Indian pharma and food companies have a massive unmet demand. Once planted, stevia can be harvested multiple times per year for 5+ years.',
    requirements: [
      { icon: '🌡️', label: 'Temperature', value: '15–30°C' },
      { icon: '💧', label: 'Humidity', value: '40–60%' },
      { icon: '☀️', label: 'Light', value: 'Full sun 6+ hrs' },
      { icon: '📦', label: 'Space', value: '200+ sq ft' },
    ],
    steps: [
      { title: 'Buy Saplings', desc: 'Purchase certified stevia saplings from a government nursery or online. Avoid seeds — slow germination.' },
      { title: 'Prepare Soil', desc: 'Stevia needs well-drained sandy loam soil. Add organic compost. pH should be 6.5–7.5.' },
      { title: 'Planting', desc: 'Plant saplings 45cm apart in rows. Water immediately after planting. Mulch to retain moisture.' },
      { title: 'Maintenance', desc: 'Water every 2–3 days. Add organic fertilizer monthly. Remove flowering buds to boost leaf yield.' },
      { title: 'Harvest', desc: 'Harvest just before flowering (when sweetness peaks). Cut 2/3 of plant, leaving base to regrow.' },
      { title: 'Sell', desc: 'Dry leaves in shade, pack, and sell to pharma companies or through cooperatives. Fetch ₹150–200/kg.' },
    ],
    buyers: ['Pharma companies', 'Food manufacturers', 'Cooperative societies', 'Exporters', 'Health food brands'],
    tips: [
      'Contact pharma companies before planting — get a buyback agreement',
      'Avoid waterlogged soil — stevia roots rot easily',
      'One plant produces for 5+ years — long-term income',
      'Shade drying preserves steviol glycoside content (sweetness)',
    ],
    profit_breakdown: [
      { label: 'Investment (200 sq ft)', value: '₹5,000' },
      { label: 'Yield per harvest', value: '8–12 kg dry leaves' },
      { label: 'Selling price', value: '₹150–200/kg' },
      { label: 'Harvests per year', value: '3–4 times' },
      { label: 'Monthly profit', value: '₹15,000–25,000' },
    ],
  },
  {
    id: 'exotic-veg',
    emoji: '🥦',
    name: 'Exotic Vegetables',
    profit: '₹20,000–40,000/month',
    time: '60–90 days',
    investment: '₹10,000',
    difficulty: 'Intermediate',
    space: '500 sq ft',
    color: '#f5a623',
    bg: '#fff3e0',
    tagline: 'Supply restaurants what they can\'t get locally',
    description: 'Broccoli, colored capsicum, zucchini, and cherry tomatoes are in massive demand from urban restaurants. Most cities import these from far away — a local supplier gets premium rates and repeat orders.',
    requirements: [
      { icon: '🌡️', label: 'Temperature', value: '15–25°C' },
      { icon: '💧', label: 'Humidity', value: '50–70%' },
      { icon: '☀️', label: 'Light', value: 'Full sun 8 hrs' },
      { icon: '📦', label: 'Space', value: '500+ sq ft' },
    ],
    steps: [
      { title: 'Choose Crops', desc: 'Pick 2–3 vegetables. Broccoli + colored capsicum is a strong combo. Buy hybrid seeds.' },
      { title: 'Prepare Beds', desc: 'Raised beds with rich compost soil. Add vermicompost for best yield. Test soil pH (6–7).' },
      { title: 'Seedling Stage', desc: 'Sow in seedling trays, transplant at 3–4 weeks. Harden seedlings before field planting.' },
      { title: 'Growing', desc: 'Drip irrigation saves water and prevents disease. Add NPK fertilizer at 30 and 60 days.' },
      { title: 'Pest Control', desc: 'Weekly neem oil spray prevents 80% of pest attacks. Use yellow sticky traps for monitoring.' },
      { title: 'Harvest & Sell', desc: 'Harvest at correct maturity. Grade produce. Deliver directly to restaurants for best price.' },
    ],
    buyers: ['5-star restaurants', 'Hotel chains', 'Modern supermarkets', 'Cloud kitchens', 'Catering companies'],
    tips: [
      'Visit restaurants before growing — understand exactly what they want',
      'Consistent quality and reliable delivery builds long-term contracts',
      'Cold storage extends shelf life by 5–7 days',
      'Colored capsicum fetches 3× the price of regular capsicum',
    ],
    profit_breakdown: [
      { label: 'Investment (500 sq ft)', value: '₹10,000' },
      { label: 'Yield per cycle', value: '80–120 kg' },
      { label: 'Selling price', value: '₹60–120/kg' },
      { label: 'Revenue per cycle', value: '₹7,000–14,000' },
      { label: 'Monthly profit', value: '₹20,000–40,000' },
    ],
  },
  {
    id: 'lemongrass',
    emoji: '🌾',
    name: 'Lemongrass',
    profit: '₹12,000–20,000/month',
    time: '3 months',
    investment: '₹4,000',
    difficulty: 'Beginner',
    space: '300 sq ft',
    color: '#558b2f',
    bg: '#f1f8e9',
    tagline: 'Low maintenance, high demand from oil companies',
    description: 'Lemongrass is a perennial crop that grows back after every harvest. The essential oil extracted from it is in huge demand from cosmetics, pharma, and food companies. Minimal water needed.',
    requirements: [
      { icon: '🌡️', label: 'Temperature', value: '10–35°C' },
      { icon: '💧', label: 'Humidity', value: 'Low — drought tolerant' },
      { icon: '☀️', label: 'Light', value: 'Full sun' },
      { icon: '📦', label: 'Space', value: '300+ sq ft' },
    ],
    steps: [
      { title: 'Get Slips', desc: 'Buy lemongrass slips (stem cuttings) from a nursery. Plant in spring or monsoon.' },
      { title: 'Planting', desc: 'Plant 60cm apart in rows. Water well initially. Mulch to retain moisture.' },
      { title: 'First Growth', desc: 'Minimal care needed. Water every 7–10 days. No major fertilizer needed.' },
      { title: 'First Harvest', desc: 'Cut stalks 10cm above ground at 3 months. The plant regrows automatically.' },
      { title: 'Repeat Harvest', desc: 'Harvest every 3 months. One planting lasts 4–5 years with minimal maintenance.' },
      { title: 'Sell', desc: 'Sell fresh to distilleries, or distill oil yourself for 10× higher value.' },
    ],
    buyers: ['Essential oil distilleries', 'Cosmetic companies', 'Tea companies', 'Food flavoring units', 'Pharma companies'],
    tips: [
      'One-time planting, multiple harvests — best ROI per effort',
      'Distilling oil at home gives 10× more income than selling fresh',
      'Grows on degraded land where nothing else grows well',
      'Government subsidies available for aromatic plant cultivation',
    ],
    profit_breakdown: [
      { label: 'Investment (300 sq ft)', value: '₹4,000' },
      { label: 'Yield per harvest', value: '20–30 kg fresh grass' },
      { label: 'Selling price (fresh)', value: '₹8–12/kg' },
      { label: 'Harvests per year', value: '3–4 times' },
      { label: 'Monthly profit', value: '₹12,000–20,000' },
    ],
  },
  {
    id: 'hydroponics',
    emoji: '💧',
    name: 'Hydroponics',
    profit: '₹30,000–80,000/month',
    time: '60 days',
    investment: '₹25,000',
    difficulty: 'Advanced',
    space: '100 sq ft',
    color: '#1565c0',
    bg: '#e3f2fd',
    tagline: 'Soil-free farming — 3× yield in same space',
    description: 'Hydroponics grows plants in nutrient-rich water without soil. You can grow lettuce, spinach, herbs, and strawberries. 3–4× yield compared to soil farming in the same area.',
    requirements: [
      { icon: '🌡️', label: 'Temperature', value: '18–24°C' },
      { icon: '💧', label: 'Water pH', value: '5.5–6.5' },
      { icon: '☀️', label: 'Light', value: 'LED grow lights / sunlight' },
      { icon: '📦', label: 'Space', value: '100+ sq ft' },
    ],
    steps: [
      { title: 'Setup System', desc: 'Build or buy an NFT (Nutrient Film Technique) or DWC (Deep Water Culture) system. Budget ₹15,000–25,000.' },
      { title: 'Prepare Nutrients', desc: 'Mix hydroponic nutrient solution (A+B formula). Maintain EC 1.5–2.5 and pH 5.5–6.5.' },
      { title: 'Plant Seedlings', desc: 'Place seedlings in net pots with clay pebbles. Roots should touch the nutrient solution.' },
      { title: 'Monitor Daily', desc: 'Check pH and EC daily. Top up water as needed. Ensure pump runs 24/7.' },
      { title: 'Harvest', desc: 'Lettuce and herbs ready in 25–35 days. Harvest outer leaves first for continuous yield.' },
      { title: 'Scale Up', desc: 'Reinvest profits to add more channels. 100 sq ft earns ₹30–50k; 300 sq ft earns ₹1L+.' },
    ],
    buyers: ['Premium supermarkets', '5-star hotels', 'Organic stores', 'Corporate cafeterias', 'Export markets'],
    tips: [
      'Start small — master the system before investing heavily',
      'pH monitoring is critical — wrong pH = nutrient lockout',
      'LED grow lights allow 24/7 growing without sunlight dependence',
      'Lettuce and basil are easiest for beginners',
    ],
    profit_breakdown: [
      { label: 'Setup investment', value: '₹25,000' },
      { label: 'Monthly running cost', value: '₹3,000' },
      { label: 'Yield per month', value: '40–60 kg' },
      { label: 'Selling price', value: '₹150–300/kg' },
      { label: 'Monthly profit', value: '₹30,000–80,000' },
    ],
  },
];

export default function LearnScreen() {
  const router = useRouter();
  const { t }  = useTranslation();

  const getDifficultyColor = (d: string) =>
    d === 'Beginner' ? '#1a6b3c' : d === 'Intermediate' ? '#f57f17' : '#c62828';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🌱 Learn & Plan</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.headerSection}>
          <Text style={styles.headerSub}>Tap any crop to see the full guide, profit breakdown and buyer contacts</Text>
        </View>

        {CROPS.map((crop, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.cropCard, { borderLeftColor: crop.color }]}
            onPress={() => router.push({ pathname: '/crop-detail', params: { id: crop.id } })}
            activeOpacity={0.85}>

            <View style={styles.cropHeader}>
              <View style={[styles.emojiBox, { backgroundColor: crop.bg }]}>
                <Text style={styles.cropEmoji}>{crop.emoji}</Text>
              </View>
              <View style={styles.cropInfo}>
                <Text style={styles.cropName}>{crop.name}</Text>
                <Text style={[styles.cropProfit, { color: crop.color }]}>{crop.profit}</Text>
                <Text style={styles.cropTagline}>{crop.tagline}</Text>
              </View>
            </View>

            <View style={styles.cropStats}>
              <View style={[styles.statBox, { backgroundColor: crop.bg }]}>
                <Text style={styles.statLabel}>⏱ Ready in</Text>
                <Text style={[styles.statValue, { color: crop.color }]}>{crop.time}</Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: crop.bg }]}>
                <Text style={styles.statLabel}>💰 Investment</Text>
                <Text style={[styles.statValue, { color: crop.color }]}>{crop.investment}</Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: crop.bg }]}>
                <Text style={styles.statLabel}>📐 Space</Text>
                <Text style={[styles.statValue, { color: crop.color }]}>{crop.space}</Text>
              </View>
            </View>

            <View style={styles.cardFooter}>
              <View style={[styles.diffBadge, { backgroundColor: getDifficultyColor(crop.difficulty) + '18' }]}>
                <Text style={[styles.diffText, { color: getDifficultyColor(crop.difficulty) }]}>
                  {crop.difficulty}
                </Text>
              </View>
              <Text style={[styles.viewGuide, { color: crop.color }]}>View Full Guide →</Text>
            </View>

          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#f0f4f0' },
  header:       { backgroundColor: '#1a6b3c', paddingTop: 52, paddingBottom: 16, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backText:     { color: '#a8d5b5', fontSize: 15, fontWeight: '600' },
  headerTitle:  { fontSize: 18, fontWeight: '800', color: '#fff' },
  headerSection:{ paddingHorizontal: 16, paddingVertical: 12 },
  headerSub:    { fontSize: 13, color: '#666', lineHeight: 18 },
  cropCard:     { backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 14, borderRadius: 18, padding: 16, borderLeftWidth: 4, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6 },
  cropHeader:   { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  emojiBox:     { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  cropEmoji:    { fontSize: 28 },
  cropInfo:     { flex: 1 },
  cropName:     { fontSize: 16, fontWeight: '800', color: '#1a1a1a', marginBottom: 3 },
  cropProfit:   { fontSize: 13, fontWeight: '700', marginBottom: 3 },
  cropTagline:  { fontSize: 11, color: '#888', lineHeight: 15 },
  cropStats:    { flexDirection: 'row', gap: 8, marginBottom: 12 },
  statBox:      { flex: 1, borderRadius: 10, padding: 8 },
  statLabel:    { fontSize: 9, color: '#888', marginBottom: 3 },
  statValue:    { fontSize: 12, fontWeight: '700' },
  cardFooter:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  diffBadge:    { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  diffText:     { fontSize: 11, fontWeight: '700' },
  viewGuide:    { fontSize: 12, fontWeight: '700' },
});