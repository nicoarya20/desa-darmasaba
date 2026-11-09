'use client'
import { KONTAK_BUPATI, kontakBupatiLinks, type KontakBupati } from '@/con/kontak-bupati';
import { Anchor, Text } from '@mantine/core';

type FooterKontakBupatiProps = {
  fz: 'xs' | 'sm';
  kontak?: KontakBupati;
};

/** Isi blok "Kontak Bupati" di footer: nama jabatan + link kontak yang terisi saja. */
export function FooterKontakBupati({ fz, kontak = KONTAK_BUPATI }: FooterKontakBupatiProps) {
  return (
    <>
      <Text c="#F3F2EC" fz={fz}>{kontak.jabatan}</Text>
      {kontakBupatiLinks(kontak).map((link) => (
        <Anchor
          key={link.key}
          c="#F3F2EC"
          fz={fz}
          href={link.href}
          {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          {link.label}
        </Anchor>
      ))}
    </>
  );
}
