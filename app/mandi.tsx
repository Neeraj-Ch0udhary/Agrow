import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Linking,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

type CropPrice = {
  name: string;
  emoji: string;
  category: string;
  price: number;
  unit: string;
  change: number;
  min: number;
  max: number;
  market: string;
  state: string;
};

const MANDI_DATA: CropPrice[] = [
  { name: 'Oyster Mushroom', emoji: '🍄', category: 'Modern', price: 140, unit: 'kg', change: 12, min: 120, max: 160, market: 'Azadpur Mandi', state: 'Delhi' },
  { name: 'Wheat', emoji: '🌾', category: 'Traditional', price: 22, unit: 'kg', change: 1, min: 20, max: 24, market: 'Hapur Mandi', state: 'UP' },
  { name: 'Rice', emoji: '🍚', category: 'Traditional', price: 28, unit: 'kg', change: -2, min: 25, max: 32, market: 'Karnal Mandi', state: 'Haryana' },
];

const MOCK_MARKET = [
  { crop: 'Wheat', price: 24, quantity: '50 quintal', location: 'UP', phone: '9876543210' },
  { crop: 'Rice', price: 30, quantity: '30 quintal', location: 'Punjab', phone: '9123456780' },
  { crop: 'Mushroom', price: 120, quantity: '100 kg', location: 'Delhi', phone: '9988776655' },
];

const CATEGORIES = ['All', 'Modern', 'Traditional'];

export default function MandiScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const [mode, setMode] = useState<'prices' | 'market'>('prices');
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [prices, setPrices] = useState(MANDI_DATA);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const filtered = prices.filter(crop => {
    const matchCategory = filter === 'All' || crop.category === filter;
    const matchSearch =
      crop.name.toLowerCase().includes(search.toLowerCase()) ||
      crop.state.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <SafeAreaView style={styles.container}>
      
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mandi & Market</Text>
          <Text style={styles.headerSub}>Live prices + direct selling</Text>
        </View>

        {/* Toggle */}
        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[styles.toggleBtn, mode === 'prices' && styles.activeToggle]}
            onPress={() => setMode('prices')}>
            <Text style={mode === 'prices' ? styles.activeText : styles.inactiveText}>
              📊 Prices
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toggleBtn, mode === 'market' && styles.activeToggle]}
            onPress={() => setMode('market')}>
            <Text style={mode === 'market' ? styles.activeText : styles.inactiveText}>
              🛒 Market
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchBox}>
          <TextInput
            placeholder="Search..."
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
          />
        </View>

        {/* Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[styles.filterChip, filter === cat && styles.activeChip]}
              onPress={() => setFilter(cat)}>
              <Text style={{ color: filter === cat ? '#fff' : '#555' }}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* CONTENT SWITCH */}
        {mode === 'prices' ? (
          <View style={{ padding: 16 }}>
            {filtered.map((item, i) => (
              <View key={i} style={styles.card}>
                <Text style={styles.cropName}>{item.emoji} {item.name}</Text>
                <Text style={styles.price}>₹{item.price}/{item.unit}</Text>
                <Text style={styles.location}>{item.market}, {item.state}</Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={{ padding: 16 }}>
            {MOCK_MARKET.map((item, i) => (
              <View key={i} style={styles.card}>
                <Text style={styles.cropName}>🌾 {item.crop}</Text>
                <Text>Qty: {item.quantity}</Text>
                <Text>{item.location}</Text>

                <View style={{ marginTop: 6 }}>
                  <Text style={styles.price}>₹{item.price}/kg</Text>

                  <TouchableOpacity
                    style={styles.callBtn}
                    onPress={() => Linking.openURL(`tel:${item.phone}`)}>
                    <Text style={{ color: '#fff' }}>Call Seller</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7f5' },

  backButton: { padding: 16 },
  backText: { fontSize: 16, color: '#1a6b3c' },

  header: { paddingHorizontal: 16, marginBottom: 12 },
  headerTitle: { fontSize: 22, fontWeight: '700' },
  headerSub: { fontSize: 12, color: '#777' },

  toggleRow: {
    flexDirection: 'row',
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 4,
  },

  toggleBtn: { flex: 1, padding: 10, alignItems: 'center' },
  activeToggle: { backgroundColor: '#1a6b3c', borderRadius: 8 },

  activeText: { color: '#fff', fontWeight: '700' },
  inactiveText: { color: '#555' },

  searchBox: {
    marginHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },

  searchInput: { fontSize: 14 },

  filterChip: {
    padding: 10,
    backgroundColor: '#eee',
    borderRadius: 20,
    marginHorizontal: 6,
  },

  activeChip: {
    backgroundColor: '#1a6b3c',
  },

  card: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
  },

  cropName: { fontSize: 16, fontWeight: '600' },
  price: { fontSize: 15, fontWeight: '700', marginTop: 4 },
  location: { fontSize: 12, color: '#777' },

  callBtn: {
    marginTop: 6,
    backgroundColor: '#1a6b3c',
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
});