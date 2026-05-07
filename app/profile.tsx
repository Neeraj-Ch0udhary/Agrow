import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../lib/supabase';

type Profile = { full_name: string; phone: string; state: string; saved_crop: string; };

export default function ProfileScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setEmail(user.email ?? '');
      const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (error) throw error;
      setProfile(data);
    } catch (error: any) { console.log('Profile error:', error.message); }
    finally { setLoading(false); }
  };

  const handleLogout = async () => {
    Alert.alert(t('profile.logout'), t('profile.logoutConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('profile.logout'), style: 'destructive', onPress: async () => { await supabase.auth.signOut(); router.replace('/login'); } }
    ]);
  };

  if (loading) {
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f7f5' }}><ActivityIndicator color="#1a6b3c" size="large" /></View>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>{t('common.back')}</Text>
      </TouchableOpacity>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{profile?.full_name ? profile.full_name[0].toUpperCase() : '🌿'}</Text>
          </View>
          <Text style={styles.profileName}>{profile?.full_name ?? 'Kisan'}</Text>
          <Text style={styles.profileEmail}>{email}</Text>
          {profile?.state && <View style={styles.stateBadge}><Text style={styles.stateBadgeText}>📍 {profile.state}</Text></View>}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.yourDetails')}</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}><Text style={styles.infoLabel}>{t('profile.phone')}</Text><Text style={styles.infoValue}>{profile?.phone || t('profile.notAdded')}</Text></View>
            <View style={styles.divider} />
            <View style={styles.infoRow}><Text style={styles.infoLabel}>{t('profile.state')}</Text><Text style={styles.infoValue}>{profile?.state || t('profile.notAdded')}</Text></View>
            <View style={styles.divider} />
            <View style={styles.infoRow}><Text style={styles.infoLabel}>{t('profile.email')}</Text><Text style={styles.infoValue}>{email}</Text></View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.journey')}</Text>
          <View style={styles.cropCard}>
            {profile?.saved_crop ? (
              <>
                <Text style={styles.cropEmoji}>🌱</Text>
                <Text style={styles.cropTitle}>{t('profile.currentCrop')}</Text>
                <Text style={styles.cropName}>{profile.saved_crop}</Text>
              </>
            ) : (
              <>
                <Text style={styles.cropEmoji}>🌍</Text>
                <Text style={styles.cropTitle}>{t('profile.noCrop')}</Text>
                <TouchableOpacity style={styles.startButton} onPress={() => router.push('/land')}>
                  <Text style={styles.startButtonText}>{t('profile.assessment')}</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}><Text style={styles.statEmoji}>📚</Text><Text style={styles.statLabel}>{t('profile.guides')}</Text><Text style={styles.statValue}>4</Text></View>
          <View style={styles.statCard}><Text style={styles.statEmoji}>🌱</Text><Text style={styles.statLabel}>{t('profile.days')}</Text><Text style={styles.statValue}>0</Text></View>
          <View style={styles.statCard}><Text style={styles.statEmoji}>💰</Text><Text style={styles.statLabel}>{t('profile.income')}</Text><Text style={styles.statValue}>₹0</Text></View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>{t('profile.logout')}</Text>
        </TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: '#f5f7f5' },
  backButton:      { padding: 16, paddingTop: 52 },
  backText:        { fontSize: 16, color: '#1a6b3c', fontWeight: '600' },
  profileHeader:   { backgroundColor: '#1a6b3c', paddingBottom: 32, alignItems: 'center', paddingTop: 8 },
  avatarCircle:    { width: 90, height: 90, borderRadius: 45, backgroundColor: '#155e34', alignItems: 'center', justifyContent: 'center', marginBottom: 14, borderWidth: 3, borderColor: '#4caf50' },
  avatarText:      { fontSize: 40, color: '#fff', fontWeight: 'bold' },
  profileName:     { fontSize: 24, fontWeight: '700', color: '#fff', marginBottom: 4 },
  profileEmail:    { fontSize: 13, color: '#a8d5b5', marginBottom: 10 },
  stateBadge:      { backgroundColor: '#155e34', paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20 },
  stateBadgeText:  { color: '#a8d5b5', fontSize: 13 },
  section:         { paddingHorizontal: 16, marginTop: 20 },
  sectionTitle:    { fontSize: 14, fontWeight: '600', color: '#888', marginBottom: 10 },
  infoCard:        { backgroundColor: '#fff', borderRadius: 14, padding: 4, elevation: 2 },
  infoRow:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14 },
  infoLabel:       { fontSize: 14, color: '#888' },
  infoValue:       { fontSize: 14, color: '#1a1a1a', fontWeight: '500' },
  divider:         { height: 0.5, backgroundColor: '#f0f0f0', marginHorizontal: 14 },
  cropCard:        { backgroundColor: '#fff', borderRadius: 14, padding: 24, alignItems: 'center', elevation: 2 },
  cropEmoji:       { fontSize: 48, marginBottom: 10 },
  cropTitle:       { fontSize: 14, color: '#888', marginBottom: 6 },
  cropName:        { fontSize: 20, fontWeight: '700', color: '#1a6b3c' },
  startButton:     { backgroundColor: '#1a6b3c', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, marginTop: 10 },
  startButtonText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  statsRow:        { flexDirection: 'row', gap: 12, paddingHorizontal: 16, marginTop: 20 },
  statCard:        { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 16, alignItems: 'center', elevation: 2 },
  statEmoji:       { fontSize: 24, marginBottom: 6 },
  statLabel:       { fontSize: 11, color: '#888', marginBottom: 4, textAlign: 'center' },
  statValue:       { fontSize: 18, fontWeight: '700', color: '#1a1a1a' },
  logoutButton:    { marginHorizontal: 16, marginTop: 24, backgroundColor: '#fff', padding: 16, borderRadius: 14, alignItems: 'center', elevation: 2 },
  logoutText:      { fontSize: 15, color: '#e53935', fontWeight: '600' },
});