import RequestCard from '@/components/RequestCard';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useFilteredRequests, useRequests } from '@/contexts/RequestsContext';
import { Request, RequestStatus } from '@/types';
import { useMutation } from '@tanstack/react-query';
import { Calendar, Clock, MapPin } from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type FilterType = 'all' | 'leave' | 'room' | RequestStatus;

const FILTERS: { id: FilterType; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'approved', label: 'Approved' },
  { id: 'rejected', label: 'Rejected' },
  { id: 'booked', label: 'Booked' },
];

export default function RequestsScreen() {
  const { user, isManager } = useAuth();
  const { requests, pendingRequests, approveRequest, refetch, isLoading } = useRequests();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [refreshing, setRefreshing] = useState(false);

  const filteredRequests = useFilteredRequests(activeFilter);

  const approveMutation = useMutation({
    mutationFn: ({ requestId, decision }: { requestId: string; decision: 'approved' | 'rejected' }) =>
      approveRequest(requestId, decision),
    onSuccess: () => {
      console.log('[Requests] Approval action successful');
    },
    onError: (error) => {
      console.error('[Requests] Approval action failed:', error);
    },
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleApprove = useCallback((requestId: string) => {
    console.log('[Requests] Approving request:', requestId);
    approveMutation.mutate({ requestId, decision: 'approved' });
  }, [approveMutation]);

  const handleReject = useCallback((requestId: string) => {
    console.log('[Requests] Rejecting request:', requestId);
    approveMutation.mutate({ requestId, decision: 'rejected' });
  }, [approveMutation]);

  const renderRequest = useCallback(({ item }: { item: Request }) => (
    <RequestCard
      request={item}
      isManager={isManager}
      onApprove={() => handleApprove(item.id)}
      onReject={() => handleReject(item.id)}
      isApproving={approveMutation.isPending}
    />
  ), [isManager, handleApprove, handleReject, approveMutation.isPending]);

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Clock size={48} color={Colors.textLight} />
      </View>
      <Text style={styles.emptyTitle}>No requests found</Text>
      <Text style={styles.emptySubtitle}>
        {activeFilter === 'all'
          ? 'Your requests will appear here'
          : `No ${activeFilter} requests at the moment`}
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading requests...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: Colors.infoLight }]}>
            <Calendar size={20} color={Colors.info} />
          </View>
          <View>
            <Text style={styles.statValue}>
              {requests.filter(r => r.type === 'leave').length}
            </Text>
            <Text style={styles.statLabel}>Leave</Text>
          </View>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: Colors.bookedLight }]}>
            <MapPin size={20} color={Colors.booked} />
          </View>
          <View>
            <Text style={styles.statValue}>
              {requests.filter(r => r.type === 'room').length}
            </Text>
            <Text style={styles.statLabel}>Rooms</Text>
          </View>
        </View>
        {isManager && (
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: Colors.pendingLight }]}>
              <Clock size={20} color={Colors.pending} />
            </View>
            <View>
              <Text style={styles.statValue}>{pendingRequests.length}</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          data={FILTERS}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterChip,
                activeFilter === item.id && styles.filterChipActive,
              ]}
              onPress={() => setActiveFilter(item.id)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterText,
                  activeFilter === item.id && styles.filterTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <FlatList
        data={filteredRequests}
        renderItem={renderRequest}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.primary}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  filterContainer: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  filterList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surfaceAlt,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: Colors.textSecondary,
  },
  filterTextActive: {
    color: Colors.textInverse,
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
