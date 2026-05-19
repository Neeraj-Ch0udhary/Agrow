import AsyncStorage from '@react-native-async-storage/async-storage';
import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { supabase } from '../lib/supabase';

export default function Index() {
  const [loading, setLoading]             = useState(true);
  const [session, setSession]             = useState<any>(null);
  const [onboardingDone, setOnboardingDone] = useState(false);

  useEffect(() => {
    const init = async () => {
      const done = await AsyncStorage.getItem('onboarding_done');
      setOnboardingDone(done === 'true');
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
    };
    init();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a6b3c' }}>
        <ActivityIndicator color="#fff" size="large" />
      </View>
    );
  }

  if (!onboardingDone) return <Redirect href="/onboarding" />;
  if (session) return <Redirect href="/(tabs)" />;
  return <Redirect href="/login" />;
}
