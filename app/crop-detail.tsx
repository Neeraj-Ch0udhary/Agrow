import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CROPS } from './learn';

export default function CropDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const crop = CROPS.find(c => c.id === id) ?? CROPS[0];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 80 }}>

      {/* Header */}
      <View style={[styles.header, { backgroundColor: crop.color }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View style={[styles.emojiCircle, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
            <Text style={styles.headerEmoji}>{crop.emoji}</Text>
          </View>
          <Text style={styles.headerName}>{crop.name}</Text>
          <Text style={styles.headerTagline}>{crop.tagline}</Text>
          <Text style={styles.headerProfit}>{crop.profit}</Text>
        </View>
      </View>

      {/* Quick stats */}
      <View style={styles.statsRow}>
        {[
          { label: '⏱ Ready in', value: crop.time },
          { label: '💰 Investment', value: crop.investment },
          { label: '📐 Space', value: crop.space },
          { label: '📊 Level', value: crop.difficulty },
        ].map((s, i) => (
          <View key={i} style={styles.statCard}>
            <Text style={styles.statLabel}>{s.label}</Text>
            <Text style={[styles.statValue, { color: crop.color }]}>{s.value}</Text>
          </View>
        ))}
      </View>

      {/* Description */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📖 About This Crop</Text>
        <Text style={styles.description}>{crop.description}</Text>
      </View>

      {/* Requirements */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>✅ Requirements</Text>
        <View style={styles.reqGrid}>
          {crop.requirements.map((r, i) => (
            <View key={i} style={[styles.reqCard, { borderColor: crop.color + '40' }]}>
              <Text style={styles.reqIcon}>{r.icon}</Text>
              <Text style={styles.reqLabel}>{r.label}</Text>
              <Text style={[styles.reqValue, { color: crop.color }]}>{r.value}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Step by step */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🪜 Step-by-Step Guide</Text>
        {crop.steps.map((step, i) => (
          <View key={i} style={styles.stepCard}>
            <View style={[styles.stepNumBox, { backgroundColor: crop.color }]}>
              <Text style={styles.stepNum}>{i + 1}</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={[styles.stepTitle, { color: crop.color }]}>{step.title}</Text>
              <Text style={styles.stepDesc}>{step.desc}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Profit breakdown */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💰 Profit Breakdown</Text>
        <View style={[styles.profitCard, { backgroundColor: crop.bg }]}>
          {crop.profit_breakdown.map((p, i) => (
            <View key={i} style={[
              styles.profitRow,
              i < crop.profit_breakdown.length - 1 && styles.profitRowBorder,
              i === crop.profit_breakdown.length - 1 && styles.profitRowLast,
            ]}>
              <Text style={[styles.profitLabel, i === crop.profit_breakdown.length - 1 && styles.profitLabelBold]}>
                {p.label}
              </Text>
              <Text style={[styles.profitValue, { color: crop.color },
                i === crop.profit_breakdown.length - 1 && styles.profitValueBig]}>
                {p.value}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Tips */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💡 Pro Tips</Text>
        {crop.tips.map((tip, i) => (
          <View key={i} style={styles.tipRow}>
            <View style={[styles.tipDot, { backgroundColor: crop.color }]} />
            <Text style={styles.tipText}>{tip}</Text>
          </View>
        ))}
      </View>

      {/* Buyers */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🛒 Who Buys This</Text>
        <View style={styles.buyersRow}>
          {crop.buyers.map((b, i) => (
            <View key={i} style={[styles.buyerChip, { backgroundColor: crop.bg, borderColor: crop.color + '40' }]}>
              <Text style={[styles.buyerText, { color: crop.color }]}>{b}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* CTA */}
      <TouchableOpacity
        style={[styles.ctaBtn, { backgroundColor: crop.color }]}
        onPress={() => router.push('/land')}>
        <Text style={styles.ctaBtnText}>🌍 Start Land Assessment for {crop.name} →</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: '#f0f4f0' },
  header:          { paddingTop: 52, paddingBottom: 32, paddingHorizontal: 20 },
  backBtn:         { color: 'rgba(255,255,255,0.8)', fontSize: 15, fontWeight: '600', marginBottom: 20 },
  headerContent:   { alignItems: 'center' },
  emojiCircle:     { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  headerEmoji:     { fontSize: 52 },
  headerName:      { fontSize: 26, fontWeight: '800', color: '#fff', marginBottom: 6, textAlign: 'center' },
  headerTagline:   { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 10, textAlign: 'center' },
  headerProfit:    { fontSize: 18, fontWeight: '800', color: '#fff', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
  statsRow:        { flexDirection: 'row', marginHorizontal: 16, marginTop: -20, gap: 8 },
  statCard:        { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 10, alignItems: 'center', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6 },
  statLabel:       { fontSize: 9, color: '#aaa', marginBottom: 4, textAlign: 'center' },
  statValue:       { fontSize: 11, fontWeight: '800', textAlign: 'center' },
  section:         { marginHorizontal: 16, marginTop: 20 },
  sectionTitle:    { fontSize: 15, fontWeight: '800', color: '#1a1a1a', marginBottom: 12 },
  description:     { fontSize: 14, color: '#444', lineHeight: 22 },
  reqGrid:         { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  reqCard:         { width: '47%', backgroundColor: '#fff', borderRadius: 14, padding: 14, borderWidth: 1, elevation: 1 },
  reqIcon:         { fontSize: 22, marginBottom: 6 },
  reqLabel:        { fontSize: 10, color: '#aaa', marginBottom: 3 },
  reqValue:        { fontSize: 13, fontWeight: '700' },
  stepCard:        { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10, elevation: 1 },
  stepNumBox:      { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 12, flexShrink: 0 },
  stepNum:         { color: '#fff', fontWeight: '800', fontSize: 14 },
  stepContent:     { flex: 1 },
  stepTitle:       { fontSize: 14, fontWeight: '800', marginBottom: 4 },
  stepDesc:        { fontSize: 13, color: '#555', lineHeight: 20 },
  profitCard:      { borderRadius: 16, padding: 16 },
  profitRow:       { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 },
  profitRowBorder: { borderBottomWidth: 0.5, borderBottomColor: 'rgba(0,0,0,0.08)' },
  profitRowLast:   { marginTop: 4 },
  profitLabel:     { fontSize: 13, color: '#555' },
  profitLabelBold: { fontWeight: '800', color: '#1a1a1a', fontSize: 14 },
  profitValue:     { fontSize: 13, fontWeight: '600' },
  profitValueBig:  { fontSize: 18, fontWeight: '800' },
  tipRow:          { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  tipDot:          { width: 8, height: 8, borderRadius: 4, marginTop: 6, marginRight: 10, flexShrink: 0 },
  tipText:         { flex: 1, fontSize: 13, color: '#444', lineHeight: 20 },
  buyersRow:       { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  buyerChip:       { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  buyerText:       { fontSize: 12, fontWeight: '600' },
  ctaBtn:          { marginHorizontal: 16, marginTop: 24, padding: 18, borderRadius: 16, alignItems: 'center', elevation: 3 },
  ctaBtnText:      { color: '#fff', fontSize: 15, fontWeight: '800' },
});