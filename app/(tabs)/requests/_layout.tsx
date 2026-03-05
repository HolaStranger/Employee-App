import { Colors } from '@/constants/colors';
import { Stack } from 'expo-router';

export default function RequestsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.surface,
        },
        headerTintColor: Colors.text,
        headerTitleStyle: {
          fontWeight: '600',
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'My Requests',
        }}
      />
    </Stack>
  );
}
