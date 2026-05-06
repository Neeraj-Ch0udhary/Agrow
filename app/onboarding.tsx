import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
    Dimensions,
    SafeAreaView,
    ScrollView, StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    emoji: '🌍',
    title: 'Know Your Land',
    subtitle: 'Find the most profitable crop for your land, budget and location in just 5 questions.',
    bg: '#1a6b3c',
    accent: '#4caf50',
  },
  {
    emoji: '📚',
    title: 'Learn Modern Farming',
    subtitle: 'Step-by-step guides for mushrooms, microgreens, stevia and more — earn 3x more than traditional crops.',
    bg: '#1565c0',
    accent: '#42a5f5',
  },
  {
    emoji: '🏪',
    title: 'Sell Directly to Buyers',
    subtitle: 'Connect with restaurants, supermarkets and buyers. Check live mandi prices and get the best deal.',
    bg: '#e65100',
    accent: '#ffa726',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const goNext = () => {
    if (current < SLIDES.length - 1) {
      const next = current + 1;
      scrollRef.current?.scrollTo({ x: next * width, animated: true });
      setCurrent(next);
    } else {
      finishOnboarding();
    }
  };

  const finishOnboarding = async () => {
    await AsyncStorage.setItem('onboarding_done', 'true');
    router.replace('/login');
  };

  const onScroll = (e: any) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    setCurrent(index);
  };

  const slide = SLIDES[current];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: slide.bg }]}>
      <StatusBar barStyle="light-content" backgroundColor={slide.bg} />

      {/* Skip Button */}
      <TouchableOpacity style={styles.skipButton} onPress={finishOnboarding}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Slides */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScroll}
        scrollEventThrottle={16}>
        {SLIDES.map((s, i) => (
          <View key={i} style={[styles.slide, { width }]}>
            {/* Big Emoji */}
            <View style={[styles.emojiCircle, { borderColor: s.accent }]}>
              <Text style={styles.slideEmoji}>{s.emoji}</Text>
            </View>

            {/* App name on first slide */}
            {i === 0 && (
              <View style={styles.logoRow}>
                <Text style={styles.logoLeaf}>🌿</Text>
                <Text style={styles.logoName}>Agrow</Text>
              </View>
            )}

            <Text style={styles.slideTitle}>{s.title}</Text>
            <Text style={styles.slideSubtitle}>{s.subtitle}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Dots */}
      <View style={styles.dotsRow}>
        {SLIDES.map((_, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => {
              scrollRef.current?.scrollTo({ x: i * width, animated: true });
              setCurrent(i);
            }}>
            <View style={[
              styles.dot,
              i === current && styles.dotActive,
              { backgroundColor: i === current ? '#fff' : 'rgba(255,255,255,0.3)' }
            ]} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Next / Get Started Button */}
      <TouchableOpacity
        style={[styles.nextButton, { backgroundColor: slide.accent }]}
        onPress={goNext}>
        <Text style={styles.nextButtonText}>
          {current === SLIDES.length - 1 ? '🚀 Get Started' : 'Next →'}
        </Text>
      </TouchableOpacity>

      {/* Bottom spacing */}
      <View style={{ height: 32 }} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1 },
  skipButton:     { alignSelf: 'flex-end', padding: 16, paddingTop: 12 },
  skipText:       { color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: '500' },
  slide:          { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  emojiCircle:    { width: 160, height: 160, borderRadius: 80, borderWidth: 3, alignItems: 'center', justifyContent: 'center', marginBottom: 32, backgroundColor: 'rgba(255,255,255,0.1)' },
  slideEmoji:     { fontSize: 80 },
  logoRow:        { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  logoLeaf:       { fontSize: 24 },
  logoName:       { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  slideTitle:     { fontSize: 28, fontWeight: '800', color: '#ffffff', textAlign: 'center', marginBottom: 16, lineHeight: 34 },
  slideSubtitle:  { fontSize: 16, color: 'rgba(255,255,255,0.85)', textAlign: 'center', lineHeight: 26 },
  dotsRow:        { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 24 },
  dot:            { width: 8, height: 8, borderRadius: 4 },
  dotActive:      { width: 24 },
  nextButton:     { marginHorizontal: 32, padding: 18, borderRadius: 14, alignItems: 'center', elevation: 3 },
  nextButtonText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});