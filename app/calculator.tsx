import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  SafeAreaView, ScrollView, StyleSheet, Text,
  TextInput, TouchableOpacity, View
} from 'react-native';

type Crop = {
  name: string; emoji: string; color: string; bg: string;
  pricePerKg: number; yieldPerSqFt: number; cycleDays: number;
  investmentPerSqFt: number; laborPerMonth: number;
};

const CROPS: Crop[] = [
  { name: 'Oyster Mushroom',   emoji: '🍄', color: '#7b5ea7', bg: '#f3e5f5', pricePerKg: 140, yieldPerSqFt: 0.8, cycleDays: 45, investmentPerSqFt: 15, laborPerMonth: 2000 },
  { name: 'Microgreens',       emoji: '🌿', color: '#2e7d32', bg: '#e8f5e9', pricePerKg: 280, yieldPerSqFt: 0.3, cycleDays: 10, investmentPerSqFt: 12, laborPerMonth: 1500 },
  { name: 'Stevia',            emoji: '🌱', color: '#00695c', bg: '#e0f2f1', pricePerKg: 180, yieldPerSqFt: 0.4, cycleDays: 90, investmentPerSqFt: 20, laborPerMonth: 1000 },
  { name: 'Exotic Vegetables', emoji: '🥦', color: '#e65100', bg: '#fff3e0', pricePerKg: 75,  yieldPerSqFt: 0.6, cycleDays: 75, investmentPerSqFt: 18, laborPerMonth: 2500 },
  { name: 'Lemongrass',        emoji: '🌾', color: '#558b2f', bg: '#f1f8e9', pricePerKg: 35,  yieldPerSqFt: 1.2, cycleDays: 90, investmentPerSqFt: 8,  laborPerMonth: 800  },
  { name: 'Cherry Tomato',     emoji: '🍅', color: '#c62828', bg: '#ffebee', pricePerKg: 120, yieldPerSqFt: 0.7, cycleDays: 75, investmentPerSqFt: 22, laborPerMonth: 2000 },
];

export default function CalculatorScreen() {
  const router = useRouter();
  const { t }  = useTranslation();

  const [landSize,     setLandSize]     = useState('');
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);
  const [result,       setResult]       = useState<any>(null);

  const calculate = () => {
    if (!landSize || !selectedCrop) return;
    const sqFt            = parseFloat(landSize);
    const crop            = selectedCrop;
    const setupCost       = Math.round(sqFt * crop.investmentPerSqFt);
    const monthlyCost     = Math.round(crop.laborPerMonth + sqFt * 2);
    const totalInvestment = setupCost + monthlyCost;
    const cyclesPerMonth  = 30 / crop.cycleDays;
    const yieldPerMonth   = sqFt * crop.yieldPerSqFt * cyclesPerMonth;
    const revenuePerMonth = Math.round(yieldPerMonth * crop.pricePerKg);
    const profitPerMonth  = Math.round(revenuePerMonth - monthlyCost);
    const profitPerYear   = Math.round(profitPerMonth * 12);
    const roi             = Math.round((profitPerMonth / totalInvestment) * 100);
    const breakEvenMonths = Math.ceil(setupCost / Math.max(1, profitPerMonth));

    setResult({
      setupCost, monthlyCost, totalInvestment,
      revenuePerMonth, profitPerMonth, profitPerYear,
      roi, breakEvenMonths,
      yieldPerMonth: Math.round(yieldPerMonth * 10) / 10,
    });
  };

  const reset = () => { setLandSize(''); setSelectedCrop(null); setResult(null); };

  // ── Input screen ────────────────────────────────────────────────────────
  if (!result) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>💰 Profit Calculator</Text>
            <Text style={styles.headerSub}>See exactly how much you can earn</Text>
          </View>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

          {/* Land size input */}
          <View style={styles.inputCard}>
            <Text style={styles.inputLabel}>📐 Enter Your Land Size</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="e.g. 500"
                placeholderTextColor="#aaa"
                value={landSize}
                onChangeText={setLandSize}
                keyboardType="numeric"
              />
              <View style={styles.unitBadge}>
                <Text style={styles.unitText}>sq ft</Text>
              </View>
            </View>
          </View>

          {/* Crop selection */}
          <Text style={styles.sectionTitle}>Select Your Crop</Text>
          {CROPS.map((crop, i) => {
            const isSelected = selectedCrop?.name === crop.name;
            return (
              <TouchableOpacity
                key={i}
                style={[
                  styles.cropCard,
                  { borderLeftColor: crop.color },
                  isSelected && { backgroundColor: crop.bg, borderColor: crop.color },
                ]}
                onPress={() => setSelectedCrop(crop)}
                activeOpacity={0.8}>

                <View style={[styles.cropEmojiBox, { backgroundColor: isSelected ? crop.color + '22' : '#f5f5f5' }]}>
                  <Text style={styles.cropEmoji}>{crop.emoji}</Text>
                </View>

                <View style={styles.cropInfo}>
                  <Text style={[styles.cropName, isSelected && { color: crop.color }]}>
                    {crop.name}
                  </Text>
                  <Text style={styles.cropDetails}>
                    ₹{crop.pricePerKg}/kg  •  Cycle: {crop.cycleDays} days
                  </Text>
                </View>

                {isSelected ? (
                  <View style={[styles.checkCircle, { backgroundColor: crop.color }]}>
                    <Text style={styles.checkTick}>✓</Text>
                  </View>
                ) : (
                  <View style={styles.checkCircleEmpty} />
                )}
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity
            style={[styles.calcBtn, (!landSize || !selectedCrop) && styles.calcBtnDisabled]}
            onPress={calculate}
            disabled={!landSize || !selectedCrop}>
            <Text style={styles.calcBtnText}>💰 Calculate My Profit</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Result screen ────────────────────────────────────────────────────────
  const maxBar = Math.max(result.revenuePerMonth, result.monthlyCost, result.profitPerMonth);

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, { backgroundColor: selectedCrop!.color }]}>
        <TouchableOpacity onPress={reset}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Your Results</Text>
          <Text style={styles.headerSub}>{selectedCrop!.name} · {landSize} sq ft</Text>
        </View>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* Big profit number */}
        <View style={[styles.profitBanner, { backgroundColor: selectedCrop!.color }]}>
          <Text style={styles.profitEmoji}>{selectedCrop!.emoji}</Text>
          <Text style={styles.profitAmount}>
            ₹{result.profitPerMonth.toLocaleString('en-IN')}
          </Text>
          <Text style={styles.profitLabel}>estimated monthly profit</Text>
          <Text style={styles.profitYear}>
            ₹{result.profitPerYear.toLocaleString('en-IN')} per year
          </Text>
        </View>

        {/* Key stats */}
        <View style={styles.statsRow}>
          {[
            { emoji: '📈', value: `${result.roi}%`,             label: 'ROI' },
            { emoji: '⏱️', value: `${result.breakEvenMonths}mo`, label: 'Break Even' },
            { emoji: '⚖️', value: `${result.yieldPerMonth} kg`, label: 'Monthly Yield' },
          ].map((s, i) => (
            <View key={i} style={styles.statCard}>
              <Text style={styles.statEmoji}>{s.emoji}</Text>
              <Text style={[styles.statValue, { color: selectedCrop!.color }]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Visual bar chart */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>📊 Monthly Breakdown</Text>
          {[
            { label: 'Revenue',      value: result.revenuePerMonth, color: selectedCrop!.color },
            { label: 'Running Cost', value: result.monthlyCost,     color: '#e53935' },
            { label: 'Net Profit',   value: result.profitPerMonth,  color: '#1a6b3c' },
          ].map((bar, i) => (
            <View key={i} style={styles.barRow}>
              <Text style={styles.barLabel}>{bar.label}</Text>
              <View style={styles.barTrack}>
                <View style={[
                  styles.barFill,
                  {
                    width: `${Math.max(4, (bar.value / maxBar) * 100)}%` as any,
                    backgroundColor: bar.color,
                  }
                ]} />
              </View>
              <Text style={[styles.barValue, { color: bar.color }]}>
                ₹{bar.value.toLocaleString('en-IN')}
              </Text>
            </View>
          ))}
        </View>

        {/* Full breakdown */}
        <View style={styles.breakdownCard}>
          <Text style={styles.breakdownTitle}>Full Breakdown</Text>

          <Text style={styles.breakdownSection}>💸 Investment</Text>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Setup cost</Text>
            <Text style={styles.breakdownValue}>₹{result.setupCost.toLocaleString('en-IN')}</Text>
          </View>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Monthly running cost</Text>
            <Text style={styles.breakdownValue}>₹{result.monthlyCost.toLocaleString('en-IN')}</Text>
          </View>

          <View style={styles.divider} />

          <Text style={styles.breakdownSection}>💰 Revenue</Text>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Monthly yield</Text>
            <Text style={styles.breakdownValue}>{result.yieldPerMonth} kg</Text>
          </View>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Monthly revenue</Text>
            <Text style={styles.breakdownValue}>₹{result.revenuePerMonth.toLocaleString('en-IN')}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.breakdownRow}>
            <Text style={[styles.breakdownLabel, { fontWeight: '800', color: '#1a1a1a', fontSize: 15 }]}>
              Net Monthly Profit
            </Text>
            <Text style={[styles.breakdownValue, { color: '#1a6b3c', fontWeight: '800', fontSize: 16 }]}>
              ₹{result.profitPerMonth.toLocaleString('en-IN')}
            </Text>
          </View>
        </View>

        {/* Action buttons */}
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: selectedCrop!.color }]}
          onPress={() => router.push('/learn')}>
          <Text style={styles.actionBtnText}>📚 Learn to Grow {selectedCrop!.name}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: '#4a148c' }]}
          onPress={() => router.push('/plan')}>
          <Text style={styles.actionBtnText}>📋 Generate Full Farming Plan</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.resetBtn} onPress={reset}>
          <Text style={styles.resetBtnText}>🔄 Calculate Another Crop</Text>
        </TouchableOpacity>

        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: '#f0f4f0' },
  header:          { backgroundColor: '#f57f17', paddingTop: 52, paddingBottom: 16, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backText:        { color: 'rgba(255,255,255,0.85)', fontSize: 15, fontWeight: '600' },
  headerCenter:    { alignItems: 'center' },
  headerTitle:     { fontSize: 18, fontWeight: '800', color: '#fff' },
  headerSub:       { fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  content:         { padding: 16 },

  inputCard:       { backgroundColor: '#fff', borderRadius: 16, padding: 18, marginBottom: 20, elevation: 2 },
  inputLabel:      { fontSize: 14, fontWeight: '700', color: '#1a1a1a', marginBottom: 12 },
  inputRow:        { flexDirection: 'row', alignItems: 'center', gap: 10 },
  input:           { flex: 1, backgroundColor: '#f5f7f5', borderRadius: 12, padding: 14, fontSize: 20, color: '#1a1a1a', fontWeight: '700' },
  unitBadge:       { backgroundColor: '#e8f5e9', paddingHorizontal: 14, paddingVertical: 14, borderRadius: 12 },
  unitText:        { color: '#1a6b3c', fontWeight: '700', fontSize: 14 },

  sectionTitle:    { fontSize: 11, fontWeight: '700', color: '#888', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 },

  cropCard:        { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 12, elevation: 2, borderLeftWidth: 4, borderWidth: 1, borderColor: '#f0f0f0' },
  cropEmojiBox:    { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  cropEmoji:       { fontSize: 24 },
  cropInfo:        { flex: 1 },
  cropName:        { fontSize: 14, fontWeight: '700', color: '#1a1a1a', marginBottom: 3 },
  cropDetails:     { fontSize: 12, color: '#888' },
  checkCircle:     { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  checkTick:       { color: '#fff', fontWeight: '800', fontSize: 13 },
  checkCircleEmpty:{ width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: '#ddd' },

  calcBtn:         { backgroundColor: '#1a6b3c', padding: 18, borderRadius: 16, alignItems: 'center', marginTop: 8, elevation: 3 },
  calcBtnDisabled: { backgroundColor: '#ccc' },
  calcBtnText:     { color: '#fff', fontSize: 16, fontWeight: '800' },

  profitBanner:    { borderRadius: 20, padding: 28, alignItems: 'center', marginBottom: 16 },
  profitEmoji:     { fontSize: 52, marginBottom: 8 },
  profitAmount:    { fontSize: 42, fontWeight: '800', color: '#fff', marginBottom: 4 },
  profitLabel:     { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 6 },
  profitYear:      { fontSize: 15, color: '#fff', fontWeight: '700', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },

  statsRow:        { flexDirection: 'row', gap: 10, marginBottom: 14 },
  statCard:        { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 14, alignItems: 'center', elevation: 2 },
  statEmoji:       { fontSize: 20, marginBottom: 6 },
  statValue:       { fontSize: 16, fontWeight: '800', marginBottom: 2 },
  statLabel:       { fontSize: 10, color: '#888', fontWeight: '500' },

  chartCard:       { backgroundColor: '#fff', borderRadius: 16, padding: 18, marginBottom: 14, elevation: 2 },
  chartTitle:      { fontSize: 14, fontWeight: '800', color: '#1a1a1a', marginBottom: 16 },
  barRow:          { marginBottom: 14 },
  barLabel:        { fontSize: 12, color: '#666', fontWeight: '600', marginBottom: 6 },
  barTrack:        { height: 10, backgroundColor: '#f0f0f0', borderRadius: 5, marginBottom: 4, overflow: 'hidden' },
  barFill:         { height: 10, borderRadius: 5 },
  barValue:        { fontSize: 13, fontWeight: '700' },

  breakdownCard:   { backgroundColor: '#fff', borderRadius: 16, padding: 18, marginBottom: 14, elevation: 2 },
  breakdownTitle:  { fontSize: 15, fontWeight: '800', color: '#1a1a1a', marginBottom: 16 },
  breakdownSection:{ fontSize: 11, fontWeight: '700', color: '#888', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 10 },
  breakdownRow:    { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  breakdownLabel:  { fontSize: 13, color: '#555' },
  breakdownValue:  { fontSize: 13, fontWeight: '600', color: '#1a1a1a' },
  divider:         { height: 1, backgroundColor: '#f0f0f0', marginVertical: 12 },

  actionBtn:       { padding: 16, borderRadius: 14, alignItems: 'center', marginBottom: 10, elevation: 2 },
  actionBtnText:   { color: '#fff', fontSize: 14, fontWeight: '800' },
  resetBtn:        { backgroundColor: '#f5f5f5', padding: 16, borderRadius: 14, alignItems: 'center', marginBottom: 10 },
  resetBtnText:    { fontSize: 14, fontWeight: '600', color: '#888' },
});