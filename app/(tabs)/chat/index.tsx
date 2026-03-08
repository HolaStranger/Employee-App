import EditRequestModal from '@/components/EditRequestModal';
import MessageBubble from '@/components/MessageBubble';
import QuickActionChip from '@/components/QuickActionChip';
import { Colors } from '@/constants/colors';
import { useRequests } from '@/contexts/RequestsContext';
import { ConfirmationData, Message } from '@/types';
import { useMutation } from '@tanstack/react-query';
import { Bot, Send } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/* ----------------------------- */
/* Mock Room Data */
/* ----------------------------- */

const ROOMS = [
  { name: 'Conference Room A', capacity: 6, slots: ['10:00-11:00', '14:00-15:00'] },
  { name: 'Conference Room B', capacity: 10, slots: ['09:00-10:00', '11:00-12:00'] },
  { name: 'Board Room', capacity: 20, slots: ['13:00-14:00'] },
];

const LEAVE_TYPES = ['Annual Leave', 'Medical Leave', 'Emergency Leave'];

const QUICK_ACTIONS = [
  { id: '1', label: 'Apply Leave', icon: 'calendar', action: 'leave' },
  { id: '2', label: 'Book Room', icon: 'door', action: 'room' },
];

type ChatState =
  | 'idle'
  | 'leave_start'
  | 'leave_end'
  | 'leave_reason'
  | 'room_people'
  | 'room_date'
  | 'room_slot';

const INITIAL_MESSAGES: Message[] = [
  {
    id: 'asst-1',
    type: 'assistant',
    content:
      "Hello! I'm your TechNova assistant. I can help you apply for leave or book meeting rooms.",
    timestamp: new Date().toISOString(),
  },
];

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);

  const { createLeaveRequest, createRoomBooking } = useRequests();

  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [chatState, setChatState] = useState<ChatState>('idle');

  const [leaveDraft, setLeaveDraft] = useState<any>({});
  const [roomDraft, setRoomDraft] = useState<any>({});

  const [showLeaveOptions, setShowLeaveOptions] = useState(false);
  const [showRoomSlots, setShowRoomSlots] = useState<string[]>([]);

  const [dateField, setDateField] = useState<'start' | 'end' | null>(null);

  const [pendingConfirmation, setPendingConfirmation] = useState<{
    messageId: string;
    data: ConfirmationData;
  } | null>(null);

  const [editModalVisible, setEditModalVisible] = useState(false);

  /* ----------------------------- */
  /* Mutations */
  /* ----------------------------- */

  const leaveMutation = useMutation({
    mutationFn: createLeaveRequest,
    onSuccess: () =>
      addAssistantMessage('✅ Leave request submitted successfully.'),
  });

  const roomMutation = useMutation({
    mutationFn: createRoomBooking,
    onSuccess: () => addAssistantMessage('✅ Room booked successfully.'),
  });

  /* ----------------------------- */
  /* Message Helpers */
  /* ----------------------------- */

  const addUserMessage = (text: string) => {
    const msg: Message = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, msg]);
  };

  const addAssistantMessage = (
    text: string,
    confirmationData?: ConfirmationData
  ) => {
    const msg: Message = {
      id: `asst-${Date.now()}`,
      type: 'assistant',
      content: text,
      timestamp: new Date().toISOString(),
      confirmationData,
    };

    setMessages((prev) => [...prev, msg]);

    if (confirmationData) {
      setPendingConfirmation({ messageId: msg.id, data: confirmationData });
    }
  };

  /* ----------------------------- */
  /* Quick Actions */
  /* ----------------------------- */

  const handleQuickAction = (action: string) => {
    if (action === 'leave') {
      setShowLeaveOptions(true);
      addAssistantMessage('Select leave type');
    }

    if (action === 'room') {
      addAssistantMessage('How many people will attend the meeting?');
      setChatState('room_people');
    }
  };

  /* ----------------------------- */
  /* Chat Logic */
  /* ----------------------------- */

  const processUserInput = (text: string) => {
    if (chatState === 'leave_reason') {
      const finalData: ConfirmationData = {
        requestType: 'leave',
        leaveType: leaveDraft.leaveType,
        startDate: leaveDraft.startDate,
        endDate: leaveDraft.endDate,
        reason: text,
      };

      addAssistantMessage(
        `Leave Request

Type: ${finalData.leaveType}
Start: ${finalData.startDate}
End: ${finalData.endDate}
Reason: ${finalData.reason}

Confirm submission?`,
        finalData
      );

      setChatState('idle');
      return;
    }

    if (chatState === 'room_people') {
      const people = parseInt(text);

      if (isNaN(people)) {
        addAssistantMessage('Please enter a valid number.');
        return;
      }

      setRoomDraft({ people });

      addAssistantMessage('What date do you want to book? (YYYY-MM-DD)');
      setChatState('room_date');
      return;
    }

    if (chatState === 'room_date') {
      const regex = /^\d{4}-\d{2}-\d{2}$/;

      if (!regex.test(text)) {
        addAssistantMessage('Please use YYYY-MM-DD format.');
        return;
      }

      const people = roomDraft.people;

      const room = ROOMS.find((r) => r.capacity >= people);

      if (!room) {
        addAssistantMessage('No room available.');
        setChatState('idle');
        return;
      }

      setRoomDraft({
        ...roomDraft,
        date: text,
        room,
      });

      setShowRoomSlots(room.slots);

      addAssistantMessage(
        `Recommended room: ${room.name}. Select a time slot.`
      );

      setChatState('room_slot');
      return;
    }
  };

  /* ----------------------------- */

  const handleManualDateEntry = (date: string) => {
    const regex = /^\d{4}-\d{2}-\d{2}$/;

    if (!regex.test(date)) {
      addAssistantMessage('Please use YYYY-MM-DD format.');
      return;
    }

    if (dateField === 'start') {
      setLeaveDraft((prev: any) => ({ ...prev, startDate: date }));
      addAssistantMessage(`Start date selected: ${date}`);
      addAssistantMessage('When will your leave end? (YYYY-MM-DD)');
      setDateField('end');
      return;
    }

    if (dateField === 'end') {
      setLeaveDraft((prev: any) => ({ ...prev, endDate: date }));
      addAssistantMessage(`End date selected: ${date}`);
      addAssistantMessage('Please provide a reason for leave');
      setChatState('leave_reason');
    }
  };

  /* ----------------------------- */

  const handleSend = () => {
    if (!inputText.trim()) return;

    const text = inputText.trim();

    addUserMessage(text);
    setInputText('');

    if (chatState === 'leave_start' || chatState === 'leave_end') {
      handleManualDateEntry(text);
      return;
    }

    setTimeout(() => processUserInput(text), 200);
  };

  /* ----------------------------- */
  /* FIXED CONFIRM FUNCTION */
  /* ----------------------------- */

  const handleConfirm = () => {
    if (!pendingConfirmation) return;

    const data = pendingConfirmation.data;

    if (data.requestType === 'leave') {
      leaveMutation.mutate({
        leaveType: data.leaveType ?? '',
        startDate: data.startDate ?? '',
        endDate: data.endDate ?? '',
        reason: data.reason ?? '',
      });
    } else {
      roomMutation.mutate({
        roomName: data.roomName ?? '',
        date: data.date ?? '',
        startTime: data.startTime ?? '',
        endTime: data.endTime ?? '',
        duration: data.duration ?? 60,
        purpose: data.purpose ?? '',
      });
    }
  };

  /* ----------------------------- */

  const renderMessage = ({ item }: { item: Message }) => {
    const showActions = pendingConfirmation?.messageId === item.id;

    return (
      <MessageBubble
        message={item}
        onConfirm={showActions ? handleConfirm : undefined}
      />
    );
  };

  /* ----------------------------- */

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.assistantInfo}>
          <View style={styles.avatar}>
            <Bot size={20} color="#fff" />
          </View>

          <View>
            <Text style={styles.title}>TechNova Assistant</Text>
            <Text style={styles.status}>Online</Text>
          </View>
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
      />

      {/* Leave Options */}

      {showLeaveOptions && (
        <View style={styles.optionsContainer}>
          {LEAVE_TYPES.map((type) => (
            <TouchableOpacity
              key={type}
              style={styles.optionButton}
              onPress={() => {
                setShowLeaveOptions(false);

                setLeaveDraft({ leaveType: type });

                addUserMessage(type);

                addAssistantMessage('When will your leave start? (YYYY-MM-DD)');
                setDateField('start');
                setChatState('leave_start');
              }}
            >
              <Text style={styles.optionText}>{type}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Room Slots */}

      {showRoomSlots.length > 0 && (
        <View style={styles.optionsContainer}>
          {showRoomSlots.map((slot) => (
            <TouchableOpacity
              key={slot}
              style={styles.optionButton}
              onPress={() => {
                setShowRoomSlots([]);

                addUserMessage(slot);

                const room = roomDraft.room;

                const finalData: ConfirmationData = {
                  requestType: 'room',
                  roomName: room.name,
                  date: roomDraft.date,
                  startTime: slot.split('-')[0],
                  endTime: slot.split('-')[1],
                  duration: 60,
                  purpose: 'Meeting',
                };

                addAssistantMessage(
                  `Room Booking

Room: ${room.name}
Date: ${roomDraft.date}
Time: ${slot}

Confirm booking?`,
                  finalData
                );
              }}
            >
              <Text style={styles.optionText}>{slot}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.quickActions}>
        {QUICK_ACTIONS.map((a) => (
          <QuickActionChip
            key={a.id}
            label={a.label}
            icon={a.icon}
            onPress={() => handleQuickAction(a.action)}
          />
        ))}
      </View>

      <View style={[styles.inputContainer, { paddingBottom: insets.bottom }]}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type a message..."
          placeholderTextColor={Colors.textSecondary}
        />

        <TouchableOpacity onPress={handleSend}>
          <Send size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <EditRequestModal
        visible={editModalVisible}
        data={pendingConfirmation?.data || null}
        onSave={() => {}}
        onClose={() => setEditModalVisible(false)}
      />
    </KeyboardAvoidingView>
  );
}

/* ----------------------------- */
/* Styles */
/* ----------------------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  header: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },

  assistantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },

  status: {
    fontSize: 12,
    color: Colors.success,
  },

  quickActions: {
    flexDirection: 'row',
    padding: 10,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },

  optionsContainer: {
    paddingHorizontal: 16,
    gap: 10,
  },

  optionButton: {
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.divider,
  },

  optionText: {
    color: Colors.text,
    fontSize: 14,
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },

  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
  },
});