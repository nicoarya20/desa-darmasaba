import { ProfilAccordion } from './ProfilAccordion';
import { ProfilProse } from './ProfilCard';
import { ProfilProseClamp } from './ProfilProseClamp';
import { isLongProse, splitByHeading } from './prose-split';

/**
 * Teks panjang dari CMS: dengan minimal dua sub-judul (<h3>) dipecah jadi akordion per pembahasan;
 * tanpa sub-judul tetapi panjang dipotong + "Baca selengkapnya"; teks pendek tampil utuh.
 */
export function ProfilProseAuto({ html }: { html: string }) {
  const split = splitByHeading(html);
  if (split) return <ProfilAccordion split={split} />;
  if (isLongProse(html)) return <ProfilProseClamp html={html} />;
  return <ProfilProse html={html} />;
}
