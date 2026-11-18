import { IconLock } from '@tabler/icons-react';
import type { CSSProperties } from 'react';
import s from './perpus-hero.module.css';

/**
 * Warna sampul per buku (nama variabel CSS `--c`), urut kiri → kanan; tinggi diatur di CSS. Biru tua = token isi
 * (terang #0a4e78/#083f61 seperti dulu; gelap #1c6ea4/#165a87, bukan --brand teks yang di gelap jadi biru muda).
 */
const SAMPUL = ['var(--c-brand-fill)', '#2f91cc', '#8ac1e3', 'var(--c-brand-fill-hover)', '#5da9d8'] as const;

/**
 * Ilustrasi dekoratif kepala halaman: jendela browser bergambar rak buku. Digambar dengan CSS (bukan tangkapan
 * layar) supaya tidak basi saat website perpustakaan berubah; hanya alamat host yang asli. `aria-hidden` karena
 * tidak membawa informasi.
 */
export function PerpusIlustrasi({ host }: { host: string | null }) {
  return (
    <div className={s.art} aria-hidden>
      <div className={s.window}>
        <div className={s.bar}>
          <span className={s.dot} />
          <span className={s.dot} />
          <span className={s.dot} />
          {host ? (
            <span className={s.address}>
              <IconLock size={12} stroke={2} />
              <span className={s.addressText}>{host}</span>
            </span>
          ) : null}
        </div>
        <div className={s.screen}>
          <span className={`${s.line} ${s.lineLong}`} />
          <span className={`${s.line} ${s.lineShort}`} />
          <div className={s.shelf}>
            {SAMPUL.map((warna, i) => (
              <span key={i} className={s.book} style={{ '--c': warna } as CSSProperties}>
                {i === 3 ? <span className={s.bookmark} /> : null}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
