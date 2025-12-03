'use client'
import colors from '@/con/colors';
import {
  ActionIcon,
  Box,
  Button,
  Center,
  Grid,
  GridCol,
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
import { useShallowEffect } from '@mantine/hooks';
import { IconCoin, IconDeviceImacCog, IconPlus, IconReportMedical, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import fasilitasKesehatanState from '../../../_state/kesehatan/data_kesehatan_warga/fasilitasKesehatan';


function FasilitasKesehatan() {
  const [search, setSearch] = useState("");
  const router = useRouter()
  return (
    <Box>
      <Grid mb={10}>
        <GridCol span={{ base: 12, md: 8 }}>
          <Title order={3}>Fasilitas Kesehatan</Title>
        </GridCol>
        <GridCol span={{ base: 12, md: 4 }}>
          <Group gap={"xs"}>
            <Tooltip label="List Dokter" withArrow>
              <ActionIcon onClick={() => router.push('/admin/kesehatan/data-kesehatan-warga/fasilitas_kesehatan/dokter-tenaga-medis')} size="lg" radius="xl" color="green.6">
                <IconReportMedical size={20} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="List Tarif Layanan" withArrow>
              <ActionIcon onClick={()=> router.push('/admin/kesehatan/data-kesehatan-warga/fasilitas_kesehatan/tarif-layanan')} size="lg" radius="xl" color="blue.6">
                <IconCoin size={20} />
              </ActionIcon>
            </Tooltip>
            <Paper radius="lg" bg={colors['white-1']}>
              <TextInput
                radius="lg"
                placeholder='Cari nama, alamat, atau jam operasional...'
                leftSection={<IconSearch size={20} />}
                w="133%"
                value={search}
                onChange={(e) => setSearch(e.currentTarget.value)}
              />
            </Paper>
          </Group>
        </GridCol>
      </Grid>

      <ListFasilitasKesehatan search={search} />
    </Box>
  );
}


function ListFasilitasKesehatan({ search }: { search: string }) {
  const stateFasilitasKesehatan = useProxy(fasilitasKesehatanState.fasilitasKesehatan)
  const router = useRouter();

  const { data, page, totalPages, loading, load } = stateFasilitasKesehatan.findMany;

  useShallowEffect(() => {

    load(page, 10, search);
  }, [page, search]);

  const filteredData = data || [];

  if (loading || !data) {
    return (
      <Stack py={10}>
        <Skeleton height={600} radius="md" />
      </Stack>
    )
  }

  return (
    <Box py={10}>
      <Paper withBorder bg={colors['white-1']} p={'lg'} shadow="md" radius="md">
        {/* Judul + Tombol Tambah */}
        <Group justify="space-between" mb="md">
          <Title order={4}>Daftar Fasilitas Kesehatan</Title>
          <Button
            leftSection={<IconPlus size={18} />}
            color="blue"
            variant="light"
            onClick={() =>
              router.push(
                '/admin/kesehatan/data-kesehatan-warga/fasilitas_kesehatan/create'
              )
            }
          >
            Tambah Baru
          </Button>
        </Group>

        {/* Tabel */}
        <Box style={{ overflowX: "auto" }}>
          <Table highlightOnHover>
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
                      <Box w={150}>
                        <Text fw={500} truncate="end" lineClamp={1}>
                          {item.name}
                        </Text>
                      </Box>
                    </TableTd>
                    <TableTd>
                      <Box w={150}>
                        {item.dokterdantenagamedis?.length
                          ? `${item.dokterdantenagamedis.length} dokter`
                          : '-'}
                      </Box>
                    </TableTd>
                    <TableTd>
                      <Box w={150}>
                        <Text truncate="end" lineClamp={1}>
                          {item.tarifdanlayanan?.length
                            ? `${item.tarifdanlayanan.length} layanan`
                            : '-'}
                        </Text>
                      </Box>
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
                    <Center py={20}>
                      <Text c="dimmed">
                        Tidak ada fasilitas kesehatan yang cocok
                      </Text>
                    </Center>
                  </TableTd>
                </TableTr>
              )}
            </TableTbody>
          </Table>
        </Box>
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
  )
}

export default FasilitasKesehatan;
