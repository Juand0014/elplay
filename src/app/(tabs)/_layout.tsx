import { Tabs } from 'expo-router';

import { colors } from '@/theme';

/** Entry experience is full-bleed; tab chrome stays hidden until more sections exist. */
export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' },
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tabs.Screen name="index" />
    </Tabs>
  );
}
