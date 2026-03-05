import { Colors } from '@/constants/colors';
import { Stack } from 'expo-router';

export default function ProfileLayout() {
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
          title: 'Profile',
        }}
      />
    </Stack>
  );
}
