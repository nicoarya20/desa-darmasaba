import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { katalogHref, parseKatalogParams, type KatalogParams } from './katalog-params.logic';

/**
 * Keadaan katalog dari URL + pengubahnya (`router.replace`, tanpa gulir). `update` menerima fungsi dari params
 * terakhir yang diminta, bukan dari render saat itu, supaya pemanggil tertunda (jeda ketik kolom cari) atau klik
 * beruntun sebelum URL selesai berganti tidak menimpa perubahan lain.
 */
export function useKatalogParams() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useMemo(() => parseKatalogParams(searchParams), [searchParams]);
  const latest = useRef(params);

  // URL berganti (hasil update sendiri atau tombol kembali peramban) → jadikan dasar update berikutnya.
  useEffect(() => {
    latest.current = params;
  }, [params]);

  const update = useCallback(
    (change: (current: KatalogParams) => KatalogParams) => {
      const next = change(latest.current);
      latest.current = next;
      router.replace(katalogHref(next), { scroll: false });
    },
    [router],
  );

  return { params, update };
}
