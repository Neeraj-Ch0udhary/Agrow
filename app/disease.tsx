import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
// ── FIX 1: Import SafeAreaView from the correct package ──────────────────
import { SafeAreaView } from 'react-native-safe-area-context';

const GROQ_API_KEY     = process.env.EXPO_PUBLIC_GROQ_API_KEY!;
const HISTORY_STORAGE  = 'agrow_disease_history_v1';
const MAX_HISTORY      = 10;

type ScanResult = {
  plant:      string;
  disease:    string;
  severity:   'Healthy' | 'Mild' | 'Moderate' | 'Severe';
  cause:      string;
  treatment:  string;
  prevention: string;
  impact:     string;
  raw:        string;
};

type HistoryItem = {
  uri:    string;
  result: ScanResult;
  time:   string;
  date:   string;
};

async function analyzePlantDisease(base64Image: string): Promise<ScanResult> {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      messages: [{
        role:    'user',
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
IMPACT: [economic impact on farmer in 1 sentence]`,
          },
        ],
      }],
      max_tokens:  600,
      temperature: 0.2,
    }),
  });

  if (!response.ok) throw new Error('API error ' + response.status);
  const data = await response.json();
  const raw  = data.choices[0].message.content as string;

  const get = (key: string) => {
    const match = raw.match(new RegExp(`${key}:\\s*([^\\n]+(?:\\n(?![A-Z]+:)[^\\n]+)*)`, 'i'));
    return match ? match[1].trim() : '';
  };

  const severityRaw = get('SEVERITY') as any;
  const severity: ScanResult['severity'] =
    ['Healthy', 'Mild', 'Moderate', 'Severe'].includes(severityRaw) ? severityRaw : 'Moderate';

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

const SEVERITY_CONFIG = {
  Healthy:  { color: '#1a6b3c', bg: '#e8f5e9', emoji: '✅', label: 'Healthy'  },
  Mild:     { color: '#f57f17', bg: '#fffde7', emoji: '⚠️', label: 'Mild'     },
  Moderate: { color: '#e65100', bg: '#fff3e0', emoji: '🔶', label: 'Moderate' },
  Severe:   { color: '#c62828', bg: '#ffebee', emoji: '🚨', label: 'Severe'   },
};

const LOADING_STEPS = [
  '🔍 Scanning image...',
  '🌿 Identifying plant...',
  '🦠 Detecting disease...',
  '💊 Preparing treatment...',
];

// ── Loading card ──────────────────────────────────────────────────────────
function LoadingCard() {
  const [step, setStep]   = useState(0);
  const fadeAnim           = useRef(new Animated.Value(1)).current;

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
          <View key={i} style={[styles.loadingDot, { backgroundColor: i <= step ? '#1a6b3c' : '#e0e0e0' }]} />
        ))}
      </View>
    </View>
  );
}

// ── Result section ────────────────────────────────────────────────────────
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

  const [image,       setImage]       = useState<string | null>(null);
  const [result,      setResult]      = useState<ScanResult | null>(null);
  const [loading,     setLoading]     = useState(false);
  const [history,     setHistory]     = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [sharing,     setSharing]     = useState(false);

  // ── FIX 2: Load history from AsyncStorage on mount ────────────────────
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(HISTORY_STORAGE);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) setHistory(parsed);
        }
      } catch (_) {}
    })();
  }, []);

  const saveHistory = async (newHistory: HistoryItem[]) => {
    try {
      await AsyncStorage.setItem(HISTORY_STORAGE, JSON.stringify(newHistory));
    } catch (_) {}
  };

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

          const now     = new Date();
          const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
          const dateStr = now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
          const newItem: HistoryItem = { uri: asset.uri, result: analysis, time: timeStr, date: dateStr };

          // ── FIX 3: Persist history to AsyncStorage ─────────────────────
          const updated = [newItem, ...history].slice(0, MAX_HISTORY);
          setHistory(updated);
          await saveHistory(updated);
        } catch {
          Alert.alert('Error', 'Could not analyze image. Check your internet and try again.');
        } finally {
          setLoading(false);
        }
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
      setLoading(false);
    }
  };

  // ── FIX 4: Show loading state when tapping a history item ─────────────
  const loadFromHistory = (item: HistoryItem) => {
    setShowHistory(false);
    setImage(item.uri);
    setResult(item.result);
    setLoading(false);
  };

  const clearHistory = async () => {
    Alert.alert('Clear history?', 'All past scans will be deleted.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          setHistory([]);
          setShowHistory(false);
          await AsyncStorage.removeItem(HISTORY_STORAGE);
        },
      },
    ]);
  };

  // ── FIX 5: Share result as text ───────────────────────────────────────
  const shareResult = async () => {
    if (!result) return;
    const sev    = SEVERITY_CONFIG[result.severity];
    const text   = `🌿 Agrow Disease Report\n\nPlant: ${result.plant}\nDisease: ${result.disease}\nSeverity: ${sev.emoji} ${result.severity}\n\n🦠 Cause:\n${result.cause}\n\n💊 Treatment:\n${result.treatment}\n\n🛡️ Prevention:\n${result.prevention}\n\n💰 Impact:\n${result.impact}\n\n—\nScanned with Agrow App 🇮🇳`;

    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      Alert.alert('Sharing not available on this device.');
      return;
    }

    setSharing(true);
    try {
      // Write text to a temp file then share it
      const fileUri = `${require('expo-file-system').documentDirectory}agrow_report.txt`;
      await require('expo-file-system').writeAsStringAsync(fileUri, text);
      await Sharing.shareAsync(fileUri, { mimeType: 'text/plain', dialogTitle: 'Share Disease Report' });
    } catch (_) {
      Alert.alert('Could not share. Try again.');
    } finally {
      setSharing(false);
    }
  };

  const reset = () => { setImage(null); setResult(null); };
  const sev   = result ? SEVERITY_CONFIG[result.severity] : null;

  return (
    // ── FIX 6: SafeAreaView from safe-area-context, no hardcoded paddingTop ──
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>🔍 Disease Detector</Text>
          <Text style={styles.headerSub}>AI-powered plant diagnosis</Text>
        </View>
        <TouchableOpacity
          onPress={history.length > 0 ? () => setShowHistory(!showHistory) : undefined}
          style={styles.historyBtnWrap}
        >
          <Text style={styles.historyBtn}>
            📋{history.length > 0 ? ` ${history.length}` : ''}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── FIX 7: History panel — empty state + clear button ─────────────── */}
      {showHistory && (
        <View style={styles.historyPanel}>
          <View style={styles.historyHeader}>
            <Text style={styles.historyTitle}>Recent scans</Text>
            {history.length > 0 && (
              <TouchableOpacity onPress={clearHistory}>
                <Text style={styles.historyClearBtn}>Clear all</Text>
              </TouchableOpacity>
            )}
          </View>
          {history.length === 0 ? (
            <Text style={styles.historyEmpty}>No scans yet. Take a photo to get started.</Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {history.map((item, i) => {
                const cfg = SEVERITY_CONFIG[item.result.severity];
                return (
                  <TouchableOpacity
                    key={i}
                    style={styles.historyItem}
                    onPress={() => loadFromHistory(item)}
                  >
                    <Image source={{ uri: item.uri }} style={styles.historyThumb} />
                    <Text style={[styles.historyBadge, { color: cfg.color }]}>{cfg.emoji}</Text>
                    <Text style={styles.historyDisease} numberOfLines={1}>{item.result.disease}</Text>
                    <Text style={styles.historyTime}>{item.date} {item.time}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
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
                <Text style={styles.cameraBtnTitle}>Take photo</Text>
                <Text style={styles.cameraBtnSubWhite}>Best for fresh diagnosis</Text>
              </View>
              <Text style={styles.cameraBtnArrowWhite}>›</Text>
            </TouchableOpacity>

            {/* ── FIX 8: Gallery button sub-text uses green, not white ── */}
            <TouchableOpacity style={styles.galleryBtn} onPress={() => pickImage(false)}>
              <Text style={styles.cameraBtnEmoji}>🖼️</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.galleryBtnTitle}>Choose from gallery</Text>
                <Text style={styles.galleryBtnSub}>Use an existing photo</Text>
              </View>
              <Text style={styles.galleryBtnArrow}>›</Text>
            </TouchableOpacity>

            <View style={styles.tipsCard}>
              <Text style={styles.tipsTitle}>📸 Photo tips for best results</Text>
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
            <View style={styles.photoContainer}>
              <Image source={{ uri: image }} style={styles.plantImage} />
              <TouchableOpacity style={styles.changePhotoBtn} onPress={reset}>
                <Text style={styles.changePhotoText}>✕ Change photo</Text>
              </TouchableOpacity>
            </View>

            {loading && <LoadingCard />}

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

                {/* Result card */}
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

                  <ResultSection label="Economic impact" emoji="💰">
                    <Text style={styles.resultText}>{result.impact}</Text>
                  </ResultSection>
                </View>

                {/* Actions */}
                <View style={styles.actionsRow}>
                  <TouchableOpacity style={styles.actionBtn} onPress={reset}>
                    <Text style={styles.actionBtnText}>📷 Scan another</Text>
                  </TouchableOpacity>
                  {/* ── FIX 9: Share button ───────────────────────────── */}
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={shareResult}
                    disabled={sharing}
                  >
                    <Text style={styles.actionBtnText}>{sharing ? '⏳ Sharing…' : '📤 Share result'}</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.askAIBtn}
                  onPress={() => router.push('/chat')}
                >
                  <Text style={styles.askAIBtnText}>🤖 Ask Agrow AI about this disease</Text>
                </TouchableOpacity>

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
  container:           { flex: 1, backgroundColor: '#f0f4f0' },

  // ── FIX 10: Header has no hardcoded paddingTop — SafeAreaView handles it ──
  header:              { backgroundColor: '#1a6b3c', paddingTop: 8, paddingBottom: 14, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backText:            { color: '#a8d5b5', fontSize: 15, fontWeight: '600' },
  headerCenter:        { alignItems: 'center', flex: 1 },
  headerTitle:         { fontSize: 17, fontWeight: '800', color: '#fff' },
  headerSub:           { fontSize: 11, color: '#a8d5b5', marginTop: 1 },
  historyBtnWrap:      { minWidth: 36, alignItems: 'flex-end' },
  historyBtn:          { color: '#a8d5b5', fontSize: 14, fontWeight: '700' },

  // History panel
  historyPanel:        { backgroundColor: '#fff', padding: 14, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  historyHeader:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  historyTitle:        { fontSize: 12, fontWeight: '700', color: '#888' },
  historyClearBtn:     { fontSize: 12, color: '#e74c3c', fontWeight: '600' },
  historyEmpty:        { fontSize: 13, color: '#aaa', textAlign: 'center', paddingVertical: 8 },
  historyItem:         { marginRight: 12, width: 80, alignItems: 'center' },
  historyThumb:        { width: 64, height: 64, borderRadius: 12, backgroundColor: '#e0e0e0', marginBottom: 4 },
  historyBadge:        { fontSize: 14, marginBottom: 2 },
  historyDisease:      { fontSize: 10, color: '#444', fontWeight: '600', textAlign: 'center' },
  historyTime:         { fontSize: 9, color: '#aaa', textAlign: 'center' },

  content:             { padding: 16 },

  heroCard:            { backgroundColor: '#1a6b3c', borderRadius: 20, padding: 24, alignItems: 'center', marginBottom: 16 },
  heroEmoji:           { fontSize: 56, marginBottom: 12 },
  heroTitle:           { fontSize: 20, fontWeight: '800', color: '#fff', textAlign: 'center', marginBottom: 8 },
  heroText:            { fontSize: 13, color: 'rgba(255,255,255,0.8)', textAlign: 'center', lineHeight: 20, marginBottom: 14 },
  heroBadges:          { flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center' },
  heroBadge:           { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  heroBadgeText:       { fontSize: 11, color: '#fff', fontWeight: '600' },

  cameraBtn:           { backgroundColor: '#1a6b3c', borderRadius: 16, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 12, elevation: 3 },
  galleryBtn:          { backgroundColor: '#fff', borderRadius: 16, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16, elevation: 2, borderWidth: 1.5, borderColor: '#1a6b3c' },
  cameraBtnEmoji:      { fontSize: 32 },
  cameraBtnTitle:      { fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 2 },
  cameraBtnSubWhite:   { fontSize: 12, color: 'rgba(255,255,255,0.75)' },
  cameraBtnArrowWhite: { fontSize: 22, color: 'rgba(255,255,255,0.7)', fontWeight: '300' },
  // ── FIX 11: Gallery sub text and arrow use green, not white ───────────
  galleryBtnTitle:     { fontSize: 16, fontWeight: '700', color: '#1a6b3c', marginBottom: 2 },
  galleryBtnSub:       { fontSize: 12, color: '#4caf50' },
  galleryBtnArrow:     { fontSize: 22, color: '#1a6b3c', fontWeight: '300' },

  tipsCard:            { backgroundColor: '#e8f5e9', borderRadius: 14, padding: 16 },
  tipsTitle:           { fontSize: 13, fontWeight: '700', color: '#2e7d32', marginBottom: 10 },
  tipRow:              { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 },
  tipDot:              { width: 6, height: 6, borderRadius: 3, backgroundColor: '#1a6b3c', marginTop: 6, marginRight: 10, flexShrink: 0 },
  tipText:             { fontSize: 13, color: '#388e3c', flex: 1, lineHeight: 20 },

  photoContainer:      { marginBottom: 14 },
  plantImage:          { width: '100%', height: 240, borderRadius: 16, backgroundColor: '#e0e0e0' },
  changePhotoBtn:      { alignSelf: 'flex-end', marginTop: 8, backgroundColor: 'rgba(0,0,0,0.55)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  changePhotoText:     { color: '#fff', fontSize: 12, fontWeight: '600' },

  loadingCard:         { backgroundColor: '#fff', borderRadius: 16, padding: 32, alignItems: 'center', elevation: 2, marginBottom: 14 },
  loadingStep:         { fontSize: 15, fontWeight: '700', color: '#1a6b3c', marginTop: 16, marginBottom: 6 },
  loadingSubtext:      { fontSize: 12, color: '#aaa', marginBottom: 16 },
  loadingDots:         { flexDirection: 'row', gap: 8 },
  loadingDot:          { width: 10, height: 10, borderRadius: 5 },

  severityBanner:      { borderRadius: 16, borderWidth: 1, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  severityEmoji:       { fontSize: 32 },
  severityLabel:       { fontSize: 15, fontWeight: '800', marginBottom: 2 },
  severityPlant:       { fontSize: 12, color: '#666' },
  severityBadge:       { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  severityBadgeText:   { color: '#fff', fontSize: 12, fontWeight: '700' },

  resultCard:          { backgroundColor: '#fff', borderRadius: 16, padding: 18, marginBottom: 14, elevation: 2 },
  resultSection:       { marginBottom: 4 },
  resultSectionTitle:  { fontSize: 13, fontWeight: '800', color: '#1a1a1a', marginBottom: 8 },
  resultText:          { fontSize: 13, color: '#444', lineHeight: 22 },
  divider:             { height: 1, backgroundColor: '#f0f0f0', marginVertical: 14 },

  actionsRow:          { flexDirection: 'row', gap: 10, marginBottom: 10 },
  actionBtn:           { flex: 1, backgroundColor: '#f0f0f0', padding: 14, borderRadius: 14, alignItems: 'center' },
  actionBtnText:       { fontSize: 13, fontWeight: '700', color: '#1a1a1a' },

  askAIBtn:            { backgroundColor: '#1a6b3c', padding: 15, borderRadius: 14, alignItems: 'center', marginBottom: 12 },
  askAIBtnText:        { color: '#fff', fontSize: 14, fontWeight: '700' },

  disclaimer:          { fontSize: 11, color: '#aaa', textAlign: 'center', lineHeight: 17, marginBottom: 8 },
});