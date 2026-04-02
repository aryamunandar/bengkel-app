import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { GarageTheme } from '@/constants/garage-theme';
import OrderCard from '../components/OrderCard';
import RequireAuthNotice from '../components/RequireAuthNotice';
import { useAuth } from '../context/AuthProvider';
import { formatCurrency, getOrderTotal } from '../utils/order-summary';
import { getOrders, type Order } from '../utils/storage';

export default function HistoryScreen() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);

  const loadOrders = useCallback(async () => {
    setOrders(await getOrders());
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [loadOrders])
  );

  if (!user) {
    return <RequireAuthNotice message="Masuk untuk melihat riwayat booking, servis selesai, dan detail kendaraan Anda." />;
  }

  const activeCount = orders.filter((order) => order.status !== 'Completed').length;
  const doneCount = orders.filter((order) => order.status === 'Completed').length;
  const totalSpent = orders
    .filter((order) => order.status === 'Completed')
    .reduce((sum, order) => sum + getOrderTotal(order), 0);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>HISTORY</Text>
        <Text style={styles.header}>Riwayat Servis</Text>
        <Text style={styles.subtitle}>
          Semua booking, status pengerjaan, keluhan awal, hasil perbaikan, kerusakan yang ditemukan, dan part yang diganti
          akan tersimpan di sini.
        </Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Order Aktif</Text>
          <Text style={styles.statValue}>{activeCount}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Selesai</Text>
          <Text style={styles.statValue}>{doneCount}</Text>
        </View>
      </View>

      <View style={styles.totalCard}>
        <Text style={styles.totalLabel}>Total biaya servis selesai</Text>
        <Text style={styles.totalValue}>{formatCurrency(totalSpent)}</Text>
        <Text style={styles.totalHint}>Nilai ini akan terisi otomatis setelah admin mengisi biaya servis dan biaya part.</Text>
      </View>

      {orders.length === 0 ? <Text style={styles.empty}>Belum ada riwayat.</Text> : null}

      {orders.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: GarageTheme.bg },
  content: { padding: 20, paddingBottom: 32 },
  hero: {
    backgroundColor: GarageTheme.panel,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: GarageTheme.border,
    padding: 20,
    marginBottom: 14,
  },
  eyebrow: { color: GarageTheme.textDim, fontSize: 12, letterSpacing: 2, marginBottom: 10 },
  header: { color: GarageTheme.goldBright, fontSize: 24, fontWeight: '800', marginBottom: 8 },
  subtitle: { color: GarageTheme.textMuted, fontSize: 14, lineHeight: 21 },
  statsRow: { flexDirection: 'row', marginHorizontal: -6, marginBottom: 14 },
  statCard: {
    flex: 1,
    backgroundColor: GarageTheme.bgElevated,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: GarageTheme.border,
    padding: 16,
    marginHorizontal: 6,
  },
  statLabel: { color: GarageTheme.textDim, fontSize: 12, marginBottom: 6 },
  statValue: { color: GarageTheme.text, fontSize: 26, fontWeight: '900' },
  totalCard: {
    backgroundColor: GarageTheme.bgElevated,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: GarageTheme.border,
    padding: 16,
    marginBottom: 14,
  },
  totalLabel: { color: GarageTheme.textDim, fontSize: 12, marginBottom: 6 },
  totalValue: { color: GarageTheme.goldBright, fontSize: 24, fontWeight: '900', marginBottom: 4 },
  totalHint: { color: GarageTheme.textMuted, fontSize: 12, lineHeight: 18 },
  empty: { color: GarageTheme.textMuted, marginTop: 4, marginBottom: 12 },
});
