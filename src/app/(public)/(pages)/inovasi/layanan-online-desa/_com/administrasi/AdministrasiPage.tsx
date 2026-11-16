'use client';
import { PermohonanLayout } from '@/app/(public)/(pages)/ppid/_com/PermohonanLayout';
import { PermohonanSteps } from '@/app/(public)/(pages)/ppid/_com/PermohonanSteps';
import { KabarListHeader } from '@/app/(public)/_com/kabar-list/KabarListHeader';
import { KABAR_BRAND_VARS } from '@/app/(public)/_com/main-page/kabar-desa/kabar.meta';
import kabar from '@/app/(public)/_com/main-page/kabar-desa/kabar.module.css';
import formStyles from '@/app/(public)/(pages)/inovasi/_com/inovasi-form.module.css';
import { useEffect, useRef } from 'react';
import { AdministrasiForm, AdministrasiSent } from './AdministrasiForm';
import { JenisLayananSection } from './JenisLayananSection';
import s from './administrasi.module.css';
import { ADMINISTRASI_STEPS, ADMINISTRASI_TEXT as T } from './administrasi.text';
import { useAdministrasiForm } from './use-administrasi-form';
import { useJenisLayanan } from './use-jenis-layanan';

/**
 * Halaman Administrasi Online di `.section` Kabar: kepala tanpa cari, lalu tata letak permohonan PPID (alur + jenis
 * layanan di kiri, kartu formulir `#f5f5f7` di kanan; di bawah 75em bertumpuk dengan formulir di atas, seragam Ajukan Ide).
 * Sukses → terima kasih di tempat formulir; "Ajukan layanan lain" → formulir kosong dengan fokus di isian Nama.
 * `formStyles.fullWidth`: kartu formulir sampai tepi kanan halaman.
 */
export function AdministrasiPage() {
  const jenis = useJenisLayanan();
  const form = useAdministrasiForm();
  const jenisNama =
    jenis.status === 'ready' ? jenis.items.find((item) => item.id === form.values.jenisLayananId)?.nama : undefined;
  // "Ajukan layanan lain" meng-unmount kartu terima kasih (tombolnya ikut hilang, fokus jatuh ke <body>) lalu memasang
  // formulir baru; fokus dipindah ke isian pertama setelah render itu, pola `pendingFocus` IdeForm.
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const focusFirstAfterReset = useRef(false);
  useEffect(() => {
    if (!focusFirstAfterReset.current) return;
    focusFirstAfterReset.current = false;
    firstFieldRef.current?.focus();
  }, [form.status]);
  const handleReset = () => {
    focusFirstAfterReset.current = true;
    form.reset();
  };

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
      <div className={`${formStyles.fullWidth} ${s.layout}`}>
        <PermohonanLayout
          aside={
            <div className={s.aside}>
              <PermohonanSteps title={T.stepsTitle} steps={ADMINISTRASI_STEPS} />
              <JenisLayananSection jenis={jenis} />
            </div>
          }
        >
          {form.status === 'sent' ? (
            <AdministrasiSent jenisNama={jenisNama} onReset={handleReset} />
          ) : (
            <AdministrasiForm
              values={form.values}
              errors={form.errors}
              status={form.status}
              jenis={jenis}
              onField={form.setField}
              onSubmit={() => void form.submit()}
              firstFieldRef={firstFieldRef}
            />
          )}
        </PermohonanLayout>
      </div>
    </div>
  );
}
