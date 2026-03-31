import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

const INFO = [
  { label: 'Jam Operasional', value: 'Senin - Sabtu, 09.00 - 18.00' },
  { label: 'Layanan', value: 'Service besar, service bulanan, tune up, ganti spare part' },
  { label: 'Fokus', value: 'Perawatan rutin motor harian dengan proses booking yang lebih rapi' },
];

export default function AboutScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>ABOUT</Text>
        <Text style={styles.title}>Johan Garage</Text>
        <Text style={styles.subtitle}>
          Bengkel yang dirancang untuk bikin proses servis lebih jelas, mulai dari booking sampai tracking status.
        </Text>
      </View>

      {INFO.map((item) => (
        <View key={item.label} style={styles.card}>
          <Text style={styles.label}>{item.label}</Text>
          <Text style={styles.value}>{item.value}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0b0b' },
  content: { padding: 20, paddingBottom: 32 },
  hero: {
    backgroundColor: '#131313',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#242424',
    padding: 20,
    marginBottom: 16,
  },
  eyebrow: { color: '#8d8d8d', fontSize: 12, letterSpacing: 2, marginBottom: 10 },
  title: { color: '#FFD700', fontSize: 26, fontWeight: '800', marginBottom: 8 },
  subtitle: { color: '#c8c8c8', fontSize: 14, lineHeight: 21 },
  card: {
    backgroundColor: '#121212',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#202020',
    padding: 16,
    marginBottom: 12,
  },
  label: { color: '#8f8f8f', fontSize: 12, marginBottom: 6 },
  value: { color: '#fff', fontSize: 14, lineHeight: 20, fontWeight: '600' },
});
