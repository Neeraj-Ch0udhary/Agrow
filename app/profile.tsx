import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, Animated, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';

type Profile = { full_name: string; phone: string; state: string; saved_crop: string; };

export default function ProfileScreen() {
  const router  = useRouter();
  const { t }   = useTranslation();
  const [profile, setProfile]   = useState<Profile | null>(null);
  const [email, setEmail]       = useState('');
  const [loading, setLoading]   = useState(true);
  const [editing, setEditing]   = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editState, setEditState] = useState('');
  const [saving, setSaving]     = useState(false);

  const fadeAnim   = useRef(new Animated.Value(0)).current;
  const headerAnim = useRef(new Animated.Value(-20)).current;

  useEffect(() => { loadProfile(); }, []);

  useEffect(() => {
    if (!loading) {
      Animated.parallel([
        Animated.timing(fadeAnim,   { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(headerAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]).start();
    }
  }, [loading]);

  const loadProfile = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setEmail(user.email ?? '');

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle(); // ← changed from .single()

    if (error) throw error;

    if (data) {
      setProfile(data);
      setEditName(data.full_name || '');
      setEditPhone(data.phone || '');
      setEditState(data.state || '');
    } else {
      // No profile yet — create one automatically
      await supabase.from('profiles').insert({
        id: user.id,
        full_name: '',
        phone: '',
        state: '',
        saved_crop: '',
      });
    }
  } catch (error: any) {
    console.log('Profile error:', error.message);
  } finally {
    setLoading(false);
  }
};

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: editName, phone: editPhone, state: editState })
        .eq('id', user.id);
      if (error) throw error;
      setProfile(prev => prev ? { ...prev, full_name: editName, phone: editPhone, state: editState } : null);
      setEditing(false);
      Alert.alert('✅ Saved!', 'Your profile has been updated.');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(t('profile.logout'), t('profile.logoutConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('profile.logout'), style: 'destructive', onPress: async () => { await supabase.auth.signOut(); router.replace('/login'); } }
    ]);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f4f0' }}>
        <ActivityIndicator color="#1a6b3c" size="large" />
      </View>
    );
  }

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : '🌿';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="none">

        {/* Header */}
        <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: headerAnim }] }]}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>

          <View style={styles.avatarWrapper}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View style={styles.avatarBadge}>
              <Text style={styles.avatarBadgeText}>🌱</Text>
            </View>
          </View>

          <Text style={styles.profileName}>{editName || profile?.full_name || 'Kisan'}</Text>
          <Text style={styles.profileEmail}>{email}</Text>

          {(profile?.state || editState) && (
            <View style={styles.locationPill}>
              <Text style={styles.locationPillText}>📍 {editState || profile?.state}</Text>
            </View>
          )}
        </Animated.View>

        <Animated.View style={{ opacity: fadeAnim }}>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            {[
              { emoji: '📚', value: '4', label: t('profile.guides') },
              { emoji: '🌱', value: '0', label: t('profile.days') },
              { emoji: '💰', value: '₹0', label: t('profile.income') },
            ].map((stat, i) => (
              <View key={i} style={styles.statCard}>
                <Text style={styles.statEmoji}>{stat.emoji}</Text>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>

          {/* Crop Card */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>{t('profile.journey')}</Text>
            {profile?.saved_crop ? (
              <View style={styles.cropRow}>
                <View style={styles.cropIconBox}>
                  <Text style={{ fontSize: 28 }}>🌱</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cropLabel}>{t('profile.currentCrop')}</Text>
                  <Text style={styles.cropValue}>{profile.saved_crop}</Text>
                </View>
              </View>
            ) : (
              <TouchableOpacity style={styles.assessmentBtn} onPress={() => router.push('/land')}>
                <Text style={styles.assessmentEmoji}>🌍</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.assessmentTitle}>{t('profile.noCrop')}</Text>
                  <Text style={styles.assessmentSub}>{t('profile.assessment')}</Text>
                </View>
                <Text style={styles.assessmentArrow}>›</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Details Card */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionTitle}>{t('profile.yourDetails')}</Text>
              <TouchableOpacity
                style={[styles.editBtn, editing && styles.editBtnActive]}
                onPress={() => editing ? handleSave() : setEditing(true)}>
                {saving
                  ? <ActivityIndicator size="small" color="#1a6b3c" />
                  : <Text style={[styles.editBtnText, editing && styles.editBtnTextActive]}>
                      {editing ? '✓ Save' : '✏️ Edit'}
                    </Text>
                }
              </TouchableOpacity>
            </View>

            {editing ? (
              <>
                {[
                  { label: 'Full Name', value: editName, onChange: setEditName, emoji: '👤', keyboard: 'default' },
                  { label: t('profile.phone'), value: editPhone, onChange: setEditPhone, emoji: '📱', keyboard: 'phone-pad' },
                  { label: t('profile.state'), value: editState, onChange: setEditState, emoji: '📍', keyboard: 'default' },
                ].map((field, i) => (
                  <View key={i} style={styles.editField}>
                    <Text style={styles.editFieldLabel}>{field.label}</Text>
                    <View style={styles.editInputRow}>
                      <Text style={{ fontSize: 16, marginRight: 8 }}>{field.emoji}</Text>
                      <TextInput
                        style={styles.editInput}
                        value={field.value}
                        onChangeText={field.onChange}
                        keyboardType={field.keyboard as any}
                        autoCapitalize="words"
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                        placeholderTextColor="#bbb"
                        blurOnSubmit={false}
                      />
                    </View>
                  </View>
                ))}
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditing(false)}>
                  <Text style={styles.cancelBtnText}>{t('common.cancel')}</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                {[
                  { label: 'Full Name', value: profile?.full_name || t('profile.notAdded'), emoji: '👤' },
                  { label: t('profile.phone'), value: profile?.phone || t('profile.notAdded'), emoji: '📱' },
                  { label: t('profile.state'), value: profile?.state || t('profile.notAdded'), emoji: '📍' },
                  { label: t('profile.email'), value: email, emoji: '✉️' },
                ].map((item, i, arr) => (
                  <View key={i}>
                    <View style={styles.detailRow}>
                      <View style={styles.detailIconBox}>
                        <Text style={{ fontSize: 16 }}>{item.emoji}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.detailLabel}>{item.label}</Text>
                        <Text style={styles.detailValue}>{item.value}</Text>
                      </View>
                    </View>
                    {i < arr.length - 1 && <View style={styles.separator} />}
                  </View>
                ))}
              </>
            )}
          </View>

          {/* Logout */}
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutEmoji}>🚪</Text>
            <Text style={styles.logoutText}>{t('profile.logout')}</Text>
          </TouchableOpacity>

          <Text style={styles.versionText}>Agrow v1.0.0 • Made with 💚 for Indian Farmers</Text>
          <View style={{ height: 40 }} />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:         { flex: 1, backgroundColor: '#f0f4f0' },
  header:            { backgroundColor: '#1a6b3c', paddingTop: 16, paddingBottom: 36, alignItems: 'center', borderBottomLeftRadius: 32, borderBottomRightRadius: 32, paddingHorizontal: 20 },
  backBtn:           { alignSelf: 'flex-start', width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  backText:          { color: '#fff', fontSize: 24, fontWeight: '300', marginTop: -2 },
  avatarWrapper:     { position: 'relative', marginBottom: 14 },
  avatarCircle:      { width: 88, height: 88, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: 'rgba(255,255,255,0.4)' },
  avatarText:        { fontSize: 32, color: '#fff', fontWeight: '800' },
  avatarBadge:       { position: 'absolute', bottom: -4, right: -4, width: 28, height: 28, borderRadius: 10, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', elevation: 3 },
  avatarBadgeText:   { fontSize: 14 },
  profileName:       { fontSize: 24, fontWeight: '800', color: '#fff', marginBottom: 4, letterSpacing: 0.3 },
  profileEmail:      { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 12 },
  locationPill:      { backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' },
  locationPillText:  { color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: '500' },
  statsRow:          { flexDirection: 'row', gap: 10, marginHorizontal: 16, marginTop: -20, marginBottom: 16 },
  statCard:          { flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 14, alignItems: 'center', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8 },
  statEmoji:         { fontSize: 22, marginBottom: 6 },
  statValue:         { fontSize: 18, fontWeight: '800', color: '#1a1a1a', marginBottom: 2 },
  statLabel:         { fontSize: 10, color: '#999', textAlign: 'center', fontWeight: '500' },
  sectionCard:       { backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 20, padding: 18, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6 },
  sectionTitle:      { fontSize: 12, fontWeight: '700', color: '#aaa', letterSpacing: 0.8, textTransform: 'uppercase' },
  sectionTitleRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  editBtn:           { backgroundColor: '#f0f9f4', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#c8e6c9' },
  editBtnActive:     { backgroundColor: '#1a6b3c', borderColor: '#1a6b3c' },
  editBtnText:       { fontSize: 13, fontWeight: '600', color: '#1a6b3c' },
  editBtnTextActive: { color: '#fff' },
  editField:         { marginBottom: 14 },
  editFieldLabel:    { fontSize: 11, fontWeight: '600', color: '#aaa', letterSpacing: 0.5, marginBottom: 6 },
  editInputRow:      { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8f8f8', borderRadius: 12, paddingHorizontal: 14, borderWidth: 1.5, borderColor: '#e8f5e9' },
  editInput:         { flex: 1, fontSize: 15, color: '#1a1a1a', paddingVertical: 12 },
  cancelBtn:         { alignItems: 'center', paddingVertical: 10, marginTop: 4 },
  cancelBtnText:     { fontSize: 14, color: '#e53935', fontWeight: '600' },
  cropRow:           { flexDirection: 'row', alignItems: 'center', gap: 14 },
  cropIconBox:       { width: 52, height: 52, borderRadius: 16, backgroundColor: '#e8f5e9', alignItems: 'center', justifyContent: 'center' },
  cropLabel:         { fontSize: 12, color: '#aaa', marginBottom: 3 },
  cropValue:         { fontSize: 17, fontWeight: '700', color: '#1a6b3c' },
  assessmentBtn:     { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#f0f9f4', borderRadius: 14, padding: 14, borderWidth: 1.5, borderColor: '#c8e6c9', borderStyle: 'dashed' },
  assessmentEmoji:   { fontSize: 28 },
  assessmentTitle:   { fontSize: 14, fontWeight: '600', color: '#444', marginBottom: 2 },
  assessmentSub:     { fontSize: 12, color: '#1a6b3c', fontWeight: '600' },
  assessmentArrow:   { fontSize: 22, color: '#1a6b3c' },
  detailRow:         { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  detailIconBox:     { width: 36, height: 36, borderRadius: 10, backgroundColor: '#f5f5f5', alignItems: 'center', justifyContent: 'center' },
  detailLabel:       { fontSize: 11, color: '#aaa', marginBottom: 2, fontWeight: '500' },
  detailValue:       { fontSize: 14, color: '#1a1a1a', fontWeight: '600' },
  separator:         { height: 1, backgroundColor: '#f5f5f5', marginLeft: 48 },
  logoutBtn:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginHorizontal: 16, backgroundColor: '#fff', padding: 16, borderRadius: 16, marginBottom: 16, borderWidth: 1.5, borderColor: '#ffcdd2', elevation: 1 },
  logoutEmoji:       { fontSize: 18 },
  logoutText:        { fontSize: 15, color: '#e53935', fontWeight: '700' },
  versionText:       { textAlign: 'center', fontSize: 11, color: '#bbb', marginBottom: 8 },
});