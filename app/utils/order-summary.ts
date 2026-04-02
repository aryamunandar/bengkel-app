import type { Order } from './storage';

const currencyFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

export function formatCurrency(amount: number) {
  return currencyFormatter.format(amount);
}

export function getOrderTotal(order: Pick<Order, 'serviceCost' | 'partsCost'>) {
  return Math.max(0, order.serviceCost) + Math.max(0, order.partsCost);
}

export function getInvoiceNumber(order: Pick<Order, 'id' | 'date'>) {
  const compactDate = order.date.replace(/-/g, '');
  const suffix = order.id.replace(/-/g, '').slice(0, 6).toUpperCase();
  return `JG-${compactDate}-${suffix}`;
}

export function buildServiceSummary(order: Order) {
  return [
    `Ringkasan Servis Johan Garage`,
    `Invoice: ${getInvoiceNumber(order)}`,
    `Pelanggan: ${order.name}`,
    `No. HP: ${order.phone}`,
    `Motor: ${order.bike}`,
    `Jenis Servis: ${order.service}`,
    `Tanggal Booking: ${order.date}`,
    `Slot: ${order.slot}`,
    `Status: ${order.status}`,
    order.queueNumber !== null ? `Nomor Antrian: #${order.queueNumber}` : '',
    order.complaint ? `Keluhan: ${order.complaint}` : '',
    order.diagnosis ? `Kerusakan: ${order.diagnosis}` : '',
    order.repairAction ? `Perbaikan: ${order.repairAction}` : '',
    order.replacedParts.length ? `Part Diganti: ${order.replacedParts.join(', ')}` : '',
    order.adminNotes ? `Catatan Admin: ${order.adminNotes}` : '',
    order.completedAt ? `Selesai: ${new Date(order.completedAt).toLocaleString('id-ID')}` : '',
  ]
    .filter(Boolean)
    .join('\n');
}

export function buildInvoiceSummary(order: Order) {
  const total = getOrderTotal(order);

  return [
    `Invoice Johan Garage`,
    `No. Invoice: ${getInvoiceNumber(order)}`,
    `Pelanggan: ${order.name}`,
    `Motor: ${order.bike}`,
    `Servis: ${order.service}`,
    `Tanggal: ${order.date}`,
    `Biaya Servis: ${formatCurrency(order.serviceCost)}`,
    `Biaya Part: ${formatCurrency(order.partsCost)}`,
    `Total: ${formatCurrency(total)}`,
    order.replacedParts.length ? `Part Diganti: ${order.replacedParts.join(', ')}` : '',
    order.adminNotes ? `Catatan: ${order.adminNotes}` : '',
  ]
    .filter(Boolean)
    .join('\n');
}
