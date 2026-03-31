import React, { useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GarageStatusColors, GarageTheme } from '@/constants/garage-theme';
import type { Order } from '../utils/storage';

type OrderCardProps = {
  order: Order;
  onAdvance?: (order: Order) => void;
  onPress?: (order: Order) => void;
};

export default function OrderCard({ order, onAdvance, onPress }: OrderCardProps) {
  const color = GarageStatusColors[order.status] || GarageTheme.goldBright;
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () => Animated.spring(scale, { toValue: 0.985, useNativeDriver: true }).start();
  const onPressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();

  return (
    <TouchableOpacity activeOpacity={0.95} onPress={() => onPress?.(order)} onPressIn={onPressIn} onPressOut={onPressOut}>
      <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
        <View style={styles.row}>
          <View style={styles.titleWrap}>
            <View style={[styles.indicator, { backgroundColor: color }]} />
            <Text style={styles.title}>{order.name}</Text>
            <Text style={styles.sub}>{order.bike}</Text>
          </View>

          <View style={[styles.statusChip, { borderColor: color }]}>
            <Text style={[styles.statusText, { color }]}>{order.status}</Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.meta}>{order.service}</Text>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.meta}>{order.date}</Text>
        </View>

        <Text style={styles.slot}>{order.slot}</Text>

        {onAdvance ? (
          <View style={styles.actions}>
            <TouchableOpacity style={styles.button} onPress={() => onAdvance(order)}>
              <Text style={styles.btnText}>Lanjutkan</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: GarageTheme.bgElevated,
    padding: 16,
    borderRadius: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: GarageTheme.border,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  titleWrap: { flex: 1, marginRight: 12 },
  indicator: { width: 10, height: 10, borderRadius: 999, marginBottom: 8 },
  title: { color: GarageTheme.text, fontWeight: '800', fontSize: 16 },
  sub: { color: GarageTheme.textMuted, marginTop: 4, fontSize: 12 },
  statusChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#151515',
  },
  statusText: {
    fontWeight: '800',
    minWidth: 72,
    textAlign: 'center',
    fontSize: 12,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  meta: { color: GarageTheme.text, fontSize: 13, fontWeight: '600' },
  dot: { color: GarageTheme.textDim, marginHorizontal: 8 },
  slot: { color: GarageTheme.textMuted, marginTop: 6, fontSize: 12 },
  actions: { marginTop: 14, flexDirection: 'row' },
  button: {
    backgroundColor: GarageTheme.gold,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  btnText: { color: '#111', fontWeight: '800' },
});
