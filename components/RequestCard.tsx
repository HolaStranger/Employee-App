import { Colors } from '@/constants/colors';
import { Request, RequestStatus } from '@/types';
import { Calendar, Check, Clock, FileText, MapPin, X } from 'lucide-react-native';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface RequestCardProps {
  request: Request;
  isManager?: boolean;
  onApprove?: () => void;
  onReject?: () => void;
  isApproving?: boolean;
}

export default function RequestCard({ request, isManager, onApprove, onReject, isApproving }: RequestCardProps) {
  const isLeave = request.type === 'leave';
  const isPending = request.status === 'pending';

  const getStatusColor = (status: RequestStatus) => {
    switch (status) {
      case 'draft': return { bg: Colors.draftLight, text: Colors.draft };
      case 'pending': return { bg: Colors.pendingLight, text: Colors.pending };
      case 'approved': return { bg: Colors.approvedLight, text: Colors.approved };
      case 'rejected': return { bg: Colors.rejectedLight, text: Colors.rejected };
      case 'booked': return { bg: Colors.bookedLight, text: Colors.booked };
      default: return { bg: Colors.draftLight, text: Colors.draft };
    }
  };

  const statusColors = getStatusColor(request.status);

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const formatLeaveType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.typeIcon, isLeave ? styles.leaveIcon : styles.roomIcon]}>
            {isLeave ? (
              <Calendar size={18} color={Colors.info} />
            ) : (
              <MapPin size={18} color={Colors.booked} />
            )}
          </View>
          <View style={styles.headerText}>
            <Text style={styles.title} numberOfLines={1}>
              {isLeave 
                ? `${formatLeaveType(request.leaveType)} Leave` 
                : request.roomName}
            </Text>
            <Text style={styles.subtitle}>
              {isManager ? request.userName : (isLeave ? 'Leave Request' : 'Room Booking')}
            </Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
          <Text style={[styles.statusText, { color: statusColors.text }]}>
            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        {isLeave ? (
          <>
            <View style={styles.infoRow}>
              <Calendar size={14} color={Colors.textSecondary} />
              <Text style={styles.infoText}>
                {formatDate(request.startDate)} - {formatDate(request.endDate)}
              </Text>
            </View>
            {request.reason && (
              <View style={styles.infoRow}>
                <FileText size={14} color={Colors.textSecondary} />
                <Text style={styles.infoText} numberOfLines={1}>{request.reason}</Text>
              </View>
            )}
            {request.approvedBy && (
              <View style={styles.infoRow}>
                <Check size={14} color={Colors.success} />
                <Text style={[styles.infoText, { color: Colors.success }]}>
                  Approved by {request.approvedBy}
                </Text>
              </View>
            )}
          </>
        ) : (
          <>
            <View style={styles.infoRow}>
              <Calendar size={14} color={Colors.textSecondary} />
              <Text style={styles.infoText}>{formatDate(request.date)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Clock size={14} color={Colors.textSecondary} />
              <Text style={styles.infoText}>
                {request.startTime} - {request.endTime} ({request.duration} mins)
              </Text>
            </View>
            {request.purpose && (
              <View style={styles.infoRow}>
                <FileText size={14} color={Colors.textSecondary} />
                <Text style={styles.infoText} numberOfLines={1}>{request.purpose}</Text>
              </View>
            )}
          </>
        )}
      </View>

      {isManager && isPending && (
        <View style={styles.actions}>
          {isApproving ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={Colors.primary} />
              <Text style={styles.loadingText}>Processing...</Text>
            </View>
          ) : (
            <>
              <TouchableOpacity
                style={[styles.actionButton, styles.rejectButton]}
                onPress={onReject}
                activeOpacity={0.7}
                testID="reject-button"
              >
                <X size={16} color={Colors.error} />
                <Text style={styles.rejectText}>Reject</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.approveButton]}
                onPress={onApprove}
                activeOpacity={0.7}
                testID="approve-button"
              >
                <Check size={16} color={Colors.textInverse} />
                <Text style={styles.approveText}>Approve</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  headerText: {
    flex: 1,
  },
  typeIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leaveIcon: {
    backgroundColor: Colors.infoLight,
  },
  roomIcon: {
    backgroundColor: Colors.bookedLight,
  },
  title: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  content: {
    padding: 16,
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: Colors.textSecondary,
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  rejectButton: {
    backgroundColor: Colors.errorLight,
  },
  approveButton: {
    backgroundColor: Colors.success,
  },
  rejectText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.error,
  },
  approveText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textInverse,
  },
  loadingContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.primary,
  },
});
