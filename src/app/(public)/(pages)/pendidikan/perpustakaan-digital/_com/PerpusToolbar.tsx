'use client';
import s from '@/app/(public)/(pages)/ekonomi/umkm/_com/katalog/katalog-urut.module.css';
import { Select } from '@mantine/core';
import { useId } from 'react';
import t from './perpus-katalog.module.css';
import { PERPUS_URUT, type PerpusUrut } from './perpus.meta';
import { PERPUS_TEXT as T } from './perpus.text';

type Props = {
  jumlah: number;
  /** Jumlah sebelum dicari (tampil "dari m"); null bila tidak sedang mencari. */
  total: number | null;
  urut: PerpusUrut;
  onUrut: (urut: PerpusUrut) => void;
};

const OPTIONS = PERPUS_URUT.map((value) => ({ value, label: T.urut[value] }));

/** Baris alat: "n buku" (+ "dari m" saat mencari) dan Urutkan (gaya Select katalog UMKM). */
export function PerpusToolbar({ jumlah, total, urut, onUrut }: Props) {
  const id = useId();
  return (
    <div className={t.toolbar}>
      <h2 className={t.count}>
        {T.jumlah(jumlah)}
        {total !== null && total !== jumlah && <span className={t.countOf}> {T.dariTotal(total)}</span>}
      </h2>
      {jumlah > 1 && (
        <div className={t.urut}>
          <label htmlFor={id} className={s.label}>
            {T.urutkan}
          </label>
          <Select
            id={id}
            className={s.select}
            data={OPTIONS}
            value={urut}
            onChange={(next) => {
              const found = PERPUS_URUT.find((u) => u === next);
              if (found) onUrut(found);
            }}
            allowDeselect={false}
            checkIconPosition="right"
            radius="xl"
            comboboxProps={{ position: 'bottom-end', width: 200 }}
          />
        </div>
      )}
    </div>
  );
}
