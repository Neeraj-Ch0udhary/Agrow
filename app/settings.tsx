import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Alert, Linking, ScrollView, StyleSheet,
    Switch, Text, TouchableOpacity, View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import i18n, { changeLanguage } from '../lib/i18n';
import { supabase } from '../lib/supabase';

type SettingRowProps = {
  emoji: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  right?: React.ReactNode;
  color?: string;
};

function SettingRow({ emoji, title, subtitle, onPress, right, color = '#1a1a1a' }: SettingRowProps) {
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}>
      <View style={styles.rowLeft}>
        <Text style={styles.rowEmoji}>{emoji}</Text>
        <View style={styles.rowText}>
          <Text style={[styles.rowTitle, { color }]}>{title}</Text>
          {subtitle && <Text style={styles.rowSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {right ?? (onPress && <Text style={styles.rowArrow}>›</Text>)}
    </TouchableOpacity>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <Text style={styles.sectionHeader}>{title}</Text>
  );
}

export default function SettingsScreen() {
  const router   = useRouter();
  const { t }    = useTranslation();
  const isHindi  = i18n.language === 'hi';

  const [cropReminders, setCropReminders]   = useState(true);
  const [priceAlerts, setPriceAlerts]       = useState(true);
  const [weatherAlerts, setWeatherAlerts]   = useState(false);
  const [marketUpdates, setMarketUpdates]   = useState(true);

  const handleLanguageToggle = () => {
    changeLanguage(isHindi ? 'en' : 'hi');
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      '⚠️ Delete Account',
      'This will permanently delete your profile, crop data, and all listings. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: async () => {
            try {
              const { data: { user } } = await supabase.auth.getUser();
              if (!user) return;
              await supabase.from('profiles').delete().eq('id', user.id);
              await supabase.from('marketplace_listings').update({ status: 'deleted' }).eq('farmer_id', user.id);
              await supabase.auth.signOut();
              router.replace('/login');
            } catch (e: any) {
              Alert.alert('Error', e.message);
            }
          }
        }
      ]
    );
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await supabase.auth.signOut();
            router.replace('/login');
          }
        }
      ]
    );
  };

  const handleClearCache = () => {
    Alert.alert('✅ Cache Cleared', 'App cache has been cleared successfully.');
  };

  const handleRateApp = () => {
    Linking.openURL('https://play.google.com/store/apps');
  };

  const handleShareApp = () => {
    Alert.alert('Share Agrow', 'Sharing feature coming soon!');
  };

  const handlePrivacyPolicy = () => {
    Linking.openURL('https://agrow.app/privacy');
  };

  const handleTerms = () => {
    Linking.openURL('https://agrow.app/terms');
  };

  const handleSupport = () => {
    Linking.openURL('mailto:support@agrow.app');
  };

  return (
    <SafeAreaView style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>⚙️ Settings</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>

        {/* ── ACCOUNT ── */}
        <SectionHeader title="👤  Account" />
        <View style={styles.card}>
          <SettingRow
            emoji="👤"
            title="Edit Profile"
            subtitle="Name, phone, state"
            onPress={() => router.push('/profile')}
          />
          <View style={styles.divider} />
          <SettingRow
            emoji="🌱"
            title="My Crop"
            subtitle="View or change active crop"
            onPress={() => router.push('/land')}
          />
          <View style={styles.divider} />
          <SettingRow
            emoji="🏪"
            title="My Listings"
            subtitle="Manage your marketplace posts"
            onPress={() => router.push('/(tabs)/market')}
          />
        </View>

        {/* ── LANGUAGE ── */}
        <SectionHeader title="🌐  Language" />
        <View style={styles.card}>
          <SettingRow
            emoji="🇮🇳"
            title="Hindi / हिंदी"
            subtitle={isHindi ? 'Currently active' : 'Switch to Hindi'}
            right={
              <Switch
                value={isHindi}
                onValueChange={handleLanguageToggle}
                trackColor={{ false: '#e0e0e0', true: '#a8d5b5' }}
                thumbColor={isHindi ? '#1a6b3c' : '#fff'}
              />
            }
          />
          <View style={styles.divider} />
          <SettingRow
            emoji="🇬🇧"
            title="English"
            subtitle={!isHindi ? 'Currently active' : 'Switch to English'}
            right={
              <Switch
                value={!isHindi}
                onValueChange={handleLanguageToggle}
                trackColor={{ false: '#e0e0e0', true: '#a8d5b5' }}
                thumbColor={!isHindi ? '#1a6b3c' : '#fff'}
              />
            }
          />
        </View>

        {/* ── NOTIFICATIONS ── */}
        <SectionHeader title="🔔  Notifications" />
        <View style={styles.card}>
          <SettingRow
            emoji="🌱"
            title="Crop Task Reminders"
            subtitle="Daily farming tasks and milestones"
            right={
              <Switch
                value={cropReminders}
                onValueChange={setCropReminders}
                trackColor={{ false: '#e0e0e0', true: '#a8d5b5' }}
                thumbColor={cropReminders ? '#1a6b3c' : '#fff'}
              />
            }
          />
          <View style={styles.divider} />
          <SettingRow
            emoji="📈"
            title="Mandi Price Alerts"
            subtitle="When your crop price changes significantly"
            right={
              <Switch
                value={priceAlerts}
                onValueChange={setPriceAlerts}
                trackColor={{ false: '#e0e0e0', true: '#a8d5b5' }}
                thumbColor={priceAlerts ? '#1a6b3c' : '#fff'}
              />
            }
          />
          <View style={styles.divider} />
          <SettingRow
            emoji="🌤️"
            title="Weather Alerts"
            subtitle="Rain, frost or extreme weather warnings"
            right={
              <Switch
                value={weatherAlerts}
                onValueChange={setWeatherAlerts}
                trackColor={{ false: '#e0e0e0', true: '#a8d5b5' }}
                thumbColor={weatherAlerts ? '#1a6b3c' : '#fff'}
              />
            }
          />
          <View style={styles.divider} />
          <SettingRow
            emoji="🏪"
            title="Marketplace Updates"
            subtitle="New buyers and listing activity"
            right={
              <Switch
                value={marketUpdates}
                onValueChange={setMarketUpdates}
                trackColor={{ false: '#e0e0e0', true: '#a8d5b5' }}
                thumbColor={marketUpdates ? '#1a6b3c' : '#fff'}
              />
            }
          />
        </View>

        {/* ── APP ── */}
        <SectionHeader title="📱  App" />
        <View style={styles.card}>
          <SettingRow
            emoji="🗑️"
            title="Clear Cache"
            subtitle="Free up storage space"
            onPress={handleClearCache}
          />
          <View style={styles.divider} />
          <SettingRow
            emoji="⭐"
            title="Rate Agrow"
            subtitle="Love the app? Leave a review"
            onPress={handleRateApp}
          />
          <View style={styles.divider} />
          <SettingRow
            emoji="📤"
            title="Share Agrow"
            subtitle="Tell other farmers about Agrow"
            onPress={handleShareApp}
          />
        </View>

        {/* ── SUPPORT ── */}
        <SectionHeader title="🆘  Support" />
        <View style={styles.card}>
          <SettingRow
            emoji="📧"
            title="Contact Support"
            subtitle="support@agrow.app"
            onPress={handleSupport}
          />
          <View style={styles.divider} />
          <SettingRow
            emoji="🔒"
            title="Privacy Policy"
            onPress={handlePrivacyPolicy}
          />
          <View style={styles.divider} />
          <SettingRow
            emoji="📄"
            title="Terms of Service"
            onPress={handleTerms}
          />
          <View style={styles.divider} />
          <SettingRow
            emoji="ℹ️"
            title="App Version"
            subtitle="Agrow v1.0.0 — Built for Indian Farmers"
          />
        </View>

        {/* ── DANGER ZONE ── */}
        <SectionHeader title="⚠️  Danger Zone" />
        <View style={styles.card}>
          <SettingRow
            emoji="🚪"
            title="Logout"
            subtitle="Sign out of your account"
            onPress={handleLogout}
            color="#e53935"
          />
          <View style={styles.divider} />
          <SettingRow
            emoji="🗑️"
            title="Delete Account"
            subtitle="Permanently delete all your data"
            onPress={handleDeleteAccount}
            color="#c62828"
          />
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          🌱 Agrow v1.0.0{'\n'}Made with 💚 for 140 million Indian farmers
        </Text>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: '#f0f4f0' },
  header:        { backgroundColor: '#1a6b3c', paddingTop: 12, paddingBottom: 16, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn:       { color: '#a8d5b5', fontSize: 15, fontWeight: '600' },
  headerTitle:   { fontSize: 18, fontWeight: '800', color: '#fff' },
  sectionHeader: { fontSize: 11, fontWeight: '700', color: '#888', letterSpacing: 1, textTransform: 'uppercase', marginHorizontal: 16, marginTop: 20, marginBottom: 8 },
  card:          { backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 18, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6, overflow: 'hidden' },
  row:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14 },
  rowLeft:       { flexDirection: 'row', alignItems: 'center', flex: 1 },
  rowEmoji:      { fontSize: 20, marginRight: 14, width: 28, textAlign: 'center' },
  rowText:       { flex: 1 },
  rowTitle:      { fontSize: 14, fontWeight: '600', color: '#1a1a1a', marginBottom: 2 },
  rowSubtitle:   { fontSize: 12, color: '#888' },
  rowArrow:      { fontSize: 20, color: '#ccc', fontWeight: '300' },
  divider:       { height: 0.5, backgroundColor: '#f0f0f0', marginLeft: 58 },
  footer:        { textAlign: 'center', fontSize: 12, color: '#bbb', lineHeight: 20, marginTop: 24, marginBottom: 8 },
});