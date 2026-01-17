'use client'
import colors from '@/con/colors';
import {
  ActionIcon,
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
  TextInput,
  Title,
  Tooltip
} from '@mantine/core';
import { useDebouncedValue, useShallowEffect } from '@mantine/hooks';
import { IconCoin, IconDeviceImacCog, IconPlus, IconReportMedical, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import fasilitasKesehatanState from '../../../_state/kesehatan/data_kesehatan_warga/fasilitasKesehatan';

function FasilitasKesehatan() {
  const [search, setSearch] = useState("");
  const router = useRouter();
  return (
    <Box>
      <Paper p="lg" radius="md" mb="lg" bg={colors['white-1']} shadow="sm">
        <Group justify='space-between' visibleFrom='md'>
          <Title order={2} visibleFrom="md" size="lg" lh={1.2}>
            Fasilitas Kesehatan
          </Title>
          <Title order={2} hiddenFrom="md" size="md" lh={1.2}>
            Fasilitas Kesehatan
          </Title>
          <Group gap="xs" justify="flex-end">
            <Tooltip label="List Dokter" withArrow>
              <ActionIcon
                onClick={() => router.push('/admin/kesehatan/data-kesehatan-warga/fasilitas_kesehatan/dokter-tenaga-medis')}
                size="lg"
                radius="xl"
                color="green.6"
              >
                <IconReportMedical size={20} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="List Tarif Layanan" withArrow>
              <ActionIcon
                onClick={() => router.push('/admin/kesehatan/data-kesehatan-warga/fasilitas_kesehatan/tarif-layanan')}
                size="lg"
                radius="xl"
                color="blue.6"
              >
                <IconCoin size={20} />
              </ActionIcon>
            </Tooltip>
              <TextInput
                radius="lg"
                placeholder='Cari nama, alamat, atau jam operasional...'
                leftSection={<IconSearch size={20} />}
                value={search}
                onChange={(e) => setSearch(e.currentTarget.value)}
                fz={{ base: 'xs', md: 'sm' }}
                px="sm"
                py="xs"
              />
          </Group>
        </Group>

        <Group justify='space-between' hiddenFrom='md'>
          <Title order={2} visibleFrom="md" size="lg" lh={1.2}>
            Fasilitas Kesehatan
          </Title>
          <Title order={2} hiddenFrom="md" size="md" lh={1.2}>
            Fasilitas Kesehatan
          </Title>
          <Group gap="xs" justify="flex-start">
            <Tooltip label="List Dokter" withArrow>
              <ActionIcon
                onClick={() => router.push('/admin/kesehatan/data-kesehatan-warga/fasilitas_kesehatan/dokter-tenaga-medis')}
                size="lg"
                radius="xl"
                color="green.6"
              >
                <IconReportMedical size={20} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="List Tarif Layanan" withArrow>
              <ActionIcon
                onClick={() => router.push('/admin/kesehatan/data-kesehatan-warga/fasilitas_kesehatan/tarif-layanan')}
                size="lg"
                radius="xl"
                color="blue.6"
              >
                <IconCoin size={20} />
              </ActionIcon>
            </Tooltip>
              <TextInput
                radius="lg"
                placeholder='Cari nama, alamat, atau jam operasional...'
                leftSection={<IconSearch size={20} />}
                value={search}
                onChange={(e) => setSearch(e.currentTarget.value)}
                fz={{ base: 'xs', md: 'sm' }}
                px="sm"
                py="xs"
              />
          </Group>
        </Group>
      </Paper>

      <ListFasilitasKesehatan search={search} />
    </Box>
  );
}

function ListFasilitasKesehatan({ search }: { search: string }) {
  const stateFasilitasKesehatan = useProxy(fasilitasKesehatanState.fasilitasKesehatan);
  const router = useRouter();
  const [debouncedSearch] = useDebouncedValue(search, 1000);

  const { data, page, totalPages, loading, load } = stateFasilitasKesehatan.findMany;

  useShallowEffect(() => {
    load(page, 10, debouncedSearch);
  }, [page, debouncedSearch]);

  const filteredData = data || [];

  if (loading || !data) {
    return (
      <Stack py="lg">
        <Skeleton height={600} radius="md" />
      </Stack>
    );
  }

  return (
    <Box py="lg">
      <Paper withBorder bg={colors['white-1']} p="lg" shadow="md" radius="md">
        <Group justify="space-between" mb="md">
          <Title order={3} visibleFrom="md" size="md" lh={1.2}>
            Daftar Fasilitas Kesehatan
          </Title>
          <Title order={3} hiddenFrom="md" size="sm" lh={1.2}>
            Daftar Fasilitas Kesehatan
          </Title>
          <Button
            leftSection={<IconPlus size={18} />}
            color="blue"
            variant="light"
            onClick={() =>
              router.push(
                '/admin/kesehatan/data-kesehatan-warga/fasilitas_kesehatan/create'
              )
            }
            fz={{ base: 'sm', md: 'md' }}
            px="sm"
          >
            Tambah Baru
          </Button>
        </Group>

        {/* Desktop Table */}
       <Box visibleFrom="md" style={{ overflowX: 'auto' }}>
         <Table highlightOnHover
    layout="fixed" // 🔥 PENTING
    withColumnBorders={false}>
            <TableThead>
              <TableTr>
                <TableTh>Fasilitas Kesehatan</TableTh>
                <TableTh>Jumlah Dokter</TableTh>
                <TableTh>Jumlah Layanan</TableTh>
                <TableTh>Aksi</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd>
                      <Text fz="md" fw={500} lh={1.5} truncate="end" lineClamp={1}>
                        {item.name}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Text fz="md" lh={1.5}>
                        {item.dokterdantenagamedis?.length
                          ? `${item.dokterdantenagamedis.length} dokter`
                          : '-'}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Text fz="md" lh={1.5}>
                        {item.tarifdanlayanan?.length
                          ? `${item.tarifdanlayanan.length} layanan`
                          : '-'}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Button
                        variant="light"
                        color="blue"
                        onClick={() =>
                          router.push(
                            `/admin/kesehatan/data-kesehatan-warga/fasilitas_kesehatan/${item.id}`
                          )
                        }
                        fz="sm"
                        px="sm"
                        h={36}
                      >
                        <IconDeviceImacCog size={20} />
                        <Text ml={5}>Detail</Text>
                      </Button>
                    </TableTd>
                  </TableTr>
                ))
              ) : (
                <TableTr>
                  <TableTd colSpan={4}>
                    <Center py="xl">
                      <Text c="dimmed" fz="sm" lh={1.4}>
                        Tidak ada fasilitas kesehatan yang cocok
                      </Text>
                    </Center>
                  </TableTd>
                </TableTr>
              )}
            </TableTbody>
          </Table>
        </Box>

        {/* Mobile Card View */}
        <Stack gap="sm" hiddenFrom="md">
          {filteredData.length > 0 ? (
            filteredData.map((item) => (
              <Paper key={item.id} withBorder p="md" radius="md">
                <Box mb="xs">
                  <Text fz="xs" fw={600} lh={1.4}>
                    Fasilitas Kesehatan
                  </Text>
                  <Text fz="sm" fw={500} lh={1.4}>
                    {item.name}
                  </Text>
                </Box>
                <Box mb="xs">
                  <Text fz="xs" fw={600} lh={1.4}>
                    Jumlah Dokter
                  </Text>
                  <Text fz="sm" fw={500} lh={1.4}>
                    {item.dokterdantenagamedis?.length
                      ? `${item.dokterdantenagamedis.length} dokter`
                      : '-'}
                  </Text>
                </Box>
                <Box mb="xs">
                  <Text fz="xs" fw={600} lh={1.4}>
                    Jumlah Layanan
                  </Text>
                  <Text fz="sm" fw={500} lh={1.4}>
                    {item.tarifdanlayanan?.length
                      ? `${item.tarifdanlayanan.length} layanan`
                      : '-'}
                  </Text>
                </Box>
                <Button
                  variant="light"
                  color="blue"
                  onClick={() =>
                    router.push(
                      `/admin/kesehatan/data-kesehatan-warga/fasilitas_kesehatan/${item.id}`
                    )
                  }
                  fullWidth
                  fz="sm"
                  mt="md"
                >
                  <IconDeviceImacCog size={20} />
                  <Text ml={5}>Detail</Text>
                </Button>
              </Paper>
            ))
          ) : (
            <Center py="xl">
              <Text c="dimmed" fz="sm" lh={1.4}>
                Tidak ada fasilitas kesehatan yang cocok
              </Text>
            </Center>
          )}
        </Stack>
      </Paper>

      {/* Pagination */}
      <Center>
        <Pagination
          value={page}
          onChange={(newPage) => {
            load(newPage, 10, search);
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

export default FasilitasKesehatan;