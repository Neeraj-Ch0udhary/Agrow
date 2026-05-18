import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator, Alert, Image, ScrollView, StyleSheet,
  Text, TouchableOpacity, View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';

const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY!;

// ── Types ─────────────────────────────────────────────────────────────────
type Task = {
  id: string;
  title: string;
  desc: string;
  emoji: string;
  category: 'watering' | 'nutrition' | 'inspection' | 'harvest' | 'selling' | 'general';
  daysRange: [number, number];
  priority: 'high' | 'normal';
};

type CheckedMap = Record<string, boolean>;

// ── Properly phased crop tasks ────────────────────────────────────────────
const CROP_TASKS: Record<string, Task[]> = {
  Microgreens: [
    // Phase 1: Germination (Day 1–3)
    { id: 'mg_p1_1', emoji: '🌑', title: 'Cover trays with blackout dome',      desc: 'Place cardboard or dome over seeded trays. Complete darkness triggers germination.',   category: 'general',    daysRange: [1, 3],   priority: 'high'   },
    { id: 'mg_p1_2', emoji: '💧', title: 'Mist seeds lightly',                  desc: 'Lightly spray seeds once. Don\'t soak — just enough to keep moisture.',                category: 'watering',   daysRange: [1, 3],   priority: 'high'   },
    { id: 'mg_p1_3', emoji: '🌡️', title: 'Check room temperature',              desc: 'Maintain 18–24°C. Too cold = slow germination. Too hot = mold.',                        category: 'inspection', daysRange: [1, 3],   priority: 'normal' },

    // Phase 2: Sprouting (Day 4–6)
    { id: 'mg_p2_1', emoji: '☀️', title: 'Remove blackout cover',               desc: 'Sprouts should be 1–2cm tall. Remove cover and move to indirect light.',               category: 'general',    daysRange: [4, 6],   priority: 'high'   },
    { id: 'mg_p2_2', emoji: '💧', title: 'Begin bottom watering',               desc: 'Pour water into tray base (not on leaves). This prevents damping-off mold.',           category: 'watering',   daysRange: [4, 6],   priority: 'high'   },
    { id: 'mg_p2_3', emoji: '🔍', title: 'Check for damping-off (white mold)',  desc: 'Look for fuzzy white at soil level. If found, increase airflow immediately.',          category: 'inspection', daysRange: [4, 6],   priority: 'high'   },

    // Phase 3: Growing (Day 7–9)
    { id: 'mg_p3_1', emoji: '☀️', title: 'Move trays to full sunlight',         desc: 'Microgreens now need 4–6 hours of direct sunlight or 12hr grow lights.',              category: 'general',    daysRange: [7, 9],   priority: 'normal' },
    { id: 'mg_p3_2', emoji: '💧', title: 'Bottom water once daily',             desc: 'Water from below every morning. Check that no standing water remains.',               category: 'watering',   daysRange: [7, 9],   priority: 'normal' },
    { id: 'mg_p3_3', emoji: '📏', title: 'Measure height — should be 5–7cm',   desc: 'If shorter, increase light. If pale/yellow, add light or check watering.',           category: 'inspection', daysRange: [7, 9],   priority: 'normal' },

    // Phase 4: Pre-harvest (Day 10–12)
    { id: 'mg_p4_1', emoji: '🔍', title: 'Check harvest readiness',             desc: 'Microgreens ready when first true leaves appear (2–3 inches tall).',                  category: 'inspection', daysRange: [10, 12], priority: 'high'   },
    { id: 'mg_p4_2', emoji: '📞', title: 'Call buyers — confirm delivery date', desc: 'Contact restaurant or cafe buyer today. Microgreens must be delivered fresh.',        category: 'selling',    daysRange: [10, 12], priority: 'high'   },
    { id: 'mg_p4_3', emoji: '📦', title: 'Prepare packaging materials',         desc: 'Get clamshell boxes or zip-lock bags ready. Label with weight and date.',             category: 'general',    daysRange: [10, 12], priority: 'normal' },

    // Phase 5: Harvest (Day 13–14)
    { id: 'mg_p5_1', emoji: '✂️', title: 'Harvest — cut 1cm above soil',       desc: 'Use clean scissors. Cut in morning for max freshness. Refrigerate within 1 hour.',   category: 'harvest',    daysRange: [13, 14], priority: 'high'   },
    { id: 'mg_p5_2', emoji: '⚖️', title: 'Weigh and pack harvest',              desc: 'Weigh in 100g or 200g portions. Pack in boxes and label clearly.',                    category: 'harvest',    daysRange: [13, 14], priority: 'high'   },
    { id: 'mg_p5_3', emoji: '📦', title: 'Deliver to buyers',                   desc: 'Deliver within 4 hours of harvest. Keep refrigerated during transport.',             category: 'selling',    daysRange: [13, 14], priority: 'high'   },
    { id: 'mg_p5_4', emoji: '🪴', title: 'Prepare next batch immediately',     desc: 'Sow new trays today to maintain continuous weekly supply.',                           category: 'general',    daysRange: [13, 14], priority: 'normal' },
  ],

  'Oyster Mushrooms': [
    // Phase 1: Incubation (Day 1–15)
    { id: 'om_p1_1', emoji: '🌡️', title: 'Maintain dark room at 25–28°C',      desc: 'Bags need complete darkness during incubation. Check temperature twice daily.',       category: 'inspection', daysRange: [1, 15],  priority: 'high'   },
    { id: 'om_p1_2', emoji: '🔍', title: 'Inspect bags for contamination',      desc: 'Look for green, pink, or black patches on bags. Remove contaminated bags immediately.', category: 'inspection', daysRange: [1, 15],  priority: 'high'   },
    { id: 'om_p1_3', emoji: '📝', title: 'Record mycelium growth progress',     desc: 'Bags should show 20% white mycelium by Day 5, 50% by Day 10, 100% by Day 15.',      category: 'general',    daysRange: [1, 15],  priority: 'normal' },

    // Phase 2: Pinning initiation (Day 16–25)
    { id: 'om_p2_1', emoji: '🌬️', title: 'Start daily ventilation 15 mins',    desc: 'Open room for 15 minutes. Fresh air triggers pinning. CO2 buildup prevents it.',     category: 'general',    daysRange: [16, 25], priority: 'high'   },
    { id: 'om_p2_2', emoji: '💧', title: 'Mist bags 2–3 times daily',           desc: 'Spray water mist on bag openings. Never soak — just keep humidity at 80–90%.',      category: 'watering',   daysRange: [16, 25], priority: 'high'   },
    { id: 'om_p2_3', emoji: '🍄', title: 'Watch for pin formation',             desc: 'Tiny mushroom pins (1–3mm) should appear. This confirms fruiting has started.',      category: 'inspection', daysRange: [16, 25], priority: 'high'   },
    { id: 'om_p2_4', emoji: '🌡️', title: 'Drop temperature to 22–25°C',        desc: 'Cooler temp helps trigger fruiting. Open windows at night if summer.',              category: 'inspection', daysRange: [16, 25], priority: 'normal' },

    // Phase 3: Fruiting (Day 26–35)
    { id: 'om_p3_1', emoji: '💧', title: 'Increase misting to 4x daily',        desc: 'Growing mushrooms need more moisture. Mist every 4–6 hours.',                        category: 'watering',   daysRange: [26, 35], priority: 'high'   },
    { id: 'om_p3_2', emoji: '🌬️', title: 'Ventilate twice daily now',           desc: 'More fruiting bodies = more CO2. Ventilate morning and evening.',                   category: 'general',    daysRange: [26, 35], priority: 'normal' },
    { id: 'om_p3_3', emoji: '📏', title: 'Monitor mushroom cap size',           desc: 'Caps should be 5–12cm when ready. Check daily after pin formation.',                 category: 'inspection', daysRange: [26, 35], priority: 'normal' },
    { id: 'om_p3_4', emoji: '📞', title: 'Contact buyers — harvest coming',     desc: 'Inform restaurants and vegetable vendors. Mushrooms must be sold within 2 days.',    category: 'selling',    daysRange: [26, 35], priority: 'high'   },

    // Phase 4: Harvest (Day 36–45)
    { id: 'om_p4_1', emoji: '✂️', title: 'Harvest before caps curl up',        desc: 'Twist entire cluster at base. Harvest when caps open but edges still flat.',         category: 'harvest',    daysRange: [36, 45], priority: 'high'   },
    { id: 'om_p4_2', emoji: '⚖️', title: 'Weigh and pack mushrooms',            desc: 'Weigh in 250g or 500g packs. Use paper bags — plastic causes sweating.',             category: 'harvest',    daysRange: [36, 45], priority: 'high'   },
    { id: 'om_p4_3', emoji: '📦', title: 'Deliver within 24 hours',             desc: 'Mushrooms degrade fast. Deliver same day or store at 4°C max 24 hrs.',              category: 'selling',    daysRange: [36, 45], priority: 'high'   },
    { id: 'om_p4_4', emoji: '🔄', title: 'Soak bags for 2nd flush',             desc: 'Submerge harvested bags in water for 8 hours. This triggers a second harvest.',     category: 'general',    daysRange: [40, 45], priority: 'normal' },
  ],

  Stevia: [
    // Phase 1: Establishment (Day 1–30)
    { id: 'st_p1_1', emoji: '💧', title: 'Water gently every 2 days',           desc: 'New saplings need consistent moisture. Water at base, not on leaves.',               category: 'watering',   daysRange: [1, 30],  priority: 'high'   },
    { id: 'st_p1_2', emoji: '🌡️', title: 'Check for wilting or stress',         desc: 'Wilting in first week means too much or too little water. Check soil moisture.',     category: 'inspection', daysRange: [1, 30],  priority: 'high'   },
    { id: 'st_p1_3', emoji: '🌿', title: 'Add mulch around plant base',         desc: 'Mulch retains moisture and prevents weed growth around young plants.',               category: 'general',    daysRange: [1, 14],  priority: 'normal' },

    // Phase 2: Growth (Day 31–60)
    { id: 'st_p2_1', emoji: '🌿', title: 'Pinch off flowering buds',            desc: 'Remove any buds immediately — flowering drops leaf sweetness by 40%.',              category: 'general',    daysRange: [31, 60], priority: 'high'   },
    { id: 'st_p2_2', emoji: '🌱', title: 'Apply vermicompost fertilizer',       desc: 'Add 100g vermicompost per plant. Boosts leaf growth and stevioside content.',       category: 'nutrition',  daysRange: [31, 60], priority: 'normal' },
    { id: 'st_p2_3', emoji: '🔍', title: 'Check for aphids/whiteflies',         desc: 'Inspect undersides of leaves. Apply neem oil spray if pests found.',                category: 'inspection', daysRange: [31, 60], priority: 'normal' },

    // Phase 3: Pre-harvest (Day 61–80)
    { id: 'st_p3_1', emoji: '🔍', title: 'Watch for flowering — harvest signal',desc: 'When flower buds appear, harvest is due within 7–10 days. This is peak sweetness.', category: 'inspection', daysRange: [61, 80], priority: 'high'   },
    { id: 'st_p3_2', emoji: '📞', title: 'Contact pharma company buyers',       desc: 'Notify your buyer 2 weeks before harvest. Confirm price and quantity needed.',      category: 'selling',    daysRange: [61, 80], priority: 'high'   },
    { id: 'st_p3_3', emoji: '📦', title: 'Prepare drying area in shade',        desc: 'Set up shade-drying area. Direct sun destroys steviol glycosides (sweetness).',     category: 'general',    daysRange: [61, 80], priority: 'normal' },

    // Phase 4: Harvest (Day 81–90)
    { id: 'st_p4_1', emoji: '✂️', title: 'Harvest — cut 2/3 of plant',         desc: 'Cut stems leaving 1/3 at base to regrow. Best done just before flowering.',        category: 'harvest',    daysRange: [81, 90], priority: 'high'   },
    { id: 'st_p4_2', emoji: '☀️', title: 'Shade-dry leaves 2–3 days',          desc: 'Spread leaves in shaded, ventilated area. Never use direct sunlight.',              category: 'harvest',    daysRange: [81, 90], priority: 'high'   },
    { id: 'st_p4_3', emoji: '📦', title: 'Pack and sell dried leaves',          desc: 'Pack in clean sacks. Sell to pharma/food companies at ₹150–200/kg.',              category: 'selling',    daysRange: [81, 90], priority: 'high'   },
  ],

  Hydroponics: [
    // Phase 1: Setup & Germination (Day 1–7)
    { id: 'hy_p1_1', emoji: '🧪', title: 'Mix and check nutrient solution pH',  desc: 'Mix A+B nutrients per ratio. Adjust pH to 5.5–6.5 using pH up/down solution.',    category: 'inspection', daysRange: [1, 7],   priority: 'high'   },
    { id: 'hy_p1_2', emoji: '⚡', title: 'Check EC — target 0.8–1.2 for seeds', desc: 'New seedlings need weaker nutrients. EC 0.8–1.2 mS/cm prevents nutrient burn.',    category: 'inspection', daysRange: [1, 7],   priority: 'high'   },
    { id: 'hy_p1_3', emoji: '🔌', title: 'Verify pump runs 24/7',               desc: 'Dead pump = dead roots in 4 hours. Check timer and listen for water flow.',        category: 'inspection', daysRange: [1, 7],   priority: 'high'   },

    // Phase 2: Vegetative growth (Day 8–25)
    { id: 'hy_p2_1', emoji: '🧪', title: 'Test pH daily — adjust if needed',    desc: 'pH drifts daily. Outside 5.5–6.5 causes nutrient lockout. Check every morning.',   category: 'inspection', daysRange: [8, 25],  priority: 'high'   },
    { id: 'hy_p2_2', emoji: '⚡', title: 'Increase EC to 1.5–2.0',              desc: 'Growing plants need more nutrients. Increase EC gradually over one week.',          category: 'nutrition',  daysRange: [8, 25],  priority: 'normal' },
    { id: 'hy_p2_3', emoji: '💧', title: 'Top up reservoir water level',        desc: 'Plants drink fast in growth phase. Top up with fresh nutrient mix daily.',          category: 'watering',   daysRange: [8, 25],  priority: 'normal' },
    { id: 'hy_p2_4', emoji: '🌿', title: 'Trim roots if blocking channels',     desc: 'Long roots can block water flow. Trim back cleanly with sterile scissors.',        category: 'general',    daysRange: [15, 25], priority: 'normal' },

    // Phase 3: Maturation & Harvest (Day 26–60)
    { id: 'hy_p3_1', emoji: '✂️', title: 'Harvest outer leaves — cut-and-come', desc: 'Pick outer leaves only. Plant keeps growing. Harvest every 3–5 days.',             category: 'harvest',    daysRange: [26, 60], priority: 'high'   },
    { id: 'hy_p3_2', emoji: '🧹', title: 'Weekly system flush with plain water', desc: 'Flush system with plain water once a week to prevent salt buildup in channels.',   category: 'general',    daysRange: [26, 60], priority: 'normal' },
    { id: 'hy_p3_3', emoji: '📦', title: 'Pack and sell fresh harvest',         desc: 'Sell harvested lettuce/herbs within 4 hours for best quality and price.',          category: 'selling',    daysRange: [26, 60], priority: 'normal' },
  ],

  Lemongrass: [
    // Phase 1: Establishment (Day 1–30)
    { id: 'lg_p1_1', emoji: '💧', title: 'Water every 3 days to establish',     desc: 'New slips need regular watering for first month. After that, rain is enough.',     category: 'watering',   daysRange: [1, 30],  priority: 'high'   },
    { id: 'lg_p1_2', emoji: '🔍', title: 'Check slips for new shoot growth',    desc: 'New green shoots at base = success. No growth by Day 14 = replant.',              category: 'inspection', daysRange: [1, 30],  priority: 'high'   },

    // Phase 2: Vegetative (Day 31–60)
    { id: 'lg_p2_1', emoji: '🌱', title: 'Apply nitrogen fertilizer',           desc: 'Add urea or organic nitrogen at Day 30. Repeat at Day 60 for max leaf growth.',   category: 'nutrition',  daysRange: [31, 60], priority: 'normal' },
    { id: 'lg_p2_2', emoji: '🔍', title: 'Check for rust disease',              desc: 'Orange-brown rust spots on leaves. Apply copper fungicide spray if found.',        category: 'inspection', daysRange: [31, 60], priority: 'normal' },
    { id: 'lg_p2_3', emoji: '💧', title: 'Water once a week',                   desc: 'Lemongrass is drought-tolerant now. Weekly deep watering is enough.',             category: 'watering',   daysRange: [31, 60], priority: 'normal' },

    // Phase 3: Pre-harvest (Day 61–85)
    { id: 'lg_p3_1', emoji: '📏', title: 'Check plant height — 90cm+ = ready', desc: 'Plants should be 90–120cm tall before harvest. Measure with a stick.',            category: 'inspection', daysRange: [61, 85], priority: 'normal' },
    { id: 'lg_p3_2', emoji: '📞', title: 'Contact distillery buyers now',       desc: 'Call local essential oil distilleries. Book price before cutting.',                category: 'selling',    daysRange: [61, 85], priority: 'high'   },

    // Phase 4: Harvest (Day 86–90)
    { id: 'lg_p4_1', emoji: '✂️', title: 'Cut stalks 10cm above ground',       desc: 'Cut with a sharp blade. Leave 10cm at base — plant regrows automatically.',       category: 'harvest',    daysRange: [86, 90], priority: 'high'   },
    { id: 'lg_p4_2', emoji: '📦', title: 'Bundle and sell fresh to distillery', desc: 'Bundle 5–10kg lots. Sell fresh for oil extraction. Best price when fresh.',       category: 'selling',    daysRange: [86, 90], priority: 'high'   },
  ],
};

const DEFAULT_TASKS: Task[] = [
  { id: 'df1', emoji: '💧', title: 'Water your crop',            desc: 'Check soil moisture and water as needed. Avoid overwatering.',          category: 'watering',   daysRange: [1, 999], priority: 'normal' },
  { id: 'df2', emoji: '🔍', title: 'Inspect for disease/pests', desc: 'Check leaves for spots, discoloration or pest damage. Act early.',       category: 'inspection', daysRange: [1, 999], priority: 'high'   },
  { id: 'df3', emoji: '🌿', title: 'Remove weeds',              desc: 'Pull weeds around plant base to reduce competition for nutrients.',       category: 'general',    daysRange: [1, 999], priority: 'normal' },
  { id: 'df4', emoji: '📸', title: 'Take progress photo',       desc: 'Document crop growth with a photo. Track improvements over time.',        category: 'general',    daysRange: [1, 999], priority: 'normal' },
];

const CATEGORY_COLORS: Record<string, { color: string; bg: string }> = {
  watering:   { color: '#1565c0', bg: '#e3f2fd' },
  nutrition:  { color: '#2e7d32', bg: '#e8f5e9' },
  inspection: { color: '#f57f17', bg: '#fffde7' },
  harvest:    { color: '#6a1b9a', bg: '#f3e5f5' },
  selling:    { color: '#1a6b3c', bg: '#e8f5e9' },
  general:    { color: '#455a64', bg: '#f5f5f5' },
};

// ── AI video analysis ──────────────────────────────────────────────────────
async function analyzeProgressVideo(base64Image: string, cropName: string, dayNumber: number): Promise<string> {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: { url: `data:image/jpeg;base64,${base64Image}` },
          },
          {
            type: 'text',
            text: `You are an expert farming advisor analyzing a farmer's daily progress photo.

Crop: ${cropName}
Current Day: ${dayNumber}

Analyze this photo and provide:
1. 🌱 CROP STATUS: What stage is the crop at? Is it healthy?
2. ✅ TASKS COMPLETED: What farming tasks appear to have been done?
3. ⚠️ ISSUES DETECTED: Any problems visible (disease, pests, poor growth, wrong technique)?
4. 📋 UPDATED TASKS FOR TODAY: Based on what you see, what specific tasks should the farmer focus on today?
5. 💡 ADVICE: One key tip based on the current crop condition.

Keep advice practical and specific for Indian farmers. Be concise.`,
          },
        ],
      }],
      max_tokens: 500,
      temperature: 0.3,
    }),
  });

  if (!response.ok) throw new Error('AI analysis failed');
  const data = await response.json();
  return data.choices[0].message.content;
}

// ── Main screen ────────────────────────────────────────────────────────────
export default function ChecklistScreen() {
  const router = useRouter();

  const [cropName,    setCropName]    = useState<string | null>(null);
  const [dayNumber,   setDayNumber]   = useState(0);
  const [daysLeft,    setDaysLeft]    = useState(0);
  const [progress,    setProgress]    = useState(0);
  const [checked,     setChecked]     = useState<CheckedMap>({});
  const [loading,     setLoading]     = useState(true);
  const [todayTasks,  setTodayTasks]  = useState<Task[]>([]);

  // Video / photo analysis state
  const [photoUri,       setPhotoUri]       = useState<string | null>(null);
  const [analyzing,      setAnalyzing]      = useState(false);
  const [aiAnalysis,     setAiAnalysis]     = useState<string | null>(null);
  const [showAnalysis,   setShowAnalysis]   = useState(false);

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
        .select('saved_crop, crop_start_date, crop_cycle_days')
        .eq('id', user.id)
        .maybeSingle();

      if (data?.saved_crop && data?.crop_start_date) {
        const start = new Date(data.crop_start_date);
        const today = new Date();
        const total = data.crop_cycle_days || 30;
        const gone  = Math.max(1, Math.floor((today.getTime() - start.getTime()) / 86400000));
        const left  = Math.max(0, total - gone);
        const prog  = Math.min(100, Math.round((gone / total) * 100));

        setCropName(data.saved_crop);
        setDayNumber(gone);
        setDaysLeft(left);
        setProgress(prog);

        const allTasks = CROP_TASKS[data.saved_crop] ?? DEFAULT_TASKS;
        const filtered = allTasks.filter(t => gone >= t.daysRange[0] && gone <= t.daysRange[1]);
        setTodayTasks(filtered.length > 0 ? filtered : DEFAULT_TASKS.slice(0, 3));
      }
    } catch (e: any) {
      console.log('Checklist error:', e.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = (id: string) => {
    setChecked(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const resetChecklist = () => {
    Alert.alert('Reset Checklist', 'Mark all tasks as incomplete?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', onPress: () => setChecked({}) },
    ]);
  };

  // ── Photo/video upload handler ───────────────────────────────────────────
  const uploadProgress = async (fromCamera: boolean) => {
    try {
      let result;
      if (fromCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission needed', 'Camera permission is required.');
          return;
        }
        result = await ImagePicker.launchCameraAsync({
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
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.7,
          base64: true,
        });
      }

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setPhotoUri(asset.uri);
        setAiAnalysis(null);
        setShowAnalysis(false);
        setAnalyzing(true);

        try {
          const analysis = await analyzeProgressVideo(asset.base64!, cropName!, dayNumber);
          setAiAnalysis(analysis);
          setShowAnalysis(true);
        } catch {
          Alert.alert('Analysis Failed', 'Could not analyze photo. Check your internet connection.');
        } finally {
          setAnalyzing(false);
        }
      }
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  const showUploadOptions = () => {
    Alert.alert(
      '📸 Upload Progress Photo',
      'Take a photo of your crop for AI analysis. The AI will check crop health and update your task recommendations.',
      [
        { text: '📷 Take Photo Now',    onPress: () => uploadProgress(true)  },
        { text: '🖼️ Choose from Gallery', onPress: () => uploadProgress(false) },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const completedCount = todayTasks.filter(t => checked[t.id]).length;
  const highPriorityLeft = todayTasks.filter(t => !checked[t.id] && t.priority === 'high').length;
  const allDone = completedCount === todayTasks.length && todayTasks.length > 0;

  // ── Get current phase label ──────────────────────────────────────────────
  const getPhaseLabel = () => {
    if (!cropName || dayNumber === 0) return '';
    const allTasks = CROP_TASKS[cropName] ?? [];
    if (allTasks.length === 0) return 'Growing';

    const phaseTasks = allTasks.filter(t => dayNumber >= t.daysRange[0] && dayNumber <= t.daysRange[1]);
    if (phaseTasks.some(t => t.category === 'harvest')) return '🎉 Harvest Phase';
    if (phaseTasks.some(t => t.category === 'selling')) return '📦 Selling Phase';
    if (dayNumber <= 7)  return '🌱 Germination Phase';
    if (dayNumber <= 21) return '🌿 Growth Phase';
    return '🌾 Maturation Phase';
  };

  // ── Loading state ────────────────────────────────────────────────────────
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

  // ── No crop state ────────────────────────────────────────────────────────
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

  // ── Main screen ──────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
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
              <View style={styles.phasePill}>
                <Text style={styles.phasePillText}>{getPhaseLabel()}</Text>
              </View>
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

        {/* Summary row */}
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
            <Text style={[styles.summaryNum, { color: highPriorityLeft > 0 ? '#c62828' : '#f57f17' }]}>
              {highPriorityLeft}
            </Text>
            <Text style={styles.summaryLabel}>High Priority</Text>
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

        {/* ── AI Progress Photo Upload ── */}
        <View style={styles.uploadCard}>
          <View style={styles.uploadCardTop}>
            <Text style={styles.uploadTitle}>📸 Daily Progress Check</Text>
            <Text style={styles.uploadSub}>
              Upload a photo of your crop — AI will analyze health and update your task recommendations
            </Text>
          </View>

          {photoUri ? (
            <View style={styles.photoContainer}>
              <Image source={{ uri: photoUri }} style={styles.progressPhoto} />
              <TouchableOpacity style={styles.retakeBtn} onPress={showUploadOptions}>
                <Text style={styles.retakeBtnText}>📷 Retake Photo</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.uploadBtn} onPress={showUploadOptions}>
              <Text style={styles.uploadBtnEmoji}>📷</Text>
              <Text style={styles.uploadBtnText}>Upload Today's Photo</Text>
            </TouchableOpacity>
          )}

          {/* AI Analysis result */}
          {analyzing && (
            <View style={styles.analyzingBox}>
              <ActivityIndicator color="#1a6b3c" size="small" />
              <Text style={styles.analyzingText}>🤖 AI is analyzing your crop...</Text>
            </View>
          )}

          {aiAnalysis && showAnalysis && (
            <View style={styles.analysisBox}>
              <View style={styles.analysisHeader}>
                <Text style={styles.analysisTitle}>🤖 AI Analysis</Text>
                <TouchableOpacity onPress={() => setShowAnalysis(false)}>
                  <Text style={styles.analysisClose}>✕</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.analysisText}>{aiAnalysis}</Text>
              <TouchableOpacity
                style={styles.askMoreBtn}
                onPress={() => router.push('/chat')}>
                <Text style={styles.askMoreBtnText}>Ask Agrow AI for more details →</Text>
              </TouchableOpacity>
            </View>
          )}

          {aiAnalysis && !showAnalysis && (
            <TouchableOpacity
              style={styles.showAnalysisBtn}
              onPress={() => setShowAnalysis(true)}>
              <Text style={styles.showAnalysisBtnText}>👁️ Show AI Analysis</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Task list */}
        <Text style={styles.sectionTitle}>
          Today's Tasks — {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}
        </Text>

        {todayTasks
          .sort((a, b) => (a.priority === 'high' ? -1 : 1))
          .map((task) => {
            const done   = !!checked[task.id];
            const catCfg = CATEGORY_COLORS[task.category];
            return (
              <TouchableOpacity
                key={task.id}
                style={[
                  styles.taskCard,
                  done && styles.taskCardDone,
                  task.priority === 'high' && !done && styles.taskCardHigh,
                ]}
                onPress={() => toggleTask(task.id)}
                activeOpacity={0.8}>

                {/* Priority indicator */}
                {task.priority === 'high' && !done && (
                  <View style={styles.priorityDot} />
                )}

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
                  <View style={styles.taskMeta}>
                    <View style={[styles.categoryBadge, { backgroundColor: catCfg.bg }]}>
                      <Text style={[styles.categoryText, { color: catCfg.color }]}>
                        {task.category.charAt(0).toUpperCase() + task.category.slice(1)}
                      </Text>
                    </View>
                    {task.priority === 'high' && !done && (
                      <View style={styles.highBadge}>
                        <Text style={styles.highBadgeText}>⚡ Priority</Text>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}

        {/* Ask AI */}
        <TouchableOpacity style={styles.aiTipCard} onPress={() => router.push('/chat')}>
          <Text style={styles.aiTipEmoji}>🤖</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.aiTipTitle}>Need help with a task?</Text>
            <Text style={styles.aiTipSub}>Ask Agrow AI for detailed farming guidance.</Text>
          </View>
          <Text style={styles.aiTipArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.planCard} onPress={() => router.push('/plan')}>
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
  container:          { flex: 1, backgroundColor: '#f0f4f0' },
  header:             { backgroundColor: '#1a6b3c', paddingTop: 12, paddingBottom: 16, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn:            { color: '#a8d5b5', fontSize: 15, fontWeight: '600' },
  headerTitle:        { fontSize: 17, fontWeight: '800', color: '#fff' },
  resetBtn:           { color: '#a8d5b5', fontSize: 13, fontWeight: '600' },
  centerBox:          { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  loadingText:        { fontSize: 14, color: '#888', marginTop: 12 },
  noCropEmoji:        { fontSize: 56, marginBottom: 16 },
  noCropTitle:        { fontSize: 20, fontWeight: '800', color: '#1a1a1a', marginBottom: 8 },
  noCropText:         { fontSize: 14, color: '#666', textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  startBtn:           { backgroundColor: '#1a6b3c', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 14 },
  startBtnText:       { color: '#fff', fontWeight: '700', fontSize: 15 },
  content:            { padding: 16 },

  cropCard:           { backgroundColor: '#1a6b3c', borderRadius: 18, padding: 18, marginBottom: 14 },
  cropCardTop:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  cropCardLabel:      { fontSize: 11, color: 'rgba(255,255,255,0.7)', marginBottom: 4 },
  cropCardName:       { fontSize: 20, fontWeight: '800', color: '#fff', marginBottom: 6 },
  phasePill:          { backgroundColor: 'rgba(255,255,255,0.18)', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10, alignSelf: 'flex-start' },
  phasePillText:      { fontSize: 11, color: '#fff', fontWeight: '600' },
  dayBadge:           { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 14, alignItems: 'center' },
  dayBadgeNum:        { fontSize: 16, fontWeight: '800', color: '#fff' },
  dayBadgeSub:        { fontSize: 10, color: 'rgba(255,255,255,0.75)' },
  progressBg:         { height: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 4, marginBottom: 6, overflow: 'hidden' },
  progressFill:       { height: 8, backgroundColor: '#fff', borderRadius: 4 },
  progressLabel:      { fontSize: 11, color: 'rgba(255,255,255,0.75)' },

  summaryRow:         { flexDirection: 'row', gap: 10, marginBottom: 14 },
  summaryCard:        { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 14, alignItems: 'center', elevation: 2 },
  summaryNum:         { fontSize: 22, fontWeight: '800', color: '#1a1a1a', marginBottom: 2 },
  summaryLabel:       { fontSize: 10, color: '#888', fontWeight: '500' },

  allDoneBanner:      { backgroundColor: '#e8f5e9', borderRadius: 14, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14, borderWidth: 1, borderColor: '#c8e6c9' },
  allDoneEmoji:       { fontSize: 32 },
  allDoneTitle:       { fontSize: 15, fontWeight: '800', color: '#1a6b3c', marginBottom: 2 },
  allDoneSub:         { fontSize: 12, color: '#388e3c' },

  uploadCard:         { backgroundColor: '#fff', borderRadius: 18, padding: 16, marginBottom: 16, elevation: 2, borderWidth: 1, borderColor: '#e0e0e0' },
  uploadCardTop:      { marginBottom: 14 },
  uploadTitle:        { fontSize: 15, fontWeight: '800', color: '#1a1a1a', marginBottom: 4 },
  uploadSub:          { fontSize: 12, color: '#888', lineHeight: 18 },
  photoContainer:     { marginBottom: 10 },
  progressPhoto:      { width: '100%', height: 180, borderRadius: 12, backgroundColor: '#e0e0e0', marginBottom: 8 },
  retakeBtn:          { backgroundColor: '#f5f5f5', padding: 10, borderRadius: 10, alignItems: 'center' },
  retakeBtnText:      { fontSize: 13, fontWeight: '600', color: '#666' },
  uploadBtn:          { backgroundColor: '#e8f5e9', borderRadius: 14, padding: 18, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 10, borderWidth: 1.5, borderColor: '#c8e6c9', borderStyle: 'dashed' },
  uploadBtnEmoji:     { fontSize: 24 },
  uploadBtnText:      { fontSize: 14, fontWeight: '700', color: '#1a6b3c' },
  analyzingBox:       { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#f5f5f5', borderRadius: 10, padding: 12, marginTop: 10 },
  analyzingText:      { fontSize: 13, color: '#666' },
  analysisBox:        { backgroundColor: '#f0f9f4', borderRadius: 14, padding: 14, marginTop: 12, borderWidth: 1, borderColor: '#c8e6c9' },
  analysisHeader:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  analysisTitle:      { fontSize: 14, fontWeight: '800', color: '#1a6b3c' },
  analysisClose:      { fontSize: 16, color: '#aaa', padding: 4 },
  analysisText:       { fontSize: 13, color: '#333', lineHeight: 22 },
  askMoreBtn:         { marginTop: 12, padding: 10, backgroundColor: '#1a6b3c', borderRadius: 10, alignItems: 'center' },
  askMoreBtnText:     { fontSize: 12, color: '#fff', fontWeight: '700' },
  showAnalysisBtn:    { marginTop: 8, padding: 10, backgroundColor: '#e8f5e9', borderRadius: 10, alignItems: 'center' },
  showAnalysisBtnText:{ fontSize: 12, color: '#1a6b3c', fontWeight: '700' },

  sectionTitle:       { fontSize: 13, fontWeight: '700', color: '#888', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.8 },
  taskCard:           { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 10, flexDirection: 'row', alignItems: 'flex-start', gap: 12, elevation: 2, position: 'relative' },
  taskCardDone:       { backgroundColor: '#f5f5f5', opacity: 0.75 },
  taskCardHigh:       { borderLeftWidth: 3, borderLeftColor: '#c62828' },
  priorityDot:        { position: 'absolute', top: 10, right: 10, width: 8, height: 8, borderRadius: 4, backgroundColor: '#c62828' },
  checkbox:           { width: 26, height: 26, borderRadius: 8, borderWidth: 2, borderColor: '#1a6b3c', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 },
  checkboxDone:       { backgroundColor: '#1a6b3c', borderColor: '#1a6b3c' },
  checkboxTick:       { color: '#fff', fontSize: 14, fontWeight: '800' },
  taskContent:        { flex: 1 },
  taskTitleRow:       { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  taskEmoji:          { fontSize: 18 },
  taskTitle:          { fontSize: 14, fontWeight: '700', color: '#1a1a1a', flex: 1 },
  taskTitleDone:      { color: '#aaa', textDecorationLine: 'line-through' },
  taskDesc:           { fontSize: 12, color: '#666', lineHeight: 18, marginBottom: 8 },
  taskMeta:           { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  categoryBadge:      { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  categoryText:       { fontSize: 10, fontWeight: '700' },
  highBadge:          { backgroundColor: '#ffebee', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  highBadgeText:      { fontSize: 10, fontWeight: '700', color: '#c62828' },

  aiTipCard:          { backgroundColor: '#4a148c', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8, marginBottom: 10 },
  aiTipEmoji:         { fontSize: 28 },
  aiTipTitle:         { fontSize: 14, fontWeight: '800', color: '#fff', marginBottom: 2 },
  aiTipSub:           { fontSize: 11, color: 'rgba(255,255,255,0.75)' },
  aiTipArrow:         { fontSize: 22, color: 'rgba(255,255,255,0.5)', fontWeight: '300' },
  planCard:           { backgroundColor: '#fff', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, elevation: 2, borderWidth: 1, borderColor: '#e0e0e0' },
  planCardEmoji:      { fontSize: 28 },
  planCardTitle:      { fontSize: 14, fontWeight: '700', color: '#1a1a1a', marginBottom: 2 },
  planCardSub:        { fontSize: 11, color: '#888' },
});