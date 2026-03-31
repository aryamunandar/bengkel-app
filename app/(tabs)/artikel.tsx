import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

const ARTICLES = [
  {
    title: 'Kapan waktu terbaik untuk service rutin?',
    summary: 'Idealnya setiap 2.000-3.000 km atau mengikuti rekomendasi pabrikan motor kamu.',
  },
  {
    title: 'Tanda kampas rem harus diganti',
    summary: 'Kalau rem mulai bunyi, terasa tipis, atau pengereman kurang pakem, segera cek ke bengkel.',
  },
  {
    title: 'Kenapa oli jangan telat diganti',
    summary: 'Oli yang terlambat diganti bisa bikin mesin cepat panas dan performa motor menurun.',
  },
];

export default function ArtikelScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>ARTIKEL</Text>
        <Text style={styles.title}>Tips Ringan Buat Perawatan Motor</Text>
        <Text style={styles.subtitle}>Konten singkat yang gampang dibaca sambil nunggu jadwal servis kamu.</Text>
      </View>

      {ARTICLES.map((article, index) => (
        <View key={article.title} style={styles.card}>
          <Text style={styles.index}>{String(index + 1).padStart(2, '0')}</Text>
          <Text style={styles.cardTitle}>{article.title}</Text>
          <Text style={styles.cardSummary}>{article.summary}</Text>
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
  title: { color: '#FFD700', fontSize: 24, fontWeight: '800', marginBottom: 8 },
  subtitle: { color: '#c8c8c8', fontSize: 14, lineHeight: 21 },
  card: {
    backgroundColor: '#121212',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#202020',
    padding: 16,
    marginBottom: 12,
  },
  index: { color: '#7e7e7e', fontSize: 11, marginBottom: 8 },
  cardTitle: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 6 },
  cardSummary: { color: '#bebebe', fontSize: 13, lineHeight: 20 },
});
