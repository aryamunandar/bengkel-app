import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { GarageTheme } from '@/constants/garage-theme';
import BrandLockup from './BrandLockup';

type AuthFormCardProps = {
  title: string;
  subtitle: string;
  submitLabel: string;
  email: string;
  password: string;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: () => void;
  footerLabel?: string;
  onFooterPress?: () => void;
};

export default function AuthFormCard({
  title,
  subtitle,
  submitLabel,
  email,
  password,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  footerLabel,
  onFooterPress,
}: AuthFormCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.backdropGlowTop} />
      <View style={styles.backdropGlowBottom} />
      <View style={styles.card}>
        <BrandLockup singleLine compact />
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>

        <Text style={styles.label}>Email</Text>
        <TextInput
          placeholder="nama@email.com"
          placeholderTextColor="#7f7f7f"
          style={styles.input}
          value={email}
          onChangeText={onEmailChange}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          placeholder="Masukkan password"
          placeholderTextColor="#7f7f7f"
          style={styles.input}
          secureTextEntry
          value={password}
          onChangeText={onPasswordChange}
        />

        <TouchableOpacity style={styles.button} onPress={onSubmit}>
          <Text style={styles.btnText}>{submitLabel}</Text>
        </TouchableOpacity>

        {footerLabel && onFooterPress ? (
          <TouchableOpacity onPress={onFooterPress}>
            <Text style={styles.link}>{footerLabel}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: GarageTheme.bg,
    justifyContent: 'center',
  },
  backdropGlowTop: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 999,
    backgroundColor: GarageTheme.glow,
    top: -40,
    right: -60,
  },
  backdropGlowBottom: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 999,
    backgroundColor: GarageTheme.whiteGlow,
    bottom: -40,
    left: -80,
  },
  card: {
    backgroundColor: GarageTheme.panel,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: GarageTheme.border,
    padding: 22,
  },
  title: { color: GarageTheme.goldBright, fontSize: 30, fontWeight: '800', marginTop: 18, marginBottom: 8 },
  subtitle: { color: GarageTheme.textMuted, fontSize: 14, lineHeight: 21, marginBottom: 20 },
  label: { color: GarageTheme.text, fontSize: 13, fontWeight: '600', marginBottom: 8 },
  input: {
    backgroundColor: GarageTheme.bgSoft,
    color: GarageTheme.text,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: GarageTheme.border,
  },
  button: {
    backgroundColor: GarageTheme.gold,
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 6,
  },
  btnText: { color: '#111', fontWeight: '800', letterSpacing: 0.3 },
  link: { color: GarageTheme.textMuted, marginTop: 16, textAlign: 'center' },
});
