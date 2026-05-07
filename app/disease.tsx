import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const GROQ_API_KEY = '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';

async function analyzePlantDisease(base64Image: string): Promise<string> {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_API_KEY}` },
    body: JSON.stringify({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      messages: [{ role: 'user', content: [{ type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Image}` } }, { type: 'text', text: `You are an expert plant disease detector for Indian farmers. Analyze this plant image and provide: 1. 🌿 PLANT IDENTIFIED 2. 🔍 DISEASE/CONDITION 3. ⚠️ SEVERITY 4. 🦠 CAUSE 5. 💊 TREATMENT 6. 🛡️ PREVENTION 7. 💰 IMPACT. Keep advice practical for Indian farmers.` }] }],
      max_tokens: 600, temperature: 0.3,
    })
  });
  if (!response.ok) throw new Error('API error');
  const data = await response.json();
  return data.choices[0].message.content;
}

export default function DiseaseScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [image, setImage]     = useState<string | null>(null);
  const [result, setResult]   = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async (fromCamera: boolean) => {
    try {
      let pickerResult;
      if (fromCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') { Alert.alert('Permission needed', 'Camera permission is required.'); return; }
        pickerResult = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7, base64: true });
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') { Alert.alert('Permission needed', 'Gallery permission is required.'); return; }
        pickerResult = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7, base64: true });
      }
      if (!pickerResult.canceled && pickerResult.assets[0]) {
        const asset = pickerResult.assets[0];
        setImage(asset.uri); setResult(null);
        setLoading(true);
        try { const analysis = await analyzePlantDisease(asset.base64!); setResult(analysis); }
        catch { Alert.alert('Error', 'Could not analyze image. Please try again.'); }
        finally { setLoading(false); }
      }
    } catch (error: any) { Alert.alert('Error', error.message); }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>{t('common.back')}</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{t('disease.title')}</Text>
          <Text style={styles.headerSub}>{t('disease.subtitle')}</Text>
        </View>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {!image ? (
          <>
            <View style={styles.introCard}>
              <Text style={styles.introEmoji}>🌿</Text>
              <Text style={styles.introTitle}>{t('disease.introTitle')}</Text>
              <Text style={styles.introText}>{t('disease.introText')}</Text>
            </View>
            <Text style={styles.sectionTitle}>{t('disease.chooseSource')}</Text>
            <TouchableOpacity style={styles.cameraButton} onPress={() => pickImage(true)}>
              <Text style={styles.cameraButtonEmoji}>📷</Text>
              <View>
                <Text style={styles.cameraButtonTitle}>{t('disease.takePhoto')}</Text>
                <Text style={styles.cameraButtonSub}>{t('disease.takePhotoSub')}</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.galleryButton} onPress={() => pickImage(false)}>
              <Text style={styles.cameraButtonEmoji}>🖼️</Text>
              <View>
                <Text style={[styles.cameraButtonTitle, { color: '#1a6b3c' }]}>{t('disease.gallery')}</Text>
                <Text style={styles.cameraButtonSub}>{t('disease.gallerySub')}</Text>
              </View>
            </TouchableOpacity>
            <View style={styles.tipCard}>
              <Text style={styles.tipTitle}>{t('disease.tips')}</Text>
              <Text style={styles.tipText}>• Take photo in good natural light</Text>
              <Text style={styles.tipText}>• Focus on the affected leaf or area</Text>
              <Text style={styles.tipText}>• Get close enough to see details clearly</Text>
              <Text style={styles.tipText}>• Avoid blurry or dark photos</Text>
            </View>
          </>
        ) : (
          <>
            <Image source={{ uri: image }} style={styles.plantImage} />
            {loading ? (
              <View style={styles.loadingCard}>
                <ActivityIndicator size="large" color="#1a6b3c" />
                <Text style={styles.loadingTitle}>{t('disease.analyzing')}</Text>
                <Text style={styles.loadingText}>{t('disease.analyzingSub')}</Text>
              </View>
            ) : result ? (
              <>
                <View style={styles.resultCard}>
                  <Text style={styles.resultTitle}>{t('disease.result')}</Text>
                  <Text style={styles.resultText}>{result}</Text>
                </View>
                <TouchableOpacity style={styles.retryButton} onPress={() => { setImage(null); setResult(null); }}>
                  <Text style={styles.retryText}>{t('disease.analyzeAnother')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.retryButton, { backgroundColor: '#1a6b3c' }]} onPress={() => router.push('/chat')}>
                  <Text style={[styles.retryText, { color: '#fff' }]}>{t('disease.askAI')}</Text>
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
  container:         { flex: 1, backgroundColor: '#f5f7f5' },
  header:            { backgroundColor: '#1a6b3c', paddingTop: 52, paddingBottom: 14, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backText:          { color: '#a8d5b5', fontSize: 15, fontWeight: '600' },
  headerCenter:      { alignItems: 'center' },
  headerTitle:       { fontSize: 17, fontWeight: '700', color: '#fff' },
  headerSub:         { fontSize: 11, color: '#a8d5b5' },
  content:           { padding: 16 },
  introCard:         { backgroundColor: '#fff', borderRadius: 16, padding: 24, alignItems: 'center', marginBottom: 20, elevation: 2 },
  introEmoji:        { fontSize: 56, marginBottom: 12 },
  introTitle:        { fontSize: 20, fontWeight: '700', color: '#1a1a1a', textAlign: 'center', marginBottom: 10 },
  introText:         { fontSize: 14, color: '#666', textAlign: 'center', lineHeight: 22 },
  sectionTitle:      { fontSize: 14, fontWeight: '600', color: '#888', marginBottom: 10 },
  cameraButton:      { backgroundColor: '#1a6b3c', borderRadius: 14, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 12, elevation: 2 },
  galleryButton:     { backgroundColor: '#fff', borderRadius: 14, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 20, elevation: 2, borderWidth: 1.5, borderColor: '#1a6b3c' },
  cameraButtonEmoji: { fontSize: 32 },
  cameraButtonTitle: { fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 2 },
  cameraButtonSub:   { fontSize: 12, color: '#a8d5b5' },
  tipCard:           { backgroundColor: '#e8f5e9', borderRadius: 12, padding: 16 },
  tipTitle:          { fontSize: 14, fontWeight: '700', color: '#2e7d32', marginBottom: 10 },
  tipText:           { fontSize: 13, color: '#388e3c', lineHeight: 24 },
  plantImage:        { width: '100%', height: 240, borderRadius: 14, marginBottom: 16, backgroundColor: '#e0e0e0' },
  loadingCard:       { backgroundColor: '#fff', borderRadius: 14, padding: 32, alignItems: 'center', elevation: 2 },
  loadingTitle:      { fontSize: 16, fontWeight: '600', color: '#1a1a1a', marginTop: 16, marginBottom: 8 },
  loadingText:       { fontSize: 13, color: '#888', textAlign: 'center' },
  resultCard:        { backgroundColor: '#fff', borderRadius: 14, padding: 20, marginBottom: 16, elevation: 2 },
  resultTitle:       { fontSize: 16, fontWeight: '700', color: '#1a6b3c', marginBottom: 12 },
  resultText:        { fontSize: 14, color: '#333', lineHeight: 24 },
  retryButton:       { backgroundColor: '#f5f5f5', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 12, elevation: 1 },
  retryText:         { fontSize: 15, fontWeight: '600', color: '#1a1a1a' },
});