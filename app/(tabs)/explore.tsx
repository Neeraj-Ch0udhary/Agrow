import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ScrollView, StyleSheet, Text,
  TextInput, TouchableOpacity, View
} from 'react-native';

const ALL_CROPS = [
  // ── Beginner ─────────────────────────────────────────────────────────────
  {
    id: 'mushroom',
    emoji: '🍄', name: 'Oyster Mushroom',
    profit: '₹15,000/mo', profitNum: 15000,
    time: '45 days', timeNum: 45,
    investment: '₹3,000',
    difficulty: 'Beginner',
    space: '50 sq ft',
    color: '#7b5ea7', bg: '#f3e5f5',
    tags: ['indoor', 'no-land', 'fast'],
    desc: 'Grow in dark rooms, harvest every 45 days. High demand from restaurants.',
  },
  {
    id: 'microgreens',
    emoji: '🌿', name: 'Microgreens',
    profit: '₹20,000/mo', profitNum: 20000,
    time: '10 days', timeNum: 10,
    investment: '₹2,000',
    difficulty: 'Beginner',
    space: '30 sq ft',
    color: '#2e7d32', bg: '#e8f5e9',
    tags: ['indoor', 'no-land', 'fastest'],
    desc: 'Ready in 10 days. Sell to cafes, juice bars and health stores at ₹300–600/kg.',
  },
  {
    id: 'lemongrass',
    emoji: '🌾', name: 'Lemongrass',
    profit: '₹12,000/mo', profitNum: 12000,
    time: '90 days', timeNum: 90,
    investment: '₹4,000',
    difficulty: 'Beginner',
    space: '300 sq ft',
    color: '#558b2f', bg: '#f1f8e9',
    tags: ['outdoor', 'perennial', 'low-water'],
    desc: 'Plant once, harvest for 5 years. Essential oil companies buy everything.',
  },
  {
    id: 'spinach',
    emoji: '🥬', name: 'Spinach',
    profit: '₹8,000/mo', profitNum: 8000,
    time: '30 days', timeNum: 30,
    investment: '₹1,500',
    difficulty: 'Beginner',
    space: '200 sq ft',
    color: '#388e3c', bg: '#e8f5e9',
    tags: ['outdoor', 'fast', 'kitchen-garden'],
    desc: 'Fast growing, multiple harvests. Consistent demand from households and restaurants.',
  },
  {
    id: 'coriander',
    emoji: '🌿', name: 'Coriander',
    profit: '₹6,000/mo', profitNum: 6000,
    time: '21 days', timeNum: 21,
    investment: '₹800',
    difficulty: 'Beginner',
    space: '100 sq ft',
    color: '#43a047', bg: '#e8f5e9',
    tags: ['outdoor', 'fast', 'kitchen-garden'],
    desc: 'Fastest herb crop. Cut-and-come-again. Restaurants buy daily.',
  },
  {
    id: 'tulsi',
    emoji: '🌱', name: 'Tulsi (Holy Basil)',
    profit: '₹10,000/mo', profitNum: 10000,
    time: '60 days', timeNum: 60,
    investment: '₹2,000',
    difficulty: 'Beginner',
    space: '150 sq ft',
    color: '#00897b', bg: '#e0f2f1',
    tags: ['outdoor', 'medicinal', 'perennial'],
    desc: 'Sacred herb with huge pharma demand. Grows back after every cut.',
  },
  {
    id: 'aloe-vera',
    emoji: '🌵', name: 'Aloe Vera',
    profit: '₹9,000/mo', profitNum: 9000,
    time: '180 days', timeNum: 180,
    investment: '₹3,000',
    difficulty: 'Beginner',
    space: '200 sq ft',
    color: '#00695c', bg: '#e0f2f1',
    tags: ['outdoor', 'low-water', 'medicinal'],
    desc: 'Drought-tolerant. Cosmetic and pharma companies buy in bulk.',
  },

  // ── Intermediate ──────────────────────────────────────────────────────────
  {
    id: 'stevia',
    emoji: '🌱', name: 'Stevia',
    profit: '₹25,000/mo', profitNum: 25000,
    time: '90 days', timeNum: 90,
    investment: '₹5,000',
    difficulty: 'Intermediate',
    space: '200 sq ft',
    color: '#00695c', bg: '#e0f2f1',
    tags: ['outdoor', 'medicinal', 'perennial'],
    desc: 'Natural sweetener. Pharma companies have buyback agreements. 5+ year plant.',
  },
  {
    id: 'exotic-veg',
    emoji: '🥦', name: 'Exotic Vegetables',
    profit: '₹40,000/mo', profitNum: 40000,
    time: '75 days', timeNum: 75,
    investment: '₹10,000',
    difficulty: 'Intermediate',
    space: '500 sq ft',
    color: '#e65100', bg: '#fff3e0',
    tags: ['outdoor', 'restaurant', 'premium'],
    desc: 'Broccoli, colored capsicum, zucchini. Restaurants pay 3× regular vegetable prices.',
  },
  {
    id: 'cherry-tomato',
    emoji: '🍅', name: 'Cherry Tomato',
    profit: '₹18,000/mo', profitNum: 18000,
    time: '75 days', timeNum: 75,
    investment: '₹6,000',
    difficulty: 'Intermediate',
    space: '300 sq ft',
    color: '#c62828', bg: '#ffebee',
    tags: ['outdoor', 'restaurant', 'premium'],
    desc: 'Premium variety. Hotels and restaurants pay ₹120–180/kg year-round.',
  },
  {
    id: 'ginger',
    emoji: '🫚', name: 'Ginger',
    profit: '₹20,000/mo', profitNum: 20000,
    time: '270 days', timeNum: 270,
    investment: '₹8,000',
    difficulty: 'Intermediate',
    space: '400 sq ft',
    color: '#f9a825', bg: '#fffde7',
    tags: ['outdoor', 'spice', 'export'],
    desc: 'High-value spice crop. Massive export demand. One crop per year.',
  },
  {
    id: 'ashwagandha',
    emoji: '🌿', name: 'Ashwagandha',
    profit: '₹22,000/mo', profitNum: 22000,
    time: '180 days', timeNum: 180,
    investment: '₹5,000',
    difficulty: 'Intermediate',
    space: '300 sq ft',
    color: '#6d4c41', bg: '#efebe9',
    tags: ['outdoor', 'medicinal', 'export'],
    desc: 'Ayurvedic herb. Pharma and supplement companies buy at premium prices.',
  },
  {
    id: 'strawberry',
    emoji: '🍓', name: 'Strawberry',
    profit: '₹35,000/mo', profitNum: 35000,
    time: '90 days', timeNum: 90,
    investment: '₹12,000',
    difficulty: 'Intermediate',
    space: '400 sq ft',
    color: '#e53935', bg: '#ffebee',
    tags: ['outdoor', 'premium', 'restaurant'],
    desc: 'Premium berry. Hotels and online delivery platforms pay ₹200–400/kg.',
  },

  // ── Advanced ──────────────────────────────────────────────────────────────
  {
    id: 'hydroponics',
    emoji: '💧', name: 'Hydroponics',
    profit: '₹80,000/mo', profitNum: 80000,
    time: '60 days', timeNum: 60,
    investment: '₹25,000',
    difficulty: 'Advanced',
    space: '100 sq ft',
    color: '#1565c0', bg: '#e3f2fd',
    tags: ['indoor', 'no-soil', 'premium'],
    desc: 'Soil-free farming. 3× yield in same space. Premium supermarkets and hotels.',
  },
  {
    id: 'saffron',
    emoji: '🌸', name: 'Saffron',
    profit: '₹1,00,000/mo', profitNum: 100000,
    time: '120 days', timeNum: 120,
    investment: '₹30,000',
    difficulty: 'Advanced',
    space: '100 sq ft',
    color: '#f57f17', bg: '#fffde7',
    tags: ['indoor', 'luxury', 'export'],
    desc: 'World\'s most expensive spice. ₹2–3 lakh/kg. Can be grown indoors in controlled conditions.',
  },
  {
    id: 'moringa',
    emoji: '🌳', name: 'Moringa (Drumstick)',
    profit: '₹15,000/mo', profitNum: 15000,
    time: '180 days', timeNum: 180,
    investment: '₹4,000',
    difficulty: 'Beginner',
    space: '500 sq ft',
    color: '#2e7d32', bg: '#e8f5e9',
    tags: ['outdoor', 'medicinal', 'export'],
    desc: 'Superfood with global demand. Leaves, pods and powder all sell well.',
  },
];

const FILTERS = {
  difficulty: ['All', 'Beginner', 'Intermediate', 'Advanced'],
  time:       ['All', 'Under 30 days', '30–90 days', '90+ days'],
  profit:     ['All', 'Under ₹10k', '₹10k–₹30k', '₹30k+'],
};

const TIPS = [
  { emoji: '💡', tip: 'Sell directly to restaurants — they pay 40% more than mandis.',     category: 'Selling'      },
  { emoji: '💧', tip: 'Bottom-watering microgreens prevents mold — never spray from top.', category: 'Microgreens'  },
  { emoji: '🌡️', tip: 'Mushrooms grow best at 25–28°C with 80–90% humidity.',              category: 'Mushroom'     },
  { emoji: '🧪', tip: 'Check pH 5.5–6.5 daily for healthy hydroponic systems.',            category: 'Hydroponics'  },
  { emoji: '🌿', tip: 'Neem oil spray controls 80% of pests organically.',                 category: 'Pest Control' },
  { emoji: '📞', tip: 'Get pharma buyback agreements for stevia before planting.',          category: 'Stevia'       },
  { emoji: '☀️', tip: 'Shade-dry stevia leaves — sun drying destroys the sweetness.',      category: 'Stevia'       },
  { emoji: '💰', tip: 'Start with 20 mushroom bags — earns ₹3,000–5,000 per cycle.',      category: 'Mushroom'     },
];

const DIFFICULTY_CONFIG = {
  Beginner:     { color: '#1a6b3c', bg: '#e8f5e9' },
  Intermediate: { color: '#f57f17', bg: '#fffde7' },
  Advanced:     { color: '#c62828', bg: '#ffebee' },
};

export default function ExploreScreen() {
  const router = useRouter();

  const [search,          setSearch]          = useState('');
  const [diffFilter,      setDiffFilter]      = useState('All');
  const [timeFilter,      setTimeFilter]      = useState('All');
  const [profitFilter,    setProfitFilter]    = useState('All');
  const [showFilters,     setShowFilters]     = useState(false);

  const filtered = ALL_CROPS.filter(crop => {
    const matchSearch = search === '' ||
      crop.name.toLowerCase().includes(search.toLowerCase()) ||
      crop.tags.some(t => t.includes(search.toLowerCase()));

    const matchDiff =
      diffFilter === 'All' || crop.difficulty === diffFilter;

    const matchTime =
      timeFilter === 'All' ||
      (timeFilter === 'Under 30 days'  && crop.timeNum < 30)  ||
      (timeFilter === '30–90 days'     && crop.timeNum >= 30 && crop.timeNum <= 90) ||
      (timeFilter === '90+ days'       && crop.timeNum > 90);

    const matchProfit =
      profitFilter === 'All' ||
      (profitFilter === 'Under ₹10k'  && crop.profitNum < 10000)  ||
      (profitFilter === '₹10k–₹30k'  && crop.profitNum >= 10000 && crop.profitNum <= 30000) ||
      (profitFilter === '₹30k+'       && crop.profitNum > 30000);

    return matchSearch && matchDiff && matchTime && matchProfit;
  });

  const activeFilters = [diffFilter, timeFilter, profitFilter].filter(f => f !== 'All').length;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🌱 Explore Crops</Text>
        <Text style={styles.headerSub}>
          {ALL_CROPS.length} modern crops — tap any to see full guide
        </Text>
      </View>

      {/* Search + Filter bar */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search crops, tags..."
            placeholderTextColor="#aaa"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Text style={styles.clearBtn}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[styles.filterBtn, activeFilters > 0 && styles.filterBtnActive]}
          onPress={() => setShowFilters(!showFilters)}>
          <Text style={styles.filterBtnText}>
            {activeFilters > 0 ? `Filters (${activeFilters})` : '⚡ Filter'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Filter panels */}
      {showFilters && (
        <View style={styles.filterPanel}>
          {[
            { label: 'Difficulty', options: FILTERS.difficulty, value: diffFilter,   setValue: setDiffFilter   },
            { label: 'Time',       options: FILTERS.time,       value: timeFilter,   setValue: setTimeFilter   },
            { label: 'Profit',     options: FILTERS.profit,     value: profitFilter, setValue: setProfitFilter },
          ].map((f, fi) => (
            <View key={fi} style={styles.filterGroup}>
              <Text style={styles.filterGroupLabel}>{f.label}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.filterOptions}>
                  {f.options.map((opt, i) => (
                    <TouchableOpacity
                      key={i}
                      style={[styles.filterOption, f.value === opt && styles.filterOptionActive]}
                      onPress={() => f.setValue(opt)}>
                      <Text style={[styles.filterOptionText, f.value === opt && styles.filterOptionTextActive]}>
                        {opt}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          ))}
          <TouchableOpacity
            style={styles.clearFiltersBtn}
            onPress={() => { setDiffFilter('All'); setTimeFilter('All'); setProfitFilter('All'); }}>
            <Text style={styles.clearFiltersBtnText}>Clear All Filters</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Results count */}
      <View style={styles.resultsRow}>
        <Text style={styles.resultsText}>
          {filtered.length} crop{filtered.length !== 1 ? 's' : ''} found
        </Text>
        {activeFilters > 0 && (
          <TouchableOpacity onPress={() => { setDiffFilter('All'); setTimeFilter('All'); setProfitFilter('All'); }}>
            <Text style={styles.clearFiltersLink}>Clear filters</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Crop grid */}
      <View style={styles.cropGrid}>
        {filtered.map((crop, i) => {
          const diffCfg = DIFFICULTY_CONFIG[crop.difficulty as keyof typeof DIFFICULTY_CONFIG];
          return (
            <TouchableOpacity
              key={i}
              style={[styles.cropCard, { borderTopColor: crop.color }]}
              onPress={() => router.push({ pathname: '/crop-detail', params: { id: crop.id } })}
              activeOpacity={0.85}>

              {/* Emoji + difficulty */}
              <View style={styles.cropCardTop}>
                <View style={[styles.cropEmojiBox, { backgroundColor: crop.bg }]}>
                  <Text style={styles.cropEmoji}>{crop.emoji}</Text>
                </View>
                <View style={[styles.diffBadge, { backgroundColor: diffCfg.bg }]}>
                  <Text style={[styles.diffText, { color: diffCfg.color }]}>
                    {crop.difficulty}
                  </Text>
                </View>
              </View>

              {/* Name + desc */}
              <Text style={[styles.cropName, { color: crop.color }]}>{crop.name}</Text>
              <Text style={styles.cropDesc} numberOfLines={2}>{crop.desc}</Text>

              {/* Stats */}
              <View style={styles.cropStats}>
                <View style={styles.cropStat}>
                  <Text style={styles.cropStatLabel}>Profit</Text>
                  <Text style={[styles.cropStatValue, { color: crop.color }]}>{crop.profit}</Text>
                </View>
                <View style={styles.cropStatDivider} />
                <View style={styles.cropStat}>
                  <Text style={styles.cropStatLabel}>Ready</Text>
                  <Text style={[styles.cropStatValue, { color: crop.color }]}>{crop.time}</Text>
                </View>
                <View style={styles.cropStatDivider} />
                <View style={styles.cropStat}>
                  <Text style={styles.cropStatLabel}>Space</Text>
                  <Text style={[styles.cropStatValue, { color: crop.color }]}>{crop.space}</Text>
                </View>
              </View>

              {/* Tags */}
              <View style={styles.tagsRow}>
                {crop.tags.slice(0, 3).map((tag, ti) => (
                  <View key={ti} style={[styles.tag, { backgroundColor: crop.bg }]}>
                    <Text style={[styles.tagText, { color: crop.color }]}>#{tag}</Text>
                  </View>
                ))}
              </View>

              <Text style={[styles.viewGuide, { color: crop.color }]}>View Full Guide →</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* No results */}
      {filtered.length === 0 && (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyEmoji}>🌾</Text>
          <Text style={styles.emptyTitle}>No crops found</Text>
          <Text style={styles.emptySub}>Try adjusting your filters or search term.</Text>
          <TouchableOpacity
            style={styles.emptyBtn}
            onPress={() => { setSearch(''); setDiffFilter('All'); setTimeFilter('All'); setProfitFilter('All'); }}>
            <Text style={styles.emptyBtnText}>Reset All</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Tips section */}
      <Text style={styles.sectionTitle}>💡 Farming Tips</Text>
      {TIPS.map((item, i) => (
        <View key={i} style={styles.tipCard}>
          <View style={styles.tipLeft}>
            <Text style={styles.tipEmoji}>{item.emoji}</Text>
          </View>
          <View style={styles.tipRight}>
            <Text style={styles.tipCategory}>{item.category}</Text>
            <Text style={styles.tipText}>{item.tip}</Text>
          </View>
        </View>
      ))}

      {/* CTA */}
      <TouchableOpacity style={styles.ctaCard} onPress={() => router.push('/calculator')}>
        <Text style={styles.ctaEmoji}>💰</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.ctaTitle}>Calculate Your Profit</Text>
          <Text style={styles.ctaSub}>Enter your land size and see exactly how much you can earn.</Text>
        </View>
        <Text style={styles.ctaArrow}>›</Text>
      </TouchableOpacity>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:            { flex: 1, backgroundColor: '#f0f4f0' },

  header:               { backgroundColor: '#1a6b3c', paddingTop: 56, paddingBottom: 24, paddingHorizontal: 20, borderBottomLeftRadius: 28, borderBottomRightRadius: 28, marginBottom: 16 },
  headerTitle:          { fontSize: 26, fontWeight: '800', color: '#fff', marginBottom: 4 },
  headerSub:            { fontSize: 13, color: 'rgba(255,255,255,0.75)' },

  searchRow:            { flexDirection: 'row', paddingHorizontal: 16, gap: 10, marginBottom: 12 },
  searchBox:            { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, paddingHorizontal: 12, elevation: 1 },
  searchIcon:           { fontSize: 16, marginRight: 6 },
  searchInput:          { flex: 1, fontSize: 14, color: '#1a1a1a', paddingVertical: 12 },
  clearBtn:             { fontSize: 14, color: '#aaa', paddingLeft: 8 },
  filterBtn:            { backgroundColor: '#fff', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, elevation: 1, justifyContent: 'center' },
  filterBtnActive:      { backgroundColor: '#1a6b3c' },
  filterBtnText:        { fontSize: 13, fontWeight: '700', color: '#1a6b3c' },

  filterPanel:          { backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 16, padding: 16, marginBottom: 12, elevation: 2 },
  filterGroup:          { marginBottom: 14 },
  filterGroupLabel:     { fontSize: 11, fontWeight: '700', color: '#888', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8 },
  filterOptions:        { flexDirection: 'row', gap: 8 },
  filterOption:         { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: '#f5f5f5' },
  filterOptionActive:   { backgroundColor: '#1a6b3c' },
  filterOptionText:     { fontSize: 12, fontWeight: '600', color: '#666' },
  filterOptionTextActive:{ color: '#fff' },
  clearFiltersBtn:      { alignItems: 'center', paddingVertical: 8 },
  clearFiltersBtnText:  { fontSize: 13, color: '#e53935', fontWeight: '600' },

  resultsRow:           { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 12 },
  resultsText:          { fontSize: 12, color: '#888', fontWeight: '600' },
  clearFiltersLink:     { fontSize: 12, color: '#1a6b3c', fontWeight: '700' },

  cropGrid:             { paddingHorizontal: 16, gap: 12 },
  cropCard:             { backgroundColor: '#fff', borderRadius: 18, padding: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6, borderTopWidth: 3 },
  cropCardTop:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  cropEmojiBox:         { width: 50, height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  cropEmoji:            { fontSize: 26 },
  diffBadge:            { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  diffText:             { fontSize: 11, fontWeight: '700' },
  cropName:             { fontSize: 17, fontWeight: '800', marginBottom: 4 },
  cropDesc:             { fontSize: 12, color: '#666', lineHeight: 18, marginBottom: 12 },
  cropStats:            { flexDirection: 'row', backgroundColor: '#f8f8f8', borderRadius: 12, padding: 10, marginBottom: 10 },
  cropStat:             { flex: 1, alignItems: 'center' },
  cropStatLabel:        { fontSize: 9, color: '#aaa', fontWeight: '600', marginBottom: 3 },
  cropStatValue:        { fontSize: 12, fontWeight: '800' },
  cropStatDivider:      { width: 1, backgroundColor: '#e0e0e0' },
  tagsRow:              { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  tag:                  { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  tagText:              { fontSize: 10, fontWeight: '600' },
  viewGuide:            { fontSize: 12, fontWeight: '700', textAlign: 'right' },

  emptyCard:            { backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 18, padding: 32, alignItems: 'center', marginBottom: 16, elevation: 1 },
  emptyEmoji:           { fontSize: 48, marginBottom: 12 },
  emptyTitle:           { fontSize: 16, fontWeight: '800', color: '#1a1a1a', marginBottom: 6 },
  emptySub:             { fontSize: 13, color: '#888', marginBottom: 16 },
  emptyBtn:             { backgroundColor: '#1a6b3c', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 20 },
  emptyBtnText:         { color: '#fff', fontWeight: '700', fontSize: 14 },

  sectionTitle:         { fontSize: 15, fontWeight: '700', color: '#1a1a1a', paddingHorizontal: 16, marginBottom: 12, marginTop: 20 },
  tipCard:              { backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 14, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'flex-start', elevation: 1 },
  tipLeft:              { width: 36, height: 36, borderRadius: 10, backgroundColor: '#fff8e1', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  tipEmoji:             { fontSize: 18 },
  tipRight:             { flex: 1 },
  tipCategory:          { fontSize: 11, color: '#f57f17', fontWeight: '700', marginBottom: 3 },
  tipText:              { fontSize: 13, color: '#444', lineHeight: 19 },

  ctaCard:              { backgroundColor: '#1a6b3c', marginHorizontal: 16, marginTop: 16, borderRadius: 18, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 14, elevation: 3 },
  ctaEmoji:             { fontSize: 32 },
  ctaTitle:             { fontSize: 15, fontWeight: '800', color: '#fff', marginBottom: 3 },
  ctaSub:               { fontSize: 12, color: 'rgba(255,255,255,0.8)' },
  ctaArrow:             { fontSize: 24, color: 'rgba(255,255,255,0.6)' },
});