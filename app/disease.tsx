import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator, Alert,
    Image,
    SafeAreaView, ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const GROQ_API_KEY = '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';

async function analyzePlantDisease(base64Image: string): Promise<string> {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            },
            {
              type: 'text',
              text: `You are an expert plant disease detector for Indian farmers. 
Analyze this plant image and provide:

1. 🌿 PLANT IDENTIFIED: (what plant is this)
2. 🔍 DISEASE/CONDITION: (name of disease or if plant is healthy)
3. ⚠️ SEVERITY: (Healthy / Mild / Moderate / Severe)
4. 🦠 CAUSE: (what causes this disease)
5. 💊 TREATMENT: (step by step treatment in simple language)
6. 🛡️ PREVENTION: (how to prevent this in future)
7. 💰 IMPACT: (how this affects profit and yield)

Keep advice practical and suitable for Indian farmers. Use simple language.`
            }
          ]
        }
      ],
      max_tokens: 600,
      temperature: 0.3,
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(JSON.stringify(error));
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

export default function DiseaseScreen() {
  const router = useRouter();
  const [image, setImage]     = useState<string | null>(null);
  const [result, setResult]   = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async (fromCamera: boolean) => {
    try {
      let pickerResult;

      if (fromCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission needed', 'Camera permission is required to take photos.');
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
        analyzeImage(asset.base64!);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const analyzeImage = async (base64: string) => {
    setLoading(true);
    try {
      const analysis = await analyzePlantDisease(base64);
      setResult(analysis);
    } catch (error: any) {
      Alert.alert('Error', 'Could not analyze image. Please try again.');
      console.log('Disease detection error:', error);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setImage(null);
    setResult(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>🔍 Disease Detector</Text>
          <Text style={styles.headerSub}>AI powered plant diagnosis</Text>
        </View>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {!image ? (
          <>
            {/* Intro Card */}
            <View style={styles.introCard}>
              <Text style={styles.introEmoji}>🌿</Text>
              <Text style={styles.introTitle}>Detect Plant Diseases Instantly</Text>
              <Text style={styles.introText}>
                Take a photo of your plant and our AI will identify any disease, suggest treatment, and help you save your crop.
              </Text>
            </View>

            {/* How it works */}
            <Text style={styles.sectionTitle}>How it works</Text>
            <View style={styles.stepsCard}>
              {[
                { step: '1', text: 'Take a clear photo of the affected plant or leaf', emoji: '📷' },
                { step: '2', text: 'AI analyzes the image instantly', emoji: '🤖' },
                { step: '3', text: 'Get disease name, treatment and prevention tips', emoji: '💊' },
              ].map((item, i) => (
                <View key={i} style={styles.stepRow}>
                  <View style={styles.stepNum}>
                    <Text style={styles.stepNumText}>{item.step}</Text>
                  </View>
                  <Text style={styles.stepEmoji}>{item.emoji}</Text>
                  <Text style={styles.stepText}>{item.text}</Text>
                </View>
              ))}
            </View>

            {/* Action Buttons */}
            <Text style={styles.sectionTitle}>Choose image source</Text>
            <TouchableOpacity style={styles.cameraButton} onPress={() => pickImage(true)}>
              <Text style={styles.cameraButtonEmoji}>📷</Text>
              <View>
                <Text style={styles.cameraButtonTitle}>Take a Photo</Text>
                <Text style={styles.cameraButtonSub}>Use your camera for best results</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.galleryButton} onPress={() => pickImage(false)}>
              <Text style={styles.cameraButtonEmoji}>🖼️</Text>
              <View>
                <Text style={[styles.cameraButtonTitle, { color: '#1a6b3c' }]}>Choose from Gallery</Text>
                <Text style={styles.cameraButtonSub}>Pick an existing photo</Text>
              </View>
            </TouchableOpacity>

            {/* Tips */}
            <View style={styles.tipCard}>
              <Text style={styles.tipTitle}>📸 Photo Tips for Best Results</Text>
              <Text style={styles.tipText}>• Take photo in good natural light</Text>
              <Text style={styles.tipText}>• Focus on the affected leaf or area</Text>
              <Text style={styles.tipText}>• Get close enough to see details clearly</Text>
              <Text style={styles.tipText}>• Avoid blurry or dark photos</Text>
            </View>
          </>
        ) : (
          <>
            {/* Image Preview */}
            <Image source={{ uri: image }} style={styles.plantImage} />

            {loading ? (
              <View style={styles.loadingCard}>
                <ActivityIndicator size="large" color="#1a6b3c" />
                <Text style={styles.loadingTitle}>Analyzing your plant... 🤖</Text>
                <Text style={styles.loadingText}>Our AI is examining the image for diseases</Text>
              </View>
            ) : result ? (
              <>
                <View style={styles.resultCard}>
                  <Text style={styles.resultTitle}>🔍 Analysis Result</Text>
                  <Text style={styles.resultText}>{result}</Text>
                </View>

                <TouchableOpacity style={styles.retryButton} onPress={reset}>
                  <Text style={styles.retryText}>📷 Analyze Another Plant</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.retryButton, { backgroundColor: '#1a6b3c' }]}
                  onPress={() => router.push('/chat')}>
                  <Text style={[styles.retryText, { color: '#fff' }]}>🤖 Ask Agrow AI for More Help</Text>
                </TouchableOpacity>
              </>
            ) : null}
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:          { flex: 1, backgroundColor: '#f5f7f5' },
  header:             { backgroundColor: '#1a6b3c', paddingTop: 52, paddingBottom: 14, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backText:           { color: '#a8d5b5', fontSize: 15, fontWeight: '600' },
  headerCenter:       { alignItems: 'center' },
  headerTitle:        { fontSize: 17, fontWeight: '700', color: '#fff' },
  headerSub:          { fontSize: 11, color: '#a8d5b5' },
  content:            { padding: 16 },
  introCard:          { backgroundColor: '#fff', borderRadius: 16, padding: 24, alignItems: 'center', marginBottom: 20, elevation: 2 },
  introEmoji:         { fontSize: 56, marginBottom: 12 },
  introTitle:         { fontSize: 20, fontWeight: '700', color: '#1a1a1a', textAlign: 'center', marginBottom: 10 },
  introText:          { fontSize: 14, color: '#666', textAlign: 'center', lineHeight: 22 },
  sectionTitle:       { fontSize: 14, fontWeight: '600', color: '#888', marginBottom: 10, marginTop: 4 },
  stepsCard:          { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 20, elevation: 2 },
  stepRow:            { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  stepNum:            { width: 28, height: 28, borderRadius: 14, backgroundColor: '#1a6b3c', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  stepNumText:        { color: '#fff', fontSize: 13, fontWeight: '700' },
  stepEmoji:          { fontSize: 20, marginRight: 10 },
  stepText:           { flex: 1, fontSize: 13, color: '#444', lineHeight: 20 },
  cameraButton:       { backgroundColor: '#1a6b3c', borderRadius: 14, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 12, elevation: 2 },
  galleryButton:      { backgroundColor: '#fff', borderRadius: 14, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 20, elevation: 2, borderWidth: 1.5, borderColor: '#1a6b3c' },
  cameraButtonEmoji:  { fontSize: 32 },
  cameraButtonTitle:  { fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 2 },
  cameraButtonSub:    { fontSize: 12, color: '#a8d5b5' },
  tipCard:            { backgroundColor: '#e8f5e9', borderRadius: 12, padding: 16 },
  tipTitle:           { fontSize: 14, fontWeight: '700', color: '#2e7d32', marginBottom: 10 },
  tipText:            { fontSize: 13, color: '#388e3c', lineHeight: 24 },
  plantImage:         { width: '100%', height: 240, borderRadius: 14, marginBottom: 16, backgroundColor: '#e0e0e0' },
  loadingCard:        { backgroundColor: '#fff', borderRadius: 14, padding: 32, alignItems: 'center', elevation: 2 },
  loadingTitle:       { fontSize: 16, fontWeight: '600', color: '#1a1a1a', marginTop: 16, marginBottom: 8 },
  loadingText:        { fontSize: 13, color: '#888', textAlign: 'center' },
  resultCard:         { backgroundColor: '#fff', borderRadius: 14, padding: 20, marginBottom: 16, elevation: 2 },
  resultTitle:        { fontSize: 16, fontWeight: '700', color: '#1a6b3c', marginBottom: 12 },
  resultText:         { fontSize: 14, color: '#333', lineHeight: 24 },
  retryButton:        { backgroundColor: '#f5f5f5', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 12, elevation: 1 },
  retryText:          { fontSize: 15, fontWeight: '600', color: '#1a1a1a' },
});