import { Colors } from '@/constants/colors';
import { ConfirmationData } from '@/types';
import { Calendar, Check, Clock, FileText, MapPin, Pencil, X } from 'lucide-react-native';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ConfirmationCardProps {
  data: ConfirmationData;
  onConfirm?: () => void;
  onEdit?: () => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

export default function ConfirmationCard({ data, onConfirm, onEdit, onCancel, isLoading }: ConfirmationCardProps) {
  const isLeave = data.requestType === 'leave';
  const showActions = onConfirm || onEdit || onCancel;

  const formatLeaveType = (type?: string) => {
    if (!type) return '';
    return type.charAt(0).toUpperCase() + type.slice(1) + ' Leave';
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.badge, isLeave ? styles.leaveBadge : styles.roomBadge]}>
          <Text style={[styles.badgeText, isLeave ? styles.leaveBadgeText : styles.roomBadgeText]}>
            {isLeave ? 'Leave Request' : 'Room Booking'}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        {isLeave ? (
          <>
            <View style={styles.row}>
              <FileText size={16} color={Colors.textSecondary} />
              <Text style={styles.label}>Type:</Text>
              <Text style={styles.value}>{formatLeaveType(data.leaveType)}</Text>
            </View>
            <View style={styles.row}>
              <Calendar size={16} color={Colors.textSecondary} />
              <Text style={styles.label}>From:</Text>
              <Text style={styles.value}>{data.startDate}</Text>
            </View>
            <View style={styles.row}>
              <Calendar size={16} color={Colors.textSecondary} />
              <Text style={styles.label}>To:</Text>
              <Text style={styles.value}>{data.endDate}</Text>
            </View>
            {data.reason && (
              <View style={styles.row}>
                <FileText size={16} color={Colors.textSecondary} />
                <Text style={styles.label}>Reason:</Text>
                <Text style={styles.value} numberOfLines={2}>{data.reason}</Text>
              </View>
            )}
          </>
        ) : (
          <>
            <View style={styles.row}>
              <MapPin size={16} color={Colors.textSecondary} />
              <Text style={styles.label}>Room:</Text>
              <Text style={styles.value}>{data.roomName}</Text>
            </View>
            <View style={styles.row}>
              <Calendar size={16} color={Colors.textSecondary} />
              <Text style={styles.label}>Date:</Text>
              <Text style={styles.value}>{data.date}</Text>
            </View>
            <View style={styles.row}>
              <Clock size={16} color={Colors.textSecondary} />
              <Text style={styles.label}>Time:</Text>
              <Text style={styles.value}>{data.startTime} - {data.endTime}</Text>
            </View>
            <View style={styles.row}>
              <Clock size={16} color={Colors.textSecondary} />
              <Text style={styles.label}>Duration:</Text>
              <Text style={styles.value}>{data.duration} mins</Text>
            </View>
            {data.purpose && (
              <View style={styles.row}>
                <FileText size={16} color={Colors.textSecondary} />
                <Text style={styles.label}>Purpose:</Text>
                <Text style={styles.value} numberOfLines={2}>{data.purpose}</Text>
              </View>
            )}
          </>
        )}
      </View>

      {showActions && (
        <View style={styles.actions}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={Colors.primary} />
              <Text style={styles.loadingText}>Submitting...</Text>
            </View>
          ) : (
            <>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={onCancel}
                activeOpacity={0.7}
              >
                <X size={16} color={Colors.error} />
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.button, styles.editButton]}
                onPress={onEdit}
                activeOpacity={0.7}
              >
                <Pencil size={16} color={Colors.primary} />
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.button, styles.confirmButton]}
                onPress={onConfirm}
                activeOpacity={0.7}
              >
                <Check size={16} color={Colors.textInverse} />
                <Text style={styles.confirmButtonText}>Confirm</Text>
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
    borderRadius: 12,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  leaveBadge: {
    backgroundColor: Colors.infoLight,
  },
  roomBadge: {
    backgroundColor: Colors.bookedLight,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  leaveBadgeText: {
    color: Colors.info,
  },
  roomBadgeText: {
    color: Colors.booked,
  },
  content: {
    padding: 14,
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontSize: 13,
    color: Colors.textSecondary,
    width: 60,
  },
  value: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500' as const,
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    gap: 8,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 4,
  },
  cancelButton: {
    backgroundColor: Colors.errorLight,
  },
  editButton: {
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  confirmButton: {
    backgroundColor: Colors.success,
  },
  cancelButtonText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.error,
  },
  editButtonText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  confirmButtonText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textInverse,
  },
  loadingContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 6,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.primary,
  },
});
