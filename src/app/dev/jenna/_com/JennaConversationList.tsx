'use client';
import { Alert, Badge, Button, Group, Pagination, Skeleton, Table, Text, UnstyledButton } from '@mantine/core';
import { IconFilter, IconX } from '@tabler/icons-react';
import { useSnapshot } from 'valtio';
import { useDarkMode } from '@/state/darkModeStore';
import { themeTokens } from '@/utils/themeTokens';
import jennaConversationsState from '../../_state/jenna-conversations-state';
import { ErrorState } from '../../_com/ErrorState';
import { SectionCard } from '../../_com/SectionCard';
import { formatDateTime, formatNumber } from '../../_com/format';
import { pageCount, rangeLabel } from '../percakapan/percakapan.logic';

const COLUMNS = ['Aktivitas terakhir', 'Pesan pertama', 'Pesan', 'Token', 'Pengunjung'] as const;

/** Daftar percakapan tersimpan (terbaru dulu), dengan filter "pengunjung yang sama". */
export function JennaConversationList() {
  const snap = useSnapshot(jennaConversationsState);
  const { isDark } = useDarkMode();
  const tokens = themeTokens(isDark);
  const list = snap.list;

  const filterBanner = snap.session && (
    <Alert color="blue" variant="light" icon={<IconFilter size={16} />} p="sm">
      <Group justify="space-between" gap="sm" wrap="wrap">
        <Text size="sm">
          Hanya percakapan pengunjung <Text span ff="monospace" fw={600}>{snap.session}</Text>.
        </Text>
        <Button
          size="xs"
          variant="subtle"
          leftSection={<IconX size={14} />}
          onClick={() => jennaConversationsState.setSession(null)}
        >
          Tampilkan semua
        </Button>
      </Group>
    </Alert>
  );

  let body: React.ReactNode;
  if (!list && snap.listError) {
    body = (
      <ErrorState
        title="Gagal memuat percakapan"
        message={snap.listError}
        onRetry={() => void jennaConversationsState.loadList()}
        retrying={snap.listLoading}
      />
    );
  } else if (!list || (snap.listLoading && list.items.length === 0)) {
    body = (
      <div aria-busy="true" aria-label="Memuat percakapan">
        {[0, 1, 2, 3, 4].map((i) => (
          <Skeleton key={i} height={44} radius="sm" mb="xs" />
        ))}
      </div>
    );
  } else if (list.items.length === 0) {
    body = (
      <Text size="sm" c={tokens.colors.text.secondary} ta="center" py="xl">
        {snap.session ? 'Tidak ada percakapan untuk pengunjung ini.' : 'Belum ada percakapan tersimpan.'}
      </Text>
    );
  } else {
    const pages = pageCount(list.total, list.limit);
    body = (
      <>
        {snap.listError && (
          <ErrorState
            title="Gagal memuat ulang percakapan"
            message={`${snap.listError} Daftar di bawah adalah versi terakhir yang berhasil dimuat.`}
            onRetry={() => void jennaConversationsState.loadList()}
            retrying={snap.listLoading}
          />
        )}
        <Table.ScrollContainer minWidth={760}>
          <Table highlightOnHover verticalSpacing="sm" style={{ opacity: snap.listLoading ? 0.6 : 1 }}>
            <Table.Thead>
              <Table.Tr>
                {COLUMNS.map((c) => (
                  <Table.Th key={c} style={{ whiteSpace: 'nowrap' }}>
                    {c}
                  </Table.Th>
                ))}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {list.items.map((c) => (
                <Table.Tr
                  key={c.id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => void jennaConversationsState.openDetail(c.id)}
                >
                  <Table.Td style={{ whiteSpace: 'nowrap' }}>
                    <Text size="sm">{formatDateTime(c.lastMessageAt)}</Text>
                  </Table.Td>
                  <Table.Td style={{ maxWidth: 360 }}>
                    <UnstyledButton
                      onClick={(e) => {
                        e.stopPropagation();
                        void jennaConversationsState.openDetail(c.id);
                      }}
                      aria-label={`Buka percakapan ${formatDateTime(c.lastMessageAt)}`}
                      style={{ textAlign: 'left', width: '100%' }}
                    >
                      <Text size="sm" lineClamp={2} c={tokens.colors.text.primary} style={{ wordBreak: 'break-word' }}>
                        {c.preview || '—'}
                      </Text>
                    </UnstyledButton>
                  </Table.Td>
                  <Table.Td style={{ whiteSpace: 'nowrap' }}>
                    <Group gap={6} wrap="nowrap">
                      <Text size="sm">{formatNumber(c.messageCount)}</Text>
                      {c.errorCount > 0 && (
                        <Badge color="red" variant="light" size="sm">
                          {formatNumber(c.errorCount)} gagal
                        </Badge>
                      )}
                    </Group>
                  </Table.Td>
                  <Table.Td style={{ whiteSpace: 'nowrap' }}>
                    <Text size="sm">{formatNumber(c.tokens)}</Text>
                  </Table.Td>
                  <Table.Td style={{ whiteSpace: 'nowrap' }}>
                    <Group gap={6} wrap="nowrap">
                      <Badge
                        component="button"
                        type="button"
                        variant={snap.session === c.session ? 'filled' : 'light'}
                        radius="sm"
                        ff="monospace"
                        style={{ cursor: 'pointer', textTransform: 'none' }}
                        title="Tampilkan semua percakapan pengunjung ini"
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          jennaConversationsState.setSession(c.session);
                        }}
                      >
                        {c.session}
                      </Badge>
                      <Text size="xs" c={tokens.colors.text.muted} ff="monospace" title="Kode IP (hash, bukan alamat asli)">
                        {c.ip}
                      </Text>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
        <Group justify="space-between" gap="sm" wrap="wrap">
          <Text size="sm" c={tokens.colors.text.secondary}>
            {rangeLabel(list.page, list.limit, list.total)}
          </Text>
          {pages > 1 && (
            <Pagination
              total={pages}
              value={snap.page}
              onChange={(p) => jennaConversationsState.setPage(p)}
              size="sm"
              disabled={snap.listLoading}
            />
          )}
        </Group>
      </>
    );
  }

  return (
    <SectionCard
      title="Percakapan"
      description="Terbaru dulu. Klik baris untuk membaca isi; klik kode pengunjung untuk melihat percakapan lain dari pengunjung yang sama."
    >
      {filterBanner}
      {body}
    </SectionCard>
  );
}
