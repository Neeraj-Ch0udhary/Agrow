import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Animated, Dimensions, Easing, SafeAreaView,
  ScrollView, StatusBar, StyleSheet, Text,
  TouchableOpacity, View
} from 'react-native';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    emoji: '🌱',
    floaters: ['🌿', '☀️', '💧', '🌾'],
    title: 'Welcome to Agrow',
    subtitle: 'India\'s smartest farming platform — guiding you from empty land to marketplace',
    highlight: '3-5× more profit',
    highlightSub: 'than traditional farming',
    bg: '#1a6b3c',
    accent: '#4caf50',
    bubbleBg: 'rgba(76,175,80,0.15)',
  },
  {
    emoji: '🤖',
    floaters: ['📊', '🧪', '💡', '📱'],
    title: 'AI-Powered Guidance',
    subtitle: 'Get crop recommendations, disease detection and a personal farming assistant — all in one app',
    highlight: '6+ modern crops',
    highlightSub: 'with step-by-step guides',
    bg: '#1565c0',
    accent: '#42a5f5',
    bubbleBg: 'rgba(66,165,245,0.15)',
  },
  {
    emoji: '🍄',
    floaters: ['🌿', '🥦', '🍅', '🫑'],
    title: 'Grow High-Profit Crops',
    subtitle: 'Mushrooms, microgreens, stevia and more — crops that earn ₹15,000–₹80,000 per month',
    highlight: '₹80,000/month',
    highlightSub: 'with hydroponics farming',
    bg: '#2e7d32',
    accent: '#81c784',
    bubbleBg: 'rgba(129,199,132,0.15)',
  },
  {
    emoji: '🏪',
    floaters: ['📦', '🤝', '💰', '🚚'],
    title: 'Sell Directly to Buyers',
    subtitle: 'Skip the middleman — connect with restaurants, supermarkets and buyers who pay 40% more',
    highlight: '40% more income',
    highlightSub: 'by selling direct',
    bg: '#e65100',
    accent: '#ffa726',
    bubbleBg: 'rgba(255,167,38,0.15)',
  },
];

function FloatingEmoji({ emoji, delay, startX, startY }: any) {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.loop(
          Animated.sequence([
            Animated.timing(floatAnim, { toValue: -18, duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
            Animated.timing(floatAnim, { toValue: 0,   duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          ])
        ),
      ]),
    ]).start();
  }, []);

  return (
    <Animated.Text style={{
      position: 'absolute',
      left: startX,
      top: startY,
      fontSize: 28,
      opacity: fadeAnim,
      transform: [{ translateY: floatAnim }],
    }}>
      {emoji}
    </Animated.Text>
  );
}

function SlideContent({ slide, isActive }: any) {
  const scaleAnim   = useRef(new Animated.Value(0.7)).current;
  const fadeAnim    = useRef(new Animated.Value(0)).current;
  const slideAnim   = useRef(new Animated.Value(40)).current;
  const pulseAnim   = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isActive) {
      // Reset
      scaleAnim.setValue(0.7);
      fadeAnim.setValue(0);
      slideAnim.setValue(40);

      // Animate in
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, friction: 6, tension: 80, useNativeDriver: true }),
        Animated.timing(fadeAnim,  { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 500, easing: Easing.out(Easing.back(1.2)), useNativeDriver: true }),
      ]).start();

      // Pulse the emoji circle
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.08, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1,    duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      ).start();
    }
  }, [isActive]);

  const FLOATER_POSITIONS = [
    { x: width * 0.08, y: height * 0.12 },
    { x: width * 0.72, y: height * 0.10 },
    { x: width * 0.80, y: height * 0.35 },
    { x: width * 0.05, y: height * 0.38 },
  ];

  return (
    <View style={[styles.slide, { width }]}>
      {/* Floating emojis */}
      {slide.floaters.map((f: string, i: number) => (
        <FloatingEmoji
          key={i}
          emoji={f}
          delay={i * 200}
          startX={FLOATER_POSITIONS[i].x}
          startY={FLOATER_POSITIONS[i].y}
        />
      ))}

      {/* Big emoji circle */}
      <Animated.View style={[
        styles.emojiCircle,
        { borderColor: slide.accent, transform: [{ scale: scaleAnim }, { scale: pulseAnim }] }
      ]}>
        <View style={[styles.emojiInner, { backgroundColor: slide.bubbleBg }]}>
          <Animated.Text style={[styles.slideEmoji, { opacity: fadeAnim }]}>
            {slide.emoji}
          </Animated.Text>
        </View>
      </Animated.View>

      {/* Text content */}
      <Animated.View style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
        alignItems: 'center',
        paddingHorizontal: 28,
      }}>
        <Text style={styles.slideTitle}>{slide.title}</Text>
        <Text style={styles.slideSubtitle}>{slide.subtitle}</Text>

        {/* Highlight pill */}
        <View style={[styles.highlightPill, { backgroundColor: slide.bubbleBg, borderColor: slide.accent + '60' }]}>
          <Text style={[styles.highlightValue, { color: slide.accent }]}>{slide.highlight}</Text>
          <Text style={[styles.highlightSub, { color: slide.accent + 'cc' }]}>{slide.highlightSub}</Text>
        </View>
      </Animated.View>
    </View>
  );
}

export default function OnboardingScreen() {
  const router     = useRouter();
  const { t }      = useTranslation();
  const [current, setCurrent] = useState(0);
  const scrollRef  = useRef<ScrollView>(null);
  const bgAnim     = useRef(new Animated.Value(0)).current;
  const btnScale   = useRef(new Animated.Value(1)).current;

  const slide = SLIDES[current];

  const finishOnboarding = async () => {
    await AsyncStorage.setItem('onboarding_done', 'true');
    router.replace('/login');
  };

  const goNext = () => {
    if (current < SLIDES.length - 1) {
      const next = current + 1;
      scrollRef.current?.scrollTo({ x: next * width, animated: true });
      setCurrent(next);
    } else {
      finishOnboarding();
    }
  };

  const onScroll = (e: any) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    if (index !== current) setCurrent(index);
  };

  const onBtnPressIn  = () => Animated.spring(btnScale, { toValue: 0.95, useNativeDriver: true }).start();
  const onBtnPressOut = () => Animated.spring(btnScale, { toValue: 1, friction: 4, useNativeDriver: true }).start();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: slide.bg }]}>
      <StatusBar barStyle="light-content" backgroundColor={slide.bg} />

      {/* Background circles */}
      <View style={[styles.bgCircle1, { backgroundColor: 'rgba(255,255,255,0.05)' }]} />
      <View style={[styles.bgCircle2, { backgroundColor: 'rgba(255,255,255,0.04)' }]} />

      {/* Skip */}
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
          <SlideContent key={i} slide={s} isActive={i === current} />
        ))}
      </ScrollView>

      {/* Bottom area */}
      <View style={styles.bottomArea}>

        {/* Dots */}
        <View style={styles.dotsRow}>
          {SLIDES.map((_, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => {
                scrollRef.current?.scrollTo({ x: i * width, animated: true });
                setCurrent(i);
              }}>
              <Animated.View style={[
                styles.dot,
                {
                  backgroundColor: i === current ? '#fff' : 'rgba(255,255,255,0.3)',
                  width: i === current ? 28 : 8,
                }
              ]} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Progress text */}
        <Text style={styles.progressText}>{current + 1} of {SLIDES.length}</Text>

        {/* Next / Get Started button */}
        <Animated.View style={{ transform: [{ scale: btnScale }] }}>
          <TouchableOpacity
            style={[styles.nextButton, { backgroundColor: slide.accent }]}
            onPress={goNext}
            onPressIn={onBtnPressIn}
            onPressOut={onBtnPressOut}
            activeOpacity={1}>
            <Text style={styles.nextButtonText}>
              {current === SLIDES.length - 1 ? '🚀 Get Started' : 'Next →'}
            </Text>
          </TouchableOpacity>
        </Animated.View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, overflow: 'hidden' },
  bgCircle1:       { position: 'absolute', width: 400, height: 400, borderRadius: 200, top: -100, right: -100 },
  bgCircle2:       { position: 'absolute', width: 300, height: 300, borderRadius: 150, bottom: -80, left: -80 },
  skipButton:      { alignSelf: 'flex-end', paddingHorizontal: 20, paddingVertical: 12 },
  skipText:        { color: 'rgba(255,255,255,0.65)', fontSize: 14, fontWeight: '500' },
  slide:           { alignItems: 'center', justifyContent: 'center', paddingTop: 20 },
  emojiCircle:     { width: 180, height: 180, borderRadius: 90, borderWidth: 2.5, alignItems: 'center', justifyContent: 'center', marginBottom: 36 },
  emojiInner:      { width: 160, height: 160, borderRadius: 80, alignItems: 'center', justifyContent: 'center' },
  slideEmoji:      { fontSize: 86 },
  slideTitle:      { fontSize: 30, fontWeight: '800', color: '#fff', textAlign: 'center', marginBottom: 14, lineHeight: 36 },
  slideSubtitle:   { fontSize: 15, color: 'rgba(255,255,255,0.82)', textAlign: 'center', lineHeight: 24, marginBottom: 24 },
  highlightPill:   { borderRadius: 20, paddingHorizontal: 20, paddingVertical: 12, alignItems: 'center', borderWidth: 1 },
  highlightValue:  { fontSize: 20, fontWeight: '800', marginBottom: 2 },
  highlightSub:    { fontSize: 12, fontWeight: '500' },
  bottomArea:      { paddingHorizontal: 24, paddingBottom: 20 },
  dotsRow:         { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginBottom: 8 },
  dot:             { height: 8, borderRadius: 4 },
  progressText:    { color: 'rgba(255,255,255,0.5)', fontSize: 12, textAlign: 'center', marginBottom: 16 },
  nextButton:      { padding: 18, borderRadius: 16, alignItems: 'center', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
  nextButtonText:  { color: '#fff', fontSize: 17, fontWeight: '800', letterSpacing: 0.3 },
});