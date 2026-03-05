import { Colors } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useRequests } from '@/contexts/RequestsContext';
import {
  Bell,
  Building2,
  ChevronRight,
  HelpCircle,
  LogOut,
  Mail,
  Settings,
  Shield,
  User,
} from 'lucide-react-native';
import React, { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const [popup, setPopup] = useState<{ title: string; message: string } | null>(null);
  const [logoutModal, setLogoutModal] = useState(false);

  const insets = useSafeAreaInsets();
  const { user, isManager, logout } = useAuth();
  const { leaveRequests, roomBookings, pendingRequests } = useRequests();

  const handleLogout = () => {
  setLogoutModal(true);
};

  const menuItems = [
    {
      icon: Bell,
      label: 'Notifications',
      subtitle: 'Manage your notification preferences',
      onPress: () =>
        setPopup({
          title: 'Coming Soon',
          message: 'Notification settings will be available in a future update.',
        }),
    },
    {
      icon: Settings,
      label: 'Settings',
      subtitle: 'App settings and preferences',
      onPress: () =>
        setPopup({
          title: 'Coming Soon',
          message: 'Settings will be available in a future update.',
        }),
    },
    {
      icon: HelpCircle,
      label: 'Help & Support',
      subtitle: 'Get help or contact support',
      onPress: () =>
        setPopup({
          title: 'Help & Support',
          message: 'For support, please contact support@technova.com',
        }),
    },
  ];

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <View style={[styles.avatar, isManager && styles.managerAvatar]}>
              <User size={40} color={Colors.textInverse} />
            </View>
            <View style={[styles.roleBadge, isManager ? styles.managerBadge : styles.employeeBadge]}>
              <Shield size={12} color={Colors.textInverse} />
            </View>
          </View>

          <Text style={styles.userName}>{user?.name || 'User'}</Text>
          <View style={styles.roleTag}>
            <Text style={styles.roleText}>{isManager ? 'Manager' : 'Employee'}</Text>
          </View>
        </View>

        <View style={styles.statsSection}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{leaveRequests.length}</Text>
              <Text style={styles.statTitle}>Leave Requests</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{roomBookings.length}</Text>
              <Text style={styles.statTitle}>Room Bookings</Text>
            </View>

            {isManager && (
              <>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={[styles.statNumber, { color: Colors.pending }]}>
                    {pendingRequests.length}
                  </Text>
                  <Text style={styles.statTitle}>To Review</Text>
                </View>
              </>
            )}
          </View>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <Mail size={18} color={Colors.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{user?.email || 'Not set'}</Text>
              </View>
            </View>

            <View style={styles.infoDivider} />

            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <Building2 size={18} color={Colors.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Department</Text>
                <Text style={styles.infoValue}>{user?.department || 'Not set'}</Text>
              </View>
            </View>

            <View style={styles.infoDivider} />

            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <Shield size={18} color={Colors.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Role</Text>
                <Text style={styles.infoValue}>{isManager ? 'Team Manager' : 'Team Member'}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <View style={styles.menuIconContainer}>
                <item.icon size={20} color={Colors.textSecondary} />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </View>
              <ChevronRight size={20} color={Colors.textLight} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.7}
            testID="logout-button"
          >
            <LogOut size={20} color={Colors.error} />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>

          <Text style={styles.versionText}>TechNova Assistant v1.0.0</Text>
        </View>
      </ScrollView>

      {/* ✅ Popup Modal */}
      <Modal
        visible={!!popup}
        transparent
        animationType="fade"
        onRequestClose={() => setPopup(null)}
      >
        <View style={styles.popupBackdrop}>
          <View style={styles.popupCard}>
            <Text style={styles.popupTitle}>{popup?.title}</Text>
            <Text style={styles.popupMessage}>{popup?.message}</Text>

            <TouchableOpacity
              style={styles.popupButton}
              onPress={() => setPopup(null)}
              activeOpacity={0.8}
            >
              <Text style={styles.popupButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* ✅ Logout Confirm Modal */}
<Modal
  visible={logoutModal}
  transparent
  animationType="fade"
  onRequestClose={() => setLogoutModal(false)}
>
  <View style={styles.popupBackdrop}>
    <View style={styles.popupCard}>
      <Text style={styles.popupTitle}>Logout</Text>
      <Text style={styles.popupMessage}>Are you sure you want to logout?</Text>

      <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 10 }}>
        <TouchableOpacity
          style={[styles.popupButton, { backgroundColor: Colors.border }]}
          onPress={() => setLogoutModal(false)}
          activeOpacity={0.8}
        >
          <Text style={[styles.popupButtonText, { color: Colors.text }]}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.popupButton, { backgroundColor: Colors.error }]}
          onPress={async () => {
            console.log("[Profile] Logging out...");
            setLogoutModal(false);
            await logout(); // ✅ triggers tabs redirect
          }}
          activeOpacity={0.8}
        >
          <Text style={styles.popupButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
</Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  profileHeader: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  avatarContainer: { position: 'relative', marginBottom: 12 },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  managerAvatar: { backgroundColor: Colors.accent },
  roleBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.surface,
  },
  managerBadge: { backgroundColor: Colors.warning },
  employeeBadge: { backgroundColor: Colors.info },

  userName: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  roleTag: {
    backgroundColor: Colors.surfaceAlt,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  roleText: { fontSize: 13, fontWeight: '500' as const, color: Colors.textSecondary },

  statsSection: { padding: 16 },
  statsRow: { flexDirection: 'row', backgroundColor: Colors.surface, borderRadius: 16, padding: 16 },
  statItem: { flex: 1, alignItems: 'center' },
  statNumber: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.primary,
    marginBottom: 4,
  },
  statTitle: { fontSize: 12, color: Colors.textSecondary },
  statDivider: { width: 1, backgroundColor: Colors.divider, marginHorizontal: 8 },

  infoSection: { paddingHorizontal: 16, paddingBottom: 16 },
  infoCard: { backgroundColor: Colors.surface, borderRadius: 16, overflow: 'hidden' },
  infoRow: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14 },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.infoLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 12, color: Colors.textSecondary, marginBottom: 2 },
  infoValue: { fontSize: 15, fontWeight: '500' as const, color: Colors.text },
  infoDivider: { height: 1, backgroundColor: Colors.divider, marginLeft: 70 },

  menuSection: { paddingHorizontal: 16 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    gap: 14,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuContent: { flex: 1 },
  menuLabel: { fontSize: 15, fontWeight: '500' as const, color: Colors.text, marginBottom: 2 },
  menuSubtitle: { fontSize: 12, color: Colors.textSecondary },

  footer: { paddingHorizontal: 16, paddingTop: 24, alignItems: 'center' },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.errorLight,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
    width: '100%',
    marginBottom: 16,
  },
  logoutText: { fontSize: 15, fontWeight: '600' as const, color: Colors.error },
  versionText: { fontSize: 12, color: Colors.textLight },

  /* ✅ Popup styles */
  popupBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  popupCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  popupTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  popupMessage: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  popupButton: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  popupButtonText: { color: Colors.textInverse, fontWeight: '700' as const },
});
