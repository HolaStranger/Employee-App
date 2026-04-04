import EditRequestModal from '@/components/EditRequestModal';
import MessageBubble from '@/components/MessageBubble';
import QuickActionChip from '@/components/QuickActionChip';
import TypingIndicator from '@/components/TypingIndicator';
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
    id: `asst-initial-${Date.now()}`,
    type: 'assistant',
    content:
      "Hi there! 👋 I'm your TechNova assistant. I'm here to help you manage your day—whether you need to plan some well-deserved time off or find the perfect meeting room. What can I help you with today?",
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  /* ----------------------------- */
  /* Thinking Simulator */
  /* ----------------------------- */

  const simulateThinking = async (duration = 1500) => {
    setIsTyping(true);
    await new Promise((resolve) => setTimeout(resolve, duration));
    setIsTyping(false);
  };

  /* ----------------------------- */
  /* Mutations */
  /* ----------------------------- */

  const leaveMutation = useMutation({
    mutationFn: createLeaveRequest,
    onMutate: () => setIsSubmitting(true),
    onSuccess: () => {
      setPendingConfirmation(null);
      addAssistantMessage('✅ Leave request submitted successfully.');
    },
    onError: (error: any) => {
      addAssistantMessage(`❌ Failed to submit leave request: ${error.message || 'Unknown error'}`);
    },
    onSettled: () => setIsSubmitting(false),
  });

  const roomMutation = useMutation({
    mutationFn: createRoomBooking,
    onMutate: () => setIsSubmitting(true),
    onSuccess: () => {
      setPendingConfirmation(null);
      addAssistantMessage('✅ Room booked successfully.');
    },
    onError: (error: any) => {
      addAssistantMessage(`❌ Failed to book room: ${error.message || 'Unknown error'}`);
    },
    onSettled: () => setIsSubmitting(false),
  });

  /* ----------------------------- */
  /* Message Helpers */
  /* ----------------------------- */

  const addUserMessage = (text: string) => {
    const msg: Message = {
      id: `user-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
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
      id: `asst-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
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

  const handleQuickAction = async (action: string) => {
    if (action === 'leave') {
      setShowLeaveOptions(true);
      addUserMessage('I want to apply for leave.');
      await simulateThinking(1000);
      addAssistantMessage("I'd be happy to help with that! What type of leave are you planning to take? (Annual, Medical, etc.)");
    }

    if (action === 'room') {
      addUserMessage('I need to book a meeting room.');
      await simulateThinking(1200);
      addAssistantMessage('Sure thing! Let’s get that sorted. How many people will be attending the meeting?');
      setChatState('room_people');
    }
  };

  /* ----------------------------- */
  /* Chat Logic */
  /* ----------------------------- */

  const processUserInput = async (text: string) => {
    if (chatState === 'leave_reason') {
      const finalData: ConfirmationData = {
        requestType: 'leave',
        leaveType: leaveDraft.leaveType,
        startDate: leaveDraft.startDate,
        endDate: leaveDraft.endDate,
        reason: text,
      };

      await simulateThinking(1800);
      addAssistantMessage(
        `Got it! I've prepared your leave summary below. Does everything look correct before I submit it for you?`,
        finalData
      );

      setChatState('idle');
      return;
    }

    if (chatState === 'room_people') {
      const people = parseInt(text);

      if (isNaN(people)) {
        await simulateThinking(800);
        addAssistantMessage("Oops, I didn't quite catch that. Could you please enter a number?");
        return;
      }

      setRoomDraft({ people });

      await simulateThinking(1200);
      addAssistantMessage(`Perfect, a room for ${people}. And which date should I look for? (Please use YYYY-MM-DD)`);
      setChatState('room_date');
      return;
    }

    if (chatState === 'room_date') {
      const regex = /^\d{4}-\d{2}-\d{2}$/;

      if (!regex.test(text)) {
        await simulateThinking(800);
        addAssistantMessage("Sorry about that! Could you please use the YYYY-MM-DD format? (e.g., 2026-05-15)");
        return;
      }

      const people = roomDraft.people;
      const room = ROOMS.find((r) => r.capacity >= people);

      await simulateThinking(2000);
      if (!room) {
        addAssistantMessage("I'm so sorry, but I couldn't find a room large enough for your team on that date. Would you like to try a smaller group or a different day?");
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
        `I found a great match! I recommend the ${room.name}. Which of these available time slots works best for you?`
      );

      setChatState('room_slot');
      return;
    }
  };

  /* ----------------------------- */

  const handleManualDateEntry = async (date: string) => {
    const regex = /^\d{4}-\d{2}-\d{2}$/;

    if (!regex.test(date)) {
      await simulateThinking(800);
      addAssistantMessage("I'm sorry, I need the date in YYYY-MM-DD format to process this. Could you try again?");
      return;
    }

    if (dateField === 'start') {
      setLeaveDraft((prev: any) => ({ ...prev, startDate: date }));
      await simulateThinking(1200);
      addAssistantMessage(`Noted! Your leave starts on ${date}. And when is your last day of leave?`);
      setDateField('end');
      return;
    }

    if (dateField === 'end') {
      setLeaveDraft((prev: any) => ({ ...prev, endDate: date }));
      await simulateThinking(1200);
      addAssistantMessage('Almost done! Could you share a quick reason for the leave? (e.g., Vacation, Family, etc.)');
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
    if (!pendingConfirmation || isSubmitting || leaveMutation.isPending || roomMutation.isPending) return;

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
        isLoading={showActions && (isSubmitting || leaveMutation.isPending || roomMutation.isPending)}
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
        ListFooterComponent={isTyping ? <TypingIndicator /> : null}
      />

      {/* Leave Options */}

      {showLeaveOptions && (
        <View style={styles.optionsContainer}>
          {LEAVE_TYPES.map((type) => (
            <TouchableOpacity
              key={type}
              style={styles.optionButton}
              onPress={async () => {
                setShowLeaveOptions(false);
                setLeaveDraft({ leaveType: type });
                addUserMessage(type);

                await simulateThinking(1500);
                addAssistantMessage("Got it! And when would you like your leave to begin? (YYYY-MM-DD)");
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
              onPress={async () => {
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

                await simulateThinking(1800);
                addAssistantMessage(
                  `Awesome choice! I've put together the details for the ${room.name} below. Does it look all set?`,
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