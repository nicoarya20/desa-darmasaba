import { KabarListPagination } from '@/app/(public)/_com/kabar-list/KabarListPagination';
import { SearchField } from '@/app/(public)/_com/search-field/SearchField';
import { Stack, Table, Text, Title } from '@mantine/core';
import { PENERIMA_PUBLIK_LIMIT } from '../program-kemiskinan.source';
import { PROGRAM_DETAIL_TEXT as T } from '../program-kemiskinan.text';
import type { HalamanPenerima, MuatState } from '../program-kemiskinan.types';
import { MuatStatus } from './MuatStatus';

type Props = {
  state: MuatState<HalamanPenerima>;
  cari: string;
  onCari: (v: string) => void;
  onHalaman: (page: number) => void;
  onRetry: () => void;
};

/** Daftar penerima (nama + alamat) berpaginasi dengan kotak cari. */
export function DaftarPenerimaView({ state, cari, onCari, onHalaman, onRetry }: Props) {
  return (
    <Stack gap="sm">
      <Title order={3} fz="lg" c="var(--c-brand)">
        {T.daftarJudul}
      </Title>
      <SearchField fullWidth label={T.cariLabel} placeholder={T.cariLabel} value={cari} onChange={onCari} />
      {state.status !== 'ready' ? (
        <MuatStatus status={state.status} onRetry={onRetry} tinggi={240} />
      ) : state.data.data.length === 0 ? (
        <Text fz="sm" c="dimmed" ta="center" py="md">
          {T.daftarKosong}
        </Text>
      ) : (
        <>
          <Table.ScrollContainer minWidth={420}>
            <Table striped withTableBorder>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th w={56}>{T.kolomNo}</Table.Th>
                  <Table.Th>{T.kolomNama}</Table.Th>
                  <Table.Th>{T.kolomAlamat}</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {state.data.data.map((p, i) => (
                  <Table.Tr key={`${state.data.page}-${i}`}>
                    <Table.Td>{(state.data.page - 1) * PENERIMA_PUBLIK_LIMIT + i + 1}</Table.Td>
                    <Table.Td>{p.nama}</Table.Td>
                    <Table.Td>{p.alamat}</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
          <KabarListPagination
            total={state.data.totalPages}
            value={state.data.page}
            label={T.daftarPaginationLabel}
            onChange={onHalaman}
          />
        </>
      )}
    </Stack>
  );
}
