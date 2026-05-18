import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator, Alert, ScrollView,
    StyleSheet, Text, TouchableOpacity, View
} from 'react-native';
import { supabase } from '../lib/supabase';
import { CROPS } from './learn';

export default function CropDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const crop = CROPS.find(c => c.id === id) ?? CROPS[0];

  const [saving, setSaving] = useState(false);

  const handleStartGrowing = async () => {
    Alert.alert(
      `🌱 Start Growing ${crop.name}?`,
      `This will set ${crop.name} as your active crop and start your ${crop.time} farming cycle. Your current crop progress will be reset.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start Growing!',
          onPress: async () => {
            setSaving(true);
            try {
              const { data: { user }, error: authError } = await supabase.auth.getUser();
              if (authError || !user) {
                Alert.alert('Login Required', 'Please login to start tracking your crop.');
                router.push('/login');
                return;
              }

              // Parse cycle days from time string e.g. "45 days" or "7–14 days"
              const timeStr = crop.time;
              const numbers = timeStr.match(/\d+/g);
              let cycleDays = 30; // default
              if (numbers && numbers.length === 1) {
                cycleDays = parseInt(numbers[0]);
              } else if (numbers && numbers.length >= 2) {
                // Take average of range e.g. "7–14 days" → 10
                cycleDays = Math.round((parseInt(numbers[0]) + parseInt(numbers[1])) / 2);
              }

              // Parse profit max from profit string e.g. "₹8,000–15,000/month"
              const profitNumbers = crop.profit.match(/[\d,]+/g);
              let profitMax = 0;
              if (profitNumbers && profitNumbers.length >= 2) {
                profitMax = parseInt(profitNumbers[profitNumbers.length - 1].replace(/,/g, ''));
              } else if (profitNumbers && profitNumbers.length === 1) {
                profitMax = parseInt(profitNumbers[0].replace(/,/g, ''));
              }

              // Parse investment
              const investNumbers = crop.investment.match(/[\d,]+/g);
              const investAmount = investNumbers
                ? parseInt(investNumbers[0].replace(/,/g, ''))
                : 0;

              const { error } = await supabase
                .from('profiles')
                .update({
                  saved_crop:       crop.name,
                  crop_start_date:  new Date().toISOString(),
                  crop_cycle_days:  cycleDays,
                  crop_investment:  investAmount,
                  crop_profit_max:  profitMax,
                })
                .eq('id', user.id);

              if (error) throw error;

              Alert.alert(
                '🎉 Crop Started!',
                `You are now growing ${crop.name}. Check your home screen for daily progress and go to the checklist for today's tasks!`,
                [
                  {
                    text: 'View Checklist',
                    onPress: () => router.push('/checklist'),
                  },
                  {
                    text: 'Go Home',
                    onPress: () => router.push('/(tabs)'),
                  },
                ]
              );
            } catch (e: any) {
              Alert.alert('Error', e.message);
            } finally {
              setSaving(false);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
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
          { label: '⏱ Ready in',   value: crop.time       },
          { label: '💰 Investment', value: crop.investment  },
          { label: '📐 Space',      value: crop.space       },
          { label: '📊 Level',      value: crop.difficulty  },
        ].map((s, i) => (
          <View key={i} style={styles.statCard}>
            <Text style={styles.statLabel}>{s.label}</Text>
            <Text style={[styles.statValue, { color: crop.color }]}>{s.value}</Text>
          </View>
        ))}
      </View>

      {/* ── START GROWING BUTTON ── */}
      <View style={styles.section}>
        <TouchableOpacity
          style={[styles.startBtn, { backgroundColor: crop.color }, saving && styles.startBtnDisabled]}
          onPress={handleStartGrowing}
          disabled={saving}
          activeOpacity={0.85}>
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.startBtnEmoji}>{crop.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.startBtnTitle}>Start Growing {crop.name}</Text>
                <Text style={styles.startBtnSub}>
                  Sets this as your active crop · Starts {crop.time} cycle · Unlocks daily checklist
                </Text>
              </View>
              <Text style={styles.startBtnArrow}>›</Text>
            </>
          )}
        </TouchableOpacity>
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

      {/* Bottom CTA — repeat start button */}
      <TouchableOpacity
        style={[styles.ctaBtn, { backgroundColor: crop.color }, saving && styles.startBtnDisabled]}
        onPress={handleStartGrowing}
        disabled={saving}>
        {saving
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.ctaBtnText}>🌱 Start Growing {crop.name} Now →</Text>
        }
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: '#f0f4f0' },
  header:           { paddingTop: 52, paddingBottom: 32, paddingHorizontal: 20 },
  backBtn:          { color: 'rgba(255,255,255,0.8)', fontSize: 15, fontWeight: '600', marginBottom: 20 },
  headerContent:    { alignItems: 'center' },
  emojiCircle:      { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  headerEmoji:      { fontSize: 52 },
  headerName:       { fontSize: 26, fontWeight: '800', color: '#fff', marginBottom: 6, textAlign: 'center' },
  headerTagline:    { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 10, textAlign: 'center' },
  headerProfit:     { fontSize: 18, fontWeight: '800', color: '#fff', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
  statsRow:         { flexDirection: 'row', marginHorizontal: 16, marginTop: -20, gap: 8 },
  statCard:         { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 10, alignItems: 'center', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6 },
  statLabel:        { fontSize: 9, color: '#aaa', marginBottom: 4, textAlign: 'center' },
  statValue:        { fontSize: 11, fontWeight: '800', textAlign: 'center' },
  section:          { marginHorizontal: 16, marginTop: 20 },
  sectionTitle:     { fontSize: 15, fontWeight: '800', color: '#1a1a1a', marginBottom: 12 },
  description:      { fontSize: 14, color: '#444', lineHeight: 22 },

  startBtn:         { borderRadius: 18, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 14, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8 },
  startBtnDisabled: { opacity: 0.7 },
  startBtnEmoji:    { fontSize: 32 },
  startBtnTitle:    { fontSize: 16, fontWeight: '800', color: '#fff', marginBottom: 3 },
  startBtnSub:      { fontSize: 11, color: 'rgba(255,255,255,0.8)', lineHeight: 16 },
  startBtnArrow:    { fontSize: 26, color: 'rgba(255,255,255,0.7)', fontWeight: '300' },

  reqGrid:          { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  reqCard:          { width: '47%', backgroundColor: '#fff', borderRadius: 14, padding: 14, borderWidth: 1, elevation: 1 },
  reqIcon:          { fontSize: 22, marginBottom: 6 },
  reqLabel:         { fontSize: 10, color: '#aaa', marginBottom: 3 },
  reqValue:         { fontSize: 13, fontWeight: '700' },
  stepCard:         { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10, elevation: 1 },
  stepNumBox:       { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 12, flexShrink: 0 },
  stepNum:          { color: '#fff', fontWeight: '800', fontSize: 14 },
  stepContent:      { flex: 1 },
  stepTitle:        { fontSize: 14, fontWeight: '800', marginBottom: 4 },
  stepDesc:         { fontSize: 13, color: '#555', lineHeight: 20 },
  profitCard:       { borderRadius: 16, padding: 16 },
  profitRow:        { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 },
  profitRowBorder:  { borderBottomWidth: 0.5, borderBottomColor: 'rgba(0,0,0,0.08)' },
  profitRowLast:    { marginTop: 4 },
  profitLabel:      { fontSize: 13, color: '#555' },
  profitLabelBold:  { fontWeight: '800', color: '#1a1a1a', fontSize: 14 },
  profitValue:      { fontSize: 13, fontWeight: '600' },
  profitValueBig:   { fontSize: 18, fontWeight: '800' },
  tipRow:           { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  tipDot:           { width: 8, height: 8, borderRadius: 4, marginTop: 6, marginRight: 10, flexShrink: 0 },
  tipText:          { flex: 1, fontSize: 13, color: '#444', lineHeight: 20 },
  buyersRow:        { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  buyerChip:        { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  buyerText:        { fontSize: 12, fontWeight: '600' },
  ctaBtn:           { marginHorizontal: 16, marginTop: 24, padding: 18, borderRadius: 16, alignItems: 'center', elevation: 3 },
  ctaBtnText:       { color: '#fff', fontSize: 15, fontWeight: '800' },
});