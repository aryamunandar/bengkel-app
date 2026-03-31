import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { GarageTheme } from '@/constants/garage-theme';

const STEPS = ['Received', 'In Progress', 'Ready', 'Completed'];

const COLORS = {
  active: GarageTheme.goldBright,
  inactive: '#333',
  textActive: GarageTheme.text,
  textInactive: GarageTheme.textDim,
};

type StatusStepperProps = {
  status: string;
};

export default function StatusStepper({ status }: StatusStepperProps) {
  const idx = Math.max(0, STEPS.indexOf(status));
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: 450, useNativeDriver: true }).start();
  }, [anim]);

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {STEPS.map((step, index) => {
          const active = index <= idx;
          const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [8, 0] });
          const opacity = anim;

          return (
            <Animated.View key={step} style={[styles.stepWrap, { transform: [{ translateY }], opacity }]}>
              <View style={styles.circleRow}>
                <View style={[styles.circle, active ? { backgroundColor: COLORS.active } : { backgroundColor: COLORS.inactive }]} />
                {index < STEPS.length - 1 ? (
                  <View style={[styles.line, active && index < idx ? { backgroundColor: COLORS.active } : null]} />
                ) : null}
              </View>
              <Text style={[styles.label, active ? { color: COLORS.textActive } : { color: COLORS.textInactive }]}>{step}</Text>
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 14,
    backgroundColor: GarageTheme.bgElevated,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: GarageTheme.border,
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stepWrap: { alignItems: 'center', flex: 1 },
  circleRow: { flexDirection: 'row', alignItems: 'center', width: '100%', justifyContent: 'center' },
  circle: { width: 14, height: 14, borderRadius: 999 },
  line: { height: 2, backgroundColor: '#333', flex: 1, marginHorizontal: 8 },
  label: { marginTop: 8, fontSize: 12, textAlign: 'center' },
});
