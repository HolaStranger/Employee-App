import { Colors } from '@/constants/colors';
import { Link, Stack } from 'expo-router';
import { AlertCircle } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Page Not Found' }} />
      <View style={styles.container}>
        <View style={styles.iconContainer}>
          <AlertCircle size={48} color={Colors.textLight} />
        </View>
        <Text style={styles.title}>This screen doesn&apos;t exist.</Text>
        <Text style={styles.subtitle}>The page you&apos;re looking for could not be found.</Text>

        <Link href="/chat" style={styles.link}>
          <Text style={styles.linkText}>Go to home screen</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: Colors.background,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  link: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: Colors.primary,
    borderRadius: 8,
  },
  linkText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.textInverse,
  },
});
