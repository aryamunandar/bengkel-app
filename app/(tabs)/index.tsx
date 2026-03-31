import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GarageTheme } from '@/constants/garage-theme';
import BrandLockup from '../components/BrandLockup';
import { useAuth } from '../context/AuthProvider';
import { getOrders, type Order } from '../utils/storage';

const MENU_ITEMS: Array<{
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: '/products' | '/booking' | '/artikel' | '/track' | '/history' | '/about';
}> = [
  {
    title: 'Products',
    description: 'Spare part dan item yang paling sering dipakai di bengkel.',
    icon: 'pricetags-outline',
    route: '/products',
  },
  {
    title: 'Booking',
    description: 'Pesan servis besar atau servis bulanan tanpa chat manual.',
    icon: 'calendar-outline',
    route: '/booking',
  },
  {
    title: 'Track',
    description: 'Lihat progress pengerjaan motor dan status terkini.',
    icon: 'speedometer-outline',
    route: '/track',
  },
  {
    title: 'History',
    description: 'Buka riwayat booking dan servis yang sudah selesai.',
    icon: 'time-outline',
    route: '/history',
  },
  {
    title: 'Artikel',
    description: 'Tips ringan buat perawatan motor harian.',
    icon: 'newspaper-outline',
    route: '/artikel',
  },
  {
    title: 'About',
    description: 'Informasi bengkel, layanan, dan jam operasional.',
    icon: 'information-circle-outline',
    route: '/about',
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const displayName = user?.email ? user.email.split('@')[0] : 'guest';

  useEffect(() => {
    const load = async () => setOrders(await getOrders());
    load();
  }, []);

  const activeOrders = orders.filter((order) => order.status !== 'Completed').length;
  const completedOrders = orders.filter((order) => order.status === 'Completed').length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <View style={styles.heroGlow} />
        <View style={styles.heroGlowSecondary} />

        <BrandLockup caption="Dashboard servis dengan nuansa hitam-emas yang tegas dan modern." />

        <Text style={styles.heroTitle}>Halo, {displayName}. Servis motor sekarang lebih cepat dipantau.</Text>
        <Text style={styles.heroSubtitle}>
          Booking, cek progress, lihat history, dan browse produk bengkel dari satu home yang lebih rapi.
        </Text>

        <View style={styles.heroActions}>
          <TouchableOpacity style={styles.primaryAction} onPress={() => router.push('/booking')}>
            <Ionicons name="add-circle-outline" size={18} color="#111" />
            <Text style={styles.primaryActionText}>Booking Baru</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryAction} onPress={() => router.push('/history')}>
            <Ionicons name="time-outline" size={18} color={GarageTheme.text} />
            <Text style={styles.secondaryActionText}>Lihat History</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Order Aktif</Text>
          <Text style={styles.statValue}>{activeOrders}</Text>
          <Text style={styles.statHint}>Sedang diproses atau menunggu selesai</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Riwayat Selesai</Text>
          <Text style={styles.statValue}>{completedOrders}</Text>
          <Text style={styles.statHint}>Servis yang sudah selesai dikerjakan</Text>
        </View>
      </View>

      <View style={styles.sectionHead}>
        <Text style={styles.sectionTitle}>Akses Cepat</Text>
        <Text style={styles.sectionMeta}>Semua fitur penting dalam satu tampilan.</Text>
      </View>

      <View style={styles.grid}>
        {MENU_ITEMS.map((item) => (
          <TouchableOpacity key={item.route} style={styles.menuCard} onPress={() => router.push(item.route)}>
            <View style={styles.menuBadge}>
              <Ionicons name={item.icon} size={20} color={GarageTheme.goldBright} />
            </View>
            <Text style={styles.menuTitle}>{item.title}</Text>
            <Text style={styles.menuDescription}>{item.description}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GarageTheme.bg,
  },
  content: {
    padding: 20,
    paddingBottom: 32,
  },
  hero: {
    backgroundColor: GarageTheme.panel,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: GarageTheme.borderStrong,
    padding: 22,
    overflow: 'hidden',
  },
  heroGlow: {
    position: 'absolute',
    top: -60,
    right: -20,
    width: 220,
    height: 220,
    borderRadius: 999,
    backgroundColor: GarageTheme.glow,
  },
  heroGlowSecondary: {
    position: 'absolute',
    bottom: -50,
    left: -50,
    width: 200,
    height: 200,
    borderRadius: 999,
    backgroundColor: GarageTheme.whiteGlow,
  },
  heroTitle: {
    color: GarageTheme.text,
    fontSize: 28,
    fontWeight: '900',
    lineHeight: 34,
    marginTop: 20,
    marginBottom: 10,
  },
  heroSubtitle: {
    color: GarageTheme.textMuted,
    fontSize: 14,
    lineHeight: 21,
  },
  heroActions: {
    flexDirection: 'row',
    marginTop: 20,
  },
  primaryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GarageTheme.gold,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    marginRight: 10,
  },
  primaryActionText: {
    color: '#111',
    fontWeight: '800',
    marginLeft: 8,
  },
  secondaryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e1e1e',
    borderWidth: 1,
    borderColor: GarageTheme.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
  },
  secondaryActionText: {
    color: GarageTheme.text,
    fontWeight: '700',
    marginLeft: 8,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 16,
    marginHorizontal: -6,
  },
  statCard: {
    flex: 1,
    backgroundColor: GarageTheme.bgElevated,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: GarageTheme.border,
    padding: 16,
    marginHorizontal: 6,
  },
  statLabel: {
    color: GarageTheme.textDim,
    fontSize: 12,
    marginBottom: 10,
  },
  statValue: {
    color: GarageTheme.goldBright,
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 6,
  },
  statHint: {
    color: GarageTheme.textMuted,
    fontSize: 12,
    lineHeight: 17,
  },
  sectionHead: {
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    color: GarageTheme.text,
    fontSize: 18,
    fontWeight: '800',
  },
  sectionMeta: {
    color: GarageTheme.textMuted,
    fontSize: 13,
    marginTop: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  menuCard: {
    width: '48%',
    backgroundColor: GarageTheme.bgElevated,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: GarageTheme.border,
    padding: 16,
    marginBottom: 12,
    minHeight: 158,
  },
  menuBadge: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(242, 183, 5, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  menuTitle: {
    color: GarageTheme.text,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 8,
  },
  menuDescription: {
    color: GarageTheme.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
});
