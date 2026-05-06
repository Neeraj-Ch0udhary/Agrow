import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator, KeyboardAvoidingView, Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput, TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { askGemini } from '../lib/gemini';
type Message = {
  role: 'user' | 'ai';
  text: string;
};
<TouchableOpacity
  style={{ backgroundColor: 'red', padding: 10, margin: 10, borderRadius: 8 }}
  onPress={async () => {
    try {
      console.log('Testing API...');
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyDZBR44oZFSJbNFpXL2Ecm2uNnpxfsQAXg`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: 'Say hello' }] }]
          })
        }
      );
      const data = await res.json();
      console.log('SUCCESS:', JSON.stringify(data));
      alert('SUCCESS: ' + JSON.stringify(data).slice(0, 200));
    } catch (e: any) {
      console.log('FAILED:', e.message);
      alert('FAILED: ' + e.message);
    }
  }}>
  <Text style={{ color: 'white', textAlign: 'center' }}>Test API</Text>
</TouchableOpacity>
const QUICK_QUESTIONS = [
  'How to grow oyster mushrooms?',
  'Best crop for small land?',
  'How to sell microgreens?',
  'मशरूम कैसे उगाएं?',
];

export default function ChatScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: 'Namaste! 🌱 I am Agrow AI, your personal farming assistant. Ask me anything about modern farming, crop diseases, profits, or how to sell your harvest!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const sendMessage = async (text?: string) => {
  const question = text || input.trim();
  if (!question || loading) return;

  const userMsg: Message = { role: 'user', text: question };
  setMessages(prev => [...prev, userMsg]);
  setInput('');
  setLoading(true);

  try {
    const response = await askGemini(question);
    setMessages(prev => [...prev, { role: 'ai', text: response }]);
  } catch (error) {
    setMessages(prev => [...prev, {
      role: 'ai',
      text: 'Sorry, I could not connect right now. Please check your internet and try again.'
    }]);
  } finally {
    setLoading(false);
  }
};

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>🤖 Agrow AI</Text>
          <Text style={styles.headerSub}>Your farming assistant</Text>
        </View>
        <View style={styles.onlineDot} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

        {/* Messages */}
        <ScrollView
          ref={scrollRef}
          style={styles.messageList}
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}>

          {messages.map((msg, i) => (
            <View key={i} style={[styles.messageBubble, msg.role === 'user' ? styles.userBubble : styles.aiBubble]}>
              {msg.role === 'ai' && <Text style={styles.aiLabel}>🌱 Agrow AI</Text>}
              <Text style={[styles.messageText, msg.role === 'user' && styles.userText]}>
                {msg.text}
              </Text>
            </View>
          ))}

          {loading && (
            <View style={styles.aiBubble}>
              <Text style={styles.aiLabel}>🌱 Agrow AI</Text>
              <View style={styles.typingRow}>
                <ActivityIndicator size="small" color="#1a6b3c" />
                <Text style={styles.typingText}>Thinking...</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Quick Questions */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.quickRow}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
          {QUICK_QUESTIONS.map((q, i) => (
            <TouchableOpacity
              key={i}
              style={styles.quickChip}
              onPress={() => sendMessage(q)}>
              <Text style={styles.quickChipText}>{q}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Input */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Ask anything about farming..."
            placeholderTextColor="#aaa"
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendButton, (!input.trim() || loading) && styles.sendButtonDisabled]}
            onPress={() => sendMessage()}
            disabled={!input.trim() || loading}>
            <Text style={styles.sendButtonText}>↑</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
  onlineDot:          { width: 10, height: 10, borderRadius: 5, backgroundColor: '#4caf50', borderWidth: 2, borderColor: '#fff' },
  messageList:        { flex: 1 },
  messageBubble:      { marginBottom: 12, maxWidth: '85%' },
  aiBubble:           { backgroundColor: '#fff', padding: 14, borderRadius: 16, borderBottomLeftRadius: 4, alignSelf: 'flex-start', elevation: 1 },
  userBubble:         { backgroundColor: '#1a6b3c', padding: 14, borderRadius: 16, borderBottomRightRadius: 4, alignSelf: 'flex-end' },
  aiLabel:            { fontSize: 11, color: '#1a6b3c', fontWeight: '700', marginBottom: 6 },
  messageText:        { fontSize: 14, color: '#1a1a1a', lineHeight: 22 },
  userText:           { color: '#ffffff' },
  typingRow:          { flexDirection: 'row', alignItems: 'center', gap: 8 },
  typingText:         { fontSize: 13, color: '#888' },
  quickRow:           { maxHeight: 48, marginBottom: 8 },
  quickChip:          { backgroundColor: '#e8f5e9', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#c8e6c9' },
  quickChipText:      { fontSize: 12, color: '#2e7d32', fontWeight: '500' },
  inputRow:           { flexDirection: 'row', padding: 12, gap: 10, backgroundColor: '#fff', borderTopWidth: 0.5, borderTopColor: '#e0e0e0' },
  input:              { flex: 1, backgroundColor: '#f5f7f5', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, color: '#1a1a1a', maxHeight: 100 },
  sendButton:         { width: 44, height: 44, borderRadius: 22, backgroundColor: '#1a6b3c', alignItems: 'center', justifyContent: 'center' },
  sendButtonDisabled: { backgroundColor: '#ccc' },
  sendButtonText:     { color: '#fff', fontSize: 20, fontWeight: 'bold' },
});
