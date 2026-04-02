import { Ionicons } from '@expo/vector-icons';
import type { DrawerContentComponentProps } from '@react-navigation/drawer';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { Drawer } from 'expo-router/drawer';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { GarageTheme } from '@/constants/garage-theme';
import BrandLockup from '../components/BrandLockup';
import { useAuth } from '../context/AuthProvider';

type DrawerRoute = 'index' | 'products' | 'artikel' | 'booking' | 'track' | 'history' | 'about' | 'admin';

const DRAWER_ITEMS: Array<{
  label: string;
  route: DrawerRoute;
  icon: keyof typeof Ionicons.glyphMap;
}> = [
  { label: '01 HOME', route: 'index', icon: 'home-outline' },
  { label: '02 PRODUCTS', route: 'products', icon: 'pricetags-outline' },
  { label: '03 ARTIKEL', route: 'artikel', icon: 'newspaper-outline' },
  { label: '04 BOOKING', route: 'booking', icon: 'clipboard-outline' },
  { label: '05 TRACK ORDER', route: 'track', icon: 'map-outline' },
  { label: '06 HISTORY', route: 'history', icon: 'time-outline' },
  { label: '07 ABOUT', route: 'about', icon: 'information-circle-outline' },
];

function CustomDrawerContent(props: DrawerContentComponentProps) {
  const { user, isAdmin, signOut } = useAuth();
  const drawerItems = isAdmin
    ? [
        ...DRAWER_ITEMS,
        { label: '08 ADMIN', route: 'admin' as const, icon: 'shield-checkmark-outline' as const },
      ]
    : DRAWER_ITEMS;

  const goTo = (route: DrawerRoute) => {
    props.navigation.navigate(route);
    props.navigation.closeDrawer();
  };

  return (
    <DrawerContentScrollView {...props} style={styles.container}>
      <View style={styles.header}>
        <BrandLockup caption={user?.email ?? 'Guest mode'} compact />
        <View style={styles.headerNote}>
          <Text style={styles.headerNoteText}>Dashboard servis, booking, dan tracking dalam satu panel.</Text>
        </View>
      </View>

      {drawerItems.map((item) => (
        <DrawerItem
          key={item.route}
          label={item.label}
          labelStyle={styles.menuText}
          onPress={() => goTo(item.route)}
          icon={() => <Ionicons name={item.icon} size={20} color="#fff" />}
        />
      ))}

      <View style={styles.footer}>
        <Text style={styles.footerText}>(c) Johan Garage</Text>
        {user ? (
          <DrawerItem
            label="Logout"
            labelStyle={styles.menuText}
            onPress={() => {
              signOut();
            }}
            icon={() => <Ionicons name="log-out-outline" size={18} color="#fff" />}
          />
        ) : null}
      </View>
    </DrawerContentScrollView>
  );
}

export default function TabsLayout() {
  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerStyle: {
          backgroundColor: GarageTheme.bg,
        },
        headerTintColor: GarageTheme.goldBright,
        drawerStyle: {
          backgroundColor: GarageTheme.bg,
        },
        sceneStyle: {
          backgroundColor: GarageTheme.bg,
        },
      }}
    >
      <Drawer.Screen name="index" options={{ title: 'Home' }} />
      <Drawer.Screen name="products" options={{ title: 'Products' }} />
      <Drawer.Screen name="booking" options={{ title: 'Booking' }} />
      <Drawer.Screen name="artikel" options={{ title: 'Artikel' }} />
      <Drawer.Screen name="track" options={{ title: 'Track Order' }} />
      <Drawer.Screen name="history" options={{ title: 'History' }} />
      <Drawer.Screen name="about" options={{ title: 'About' }} />
      <Drawer.Screen name="admin" options={{ title: 'Admin' }} />
    </Drawer>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: GarageTheme.bg,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: GarageTheme.border,
  },
  headerNote: {
    marginTop: 16,
    backgroundColor: GarageTheme.panel,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: GarageTheme.border,
    padding: 12,
  },
  headerNoteText: {
    color: GarageTheme.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
  menuText: {
    color: GarageTheme.text,
    fontSize: 16,
  },
  footer: {
    marginTop: 40,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: GarageTheme.border,
  },
  footerText: {
    color: GarageTheme.textDim,
    fontSize: 12,
  },
});
