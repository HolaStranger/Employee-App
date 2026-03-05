import { Colors } from '@/constants/colors';
import { LucideIcon } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type DashboardCardProps = {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  iconColor: string;
  onPress: () => void;
  testID?: string;

  // optional (for manager pending approvals card)
  count?: number;
  countLabel?: string;
};

export default function DashboardCard({
  title,
  subtitle,
  icon: Icon,
  iconColor,
  onPress,
  testID,
  count,
  countLabel,
}: DashboardCardProps) {
  return (
    <TouchableOpacity testID={testID} onPress={onPress} style={styles.card} activeOpacity={0.85}>
      <View style={styles.left}>
        <View style={[styles.iconWrap, { backgroundColor: Colors.surfaceAlt }]}>
          <Icon size={20} color={iconColor} />
        </View>

        <View style={styles.textWrap}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
      </View>

      {typeof count === 'number' && (
        <View style={styles.right}>
          <Text style={styles.count}>{count}</Text>
          {!!countLabel && <Text style={styles.countLabel}>{countLabel}</Text>}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: { flex: 1 },
  title: { fontSize: 16, fontWeight: '700', color: Colors.text },
  subtitle: { marginTop: 3, fontSize: 13, color: Colors.textSecondary },
  right: { alignItems: 'flex-end' },
  count: { fontSize: 18, fontWeight: '800', color: Colors.text },
  countLabel: { marginTop: 2, fontSize: 12, color: Colors.textSecondary },
});
