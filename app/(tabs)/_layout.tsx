import { Tabs } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

function TabIcon({ emoji, label, focused, color }: any) {
  return (
    <View style={styles.tabItem}>
      <Text style={[styles.tabEmoji, { opacity: focused ? 1 : 0.45 }]}>{emoji}</Text>
      <Text style={[styles.tabLabel, { color }]}>{label}</Text>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#1a6b3c',
        tabBarInactiveTintColor: '#aaa',
        tabBarShowLabel: false,
      }}>

      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon emoji="🏠" label="Home" focused={focused} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon emoji="🔭" label="Explore" focused={focused} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="market"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon emoji="🏪" label="Market" focused={focused} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile-tab"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon emoji="👤" label="Profile" focused={focused} color={color} />
          ),
        }}
      />

    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar:   { backgroundColor: '#fff', borderTopWidth: 0, elevation: 20, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.08, shadowRadius: 12, height: 72, paddingBottom: 8, paddingTop: 6, borderTopLeftRadius: 22, borderTopRightRadius: 22, position: 'absolute' },
  tabItem:  { alignItems: 'center', justifyContent: 'center', width: 70 },
  tabEmoji: { fontSize: 22, marginBottom: 3 },
  tabLabel: { fontSize: 10, fontWeight: '600' },
});