import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { GarageTheme } from '@/constants/garage-theme';
import BrandLockup from '../components/BrandLockup';
import RequireAuthNotice from '../components/RequireAuthNotice';
import { useAuth } from '../context/AuthProvider';
import { getOrders, saveOrder, type Order } from '../utils/storage';

const SERVICE_TYPES = ['Service Besar', 'Service Bulanan'];
const MONTHLY_SLOTS = ['09:00-11:00', '11:00-13:00', '13:00-15:00', '15:00-17:00', '17:00-19:00', '19:00-21:00'];

export default function BookingScreen() {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [bike, setBike] = useState('');
  const [complaint, setComplaint] = useState('');
  const [service, setService] = useState<string>(SERVICE_TYPES[0]);
  const [date, setDate] = useState<string | null>(null);
  const [slot, setSlot] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [showSlotModal, setShowSlotModal] = useState(false);

  const loadOrders = useCallback(async () => {
    setOrders(await getOrders());
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [loadOrders])
  );

  if (!user) {
    return <RequireAuthNotice message="Silakan masuk untuk membuat pemesanan service dan menyimpan riwayat kendaraan." />;
  }

  const makeKey = (dateValue: Date) => dateValue.toISOString().slice(0, 10);
  const isFriday = (dateValue: Date) => dateValue.getDay() === 5;

  const availableForDate = (dateKey: string, serviceType: string) => {
    const items = orders.filter((order) => order.date === dateKey);
    if (serviceType === 'Service Besar') {
      return items.filter((order) => order.serviceType === 'Service Besar').length === 0;
    }
    return items.filter((order) => order.serviceType === 'Service Bulanan').length < MONTHLY_SLOTS.length;
  };

  const countUsedMonthly = (dateKey: string) =>
    orders.filter((order) => order.date === dateKey && order.serviceType === 'Service Bulanan').length;

  const submit = async () => {
    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();
    const trimmedBike = bike.trim();
    const trimmedComplaint = complaint.trim();

    if (!trimmedName || !trimmedPhone || !trimmedBike) {
      return Alert.alert('Lengkapi data');
    }
    if (!date) return Alert.alert('Pilih tanggal');
    if (!service) return Alert.alert('Pilih jenis service');
    if (service === 'Service Bulanan' && !slot) return Alert.alert('Pilih slot waktu');

    await loadOrders();
    const dateKey = date;

    if (!availableForDate(dateKey, service)) {
      return Alert.alert('Maaf', 'Tanggal ini sudah penuh untuk pilihan service tersebut');
    }

    if (service === 'Service Bulanan') {
      const conflict = orders.find(
        (order) => order.date === dateKey && order.serviceType === 'Service Bulanan' && order.slot === slot
      );
      if (conflict) return Alert.alert('Maaf', 'Slot sudah terpakai');
    }

    const now = new Date().toISOString();
    const order: Order = {
      id: String(Date.now()),
      name: trimmedName,
      phone: trimmedPhone,
      bike: trimmedBike,
      service: service === 'Service Besar' ? 'Service Besar' : 'Service Bulanan',
      serviceType: service,
      date: dateKey,
      slot: service === 'Service Bulanan' ? slot! : 'Full Day 09:00-17:00',
      status: 'Received',
      createdAt: now,
      complaint: trimmedComplaint,
      queueNumber: null,
      diagnosis: '',
      repairAction: '',
      replacedParts: [],
      adminNotes: '',
      serviceCost: 0,
      partsCost: 0,
      updatedAt: now,
      completedAt: null,
    };

    const saved = await saveOrder(order);
    if (!saved) {
      return Alert.alert('Pemesanan gagal', 'Data tidak tersimpan. Coba lagi atau cek konfigurasi Supabase.');
    }

    Alert.alert('Pemesanan berhasil', 'Order tersimpan di riwayat');
    setName('');
    setPhone('');
    setBike('');
    setComplaint('');
    setDate(null);
    setSlot(null);
    loadOrders();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <BrandLockup caption="Booking servis besar dan servis bulanan dengan slot yang lebih rapi." compact />
        <Text style={styles.heroTitle}>Booking Service</Text>
        <Text style={styles.heroSubtitle}>
          Isi data kendaraan, pilih jenis servis, lalu tambahkan keluhan agar admin bisa menyiapkan penanganan lebih cepat.
        </Text>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.sectionTitle}>Data Pelanggan</Text>
        <InputRow icon="person-outline" placeholder="Nama pelanggan" value={name} onChangeText={setName} />
        <InputRow icon="call-outline" placeholder="08xx..." value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        <InputRow icon="bicycle-outline" placeholder="Contoh: Honda Vario" value={bike} onChangeText={setBike} />

        <Text style={styles.sectionTitle}>Keluhan Kendaraan</Text>
        <View style={styles.textAreaWrap}>
          <TextInput
            style={styles.textArea}
            value={complaint}
            onChangeText={setComplaint}
            placeholder="Contoh: mesin brebet, rem belakang bunyi, oli cepat habis"
            placeholderTextColor={GarageTheme.textDim}
            multiline
            textAlignVertical="top"
          />
        </View>

        <Text style={styles.sectionTitle}>Jadwal Servis</Text>
        <PickerRow label="Jenis service" icon="construct-outline" value={service} onPress={() => setShowServiceModal(true)} />
        <PickerRow label="Tanggal booking" icon="calendar-outline" value={date ?? 'Pilih tanggal'} onPress={() => setShowDateModal(true)} />

        {service === 'Service Bulanan' ? (
          <PickerRow
            label="Slot waktu"
            icon="time-outline"
            value={slot ?? 'Pilih slot (Service Bulanan)'}
            onPress={() => setShowSlotModal(true)}
          />
        ) : null}

        <TouchableOpacity style={styles.button} onPress={submit} activeOpacity={0.92}>
          <Text style={styles.buttonText}>Pesan Sekarang</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={showServiceModal} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Pilih Service</Text>
            {SERVICE_TYPES.map((serviceType) => (
              <TouchableOpacity
                key={serviceType}
                style={styles.modalItem}
                onPress={() => {
                  setService(serviceType);
                  setShowServiceModal(false);
                  setSlot(null);
                }}
              >
                <Text style={styles.modalItemText}>{serviceType}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.modalClose} onPress={() => setShowServiceModal(false)}>
              <Text style={styles.modalCloseText}>Tutup</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showDateModal} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalBox, { maxHeight: '70%' }]}>
            <Text style={styles.modalTitle}>Pilih Tanggal</Text>
            <FlatList
              data={Array.from({ length: 30 })
                .map((_, index) => {
                  const nextDate = new Date();
                  nextDate.setDate(nextDate.getDate() + index + 1);
                  return nextDate;
                })
                .filter((dateValue) => !isFriday(dateValue))}
              keyExtractor={(dateValue: Date) => makeKey(dateValue)}
              renderItem={({ item: dateValue }) => {
                const key = makeKey(dateValue);
                const dateLabel = dateValue.toDateString();
                const disabled = !availableForDate(key, service);

                return (
                  <TouchableOpacity
                    disabled={disabled}
                    style={[styles.modalItem, disabled && styles.modalItemDisabled]}
                    onPress={() => {
                      setDate(key);
                      setShowDateModal(false);
                      setSlot(null);
                    }}
                  >
                    <Text style={styles.modalItemText}>{dateLabel}</Text>
                    {service === 'Service Bulanan' ? (
                      <Text style={styles.modalMetaText}>
                        {countUsedMonthly(key)} / {MONTHLY_SLOTS.length} terpakai
                      </Text>
                    ) : null}
                  </TouchableOpacity>
                );
              }}
            />
            <TouchableOpacity style={styles.modalClose} onPress={() => setShowDateModal(false)}>
              <Text style={styles.modalCloseText}>Tutup</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showSlotModal} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalBox, { maxHeight: '60%' }]}>
            <Text style={styles.modalTitle}>Pilih Slot</Text>
            {MONTHLY_SLOTS.map((slotValue) => {
              const taken = orders.find(
                (order) => order.date === date && order.serviceType === 'Service Bulanan' && order.slot === slotValue
              );

              return (
                <TouchableOpacity
                  key={slotValue}
                  disabled={!date || !!taken}
                  style={[styles.modalItem, (!date || taken) && styles.modalItemDisabled]}
                  onPress={() => {
                    setSlot(slotValue);
                    setShowSlotModal(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{slotValue}</Text>
                  {taken ? <Text style={styles.modalTakenText}>Terpakai</Text> : null}
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity style={styles.modalClose} onPress={() => setShowSlotModal(false)}>
              <Text style={styles.modalCloseText}>Tutup</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

type InputRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
  keyboardType?: 'default' | 'phone-pad';
};

function InputRow({ icon, placeholder, value, onChangeText, keyboardType = 'default' }: InputRowProps) {
  return (
    <View style={styles.inputRow}>
      <Ionicons name={icon} size={18} color={GarageTheme.textDim} style={styles.inputIcon} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={GarageTheme.textDim}
        keyboardType={keyboardType}
      />
    </View>
  );
}

type PickerRowProps = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  onPress: () => void;
};

function PickerRow({ label, icon, value, onPress }: PickerRowProps) {
  return (
    <>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TouchableOpacity style={styles.inputRow} onPress={onPress}>
        <Ionicons name={icon} size={18} color={GarageTheme.textDim} style={styles.inputIcon} />
        <Text style={styles.pickerText}>{value}</Text>
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: GarageTheme.bg },
  content: { padding: 20, paddingBottom: 32 },
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
  formCard: {
    backgroundColor: GarageTheme.bgElevated,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: GarageTheme.border,
    padding: 18,
  },
  sectionTitle: {
    color: GarageTheme.text,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 12,
    marginTop: 8,
  },
  fieldLabel: {
    color: GarageTheme.textDim,
    fontSize: 12,
    marginBottom: 8,
    marginTop: 10,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GarageTheme.bgSoft,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: GarageTheme.border,
    marginBottom: 10,
  },
  inputIcon: { marginRight: 10 },
  input: { color: GarageTheme.text, flex: 1, fontSize: 14 },
  textAreaWrap: {
    backgroundColor: GarageTheme.bgSoft,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: GarageTheme.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
  },
  textArea: {
    color: GarageTheme.text,
    minHeight: 96,
    fontSize: 14,
  },
  pickerText: { color: GarageTheme.text, flex: 1, fontSize: 14, fontWeight: '600' },
  button: {
    marginTop: 14,
    backgroundColor: GarageTheme.gold,
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: 'center',
  },
  buttonText: { color: '#111', fontWeight: '800', fontSize: 15 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 20 },
  modalBox: {
    backgroundColor: GarageTheme.panel,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: GarageTheme.border,
  },
  modalTitle: { color: GarageTheme.goldBright, fontWeight: '800', fontSize: 16, marginBottom: 12 },
  modalItem: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: GarageTheme.border },
  modalItemDisabled: { opacity: 0.45 },
  modalItemText: { color: GarageTheme.text, fontWeight: '600' },
  modalMetaText: { color: GarageTheme.textDim, fontSize: 12, marginTop: 4 },
  modalTakenText: { color: GarageTheme.danger, marginTop: 4, fontSize: 12 },
  modalClose: {
    marginTop: 14,
    backgroundColor: '#1d1d1d',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalCloseText: { color: GarageTheme.text, fontWeight: '700' },
});
