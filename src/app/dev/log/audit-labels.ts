import type { AuditAction } from '@/lib/audit';

/** Satu-satunya peta label aksi audit; `Record<AuditAction, …>` memaksa aksi baru diberi label. */
export const AUDIT_ACTION_LABELS: Record<AuditAction, string> = {
  'user.update': 'Ubah data pengguna',
  'user.role.update': 'Ubah role pengguna',
  'user.activate': 'Aktifkan pengguna',
  'user.deactivate': 'Nonaktifkan pengguna',
  'user.delete': 'Hapus pengguna',
  'role.create': 'Buat role',
  'role.update': 'Ubah role',
  'role.delete': 'Hapus role',
  'jenna.settings.update': 'Ubah setelan Jenna',
  'jenna.provider.update': 'Ubah provider Jenna',
  'jenna.provider.key.delete': 'Hapus API key provider Jenna',
  'jenna.voice.provider.update': 'Ubah provider suara Jenna',
  'jenna.voice.provider.key.delete': 'Hapus API key suara Jenna',
  'jenna.conversation.view': 'Buka percakapan Jenna',
  'jenna.conversation.delete': 'Hapus percakapan Jenna',
  'laporan_publik.status.update': 'Ubah status laporan publik',
  'laporan_publik.delete': 'Hapus laporan publik',
  'menu_visibility.update': 'Ubah visibilitas menu',
};

export const AUDIT_ACTION_OPTIONS = Object.keys(AUDIT_ACTION_LABELS) as AuditAction[];

/** Aksi lama yang sudah tidak dikenal tetap tampil apa adanya. */
export function auditActionLabel(action: string): string {
  return Object.hasOwn(AUDIT_ACTION_LABELS, action) ? AUDIT_ACTION_LABELS[action as AuditAction] : action;
}

/** Warna badge: hapus merah, buat/aktifkan hijau, nonaktifkan oranye, lihat abu-abu, lainnya biru. */
export function auditActionColor(action: string): string {
  if (action.endsWith('.delete')) return 'red';
  if (action.endsWith('.create') || action.endsWith('.activate')) return 'green';
  if (action.endsWith('.deactivate')) return 'orange';
  if (action.endsWith('.view')) return 'gray';
  return 'blue';
}

const TARGET_TYPE_LABELS: Record<string, string> = {
  user: 'Pengguna',
  role: 'Role',
  jenna_settings: 'Setelan Jenna',
  jenna_provider: 'Provider Jenna',
  jenna_conversation: 'Percakapan Jenna',
  laporan_publik: 'Laporan publik',
  menu_visibility: 'Visibilitas menu',
};

export function auditTargetLabel(targetType: string): string {
  return Object.hasOwn(TARGET_TYPE_LABELS, targetType) ? TARGET_TYPE_LABELS[targetType] : targetType;
}
