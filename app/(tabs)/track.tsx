import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GarageTheme } from '@/constants/garage-theme';
import BrandLockup from '../components/BrandLockup';
import OrderCard from '../components/OrderCard';
import RequireAuthNotice from '../components/RequireAuthNotice';
import StatusStepper from '../components/StatusStepper';
import { useAuth } from '../context/AuthProvider';
import { getOrders, type Order } from '../utils/storage';

export default function TrackScreen() {
  const { user, isAdmin } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selected, setSelected] = useState<Order | null>(null);

  const loadOrders = useCallback(async () => {
    const next = await getOrders();
    setOrders(next);

    if (selected) {
      const refreshedSelected = next.find((order) => order.id === selected.id) ?? null;
      setSelected(refreshedSelected);
    }
  }, [selected]);

  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [loadOrders])
  );

  if (!user) {
    return <RequireAuthNotice message="Masuk untuk melihat status pesanan aktif dan progres servis motor Anda." />;
  }

  const activeOrders = orders.filter((order) => order.status !== 'Completed');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <BrandLockup caption="Pantau proses servis tanpa perlu tanya manual satu per satu." compact />
        <Text style={styles.header}>Track Order</Text>
        <Text style={styles.subheader}>
          Lihat status aktif, detail layanan, dan arah ke lokasi bengkel. Perubahan status dan history servis diisi dari
          panel admin.
        </Text>
        {isAdmin ? <Text style={styles.adminHint}>Akun ini admin. Update status dan history lewat menu Admin.</Text> : null}
      </View>

      {activeOrders.length === 0 ? <Text style={styles.empty}>Tidak ada pesanan aktif.</Text> : null}

      {activeOrders.map((order) => (
        <OrderCard key={order.id} order={order} onPress={setSelected} />
      ))}

      {selected ? (
        <View style={styles.detailCard}>
          <Text style={styles.detailTitle}>Detail Pesanan</Text>
          <StatusStepper status={selected.status} />

          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>Jenis Servis</Text>
            <Text style={styles.metaValue}>{selected.service}</Text>
          </View>

          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>Tanggal</Text>
            <Text style={styles.metaValue}>{selected.date}</Text>
          </View>

          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>Slot</Text>
            <Text style={styles.metaValue}>{selected.slot}</Text>
          </View>

          {selected.queueNumber !== null ? (
            <View style={styles.metaBlock}>
              <Text style={styles.metaLabel}>Nomor Antrian</Text>
              <Text style={styles.metaValue}>#{selected.queueNumber}</Text>
            </View>
          ) : null}

          {selected.complaint ? (
            <View style={styles.metaBlock}>
              <Text style={styles.metaLabel}>Keluhan</Text>
              <Text style={styles.metaValue}>{selected.complaint}</Text>
            </View>
          ) : null}

          <Text style={styles.mapHint}>Lokasi bengkel</Text>
          <Image source={{ uri: 'https://via.placeholder.com/600x300?text=Johan+Garage' }} style={styles.map} />

          <TouchableOpacity
            style={styles.mapButton}
            onPress={() => {
              const lat = -6.2;
              const lng = 106.816666;
              const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
              Linking.openURL(url);
            }}
          >
            <Text style={styles.mapButtonText}>Buka di Maps</Text>
          </TouchableOpacity>
        </View>
      ) : null}
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
    borderColor: GarageTheme.borderStrong,
    padding: 20,
    marginBottom: 16,
  },
  header: { color: GarageTheme.goldBright, fontSize: 24, fontWeight: '800', marginTop: 18, marginBottom: 8 },
  subheader: { color: GarageTheme.textMuted, fontSize: 14, lineHeight: 21 },
  adminHint: {
    marginTop: 12,
    color: GarageTheme.goldBright,
    fontSize: 12,
    lineHeight: 18,
  },
  empty: { color: GarageTheme.textMuted, fontSize: 14 },
  detailCard: {
    marginTop: 18,
    backgroundColor: GarageTheme.bgElevated,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: GarageTheme.border,
    padding: 16,
  },
  detailTitle: { color: GarageTheme.text, fontWeight: '800', fontSize: 16, marginBottom: 12 },
  metaBlock: { marginTop: 12 },
  metaLabel: { color: GarageTheme.textDim, fontSize: 12, marginBottom: 4 },
  metaValue: { color: GarageTheme.text, fontSize: 14, fontWeight: '600', lineHeight: 21 },
  mapHint: { color: GarageTheme.textMuted, marginTop: 16, marginBottom: 8 },
  map: { width: '100%', height: 160, borderRadius: 12 },
  mapButton: {
    marginTop: 12,
    backgroundColor: GarageTheme.gold,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  mapButtonText: { color: '#111', fontWeight: '800' },
});
