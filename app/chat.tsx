import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Animated, KeyboardAvoidingView, Platform,
  ScrollView, StyleSheet, Text, TextInput,
  TouchableOpacity, View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { askGemini } from '../lib/gemini';

type Message = {
  role: 'user' | 'ai';
  text: string;
  time: string;
};

const QUICK_QUESTIONS = [
  { label: '🍄 Mushroom farming basics', text: 'How do I start oyster mushroom farming at home?' },
  { label: '🌿 Best crop for small land', text: 'What is the best crop to grow on 100 sq ft of land?' },
  { label: '💰 How to sell microgreens', text: 'How do I find buyers for microgreens in my city?' },
  { label: '🔍 Identify plant disease', text: 'My plant leaves are turning yellow with brown spots. What disease is this?' },
  { label: '💧 Hydroponics setup', text: 'How do I set up a basic hydroponic system at home?' },
  { label: '🌾 Mandi vs direct sell', text: 'Is it better to sell at mandi or directly to restaurants?' },
  { label: '🌱 Stevia farming', text: 'How profitable is stevia farming and how do I start?' },
  { label: '🇮🇳 मशरूम कैसे उगाएं?', text: 'मशरूम की खेती कैसे शुरू करें और कहाँ बेचें?' },
];

// ── Farming keyword filter ─────────────────────────────────────────────────
const FARMING_KEYWORDS = [
  'crop', 'farm', 'plant', 'grow', 'soil', 'seed', 'harvest', 'irrigat',
  'fertiliz', 'pesticide', 'disease', 'yield', 'mushroom', 'microgreen',
  'vegetable', 'fruit', 'flower', 'herb', 'hydroponic', 'organic', 'mandi',
  'kisan', 'kheti', 'fasal', 'beej', 'khaad', 'sinchai', 'sell', 'market',
  'buyer', 'profit', 'invest', 'income', 'land', 'field', 'weather', 'rain',
  'temperature', 'compost', 'manure', 'drip', 'spray', 'neem', 'stevia',
  'lemongrass', 'capsicum', 'tomato', 'broccoli', 'zucchini', 'agrow',
  'agriculture', 'horticulture', 'cultivation', 'plantation', 'nursery',
  'sapling', 'spawn', 'substrate', 'mycelium', 'pest', 'insect', 'fungus',
  'खेती', 'फसल', 'बीज', 'मिट्टी', 'पानी', 'उगाना', 'बेचना', 'मशरूम',
  'सब्जी', 'फल', 'पेड़', 'पौधा', 'किसान', 'खाद', 'सिंचाई',
];

const isFarmingQuestion = (text: string): boolean => {
  const lower = text.toLowerCase();
  return FARMING_KEYWORDS.some(kw => lower.includes(kw));
};

const NON_FARMING_REPLY = `I'm Agrow AI — your dedicated farming assistant! 🌱

I can only help with agricultural questions such as:
- Crop selection and growing guides
- Pest and disease identification
- Soil, water and fertilizer advice
- Selling crops and finding buyers
- Profit calculations and planning
- Modern farming techniques

Please ask me something related to farming and I'll be happy to help! 🚜`;

// ── Typing dots animation ──────────────────────────────────────────────────
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
        <Animated.View
          key={i}
          style={[styles.dot, { transform: [{ translateY: dot }] }]}
        />
      ))}
    </View>
  );
}

// ── Message bubble ─────────────────────────────────────────────────────────
function MessageBubble({ msg }: { msg: Message }) {
  const isAI = msg.role === 'ai';
  return (
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
  );
}

// ── Main screen ────────────────────────────────────────────────────────────
export default function ChatScreen() {
  const router = useRouter();
  const { t }  = useTranslation();
  const scrollRef = useRef<ScrollView>(null);

  const getTime = () => new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  const [messages, setMessages] = useState<Message[]>([{
    role: 'ai',
    text: '🌱 Namaste! I\'m Agrow AI — your personal farming assistant.\n\nI can help you with:\n• Crop selection & growing guides\n• Disease identification & treatment\n• Selling crops & finding buyers\n• Profit planning & modern farming\n\nAsk me anything about farming! 🚜',
    time: getTime(),
  }]);

  const [input, setInput]   = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages, loading]);

  const sendMessage = async (text?: string) => {
    const question = (text || input).trim();
    if (!question || loading) return;

    const userMsg: Message = { role: 'user', text: question, time: getTime() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      let response: string;

      if (!isFarmingQuestion(question)) {
        // Non-farming question — reply without calling API
        await new Promise(r => setTimeout(r, 800)); // small delay for realism
        response = NON_FARMING_REPLY;
      } else {
        // Farming question — call AI with farming context
        const farmingPrompt = `You are Agrow AI, an expert agricultural assistant for Indian farmers. 
Only answer farming-related questions. Keep answers practical, concise, and helpful for small farmers in India.
Use simple language. Include specific numbers (costs, yields, prices) when possible.
If the question is in Hindi, reply in Hindi.

Question: ${question}`;
        response = await askGemini(farmingPrompt);
      }

      setMessages(prev => [...prev, { role: 'ai', text: response, time: getTime() }]);
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

  const clearChat = () => {
    setMessages([{
      role: 'ai',
      text: '🌱 Chat cleared! Ask me anything about farming.',
      time: getTime(),
    }]);
  };

  return (
    <SafeAreaView style={styles.container}>

      {/* Header */}
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

      {/* Farming-only notice */}
      <View style={styles.noticeBanner}>
        <Text style={styles.noticeText}>🌾 Farming questions only — crops, disease, selling, profit</Text>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

        {/* Messages */}
        <ScrollView
          ref={scrollRef}
          style={styles.messageList}
          contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
          showsVerticalScrollIndicator={false}>

          {messages.map((msg, i) => (
            <MessageBubble key={i} msg={msg} />
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

        {/* Quick questions */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.quickRow}
          contentContainerStyle={{ paddingHorizontal: 12, gap: 8 }}>
          {QUICK_QUESTIONS.map((q, i) => (
            <TouchableOpacity
              key={i}
              style={styles.quickChip}
              onPress={() => sendMessage(q.text)}
              disabled={loading}>
              <Text style={styles.quickChipText}>{q.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Input */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Ask about farming... (English or Hindi)"
            placeholderTextColor="#aaa"
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={500}
            onSubmitEditing={() => sendMessage()}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
            onPress={() => sendMessage()}
            disabled={!input.trim() || loading}>
            <Text style={styles.sendBtnText}>↑</Text>
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: '#f0f4f0' },
  header:           { backgroundColor: '#1a6b3c', paddingTop: 8, paddingBottom: 14, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backText:         { color: '#a8d5b5', fontSize: 15, fontWeight: '600', width: 60 },
  headerCenter:     { flex: 1, alignItems: 'center' },
  headerAvatarRow:  { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerAvatar:     { width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  headerAvatarText: { fontSize: 20 },
  headerTitle:      { fontSize: 16, fontWeight: '800', color: '#fff' },
  onlineRow:        { flexDirection: 'row', alignItems: 'center', gap: 4 },
  onlineDot:        { width: 7, height: 7, borderRadius: 4, backgroundColor: '#4caf50' },
  onlineText:       { fontSize: 10, color: '#a8d5b5' },
  clearBtn:         { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  clearBtnText:     { fontSize: 18 },
  noticeBanner:     { backgroundColor: '#e8f5e9', paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#c8e6c9' },
  noticeText:       { fontSize: 11, color: '#2e7d32', fontWeight: '600', textAlign: 'center' },
  messageList:      { flex: 1 },
  bubbleWrapper:    { flexDirection: 'row', marginBottom: 16, alignItems: 'flex-end', gap: 8 },
  aiBubbleWrapper:  { justifyContent: 'flex-start' },
  userBubbleWrapper:{ justifyContent: 'flex-end', flexDirection: 'row-reverse' },
  aiAvatar:         { width: 32, height: 32, borderRadius: 10, backgroundColor: '#1a6b3c', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  aiAvatarText:     { fontSize: 16 },
  aiLabel:          { fontSize: 10, color: '#1a6b3c', fontWeight: '700', marginBottom: 3, marginLeft: 2 },
  bubble:           { borderRadius: 18, padding: 12 },
  aiBubble:         { backgroundColor: '#fff', borderBottomLeftRadius: 4, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4 },
  userBubble:       { backgroundColor: '#1a6b3c', borderBottomRightRadius: 4 },
  bubbleText:       { fontSize: 14, lineHeight: 22 },
  aiText:           { color: '#1a1a1a' },
  userText:         { color: '#fff' },
  timeText:         { fontSize: 10, color: '#aaa', marginTop: 3, marginLeft: 2 },
  timeTextRight:    { textAlign: 'right', marginRight: 2 },
  dotsRow:          { flexDirection: 'row', gap: 4, paddingVertical: 4, paddingHorizontal: 4 },
  dot:              { width: 8, height: 8, borderRadius: 4, backgroundColor: '#1a6b3c' },
  quickRow:         { maxHeight: 44, marginVertical: 6 },
  quickChip:        { backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#c8e6c9', elevation: 1 },
  quickChipText:    { fontSize: 12, color: '#1a6b3c', fontWeight: '600' },
  inputRow:         { flexDirection: 'row', padding: 12, gap: 10, backgroundColor: '#fff', borderTopWidth: 0.5, borderTopColor: '#e0e0e0', alignItems: 'flex-end' },
  input:            { flex: 1, backgroundColor: '#f5f7f5', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, color: '#1a1a1a', maxHeight: 100, borderWidth: 1, borderColor: '#e8f5e9' },
  sendBtn:          { width: 44, height: 44, borderRadius: 22, backgroundColor: '#1a6b3c', alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled:  { backgroundColor: '#ccc' },
  sendBtnText:      { color: '#fff', fontSize: 20, fontWeight: 'bold' },
});