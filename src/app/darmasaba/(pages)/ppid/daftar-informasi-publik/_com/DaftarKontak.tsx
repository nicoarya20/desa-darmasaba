import { IconBrandWhatsapp, IconMail } from '@tabler/icons-react';
import s from './daftar.module.css';
import { DAFTAR_TEXT } from './daftar.text';

/** Kontak PPID di bawah daftar: email dan WhatsApp, langsung di atas latar halaman (tanpa kartu). */
export function DaftarKontak() {
  return (
    <section className={s.kontak} aria-labelledby="kontak-ppid-title">
      <h2 id="kontak-ppid-title" className={s.kontakTitle}>{DAFTAR_TEXT.kontakTitle}</h2>
      <p className={s.kontakRow}>
        <IconMail size={18} stroke={1.5} aria-hidden />
        <span>
          {DAFTAR_TEXT.kontakEmailLabel} <span className={s.kontakValue}>{DAFTAR_TEXT.kontakEmail}</span>
        </span>
      </p>
      <p className={s.kontakRow}>
        <IconBrandWhatsapp size={18} stroke={1.5} aria-hidden />
        <span>
          {DAFTAR_TEXT.kontakWhatsappLabel} <span className={s.kontakValue}>{DAFTAR_TEXT.kontakWhatsapp}</span>
        </span>
      </p>
    </section>
  );
}
