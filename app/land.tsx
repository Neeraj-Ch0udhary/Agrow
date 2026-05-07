import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Result = { crop: string; emoji: string; profit: string; reason: string; color: string; };

const RESULTS: Record<string, Result> = {
  small_low:   { crop: 'Oyster Mushrooms',  emoji: '🍄', profit: '₹8,000–15,000/month',  reason: 'Perfect for small indoor spaces with low investment. Ready in 45 days!', color: '#7b5ea7' },
  small_high:  { crop: 'Microgreens',       emoji: '🌿', profit: '₹10,000–20,000/month', reason: 'Tiny space, huge profit. Ready in just 7–14 days and sells at premium prices.', color: '#4caf50' },
  medium_low:  { crop: 'Stevia',            emoji: '🌱', profit: '₹15,000–25,000/month', reason: 'Low water, low cost, and massive demand from sugar-free product companies.', color: '#26a69a' },
  medium_high: { crop: 'Exotic Vegetables', emoji: '🥦', profit: '₹20,000–40,000/month', reason: 'Broccoli, zucchini, colored capsicum — restaurants pay premium for local supply.', color: '#f5a623' },
  large_low:   { crop: 'Lemongrass',        emoji: '🌾', profit: '₹25,000–50,000/month', reason: 'Low maintenance, drought resistant, huge demand from cosmetic & pharma industry.', color: '#66bb6a' },
  large_high:  { crop: 'Hydroponics',       emoji: '💧', profit: '₹40,000–80,000/month', reason: 'Grow 4x more without soil. High investment but the highest returns in modern farming.', color: '#1a6b3c' },
};

function getResult(answers: number[]): Result {
  const land = answers[0]; const budget = answers[1];
  const isSmall = land <= 1; const isMedium = land === 2; const isLarge = land >= 3;
  const isLowBudget = budget <= 1; const isHighBudget = budget >= 2;
  if (isSmall && isLowBudget) return RESULTS.small_low;
  if (isSmall && isHighBudget) return RESULTS.small_high;
  if (isMedium && isLowBudget) return RESULTS.medium_low;
  if (isMedium && isHighBudget) return RESULTS.medium_high;
  if (isLarge && isLowBudget) return RESULTS.large_low;
  return RESULTS.large_high;
}

export default function LandScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [step, setStep]       = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult]   = useState<Result | null>(null);

  const questions = t('land.questions', { returnObjects: true }) as any[];

  const handleAnswer = (index: number) => {
    const newAnswers = [...answers, index];
    if (step < questions.length - 1) { setAnswers(newAnswers); setStep(step + 1); }
    else { setResult(getResult(newAnswers)); }
  };

  const reset = () => { setStep(0); setAnswers([]); setResult(null); };

  if (result) {
    return (
      <SafeAreaView style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>{t('common.back')}</Text>
        </TouchableOpacity>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={[styles.resultCard, { borderColor: result.color }]}>
            <Text style={styles.resultEmoji}>{result.emoji}</Text>
            <Text style={styles.resultLabel}>{t('land.bestCrop')}</Text>
            <Text style={[styles.resultCrop, { color: result.color }]}>{result.crop}</Text>
            <View style={[styles.profitBadge, { backgroundColor: result.color }]}>
              <Text style={styles.profitText}>💰 {result.profit}</Text>
            </View>
            <Text style={styles.resultReason}>{result.reason}</Text>
          </View>
          <TouchableOpacity style={styles.retryButton} onPress={reset}>
            <Text style={styles.retryText}>{t('common.retry')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.retryButton, { backgroundColor: '#1a6b3c' }]} onPress={() => router.push('/learn')}>
            <Text style={[styles.retryText, { color: '#fff' }]}>{t('land.learnHow')} {result.crop}</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const current = questions[step];

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>{t('common.back')}</Text>
      </TouchableOpacity>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.progressRow}>
          {questions.map((_: any, i: number) => (
            <View key={i} style={[styles.progressDot, i <= step && { backgroundColor: '#1a6b3c' }]} />
          ))}
        </View>
        <Text style={styles.stepLabel}>{t('land.questionLabel')} {step + 1} {t('land.of')} {questions.length}</Text>
        <Text style={styles.questionEmoji}>{current.emoji}</Text>
        <Text style={styles.questionText}>{current.question}</Text>
        {current.options.map((option: string, index: number) => (
          <TouchableOpacity key={index} style={styles.optionButton} onPress={() => handleAnswer(index)}>
            <Text style={styles.optionText}>{option}</Text>
            <Text style={styles.optionArrow}>›</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: '#f5f7f5' },
  backButton:    { padding: 16, paddingTop: 52 },
  backText:      { fontSize: 16, color: '#1a6b3c', fontWeight: '600' },
  content:       { alignItems: 'center', padding: 24 },
  progressRow:   { flexDirection: 'row', gap: 8, marginBottom: 24 },
  progressDot:   { width: 36, height: 6, borderRadius: 3, backgroundColor: '#e0e0e0' },
  stepLabel:     { fontSize: 13, color: '#888', marginBottom: 12 },
  questionEmoji: { fontSize: 64, marginBottom: 16 },
  questionText:  { fontSize: 22, fontWeight: '700', color: '#1a1a1a', textAlign: 'center', marginBottom: 28, lineHeight: 30 },
  optionButton:  { backgroundColor: '#ffffff', width: '100%', padding: 18, borderRadius: 12, marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', elevation: 2 },
  optionText:    { fontSize: 15, color: '#1a1a1a', fontWeight: '500' },
  optionArrow:   { fontSize: 20, color: '#cccccc' },
  resultCard:    { backgroundColor: '#ffffff', width: '100%', borderRadius: 16, padding: 24, alignItems: 'center', borderWidth: 2, marginBottom: 20, elevation: 3 },
  resultEmoji:   { fontSize: 64, marginBottom: 12 },
  resultLabel:   { fontSize: 13, color: '#888', marginBottom: 6 },
  resultCrop:    { fontSize: 28, fontWeight: 'bold', marginBottom: 16 },
  profitBadge:   { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, marginBottom: 16 },
  profitText:    { color: '#ffffff', fontWeight: '600', fontSize: 15 },
  resultReason:  { fontSize: 14, color: '#666', textAlign: 'center', lineHeight: 22 },
  retryButton:   { backgroundColor: '#f5f5f5', padding: 16, borderRadius: 12, width: '100%', alignItems: 'center', marginBottom: 12 },
  retryText:     { fontSize: 15, fontWeight: '600', color: '#1a1a1a' },
});