import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { GarageTheme } from '@/constants/garage-theme';

type BrandLockupProps = {
  caption?: string;
  compact?: boolean;
};

export default function BrandLockup({ caption, compact = false }: BrandLockupProps) {
  return (
    <View style={[styles.wrap, compact && styles.wrapCompact]}>
      <View style={[styles.mark, compact && styles.markCompact]}>
        <View style={styles.markGlow} />
        <Text style={[styles.markText, compact && styles.markTextCompact]}>JG</Text>
      </View>

      <View style={styles.textWrap}>
        <Text style={[styles.nameTop, compact && styles.nameCompact]}>JOHAN</Text>
        <Text style={[styles.nameBottom, compact && styles.nameCompact]}>GARAGE</Text>
        {caption ? <Text style={styles.caption}>{caption}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  wrapCompact: {
    alignItems: 'center',
  },
  mark: {
    width: 68,
    height: 68,
    borderRadius: 22,
    backgroundColor: GarageTheme.panelStrong,
    borderWidth: 1,
    borderColor: GarageTheme.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    overflow: 'hidden',
  },
  markCompact: {
    width: 52,
    height: 52,
    borderRadius: 18,
    marginRight: 12,
  },
  markGlow: {
    position: 'absolute',
    width: 94,
    height: 94,
    borderRadius: 999,
    backgroundColor: GarageTheme.glow,
  },
  markText: {
    color: GarageTheme.goldBright,
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 1,
  },
  markTextCompact: {
    fontSize: 20,
  },
  textWrap: {
    flexShrink: 1,
  },
  nameTop: {
    color: GarageTheme.goldBright,
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 1.5,
    lineHeight: 24,
  },
  nameBottom: {
    color: GarageTheme.text,
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 1.5,
    lineHeight: 24,
  },
  nameCompact: {
    fontSize: 18,
    lineHeight: 18,
  },
  caption: {
    color: GarageTheme.textMuted,
    fontSize: 12,
    marginTop: 8,
    letterSpacing: 0.4,
  },
});
