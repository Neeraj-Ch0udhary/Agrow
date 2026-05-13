import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView, ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { supabase } from '../lib/supabase';

const CROPS = [
  '🍄 Oyster Mushrooms', '🌿 Microgreens', '🌱 Stevia',
  '🥦 Exotic Vegetables', '🌾 Lemongrass', '💧 Hydroponics',
  '🍅 Cherry Tomato', '🫑 Colored Capsicum', '🥒 Zucchini',
  '🌼 Mustard', '🍚 Rice', '🌾 Wheat',
];

export default function PostListingScreen() {
  const router = useRouter();
  const [crop, setCrop]           = useState('');
  const [quantity, setQuantity]   = useState('');
  const [price, setPrice]         = useState('');
  const [phone, setPhone]         = useState('');
  const [state, setState]         = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading]     = useState(false);
  const [showCropPicker, setShowCropPicker] = useState(false);

  const handlePost = async () => {
    if (!crop || !quantity || !price || !phone || !state) {
      Alert.alert('Missing Info', 'Please fill all required fields');
      return;
    }
    if (isNaN(parseFloat(quantity)) || parseFloat(quantity) <= 0) {
      Alert.alert('Invalid', 'Please enter a valid quantity');
      return;
    }
    if (isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      Alert.alert('Invalid', 'Please enter a valid price');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { Alert.alert('Error', 'Please login first'); return; }

      // Get farmer name
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, phone')
        .eq('id', user.id)
        .maybeSingle();

      const { error } = await supabase
        .from('marketplace_listings')
        .insert({
          farmer_id:   user.id,
          farmer_name: profile?.full_name || 'Kisan',
          phone:       phone || profile?.phone || '',
          crop:        crop.replace(/^\S+\s/, ''), // remove emoji
          quantity_kg: parseFloat(quantity),
          price_kg:    parseFloat(price),
          state:       state,
          description: description,
          status:      'active',
        });

      if (error) throw error;

      Alert.alert(
        '✅ Listed Successfully!',
        `Your ${crop} listing is now live. Buyers can contact you directly.`,
        [{ text: 'View Market', onPress: () => router.replace('/(tabs)/market') }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post Your Harvest</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}>

        {/* Crop Selector */}
        <Text style={styles.label}>🌱 Crop Name *</Text>
        <TouchableOpacity
          style={[styles.cropSelector, crop && styles.cropSelectorFilled]}
          onPress={() => setShowCropPicker(!showCropPicker)}>
          <Text style={[styles.cropSelectorText, !crop && styles.placeholder]}>
            {crop || 'Select your crop'}
          </Text>
          <Text style={styles.dropArrow}>{showCropPicker ? '▲' : '▼'}</Text>
        </TouchableOpacity>

        {showCropPicker && (
          <View style={styles.cropPicker}>
            {CROPS.map((c, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.cropOption, crop === c && styles.cropOptionActive]}
                onPress={() => { setCrop(c); setShowCropPicker(false); }}>
                <Text style={[styles.cropOptionText, crop === c && styles.cropOptionTextActive]}>
                  {c}
                </Text>
                {crop === c && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Quantity and Price row */}
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>⚖️ Quantity (kg) *</Text>
            <View style={styles.inputBox}>
              <TextInput
                style={styles.input}
                placeholder="e.g. 50"
                placeholderTextColor="#bbb"
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="decimal-pad"
              />
              <Text style={styles.inputUnit}>kg</Text>
            </View>
          </View>
          <View style={{ width: 12 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>💰 Price per kg *</Text>
            <View style={styles.inputBox}>
              <Text style={styles.rupee}>₹</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 140"
                placeholderTextColor="#bbb"
                value={price}
                onChangeText={setPrice}
                keyboardType="decimal-pad"
              />
            </View>
          </View>
        </View>

        {/* Total value preview */}
        {quantity && price && (
          <View style={styles.totalCard}>
            <Text style={styles.totalLabel}>Total Listing Value</Text>
            <Text style={styles.totalValue}>
              ₹{(parseFloat(quantity) * parseFloat(price)).toLocaleString('en-IN')}
            </Text>
          </View>
        )}

        {/* Phone */}
        <Text style={styles.label}>📱 Contact Phone *</Text>
        <View style={styles.inputBox}>
          <TextInput
            style={styles.input}
            placeholder="Your phone number"
            placeholderTextColor="#bbb"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
        </View>

        {/* State */}
        <Text style={styles.label}>📍 Your State *</Text>
        <View style={styles.inputBox}>
          <TextInput
            style={styles.input}
            placeholder="e.g. Haryana, Punjab, Maharashtra"
            placeholderTextColor="#bbb"
            value={state}
            onChangeText={setState}
          />
        </View>

        {/* Description */}
        <Text style={styles.label}>📝 Description (optional)</Text>
        <View style={[styles.inputBox, { height: 80, alignItems: 'flex-start' }]}>
          <TextInput
            style={[styles.input, { height: 72, textAlignVertical: 'top' }]}
            placeholder="Quality grade, delivery options, farming method..."
            placeholderTextColor="#bbb"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Tips */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>💡 Tips for Better Response</Text>
          <Text style={styles.tipText}>• Mention quality grade (A/B/C)</Text>
          <Text style={styles.tipText}>• State if delivery is available</Text>
          <Text style={styles.tipText}>• Add organic certification if you have it</Text>
          <Text style={styles.tipText}>• Best time to call you</Text>
        </View>

        {/* Post Button */}
        <TouchableOpacity
          style={[styles.postButton, loading && styles.postButtonLoading]}
          onPress={handlePost}
          disabled={loading}>
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.postButtonText}>🚀 Post Listing</Text>
          }
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:            { flex: 1, backgroundColor: '#f0f4f0' },
  header:               { backgroundColor: '#1a6b3c', paddingTop: 52, paddingBottom: 16, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backText:             { color: '#a8d5b5', fontSize: 15, fontWeight: '600' },
  headerTitle:          { fontSize: 17, fontWeight: '700', color: '#fff' },
  content:              { padding: 16 },
  label:                { fontSize: 13, fontWeight: '700', color: '#444', marginBottom: 8, marginTop: 14 },
  cropSelector:         { backgroundColor: '#fff', borderRadius: 14, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 2, borderWidth: 1.5, borderColor: '#e0e0e0' },
  cropSelectorFilled:   { borderColor: '#1a6b3c' },
  cropSelectorText:     { fontSize: 15, color: '#1a1a1a', fontWeight: '500' },
  placeholder:          { color: '#bbb' },
  dropArrow:            { fontSize: 12, color: '#888' },
  cropPicker:           { backgroundColor: '#fff', borderRadius: 14, marginTop: 4, elevation: 4, overflow: 'hidden', borderWidth: 1, borderColor: '#e8f5e9' },
  cropOption:           { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderBottomWidth: 0.5, borderBottomColor: '#f0f0f0' },
  cropOptionActive:     { backgroundColor: '#e8f5e9' },
  cropOptionText:       { fontSize: 14, color: '#1a1a1a' },
  cropOptionTextActive: { color: '#1a6b3c', fontWeight: '700' },
  checkmark:            { fontSize: 16, color: '#1a6b3c' },
  row:                  { flexDirection: 'row' },
  inputBox:             { backgroundColor: '#fff', borderRadius: 14, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', elevation: 2, borderWidth: 1.5, borderColor: '#e0e0e0', marginBottom: 4 },
  input:                { flex: 1, fontSize: 15, color: '#1a1a1a', paddingVertical: 14 },
  inputUnit:            { fontSize: 13, color: '#888', fontWeight: '600' },
  rupee:                { fontSize: 15, color: '#888', fontWeight: '600', marginRight: 4 },
  totalCard:            { backgroundColor: '#e8f5e9', borderRadius: 14, padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4, borderWidth: 1, borderColor: '#c8e6c9' },
  totalLabel:           { fontSize: 13, color: '#2e7d32', fontWeight: '600' },
  totalValue:           { fontSize: 18, color: '#1a6b3c', fontWeight: '800' },
  tipsCard:             { backgroundColor: '#fff8e1', borderRadius: 14, padding: 14, marginTop: 8 },
  tipsTitle:            { fontSize: 13, fontWeight: '700', color: '#f57f17', marginBottom: 8 },
  tipText:              { fontSize: 12, color: '#795548', lineHeight: 22 },
  postButton:           { backgroundColor: '#1a6b3c', padding: 18, borderRadius: 16, alignItems: 'center', marginTop: 20, elevation: 3 },
  postButtonLoading:    { backgroundColor: '#2e7d32' },
  postButtonText:       { color: '#fff', fontSize: 17, fontWeight: '800', letterSpacing: 0.5 },
});