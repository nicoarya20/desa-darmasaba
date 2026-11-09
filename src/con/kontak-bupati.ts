/** Kontak resmi Bupati Badung untuk blok "Kontak Bupati" di footer publik. */
export const KONTAK_BUPATI = {
  judul: 'Kontak Bupati',
  jabatan: 'Bupati Badung',
  // TODO(footer): isi nomor/email resmi Kontak Bupati dari pihak desa — PM task 2984c9f7
  telepon: '',
  email: '',
  website: 'https://badungkab.go.id',
} as const;

export type KontakBupati = {
  judul: string;
  jabatan: string;
  telepon: string;
  email: string;
  website: string;
};

export type KontakBupatiLink = { key: 'telepon' | 'email' | 'website'; label: string; href: string; external: boolean };

/** Daftar link kontak yang terisi saja (field kosong dilewati) beserta href tel:/mailto:/https. */
export function kontakBupatiLinks(kontak: KontakBupati): KontakBupatiLink[] {
  const links: KontakBupatiLink[] = [];
  const telepon = kontak.telepon.trim();
  const email = kontak.email.trim();
  const website = kontak.website.trim();
  if (telepon) links.push({ key: 'telepon', label: telepon, href: `tel:${telepon.replace(/[^\d+]/g, '')}`, external: false });
  if (email) links.push({ key: 'email', label: email, href: `mailto:${email}`, external: false });
  if (website) links.push({ key: 'website', label: website.replace(/^https?:\/\//, '').replace(/\/$/, ''), href: website, external: true });
  return links;
}
