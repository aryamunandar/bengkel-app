import AsyncStorage from '@react-native-async-storage/async-storage';
import { isSupabaseConfigured, supabase } from './supabase';

const ORDERS_KEY = 'orders_v2';
const LEGACY_ORDERS_KEY = 'orders_v1';

export const ORDER_STATUSES = ['Received', 'In Progress', 'Ready', 'Completed'] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type Order = {
  id: string;
  name: string;
  phone: string;
  bike: string;
  service: string;
  serviceType: string;
  date: string;
  slot: string;
  status: OrderStatus | string;
  createdAt: string;
  complaint: string;
  queueNumber: number | null;
  diagnosis: string;
  repairAction: string;
  replacedParts: string[];
  adminNotes: string;
  updatedAt: string;
  completedAt: string | null;
};

type OrderPatch = Partial<Omit<Order, 'id' | 'createdAt'>>;

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
  complaint: string | null;
  queue_number: number | null;
  diagnosis: string | null;
  repair_action: string | null;
  replaced_parts: string[] | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string | null;
  completed_at: string | null;
};

let currentUserId: string | null = null;

function hasRemoteBackend() {
  return isSupabaseConfigured && Boolean(currentUserId);
}

function normalizeParts(parts: unknown): string[] {
  if (!Array.isArray(parts)) {
    return [];
  }

  return parts
    .map((item) => String(item).trim())
    .filter(Boolean);
}

function normalizeOrder(order: Partial<Order> & Pick<Order, 'id' | 'name' | 'phone' | 'bike' | 'service' | 'serviceType' | 'date' | 'slot'>): Order {
  const createdAt = order.createdAt ?? new Date().toISOString();

  return {
    id: order.id,
    name: order.name,
    phone: order.phone,
    bike: order.bike,
    service: order.service,
    serviceType: order.serviceType,
    date: order.date,
    slot: order.slot,
    status: order.status ?? 'Received',
    createdAt,
    complaint: order.complaint ?? '',
    queueNumber: typeof order.queueNumber === 'number' ? order.queueNumber : null,
    diagnosis: order.diagnosis ?? '',
    repairAction: order.repairAction ?? '',
    replacedParts: normalizeParts(order.replacedParts),
    adminNotes: order.adminNotes ?? '',
    updatedAt: order.updatedAt ?? createdAt,
    completedAt: order.completedAt ?? null,
  };
}

function normalizePatch(patch: OrderPatch): OrderPatch {
  const next: OrderPatch = { ...patch };

  if (patch.replacedParts !== undefined) {
    next.replacedParts = normalizeParts(patch.replacedParts);
  }

  if (patch.status === 'Completed' && patch.completedAt === undefined) {
    next.completedAt = new Date().toISOString();
  }

  if (patch.status !== undefined && patch.status !== 'Completed' && patch.completedAt === undefined) {
    next.completedAt = null;
  }

  if (patch.updatedAt === undefined) {
    next.updatedAt = new Date().toISOString();
  }

  return next;
}

function fromRow(row: OrderRow): Order {
  return normalizeOrder({
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
    complaint: row.complaint ?? '',
    queueNumber: row.queue_number,
    diagnosis: row.diagnosis ?? '',
    repairAction: row.repair_action ?? '',
    replacedParts: row.replaced_parts ?? [],
    adminNotes: row.admin_notes ?? '',
    updatedAt: row.updated_at ?? row.created_at,
    completedAt: row.completed_at ?? null,
  });
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
    complaint: order.complaint,
    queue_number: order.queueNumber,
    diagnosis: order.diagnosis,
    repair_action: order.repairAction,
    replaced_parts: normalizeParts(order.replacedParts),
    admin_notes: order.adminNotes,
    created_at: order.createdAt,
    updated_at: order.updatedAt,
    completed_at: order.completedAt,
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
  if (patch.complaint !== undefined) next.complaint = patch.complaint;
  if (patch.queueNumber !== undefined) next.queue_number = patch.queueNumber;
  if (patch.diagnosis !== undefined) next.diagnosis = patch.diagnosis;
  if (patch.repairAction !== undefined) next.repair_action = patch.repairAction;
  if (patch.replacedParts !== undefined) next.replaced_parts = normalizeParts(patch.replacedParts);
  if (patch.adminNotes !== undefined) next.admin_notes = patch.adminNotes;
  if (patch.updatedAt !== undefined) next.updated_at = patch.updatedAt;
  if (patch.completedAt !== undefined) next.completed_at = patch.completedAt;

  return next;
}

async function readLocalOrders(): Promise<Order[]> {
  try {
    const raw = (await AsyncStorage.getItem(ORDERS_KEY)) ?? (await AsyncStorage.getItem(LEGACY_ORDERS_KEY));
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as Array<Partial<Order> & Pick<Order, 'id' | 'name' | 'phone' | 'bike' | 'service' | 'serviceType' | 'date' | 'slot'>>;
    return parsed.map((item) => normalizeOrder(item));
  } catch (error) {
    console.warn('readLocalOrders error', error);
    return [];
  }
}

async function writeLocalOrders(orders: Order[]) {
  const normalized = orders.map((order) => normalizeOrder(order));
  await AsyncStorage.setItem(ORDERS_KEY, JSON.stringify(normalized));
  await AsyncStorage.removeItem(LEGACY_ORDERS_KEY);
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

    return readLocalOrders();
  } catch (error) {
    console.warn('getOrders error', error);
    return [];
  }
}

export async function getAllOrders(): Promise<Order[]> {
  try {
    if (hasRemoteBackend()) {
      const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });

      if (error) {
        console.warn('getAllOrders error', error);
        return [];
      }

      return (data ?? []).map((row) => fromRow(row as OrderRow));
    }

    return readLocalOrders();
  } catch (error) {
    console.warn('getAllOrders error', error);
    return [];
  }
}

export async function saveOrder(order: Order) {
  try {
    const normalized = normalizeOrder(order);

    if (hasRemoteBackend()) {
      const { data, error } = await supabase
        .from('orders')
        .insert(toRow(normalized, currentUserId!))
        .select()
        .single();

      if (error) {
        console.warn('saveOrder error', error);
        return null;
      }

      return fromRow(data as OrderRow);
    }

    const orders = await readLocalOrders();
    const next = [normalized, ...orders];
    await writeLocalOrders(next);
    return normalized;
  } catch (error) {
    console.warn('saveOrder error', error);
    return null;
  }
}

export async function updateOrder(id: string, patch: OrderPatch) {
  try {
    const normalizedPatch = normalizePatch(patch);

    if (hasRemoteBackend()) {
      const { data, error } = await supabase
        .from('orders')
        .update(toPatch(normalizedPatch))
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

    const orders = await readLocalOrders();
    const next = orders.map((order) => (order.id === id ? normalizeOrder({ ...order, ...normalizedPatch }) : order));
    await writeLocalOrders(next);
    return next.find((order) => order.id === id) ?? null;
  } catch (error) {
    console.warn('updateOrder error', error);
    return null;
  }
}

export async function adminUpdateOrder(id: string, patch: OrderPatch) {
  try {
    const normalizedPatch = normalizePatch(patch);

    if (hasRemoteBackend()) {
      const { data, error } = await supabase
        .from('orders')
        .update(toPatch(normalizedPatch))
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.warn('adminUpdateOrder error', error);
        return null;
      }

      return fromRow(data as OrderRow);
    }

    const orders = await readLocalOrders();
    const next = orders.map((order) => (order.id === id ? normalizeOrder({ ...order, ...normalizedPatch }) : order));
    await writeLocalOrders(next);
    return next.find((order) => order.id === id) ?? null;
  } catch (error) {
    console.warn('adminUpdateOrder error', error);
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
    await AsyncStorage.removeItem(LEGACY_ORDERS_KEY);
  } catch (error) {
    console.warn('clearOrders error', error);
  }
}

export async function migrateLocalToBackend(userId: string) {
  try {
    if (!isSupabaseConfigured || !userId) {
      return;
    }

    const localOrders = await readLocalOrders();
    if (!localOrders.length) {
      return;
    }

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
    await AsyncStorage.removeItem(LEGACY_ORDERS_KEY);
  } catch (error) {
    console.warn('migrateLocalToBackend error', error);
  }
}

export default {
  ORDER_STATUSES,
  getOrders,
  getAllOrders,
  saveOrder,
  updateOrder,
  adminUpdateOrder,
  clearOrders,
  configureBackend,
  migrateLocalToBackend,
};
