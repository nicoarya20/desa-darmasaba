import type { SystemOverviewResponse } from '@/lib/jenna/types';

export type DevWarning = {
  id: string;
  severity: 'danger' | 'warning';
  title: string;
  detail: string;
  href?: string;
};

type Snapshot = Readonly<SystemOverviewResponse>;

/** Daftar "Perlu perhatian" dari snapshot Ringkasan Sistem; danger di atas, urutan sinyal dipertahankan. */
export function buildDevWarnings(snapshot: Snapshot): DevWarning[] {
  const { database, minio, env, jenna, migrations } = snapshot;
  const warnings: DevWarning[] = [];

  if (!database.ok) {
    warnings.push({
      id: 'database',
      severity: 'danger',
      title: 'Database tidak terhubung',
      detail: database.error ?? 'Aplikasi tidak dapat membaca atau menyimpan data.',
    });
  }
  if (!minio.ok) {
    warnings.push({
      id: 'minio',
      severity: 'danger',
      title: 'Penyimpanan file tidak terhubung',
      detail: minio.error ?? 'Gambar dan dokumen tidak dapat diunggah atau ditampilkan.',
    });
  }

  if (migrations.ok && migrations.failed.length > 0) {
    warnings.push({
      id: 'migrations-failed',
      severity: 'danger',
      title: 'Migrasi database gagal',
      detail: `${migrations.failed.length} migrasi gagal diterapkan: ${migrations.failed.join(', ')}. Periksa log deploy sebelum menerapkan perubahan lain.`,
    });
  }
  if (migrations.ok && migrations.pending.length > 0) {
    const [first] = migrations.pending;
    warnings.push({
      id: 'migrations-pending',
      severity: 'warning',
      title: 'Migrasi database belum diterapkan',
      detail:
        migrations.pending.length === 1
          ? `Migrasi ${first} belum diterapkan.`
          : `${migrations.pending.length} migrasi belum diterapkan, mulai dari ${first}.`,
    });
  }
  if (!migrations.ok) {
    warnings.push({
      id: 'migrations-unreadable',
      severity: 'warning',
      title: 'Status migrasi tidak dapat dibaca',
      detail: migrations.error,
    });
  }

  const missingEnv = env.filter((e) => !e.set).map((e) => e.name);
  if (missingEnv.length > 0) {
    warnings.push({
      id: 'env-missing',
      severity: 'warning',
      title: 'Variabel lingkungan belum diatur',
      detail: `Belum diatur: ${missingEnv.join(', ')}.`,
    });
  }

  if (!jenna.cryptoConfigured) {
    warnings.push({
      id: 'jenna-crypto',
      severity: 'warning',
      title: 'Kunci enkripsi Jenna belum diatur',
      detail: 'API key provider Jenna tidak dapat disimpan atau dipakai sampai JENNA_CREDENTIALS_KEY diatur di server.',
    });
  }
  if (jenna.enabled && !jenna.ready) {
    warnings.push({
      id: 'jenna-not-ready',
      severity: 'warning',
      title: 'Jenna aktif tetapi belum siap',
      detail: 'Warga belum bisa memakai asisten. Lengkapi pengaturan provider dan uji koneksinya.',
      href: '/dev/jenna/provider',
    });
  }

  return [...warnings.filter((w) => w.severity === 'danger'), ...warnings.filter((w) => w.severity === 'warning')];
}
