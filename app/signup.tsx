import { Colors } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import { useMutation } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Building2, Eye, EyeOff, Lock, Mail, User } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SignUpScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ role?: string }>();

  // ✅ Ensure role is always "employee" or "manager"
  const role: UserRole = (params.role as UserRole) || 'employee';

  const { signup } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const signupMutation = useMutation({
    mutationFn: async () => {
      const trimmedName = name.trim();
      const trimmedEmail = email.trim().toLowerCase();
      const trimmedDept = department.trim();

      if (!trimmedName) throw new Error('Please enter your name');
      if (!trimmedEmail) throw new Error('Please enter your email');
      if (!password.trim() || password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      // ✅ FIX: AuthContext signup expects ONE payload object
      return signup({
        name: trimmedName,
        email: trimmedEmail,
        password,
        role,
        department: trimmedDept || 'General',
      });
    },
    onSuccess: () => {
      console.log('[SignUp] Registration successful');
      // change this route if you want another page after signup
      router.replace('/(tabs)/dashboard');
    },
    onError: (error: any) => {
      console.error('[SignUp] Registration failed:', error);
      Alert.alert('Registration Failed', error?.message || 'Could not create account');
    },
  });

  const handleSignUp = () => {
    signupMutation.mutate();
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.primaryDark, Colors.primary, '#1A6FA3']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <ArrowLeft size={24} color={Colors.textInverse} />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>
              Join as {role === 'manager' ? 'Manager' : 'Employee'}
            </Text>
          </View>

          <View style={styles.formCard}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <View style={styles.inputContainer}>
                <User size={20} color={Colors.textSecondary} />
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter your full name"
                  placeholderTextColor={Colors.textLight}
                  autoCapitalize="words"
                  testID="name-input"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputContainer}>
                <Mail size={20} color={Colors.textSecondary} />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email"
                  placeholderTextColor={Colors.textLight}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  testID="email-input"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Department (Optional)</Text>
              <View style={styles.inputContainer}>
                <Building2 size={20} color={Colors.textSecondary} />
                <TextInput
                  style={styles.input}
                  value={department}
                  onChangeText={setDepartment}
                  placeholder="e.g., Engineering, Marketing"
                  placeholderTextColor={Colors.textLight}
                  autoCapitalize="words"
                  testID="department-input"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputContainer}>
                <Lock size={20} color={Colors.textSecondary} />
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Create a password (min 6 chars)"
                  placeholderTextColor={Colors.textLight}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  testID="password-input"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  {showPassword ? (
                    <EyeOff size={20} color={Colors.textSecondary} />
                  ) : (
                    <Eye size={20} color={Colors.textSecondary} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.signUpButton, signupMutation.isPending && styles.buttonDisabled]}
              onPress={handleSignUp}
              disabled={signupMutation.isPending}
              activeOpacity={0.8}
              testID="signup-button"
            >
              {signupMutation.isPending ? (
                <ActivityIndicator size="small" color={Colors.textInverse} />
              ) : (
                <Text style={styles.signUpButtonText}>Create Account</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.signInLink}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Text style={styles.signInLinkText}>
                Already have an account? <Text style={styles.signInLinkBold}>Sign In</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: 24 },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  header: { marginBottom: 32 },
  title: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: Colors.textInverse,
    marginBottom: 8,
  },
  subtitle: { fontSize: 16, color: 'rgba(255,255,255,0.7)' },
  formCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  inputGroup: { marginBottom: 20 },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  input: { flex: 1, fontSize: 15, color: Colors.text, paddingVertical: 14 },
  signUpButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonDisabled: { opacity: 0.7 },
  signUpButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textInverse,
  },
  signInLink: { marginTop: 24, alignItems: 'center' },
  signInLinkText: { fontSize: 14, color: Colors.textSecondary },
  signInLinkBold: { fontWeight: '600' as const, color: Colors.primary },
});