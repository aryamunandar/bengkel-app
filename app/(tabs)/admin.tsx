import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, ScrollView, Share, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { GarageTheme } from '@/constants/garage-theme';
import BrandLockup from '../components/BrandLockup';
import OrderCard from '../components/OrderCard';
import RequireAuthNotice from '../components/RequireAuthNotice';
import { useAuth } from '../context/AuthProvider';
import { buildInvoiceSummary, buildServiceSummary, formatCurrency, getOrderTotal } from '../utils/order-summary';
import { adminUpdateOrder, getAllOrders, ORDER_STATUSES, type Order } from '../utils/storage';

const FILTER_OPTIONS = ['All', ...ORDER_STATUSES] as const;

type FilterStatus = (typeof FILTER_OPTIONS)[number];

function parseMoneyInput(value: string) {
  const digits = value.replace(/[^\d]/g, '');
  return digits ? Number(digits) : 0;
}

function formatMoneyInput(value: number) {
  return value > 0 ? String(value) : '';
}

export default function AdminScreen() {
  const { user, isAdmin } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selected, setSelected] = useState<Order | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('All');
  const [queueNumber, setQueueNumber] = useState('');
  const [status, setStatus] = useState<string>('Received');
  const [diagnosis, setDiagnosis] = useState('');
  const [repairAction, setRepairAction] = useState('');
  const [replacedParts, setReplacedParts] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [serviceCost, setServiceCost] = useState('');
  const [partsCost, setPartsCost] = useState('');

  const hydrateForm = useCallback((order: Order | null) => {
    if (!order) {
      setQueueNumber('');
      setStatus('Received');
      setDiagnosis('');
      setRepairAction('');
      setReplacedParts('');
      setAdminNotes('');
      setServiceCost('');
      setPartsCost('');
      return;
    }

    setQueueNumber(order.queueNumber !== null ? String(order.queueNumber) : '');
    setStatus(order.status);
    setDiagnosis(order.diagnosis);
    setRepairAction(order.repairAction);
    setReplacedParts(order.replacedParts.join(', '));
    setAdminNotes(order.adminNotes);
    setServiceCost(formatMoneyInput(order.serviceCost));
    setPartsCost(formatMoneyInput(order.partsCost));
  }, []);

  const loadOrders = useCallback(async () => {
    if (!user || !isAdmin) {
      setOrders([]);
      setSelected(null);
      return;
    }

    const next = await getAllOrders();
    setOrders(next);
    setSelected((current) => {
      if (!next.length) {
        return null;
      }

      if (!current) {
        return next[0];
      }

      return next.find((order) => order.id === current.id) ?? next[0];
    });
  }, [isAdmin, user]);

  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [loadOrders])
  );

  useEffect(() => {
    hydrateForm(selected);
  }, [hydrateForm, selected]);

  if (!user) {
    return <RequireAuthNotice message="Masuk dulu untuk mengakses panel admin." />;
  }

  if (!isAdmin) {
    return (
      <View style={styles.centerWrap}>
        <View style={styles.lockCard}>
          <BrandLockup caption="Panel ini hanya untuk pengelolaan data order dan history servis." compact />
          <Text style={styles.lockTitle}>Akses Admin Dibutuhkan</Text>
          <Text style={styles.lockText}>
            Akun ini belum punya role admin. Setelah role akunmu diubah jadi admin di Supabase, menu ini akan aktif.
          </Text>
        </View>
      </View>
    );
  }

  const activeCount = orders.filter((order) => order.status !== 'Completed').length;
  const completedCount = orders.filter((order) => order.status === 'Completed').length;

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = filterStatus === 'All' ? true : order.status === filterStatus;
    const keyword = searchQuery.trim().toLowerCase();

    if (!keyword) {
      return matchesStatus;
    }

    const haystack = [
      order.name,
      order.phone,
      order.bike,
      order.service,
      order.complaint,
      order.diagnosis,
      order.repairAction,
    ]
      .join(' ')
      .toLowerCase();

    return matchesStatus && haystack.includes(keyword);
  });

  const buildPatch = (overrides: Partial<Order> = {}) => {
    const trimmedQueue = queueNumber.trim();
    const parsedQueue = trimmedQueue ? Number(trimmedQueue) : null;

    if (trimmedQueue && Number.isNaN(parsedQueue)) {
      throw new Error('Nomor antrian tidak valid');
    }

    return {
      queueNumber: parsedQueue,
      status,
      diagnosis: diagnosis.trim(),
      repairAction: repairAction.trim(),
      replacedParts: replacedParts
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
      adminNotes: adminNotes.trim(),
      serviceCost: parseMoneyInput(serviceCost),
      partsCost: parseMoneyInput(partsCost),
      ...overrides,
    };
  };

  const getDraftOrder = (overrides: Partial<Order> = {}) => {
    if (!selected) {
      return null;
    }

    const patch = buildPatch(overrides);
    return {
      ...selected,
      ...patch,
    } satisfies Order;
  };

  const persistChanges = async (overrides: Partial<Order> = {}, successMessage = 'Perubahan order berhasil disimpan.') => {
    if (!selected) {
      return null;
    }

    try {
      const patch = buildPatch(overrides);
      const updated = await adminUpdateOrder(selected.id, patch);

      if (!updated) {
        Alert.alert('Gagal menyimpan', 'Perubahan order belum tersimpan. Coba lagi sesaat lagi.');
        return null;
      }

      setOrders((current) => current.map((order) => (order.id === updated.id ? updated : order)));
      setSelected(updated);
      Alert.alert('Tersimpan', successMessage);
      return updated;
    } catch (error) {
      Alert.alert('Input belum valid', error instanceof Error ? error.message : 'Periksa kembali data yang dimasukkan.');
      return null;
    }
  };

  const shareServiceSummary = async () => {
    try {
      const draft = getDraftOrder();
      if (!draft) {
        return;
      }

      await Share.share({ message: buildServiceSummary(draft) });
    } catch (error) {
      Alert.alert('Gagal membagikan', 'Ringkasan servis belum bisa dibagikan.');
    }
  };

  const shareInvoice = async () => {
    try {
      const draft = getDraftOrder();
      if (!draft) {
        return;
      }

      await Share.share({ message: buildInvoiceSummary(draft) });
    } catch (error) {
      Alert.alert('Gagal membagikan', 'Invoice belum bisa dibagikan.');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <BrandLockup caption="Kelola antrian, status, biaya, dan ringkasan servis dari satu panel admin." compact />
        <Text style={styles.heroTitle}>Panel Admin</Text>
        <Text style={styles.heroSubtitle}>
          Cari order dengan cepat, filter berdasarkan status, update progres pengerjaan, isi biaya, lalu bagikan invoice
          atau ringkasan servis.
        </Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Order Aktif</Text>
          <Text style={styles.statValue}>{activeCount}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Selesai</Text>
          <Text style={styles.statValue}>{completedCount}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Tampil</Text>
          <Text style={styles.statValue}>{filteredOrders.length}</Text>
        </View>
      </View>

      <View style={styles.toolsCard}>
        <Text style={styles.sectionTitle}>Cari dan Filter</Text>
        <View style={styles.searchRow}>
          <Ionicons name="search-outline" size={18} color={GarageTheme.textDim} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Cari nama, motor, telepon, atau keluhan"
            placeholderTextColor={GarageTheme.textDim}
          />
        </View>

        <View style={styles.filterRow}>
          {FILTER_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option}
              style={[styles.filterChip, filterStatus === option && styles.filterChipActive]}
              onPress={() => setFilterStatus(option)}
            >
              <Text style={[styles.filterChipText, filterStatus === option && styles.filterChipTextActive]}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <Text style={styles.sectionTitle}>Daftar Order</Text>
      {filteredOrders.length === 0 ? <Text style={styles.empty}>Tidak ada order yang cocok dengan pencarian atau filter.</Text> : null}

      {filteredOrders.map((order) => (
        <View key={order.id} style={[styles.orderShell, selected?.id === order.id && styles.orderShellActive]}>
          <OrderCard order={order} onPress={setSelected} />
        </View>
      ))}

      {selected ? (
        <View style={styles.editorCard}>
          <Text style={styles.editorTitle}>Edit Order Terpilih</Text>

          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Pelanggan</Text>
              <Text style={styles.summaryValue}>{selected.name}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Motor</Text>
              <Text style={styles.summaryValue}>{selected.bike}</Text>
            </View>
          </View>

          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Telepon</Text>
              <Text style={styles.summaryValue}>{selected.phone}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Booking</Text>
              <Text style={styles.summaryValue}>{selected.date}</Text>
            </View>
          </View>

          <View style={styles.infoBlock}>
            <Text style={styles.summaryLabel}>Keluhan user</Text>
            <Text style={styles.summaryValue}>{selected.complaint || 'Belum ada keluhan ditulis user.'}</Text>
          </View>

          <Text style={styles.fieldLabel}>Aksi cepat status</Text>
          <View style={styles.quickActionRow}>
            {ORDER_STATUSES.map((statusOption) => (
              <TouchableOpacity
                key={statusOption}
                style={[styles.quickStatusChip, status === statusOption && styles.quickStatusChipActive]}
                onPress={() => {
                  setStatus(statusOption);
                  persistChanges({ status: statusOption }, `Status order diubah ke ${statusOption}.`);
                }}
              >
                <Text style={[styles.quickStatusText, status === statusOption && styles.quickStatusTextActive]}>
                  {statusOption}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.fieldLabel}>Status order</Text>
          <View style={styles.statusRow}>
            {ORDER_STATUSES.map((statusOption) => (
              <TouchableOpacity
                key={statusOption}
                style={[styles.statusOption, status === statusOption && styles.statusOptionActive]}
                onPress={() => setStatus(statusOption)}
              >
                <Text style={[styles.statusOptionText, status === statusOption && styles.statusOptionTextActive]}>
                  {statusOption}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.fieldLabel}>Nomor antrian</Text>
          <TextInput
            style={styles.input}
            value={queueNumber}
            onChangeText={setQueueNumber}
            placeholder="Contoh: 12"
            placeholderTextColor={GarageTheme.textDim}
            keyboardType="number-pad"
          />

          <Text style={styles.fieldLabel}>Kerusakan / hasil diagnosa</Text>
          <TextInput
            style={styles.textArea}
            value={diagnosis}
            onChangeText={setDiagnosis}
            placeholder="Contoh: kampas rem belakang tipis, roller CVT aus"
            placeholderTextColor={GarageTheme.textDim}
            multiline
            textAlignVertical="top"
          />

          <Text style={styles.fieldLabel}>Tindakan perbaikan</Text>
          <TextInput
            style={styles.textArea}
            value={repairAction}
            onChangeText={setRepairAction}
            placeholder="Contoh: ganti kampas rem, servis CVT, setel klep"
            placeholderTextColor={GarageTheme.textDim}
            multiline
            textAlignVertical="top"
          />

          <Text style={styles.fieldLabel}>Part yang diganti</Text>
          <TextInput
            style={styles.input}
            value={replacedParts}
            onChangeText={setReplacedParts}
            placeholder="Pisahkan dengan koma, misal: kampas rem, roller, oli"
            placeholderTextColor={GarageTheme.textDim}
          />

          <Text style={styles.fieldLabel}>Biaya servis</Text>
          <TextInput
            style={styles.input}
            value={serviceCost}
            onChangeText={setServiceCost}
            placeholder="Contoh: 150000"
            placeholderTextColor={GarageTheme.textDim}
            keyboardType="number-pad"
          />

          <Text style={styles.fieldLabel}>Biaya part</Text>
          <TextInput
            style={styles.input}
            value={partsCost}
            onChangeText={setPartsCost}
            placeholder="Contoh: 85000"
            placeholderTextColor={GarageTheme.textDim}
            keyboardType="number-pad"
          />

          <View style={styles.invoicePreview}>
            <Text style={styles.summaryLabel}>Preview total</Text>
            <Text style={styles.invoiceValue}>
              {formatCurrency(
                getOrderTotal({
                  serviceCost: parseMoneyInput(serviceCost),
                  partsCost: parseMoneyInput(partsCost),
                })
              )}
            </Text>
          </View>

          <Text style={styles.fieldLabel}>Catatan admin</Text>
          <TextInput
            style={styles.textArea}
            value={adminNotes}
            onChangeText={setAdminNotes}
            placeholder="Catatan tambahan untuk history user"
            placeholderTextColor={GarageTheme.textDim}
            multiline
            textAlignVertical="top"
          />

          <TouchableOpacity style={styles.saveButton} onPress={() => persistChanges()}>
            <Text style={styles.saveButtonText}>Simpan Perubahan</Text>
          </TouchableOpacity>

          <View style={styles.shareRow}>
            <TouchableOpacity style={styles.shareButton} onPress={shareServiceSummary}>
              <Ionicons name="document-text-outline" size={16} color={GarageTheme.text} />
              <Text style={styles.shareButtonText}>Bagikan Ringkasan</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.shareButton} onPress={shareInvoice}>
              <Ionicons name="receipt-outline" size={16} color={GarageTheme.text} />
              <Text style={styles.shareButtonText}>Bagikan Invoice</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: GarageTheme.bg },
  content: { padding: 20, paddingBottom: 32 },
  centerWrap: {
    flex: 1,
    backgroundColor: GarageTheme.bg,
    justifyContent: 'center',
    padding: 20,
  },
  lockCard: {
    backgroundColor: GarageTheme.panel,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: GarageTheme.border,
    padding: 20,
  },
  lockTitle: {
    color: GarageTheme.goldBright,
    fontSize: 24,
    fontWeight: '800',
    marginTop: 18,
    marginBottom: 10,
  },
  lockText: { color: GarageTheme.textMuted, fontSize: 14, lineHeight: 21 },
  hero: {
    backgroundColor: GarageTheme.panel,
    borderWidth: 1,
    borderColor: GarageTheme.borderStrong,
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
  },
  heroTitle: {
    color: GarageTheme.goldBright,
    fontSize: 26,
    fontWeight: '800',
    marginTop: 18,
    marginBottom: 8,
  },
  heroSubtitle: {
    color: GarageTheme.textMuted,
    fontSize: 14,
    lineHeight: 21,
  },
  statsRow: { flexDirection: 'row', marginHorizontal: -4, marginBottom: 16 },
  statCard: {
    flex: 1,
    backgroundColor: GarageTheme.bgElevated,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: GarageTheme.border,
    padding: 16,
    marginHorizontal: 4,
  },
  statLabel: { color: GarageTheme.textDim, fontSize: 12, marginBottom: 6 },
  statValue: { color: GarageTheme.text, fontSize: 24, fontWeight: '900' },
  toolsCard: {
    backgroundColor: GarageTheme.bgElevated,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: GarageTheme.border,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: { color: GarageTheme.text, fontSize: 18, fontWeight: '800', marginBottom: 10 },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GarageTheme.bgSoft,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: GarageTheme.border,
    paddingHorizontal: 14,
    marginBottom: 14,
  },
  searchIcon: { marginRight: 8 },
  searchInput: {
    flex: 1,
    color: GarageTheme.text,
    paddingVertical: 14,
    fontSize: 14,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  filterChip: {
    marginHorizontal: 4,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: GarageTheme.border,
    backgroundColor: GarageTheme.bgSoft,
  },
  filterChipActive: {
    borderColor: GarageTheme.gold,
    backgroundColor: 'rgba(242, 183, 5, 0.12)',
  },
  filterChipText: { color: GarageTheme.textMuted, fontWeight: '700', fontSize: 12 },
  filterChipTextActive: { color: GarageTheme.goldBright },
  empty: { color: GarageTheme.textMuted, fontSize: 14, marginBottom: 16 },
  orderShell: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'transparent',
    padding: 4,
  },
  orderShellActive: {
    borderColor: GarageTheme.goldSoft,
    backgroundColor: 'rgba(242, 183, 5, 0.06)',
  },
  editorCard: {
    marginTop: 18,
    backgroundColor: GarageTheme.bgElevated,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: GarageTheme.border,
    padding: 18,
  },
  editorTitle: { color: GarageTheme.goldBright, fontSize: 18, fontWeight: '800', marginBottom: 14 },
  summaryRow: { flexDirection: 'row', marginHorizontal: -6 },
  summaryItem: {
    flex: 1,
    marginHorizontal: 6,
    backgroundColor: GarageTheme.bgSoft,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: GarageTheme.border,
    padding: 12,
    marginBottom: 12,
  },
  summaryLabel: { color: GarageTheme.textDim, fontSize: 12, marginBottom: 4 },
  summaryValue: { color: GarageTheme.text, fontSize: 14, fontWeight: '600', lineHeight: 20 },
  infoBlock: {
    backgroundColor: GarageTheme.bgSoft,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: GarageTheme.border,
    padding: 12,
    marginBottom: 12,
  },
  fieldLabel: {
    color: GarageTheme.text,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 6,
  },
  quickActionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  quickStatusChip: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: GarageTheme.borderStrong,
    backgroundColor: GarageTheme.panel,
    marginRight: 8,
    marginBottom: 8,
  },
  quickStatusChipActive: {
    backgroundColor: GarageTheme.gold,
    borderColor: GarageTheme.gold,
  },
  quickStatusText: {
    color: GarageTheme.goldBright,
    fontWeight: '800',
    fontSize: 12,
  },
  quickStatusTextActive: {
    color: '#111',
  },
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  statusOption: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: GarageTheme.border,
    backgroundColor: GarageTheme.bgSoft,
    marginRight: 8,
    marginBottom: 8,
  },
  statusOptionActive: {
    borderColor: GarageTheme.gold,
    backgroundColor: 'rgba(242, 183, 5, 0.12)',
  },
  statusOptionText: { color: GarageTheme.textMuted, fontWeight: '700', fontSize: 12 },
  statusOptionTextActive: { color: GarageTheme.goldBright },
  input: {
    backgroundColor: GarageTheme.bgSoft,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: GarageTheme.border,
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: GarageTheme.text,
    marginBottom: 12,
  },
  textArea: {
    backgroundColor: GarageTheme.bgSoft,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: GarageTheme.border,
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: GarageTheme.text,
    marginBottom: 12,
    minHeight: 94,
  },
  invoicePreview: {
    backgroundColor: GarageTheme.bgSoft,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: GarageTheme.border,
    padding: 12,
    marginBottom: 12,
  },
  invoiceValue: {
    color: GarageTheme.goldBright,
    fontSize: 22,
    fontWeight: '900',
  },
  saveButton: {
    marginTop: 6,
    backgroundColor: GarageTheme.gold,
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
  },
  saveButtonText: { color: '#111', fontWeight: '800', fontSize: 15 },
  shareRow: {
    flexDirection: 'row',
    marginTop: 12,
    marginHorizontal: -6,
  },
  shareButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: GarageTheme.panel,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: GarageTheme.border,
    paddingVertical: 12,
    marginHorizontal: 6,
  },
  shareButtonText: {
    color: GarageTheme.text,
    fontWeight: '700',
    marginLeft: 8,
    fontSize: 12,
  },
});
