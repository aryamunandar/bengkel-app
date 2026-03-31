import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GarageTheme } from '@/constants/garage-theme';
import BrandLockup from './BrandLockup';

type RequireAuthNoticeProps = {
  message: string;
};

export default function RequireAuthNotice({ message }: RequireAuthNoticeProps) {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <BrandLockup caption="Akses fitur personal dan riwayat servis kamu." compact />
        <Text style={styles.title}>Login Dulu</Text>
        <Text style={styles.message}>{message}</Text>
        <TouchableOpacity style={styles.button} onPress={() => router.push('/(auth)/login')}>
          <Text style={styles.buttonText}>Login / Register</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GarageTheme.bg,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: GarageTheme.panel,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: GarageTheme.border,
    padding: 22,
  },
  title: {
    color: GarageTheme.goldBright,
    fontSize: 24,
    fontWeight: '800',
    marginTop: 18,
    marginBottom: 12,
  },
  message: {
    color: GarageTheme.textMuted,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 18,
  },
  button: {
    backgroundColor: GarageTheme.gold,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
    alignSelf: 'flex-start',
  },
  buttonText: {
    color: '#111',
    fontWeight: '800',
  },
});
