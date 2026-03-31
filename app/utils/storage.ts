import AsyncStorage from '@react-native-async-storage/async-storage';
import { isSupabaseConfigured, supabase } from './supabase';

const ORDERS_KEY = 'orders_v1';

export type Order = {
  id: string;
  name: string;
  phone: string;
  bike: string;
  service: string;
  serviceType: string;
  date: string;
  slot: string;
  status: string;
  createdAt: string;
};

type OrderPatch = Partial<Omit<Order, 'id'>>;

type OrderRow = {
  id: string;
  user_id: string;
  legacy_id: string | null;
  name: string;
  phone: string;
  bike: string;
  service: string;
  service_type: string;
  date: string;
  slot: string;
  status: string;
  created_at: string;
};

let currentUserId: string | null = null;

function hasRemoteBackend() {
  return isSupabaseConfigured && Boolean(currentUserId);
}

function fromRow(row: OrderRow): Order {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    bike: row.bike,
    service: row.service,
    serviceType: row.service_type,
    date: row.date,
    slot: row.slot,
    status: row.status,
    createdAt: row.created_at,
  };
}

function toRow(order: Order, userId: string) {
  return {
    user_id: userId,
    legacy_id: order.id ?? null,
    name: order.name,
    phone: order.phone,
    bike: order.bike,
    service: order.service,
    service_type: order.serviceType,
    date: order.date,
    slot: order.slot,
    status: order.status,
    created_at: order.createdAt,
  };
}

function toPatch(patch: OrderPatch) {
  const next: Partial<OrderRow> = {};

  if (patch.name !== undefined) next.name = patch.name;
  if (patch.phone !== undefined) next.phone = patch.phone;
  if (patch.bike !== undefined) next.bike = patch.bike;
  if (patch.service !== undefined) next.service = patch.service;
  if (patch.serviceType !== undefined) next.service_type = patch.serviceType;
  if (patch.date !== undefined) next.date = patch.date;
  if (patch.slot !== undefined) next.slot = patch.slot;
  if (patch.status !== undefined) next.status = patch.status;
  if (patch.createdAt !== undefined) next.created_at = patch.createdAt;

  return next;
}

export function configureBackend(userId: string | null) {
  currentUserId = userId;
}

export async function getOrders(): Promise<Order[]> {
  try {
    if (hasRemoteBackend()) {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', currentUserId)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('getOrders error', error);
        return [];
      }

      return (data ?? []).map((row) => fromRow(row as OrderRow));
    }

    const raw = await AsyncStorage.getItem(ORDERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.warn('getOrders error', e);
    return [];
  }
}

export async function saveOrder(order: Order) {
  try {
    if (hasRemoteBackend()) {
      const { data, error } = await supabase
        .from('orders')
        .insert(toRow(order, currentUserId!))
        .select()
        .single();

      if (error) {
        console.warn('saveOrder error', error);
        return null;
      }

      return fromRow(data as OrderRow);
    }

    const orders = await getOrders();
    const next = [order, ...orders];
    await AsyncStorage.setItem(ORDERS_KEY, JSON.stringify(next));
    return order;
  } catch (e) {
    console.warn('saveOrder error', e);
    return null;
  }
}

export async function updateOrder(id: string, patch: OrderPatch) {
  try {
    if (hasRemoteBackend()) {
      const { data, error } = await supabase
        .from('orders')
        .update(toPatch(patch))
        .eq('id', id)
        .eq('user_id', currentUserId)
        .select()
        .single();

      if (error) {
        console.warn('updateOrder error', error);
        return null;
      }

      return fromRow(data as OrderRow);
    }

    const orders = await getOrders();
    const next = orders.map((order) => (order.id === id ? { ...order, ...patch } : order));
    await AsyncStorage.setItem(ORDERS_KEY, JSON.stringify(next));
    return next.find((order) => order.id === id) ?? null;
  } catch (e) {
    console.warn('updateOrder error', e);
    return null;
  }
}

export async function clearOrders() {
  try {
    if (hasRemoteBackend()) {
      const { error } = await supabase.from('orders').delete().eq('user_id', currentUserId);
      if (error) {
        console.warn('clearOrders error', error);
      }
      return;
    }

    await AsyncStorage.removeItem(ORDERS_KEY);
  } catch (e) {
    console.warn('clearOrders error', e);
  }
}

export async function migrateLocalToBackend(userId: string) {
  try {
    if (!isSupabaseConfigured || !userId) {
      return;
    }

    const raw = await AsyncStorage.getItem(ORDERS_KEY);
    if (!raw) return;

    const localOrders: Order[] = JSON.parse(raw);
    if (!localOrders.length) return;

    for (const order of localOrders) {
      const { error } = await supabase.from('orders').upsert(toRow(order, userId), {
        onConflict: 'user_id,legacy_id',
      });

      if (error) {
        console.warn('migrate order failed', error);
        return;
      }
    }

    await AsyncStorage.removeItem(ORDERS_KEY);
  } catch (e) {
    console.warn('migrateLocalToBackend error', e);
  }
}

export default { getOrders, saveOrder, updateOrder, clearOrders, configureBackend, migrateLocalToBackend };
