import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import {
  SafeAreaView, ScrollView, StyleSheet,
  Text, TouchableOpacity, View
} from 'react-native';

const TASKS = [
  { day: 'Day 1–3',   emoji: '🧹', task: 'Prepare your growing space',   desc: 'Clean the area, gather all materials and equipment needed.' },
  { day: 'Day 4–7',   emoji: '🌱', task: 'Plant your crop',               desc: 'Sow seeds or set up spawn. Follow your crop guide carefully.' },
  { day: 'Day 8–14',  emoji: '💧', task: 'Daily watering & monitoring',   desc: 'Water once or twice daily. Check for pests or unusual changes.' },
  { day: 'Day 15–30', emoji: '🌿', task: 'Growth phase check',            desc: 'Your crop is growing! Maintain humidity and temperature.' },
  { day: 'Day 31–45', emoji: '📦', task: 'Pre-harvest preparation',       desc: 'Start finding buyers. Contact local restaurants and markets.' },
  { day: 'Day 45+',   emoji: '🎉', task: 'Harvest time!',                 desc: 'Harvest carefully and package for delivery to buyers.' },
];

export default function GrowScreen() {
  const router = useRouter();
  const { t }  = useTranslation();

  return (
    <SafeAreaView style={styles.container}>

      {/* Header — matches all other screens */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>🌱 Grow</Text>
          <Text style={styles.headerSub}>Daily farming support and task guide</Text>
        </View>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* Pro tip */}
        <View style={styles.tipCard}>
          <Text style={styles.tipEmoji}>💡</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.tipTitle}>Pro Tip</Text>
            <Text style={styles.tipText}>
              Complete your Land Assessment first to get a personalized growing plan.
            </Text>
          </View>
        </View>

        {/* Quick actions */}
        <View style={styles.quickRow}>
          <TouchableOpacity style={styles.quickCard} onPress={() => router.push('/checklist')}>
            <Text style={styles.quickEmoji}>✅</Text>
            <Text style={styles.quickLabel}>Today's{'\n'}Checklist</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickCard} onPress={() => router.push('/disease')}>
            <Text style={styles.quickEmoji}>🔍</Text>
            <Text style={styles.quickLabel}>Disease{'\n'}Detector</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickCard} onPress={() => router.push('/chat')}>
            <Text style={styles.quickEmoji}>🤖</Text>
            <Text style={styles.quickLabel}>Ask{'\n'}Agrow AI</Text>
          </TouchableOpacity>
        </View>

        {/* Timeline */}
        <Text style={styles.sectionLabel}>General Farming Timeline</Text>

        {TASKS.map((task, i) => (
          <View key={i} style={styles.taskRow}>
            {/* Timeline line */}
            <View style={styles.timelineCol}>
              <View style={styles.taskDot} />
              {i < TASKS.length - 1 && <View style={styles.taskLine} />}
            </View>

            {/* Card */}
            <View style={styles.taskCard}>
              <View style={styles.taskCardTop}>
                <View style={styles.taskEmojiBox}>
                  <Text style={styles.taskEmoji}>{task.emoji}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.taskDay}>{task.day}</Text>
                  <Text style={styles.taskTitle}>{task.task}</Text>
                </View>
              </View>
              <Text style={styles.taskDesc}>{task.desc}</Text>
            </View>
          </View>
        ))}

        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: '#f0f4f0' },
  header:        { backgroundColor: '#2e7d32', paddingTop: 52, paddingBottom: 16, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backText:      { color: '#a8d5b5', fontSize: 15, fontWeight: '600' },
  headerCenter:  { alignItems: 'center' },
  headerTitle:   { fontSize: 18, fontWeight: '800', color: '#fff' },
  headerSub:     { fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  content:       { padding: 16 },
  tipCard:       { backgroundColor: '#e8f5e9', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 16, borderWidth: 1, borderColor: '#c8e6c9' },
  tipEmoji:      { fontSize: 24 },
  tipTitle:      { fontSize: 13, fontWeight: '800', color: '#2e7d32', marginBottom: 4 },
  tipText:       { fontSize: 13, color: '#388e3c', lineHeight: 18 },
  quickRow:      { flexDirection: 'row', gap: 10, marginBottom: 20 },
  quickCard:     { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 14, alignItems: 'center', elevation: 2 },
  quickEmoji:    { fontSize: 24, marginBottom: 6 },
  quickLabel:    { fontSize: 11, fontWeight: '700', color: '#1a6b3c', textAlign: 'center', lineHeight: 16 },
  sectionLabel:  { fontSize: 11, fontWeight: '700', color: '#888', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 16 },
  taskRow:       { flexDirection: 'row', marginBottom: 0 },
  timelineCol:   { alignItems: 'center', marginRight: 14, width: 16 },
  taskDot:       { width: 14, height: 14, borderRadius: 7, backgroundColor: '#2e7d32', marginTop: 18 },
  taskLine:      { width: 2, flex: 1, backgroundColor: '#c8e6c9', minHeight: 24 },
  taskCard:      { flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4 },
  taskCardTop:   { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  taskEmojiBox:  { width: 36, height: 36, borderRadius: 10, backgroundColor: '#e8f5e9', alignItems: 'center', justifyContent: 'center' },
  taskEmoji:     { fontSize: 18 },
  taskDay:       { fontSize: 11, color: '#2e7d32', fontWeight: '700', marginBottom: 2 },
  taskTitle:     { fontSize: 14, fontWeight: '700', color: '#1a1a1a' },
  taskDesc:      { fontSize: 12, color: '#666', lineHeight: 18 },
});