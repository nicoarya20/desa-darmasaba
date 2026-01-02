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
  Title,
} from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconEdit, IconPlus, IconX } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import { ModalKonfirmasiHapus } from '../../../_com/modalKonfirmasiHapus';
import infoSekolahPaud from '../../../_state/pendidikan/info-sekolah-paud';

function JenjangPendidikan() {
  return (
    <Box>
      <Title order={2} visibleFrom="md">
        Jenjang Pendidikan
      </Title>
      <Title order={2} hiddenFrom="md">
        Jenjang Pendidikan
      </Title>
      <ListJenjangPendidikan />
    </Box>
  );
}

function ListJenjangPendidikan() {
  const stateList = useProxy(infoSekolahPaud.jenjangPendidikan);
  const [modalHapus, setModalHapus] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const router = useRouter();

  const {
    data,
    page,
    totalPages,
    loading,
    load,
  } = stateList.findMany;

  const handleHapus = () => {
    if (selectedId) {
      stateList.delete.byId(selectedId);
      setModalHapus(false);
      setSelectedId(null);
    }
  };

  useShallowEffect(() => {
    load(page, 10);
  }, [page]);

  const filteredData = data || [];

  if (loading || !data) {
    return (
      <Stack py="md">
        <Skeleton h={500} radius="md" />
      </Stack>
    );
  }

  return (
    <Box py="md">
      <Paper bg={colors['white-1']} p="lg" withBorder shadow="md" radius="md">
        <Group justify="space-between" mb="md">
          <Title order={3} visibleFrom="md">
            Daftar Jenjang Pendidikan
          </Title>
          <Title order={3} hiddenFrom="md">
            Daftar Jenjang Pendidikan
          </Title>
          <Button
            leftSection={<IconPlus size={18} />}
            color="blue"
            variant="light"
            onClick={() =>
              router.push('/admin/pendidikan/info-sekolah/jenjang-pendidikan/create')
            }
          >
            Tambah Baru
          </Button>
        </Group>

        {/* Desktop Table */}
        <Box visibleFrom="md">
          <Table
            highlightOnHover
            miw={0}
            style={{
              tableLayout: 'fixed',
              width: '100%',
            }}
          >
            <TableThead>
              <TableTr>
                <TableTh style={{ width: '70%' }}>Nama Jenjang Pendidikan</TableTh>
                <TableTh style={{ width: '15%' }}>Edit</TableTh>
                <TableTh style={{ width: '15%' }}>Delete</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd>
                      <Text fz="md" fw={500} lh={1.45} truncate="end">
                        {item.nama}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Button
                        color="green"
                        variant="light"
                        onClick={() =>
                          router.push(
                            `/admin/pendidikan/info-sekolah/jenjang-pendidikan/${item.id}`
                          )
                        }
                      >
                        <IconEdit size={20} />
                      </Button>
                    </TableTd>
                    <TableTd>
                      <Button
                        color="red"
                        variant="light"
                        onClick={() => {
                          setSelectedId(item.id);
                          setModalHapus(true);
                        }}
                      >
                        <IconX size={20} />
                      </Button>
                    </TableTd>
                  </TableTr>
                ))
              ) : (
                <TableTr>
                  <TableTd colSpan={3}>
                    <Center py="xl">
                      <Text c="dimmed" fz="sm" lh={1.4}>
                        Tidak ada data jenjang pendidikan
                      </Text>
                    </Center>
                  </TableTd>
                </TableTr>
              )}
            </TableTbody>
          </Table>
        </Box>

        {/* Mobile Cards */}
        <Stack hiddenFrom="md" gap="sm">
          {filteredData.length > 0 ? (
            filteredData.map((item) => (
              <Paper key={item.id} withBorder p="sm" radius="md">
                <Box>
                  <Text fz="sm" fw={600} lh={1.4}>
                    Nama Jenjang Pendidikan
                  </Text>
                  <Text fz="sm" fw={500} lh={1.4}>
                    {item.nama}
                  </Text>
                </Box>
                <Group mt="sm" justify="flex-end" gap="xs">
                  <Button
                    color="green"
                    variant="light"
                    size="compact-sm"
                    onClick={() =>
                      router.push(
                        `/admin/pendidikan/info-sekolah/jenjang-pendidikan/${item.id}`
                      )
                    }
                  >
                    <IconEdit size={16} />
                  </Button>
                  <Button
                    color="red"
                    variant="light"
                    size="compact-sm"
                    onClick={() => {
                      setSelectedId(item.id);
                      setModalHapus(true);
                    }}
                  >
                    <IconX size={16} />
                  </Button>
                </Group>
              </Paper>
            ))
          ) : (
            <Center py="xl">
              <Text c="dimmed" fz="sm" lh={1.4}>
                Tidak ada data jenjang pendidikan
              </Text>
            </Center>
          )}
        </Stack>
      </Paper>

      <Center>
        <Pagination
          value={page}
          onChange={(newPage) => {
            load(newPage, 10);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          total={totalPages}
          mt="md"
          mb="md"
          color="blue"
          radius="md"
        />
      </Center>

      {/* Modal Konfirmasi Hapus */}
      <ModalKonfirmasiHapus
        opened={modalHapus}
        onClose={() => setModalHapus(false)}
        onConfirm={handleHapus}
        text="Apakah anda yakin ingin menghapus jenjang pendidikan ini?"
      />
    </Box>
  );
}

export default JenjangPendidikan;