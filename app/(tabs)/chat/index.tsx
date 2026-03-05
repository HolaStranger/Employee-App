import EditRequestModal from '@/components/EditRequestModal';
import MessageBubble from '@/components/MessageBubble';
import QuickActionChip from '@/components/QuickActionChip';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useRequests } from '@/contexts/RequestsContext';
import { ConfirmationData, Message } from '@/types';
import { useMutation } from '@tanstack/react-query';
import { Bot, Send } from 'lucide-react-native';
import React, { useCallback, useRef, useState } from 'react';
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

const QUICK_ACTIONS = [
  { id: '1', label: 'Apply Leave', icon: 'calendar', action: 'leave' },
  { id: '2', label: 'Book Room', icon: 'door', action: 'room' },
];

const INITIAL_MESSAGES: Message[] = [
  {
    id: 'sys-1',
    type: 'system',
    content: 'Chat session started',
    timestamp: new Date().toISOString(),
  },
  {
    id: 'asst-1',
    type: 'assistant',
    content: "Hello! I'm your TechNova assistant. I can help you apply for leave or book meeting rooms. What would you like to do today?",
    timestamp: new Date().toISOString(),
  },
];

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { createLeaveRequest, createRoomBooking } = useRequests();
  const flatListRef = useRef<FlatList>(null);
  
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [pendingConfirmation, setPendingConfirmation] = useState<{
    messageId: string;
    data: ConfirmationData;
  } | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);

  const leaveMutation = useMutation({
    mutationFn: (data: ConfirmationData) => createLeaveRequest({
      leaveType: data.leaveType || 'annual',
      startDate: data.startDate || '',
      endDate: data.endDate || '',
      reason: data.reason || '',
    }),
    onSuccess: () => {
      console.log('[Chat] Leave request created successfully');
      addAssistantMessage('Your leave request has been submitted successfully! You can check its status in the Requests tab.');
      setPendingConfirmation(null);
    },
    onError: (error) => {
      console.error('[Chat] Leave request failed:', error);
      addAssistantMessage('Sorry, there was an error submitting your request. Please try again.');
    },
  });

  const roomMutation = useMutation({
    mutationFn: (data: ConfirmationData) => createRoomBooking({
      roomName: data.roomName || 'Conference Room A',
      date: data.date || '',
      startTime: data.startTime || '',
      endTime: data.endTime || '',
      duration: data.duration || 60,
      purpose: data.purpose || '',
    }),
    onSuccess: () => {
      console.log('[Chat] Room booking created successfully');
      addAssistantMessage('Your room has been booked! Check the Requests tab for details.');
      setPendingConfirmation(null);
    },
    onError: (error) => {
      console.error('[Chat] Room booking failed:', error);
      addAssistantMessage('Sorry, there was an error with your booking. Please try again.');
    },
  });

  const addUserMessage = useCallback((text: string) => {
    const newMessage: Message = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, newMessage]);
  }, []);

  const addAssistantMessage = useCallback((text: string, confirmationData?: ConfirmationData) => {
    const newMessage: Message = {
      id: `asst-${Date.now()}`,
      type: 'assistant',
      content: text,
      timestamp: new Date().toISOString(),
      confirmationData,
    };
    setMessages(prev => [...prev, newMessage]);
    
    if (confirmationData) {
      setPendingConfirmation({ messageId: newMessage.id, data: confirmationData });
    }
  }, []);

  const handleSend = useCallback(() => {
    if (!inputText.trim()) return;
    
    const text = inputText.trim();
    addUserMessage(text);
    setInputText('');

    setTimeout(() => {
      processUserInput(text);
    }, 500);
  }, [inputText, addUserMessage]);

  const processUserInput = (text: string) => {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('leave') || lowerText.includes('vacation') || lowerText.includes('time off') || lowerText.includes('day off')) {
      handleLeaveRequest();
    } else if (lowerText.includes('room') || lowerText.includes('book') || lowerText.includes('meeting') || lowerText.includes('conference')) {
      handleRoomBooking();
    } else {
      addAssistantMessage('I can help you with leave requests and room bookings. Try saying "I want to apply for leave" or "Book a meeting room", or use the quick action buttons below.');
    }
  };

  const handleQuickAction = (action: string) => {
    if (action === 'leave') {
      addUserMessage('I want to apply for leave');
      setTimeout(handleLeaveRequest, 500);
    } else if (action === 'room') {
      addUserMessage('I want to book a meeting room');
      setTimeout(handleRoomBooking, 500);
    }
  };

  const handleLeaveRequest = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 2);
    
    const confirmationData: ConfirmationData = {
      requestType: 'leave',
      leaveType: 'annual',
      startDate: tomorrow.toISOString().split('T')[0],
      endDate: dayAfter.toISOString().split('T')[0],
      reason: 'Personal time off',
    };
    
    addAssistantMessage(
      "I've prepared a leave request for you. Please review the details below and confirm:",
      confirmationData
    );
  };

  const handleRoomBooking = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const confirmationData: ConfirmationData = {
      requestType: 'room',
      roomName: 'Conference Room A',
      date: tomorrow.toISOString().split('T')[0],
      startTime: '10:00',
      endTime: '11:00',
      duration: 60,
      purpose: 'Team meeting',
    };
    
    addAssistantMessage(
      "Here's a room booking for you. Please review and confirm:",
      confirmationData
    );
  };

  const handleConfirm = useCallback(() => {
    if (!pendingConfirmation || !user) return;
    
    console.log('[Chat] Confirming request:', pendingConfirmation.data);
    
    if (pendingConfirmation.data.requestType === 'leave') {
      leaveMutation.mutate(pendingConfirmation.data);
    } else {
      roomMutation.mutate(pendingConfirmation.data);
    }
  }, [pendingConfirmation, user, leaveMutation, roomMutation]);

  const handleEdit = useCallback(() => {
    setEditModalVisible(true);
  }, []);

  const handleSaveEdit = useCallback((updatedData: ConfirmationData) => {
    setEditModalVisible(false);
    if (pendingConfirmation) {
      const updatedMessage: Message = {
        id: `asst-${Date.now()}`,
        type: 'assistant',
        content: 'I\'ve updated your request. Please review the new details:',
        timestamp: new Date().toISOString(),
        confirmationData: updatedData,
      };
      setMessages(prev => [...prev, updatedMessage]);
      setPendingConfirmation({ messageId: updatedMessage.id, data: updatedData });
    }
  }, [pendingConfirmation]);

  const handleCancel = useCallback(() => {
    addAssistantMessage("No problem, I've cancelled that request. Let me know if you need anything else!");
    setPendingConfirmation(null);
  }, [addAssistantMessage]);

  const renderMessage = useCallback(({ item }: { item: Message }) => {
    const showActions = pendingConfirmation?.messageId === item.id;
    const isLoading = (leaveMutation.isPending || roomMutation.isPending) && showActions;
    return (
      <MessageBubble
        message={item}
        onConfirm={showActions ? handleConfirm : undefined}
        onEdit={showActions ? handleEdit : undefined}
        onCancel={showActions ? handleCancel : undefined}
        isLoading={isLoading}
      />
    );
  }, [pendingConfirmation, handleConfirm, handleEdit, handleCancel, leaveMutation.isPending, roomMutation.isPending]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.assistantInfo}>
          <View style={styles.assistantAvatar}>
            <Bot size={20} color={Colors.textInverse} />
          </View>
          <View>
            <Text style={styles.assistantName}>TechNova Assistant</Text>
            <Text style={styles.assistantStatus}>Online • Ready to help</Text>
          </View>
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.quickActionsContainer}>
        {QUICK_ACTIONS.map((action) => (
          <QuickActionChip
            key={action.id}
            label={action.label}
            icon={action.icon}
            onPress={() => handleQuickAction(action.action)}
          />
        ))}
      </View>

      <View style={[styles.inputContainer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message..."
            placeholderTextColor={Colors.textLight}
            multiline
            maxLength={500}
            testID="chat-input"
          />
          <TouchableOpacity
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!inputText.trim()}
            activeOpacity={0.7}
            testID="send-button"
          >
            <Send size={20} color={inputText.trim() ? Colors.textInverse : Colors.textLight} />
          </TouchableOpacity>
        </View>
      </View>

      <EditRequestModal
        visible={editModalVisible}
        data={pendingConfirmation?.data || null}
        onSave={handleSaveEdit}
        onClose={() => setEditModalVisible(false)}
      />
    </KeyboardAvoidingView>
  );
}

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
  assistantAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  assistantName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  assistantStatus: {
    fontSize: 12,
    color: Colors.success,
  },
  messageList: {
    paddingVertical: 16,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 10,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  inputContainer: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 24,
    paddingLeft: 16,
    paddingRight: 4,
    paddingVertical: 4,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: Colors.border,
  },
});
