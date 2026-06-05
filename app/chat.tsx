import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { askGemini } from '../lib/gemini';

// ── FIX 1: Voice recognition — use event listeners, not callback options ──
let SpeechRecognition: any = null;
let speechAvailable = false;
try {
  const mod = require('expo-speech-recognition');
  SpeechRecognition = mod.ExpoSpeechRecognitionModule;
  speechAvailable = true;
} catch (_) {}

type Message = {
  role: 'user' | 'ai';
  text: string;
  time: string;
  followUps?: string[];
};

const STORAGE_KEY        = 'agrow_chat_history_v2';
const MAX_STORED_MESSAGES = 60;

const QUICK_QUESTIONS = [
  { label: '🍄 Mushroom farming basics',  text: 'How do I start oyster mushroom farming at home?' },
  { label: '🌿 Best crop for small land', text: 'What is the best crop to grow on 100 sq ft of land?' },
  { label: '💰 How to sell microgreens',  text: 'How do I find buyers for microgreens in my city?' },
  { label: '🔍 Identify plant disease',   text: 'My plant leaves are turning yellow with brown spots. What disease is this?' },
  { label: '💧 Hydroponics setup',        text: 'How do I set up a basic hydroponic system at home?' },
  { label: '🌾 Mandi vs direct sell',     text: 'Is it better to sell at mandi or directly to restaurants?' },
  { label: '🌱 Stevia farming',           text: 'How profitable is stevia farming and how do I start?' },
  { label: '🇮🇳 मशरूम कैसे उगाएं?',      text: 'मशरूम की खेती कैसे शुरू करें और कहाँ बेचें?' },
];

const HINDI_CHARS = /[\u0900-\u097F]/;
const isHindi = (text: string) => HINDI_CHARS.test(text);

const FARMING_KEYWORDS = [
  'grow', 'plant', 'farm', 'cultivat', 'harvest', 'irrigat', 'sow', 'reap',
  'prune', 'graft', 'spray', 'fertiliz', 'compost', 'mulch', 'weed', 'till',
  'transplant', 'germina', 'propagat', 'water', 'feed', 'protect', 'treat',
  'crop', 'soil', 'seed', 'yield', 'field', 'land', 'acre', 'plot', 'garden',
  'greenhouse', 'nursery', 'sapling', 'organic', 'hydropon', 'aquapon',
  'aeroponic', 'polyhouse', 'drip', 'sprinkler', 'irrigation', 'drainage',
  'season', 'monsoon', 'rabi', 'kharif', 'zaid', 'sowing',
  'rice', 'wheat', 'maize', 'corn', 'barley', 'jowar', 'bajra', 'ragi',
  'millet', 'sorghum', 'oat', 'paddy', 'chawal', 'gehun', 'makka',
  'dal', 'lentil', 'pulse', 'bean', 'pea', 'chickpea', 'chana', 'moong',
  'urad', 'tur', 'arhar', 'soybean', 'groundnut', 'peanut', 'rajma',
  'vegetable', 'tomato', 'potato', 'onion', 'garlic', 'ginger', 'capsicum',
  'pepper', 'chilli', 'brinjal', 'eggplant', 'okra', 'bhindi', 'carrot',
  'radish', 'turnip', 'cabbage', 'cauliflower', 'broccoli', 'spinach',
  'palak', 'methi', 'fenugreek', 'cucumber', 'gourd', 'lauki', 'karela',
  'bittergourd', 'pumpkin', 'zucchini', 'lettuce', 'celery', 'beetroot',
  'sweetcorn', 'leek', 'colocasia', 'arbi', 'yam',
  'fruit', 'mango', 'banana', 'papaya', 'guava', 'pomegranate', 'lemon',
  'orange', 'citrus', 'grape', 'apple', 'pear', 'plum', 'peach', 'apricot',
  'strawberry', 'watermelon', 'melon', 'pineapple', 'coconut', 'avocado',
  'jackfruit', 'fig', 'mulberry', 'litchi', 'jamun', 'sitaphal',
  'sugarcane', 'cotton', 'jute', 'sunflower', 'mustard', 'sarso', 'flaxseed',
  'sesame', 'til', 'stevia', 'lemongrass', 'tulsi', 'ashwagandha', 'aloe',
  'lavender', 'rosemary', 'turmeric', 'haldi', 'coriander', 'dhania',
  'cumin', 'jeera', 'cardamom', 'saffron', 'vanilla', 'moringa', 'drumstick',
  'mushroom', 'microgreen', 'sprout', 'spawn', 'substrate', 'mycelium',
  'oyster', 'shiitake', 'button mushroom', 'flower', 'herb', 'spice',
  'fertilizer', 'manure', 'pesticide', 'insecticide', 'fungicide', 'herbicide',
  'weedicide', 'neem', 'urea', 'dap', 'npk', 'vermicompost',
  'biochar', 'lime', 'gypsum', 'boron', 'zinc', 'micronutrient',
  'disease', 'pest', 'insect', 'fungus', 'blight', 'rot', 'wilt', 'rust',
  'mildew', 'aphid', 'whitefly', 'thrip', 'mite', 'nematode', 'locust',
  'caterpillar', 'leaf curl', 'yellow', 'spot', 'infestation', 'damage',
  'sell', 'market', 'mandi', 'buyer', 'profit', 'income', 'cost', 'price',
  'export', 'fpo', 'cooperative', 'contract farming', 'agri business',
  'subsidy', 'loan', 'kcc', 'insurance', 'pm kisan', 'scheme',
  'tractor', 'pump', 'sprayer', 'harvester', 'thresher', 'plough', 'cultivator',
  'seed drill', 'mulching', 'net house', 'shade net', 'drip tape',
  'agrow', 'agriculture', 'horticulture', 'plantation', 'agri', 'kisan', 'farmer', 'farming',
  'खेती', 'फसल', 'बीज', 'मिट्टी', 'पानी', 'उगाना', 'बेचना', 'मशरूम',
  'सब्जी', 'फल', 'पेड़', 'पौधा', 'किसान', 'खाद', 'सिंचाई', 'चावल',
  'गेहूं', 'मक्का', 'दाल', 'प्याज', 'आलू', 'टमाटर', 'मिर्च', 'धान',
  'बाजरा', 'ज्वार', 'रागी', 'गन्ना', 'कपास', 'सरसों', 'हल्दी', 'अदरक',
  'लहसुन', 'कीट', 'रोग', 'उर्वरक', 'कीटनाशक', 'मंडी', 'मुनाफा',
];

const CLEARLY_NON_FARMING = [
  'cricket', 'football', 'movie', 'film', 'song', 'music', 'bollywood',
  'politics', 'stock market', 'share market', 'bitcoin',
  'coding', 'programming', 'software', 'game', 'recipe', 'cook',
  'relationship', 'love', 'marriage', 'exam', 'study', 'physics', 'chemistry', 'history',
];

const isFarmingQuestion = (text: string): boolean => {
  const lower = text.toLowerCase();
  if (CLEARLY_NON_FARMING.some(kw => lower.includes(kw))) return false;
  if (FARMING_KEYWORDS.some(kw => lower.includes(kw))) return true;
  const wordCount = text.trim().split(/\s+/).length;
  if (wordCount <= 8 && /^(how|what|when|why|which|where|kaise|kya|kab|kaun|कैसे|क्या|कब|कहाँ)/i.test(text.trim())) {
    return true;
  }
  return false;
};

const NON_FARMING_REPLY_EN = `I'm Agrow AI — your dedicated farming assistant! 🌱

I can only help with agricultural questions such as:
• Crop selection and growing guides
• Pest and disease identification
• Soil, water and fertilizer advice
• Selling crops and finding buyers
• Profit calculations and planning
• Modern farming techniques

Please ask me something related to farming! 🚜`;

const NON_FARMING_REPLY_HI = `मैं Agrow AI हूँ — आपका खेती सहायक! 🌱

मैं केवल कृषि संबंधित प्रश्नों में मदद कर सकता हूँ:
• फसल चयन और उगाने की जानकारी
• कीट और रोग पहचान
• मिट्टी, पानी और खाद की सलाह
• फसल बेचना और खरीदार ढूंढना
• मुनाफे की योजना और आधुनिक खेती

कृपया खेती से जुड़ा कोई सवाल पूछें! 🚜`;

const buildFarmingPrompt = (question: string, replyInHindi: boolean): string => {
  if (replyInHindi) {
    return `आप Agrow AI हैं, भारतीय किसानों के लिए एक कृषि विशेषज्ञ।
केवल खेती से जुड़े सवालों के जवाब दें। जवाब सरल हिंदी में दें।
जवाब व्यावहारिक और संक्षिप्त रखें। जहाँ हो सके वहाँ संख्याएं (लागत, उपज, कीमत) बताएं।

सवाल: ${question}`;
  }
  return `You are Agrow AI, an expert agricultural assistant for Indian farmers.
Only answer farming-related questions. Keep answers practical, concise, and helpful for small farmers in India.
Use simple language. Include specific numbers (costs, yields, prices) when possible.

Question: ${question}`;
};

const buildFollowUpPrompt = (answer: string, inHindi: boolean): string => {
  if (inHindi) {
    return `नीचे दिए गए खेती के जवाब के आधार पर, किसान के लिए 3 छोटे follow-up सवाल बनाएं।
केवल JSON array दें: ["सवाल 1?", "सवाल 2?", "सवाल 3?"]

जवाब: ${answer.slice(0, 500)}`;
  }
  return `Based on this farming answer, generate 3 short practical follow-up questions a farmer might ask.
Return ONLY a JSON array: ["Question 1?", "Question 2?", "Question 3?"]
Each question under 10 words.

Answer: ${answer.slice(0, 500)}`;
};

const parseFollowUps = (raw: string): string[] => {
  try {
    const match = raw.match(/\[.*?\]/s);
    if (match) return JSON.parse(match[0]).slice(0, 3);
  } catch (_) {}
  return [];
};

// ── Typing dots ────────────────────────────────────────────────────────────
function TypingDots() {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: -6, duration: 300, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0,  duration: 300, useNativeDriver: true }),
          Animated.delay(600),
        ])
      ).start();
    animate(dot1, 0);
    animate(dot2, 150);
    animate(dot3, 300);
  }, []);

  return (
    <View style={styles.dotsRow}>
      {[dot1, dot2, dot3].map((dot, i) => (
        <Animated.View key={i} style={[styles.dot, { transform: [{ translateY: dot }] }]} />
      ))}
    </View>
  );
}

// ── Follow-up chips ────────────────────────────────────────────────────────
function FollowUpChips({ questions, onPress, disabled }: {
  questions: string[];
  onPress: (q: string) => void;
  disabled: boolean;
}) {
  if (!questions || questions.length === 0) return null;
  return (
    <View style={styles.followUpContainer}>
      <Text style={styles.followUpLabel}>💡 Ask next:</Text>
      {questions.map((q, i) => (
        <TouchableOpacity
          key={i}
          style={[styles.followUpChip, disabled && { opacity: 0.5 }]}
          onPress={() => onPress(q)}
          disabled={disabled}
        >
          <Text style={styles.followUpChipText}>{q}</Text>
          <Text style={styles.followUpArrow}>→</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ── Message bubble ─────────────────────────────────────────────────────────
function MessageBubble({ msg, onFollowUp, loading }: {
  msg: Message;
  onFollowUp: (q: string) => void;
  loading: boolean;
}) {
  const isAI = msg.role === 'ai';
  return (
    <View>
      <View style={[styles.bubbleWrapper, isAI ? styles.aiBubbleWrapper : styles.userBubbleWrapper]}>
        {isAI && (
          <View style={styles.aiAvatar}>
            <Text style={styles.aiAvatarText}>🌱</Text>
          </View>
        )}
        <View style={{ maxWidth: '80%' }}>
          {isAI && <Text style={styles.aiLabel}>Agrow AI</Text>}
          <View style={[styles.bubble, isAI ? styles.aiBubble : styles.userBubble]}>
            <Text style={[styles.bubbleText, isAI ? styles.aiText : styles.userText]}>
              {msg.text}
            </Text>
          </View>
          <Text style={[styles.timeText, !isAI && styles.timeTextRight]}>{msg.time}</Text>
        </View>
      </View>
      {isAI && msg.followUps && msg.followUps.length > 0 && (
        <FollowUpChips questions={msg.followUps} onPress={onFollowUp} disabled={loading} />
      )}
    </View>
  );
}

// ── Main screen ────────────────────────────────────────────────────────────
export default function ChatScreen() {
  const router    = useRouter();
  const { t }     = useTranslation();
  const scrollRef = useRef<ScrollView>(null);

  const getTime = () =>
    new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  const INITIAL_MESSAGE: Message = {
    role: 'ai',
    text: '🌱 Namaste! I\'m Agrow AI — your personal farming assistant.\n\nI can help you with:\n• Crop selection & growing guides\n• Disease identification & treatment\n• Selling crops & finding buyers\n• Profit planning & modern farming\n\nAsk me anything about farming — in Hindi or English! 🚜',
    time: getTime(),
  };

  const [messages, setMessages]           = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput]                 = useState('');
  const [loading, setLoading]             = useState(false);
  const [isListening, setIsListening]     = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);

  // ── FIX 2: Evaluate mic availability once on mount, not at render time ──
  const [hasMic] = useState(() => speechAvailable);

  // ── FIX 3: Safe JSON parse with fallback ──────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed: Message[] = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) setMessages(parsed);
        }
      } catch (_) {
        // Corrupted storage — silently start fresh instead of crashing
        await AsyncStorage.removeItem(STORAGE_KEY);
      } finally {
        setHistoryLoaded(true);
      }
    })();
  }, []);

  // Persist history
  useEffect(() => {
    if (!historyLoaded) return;
    const toStore = messages.slice(-MAX_STORED_MESSAGES);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toStore)).catch(() => {});
  }, [messages, historyLoaded]);

  // Auto-scroll
  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 150);
  }, [messages, loading]);

  // Scroll on keyboard show
  useEffect(() => {
    const sub = Keyboard.addListener('keyboardDidShow', () => {
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    });
    return () => sub.remove();
  }, []);

  // ── FIX 4: Voice input — use addListener API, not callback options ──────
  const startVoiceInput = async () => {
    if (!SpeechRecognition) return;
    try {
      const { granted } = await SpeechRecognition.requestPermissionsAsync();
      if (!granted) return;
      setIsListening(true);

      // Attach event listeners before starting
      const resultSub = SpeechRecognition.addListener('result', (event: any) => {
        const transcript = event?.results?.[0]?.[0]?.transcript ?? '';
        if (transcript) setInput(prev => prev + transcript);
        setIsListening(false);
        resultSub.remove();
        errorSub.remove();
        endSub.remove();
      });
      const errorSub = SpeechRecognition.addListener('error', () => {
        setIsListening(false);
        resultSub.remove();
        errorSub.remove();
        endSub.remove();
      });
      const endSub = SpeechRecognition.addListener('end', () => {
        setIsListening(false);
        resultSub.remove();
        errorSub.remove();
        endSub.remove();
      });

      SpeechRecognition.start({ lang: 'hi-IN', interimResults: false, maxAlternatives: 1 });
    } catch (_) {
      setIsListening(false);
    }
  };

  const stopVoiceInput = () => {
    if (!SpeechRecognition) return;
    SpeechRecognition.stop();
    setIsListening(false);
  };

  // ── Send message ──────────────────────────────────────────────────────
  const sendMessage = async (text?: string) => {
    const question = (text || input).trim();
    if (!question || loading) return;

    const hindi   = isHindi(question);
    const userMsg: Message = { role: 'user', text: question, time: getTime() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    Keyboard.dismiss();

    try {
      let response: string;
      let followUps: string[] = [];

      if (!isFarmingQuestion(question)) {
        // Non-farming: reply immediately, skip follow-up API call
        await new Promise(r => setTimeout(r, 800));
        response = hindi ? NON_FARMING_REPLY_HI : NON_FARMING_REPLY_EN;
      } else {
        response = await askGemini(buildFarmingPrompt(question, hindi));

        // ── FIX 5: Only fetch follow-ups for farming replies ────────────
        try {
          const fuRaw = await askGemini(buildFollowUpPrompt(response, hindi));
          followUps   = parseFollowUps(fuRaw);
        } catch (_) {}
      }

      setMessages(prev => [...prev, { role: 'ai', text: response, time: getTime(), followUps }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'ai',
        text: '❌ Could not connect. Please check your internet and try again.',
        time: getTime(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  // ── FIX 6: clearChat — set historyLoaded guard so persist effect fires correctly ──
  const clearChat = async () => {
    const fresh: Message[] = [{
      role: 'ai',
      text: '🌱 Chat cleared! Ask me anything about farming.',
      time: getTime(),
    }];
    setMessages(fresh);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
    } catch (_) {}
  };

  // ── FIX 7: iOS keyboard offset — measure actual header + notice height ──
  // Header (~62) + notice banner (~36) + SafeAreaView top (~44) ≈ 0 offset needed
  // because SafeAreaView edges={['top']} already accounts for status bar.
  // On iOS, padding behavior handles it from the bottom of the safe area.
  const kbOffset = Platform.OS === 'ios' ? 0 : 0;

  return (
    // ── FIX 8: Add bottom edge to SafeAreaView so input clears home indicator ──
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.headerAvatarRow}>
            <View style={styles.headerAvatar}>
              <Text style={styles.headerAvatarText}>🌱</Text>
            </View>
            <View>
              <Text style={styles.headerTitle}>Agrow AI</Text>
              <View style={styles.onlineRow}>
                <View style={styles.onlineDot} />
                <Text style={styles.onlineText}>Farming Expert • Always Online</Text>
              </View>
            </View>
          </View>
        </View>
        <TouchableOpacity onPress={clearChat} style={styles.clearBtn}>
          <Text style={styles.clearBtnText}>🗑️</Text>
        </TouchableOpacity>
      </View>

      {/* ── Notice ── */}
      <View style={styles.noticeBanner}>
        <Text style={styles.noticeText}>🌾 Farming questions only — Hindi & English supported 🇮🇳</Text>
      </View>

      {/* ── FIX 9: KeyboardAvoidingView — Android uses 'height', iOS 'padding' ── */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={kbOffset}
      >
        {/* Messages */}
        <ScrollView
          ref={scrollRef}
          style={styles.messageList}
          contentContainerStyle={styles.messageListContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          // ── FIX 10: Use 'on-drag' on Android — 'interactive' conflicts with KAV ──
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
        >
          {!historyLoaded && (
            <Text style={styles.loadingHistory}>Loading chat history…</Text>
          )}

          {messages.map((msg, i) => (
            <MessageBubble
              key={i}
              msg={msg}
              onFollowUp={sendMessage}
              loading={loading}
            />
          ))}

          {loading && (
            <View style={styles.aiBubbleWrapper}>
              <View style={styles.aiAvatar}>
                <Text style={styles.aiAvatarText}>🌱</Text>
              </View>
              <View>
                <Text style={styles.aiLabel}>Agrow AI</Text>
                <View style={[styles.bubble, styles.aiBubble]}>
                  <TypingDots />
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Quick questions strip */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.quickRow}
          contentContainerStyle={styles.quickRowContent}
          keyboardShouldPersistTaps="handled"
        >
          {QUICK_QUESTIONS.map((q, i) => (
            <TouchableOpacity
              key={i}
              style={styles.quickChip}
              onPress={() => sendMessage(q.text)}
              disabled={loading}
            >
              <Text style={styles.quickChipText}>{q.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Input row */}
        <View style={styles.inputRow}>
          {hasMic && (
            <TouchableOpacity
              style={[styles.micBtn, isListening && styles.micBtnActive]}
              onPress={isListening ? stopVoiceInput : startVoiceInput}
              disabled={loading}
            >
              <Text style={styles.micBtnText}>{isListening ? '⏹' : '🎤'}</Text>
            </TouchableOpacity>
          )}
          <TextInput
            style={styles.input}
            placeholder={hasMic
              ? 'Type or speak in Hindi / English…'
              : 'Ask about farming… (English or Hindi)'}
            placeholderTextColor="#aaa"
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={500}
            returnKeyType="send"
            blurOnSubmit={false}
            onSubmitEditing={() => sendMessage()}
            onFocus={() => {
              setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 300);
            }}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
            onPress={() => sendMessage()}
            disabled={!input.trim() || loading}
          >
            <Text style={styles.sendBtnText}>↑</Text>
          </TouchableOpacity>
        </View>

        {isListening && (
          <View style={styles.listeningBanner}>
            <Text style={styles.listeningText}>🎙️ सुन रहा हूँ… / Listening… tap ⏹ to stop</Text>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:          { flex: 1, backgroundColor: '#f0f4f0' },
  flex:               { flex: 1 },

  header:             { backgroundColor: '#1a6b3c', paddingTop: 8, paddingBottom: 14, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backText:           { color: '#a8d5b5', fontSize: 15, fontWeight: '600', width: 60 },
  headerCenter:       { flex: 1, alignItems: 'center' },
  headerAvatarRow:    { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerAvatar:       { width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  headerAvatarText:   { fontSize: 20 },
  headerTitle:        { fontSize: 16, fontWeight: '800', color: '#fff' },
  onlineRow:          { flexDirection: 'row', alignItems: 'center', gap: 4 },
  onlineDot:          { width: 7, height: 7, borderRadius: 4, backgroundColor: '#4caf50' },
  onlineText:         { fontSize: 10, color: '#a8d5b5' },
  clearBtn:           { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  clearBtnText:       { fontSize: 18 },

  noticeBanner:       { backgroundColor: '#e8f5e9', paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#c8e6c9' },
  noticeText:         { fontSize: 11, color: '#2e7d32', fontWeight: '600', textAlign: 'center' },

  messageList:        { flex: 1 },
  messageListContent: { padding: 16, paddingBottom: 12 },
  loadingHistory:     { textAlign: 'center', fontSize: 12, color: '#aaa', marginBottom: 12 },
  bubbleWrapper:      { flexDirection: 'row', marginBottom: 16, alignItems: 'flex-end', gap: 8 },
  aiBubbleWrapper:    { justifyContent: 'flex-start' },
  userBubbleWrapper:  { justifyContent: 'flex-end', flexDirection: 'row-reverse' },
  aiAvatar:           { width: 32, height: 32, borderRadius: 10, backgroundColor: '#1a6b3c', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  aiAvatarText:       { fontSize: 16 },
  aiLabel:            { fontSize: 10, color: '#1a6b3c', fontWeight: '700', marginBottom: 3, marginLeft: 2 },
  bubble:             { borderRadius: 18, padding: 12 },
  aiBubble:           { backgroundColor: '#fff', borderBottomLeftRadius: 4, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4 },
  userBubble:         { backgroundColor: '#1a6b3c', borderBottomRightRadius: 4 },
  bubbleText:         { fontSize: 14, lineHeight: 22 },
  aiText:             { color: '#1a1a1a' },
  userText:           { color: '#fff' },
  timeText:           { fontSize: 10, color: '#aaa', marginTop: 3, marginLeft: 2 },
  timeTextRight:      { textAlign: 'right', marginRight: 2 },

  dotsRow:            { flexDirection: 'row', gap: 4, paddingVertical: 4, paddingHorizontal: 4 },
  dot:                { width: 8, height: 8, borderRadius: 4, backgroundColor: '#1a6b3c' },

  followUpContainer:  { marginLeft: 48, marginTop: -8, marginBottom: 16, gap: 6 },
  followUpLabel:      { fontSize: 10, color: '#888', fontWeight: '600', marginBottom: 2 },
  followUpChip:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f0f8f2', borderWidth: 1, borderColor: '#b2dfdb', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  followUpChipText:   { fontSize: 13, color: '#1a6b3c', flex: 1, lineHeight: 18 },
  followUpArrow:      { fontSize: 13, color: '#1a6b3c', marginLeft: 6 },

  quickRow:           { maxHeight: 44, marginVertical: 6 },
  quickRowContent:    { paddingHorizontal: 12, gap: 8 },
  quickChip:          { backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#c8e6c9', elevation: 1 },
  quickChipText:      { fontSize: 12, color: '#1a6b3c', fontWeight: '600' },

  inputRow:           { flexDirection: 'row', padding: 12, gap: 8, backgroundColor: '#fff', borderTopWidth: 0.5, borderTopColor: '#e0e0e0', alignItems: 'flex-end' },
  micBtn:             { width: 44, height: 44, borderRadius: 22, backgroundColor: '#e8f5e9', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#c8e6c9' },
  micBtnActive:       { backgroundColor: '#ffebee', borderColor: '#ef9a9a' },
  micBtnText:         { fontSize: 20 },
  input:              { flex: 1, backgroundColor: '#f5f7f5', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, color: '#1a1a1a', maxHeight: 100, borderWidth: 1, borderColor: '#e8f5e9' },
  sendBtn:            { width: 44, height: 44, borderRadius: 22, backgroundColor: '#1a6b3c', alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled:    { backgroundColor: '#ccc' },
  sendBtnText:        { color: '#fff', fontSize: 20, fontWeight: 'bold' },

  listeningBanner:    { backgroundColor: '#fff3e0', paddingVertical: 6, paddingHorizontal: 16, borderTopWidth: 0.5, borderTopColor: '#ffe0b2' },
  listeningText:      { fontSize: 12, color: '#e65100', textAlign: 'center', fontWeight: '600' },
});