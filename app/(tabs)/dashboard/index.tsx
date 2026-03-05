import DashboardCard from '@/components/DashboardCard';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useRequests } from '@/contexts/RequestsContext';
import { useRouter } from 'expo-router';
import {
    AlertCircle,
    Building2,
    Calendar,
    CheckCircle,
    ClipboardList,
    Clock,
    DoorOpen,
} from 'lucide-react-native';
import React, { useMemo } from 'react';
import {
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DashboardScreen() {
  const router = useRouter();
  const { user, isManager } = useAuth();
  const { requests, pendingRequests, isLoading, refetch } = useRequests();

  const stats = useMemo(() => {
    const userRequests = isManager 
      ? requests 
      : requests.filter(r => r.userId === user?.id);
    
    const pending = userRequests.filter(r => r.status === 'pending').length;
    const approved = userRequests.filter(r => r.status === 'approved').length;
    const booked = userRequests.filter(r => r.status === 'booked').length;
    const pendingApprovals = isManager 
      ? requests.filter(r => r.status === 'pending').length 
      : 0;
    
    return { pending, approved, booked, pendingApprovals };
  }, [requests, user, isManager]);

  const handleApplyLeave = () => {
    console.log('[Dashboard] Navigate to Chat with Apply Leave intent');
    // TODO: Pass intent to Chat screen for AI processing
    router.push({
      pathname: '/(tabs)/chat',
      params: { intent: 'apply_leave' },
    });
  };

  const handleBookRoom = () => {
    console.log('[Dashboard] Navigate to Chat with Book Room intent');
    // TODO: Pass intent to Chat screen for AI processing
    router.push({
      pathname: '/(tabs)/chat',
      params: { intent: 'book_room' },
    });
  };

  const handleViewRequests = () => {
    console.log('[Dashboard] Navigate to Requests tab');
    router.push('/(tabs)/requests');
  };

  const handlePendingApprovals = () => {
    console.log('[Dashboard] Navigate to Requests with pending filter');
    router.push({
      pathname: '/(tabs)/requests',
      params: { filter: 'pending' },
    });
  };

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            tintColor={Colors.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>{greeting},</Text>
          <Text style={styles.userName}>{user?.name || 'User'}</Text>
          <Text style={styles.subtitle}>What would you like to do today?</Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <DashboardCard
            title="Apply Leave"
            subtitle="Request time off from work"
            icon={Calendar}
            iconColor={Colors.info}
            onPress={handleApplyLeave}
            testID="dashboard-apply-leave"
          />
          
          <DashboardCard
            title="Book Meeting Room"
            subtitle="Reserve a space for your meeting"
            icon={DoorOpen}
            iconColor={Colors.success}
            onPress={handleBookRoom}
            testID="dashboard-book-room"
          />
          
          <DashboardCard
            title="View My Requests"
            subtitle="Check status of your requests"
            icon={ClipboardList}
            iconColor={Colors.primary}
            onPress={handleViewRequests}
            testID="dashboard-view-requests"
          />

          {/* Manager-only: Pending Approvals */}
          {isManager && (
            <DashboardCard
              title="Pending Approvals"
              subtitle="Review employee requests"
              icon={AlertCircle}
              iconColor={Colors.warning}
              count={stats.pendingApprovals}
              countLabel="pending"
              onPress={handlePendingApprovals}
              testID="dashboard-pending-approvals"
            />
          )}
        </View>

        {/* Status Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Status Summary</Text>
          
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: Colors.pendingLight }]}>
              <Clock size={22} color={Colors.pending} />
              <Text style={[styles.statCount, { color: Colors.pending }]}>
                {stats.pending}
              </Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
            
            <View style={[styles.statCard, { backgroundColor: Colors.approvedLight }]}>
              <CheckCircle size={22} color={Colors.approved} />
              <Text style={[styles.statCount, { color: Colors.approved }]}>
                {stats.approved}
              </Text>
              <Text style={styles.statLabel}>Approved</Text>
            </View>
            
            <View style={[styles.statCard, { backgroundColor: Colors.bookedLight }]}>
              <Building2 size={22} color={Colors.booked} />
              <Text style={[styles.statCount, { color: Colors.booked }]}>
                {stats.booked}
              </Text>
              <Text style={styles.statLabel}>Booked</Text>
            </View>
          </View>
        </View>

        {/* Role Badge */}
        <View style={styles.roleContainer}>
          <View style={[
            styles.roleBadge,
            { backgroundColor: isManager ? Colors.warningLight : Colors.infoLight }
          ]}>
            <Text style={[
              styles.roleText,
              { color: isManager ? Colors.warning : Colors.info }
            ]}>
              {isManager ? '👔 Manager' : '👤 Employee'}
            </Text>
          </View>
          <Text style={styles.departmentText}>{user?.department || 'General'}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  header: {
    paddingTop: 16,
    paddingBottom: 24,
  },
  greeting: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  userName: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 14,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  statCount: {
    fontSize: 28,
    fontWeight: '700' as const,
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  roleContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  roleBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 8,
  },
  roleText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  departmentText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
});
