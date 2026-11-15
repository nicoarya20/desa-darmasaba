'use client';
import type { LoadState } from '@/app/(public)/_com/lazy-load/use-lazy-load';
import { useDisclosure } from '@mantine/hooks';
import type { Keunggulan, Ringkasan } from './beasiswa.logic';
import { BEASISWA_BRAND_VARS } from './beasiswa.meta';
import s from './beasiswa.module.css';
import { BeasiswaHero } from './BeasiswaHero';
import { BeasiswaKeunggulan } from './BeasiswaKeunggulan';
import { BeasiswaPenutup } from './BeasiswaPenutup';
import { BeasiswaRingkasan } from './BeasiswaRingkasan';
import { BeasiswaSyaratAlur } from './BeasiswaSyaratAlur';
import { BeasiswaFormModal } from './form/BeasiswaFormModal';
import { useBeasiswaData } from './use-beasiswa-data';

/** Halaman Beasiswa Desa: kepala, ringkasan angka, keunggulan, syarat & alur, penutup, modal pendaftaran. */
export function BeasiswaPage() {
  const { keunggulan, ringkasan } = useBeasiswaData();
  const [opened, { open, close }] = useDisclosure(false);
  return (
    <>
      <BeasiswaPageBody
        keunggulan={keunggulan.state}
        ringkasan={ringkasan.state}
        onRetryKeunggulan={keunggulan.retry}
        onRetryRingkasan={ringkasan.retry}
        onDaftar={open}
      />
      <BeasiswaFormModal opened={opened} onClose={close} />
    </>
  );
}

type BodyProps = {
  keunggulan: LoadState<Keunggulan[]>;
  ringkasan: LoadState<Ringkasan>;
  onRetryKeunggulan: () => void;
  onRetryRingkasan: () => void;
  onDaftar: () => void;
};

/** Isi halaman tanpa efek muat (dipakai `BeasiswaPage` dan test markup). */
export function BeasiswaPageBody(props: BodyProps) {
  return (
    <div className={s.page} style={BEASISWA_BRAND_VARS}>
      <div className={s.inner}>
        <BeasiswaHero onDaftar={props.onDaftar} />
        <BeasiswaRingkasan state={props.ringkasan} onRetry={props.onRetryRingkasan} />
        <BeasiswaKeunggulan state={props.keunggulan} onRetry={props.onRetryKeunggulan} />
        <BeasiswaSyaratAlur />
        <BeasiswaPenutup onDaftar={props.onDaftar} />
      </div>
    </div>
  );
}
