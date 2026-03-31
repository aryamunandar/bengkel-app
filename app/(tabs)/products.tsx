import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { GarageTheme } from '@/constants/garage-theme';
import BrandLockup from '../components/BrandLockup';

const PRODUCTS = [
  {
    id: '1',
    name: 'Oli Mesin Full Synthetic',
    category: 'Perawatan Rutin',
    price: 'Rp165.000',
    icon: 'water-outline',
    description: 'Bantu mesin tetap halus, dingin, dan siap dipakai harian maupun perjalanan jauh.',
  },
  {
    id: '2',
    name: 'Kampas Rem Depan',
    category: 'Keselamatan',
    price: 'Rp85.000',
    icon: 'shield-checkmark-outline',
    description: 'Daya pengereman lebih pakem dan stabil untuk kondisi lalu lintas kota.',
  },
  {
    id: '3',
    name: 'Busi Iridium',
    category: 'Performa',
    price: 'Rp95.000',
    icon: 'flash-outline',
    description: 'Pembakaran lebih konsisten, tarikan lebih ringan, dan efisiensi bahan bakar lebih baik.',
  },
  {
    id: '4',
    name: 'CVT Belt',
    category: 'Spare Part',
    price: 'Rp210.000',
    icon: 'construct-outline',
    description: 'Cocok untuk penggantian berkala agar performa motor matik tetap responsif.',
  },
];

export default function ProductsScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <BrandLockup caption="Kurasi produk yang sering dipakai buat servis cepat dan rapi." compact />
        <Text style={styles.title}>Rekomendasi Produk Johan Garage</Text>
        <Text style={styles.subtitle}>
          Beberapa produk yang paling sering dipakai untuk servis rutin, peningkatan performa, dan perawatan harian.
        </Text>
      </View>

      {PRODUCTS.map((product) => (
        <View key={product.id} style={styles.card}>
          <View style={styles.cardHead}>
            <View style={styles.iconWrap}>
              <Ionicons name={product.icon as keyof typeof Ionicons.glyphMap} size={20} color={GarageTheme.goldBright} />
            </View>
            <View style={styles.cardTitleWrap}>
              <Text style={styles.cardTitle}>{product.name}</Text>
              <Text style={styles.cardCategory}>{product.category}</Text>
            </View>
            <Text style={styles.price}>{product.price}</Text>
          </View>

          <Text style={styles.description}>{product.description}</Text>
        </View>
      ))}

      <View style={styles.noteBox}>
        <Text style={styles.noteTitle}>Catatan</Text>
        <Text style={styles.noteText}>
          Harga ini masih bisa disesuaikan dengan tipe motor, stok, dan kebutuhan servis saat pengecekan di bengkel.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: GarageTheme.bg },
  content: { padding: 20, paddingBottom: 32 },
  hero: {
    backgroundColor: GarageTheme.panel,
    borderWidth: 1,
    borderColor: GarageTheme.borderStrong,
    borderRadius: 24,
    padding: 20,
    marginBottom: 18,
  },
  title: {
    color: GarageTheme.goldBright,
    fontSize: 24,
    fontWeight: '800',
    marginTop: 18,
    marginBottom: 10,
  },
  subtitle: {
    color: GarageTheme.textMuted,
    fontSize: 14,
    lineHeight: 21,
  },
  card: {
    backgroundColor: GarageTheme.bgElevated,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: GarageTheme.border,
    padding: 16,
    marginBottom: 14,
  },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(242, 183, 5, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardTitleWrap: {
    flex: 1,
    marginRight: 10,
  },
  cardTitle: {
    color: GarageTheme.text,
    fontSize: 16,
    fontWeight: '800',
  },
  cardCategory: {
    color: GarageTheme.textDim,
    fontSize: 12,
    marginTop: 4,
  },
  price: {
    color: GarageTheme.goldBright,
    fontSize: 14,
    fontWeight: '800',
  },
  description: {
    color: GarageTheme.textMuted,
    fontSize: 13,
    lineHeight: 20,
  },
  noteBox: {
    marginTop: 8,
    backgroundColor: GarageTheme.panel,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: GarageTheme.border,
  },
  noteTitle: {
    color: GarageTheme.goldBright,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  noteText: {
    color: GarageTheme.textMuted,
    fontSize: 13,
    lineHeight: 20,
  },
});
