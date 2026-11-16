'use client';
import { SegmentedControl } from '@mantine/core';
import { useState } from 'react';
import { PengangguranChart } from './PengangguranChart';
import { PengangguranTable } from './PengangguranTable';
import { bulanDalamTahun, tahunTersedia, type PengangguranBulan } from './pengangguran.logic';
import s from './pengangguran.module.css';
import { PENGANGGURAN_TEXT as T } from './pengangguran.text';

const TITLE_ID = 'pengangguran-tren-title';

type Props = { rows: readonly PengangguranBulan[]; tahunAwal: number };

/**
 * Bagian "Perkembangan per bulan": pemilih tahun (hanya bila > 1 tahun; urut naik, bawaan = tahun bulan terbaru),
 * grafik batang bertumpuk, lalu rincian per bulan tahun itu.
 */
export function PengangguranTrend({ rows, tahunAwal }: Props) {
  const [tahun, setTahun] = useState(tahunAwal);
  const years = tahunTersedia(rows);
  const bulan = bulanDalamTahun(rows, tahun);

  return (
    <section className={s.block} aria-labelledby={TITLE_ID}>
      <div className={s.blockHead}>
        <div>
          <h2 id={TITLE_ID} className={s.blockTitle}>
            {T.jumlah.trendTitle}
          </h2>
          <p className={s.caption}>{T.jumlah.trendCaption}</p>
        </div>
        {years.length > 1 ? (
          <div className={s.yearRail}>
            <SegmentedControl
              aria-label={T.jumlah.yearPicker}
              radius="xl"
              value={String(tahun)}
              onChange={(value) => setTahun(Number(value))}
              data={[...years].reverse().map((y) => ({ value: String(y), label: String(y) }))}
            />
          </div>
        ) : null}
      </div>
      <div className={s.panel}>
        <PengangguranChart bulan={bulan} />
      </div>
      <PengangguranTable rows={rows} bulan={bulan} tahun={tahun} />
    </section>
  );
}
