import { Colors } from '@/constants/colors';
import { Message } from '@/types';
import { Bot, User } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import ConfirmationCard from './ConfirmationCard';

interface MessageBubbleProps {
  message: Message;
  onConfirm?: () => void;
  onEdit?: () => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

export default function MessageBubble({ message, onConfirm, onEdit, onCancel, isLoading }: MessageBubbleProps) {
  const isUser = message.type === 'user';
  const isSystem = message.type === 'system';
  const isAssistant = message.type === 'assistant';

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (isSystem) {
    return (
      <View style={styles.systemContainer}>
        <View style={styles.systemBubble}>
          <Text style={styles.systemText}>{message.content}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.assistantContainer]}>
      {isAssistant && (
        <View style={styles.avatarContainer}>
          <View style={styles.botAvatar}>
            <Bot size={16} color={Colors.textInverse} />
          </View>
        </View>
      )}
      
      <View style={styles.bubbleWrapper}>
        <View style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}>
          <Text style={[styles.messageText, isUser && styles.userText]}>
            {message.content}
          </Text>
        </View>
        
        {message.confirmationData && (
          <View>
            <ConfirmationCard
              data={message.confirmationData}
              onConfirm={onConfirm}
              onEdit={onEdit}
              onCancel={onCancel}
              isLoading={isLoading}
            />
          </View>
        )}
        
        <Text style={[styles.timestamp, isUser && styles.timestampRight]}>
          {formatTime(message.timestamp)}
        </Text>
      </View>

      {isUser && (
        <View style={styles.avatarContainer}>
          <View style={styles.userAvatar}>
            <User size={16} color={Colors.textInverse} />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginVertical: 4,
    paddingHorizontal: 12,
  },
  userContainer: {
    justifyContent: 'flex-end',
  },
  assistantContainer: {
    justifyContent: 'flex-start',
  },
  systemContainer: {
    alignItems: 'center',
    marginVertical: 8,
    paddingHorizontal: 12,
  },
  avatarContainer: {
    marginTop: 4,
  },
  botAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubbleWrapper: {
    maxWidth: '75%',
    marginHorizontal: 8,
  },
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  userBubble: {
    backgroundColor: Colors.userBubble,
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: Colors.assistantBubble,
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  systemBubble: {
    backgroundColor: Colors.systemBubble,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
    color: Colors.text,
  },
  userText: {
    color: Colors.textInverse,
  },
  systemText: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  timestamp: {
    fontSize: 11,
    color: Colors.textLight,
    marginTop: 4,
  },
  timestampRight: {
    textAlign: 'right',
  },
});
