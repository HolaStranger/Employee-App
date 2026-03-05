import { Colors } from '@/constants/colors';
import { ConfirmationData, LeaveType } from '@/types';
import { Calendar, Clock, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface EditRequestModalProps {
  visible: boolean;
  data: ConfirmationData | null;
  onSave: (data: ConfirmationData) => void;
  onClose: () => void;
}

const LEAVE_TYPES: { value: LeaveType; label: string }[] = [
  { value: 'annual', label: 'Annual Leave' },
  { value: 'sick', label: 'Sick Leave' },
  { value: 'personal', label: 'Personal Leave' },
  { value: 'emergency', label: 'Emergency Leave' },
];

const ROOMS = [
  'Conference Room A',
  'Conference Room B',
  'Meeting Room 1',
  'Meeting Room 2',
  'Board Room',
];

export default function EditRequestModal({ visible, data, onSave, onClose }: EditRequestModalProps) {
  const insets = useSafeAreaInsets();
  const [editedData, setEditedData] = useState<ConfirmationData | null>(null);

  useEffect(() => {
    if (data) {
      setEditedData({ ...data });
    }
  }, [data]);

  if (!editedData) return null;

  const isLeave = editedData.requestType === 'leave';

  const handleSave = () => {
    if (editedData) {
      onSave(editedData);
    }
  };

  const updateField = (field: keyof ConfirmationData, value: string | number) => {
    setEditedData(prev => prev ? { ...prev, [field]: value } : null);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { paddingTop: Platform.OS === 'ios' ? 0 : insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>
            Edit {isLeave ? 'Leave Request' : 'Room Booking'}
          </Text>
          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {isLeave ? (
            <>
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Leave Type</Text>
                <View style={styles.optionsContainer}>
                  {LEAVE_TYPES.map((type) => (
                    <TouchableOpacity
                      key={type.value}
                      style={[
                        styles.optionChip,
                        editedData.leaveType === type.value && styles.optionChipActive,
                      ]}
                      onPress={() => updateField('leaveType', type.value)}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          editedData.leaveType === type.value && styles.optionTextActive,
                        ]}
                      >
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Start Date</Text>
                <View style={styles.inputContainer}>
                  <Calendar size={20} color={Colors.textSecondary} />
                  <TextInput
                    style={styles.input}
                    value={editedData.startDate || ''}
                    onChangeText={(text) => updateField('startDate', text)}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={Colors.textLight}
                  />
                </View>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>End Date</Text>
                <View style={styles.inputContainer}>
                  <Calendar size={20} color={Colors.textSecondary} />
                  <TextInput
                    style={styles.input}
                    value={editedData.endDate || ''}
                    onChangeText={(text) => updateField('endDate', text)}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={Colors.textLight}
                  />
                </View>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Reason (Optional)</Text>
                <View style={[styles.inputContainer, styles.textAreaContainer]}>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={editedData.reason || ''}
                    onChangeText={(text) => updateField('reason', text)}
                    placeholder="Enter reason for leave"
                    placeholderTextColor={Colors.textLight}
                    multiline
                    numberOfLines={3}
                  />
                </View>
              </View>
            </>
          ) : (
            <>
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Room</Text>
                <View style={styles.optionsContainer}>
                  {ROOMS.map((room) => (
                    <TouchableOpacity
                      key={room}
                      style={[
                        styles.optionChip,
                        editedData.roomName === room && styles.optionChipActive,
                      ]}
                      onPress={() => updateField('roomName', room)}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          editedData.roomName === room && styles.optionTextActive,
                        ]}
                      >
                        {room}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Date</Text>
                <View style={styles.inputContainer}>
                  <Calendar size={20} color={Colors.textSecondary} />
                  <TextInput
                    style={styles.input}
                    value={editedData.date || ''}
                    onChangeText={(text) => updateField('date', text)}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={Colors.textLight}
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={[styles.fieldGroup, styles.halfField]}>
                  <Text style={styles.label}>Start Time</Text>
                  <View style={styles.inputContainer}>
                    <Clock size={20} color={Colors.textSecondary} />
                    <TextInput
                      style={styles.input}
                      value={editedData.startTime || ''}
                      onChangeText={(text) => updateField('startTime', text)}
                      placeholder="HH:MM"
                      placeholderTextColor={Colors.textLight}
                    />
                  </View>
                </View>

                <View style={[styles.fieldGroup, styles.halfField]}>
                  <Text style={styles.label}>End Time</Text>
                  <View style={styles.inputContainer}>
                    <Clock size={20} color={Colors.textSecondary} />
                    <TextInput
                      style={styles.input}
                      value={editedData.endTime || ''}
                      onChangeText={(text) => updateField('endTime', text)}
                      placeholder="HH:MM"
                      placeholderTextColor={Colors.textLight}
                    />
                  </View>
                </View>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Purpose (Optional)</Text>
                <View style={[styles.inputContainer, styles.textAreaContainer]}>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={editedData.purpose || ''}
                    onChangeText={(text) => updateField('purpose', text)}
                    placeholder="Enter meeting purpose"
                    placeholderTextColor={Colors.textLight}
                    multiline
                    numberOfLines={3}
                  />
                </View>
              </View>
            </>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.primary,
    borderRadius: 8,
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.textInverse,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  fieldGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  textAreaContainer: {
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    paddingVertical: 14,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  optionChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  optionChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  optionText: {
    fontSize: 14,
    color: Colors.text,
  },
  optionTextActive: {
    color: Colors.textInverse,
    fontWeight: '500' as const,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfField: {
    flex: 1,
  },
});
