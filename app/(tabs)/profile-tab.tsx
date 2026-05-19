import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator, ScrollView, StyleSheet,
  Text, TouchableOpacity, View
} from 'react-native';
import { supabase } from '../../lib/supabase';

const MENU_ITEMS = [
  { emoji: '👤', label: 'Edit Profile',      route: '/profile',   color: '#1a6b3c', bg: '#e8f5e9' },
  { emoji: '🌍', label: 'Land Assessment',   route: '/land',      color: '#1a6b3c', bg: '#e8f5e9' },
  { emoji: '📚', label: 'Crop Guides',       route: '/learn',     color: '#e65100', bg: '#fff3e0' },
  { emoji: '✅', label: 'Daily Checklist',   route: '/checklist', color: '#1565c0', bg: '#e3f2fd' },
  { emoji: '🤖', label: 'Agrow AI',          route: '/chat',      color: '#4a148c', bg: '#f3e5f5' },
  { emoji: '🔍', label: 'Disease Detector',  route: '/disease',   color: '#b71c1c', bg: '#ffebee' },
  { emoji: '📋', label: 'Farming Plan',      route: '/plan',      color: '#bf360c', bg: '#fbe9e7' },
  { emoji: '⚙️', label: 'Settings',          route: '/settings',  color: '#455a64', bg: '#f5f5f5' },
];

export default function ProfileTabScreen() {
  const router = useRouter();

  const [name,       setName]       = useState('');
  const [email,      setEmail]      = useState('');
  const [state,      setState]      = useState('');
  const [savedCrop,  setSavedCrop]  = useState('');
  const [daysActive, setDaysActive] = useState(0);
  const [loading,    setLoading]    = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadUser();
    }, [])
  );

  const loadUser = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setEmail(user.email ?? '');

      const { data } = await supabase
        .from('profiles')
        .select('full_name, state, saved_crop, crop_start_date')
        .eq('id', user.id)
        .maybeSingle();

      if (data) {
        setName(data.full_name || '');
        setState(data.state || '');
        setSavedCrop(data.saved_crop || '');

        if (data.crop_start_date) {
          const days = Math.max(0, Math.floor(
            (Date.now() - new Date(data.crop_start_date).getTime()) / 86400000
          ));
          setDaysActive(days);
        }
      }
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  const initials = name
    ? name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : '??';

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  if (loading) {
    return (
      <View style={styles.loadingBox}>
        <ActivityIndicator color="#1a6b3c" size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#1a6b3c' }}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}>

        {/* ── Header ── */}
        <View style={styles.header}>
          {/* Avatar */}
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View style={styles.avatarBadge}>
              <Text style={styles.avatarBadgeEmoji}>🌱</Text>
            </View>
          </View>

          <Text style={styles.nameText}>{name || 'Complete your profile'}</Text>
          <Text style={styles.emailText}>{email}</Text>

          {state ? (
            <View style={styles.statePill}>
              <Text style={styles.statePillText}>📍 {state}</Text>
            </View>
          ) : null}
        </View>

        {/* ── Stats row ── */}
        <View style={styles.statsRow}>
          {[
            { emoji: '🌱', value: savedCrop || '—',                              label: 'Active Crop'  },
            { emoji: '📅', value: daysActive > 0 ? `${daysActive}d` : '—',      label: 'Days Farming' },
            { emoji: '🗺️', value: state || '—',                                  label: 'State'        },
          ].map((s, i) => (
            <View key={i} style={styles.statCard}>
              <Text style={styles.statEmoji}>{s.emoji}</Text>
              <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>
                {s.value}
              </Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* ── Active crop banner ── */}
        {savedCrop ? (
          <TouchableOpacity
            style={styles.cropBanner}
            onPress={() => router.push('/checklist')}>
            <View style={styles.cropBannerLeft}>
              <Text style={styles.cropBannerEmoji}>🌿</Text>
              <View>
                <Text style={styles.cropBannerLabel}>Currently Growing</Text>
                <Text style={styles.cropBannerName}>{savedCrop}</Text>
              </View>
            </View>
            <View style={styles.cropBannerRight}>
              <Text style={styles.cropBannerDays}>Day {daysActive}</Text>
              <Text style={styles.cropBannerAction}>View Tasks →</Text>
            </View>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.noCropBanner}
            onPress={() => router.push('/land')}>
            <Text style={styles.noCropEmoji}>🌍</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.noCropTitle}>No crop started yet</Text>
              <Text style={styles.noCropSub}>Tap to start Land Assessment →</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* ── Menu ── */}
        <View style={styles.menuCard}>
          {MENU_ITEMS.map((item, i) => (
            <View key={i}>
              <TouchableOpacity
                style={styles.menuRow}
                onPress={() => router.push(item.route as any)}
                activeOpacity={0.7}>
                <View style={[styles.menuIcon, { backgroundColor: item.bg }]}>
                  <Text style={styles.menuEmoji}>{item.emoji}</Text>
                </View>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={[styles.menuArrow, { color: item.color }]}>›</Text>
              </TouchableOpacity>
              {i < MENU_ITEMS.length - 1 && <View style={styles.menuDivider} />}
            </View>
          ))}
        </View>

        {/* ── Logout ── */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutEmoji}>🚪</Text>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Agrow v1.0.0 • Made with 💚 for Indian Farmers</Text>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: '#f0f4f0' },
  loadingBox:       { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f4f0' },

  header:           { backgroundColor: '#1a6b3c', paddingTop: 72, paddingBottom: 32, alignItems: 'center', borderBottomLeftRadius: 28, borderBottomRightRadius: 28, paddingHorizontal: 20 },
  avatarWrapper:    { position: 'relative', marginBottom: 12 },
  avatarCircle:     { width: 84, height: 84, borderRadius: 26, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', borderWidth: 2.5, borderColor: 'rgba(255,255,255,0.4)' },
  avatarText:       { fontSize: 30, color: '#fff', fontWeight: '800' },
  avatarBadge:      { position: 'absolute', bottom: -4, right: -4, width: 26, height: 26, borderRadius: 9, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', elevation: 3 },
  avatarBadgeEmoji: { fontSize: 13 },
  nameText:         { fontSize: 22, fontWeight: '800', color: '#fff', marginBottom: 4 },
  emailText:        { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 10 },
  statePill:        { backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' },
  statePillText:    { color: 'rgba(255,255,255,0.9)', fontSize: 12, fontWeight: '500' },

  statsRow:         { flexDirection: 'row', gap: 10, marginHorizontal: 16, marginTop: -18, marginBottom: 14 },
  statCard:         { flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 12, alignItems: 'center', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6 },
  statEmoji:        { fontSize: 18, marginBottom: 4 },
  statValue:        { fontSize: 13, fontWeight: '800', color: '#1a1a1a', marginBottom: 2 },
  statLabel:        { fontSize: 9, color: '#999', fontWeight: '500', textAlign: 'center' },

  cropBanner:       { backgroundColor: '#1a6b3c', marginHorizontal: 16, borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, elevation: 2 },
  cropBannerLeft:   { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cropBannerEmoji:  { fontSize: 28 },
  cropBannerLabel:  { fontSize: 10, color: 'rgba(255,255,255,0.7)', marginBottom: 2 },
  cropBannerName:   { fontSize: 15, fontWeight: '800', color: '#fff' },
  cropBannerRight:  { alignItems: 'flex-end' },
  cropBannerDays:   { fontSize: 13, fontWeight: '700', color: '#fff', marginBottom: 2 },
  cropBannerAction: { fontSize: 11, color: 'rgba(255,255,255,0.75)' },

  noCropBanner:     { backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14, borderWidth: 1.5, borderColor: '#c8e6c9', borderStyle: 'dashed', elevation: 1 },
  noCropEmoji:      { fontSize: 28 },
  noCropTitle:      { fontSize: 14, fontWeight: '700', color: '#444', marginBottom: 2 },
  noCropSub:        { fontSize: 12, color: '#1a6b3c', fontWeight: '600' },

  menuCard:         { backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 20, padding: 4, elevation: 2, marginBottom: 12 },
  menuRow:          { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  menuIcon:         { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  menuEmoji:        { fontSize: 18 },
  menuLabel:        { flex: 1, fontSize: 15, fontWeight: '600', color: '#1a1a1a' },
  menuArrow:        { fontSize: 20, fontWeight: '300' },
  menuDivider:      { height: 1, backgroundColor: '#f5f5f5', marginLeft: 64 },

  logoutBtn:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginHorizontal: 16, backgroundColor: '#fff', padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1.5, borderColor: '#ffcdd2', elevation: 1 },
  logoutEmoji:      { fontSize: 18 },
  logoutText:       { fontSize: 15, color: '#e53935', fontWeight: '700' },
  version:          { textAlign: 'center', fontSize: 11, color: '#bbb', marginBottom: 8 },
});
