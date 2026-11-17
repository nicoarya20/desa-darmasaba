import { Anchor, Text } from '@mantine/core';
import { PETA_INFORMASI_HREF } from '../(tambahan)/peta-informasi/_lib/petaInformasi';
import s from './footer-legal.module.css';

/**
 * Tautan baris legal footer (pola apple.com `ac-gf-footer-legal-links`). Tambah butir di sini; pemisah "|"
 * dibuat CSS di antara butir, jadi tidak perlu ditulis dan tidak dibaca pembaca layar.
 */
export const FOOTER_LEGAL_LINKS = [{ title: 'Peta Informasi', link: PETA_INFORMASI_HREF }] as const;

/** Baris paling bawah footer: hak cipta lalu daftar tautan berpemisah "|" (ponsel: tautan turun ke bawah). */
export function FooterLegal() {
  return (
    <div className={s.legal}>
      <Text fz="xs" c="#F3F2EC">© {new Date().getFullYear()} Desa Darmasaba. Hak cipta dilindungi.</Text>
      <ul className={s.links}>
        {FOOTER_LEGAL_LINKS.map((item) => (
          <li key={item.link} className={s.item}>
            <Anchor c="#F3F2EC" fz="xs" href={item.link}>
              {item.title}
            </Anchor>
          </li>
        ))}
      </ul>
    </div>
  );
}
