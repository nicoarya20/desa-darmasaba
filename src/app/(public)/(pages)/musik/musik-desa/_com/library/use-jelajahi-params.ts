import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { jelajahiHref, parseJelajahiParams, type JelajahiParams } from './musik-jelajahi.logic';

/**
 * Keadaan Jelajahi dari URL + pengubahnya (`router.replace`, tanpa gulir). `update` menerima fungsi dari params
 * terakhir yang diminta supaya klik beruntun sebelum URL berganti tidak saling menimpa (pola use-lowongan-params).
 */
export function useJelajahiParams() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useMemo(() => parseJelajahiParams(searchParams), [searchParams]);
  const latest = useRef(params);

  useEffect(() => {
    latest.current = params;
  }, [params]);

  const update = useCallback(
    (change: (current: JelajahiParams) => JelajahiParams) => {
      const next = change(latest.current);
      latest.current = next;
      router.replace(jelajahiHref(next), { scroll: false });
    },
    [router],
  );

  return { params, update };
}
