import { useRouter } from 'expo-router';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const TASKS = [
  { day: 'Day 1–3', task: 'Prepare your growing space', desc: 'Clean the area, gather all materials and equipment needed.', done: false },
  { day: 'Day 4–7', task: 'Plant your crop', desc: 'Sow seeds or set up spawn. Follow your crop guide carefully.', done: false },
  { day: 'Day 8–14', task: 'Daily watering & monitoring', desc: 'Water once or twice daily. Check for pests or unusual changes.', done: false },
  { day: 'Day 15–30', task: 'Growth phase check', desc: 'Your crop is growing! Maintain humidity and temperature.', done: false },
  { day: 'Day 31–45', task: 'Pre-harvest preparation', desc: 'Start finding buyers. Contact local restaurants and markets.', done: false },
  { day: 'Day 45+', task: 'Harvest time! 🎉', desc: 'Harvest carefully and package for delivery to buyers.', done: false },
];

export default function GrowScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.headerSection}>
          <Text style={styles.headerTitle}>🌱 Grow</Text>
          <Text style={styles.headerSub}>Your daily farming support and task guide</Text>
        </View>

        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>💡 Pro Tip</Text>
          <Text style={styles.tipText}>Complete your Land Assessment first to get a personalized growing plan for your specific crop.</Text>
        </View>

        <Text style={styles.sectionLabel}>General Farming Timeline</Text>
        {TASKS.map((task, i) => (
          <View key={i} style={styles.taskCard}>
            <View style={styles.taskLeft}>
              <View style={styles.taskDot} />
              {i < TASKS.length - 1 && <View style={styles.taskLine} />}
            </View>
            <View style={styles.taskContent}>
              <Text style={styles.taskDay}>{task.day}</Text>
              <Text style={styles.taskTitle}>{task.task}</Text>
              <Text style={styles.taskDesc}>{task.desc}</Text>
            </View>
          </View>
        ))}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7f5' },
  backButton: { padding: 16, paddingTop: 52 },
  backText: { fontSize: 16, color: '#1a6b3c', fontWeight: '600' },
  headerSection: { paddingHorizontal: 20, paddingBottom: 16 },
  headerTitle: { fontSize: 24, fontWeight: '700', color: '#1a1a1a', marginBottom: 6 },
  headerSub: { fontSize: 14, color: '#888' },
  tipCard: { backgroundColor: '#e8f5e9', marginHorizontal: 16, borderRadius: 12, padding: 16, marginBottom: 20 },
  tipTitle: { fontSize: 14, fontWeight: '700', color: '#2e7d32', marginBottom: 6 },
  tipText: { fontSize: 13, color: '#388e3c', lineHeight: 20 },
  sectionLabel: { fontSize: 14, fontWeight: '600', color: '#888', paddingHorizontal: 20, marginBottom: 12 },
  taskCard: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 0 },
  taskLeft: { alignItems: 'center', marginRight: 14, width: 20 },
  taskDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#1a6b3c', marginTop: 4 },
  taskLine: { width: 2, flex: 1, backgroundColor: '#c8e6c9', marginTop: 4, marginBottom: -4, minHeight: 40 },
  taskContent: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 12, elevation: 1 },
  taskDay: { fontSize: 11, color: '#1a6b3c', fontWeight: '700', marginBottom: 4 },
  taskTitle: { fontSize: 15, fontWeight: '600', color: '#1a1a1a', marginBottom: 4 },
  taskDesc: { fontSize: 13, color: '#666', lineHeight: 18 },
});