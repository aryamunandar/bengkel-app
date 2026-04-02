import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { GarageTheme } from '@/constants/garage-theme';

type BrandLockupProps = {
  caption?: string;
  compact?: boolean;
  singleLine?: boolean;
};

const brandLogo = require('../../assets/images/logo.png');

export default function BrandLockup({ caption, compact = false, singleLine = false }: BrandLockupProps) {
  return (
    <View style={[styles.wrap, compact && styles.wrapCompact, singleLine && styles.wrapSingleLine]}>
      <View
        style={[
          styles.mark,
          compact && styles.markCompact,
          singleLine && styles.markSingleLine,
          compact && singleLine && styles.markSingleLineCompact,
        ]}
      >
        <Image
          source={brandLogo}
          style={[styles.logoImageBase, compact && styles.logoImageCompact]}
          resizeMode="contain"
        />
      </View>

      <View style={styles.textWrap}>
        {singleLine ? (
          <Text
            numberOfLines={1}
            ellipsizeMode="clip"
            style={[styles.nameSingle, compact && styles.nameSingleCompact]}
          >
            JOHAN GARAGE
          </Text>
        ) : (
          <>
            <Text style={[styles.nameTop, compact && styles.nameCompact]}>JOHAN</Text>
            <Text style={[styles.nameBottom, compact && styles.nameCompact]}>GARAGE</Text>
          </>
        )}
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
  wrapSingleLine: {
    alignItems: 'center',
  },
  mark: {
    width: 68,
    height: 68,
    borderRadius: 22,
    backgroundColor: '#050505',
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
  markSingleLine: {
    width: 72,
    height: 72,
    borderRadius: 22,
  },
  markSingleLineCompact: {
    width: 60,
    height: 60,
    borderRadius: 20,
    marginRight: 14,
  },
  logoImageBase: {
    width: '92%',
    height: '92%',
  },
  logoImageCompact: {
    width: '90%',
    height: '90%',
  },
  textWrap: {
    flex: 1,
    minWidth: 0,
    flexShrink: 1,
    justifyContent: 'center',
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
  nameSingle: {
    color: GarageTheme.goldBright,
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 1,
    lineHeight: 24,
    flexShrink: 1,
  },
  nameSingleCompact: {
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
