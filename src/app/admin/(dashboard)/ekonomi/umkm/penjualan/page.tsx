'use client'
import {
  Box,
  Button,
  Center,
  Group,
  Pagination,
  Paper,
  Skeleton,
  Stack,
  Table,
  TableTbody,
  TableTd,
  TableTh,
  TableThead,
  TableTr,
  Text,
  Title
} from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { useProxy } from 'valtio/utils';
import umkmState from '../../../_state/ekonomi/umkm/umkm';

function PenjualanUmkm() {
  const state = useProxy(umkmState.penjualan.findMany);

  useShallowEffect(() => {
    state.load(state.page, 10);
  }, [state.page]);

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <Title order={3}>Histori Penjualan UMKM</Title>
        <Button leftSection={<IconPlus size={18} />} color="blue">
          Catat Penjualan
        </Button>
      </Group>

      <Paper withBorder p="md" radius="md">
        {state.loading ? (
          <Skeleton height={400} />
        ) : (
          <Box style={{ overflowX: 'auto' }}>
            <Table highlightOnHover>
              <TableThead>
                <TableTr>
                  <TableTh>Tanggal</TableTh>
                  <TableTh>Produk</TableTh>
                  <TableTh>UMKM</TableTh>
                  <TableTh>Jumlah</TableTh>
                  <TableTh>Total Nilai</TableTh>
                  <TableTh>Aksi</TableTh>
                </TableTr>
              </TableThead>
              <TableTbody>
                {state.data.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd>{new Date(item.tanggal).toLocaleDateString('id-ID')}</TableTd>
                    <TableTd fw={500}>{item.produk?.nama}</TableTd>
                    <TableTd>{item.produk?.umkm?.nama}</TableTd>
                    <TableTd>{item.jumlah}</TableTd>
                    <TableTd fw={600}>Rp {item.totalNilai.toLocaleString()}</TableTd>
                    <TableTd>
                      <Button variant="subtle" color="red" size="xs">
                        <IconTrash size={16} />
                      </Button>
                    </TableTd>
                  </TableTr>
                ))}
              </TableTbody>
            </Table>
          </Box>
        )}

        <Center mt="md">
          <Pagination
            total={state.totalPages}
            value={state.page}
            onChange={(p) => state.load(p, 10)}
          />
        </Center>
      </Paper>
    </Stack>
  );
}

export default PenjualanUmkm;
