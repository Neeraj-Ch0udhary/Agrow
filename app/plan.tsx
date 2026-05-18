import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY!;
type FarmerDetails = { landSize: string; budget: string; location: string; water: string; time: string; crop: string; goal: string; };

async function generateFarmingPlan(details: FarmerDetails): Promise<string> {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_API_KEY}` },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: 'You are Agrow AI, an expert farming planner for Indian farmers. Create detailed, practical farming plans. Always include profit estimates in Indian Rupees.' },
        { role: 'user', content: `Create a complete personalized farming plan: Land: ${details.landSize}, Budget: ${details.budget}, Location: ${details.location}, Water: ${details.water}, Time: ${details.time}, Crop: ${details.crop || 'Not decided'}, Goal: ${details.goal}. Include: 1. RECOMMENDED CROP & WHY 2. INVESTMENT BREAKDOWN 3. MONTH BY MONTH PLAN 4. EXPECTED PROFIT 5. WHERE TO SELL 6. CHALLENGES & SOLUTIONS 7. FIRST 7 DAYS ACTION PLAN` }
      ],
      max_tokens: 800, temperature: 0.7,
    })
  });
  if (!response.ok) throw new Error('API error');
  const data = await response.json();
  return data.choices[0].message.content;
}

export default function PlanScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [step, setStep]       = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState<string | null>(null);
  const [details, setDetails] = useState<FarmerDetails>({ landSize: '', budget: '', location: '', water: '', time: '', crop: '', goal: '' });

  const updateDetail = (key: keyof FarmerDetails, value: string) => setDetails(prev => ({ ...prev, [key]: value }));

  const STEPS = [
    { emoji: '📐', subtitle: 'How much land do you have?', options: ['Less than 500 sq ft', '500–2000 sq ft', '2000–5000 sq ft', 'More than 1 acre'], key: 'landSize' as keyof FarmerDetails },
    { emoji: '💰', subtitle: 'How much can you invest to start?', options: ['Under ₹5,000', '₹5,000–₹20,000', '₹20,000–₹50,000', 'Above ₹50,000'], key: 'budget' as keyof FarmerDetails },
    { emoji: '💧', subtitle: 'What is your water availability?', options: ['Very limited', 'Some water available', 'Good water supply', 'Abundant water'], key: 'water' as keyof FarmerDetails },
    { emoji: '⏰', subtitle: 'How much time can you give daily?', options: ['Less than 1 hour', '1–2 hours', '2–4 hours', 'Full time'], key: 'time' as keyof FarmerDetails },
    { emoji: '🎯', subtitle: 'What is your main farming goal?', options: ['Maximum profit', 'Low investment start', 'Part time farming', 'Full time farming', 'Organic farming'], key: 'goal' as keyof FarmerDetails },
  ];

  const generatePlan = async () => {
    setLoading(true);
    try { const plan = await generateFarmingPlan(details); setResult(plan); setStep(5); }
    catch { console.log('Plan error'); }
    finally { setLoading(false); }
  };

  const reset = () => { setStep(0); setResult(null); setDetails({ landSize: '', budget: '', location: '', water: '', time: '', crop: '', goal: '' }); };

  if (result) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}><Text style={styles.backText}>{t('common.back')}</Text></TouchableOpacity>
          <Text style={styles.headerTitle}>{t('plan.title')}</Text>
          <View style={{ width: 50 }} />
        </View>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.planBanner}>
            <Text style={styles.planBannerEmoji}>🚀</Text>
            <Text style={styles.planBannerTitle}>{t('plan.ready')}</Text>
            <Text style={styles.planBannerSub}>{t('plan.readySub')}</Text>
          </View>
          <View style={styles.resultCard}><Text style={styles.resultText}>{result}</Text></View>
          <TouchableOpacity style={styles.retryButton} onPress={reset}><Text style={styles.retryText}>{t('plan.newPlan')}</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.retryButton, { backgroundColor: '#1a6b3c' }]} onPress={() => router.push('/chat')}>
            <Text style={[styles.retryText, { color: '#fff' }]}>{t('plan.askAI')}</Text>
          </TouchableOpacity>
          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#1a6b3c" />
        <Text style={styles.loadingTitle}>{t('plan.loading')}</Text>
        <Text style={styles.loadingText}>{t('plan.loadingSub')}</Text>
      </SafeAreaView>
    );
  }

  if (step === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}><Text style={styles.backText}>{t('common.back')}</Text></TouchableOpacity>
          <Text style={styles.headerTitle}>{t('plan.title')}</Text>
          <View style={{ width: 50 }} />
        </View>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.introCard}>
            <Text style={styles.introEmoji}>📋</Text>
            <Text style={styles.introTitle}>{t('plan.introTitle')}</Text>
            <Text style={styles.introText}>{t('plan.introText')}</Text>
          </View>
          <View style={styles.locationBox}>
            <Text style={styles.locationLabel}>{t('plan.location')}</Text>
            <TextInput style={styles.locationInput} placeholder={t('plan.locationPlaceholder')} placeholderTextColor="#aaa" value={details.location} onChangeText={(text) => updateDetail('location', text)} />
          </View>
          <View style={styles.locationBox}>
            <Text style={styles.locationLabel}>{t('plan.cropOptional')}</Text>
            <TextInput style={styles.locationInput} placeholder={t('plan.cropPlaceholder')} placeholderTextColor="#aaa" value={details.crop} onChangeText={(text) => updateDetail('crop', text)} />
          </View>
          <TouchableOpacity style={[styles.nextButton, !details.location && styles.nextButtonDisabled]} onPress={() => setStep(1)} disabled={!details.location}>
            <Text style={styles.nextButtonText}>{t('plan.start')}</Text>
          </TouchableOpacity>
          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  const currentStep = STEPS[step - 1];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setStep(step - 1)}><Text style={styles.backText}>{t('common.back')}</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>{t('plan.title')}</Text>
        <Text style={styles.stepCount}>{step}/{STEPS.length}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.progressRow}>
          {STEPS.map((_, i) => <View key={i} style={[styles.progressDot, i < step && { backgroundColor: '#1a6b3c' }]} />)}
        </View>
        <Text style={styles.stepEmoji}>{currentStep.emoji}</Text>
        <Text style={styles.stepTitle}>{currentStep.subtitle}</Text>
        {currentStep.options.map((option, i) => (
          <TouchableOpacity key={i} style={[styles.optionButton, details[currentStep.key] === option && styles.optionButtonActive]} onPress={() => { updateDetail(currentStep.key, option); if (step < STEPS.length) setTimeout(() => setStep(step + 1), 200); }}>
            <Text style={[styles.optionText, details[currentStep.key] === option && styles.optionTextActive]}>{option}</Text>
            {details[currentStep.key] === option && <Text style={styles.checkmark}>✓</Text>}
          </TouchableOpacity>
        ))}
        {step === STEPS.length && details[currentStep.key] && (
          <TouchableOpacity style={styles.generateButton} onPress={generatePlan}>
            <Text style={styles.generateButtonText}>{t('plan.generate')}</Text>
          </TouchableOpacity>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:           { flex: 1, backgroundColor: '#f5f7f5' },
  header:              { backgroundColor: '#1a6b3c', paddingTop: 52, paddingBottom: 14, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backText:            { color: '#a8d5b5', fontSize: 15, fontWeight: '600' },
  headerTitle:         { fontSize: 17, fontWeight: '700', color: '#fff' },
  stepCount:           { color: '#a8d5b5', fontSize: 13 },
  content:             { padding: 16 },
  progressRow:         { flexDirection: 'row', gap: 8, marginBottom: 28 },
  progressDot:         { flex: 1, height: 6, borderRadius: 3, backgroundColor: '#e0e0e0' },
  stepEmoji:           { fontSize: 56, textAlign: 'center', marginBottom: 12 },
  stepTitle:           { fontSize: 22, fontWeight: '700', color: '#1a1a1a', textAlign: 'center', marginBottom: 24, lineHeight: 30 },
  optionButton:        { backgroundColor: '#fff', padding: 18, borderRadius: 12, marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', elevation: 2, borderWidth: 1.5, borderColor: 'transparent' },
  optionButtonActive:  { borderColor: '#1a6b3c', backgroundColor: '#e8f5e9' },
  optionText:          { fontSize: 15, color: '#1a1a1a', fontWeight: '500' },
  optionTextActive:    { color: '#1a6b3c', fontWeight: '700' },
  checkmark:           { fontSize: 18, color: '#1a6b3c' },
  generateButton:      { backgroundColor: '#1a6b3c', padding: 18, borderRadius: 14, alignItems: 'center', marginTop: 8, elevation: 3 },
  generateButtonText:  { color: '#fff', fontSize: 16, fontWeight: '700' },
  introCard:           { backgroundColor: '#fff', borderRadius: 16, padding: 24, alignItems: 'center', marginBottom: 20, elevation: 2 },
  introEmoji:          { fontSize: 56, marginBottom: 12 },
  introTitle:          { fontSize: 20, fontWeight: '700', color: '#1a1a1a', textAlign: 'center', marginBottom: 10 },
  introText:           { fontSize: 14, color: '#666', textAlign: 'center', lineHeight: 22 },
  locationBox:         { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2 },
  locationLabel:       { fontSize: 13, fontWeight: '600', color: '#444', marginBottom: 8 },
  locationInput:       { fontSize: 15, color: '#1a1a1a', borderBottomWidth: 1, borderBottomColor: '#e0e0e0', paddingVertical: 8 },
  nextButton:          { backgroundColor: '#1a6b3c', padding: 18, borderRadius: 14, alignItems: 'center', marginTop: 8, elevation: 3 },
  nextButtonDisabled:  { backgroundColor: '#ccc' },
  nextButtonText:      { color: '#fff', fontSize: 15, fontWeight: '700' },
  planBanner:          { backgroundColor: '#1a6b3c', borderRadius: 16, padding: 24, alignItems: 'center', marginBottom: 16 },
  planBannerEmoji:     { fontSize: 48, marginBottom: 10 },
  planBannerTitle:     { fontSize: 18, fontWeight: '700', color: '#fff', textAlign: 'center', marginBottom: 6 },
  planBannerSub:       { fontSize: 13, color: '#a8d5b5', textAlign: 'center' },
  resultCard:          { backgroundColor: '#fff', borderRadius: 14, padding: 20, marginBottom: 16, elevation: 2 },
  resultText:          { fontSize: 14, color: '#333', lineHeight: 26 },
  retryButton:         { backgroundColor: '#f5f5f5', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 12, elevation: 1 },
  retryText:           { fontSize: 15, fontWeight: '600', color: '#1a1a1a' },
  loadingTitle:        { fontSize: 18, fontWeight: '600', color: '#1a1a1a', marginTop: 20, marginBottom: 8, textAlign: 'center' },
  loadingText:         { fontSize: 14, color: '#888', textAlign: 'center', paddingHorizontal: 32, lineHeight: 22 },
});