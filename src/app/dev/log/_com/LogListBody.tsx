'use client';
import { Group, Pagination, Skeleton, Stack, Text } from '@mantine/core';
import { useDarkMode } from '@/state/darkModeStore';
import { themeTokens } from '@/utils/themeTokens';
import { ErrorState } from '../../_com/ErrorState';
import { formatDateTime } from '../../_com/format';
import { pageCount, rangeLabel } from '../../jenna/percakapan/percakapan.logic';
import { formatRelativeTime } from '../../ringkasan/system.logic';

type Props = {
  /** Kata benda untuk pesan, mis. "log audit". */
  noun: string;
  list: { page: number; limit: number; total: number; itemCount: number } | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  emptyText: string;
  page: number;
  onPage: (page: number) => void;
  /** Tabel; hanya dirender bila ada baris. */
  children: React.ReactNode;
};

/** Galat / memuat / kosong / tabel + paginasi untuk daftar log. */
export function LogListBody({ noun, list, loading, error, onRetry, emptyText, page, onPage, children }: Props) {
  const { isDark } = useDarkMode();
  const tokens = themeTokens(isDark);

  if (!list && error) {
    return <ErrorState title={`Gagal memuat ${noun}`} message={error} onRetry={onRetry} retrying={loading} />;
  }
  if (!list || (loading && list.itemCount === 0)) {
    return (
      <div aria-busy="true" aria-label={`Memuat ${noun}`}>
        {[0, 1, 2, 3, 4].map((i) => (
          <Skeleton key={i} height={44} radius="sm" mb="xs" />
        ))}
      </div>
    );
  }

  const pages = pageCount(list.total, list.limit);
  return (
    <Stack gap="md">
      {error && (
        <ErrorState
          title={`Gagal memuat ulang ${noun}`}
          message={`${error} Daftar di bawah adalah versi terakhir yang berhasil dimuat.`}
          onRetry={onRetry}
          retrying={loading}
        />
      )}
      {list.itemCount === 0 ? (
        <Text size="sm" c={tokens.colors.text.secondary} ta="center" py="xl">
          {emptyText}
        </Text>
      ) : (
        <div style={{ opacity: loading ? 0.6 : 1 }}>{children}</div>
      )}
      <Group justify="space-between" gap="sm" wrap="wrap">
        <Text size="sm" c={tokens.colors.text.secondary}>
          {rangeLabel(list.page, list.limit, list.total)}
        </Text>
        {pages > 1 && <Pagination total={pages} value={page} onChange={onPage} size="sm" disabled={loading} />}
      </Group>
    </Stack>
  );
}

/** Sel waktu: absolut di atas, relatif (terhadap waktu data dimuat) di bawah. */
export function LogTimeCell({ iso, nowIso }: { iso: string; nowIso: string | null }) {
  const { isDark } = useDarkMode();
  const tokens = themeTokens(isDark);
  return (
    <>
      <Text size="sm" style={{ whiteSpace: 'nowrap' }}>
        {formatDateTime(iso)}
      </Text>
      {nowIso && (
        <Text size="xs" c={tokens.colors.text.muted} style={{ whiteSpace: 'nowrap' }}>
          {formatRelativeTime(iso, nowIso)}
        </Text>
      )}
    </>
  );
}

/** Email + nama role di bawahnya. */
export function LogPersonCell({ email, role }: { email: string | null; role: string }) {
  const { isDark } = useDarkMode();
  const tokens = themeTokens(isDark);
  return (
    <>
      <Text size="sm" style={{ wordBreak: 'break-all' }}>
        {email ?? '—'}
      </Text>
      <Text size="xs" c={tokens.colors.text.muted}>
        {role}
      </Text>
    </>
  );
}
