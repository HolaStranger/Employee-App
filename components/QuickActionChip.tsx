import { Colors } from '@/constants/colors';
import { Calendar, DoorOpen } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

interface QuickActionChipProps {
  label: string;
  icon: string;
  onPress: () => void;
}

export default function QuickActionChip({ label, icon, onPress }: QuickActionChipProps) {
  const getIcon = () => {
    switch (icon) {
      case 'calendar':
        return <Calendar size={14} color={Colors.primary} />;
      case 'door':
        return <DoorOpen size={14} color={Colors.primary} />;
      default:
        return null;
    }
  };

  return (
    <TouchableOpacity style={styles.chip} onPress={onPress} activeOpacity={0.7}>
      {getIcon()}
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.primary,
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: Colors.primary,
  },
});