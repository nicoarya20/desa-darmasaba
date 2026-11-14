import { DETAIL_PRODUK_TEXT as T } from './detail-produk.text';
import s from './detail-produk.module.css';

const TITLE_ID = 'deskripsi-produk-judul';

/** Deskripsi produk; `html` sudah dibersihkan adapter (`sanitizeRichText`), kosong → teks pengganti. */
export function ProdukDeskripsi({ html }: { html: string }) {
  return (
    <section className={s.deskripsi} aria-labelledby={TITLE_ID}>
      <h2 id={TITLE_ID} className={s.deskripsiTitle}>
        {T.deskripsi}
      </h2>
      {html ? (
        <div className={s.deskripsiBody} dangerouslySetInnerHTML={{ __html: html }} />
      ) : (
        <p className={s.deskripsiKosong}>{T.deskripsiKosong}</p>
      )}
    </section>
  );
}
