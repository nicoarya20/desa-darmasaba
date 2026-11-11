'use client'
import { KONTAK_BUPATI } from '@/con/kontak-bupati';
import { Anchor } from '@mantine/core';

type FooterKontakBupatiProps = {
  fz: 'xs' | 'sm';
};

/** Isi blok "Kontak Bupati" di footer: link eksternal kanal kontak Bupati, dibuka di tab baru. */
export function FooterKontakBupati({ fz }: FooterKontakBupatiProps) {
  return (
    <>
      {KONTAK_BUPATI.links.map((link) => (
        <Anchor key={link.href} c="#F3F2EC" fz={fz} href={link.href} target="_blank" rel="noopener noreferrer">
          {link.label}
        </Anchor>
      ))}
    </>
  );
}
