'use client';
import { Select } from '@mantine/core';
import { useId } from 'react';
import { urutOptions } from './katalog-filter.logic';
import type { KatalogTab, KatalogUrut } from './katalog-filter.meta';
import { KATALOG_FILTER_TEXT as T } from './katalog-filter.text';
import s from './katalog-urut.module.css';

type Props = {
  tab: KatalogTab;
  value: KatalogUrut;
  onChange: (urut: KatalogUrut) => void;
};

/** Label "Urutkan" + pilihan urutan per tab; dirender sebagai fragmen agar ikut susunan flex pembungkusnya. */
export function KatalogUrutSelect({ tab, value, onChange }: Props) {
  const id = useId();
  const options = urutOptions(tab);
  return (
    <>
      <label htmlFor={id} className={s.label}>
        {T.urutkan}
      </label>
      <Select
        id={id}
        className={s.select}
        data={options}
        value={value}
        onChange={(next) => {
          const urut = options.find((o) => o.value === next)?.value;
          if (urut) onChange(urut);
        }}
        allowDeselect={false}
        checkIconPosition="right"
        radius="xl"
        comboboxProps={{ position: 'bottom-end', width: 200 }}
      />
    </>
  );
}
