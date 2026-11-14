import { DETAIL_PRODUK_TEXT as T } from './detail-produk.text';
import s from './info.module.css';

const TITLE_ID = 'cara-memesan-judul';

/** Panel langkah memesan lewat WhatsApp: website hanya etalase, transaksi langsung dengan penjual. */
export function CaraMemesanPanel() {
  return (
    <section className={s.panelTile} aria-labelledby={TITLE_ID}>
      <h2 id={TITLE_ID} className={s.panelTitle}>
        {T.caraMemesan}
      </h2>
      <ol className={s.steps}>
        {T.langkahPesan.map((langkah) => (
          <li key={langkah} className={s.step}>
            {langkah}
          </li>
        ))}
      </ol>
      <p className={s.note}>{T.catatanPesan}</p>
    </section>
  );
}
