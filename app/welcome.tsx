import { Colors } from '@/constants/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Briefcase, ChevronRight, Users, Zap } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();

  const handleRoleSelect = (role: 'employee' | 'manager') => {
    console.log('[Welcome] Selected role:', role);
    router.push({ pathname: '/signin', params: { role } });
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.primaryDark, Colors.primary, '#1A6FA3']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      <View style={[styles.content, { paddingTop: insets.top + 60 }]}>
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Zap size={40} color={Colors.accent} />
          </View>
          <Text style={styles.appName}>TechNova</Text>
          <Text style={styles.tagline}>Intelligent Employee Assistant</Text>
        </View>

        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Welcome!</Text>
          <Text style={styles.instructionText}>Select your role to get started</Text>

          <TouchableOpacity
            style={styles.roleCard}
            onPress={() => handleRoleSelect('employee')}
            activeOpacity={0.8}
          >
            <View style={styles.roleIconContainer}>
              <Briefcase size={24} color={Colors.primary} />
            </View>
            <View style={styles.roleInfo}>
              <Text style={styles.roleTitle}>Employee</Text>
              <Text style={styles.roleDescription}>Apply for leave, book rooms, chat with assistant</Text>
            </View>
            <ChevronRight size={20} color={Colors.textLight} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.roleCard}
            onPress={() => handleRoleSelect('manager')}
            activeOpacity={0.8}
          >
            <View style={[styles.roleIconContainer, styles.managerIcon]}>
              <Users size={24} color={Colors.accent} />
            </View>
            <View style={styles.roleInfo}>
              <Text style={styles.roleTitle}>Manager</Text>
              <Text style={styles.roleDescription}>Review and approve team requests</Text>
            </View>
            <ChevronRight size={20} color={Colors.textLight} />
          </TouchableOpacity>
        </View>

        <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
          <Text style={styles.footerText}>TechNova Hackathon MVP</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: Colors.textInverse,
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  welcomeSection: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.textInverse,
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 32,
  },
  roleCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  roleIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.infoLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  managerIcon: {
    backgroundColor: Colors.accentLight,
  },
  roleInfo: {
    flex: 1,
    marginLeft: 16,
  },
  roleTitle: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  roleDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
  },
});
