import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  RefreshControl, ScrollView, StyleSheet,
  Text, TouchableOpacity, View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';

type Notification = {
  id: string;
  type: 'task' | 'alert' | 'milestone' | 'tip' | 'market' | 'weather';
  title: string;
  message: string;
  emoji: string;
  color: string;
  bg: string;
  time: string;
  read: boolean;
  action?: { label: string; route: string };
};

const TYPE_CONFIG = {
  task:      { color: '#1a6b3c', bg: '#e8f5e9' },
  alert:     { color: '#c62828', bg: '#ffebee' },
  milestone: { color: '#6a1b9a', bg: '#f3e5f5' },
  tip:       { color: '#f57f17', bg: '#fffde7' },
  market:    { color: '#1565c0', bg: '#e3f2fd' },
  weather:   { color: '#00695c', bg: '#e0f2f1' },
};

function generateNotifications(
  cropName: string,
  dayNumber: number,
  daysLeft: number,
  progress: number
): Notification[] {
  const now   = new Date();
  const hour  = now.getHours();
  const today = now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  const notifs: Notification[] = [];

  // ── Morning greeting ─────────────────────────────────────────────────────
  if (hour >= 5 && hour < 12) {
    notifs.push({
      id: 'morning',
      type: 'task',
      emoji: '🌅',
      title: `Good Morning! Day ${dayNumber} of ${cropName}`,
      message: 'Your daily farming checklist is ready. Start with your high priority tasks first.',
      color: TYPE_CONFIG.task.color,
      bg: TYPE_CONFIG.task.bg,
      time: 'Today, Morning',
      read: false,
      action: { label: 'Open Checklist', route: '/checklist' },
    });
  }

  // ── Harvest alert ─────────────────────────────────────────────────────────
  if (daysLeft <= 3 && daysLeft > 0) {
    notifs.push({
      id: 'harvest_soon',
      type: 'alert',
      emoji: '🎉',
      title: `Harvest in ${daysLeft} day${daysLeft === 1 ? '' : 's'}!`,
      message: `Your ${cropName} is almost ready. Contact your buyers now and prepare packaging materials.`,
      color: TYPE_CONFIG.alert.color,
      bg: TYPE_CONFIG.alert.bg,
      time: today,
      read: false,
      action: { label: 'Find Buyers', route: '/(tabs)/market' },
    });
  }

  if (daysLeft === 0) {
    notifs.push({
      id: 'harvest_ready',
      type: 'milestone',
      emoji: '🌾',
      title: `${cropName} is ready to harvest!`,
      message: 'Your crop cycle is complete. Harvest today for best quality and price.',
      color: TYPE_CONFIG.milestone.color,
      bg: TYPE_CONFIG.milestone.bg,
      time: today,
      read: false,
      action: { label: 'View Tasks', route: '/checklist' },
    });
  }

  // ── Progress milestones ───────────────────────────────────────────────────
  if (progress >= 25 && progress < 30) {
    notifs.push({
      id: 'milestone_25',
      type: 'milestone',
      emoji: '🏅',
      title: '25% of crop cycle complete!',
      message: `Great work! Your ${cropName} is growing well. Keep following the daily checklist.`,
      color: TYPE_CONFIG.milestone.color,
      bg: TYPE_CONFIG.milestone.bg,
      time: today,
      read: false,
    });
  }

  if (progress >= 50 && progress < 55) {
    notifs.push({
      id: 'milestone_50',
      type: 'milestone',
      emoji: '🥇',
      title: 'Halfway there — 50% complete!',
      message: `Your ${cropName} is at the midpoint. Time to start thinking about buyers and marketplace listings.`,
      color: TYPE_CONFIG.milestone.color,
      bg: TYPE_CONFIG.milestone.bg,
      time: today,
      read: false,
      action: { label: 'Post Listing', route: '/post-listing' },
    });
  }

  if (progress >= 75 && progress < 80) {
    notifs.push({
      id: 'milestone_75',
      type: 'milestone',
      emoji: '🚀',
      title: '75% complete — almost there!',
      message: `Final stretch for your ${cropName}. Contact buyers now — don\'t wait till harvest day.`,
      color: TYPE_CONFIG.milestone.color,
      bg: TYPE_CONFIG.milestone.bg,
      time: today,
      read: false,
      action: { label: 'Open Marketplace', route: '/(tabs)/market' },
    });
  }

  // ── Daily task reminders based on crop phase ──────────────────────────────
  if (cropName === 'Microgreens') {
    if (dayNumber >= 1 && dayNumber <= 3) {
      notifs.push({
        id: 'mg_blackout',
        type: 'task',
        emoji: '🌑',
        title: 'Keep trays under blackout cover',
        message: 'Day 1–3: Seeds need complete darkness. Check cover is secure and mist lightly once today.',
        color: TYPE_CONFIG.task.color,
        bg: TYPE_CONFIG.task.bg,
        time: today,
        read: false,
        action: { label: 'View Tasks', route: '/checklist' },
      });
    }
    if (dayNumber >= 10) {
      notifs.push({
        id: 'mg_call_buyers',
        type: 'alert',
        emoji: '📞',
        title: 'Call your microgreen buyers today!',
        message: 'Harvest is in 2–4 days. Contact restaurants and cafes NOW to confirm delivery date.',
        color: TYPE_CONFIG.alert.color,
        bg: TYPE_CONFIG.alert.bg,
        time: today,
        read: false,
        action: { label: 'Open Marketplace', route: '/(tabs)/market' },
      });
    }
  }

  if (cropName === 'Oyster Mushrooms') {
    if (dayNumber >= 16 && dayNumber <= 25) {
      notifs.push({
        id: 'om_ventilate',
        type: 'task',
        emoji: '🌬️',
        title: 'Ventilate growing room today',
        message: 'Mushrooms are pinning. Open the room for 15 minutes — CO2 buildup stunts growth.',
        color: TYPE_CONFIG.task.color,
        bg: TYPE_CONFIG.task.bg,
        time: today,
        read: false,
        action: { label: 'View Checklist', route: '/checklist' },
      });
    }
    if (dayNumber >= 1 && dayNumber <= 15) {
      notifs.push({
        id: 'om_check_bags',
        type: 'task',
        emoji: '🔍',
        title: 'Check bags for contamination',
        message: 'Inspect all bags for green or black patches. Remove contaminated bags immediately.',
        color: TYPE_CONFIG.task.color,
        bg: TYPE_CONFIG.task.bg,
        time: today,
        read: false,
      });
    }
  }

  // ── Market tips ───────────────────────────────────────────────────────────
  notifs.push({
    id: 'market_tip',
    type: 'market',
    emoji: '📈',
    title: 'Check today\'s mandi prices',
    message: `See live ${cropName} prices from nearby mandis. Know your price before selling.`,
    color: TYPE_CONFIG.market.color,
    bg: TYPE_CONFIG.market.bg,
    time: today,
    read: true,
    action: { label: 'View Prices', route: '/mandi' },
  });

  // ── Farming tips ──────────────────────────────────────────────────────────
  const TIPS = [
    { crop: 'Microgreens',     tip: 'Bottom-watering prevents damping-off mold. Never spray from top.' },
    { crop: 'Oyster Mushrooms',tip: 'One mushroom bag can give 2–3 flushes. Soak spent bags in water to trigger the next flush.' },
    { crop: 'Stevia',          tip: 'Remove flower buds immediately — flowering reduces leaf sweetness by 40%.' },
    { crop: 'Hydroponics',     tip: 'pH outside 5.5–6.5 causes nutrient lockout. Test every morning.' },
    { crop: 'Lemongrass',      tip: 'Cut stalks 10cm above ground. The plant regrows automatically.' },
  ];
  const cropTip = TIPS.find(t => t.crop === cropName);
  if (cropTip) {
    notifs.push({
      id: 'daily_tip',
      type: 'tip',
      emoji: '💡',
      title: `Pro tip for ${cropName}`,
      message: cropTip.tip,
      color: TYPE_CONFIG.tip.color,
      bg: TYPE_CONFIG.tip.bg,
      time: 'Yesterday',
      read: true,
    });
  }

  // ── Weather farming tip ───────────────────────────────────────────────────
  notifs.push({
    id: 'weather_tip',
    type: 'weather',
    emoji: '🌤️',
    title: 'Check weather before spraying',
    message: 'Always check today\'s weather before applying pesticides or sprays. Rain washes away sprays.',
    color: TYPE_CONFIG.weather.color,
    bg: TYPE_CONFIG.weather.bg,
    time: 'Yesterday',
    read: true,
    action: { label: 'Check Weather', route: '/(tabs)' },
  });

  // ── Disease detector reminder ─────────────────────────────────────────────
  if (dayNumber % 7 === 0) {
    notifs.push({
      id: 'disease_check',
      type: 'alert',
      emoji: '🔍',
      title: 'Weekly disease check reminder',
      message: 'Take a photo of your crop and run a disease scan. Early detection saves the entire harvest.',
      color: TYPE_CONFIG.alert.color,
      bg: TYPE_CONFIG.alert.bg,
      time: today,
      read: false,
      action: { label: 'Scan Now', route: '/disease' },
    });
  }

  return notifs;
}

export default function NotificationsScreen() {
  const router = useRouter();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [refreshing,    setRefreshing]    = useState(false);
  const [filter,        setFilter]        = useState<'all' | 'unread'>('all');

  useFocusEffect(
    useCallback(() => {
      loadNotifications();
    }, [])
  );

  const loadNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data } = await supabase
        .from('profiles')
        .select('saved_crop, crop_start_date, crop_cycle_days, crop_profit_max')
        .eq('id', user.id)
        .maybeSingle();

      if (data?.saved_crop && data?.crop_start_date) {
        const total    = data.crop_cycle_days || 30;
        const gone     = Math.max(1, Math.floor((Date.now() - new Date(data.crop_start_date).getTime()) / 86400000));
        const left     = Math.max(0, total - gone);
        const progress = Math.min(100, Math.round((gone / total) * 100));

        const notifs = generateNotifications(data.saved_crop, gone, left, progress);
        setNotifications(notifs);
      } else {
        // No crop — show general tips
        setNotifications([
          {
            id: 'no_crop',
            type: 'tip',
            emoji: '🌍',
            title: 'Start your first crop!',
            message: 'Take the Land Assessment quiz to get a personalized crop recommendation and start tracking your farming journey.',
            color: TYPE_CONFIG.tip.color,
            bg: TYPE_CONFIG.tip.bg,
            time: 'Now',
            read: false,
            action: { label: 'Start Assessment', route: '/land' },
          },
          {
            id: 'explore_tip',
            type: 'tip',
            emoji: '🌱',
            title: 'Explore 16 modern crops',
            message: 'Browse mushrooms, microgreens, hydroponics and more. Tap any crop to see full guide and profit breakdown.',
            color: TYPE_CONFIG.tip.color,
            bg: TYPE_CONFIG.tip.bg,
            time: 'Now',
            read: false,
            action: { label: 'Explore Crops', route: '/(tabs)/explore' },
          },
          {
            id: 'market_tip_nocrop',
            type: 'market',
            emoji: '📈',
            title: 'Check live mandi prices',
            message: 'See real-time crop prices from 3,000+ Indian mandis via the official Agmarknet API.',
            color: TYPE_CONFIG.market.color,
            bg: TYPE_CONFIG.market.bg,
            time: 'Now',
            read: true,
            action: { label: 'View Prices', route: '/mandi' },
          },
        ]);
      }
    } catch (e: any) {
      console.log('Notifications error:', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const onRefresh = () => { setRefreshing(true); loadNotifications(); };

  const filtered = filter === 'unread'
    ? notifications.filter(n => !n.read)
    : notifications;

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <SafeAreaView style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>🔔 Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{unreadCount} new</Text>
            </View>
          )}
        </View>
        <TouchableOpacity onPress={markAllRead}>
          <Text style={styles.markReadBtn}>Mark all read</Text>
        </TouchableOpacity>
      </View>

      {/* Filter tabs */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
          onPress={() => setFilter('all')}>
          <Text style={[styles.filterTabText, filter === 'all' && styles.filterTabTextActive]}>
            All ({notifications.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'unread' && styles.filterTabActive]}
          onPress={() => setFilter('unread')}>
          <Text style={[styles.filterTabText, filter === 'unread' && styles.filterTabTextActive]}>
            Unread ({unreadCount})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1a6b3c']} />
        }>

        {filtered.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>🎉</Text>
            <Text style={styles.emptyTitle}>All caught up!</Text>
            <Text style={styles.emptySub}>No unread notifications. Pull down to refresh.</Text>
          </View>
        ) : (
          filtered.map((notif) => (
            <TouchableOpacity
              key={notif.id}
              style={[
                styles.notifCard,
                { borderLeftColor: notif.color },
                !notif.read && styles.notifCardUnread,
              ]}
              onPress={() => {
                markRead(notif.id);
                if (notif.action) router.push(notif.action.route as any);
              }}
              activeOpacity={0.85}>

              {/* Unread dot */}
              {!notif.read && <View style={[styles.unreadDot, { backgroundColor: notif.color }]} />}

              {/* Content */}
              <View style={[styles.notifIconBox, { backgroundColor: notif.bg }]}>
                <Text style={styles.notifEmoji}>{notif.emoji}</Text>
              </View>

              <View style={styles.notifContent}>
                <View style={styles.notifTopRow}>
                  <Text style={[styles.notifTitle, !notif.read && styles.notifTitleUnread]}
                    numberOfLines={1}>
                    {notif.title}
                  </Text>
                  <Text style={styles.notifTime}>{notif.time}</Text>
                </View>

                <Text style={styles.notifMessage} numberOfLines={2}>
                  {notif.message}
                </Text>

                {notif.action && (
                  <View style={[styles.actionChip, { backgroundColor: notif.bg }]}>
                    <Text style={[styles.actionChipText, { color: notif.color }]}>
                      {notif.action.label} →
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))
        )}

        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:          { flex: 1, backgroundColor: '#f0f4f0' },
  header:             { backgroundColor: '#1a6b3c', paddingTop: 12, paddingBottom: 14, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn:            { color: '#a8d5b5', fontSize: 15, fontWeight: '600' },
  headerCenter:       { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle:        { fontSize: 17, fontWeight: '800', color: '#fff' },
  unreadBadge:        { backgroundColor: '#c62828', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  unreadBadgeText:    { color: '#fff', fontSize: 11, fontWeight: '700' },
  markReadBtn:        { color: '#a8d5b5', fontSize: 12, fontWeight: '600' },
  filterRow:          { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  filterTab:          { flex: 1, paddingVertical: 12, alignItems: 'center' },
  filterTabActive:    { borderBottomWidth: 2, borderBottomColor: '#1a6b3c' },
  filterTabText:      { fontSize: 13, fontWeight: '600', color: '#888' },
  filterTabTextActive:{ color: '#1a6b3c' },
  content:            { padding: 16 },
  emptyCard:          { backgroundColor: '#fff', borderRadius: 18, padding: 40, alignItems: 'center', elevation: 1 },
  emptyEmoji:         { fontSize: 48, marginBottom: 12 },
  emptyTitle:         { fontSize: 18, fontWeight: '800', color: '#1a1a1a', marginBottom: 6 },
  emptySub:           { fontSize: 13, color: '#888', textAlign: 'center' },
  notifCard:          { backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'flex-start', gap: 12, borderLeftWidth: 3, elevation: 2, position: 'relative' },
  notifCardUnread:    { backgroundColor: '#fafffe' },
  unreadDot:          { position: 'absolute', top: 14, right: 14, width: 8, height: 8, borderRadius: 4 },
  notifIconBox:       { width: 44, height: 44, borderRadius: 13, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  notifEmoji:         { fontSize: 22 },
  notifContent:       { flex: 1 },
  notifTopRow:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  notifTitle:         { fontSize: 13, fontWeight: '600', color: '#444', flex: 1, marginRight: 8 },
  notifTitleUnread:   { fontWeight: '800', color: '#1a1a1a' },
  notifTime:          { fontSize: 10, color: '#aaa', flexShrink: 0 },
  notifMessage:       { fontSize: 12, color: '#666', lineHeight: 18, marginBottom: 8 },
  actionChip:         { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  actionChipText:     { fontSize: 11, fontWeight: '700' },
});