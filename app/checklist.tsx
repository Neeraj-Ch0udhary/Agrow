import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
    ActivityIndicator, Alert, ScrollView, StyleSheet,
    Text, TouchableOpacity, View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';

// ── Task definitions per crop ─────────────────────────────────────────────
type Task = {
  id: string;
  title: string;
  desc: string;
  emoji: string;
  category: 'watering' | 'nutrition' | 'inspection' | 'harvest' | 'selling' | 'general';
  daysRange: [number, number]; // show task between day X and day Y
};

const CROP_TASKS: Record<string, Task[]> = {
  Microgreens: [
    { id: 'mg1',  emoji: '💧', title: 'Bottom water the trays',         desc: 'Pour water into the tray base — never spray from top to avoid mold.',        category: 'watering',   daysRange: [1, 14] },
    { id: 'mg2',  emoji: '🌑', title: 'Check blackout cover',            desc: 'Ensure germination trays are fully covered for the first 2–3 days.',          category: 'general',    daysRange: [1, 3]  },
    { id: 'mg3',  emoji: '🌡️', title: 'Check temperature & humidity',   desc: 'Maintain 18–24°C and 50–70% humidity for best germination.',                  category: 'inspection', daysRange: [1, 14] },
    { id: 'mg4',  emoji: '☀️', title: 'Move trays to sunlight',          desc: 'After sprouts appear, move to 4–6 hrs sunlight or grow lights.',              category: 'general',    daysRange: [3, 14] },
    { id: 'mg5',  emoji: '🔍', title: 'Inspect for mold or damping-off', desc: 'Check soil surface for white fuzzy mold. Remove affected trays immediately.', category: 'inspection', daysRange: [3, 14] },
    { id: 'mg6',  emoji: '✂️', title: 'Harvest microgreens',             desc: 'Cut 1cm above soil level when 2–3 inches tall. Pack and refrigerate same day.', category: 'harvest',  daysRange: [7, 14] },
    { id: 'mg7',  emoji: '📦', title: 'Pack and deliver to buyers',      desc: 'Call your restaurant or café buyer and schedule fresh delivery today.',       category: 'selling',    daysRange: [7, 14] },
    { id: 'mg8',  emoji: '🪴', title: 'Prepare next batch of trays',    desc: 'Sow seeds for next cycle to maintain continuous supply.',                     category: 'general',    daysRange: [10, 14] },
  ],
  'Oyster Mushrooms': [
    { id: 'om1',  emoji: '💧', title: 'Mist growing bags 2–3 times',    desc: 'Spray water lightly on bag openings. Maintain 80–90% humidity in the room.',  category: 'watering',   daysRange: [1, 45] },
    { id: 'om2',  emoji: '🌡️', title: 'Check room temperature',         desc: 'Keep the growing room at 25–28°C. Use a thermometer to verify.',              category: 'inspection', daysRange: [1, 45] },
    { id: 'om3',  emoji: '🔍', title: 'Inspect bags for contamination', desc: 'Look for green, black or pink patches — signs of mold contamination. Remove affected bags.', category: 'inspection', daysRange: [1, 45] },
    { id: 'om4',  emoji: '🌬️', title: 'Ventilate the growing room',     desc: 'Allow fresh air for 10–15 minutes. CO2 build-up stunts mushroom growth.',    category: 'general',    daysRange: [15, 45] },
    { id: 'om5',  emoji: '🍄', title: 'Check for pin formation',        desc: 'Small mushroom pins should appear 7–10 days after bags are opened.',          category: 'inspection', daysRange: [20, 35] },
    { id: 'om6',  emoji: '✂️', title: 'Harvest mature mushrooms',       desc: 'Twist and pull gently when caps are open but edges haven\'t curled. Harvest entire cluster.', category: 'harvest', daysRange: [30, 45] },
    { id: 'om7',  emoji: '📦', title: 'Weigh and pack harvest',         desc: 'Weigh, pack in paper bags and contact buyers. Deliver within 24 hrs of harvest.', category: 'selling', daysRange: [30, 45] },
    { id: 'om8',  emoji: '🔄', title: 'Soak bags for second flush',     desc: 'Submerge spent bags in water for 8 hrs to trigger second flush.',             category: 'general',    daysRange: [35, 45] },
  ],
  Stevia: [
    { id: 'st1',  emoji: '💧', title: 'Water the stevia plants',        desc: 'Water every 2–3 days. Avoid waterlogging — stevia roots rot easily.',        category: 'watering',   daysRange: [1, 90] },
    { id: 'st2',  emoji: '🌿', title: 'Remove flowering buds',          desc: 'Pinch off any flower buds — flowering reduces leaf sweetness significantly.', category: 'general',    daysRange: [30, 90] },
    { id: 'st3',  emoji: '🔍', title: 'Check for pests',                desc: 'Inspect leaves for aphids or whiteflies. Apply neem oil spray if found.',    category: 'inspection', daysRange: [1, 90] },
    { id: 'st4',  emoji: '🌱', title: 'Apply organic fertilizer',       desc: 'Add vermicompost or organic compost around the base of plants.',              category: 'nutrition',  daysRange: [30, 90] },
    { id: 'st5',  emoji: '✂️', title: 'Harvest stevia leaves',          desc: 'Cut 2/3 of the plant when about to flower. Leave base to regrow.',           category: 'harvest',    daysRange: [75, 90] },
    { id: 'st6',  emoji: '☀️', title: 'Shade dry the harvested leaves', desc: 'Dry in shade for 2–3 days. Never sun-dry — it reduces steviol content.',     category: 'general',    daysRange: [75, 90] },
  ],
  Hydroponics: [
    { id: 'hy1',  emoji: '🧪', title: 'Check pH of nutrient solution',  desc: 'Maintain pH between 5.5–6.5. Use pH up/down solution to adjust.',            category: 'inspection', daysRange: [1, 60] },
    { id: 'hy2',  emoji: '⚡', title: 'Check EC (nutrient strength)',    desc: 'Keep EC between 1.5–2.5 mS/cm. Add nutrients if reading drops.',            category: 'inspection', daysRange: [1, 60] },
    { id: 'hy3',  emoji: '💧', title: 'Top up the water reservoir',     desc: 'Check water level and top up with fresh nutrient solution as needed.',       category: 'watering',   daysRange: [1, 60] },
    { id: 'hy4',  emoji: '🔌', title: 'Check pump is running',          desc: 'Verify the water pump and air stone are working. No pump = dead roots in hours.', category: 'inspection', daysRange: [1, 60] },
    { id: 'hy5',  emoji: '🌿', title: 'Trim overgrown roots',           desc: 'Prune excessively long roots to prevent blocking the system.',               category: 'general',    daysRange: [20, 60] },
    { id: 'hy6',  emoji: '✂️', title: 'Harvest outer leaves',           desc: 'Pick outer leaves of lettuce/herbs for continuous yield without uprooting.', category: 'harvest',    daysRange: [25, 60] },
    { id: 'hy7',  emoji: '🧹', title: 'Clean the system',               desc: 'Flush the system with plain water once a week to prevent salt buildup.',     category: 'general',    daysRange: [7, 60] },
  ],
  Lemongrass: [
    { id: 'lg1',  emoji: '💧', title: 'Water the lemongrass',           desc: 'Water every 7–10 days. Lemongrass is drought-tolerant — don\'t overwater.',  category: 'watering',   daysRange: [1, 90] },
    { id: 'lg2',  emoji: '🔍', title: 'Check for rust disease',         desc: 'Look for orange-brown rust spots on leaves. Apply copper fungicide if found.', category: 'inspection', daysRange: [1, 90] },
    { id: 'lg3',  emoji: '🌱', title: 'Apply nitrogen fertilizer',      desc: 'Add urea or organic nitrogen source to boost leaf growth once a month.',     category: 'nutrition',  daysRange: [30, 90] },
    { id: 'lg4',  emoji: '✂️', title: 'Harvest lemongrass stalks',      desc: 'Cut stalks 10cm above ground when 90+ days old. Plant regrows automatically.', category: 'harvest',  daysRange: [85, 90] },
    { id: 'lg5',  emoji: '📞', title: 'Contact distillery buyers',      desc: 'Call your local essential oil distillery or buyers to schedule fresh delivery.', category: 'selling', daysRange: [85, 90] },
  ],
};

// Default tasks for any crop not in the list
const DEFAULT_TASKS: Task[] = [
  { id: 'df1', emoji: '💧', title: 'Water your crop',              desc: 'Check soil moisture and water as needed. Avoid overwatering.',                    category: 'watering',   daysRange: [1, 999] },
  { id: 'df2', emoji: '🔍', title: 'Inspect plants for disease',   desc: 'Check leaves for spots, discoloration or pest damage. Act early.',               category: 'inspection', daysRange: [1, 999] },
  { id: 'df3', emoji: '🌿', title: 'Remove weeds',                 desc: 'Pull weeds around the plant base to reduce competition for nutrients.',           category: 'general',    daysRange: [1, 999] },
  { id: 'df4', emoji: '📸', title: 'Take progress photo',          desc: 'Document your crop growth with a photo. Track improvements over time.',           category: 'general',    daysRange: [1, 999] },
];

const CATEGORY_COLORS: Record<string, { color: string; bg: string }> = {
  watering:   { color: '#1565c0', bg: '#e3f2fd' },
  nutrition:  { color: '#2e7d32', bg: '#e8f5e9' },
  inspection: { color: '#f57f17', bg: '#fffde7' },
  harvest:    { color: '#6a1b9a', bg: '#f3e5f5' },
  selling:    { color: '#1a6b3c', bg: '#e8f5e9' },
  general:    { color: '#455a64', bg: '#f5f5f5' },
};

type CheckedMap = Record<string, boolean>;

export default function ChecklistScreen() {
  const router = useRouter();

  const [cropName, setCropName]     = useState<string | null>(null);
  const [dayNumber, setDayNumber]   = useState(0);
  const [daysLeft, setDaysLeft]     = useState(0);
  const [progress, setProgress]     = useState(0);
  const [checked, setChecked]       = useState<CheckedMap>({});
  const [loading, setLoading]       = useState(true);
  const [todayTasks, setTodayTasks] = useState<Task[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadCropData();
    }, [])
  );

  const loadCropData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data } = await supabase
        .from('profiles')
        .select('saved_crop, crop_start_date, crop_cycle_days, crop_profit_max')
        .eq('id', user.id)
        .maybeSingle();

      if (data?.saved_crop && data?.crop_start_date) {
        const start    = new Date(data.crop_start_date);
        const today    = new Date();
        const total    = data.crop_cycle_days || 30;
        const gone     = Math.max(1, Math.floor((today.getTime() - start.getTime()) / 86400000));
        const left     = Math.max(0, total - gone);
        const prog     = Math.min(100, Math.round((gone / total) * 100));

        setCropName(data.saved_crop);
        setDayNumber(gone);
        setDaysLeft(left);
        setProgress(prog);

        // Get tasks for this crop and day
        const allTasks = CROP_TASKS[data.saved_crop] ?? DEFAULT_TASKS;
        const filtered = allTasks.filter(t => gone >= t.daysRange[0] && gone <= t.daysRange[1]);
        setTodayTasks(filtered.length > 0 ? filtered : DEFAULT_TASKS.slice(0, 3));
      }
    } catch (e: any) {
      console.log('Checklist load error:', e.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = (id: string) => {
    setChecked(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const resetChecklist = () => {
    Alert.alert(
      'Reset Checklist',
      'Mark all tasks as incomplete?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', onPress: () => setChecked({}) },
      ]
    );
  };

  const completedCount = todayTasks.filter(t => checked[t.id]).length;
  const allDone = completedCount === todayTasks.length && todayTasks.length > 0;

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backBtn}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>📋 Daily Checklist</Text>
          <View style={{ width: 60 }} />
        </View>
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#1a6b3c" />
          <Text style={styles.loadingText}>Loading your tasks...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!cropName) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backBtn}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>📋 Daily Checklist</Text>
          <View style={{ width: 60 }} />
        </View>
        <View style={styles.centerBox}>
          <Text style={styles.noCropEmoji}>🌱</Text>
          <Text style={styles.noCropTitle}>No Active Crop</Text>
          <Text style={styles.noCropText}>
            Start a crop from the Land Assessment screen to get your daily farming checklist.
          </Text>
          <TouchableOpacity style={styles.startBtn} onPress={() => router.push('/land')}>
            <Text style={styles.startBtnText}>🌍 Start Land Assessment</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>📋 Daily Checklist</Text>
        <TouchableOpacity onPress={resetChecklist}>
          <Text style={styles.resetBtn}>Reset</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* Crop progress card */}
        <View style={styles.cropCard}>
          <View style={styles.cropCardTop}>
            <View>
              <Text style={styles.cropCardLabel}>Active Crop</Text>
              <Text style={styles.cropCardName}>{cropName}</Text>
            </View>
            <View style={styles.dayBadge}>
              <Text style={styles.dayBadgeNum}>Day {dayNumber}</Text>
              <Text style={styles.dayBadgeSub}>{daysLeft} days left</Text>
            </View>
          </View>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${Math.max(2, progress)}%` as any }]} />
          </View>
          <Text style={styles.progressLabel}>{progress}% of crop cycle complete</Text>
        </View>

        {/* Today's summary */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNum}>{todayTasks.length}</Text>
            <Text style={styles.summaryLabel}>Tasks Today</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={[styles.summaryNum, { color: '#1a6b3c' }]}>{completedCount}</Text>
            <Text style={styles.summaryLabel}>Completed</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={[styles.summaryNum, { color: '#f57f17' }]}>
              {todayTasks.length - completedCount}
            </Text>
            <Text style={styles.summaryLabel}>Remaining</Text>
          </View>
        </View>

        {/* All done banner */}
        {allDone && (
          <View style={styles.allDoneBanner}>
            <Text style={styles.allDoneEmoji}>🎉</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.allDoneTitle}>All tasks complete!</Text>
              <Text style={styles.allDoneSub}>Great work today, kisan. Your crop is on track!</Text>
            </View>
          </View>
        )}

        {/* Task list */}
        <Text style={styles.sectionTitle}>
          Today's Tasks — {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}
        </Text>

        {todayTasks.map((task) => {
          const done    = !!checked[task.id];
          const catCfg  = CATEGORY_COLORS[task.category];
          return (
            <TouchableOpacity
              key={task.id}
              style={[styles.taskCard, done && styles.taskCardDone]}
              onPress={() => toggleTask(task.id)}
              activeOpacity={0.8}>

              {/* Checkbox */}
              <View style={[styles.checkbox, done && styles.checkboxDone]}>
                {done && <Text style={styles.checkboxTick}>✓</Text>}
              </View>

              {/* Content */}
              <View style={styles.taskContent}>
                <View style={styles.taskTitleRow}>
                  <Text style={styles.taskEmoji}>{task.emoji}</Text>
                  <Text style={[styles.taskTitle, done && styles.taskTitleDone]}>
                    {task.title}
                  </Text>
                </View>
                {!done && (
                  <Text style={styles.taskDesc}>{task.desc}</Text>
                )}
                <View style={[styles.categoryBadge, { backgroundColor: catCfg.bg }]}>
                  <Text style={[styles.categoryText, { color: catCfg.color }]}>
                    {task.category.charAt(0).toUpperCase() + task.category.slice(1)}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        {/* AI tip */}
        <TouchableOpacity
          style={styles.aiTipCard}
          onPress={() => router.push('/chat')}>
          <Text style={styles.aiTipEmoji}>🤖</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.aiTipTitle}>Need help with a task?</Text>
            <Text style={styles.aiTipSub}>Ask Agrow AI for detailed guidance on any farming problem.</Text>
          </View>
          <Text style={styles.aiTipArrow}>›</Text>
        </TouchableOpacity>

        {/* Navigate to plan */}
        <TouchableOpacity
          style={styles.planCard}
          onPress={() => router.push('/plan')}>
          <Text style={styles.planCardEmoji}>📋</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.planCardTitle}>Generate Full Farming Plan</Text>
            <Text style={styles.planCardSub}>Get a complete month-by-month plan from Agrow AI.</Text>
          </View>
          <Text style={styles.aiTipArrow}>›</Text>
        </TouchableOpacity>

        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: '#f0f4f0' },
  header:          { backgroundColor: '#1a6b3c', paddingTop: 12, paddingBottom: 16, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn:         { color: '#a8d5b5', fontSize: 15, fontWeight: '600' },
  headerTitle:     { fontSize: 17, fontWeight: '800', color: '#fff' },
  resetBtn:        { color: '#a8d5b5', fontSize: 13, fontWeight: '600' },
  centerBox:       { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  loadingText:     { fontSize: 14, color: '#888', marginTop: 12 },
  noCropEmoji:     { fontSize: 56, marginBottom: 16 },
  noCropTitle:     { fontSize: 20, fontWeight: '800', color: '#1a1a1a', marginBottom: 8 },
  noCropText:      { fontSize: 14, color: '#666', textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  startBtn:        { backgroundColor: '#1a6b3c', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 14 },
  startBtnText:    { color: '#fff', fontWeight: '700', fontSize: 15 },
  content:         { padding: 16 },
  cropCard:        { backgroundColor: '#1a6b3c', borderRadius: 18, padding: 18, marginBottom: 14 },
  cropCardTop:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  cropCardLabel:   { fontSize: 11, color: 'rgba(255,255,255,0.7)', marginBottom: 4 },
  cropCardName:    { fontSize: 20, fontWeight: '800', color: '#fff' },
  dayBadge:        { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 14, alignItems: 'center' },
  dayBadgeNum:     { fontSize: 16, fontWeight: '800', color: '#fff' },
  dayBadgeSub:     { fontSize: 10, color: 'rgba(255,255,255,0.75)' },
  progressBg:      { height: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 4, marginBottom: 6, overflow: 'hidden' },
  progressFill:    { height: 8, backgroundColor: '#fff', borderRadius: 4 },
  progressLabel:   { fontSize: 11, color: 'rgba(255,255,255,0.75)' },
  summaryRow:      { flexDirection: 'row', gap: 10, marginBottom: 14 },
  summaryCard:     { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 14, alignItems: 'center', elevation: 2 },
  summaryNum:      { fontSize: 22, fontWeight: '800', color: '#1a1a1a', marginBottom: 2 },
  summaryLabel:    { fontSize: 10, color: '#888', fontWeight: '500' },
  allDoneBanner:   { backgroundColor: '#e8f5e9', borderRadius: 14, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14, borderWidth: 1, borderColor: '#c8e6c9' },
  allDoneEmoji:    { fontSize: 32 },
  allDoneTitle:    { fontSize: 15, fontWeight: '800', color: '#1a6b3c', marginBottom: 2 },
  allDoneSub:      { fontSize: 12, color: '#388e3c' },
  sectionTitle:    { fontSize: 13, fontWeight: '700', color: '#888', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.8 },
  taskCard:        { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 10, flexDirection: 'row', alignItems: 'flex-start', gap: 12, elevation: 2 },
  taskCardDone:    { backgroundColor: '#f5f5f5', opacity: 0.75 },
  checkbox:        { width: 26, height: 26, borderRadius: 8, borderWidth: 2, borderColor: '#1a6b3c', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 },
  checkboxDone:    { backgroundColor: '#1a6b3c', borderColor: '#1a6b3c' },
  checkboxTick:    { color: '#fff', fontSize: 14, fontWeight: '800' },
  taskContent:     { flex: 1 },
  taskTitleRow:    { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  taskEmoji:       { fontSize: 18 },
  taskTitle:       { fontSize: 14, fontWeight: '700', color: '#1a1a1a', flex: 1 },
  taskTitleDone:   { color: '#aaa', textDecorationLine: 'line-through' },
  taskDesc:        { fontSize: 12, color: '#666', lineHeight: 18, marginBottom: 8 },
  categoryBadge:   { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  categoryText:    { fontSize: 10, fontWeight: '700' },
  aiTipCard:       { backgroundColor: '#4a148c', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8, marginBottom: 10 },
  aiTipEmoji:      { fontSize: 28 },
  aiTipTitle:      { fontSize: 14, fontWeight: '800', color: '#fff', marginBottom: 2 },
  aiTipSub:        { fontSize: 11, color: 'rgba(255,255,255,0.75)' },
  aiTipArrow:      { fontSize: 22, color: 'rgba(255,255,255,0.5)', fontWeight: '300' },
  planCard:        { backgroundColor: '#fff', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, elevation: 2, borderWidth: 1, borderColor: '#e0e0e0' },
  planCardEmoji:   { fontSize: 28 },
  planCardTitle:   { fontSize: 14, fontWeight: '700', color: '#1a1a1a', marginBottom: 2 },
  planCardSub:     { fontSize: 11, color: '#888' },
});