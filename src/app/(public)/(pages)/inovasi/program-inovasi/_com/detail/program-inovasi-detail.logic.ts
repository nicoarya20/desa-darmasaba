import type { Metadata } from 'next';
import type { ProgramInovasiPublik } from '@/lib/program-inovasi.server';
import { programInovasiDetailHref, programInovasiMetaDescription } from '../program-inovasi.logic';
import type { ProgramInovasiDetailView } from './ProgramInovasiDetail';

/** Data DB → tampilan detail; `html` = deskripsi yang sudah disanitasi pemanggil (server). */
export function toProgramInovasiDetailView(program: ProgramInovasiPublik, html: string): ProgramInovasiDetailView {
  return {
    name: program.name,
    logo: program.image?.link?.trim() || null,
    html,
    photos: program.images.filter((img) => Boolean(img.link?.trim())),
  };
}

/** Metadata SEO detail: judul = nama program, deskripsi = cuplikan teks, URL kanonik, og:image = logo. */
export function programInovasiMetadata(program: ProgramInovasiPublik): Metadata {
  const description = programInovasiMetaDescription(program.description);
  const logo = program.image?.link?.trim();
  const url = programInovasiDetailHref(program.id);
  return {
    title: program.name,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: program.name,
      description,
      url,
      type: 'article',
      ...(logo ? { images: [{ url: logo, alt: program.name }] } : {}),
    },
  };
}
