'use client'
import colors from '@/con/colors';
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
import { useDebouncedValue, useShallowEffect } from '@mantine/hooks';
import { IconCircleDashedPlus, IconDeviceImacCog, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../_com/header';
import stateDashboardMusik from '../../_state/desa/musik';


function Musik() {
  const [search, setSearch] = useState("");
  return (
    <Box>
      <HeaderSearch
        title="Musik Desa"
        placeholder="Cari judul, artis, atau genre..."
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListMusik search={search} />
    </Box>
  );
}

function ListMusik({ search }: { search: string }) {
  const musikState = useProxy(stateDashboardMusik);
  const router = useRouter();
  const [debouncedSearch] = useDebouncedValue(search, 1000);

  const { data, page, totalPages, loading, load } = musikState.musik.findMany;

  useShallowEffect(() => {
    load(page, 10, debouncedSearch);
  }, [page, debouncedSearch]);

  if (loading || !data) {
    return (
      <Stack py="md">
        <Skeleton height={600} radius="md" />
      </Stack>
    );
  }

  const filteredData = data || [];

  return (
    <Box py="md">
      <Paper withBorder bg={colors['white-1']} p="lg" shadow="md" radius="md">
        <Group justify="space-between" mb="md">
          <Title order={4}>Daftar Musik</Title>
          <Button
            leftSection={<IconCircleDashedPlus size={18} />}
            color="blue"
            variant="light"
            onClick={() => router.push('/admin/desa/musik/create')}
          >
            Tambah Baru
          </Button>
        </Group>

        {/* Desktop Table */}
        <Box visibleFrom="md" style={{ overflowX: 'auto' }}>
          <Table highlightOnHover
            layout="fixed"
            withColumnBorders={false} miw={0}>
            <TableThead>
              <TableTr>
                <TableTh w="30%">Judul</TableTh>
                <TableTh w="20%">Artis</TableTh>
                <TableTh w="15%">Durasi</TableTh>
                <TableTh w="15%">Genre</TableTh>
                <TableTh w="20%">Aksi</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd>
                      <Text fz="md" fw={600} lh={1.45} truncate="end">
                        {item.judul}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Text fz="sm" c="dimmed" lh={1.45}>
                        {item.artis}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Text fz="sm" c="dimmed" lh={1.45}>
                        {item.durasi}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Text fz="sm" c="dimmed" lh={1.45}>
                        {item.genre || '-'}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Button
                        variant="light"
                        color="blue"
                        onClick={() =>
                          router.push(`/admin/desa/musik/${item.id}`)
                        }
                        fz="sm"
                        px="sm"
                        h={36}
                      >
                        <IconDeviceImacCog size={18} />
                        <Text ml="xs">Detail</Text>
                      </Button>
                    </TableTd>
                  </TableTr>
                ))
              ) : (
                <TableTr>
                  <TableTd colSpan={5}>
                    <Center py="xl">
                      <Text c="dimmed" fz="sm" lh={1.4}>
                        Tidak ada data musik yang cocok
                      </Text>
                    </Center>
                  </TableTd>
                </TableTr>
              )}
            </TableTbody>
          </Table>
        </Box>

        {/* Mobile Cards */}
        <Stack hiddenFrom="md" gap="sm" mt="sm">
          {filteredData.length > 0 ? (
            filteredData.map((item) => (
              <Paper key={item.id} withBorder p="md" radius="md">
                <Stack gap={"xs"}>
                  <Text fz="sm" fw={600} lh={1.4} c="dimmed">
                    Judul
                  </Text>
                  <Text fz="sm" fw={500} lh={1.45}>
                    {item.judul}
                  </Text>

                  <Text fz="sm" fw={600} lh={1.4} c="dimmed" mt="xs">
                    Artis
                  </Text>
                  <Text fz="sm" lh={1.45} fw={500}>
                    {item.artis}
                  </Text>

                  <Text fz="sm" fw={600} lh={1.4} c="dimmed" mt="xs">
                    Durasi
                  </Text>
                  <Text fz="sm" lh={1.45} fw={500}>
                    {item.durasi}
                  </Text>

                  <Text fz="sm" fw={600} lh={1.4} c="dimmed" mt="xs">
                    Genre
                  </Text>
                  <Text fz="sm" lh={1.45} fw={500}>
                    {item.genre || '-'}
                  </Text>

                  <Button
                    variant="light"
                    color="blue"
                    fullWidth
                    mt="sm"
                    onClick={() =>
                      router.push(`/admin/desa/musik/${item.id}`)
                    }
                    fz="sm"
                    h={36}
                  >
                    <IconDeviceImacCog size={18} />
                    <Text ml="xs">Detail</Text>
                  </Button>
                </Stack>
              </Paper>
            ))
          ) : (
            <Center py="xl">
              <Text c="dimmed" fz="sm" lh={1.4}>
                Tidak ada data musik yang cocok
              </Text>
            </Center>
          )}
        </Stack>
      </Paper>

      <Center>
        <Pagination
          value={page}
          onChange={(newPage) => {
            load(newPage, 10, debouncedSearch);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          total={totalPages}
          mt="md"
          mb="md"
          color="blue"
          radius="md"
        />
      </Center>
    </Box>
  );
}

export default Musik;
