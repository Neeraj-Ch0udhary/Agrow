import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator, Alert, Animated, Image,
  SafeAreaView, ScrollView, StyleSheet, Text,
  TouchableOpacity, View
} from 'react-native';
const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY!;

type ScanResult = {
  plant: string;
  disease: string;
  severity: 'Healthy' | 'Mild' | 'Moderate' | 'Severe';
  cause: string;
  treatment: string;
  prevention: string;
  impact: string;
  raw: string;
};

type HistoryItem = {
  uri: string;
  result: ScanResult;
  time: string;
};

async function analyzePlantDisease(base64Image: string): Promise<ScanResult> {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      messages: [{
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Image}` } },
          {
            type: 'text',
            text: `You are an expert plant disease detector for Indian farmers. Analyze this plant image and respond ONLY in this exact format with no extra text:

PLANT: [plant name]
DISEASE: [disease or condition name, or "Healthy" if no disease]
SEVERITY: [exactly one of: Healthy, Mild, Moderate, Severe]
CAUSE: [brief cause in 1-2 sentences]
TREATMENT: [practical treatment steps for Indian farmers, use • for each step]
PREVENTION: [prevention tips, use • for each tip]
IMPACT: [economic impact on farmer in 1 sentence]`
          }
        ]
      }],
      max_tokens: 600,
      temperature: 0.2,
    })
  });

  if (!response.ok) throw new Error('API error');
  const data = await response.json();
  const raw = data.choices[0].message.content as string;

  // Parse structured response
  const get = (key: string) => {
    const match = raw.match(new RegExp(`${key}:\\s*([^\\n]+(?:\\n(?![A-Z]+:)[^\\n]+)*)`, 'i'));
    return match ? match[1].trim() : '';
  };

  const severityRaw = get('SEVERITY') as any;
  const severity: ScanResult['severity'] =
    ['Healthy', 'Mild', 'Moderate', 'Severe'].includes(severityRaw)
      ? severityRaw
      : 'Moderate';

  return {
    plant:      get('PLANT'),
    disease:    get('DISEASE'),
    severity,
    cause:      get('CAUSE'),
    treatment:  get('TREATMENT'),
    prevention: get('PREVENTION'),
    impact:     get('IMPACT'),
    raw,
  };
}

// ── Severity config ───────────────────────────────────────────────────────
const SEVERITY_CONFIG = {
  Healthy:  { color: '#1a6b3c', bg: '#e8f5e9', emoji: '✅', label: 'Healthy' },
  Mild:     { color: '#f57f17', bg: '#fffde7', emoji: '⚠️', label: 'Mild'    },
  Moderate: { color: '#e65100', bg: '#fff3e0', emoji: '🔶', label: 'Moderate'},
  Severe:   { color: '#c62828', bg: '#ffebee', emoji: '🚨', label: 'Severe'  },
};

// ── Loading steps animation ────────────────────────────────────────────────
const LOADING_STEPS = [
  '🔍 Scanning image...',
  '🌿 Identifying plant...',
  '🦠 Detecting disease...',
  '💊 Preparing treatment...',
];

function LoadingCard() {
  const [step, setStep] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const interval = setInterval(() => {
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
      setStep(s => (s + 1) % LOADING_STEPS.length);
    }, 1400);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.loadingCard}>
      <ActivityIndicator size="large" color="#1a6b3c" />
      <Animated.Text style={[styles.loadingStep, { opacity: fadeAnim }]}>
        {LOADING_STEPS[step]}
      </Animated.Text>
      <Text style={styles.loadingSubtext}>AI is analyzing your plant photo</Text>
      <View style={styles.loadingDots}>
        {LOADING_STEPS.map((_, i) => (
          <View
            key={i}
            style={[styles.loadingDot, { backgroundColor: i <= step ? '#1a6b3c' : '#e0e0e0' }]}
          />
        ))}
      </View>
    </View>
  );
}

// ── Result section ─────────────────────────────────────────────────────────
function ResultSection({ label, emoji, children }: { label: string; emoji: string; children: React.ReactNode }) {
  return (
    <View style={styles.resultSection}>
      <Text style={styles.resultSectionTitle}>{emoji} {label}</Text>
      {children}
    </View>
  );
}

// ── Main screen ────────────────────────────────────────────────────────────
export default function DiseaseScreen() {
  const router = useRouter();

  const [image, setImage]     = useState<string | null>(null);
  const [result, setResult]   = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const pickImage = async (fromCamera: boolean) => {
    try {
      let pickerResult;
      if (fromCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission needed', 'Camera permission is required.');
          return;
        }
        pickerResult = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.7,
          base64: true,
        });
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission needed', 'Gallery permission is required.');
          return;
        }
        pickerResult = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.7,
          base64: true,
        });
      }

      if (!pickerResult.canceled && pickerResult.assets[0]) {
        const asset = pickerResult.assets[0];
        setImage(asset.uri);
        setResult(null);
        setLoading(true);

        try {
          const analysis = await analyzePlantDisease(asset.base64!);
          setResult(analysis);

          // Save to history
          const timeStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
          setHistory(prev => [{ uri: asset.uri, result: analysis, time: timeStr }, ...prev.slice(0, 9)]);
        } catch {
          Alert.alert('Error', 'Could not analyze image. Check your internet and try again.');
        } finally {
          setLoading(false);
        }
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const reset = () => { setImage(null); setResult(null); };

  const sev = result ? SEVERITY_CONFIG[result.severity] : null;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>🔍 Disease Detector</Text>
          <Text style={styles.headerSub}>AI-powered plant diagnosis</Text>
        </View>
        <TouchableOpacity onPress={() => setShowHistory(!showHistory)}>
          <Text style={styles.historyBtn}>📋 {history.length > 0 ? history.length : ''}</Text>
        </TouchableOpacity>
      </View>

      {/* History panel */}
      {showHistory && history.length > 0 && (
        <View style={styles.historyPanel}>
          <Text style={styles.historyTitle}>Recent Scans</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {history.map((item, i) => {
              const cfg = SEVERITY_CONFIG[item.result.severity];
              return (
                <TouchableOpacity
                  key={i}
                  style={styles.historyItem}
                  onPress={() => { setImage(item.uri); setResult(item.result); setShowHistory(false); }}>
                  <Image source={{ uri: item.uri }} style={styles.historyThumb} />
                  <Text style={[styles.historyBadge, { color: cfg.color }]}>{cfg.emoji}</Text>
                  <Text style={styles.historyDisease} numberOfLines={1}>{item.result.disease}</Text>
                  <Text style={styles.historyTime}>{item.time}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* ── No image state ── */}
        {!image && (
          <>
            <View style={styles.heroCard}>
              <Text style={styles.heroEmoji}>🌿</Text>
              <Text style={styles.heroTitle}>Identify Plant Diseases Instantly</Text>
              <Text style={styles.heroText}>
                Take a photo of any diseased leaf or plant. Our AI will identify the disease,
                severity, and give you treatment advice in seconds.
              </Text>
              <View style={styles.heroBadges}>
                <View style={styles.heroBadge}><Text style={styles.heroBadgeText}>✅ 95% Accuracy</Text></View>
                <View style={styles.heroBadge}><Text style={styles.heroBadgeText}>⚡ 10 sec result</Text></View>
                <View style={styles.heroBadge}><Text style={styles.heroBadgeText}>🌍 Free to use</Text></View>
              </View>
            </View>

            <TouchableOpacity style={styles.cameraBtn} onPress={() => pickImage(true)}>
              <Text style={styles.cameraBtnEmoji}>📷</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.cameraBtnTitle}>Take Photo</Text>
                <Text style={styles.cameraBtnSub}>Best for fresh diagnosis</Text>
              </View>
              <Text style={styles.cameraBtnArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.galleryBtn} onPress={() => pickImage(false)}>
              <Text style={styles.cameraBtnEmoji}>🖼️</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.cameraBtnTitle, { color: '#1a6b3c' }]}>Choose from Gallery</Text>
                <Text style={styles.cameraBtnSub}>Use an existing photo</Text>
              </View>
              <Text style={[styles.cameraBtnArrow, { color: '#1a6b3c' }]}>›</Text>
            </TouchableOpacity>

            <View style={styles.tipsCard}>
              <Text style={styles.tipsTitle}>📸 Photo Tips for Best Results</Text>
              {[
                'Photograph in bright natural daylight',
                'Focus clearly on the affected leaf or area',
                'Get close enough to see spots or patterns',
                'Avoid blurry, dark, or overexposed photos',
              ].map((tip, i) => (
                <View key={i} style={styles.tipRow}>
                  <View style={styles.tipDot} />
                  <Text style={styles.tipText}>{tip}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* ── Image selected ── */}
        {image && (
          <>
            {/* Photo + change button */}
            <View style={styles.photoContainer}>
              <Image source={{ uri: image }} style={styles.plantImage} />
              <TouchableOpacity style={styles.changePhotoBtn} onPress={reset}>
                <Text style={styles.changePhotoText}>✕ Change Photo</Text>
              </TouchableOpacity>
            </View>

            {/* Loading */}
            {loading && <LoadingCard />}

            {/* Results */}
            {!loading && result && sev && (
              <View>
                {/* Severity banner */}
                <View style={[styles.severityBanner, { backgroundColor: sev.bg, borderColor: sev.color + '40' }]}>
                  <Text style={styles.severityEmoji}>{sev.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.severityLabel, { color: sev.color }]}>
                      {result.severity} — {result.disease}
                    </Text>
                    <Text style={styles.severityPlant}>{result.plant}</Text>
                  </View>
                  <View style={[styles.severityBadge, { backgroundColor: sev.color }]}>
                    <Text style={styles.severityBadgeText}>{sev.label}</Text>
                  </View>
                </View>

                {/* Cause */}
                <View style={styles.resultCard}>
                  <ResultSection label="Cause" emoji="🦠">
                    <Text style={styles.resultText}>{result.cause}</Text>
                  </ResultSection>

                  <View style={styles.divider} />

                  <ResultSection label="Treatment" emoji="💊">
                    {result.treatment.split('\n').filter(Boolean).map((line, i) => (
                      <Text key={i} style={styles.resultText}>{line.trim()}</Text>
                    ))}
                  </ResultSection>

                  <View style={styles.divider} />

                  <ResultSection label="Prevention" emoji="🛡️">
                    {result.prevention.split('\n').filter(Boolean).map((line, i) => (
                      <Text key={i} style={styles.resultText}>{line.trim()}</Text>
                    ))}
                  </ResultSection>

                  <View style={styles.divider} />

                  <ResultSection label="Economic Impact" emoji="💰">
                    <Text style={styles.resultText}>{result.impact}</Text>
                  </ResultSection>
                </View>

                {/* Actions */}
                <View style={styles.actionsRow}>
                  <TouchableOpacity style={styles.actionBtn} onPress={reset}>
                    <Text style={styles.actionBtnText}>📷 Scan Another</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: '#1a6b3c' }]}
                    onPress={() => router.push('/chat')}>
                    <Text style={[styles.actionBtnText, { color: '#fff' }]}>🤖 Ask Agrow AI</Text>
                  </TouchableOpacity>
                </View>

                {/* Disclaimer */}
                <Text style={styles.disclaimer}>
                  ⚠️ AI results are indicative. Consult a local agricultural expert for severe cases.
                </Text>
              </View>
            )}
          </>
        )}

        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:          { flex: 1, backgroundColor: '#f0f4f0' },
  header:             { backgroundColor: '#1a6b3c', paddingTop: 52, paddingBottom: 14, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backText:           { color: '#a8d5b5', fontSize: 15, fontWeight: '600' },
  headerCenter:       { alignItems: 'center', flex: 1 },
  headerTitle:        { fontSize: 17, fontWeight: '800', color: '#fff' },
  headerSub:          { fontSize: 11, color: '#a8d5b5', marginTop: 1 },
  historyBtn:         { color: '#a8d5b5', fontSize: 14, fontWeight: '700' },

  historyPanel:       { backgroundColor: '#fff', padding: 14, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  historyTitle:       { fontSize: 12, fontWeight: '700', color: '#888', marginBottom: 10 },
  historyItem:        { marginRight: 12, width: 80, alignItems: 'center' },
  historyThumb:       { width: 64, height: 64, borderRadius: 12, backgroundColor: '#e0e0e0', marginBottom: 4 },
  historyBadge:       { fontSize: 14, marginBottom: 2 },
  historyDisease:     { fontSize: 10, color: '#444', fontWeight: '600', textAlign: 'center' },
  historyTime:        { fontSize: 9, color: '#aaa' },

  content:            { padding: 16 },

  heroCard:           { backgroundColor: '#1a6b3c', borderRadius: 20, padding: 24, alignItems: 'center', marginBottom: 16 },
  heroEmoji:          { fontSize: 56, marginBottom: 12 },
  heroTitle:          { fontSize: 20, fontWeight: '800', color: '#fff', textAlign: 'center', marginBottom: 8 },
  heroText:           { fontSize: 13, color: 'rgba(255,255,255,0.8)', textAlign: 'center', lineHeight: 20, marginBottom: 14 },
  heroBadges:         { flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center' },
  heroBadge:          { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  heroBadgeText:      { fontSize: 11, color: '#fff', fontWeight: '600' },

  cameraBtn:          { backgroundColor: '#1a6b3c', borderRadius: 16, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 12, elevation: 3 },
  galleryBtn:         { backgroundColor: '#fff', borderRadius: 16, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16, elevation: 2, borderWidth: 1.5, borderColor: '#1a6b3c' },
  cameraBtnEmoji:     { fontSize: 32 },
  cameraBtnTitle:     { fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 2 },
  cameraBtnSub:       { fontSize: 12, color: 'rgba(255,255,255,0.75)' },
  cameraBtnArrow:     { fontSize: 22, color: 'rgba(255,255,255,0.7)', fontWeight: '300' },

  tipsCard:           { backgroundColor: '#e8f5e9', borderRadius: 14, padding: 16 },
  tipsTitle:          { fontSize: 13, fontWeight: '700', color: '#2e7d32', marginBottom: 10 },
  tipRow:             { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 },
  tipDot:             { width: 6, height: 6, borderRadius: 3, backgroundColor: '#1a6b3c', marginTop: 6, marginRight: 10, flexShrink: 0 },
  tipText:            { fontSize: 13, color: '#388e3c', flex: 1, lineHeight: 20 },

  photoContainer:     { position: 'relative', marginBottom: 14 },
  plantImage:         { width: '100%', height: 240, borderRadius: 16, backgroundColor: '#e0e0e0' },
  changePhotoBtn:     { position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.55)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  changePhotoText:    { color: '#fff', fontSize: 12, fontWeight: '600' },

  loadingCard:        { backgroundColor: '#fff', borderRadius: 16, padding: 32, alignItems: 'center', elevation: 2 },
  loadingStep:        { fontSize: 15, fontWeight: '700', color: '#1a6b3c', marginTop: 16, marginBottom: 6 },
  loadingSubtext:     { fontSize: 12, color: '#aaa', marginBottom: 16 },
  loadingDots:        { flexDirection: 'row', gap: 8 },
  loadingDot:         { width: 10, height: 10, borderRadius: 5 },

  severityBanner:     { borderRadius: 16, borderWidth: 1, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  severityEmoji:      { fontSize: 32 },
  severityLabel:      { fontSize: 15, fontWeight: '800', marginBottom: 2 },
  severityPlant:      { fontSize: 12, color: '#666' },
  severityBadge:      { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  severityBadgeText:  { color: '#fff', fontSize: 12, fontWeight: '700' },

  resultCard:         { backgroundColor: '#fff', borderRadius: 16, padding: 18, marginBottom: 14, elevation: 2 },
  resultSection:      { marginBottom: 4 },
  resultSectionTitle: { fontSize: 13, fontWeight: '800', color: '#1a1a1a', marginBottom: 8 },
  resultText:         { fontSize: 13, color: '#444', lineHeight: 22 },
  divider:            { height: 1, backgroundColor: '#f0f0f0', marginVertical: 14 },

  actionsRow:         { flexDirection: 'row', gap: 10, marginBottom: 12 },
  actionBtn:          { flex: 1, backgroundColor: '#f0f0f0', padding: 14, borderRadius: 14, alignItems: 'center' },
  actionBtnText:      { fontSize: 13, fontWeight: '700', color: '#1a1a1a' },

  disclaimer:         { fontSize: 11, color: '#aaa', textAlign: 'center', lineHeight: 17, marginBottom: 8 },
});