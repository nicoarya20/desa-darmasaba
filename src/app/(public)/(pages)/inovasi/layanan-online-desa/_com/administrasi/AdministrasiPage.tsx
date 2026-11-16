'use client';
import { PermohonanLayout } from '@/app/(public)/(pages)/ppid/_com/PermohonanLayout';
import { PermohonanSteps } from '@/app/(public)/(pages)/ppid/_com/PermohonanSteps';
import { KabarListHeader } from '@/app/(public)/_com/kabar-list/KabarListHeader';
import { KABAR_BRAND_VARS } from '@/app/(public)/_com/main-page/kabar-desa/kabar.meta';
import kabar from '@/app/(public)/_com/main-page/kabar-desa/kabar.module.css';
import { AdministrasiForm, AdministrasiSent } from './AdministrasiForm';
import { JenisLayananSection } from './JenisLayananSection';
import s from './administrasi.module.css';
import { ADMINISTRASI_STEPS, ADMINISTRASI_TEXT as T } from './administrasi.text';
import { useAdministrasiForm } from './use-administrasi-form';
import { useJenisLayanan } from './use-jenis-layanan';

/**
 * Halaman Administrasi Online di `.section` Kabar: kepala tanpa cari, lalu tata letak permohonan PPID (alur + jenis
 * layanan di kiri, kartu formulir `#f5f5f7` di kanan; di bawah 75em bertumpuk dengan formulir di atas, seragam Ajukan Ide).
 * Sukses → terima kasih di tempat formulir.
 */
export function AdministrasiPage() {
  const jenis = useJenisLayanan();
  const form = useAdministrasiForm();
  const jenisNama =
    jenis.status === 'ready' ? jenis.items.find((item) => item.id === form.values.jenisLayananId)?.nama : undefined;

  return (
    <div className={kabar.section} style={KABAR_BRAND_VARS}>
      <KabarListHeader
        title={T.title}
        lead={T.lead}
        searchLabel={T.searchLabel}
        searchPlaceholder={T.searchPlaceholder}
        kategoriLabel={T.kategoriLabel}
        tabs={[]}
        search=""
        // Halaman formulir tanpa kolom cari (searchable=false), jadi onSearch tidak pernah dipanggil.
        onSearch={() => undefined}
        searchable={false}
      />
      <div className={s.layout}>
        <PermohonanLayout
          aside={
            <div className={s.aside}>
              <PermohonanSteps title={T.stepsTitle} steps={ADMINISTRASI_STEPS} />
              <JenisLayananSection jenis={jenis} />
            </div>
          }
        >
          {form.status === 'sent' ? (
            <AdministrasiSent jenisNama={jenisNama} onReset={form.reset} />
          ) : (
            <AdministrasiForm
              values={form.values}
              errors={form.errors}
              status={form.status}
              jenis={jenis}
              onField={form.setField}
              onSubmit={() => void form.submit()}
            />
          )}
        </PermohonanLayout>
      </div>
    </div>
  );
}
