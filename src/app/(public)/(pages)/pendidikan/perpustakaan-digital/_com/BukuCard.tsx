import { Link } from 'next-view-transitions';
import s from './buku-card.module.css';
import { BukuSampul } from './BukuSampul';
import { bukuHref } from './perpus-katalog.logic';
import type { Buku } from './perpus.types';

/** Kartu buku gaya katalog (Decathlon/TIDAL): seluruh kartu satu tautan ke detail; tanpa deskripsi dan tombol. */
export function BukuCard({ buku }: { buku: Buku }) {
  return (
    <Link href={bukuHref(buku)} className={s.card}>
      <div className={s.media}>
        <BukuSampul src={buku.sampul} alt={buku.judul} />
      </div>
      <h3 className={s.title}>{buku.judul}</h3>
      {buku.kategori && <p className={s.kategori}>{buku.kategori.nama}</p>}
    </Link>
  );
}
