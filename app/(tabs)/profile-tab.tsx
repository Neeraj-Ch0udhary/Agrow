import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../lib/supabase';

export default function ProfileTabScreen() {
  const router  = useRouter();
  const { t }   = useTranslation();
  const [name, setName]   = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadUser(); }, []);

  const loadUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setEmail(user.email ?? '');
      const { data } = await supabase.from('profiles').select('full_name').eq('id', user.id).maybeSingle();
      if (data?.full_name) setName(data.full_name);
    } catch (e) { console.log(e); }
    finally { setLoading(false); }
  };

  const initials = name ? name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : '🌿';

  const MENU_ITEMS = [
    { emoji: '👤', label: 'Edit Profile', route: '/profile', color: '#1a6b3c' },
    { emoji: '🌍', label: 'Land Assessment', route: '/land', color: '#1a6b3c' },
    { emoji: '📚', label: 'Crop Guides', route: '/learn', color: '#e65100' },
    { emoji: '🤖', label: 'Agrow AI', route: '/chat', color: '#4a148c' },
    { emoji: '🔍', label: 'Disease Detector', route: '/disease', color: '#b71c1c' },
    { emoji: '📋', label: 'Farming Plan', route: '/plan', color: '#bf360c' },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.nameText}>{name || 'Kisan'}</Text>
        <Text style={styles.emailText}>{email}</Text>
      </View>

      {/* Menu */}
      <View style={styles.menuCard}>
        {MENU_ITEMS.map((item, i) => (
          <View key={i}>
            <TouchableOpacity style={styles.menuRow} onPress={() => router.push(item.route as any)}>
              <View style={[styles.menuIcon, { backgroundColor: item.color + '18' }]}>
                <Text style={{ fontSize: 18 }}>{item.emoji}</Text>
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
            {i < MENU_ITEMS.length - 1 && <View style={styles.menuDivider} />}
          </View>
        ))}
      </View>

      {/* Logout */}
      <TouchableOpacity
        style={styles.logoutBtn}
        onPress={async () => {
          await supabase.auth.signOut();
          router.replace('/login');
        }}>
        <Text style={styles.logoutText}>🚪 Logout</Text>
      </TouchableOpacity>

      <Text style={styles.version}>Agrow v1.0.0 • Made with 💚 for Indian Farmers</Text>
      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#f0f4f0' },
  header:       { backgroundColor: '#1a6b3c', paddingTop: 56, paddingBottom: 36, alignItems: 'center', borderBottomLeftRadius: 28, borderBottomRightRadius: 28, marginBottom: 20 },
  avatarCircle: { width: 80, height: 80, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 12, borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)' },
  avatarText:   { fontSize: 30, color: '#fff', fontWeight: '800' },
  nameText:     { fontSize: 20, fontWeight: '800', color: '#fff', marginBottom: 4 },
  emailText:    { fontSize: 13, color: 'rgba(255,255,255,0.7)' },
  menuCard:     { backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 20, padding: 4, elevation: 2, marginBottom: 12 },
  menuRow:      { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  menuIcon:     { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  menuLabel:    { flex: 1, fontSize: 15, fontWeight: '600', color: '#1a1a1a' },
  menuArrow:    { fontSize: 20, color: '#ccc' },
  menuDivider:  { height: 1, backgroundColor: '#f5f5f5', marginLeft: 64 },
  logoutBtn:    { backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1.5, borderColor: '#ffcdd2', marginBottom: 12 },
  logoutText:   { fontSize: 15, color: '#e53935', fontWeight: '700' },
  version:      { textAlign: 'center', fontSize: 11, color: '#bbb', marginBottom: 8 },
});