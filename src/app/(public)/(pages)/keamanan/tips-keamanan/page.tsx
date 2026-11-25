import { redirect } from 'next/navigation';
import { tipsKeamananHref } from '../pencegahan-kriminalitas/_com/tips/tips-keamanan.logic';

type Props = { searchParams: Promise<{ search?: string | string[] }> };

/**
 * Menu Tips Keamanan dilebur ke Pencegahan Kriminalitas (2026-11-24): alamat lama dialihkan ke bagian tips
 * (`#tips-keamanan`) dengan kata kunci dipertahankan, supaya tautan tersimpan, hasil Google, dan pencarian tidak 404.
 * `redirect()` 307 (bukan permanen) agar mudah dibalik, sama dengan `pencegahan-kriminalitas/program-lainnya`.
 */
export default async function Page({ searchParams }: Props) {
  const { search } = await searchParams;
  redirect(tipsKeamananHref(typeof search === 'string' ? search : ''));
}
