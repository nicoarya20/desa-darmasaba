import { IconStarFilled } from '@tabler/icons-react';
import { useId } from 'react';
import {
  formatRataRata,
  persenBintang,
  totalDistribusi,
  ULASAN_BINTANG,
  ULASAN_KOSONG,
  type UlasanRingkasan,
} from './ulasan.logic';
import s from './ulasan.module.css';
import { ULASAN_TEXT as T } from './ulasan.text';

/**
 * Bagian Ulasan gaya Decathlon: nilai rata-rata + jumlah + tombol tulis (kiri), sebaran bintang 5→1 (kanan).
 * Tanpa daftar ulasan.
 */
// TODO(umkm-ulasan): belum ada model ulasan — docs/BACKEND-TODO.md P3. Tombol "Tulis ulasan" sengaja nonaktif sampai ada.
export function UlasanSection({ ringkasan = ULASAN_KOSONG }: { ringkasan?: UlasanRingkasan }) {
  const catatanId = useId();
  const total = totalDistribusi(ringkasan.distribusi);
  const kosong = ringkasan.rataRata == null;
  const angka = formatRataRata(ringkasan.rataRata);

  return (
    <section id="ulasan" className={s.section} aria-labelledby="ulasan-judul">
      <h2 id="ulasan-judul" className={s.title}>
        {T.judul}
      </h2>

      <div className={s.grid}>
        <div className={s.summary}>
          <p className={s.score}>
            <IconStarFilled className={s.scoreStar} size={36} aria-hidden="true" />
            <span className={s.scoreValue} aria-label={kosong ? T.nilaiKosong : T.nilai(angka)}>
              {angka}
            </span>
          </p>
          <p className={s.count}>{T.jumlah(ringkasan.jumlah)}</p>
          {ringkasan.jumlah === 0 && <p className={s.empty}>{T.kosong}</p>}
          <button type="button" className={s.write} disabled aria-describedby={catatanId}>
            {T.tulis}
          </button>
          <p id={catatanId} className={s.note}>
            {T.tulisTertutup}
          </p>
        </div>

        <ul className={s.bars} aria-label={T.sebaran}>
          {ULASAN_BINTANG.map((bintang) => {
            const jumlah = ringkasan.distribusi[bintang] ?? 0;
            return (
              <li key={bintang} className={s.row}>
                <span className={s.rowLabel}>
                  {bintang}
                  <IconStarFilled size={14} aria-hidden="true" />
                  <span className={s.srOnly}> {T.bintang}</span>
                </span>
                <span className={s.track} aria-hidden="true">
                  <span className={s.fill} style={{ width: `${persenBintang(jumlah, total)}%` }} />
                </span>
                <span className={s.rowCount}>
                  {jumlah}
                  <span className={s.srOnly}> {T.ulasan}</span>
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
