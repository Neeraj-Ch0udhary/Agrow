import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    SafeAreaView, ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

type Crop = {
  name: string;
  emoji: string;
  color: string;
  pricePerKg: number;
  yieldPerSqFt: number;
  cycleDays: number;
  investmentPerSqFt: number;
  laborPerMonth: number;
};

const CROPS: Crop[] = [
  { name: 'Oyster Mushroom', emoji: '🍄', color: '#7b5ea7', pricePerKg: 140, yieldPerSqFt: 0.8, cycleDays: 45, investmentPerSqFt: 15, laborPerMonth: 2000 },
  { name: 'Microgreens', emoji: '🌿', color: '#4caf50', pricePerKg: 280, yieldPerSqFt: 0.3, cycleDays: 10, investmentPerSqFt: 12, laborPerMonth: 1500 },
  { name: 'Stevia', emoji: '🌱', color: '#26a69a', pricePerKg: 180, yieldPerSqFt: 0.4, cycleDays: 90, investmentPerSqFt: 20, laborPerMonth: 1000 },
  { name: 'Exotic Vegetables', emoji: '🥦', color: '#f5a623', pricePerKg: 75, yieldPerSqFt: 0.6, cycleDays: 75, investmentPerSqFt: 18, laborPerMonth: 2500 },
  { name: 'Lemongrass', emoji: '🌾', color: '#66bb6a', pricePerKg: 35, yieldPerSqFt: 1.2, cycleDays: 90, investmentPerSqFt: 8, laborPerMonth: 800 },
  { name: 'Cherry Tomato', emoji: '🍅', color: '#e53935', pricePerKg: 120, yieldPerSqFt: 0.7, cycleDays: 75, investmentPerSqFt: 22, laborPerMonth: 2000 },
];

export default function CalculatorScreen() {
  const router = useRouter();
  const [landSize, setLandSize]     = useState('');
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);
  const [result, setResult]         = useState<any>(null);

  const calculate = () => {
    if (!landSize || !selectedCrop) return;

    const sqFt = parseFloat(landSize);
    const crop = selectedCrop;

    // Investment
    const setupCost     = Math.round(sqFt * crop.investmentPerSqFt);
    const monthlyCost   = Math.round(crop.laborPerMonth + (sqFt * 2));
    const totalInvestment = setupCost + monthlyCost;

    // Revenue
    const cyclesPerMonth  = 30 / crop.cycleDays;
    const yieldPerMonth   = sqFt * crop.yieldPerSqFt * cyclesPerMonth;
    const revenuePerMonth = Math.round(yieldPerMonth * crop.pricePerKg);

    // Profit
    const profitPerMonth  = Math.round(revenuePerMonth - monthlyCost);
    const profitPerYear   = Math.round(profitPerMonth * 12);
    const roi             = Math.round((profitPerMonth / totalInvestment) * 100);
    const breakEvenMonths = Math.ceil(setupCost / profitPerMonth);

    setResult({
      setupCost,
      monthlyCost,
      totalInvestment,
      revenuePerMonth,
      profitPerMonth,
      profitPerYear,
      roi,
      breakEvenMonths,
      yieldPerMonth: Math.round(yieldPerMonth * 10) / 10,
    });
  };

  const reset = () => {
    setLandSize('');
    setSelectedCrop(null);
    setResult(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>💰 Profit Calculator</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {!result ? (
          <>
            {/* Land Size Input */}
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
              {landSize ? (
                <Text style={styles.inputHint}>
                  {parseFloat(landSize) < 500 ? '🏠 Small indoor/terrace farm' :
                   parseFloat(landSize) < 2000 ? '🌿 Medium farm' :
                   parseFloat(landSize) < 5000 ? '🌾 Large farm' : '🚜 Very large farm'}
                </Text>
              ) : null}
            </View>

            {/* Crop Selection */}
            <Text style={styles.sectionTitle}>Select Your Crop</Text>
            {CROPS.map((crop, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.cropCard, selectedCrop?.name === crop.name && { borderColor: crop.color, borderWidth: 2 }]}
                onPress={() => setSelectedCrop(crop)}>
                <Text style={styles.cropEmoji}>{crop.emoji}</Text>
                <View style={styles.cropInfo}>
                  <Text style={styles.cropName}>{crop.name}</Text>
                  <Text style={styles.cropDetails}>₹{crop.pricePerKg}/kg • Cycle: {crop.cycleDays} days</Text>
                </View>
                {selectedCrop?.name === crop.name && (
                  <View style={[styles.selectedBadge, { backgroundColor: crop.color }]}>
                    <Text style={styles.selectedText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}

            {/* Calculate Button */}
            <TouchableOpacity
              style={[styles.calcButton, (!landSize || !selectedCrop) && styles.calcButtonDisabled]}
              onPress={calculate}
              disabled={!landSize || !selectedCrop}>
              <Text style={styles.calcButtonText}>💰 Calculate My Profit</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            {/* Result Header */}
            <View style={[styles.resultHeader, { backgroundColor: selectedCrop?.color }]}>
              <Text style={styles.resultEmoji}>{selectedCrop?.emoji}</Text>
              <Text style={styles.resultCropName}>{selectedCrop?.name}</Text>
              <Text style={styles.resultLand}>on {landSize} sq ft land</Text>
              <Text style={styles.resultProfit}>₹{result.profitPerMonth.toLocaleString()}/month</Text>
              <Text style={styles.resultProfitLabel}>Expected Monthly Profit</Text>
            </View>

            {/* Key Numbers */}
            <View style={styles.numbersRow}>
              <View style={styles.numberCard}>
                <Text style={styles.numberEmoji}>📅</Text>
                <Text style={styles.numberValue}>₹{result.profitPerYear.toLocaleString()}</Text>
                <Text style={styles.numberLabel}>Yearly Profit</Text>
              </View>
              <View style={styles.numberCard}>
                <Text style={styles.numberEmoji}>📈</Text>
                <Text style={styles.numberValue}>{result.roi}%</Text>
                <Text style={styles.numberLabel}>Monthly ROI</Text>
              </View>
              <View style={styles.numberCard}>
                <Text style={styles.numberEmoji}>⏱️</Text>
                <Text style={styles.numberValue}>{result.breakEvenMonths}mo</Text>
                <Text style={styles.numberLabel}>Break Even</Text>
              </View>
            </View>

            {/* Breakdown */}
            <View style={styles.breakdownCard}>
              <Text style={styles.breakdownTitle}>📊 Full Breakdown</Text>

              <View style={styles.breakdownSection}>
                <Text style={styles.breakdownSectionTitle}>💸 Investment</Text>
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>Setup Cost (one time)</Text>
                  <Text style={styles.breakdownValue}>₹{result.setupCost.toLocaleString()}</Text>
                </View>
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>Monthly Running Cost</Text>
                  <Text style={styles.breakdownValue}>₹{result.monthlyCost.toLocaleString()}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.breakdownSection}>
                <Text style={styles.breakdownSectionTitle}>💰 Revenue</Text>
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>Monthly Yield</Text>
                  <Text style={styles.breakdownValue}>{result.yieldPerMonth} kg</Text>
                </View>
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>Monthly Revenue</Text>
                  <Text style={styles.breakdownValue}>₹{result.revenuePerMonth.toLocaleString()}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.breakdownRow}>
                <Text style={[styles.breakdownLabel, { fontWeight: '700', color: '#1a1a1a' }]}>Net Monthly Profit</Text>
                <Text style={[styles.breakdownValue, { color: '#1a6b3c', fontWeight: '700', fontSize: 16 }]}>
                  ₹{result.profitPerMonth.toLocaleString()}
                </Text>
              </View>
            </View>

            {/* Comparison */}
            <View style={styles.compareCard}>
              <Text style={styles.compareTitle}>📊 vs Traditional Farming</Text>
              <View style={styles.compareRow}>
                <View style={styles.compareItem}>
                  <Text style={styles.compareLabel}>Traditional Wheat</Text>
                  <Text style={styles.compareValue}>₹{Math.round(parseFloat(landSize) * 0.8).toLocaleString()}/month</Text>
                </View>
                <View style={styles.compareArrow}>
                  <Text style={styles.compareArrowText}>VS</Text>
                </View>
                <View style={styles.compareItem}>
                  <Text style={styles.compareLabel}>{selectedCrop?.name}</Text>
                  <Text style={[styles.compareValue, { color: '#1a6b3c' }]}>₹{result.profitPerMonth.toLocaleString()}/month</Text>
                </View>
              </View>
              <Text style={styles.compareConclusion}>
                🚀 {selectedCrop?.name} earns {Math.round(result.profitPerMonth / (parseFloat(landSize) * 0.8))}x more than traditional wheat farming!
              </Text>
            </View>

            {/* Action Buttons */}
            <TouchableOpacity
              style={styles.learnButton}
              onPress={() => router.push('/learn')}>
              <Text style={styles.learnButtonText}>📚 Learn How to Grow {selectedCrop?.name}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.learnButton, { backgroundColor: '#7b5ea7' }]}
              onPress={() => router.push('/plan')}>
              <Text style={styles.learnButtonText}>📋 Get My Full Farming Plan</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.resetButton} onPress={reset}>
              <Text style={styles.resetButtonText}>🔄 Calculate Another Crop</Text>
            </TouchableOpacity>

            <View style={{ height: 40 }} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:            { flex: 1, backgroundColor: '#f5f7f5' },
  header:               { backgroundColor: '#1a6b3c', paddingTop: 52, paddingBottom: 14, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backText:             { color: '#a8d5b5', fontSize: 15, fontWeight: '600' },
  headerTitle:          { fontSize: 17, fontWeight: '700', color: '#fff' },
  content:              { padding: 16 },
  inputCard:            { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 20, elevation: 2 },
  inputLabel:           { fontSize: 14, fontWeight: '600', color: '#444', marginBottom: 12 },
  inputRow:             { flexDirection: 'row', alignItems: 'center', gap: 10 },
  input:                { flex: 1, backgroundColor: '#f5f7f5', borderRadius: 10, padding: 14, fontSize: 18, color: '#1a1a1a', fontWeight: '600' },
  unitBadge:            { backgroundColor: '#e8f5e9', paddingHorizontal: 14, paddingVertical: 14, borderRadius: 10 },
  unitText:             { color: '#1a6b3c', fontWeight: '700', fontSize: 14 },
  inputHint:            { fontSize: 12, color: '#888', marginTop: 8 },
  sectionTitle:         { fontSize: 14, fontWeight: '600', color: '#888', marginBottom: 10 },
  cropCard:             { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', elevation: 2, borderWidth: 1.5, borderColor: 'transparent' },
  cropEmoji:            { fontSize: 28, marginRight: 12 },
  cropInfo:             { flex: 1 },
  cropName:             { fontSize: 15, fontWeight: '600', color: '#1a1a1a', marginBottom: 3 },
  cropDetails:          { fontSize: 12, color: '#888' },
  selectedBadge:        { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  selectedText:         { color: '#fff', fontWeight: '700', fontSize: 14 },
  calcButton:           { backgroundColor: '#1a6b3c', padding: 18, borderRadius: 14, alignItems: 'center', marginTop: 8, elevation: 3 },
  calcButtonDisabled:   { backgroundColor: '#ccc' },
  calcButtonText:       { color: '#fff', fontSize: 16, fontWeight: '700' },
  resultHeader:         { borderRadius: 16, padding: 24, alignItems: 'center', marginBottom: 16 },
  resultEmoji:          { fontSize: 48, marginBottom: 8 },
  resultCropName:       { fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 4 },
  resultLand:           { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 16 },
  resultProfit:         { fontSize: 36, fontWeight: '800', color: '#fff', marginBottom: 4 },
  resultProfitLabel:    { fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  numbersRow:           { flexDirection: 'row', gap: 10, marginBottom: 16 },
  numberCard:           { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 14, alignItems: 'center', elevation: 2 },
  numberEmoji:          { fontSize: 20, marginBottom: 6 },
  numberValue:          { fontSize: 16, fontWeight: '700', color: '#1a1a1a', marginBottom: 2 },
  numberLabel:          { fontSize: 10, color: '#888', textAlign: 'center' },
  breakdownCard:        { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 16, elevation: 2 },
  breakdownTitle:       { fontSize: 15, fontWeight: '700', color: '#1a1a1a', marginBottom: 16 },
  breakdownSection:     { marginBottom: 8 },
  breakdownSectionTitle: { fontSize: 12, fontWeight: '600', color: '#888', marginBottom: 8 },
  breakdownRow:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  breakdownLabel:       { fontSize: 14, color: '#555' },
  breakdownValue:       { fontSize: 14, fontWeight: '600', color: '#1a1a1a' },
  divider:              { height: 0.5, backgroundColor: '#e0e0e0', marginVertical: 12 },
  compareCard:          { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 16, elevation: 2 },
  compareTitle:         { fontSize: 15, fontWeight: '700', color: '#1a1a1a', marginBottom: 14 },
  compareRow:           { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  compareItem:          { flex: 1, alignItems: 'center' },
  compareLabel:         { fontSize: 12, color: '#888', marginBottom: 4, textAlign: 'center' },
  compareValue:         { fontSize: 14, fontWeight: '700', color: '#1a1a1a', textAlign: 'center' },
  compareArrow:         { paddingHorizontal: 10 },
  compareArrowText:     { fontSize: 12, fontWeight: '700', color: '#888' },
  compareConclusion:    { fontSize: 13, color: '#1a6b3c', fontWeight: '600', textAlign: 'center', lineHeight: 20 },
  learnButton:          { backgroundColor: '#1a6b3c', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 12, elevation: 2 },
  learnButtonText:      { color: '#fff', fontSize: 14, fontWeight: '700' },
  resetButton:          { backgroundColor: '#f5f5f5', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 12 },
  resetButtonText:      { fontSize: 14, fontWeight: '600', color: '#1a1a1a' },
});