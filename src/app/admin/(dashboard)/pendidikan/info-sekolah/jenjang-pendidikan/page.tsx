'use client'
import colors from '@/con/colors';
import { Box, Button, Center, Group, Pagination, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text, Title, Tooltip } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconEdit, IconPlus, IconX } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import { ModalKonfirmasiHapus } from '../../../_com/modalKonfirmasiHapus';
import infoSekolahPaud from '../../../_state/pendidikan/info-sekolah-paud';


function JenjangPendidikan() {
  // const [search, setSearch] = useState("")
  return (
    <Box>
      <Title order={4}>Jenjang Pendidikan</Title>
      {/* <HeaderSearch
        title='Jenjang Pendidikan'
        placeholder='Cari jenjang pendidikan...'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      /> */}
      <ListJenjangPendidikan />
    </Box>
  );
}

function ListJenjangPendidikan() {
  const stateList = useProxy(infoSekolahPaud.jenjangPendidikan)
  const [modalHapus, setModalHapus] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const router = useRouter()

  const {
    data,
    page,
    totalPages,
    loading,
    load,
  } = stateList.findMany

  const handleHapus = () => {
    if (selectedId) {
      stateList.delete.byId(selectedId)
      setModalHapus(false)
      setSelectedId(null)
    }
  }

  useShallowEffect(() => {
    load(page, 10)
  }, [page])

  const filteredData = data || []

  if (loading || !data) {
    return (
      <Stack py={10}>
        <Skeleton h={500} radius="md" />
      </Stack>
    )
  }

  return (
    <Box py={10}>
      <Paper bg={colors['white-1']} p="lg" withBorder shadow="md" radius="md">
        <Group justify="space-between" mb="md">
          <Title order={4}>Daftar Jenjang Pendidikan</Title>
          <Tooltip label="Tambah Jenjang Pendidikan" withArrow>
            <Button
              leftSection={<IconPlus size={18} />}
              color="blue"
              variant="light"
              onClick={() => router.push('/admin/pendidikan/info-sekolah/jenjang-pendidikan/create')}
            >
              Tambah Baru
            </Button>
          </Tooltip>
        </Group>

        <Box style={{ overflowX: "auto" }}>
          <Table highlightOnHover>
            <TableThead>
              <TableTr>
                <TableTh>Nama Jenjang Pendidikan</TableTh>
                <TableTh style={{ width: '15%' }}>Edit</TableTh>
                <TableTh style={{ width: '15%' }}>Delete</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd>
                      <Text fw={500} truncate="end">{item.nama}</Text>
                    </TableTd>
                    <TableTd>
                      <Button
                        color="green"
                        variant="light"
                        onClick={() => router.push(`/admin/pendidikan/info-sekolah/jenjang-pendidikan/${item.id}`)}
                      >
                        <IconEdit size={20} />
                      </Button>
                    </TableTd>
                    <TableTd>
                      <Button
                        color="red"
                        variant="light"
                        onClick={() => {
                          setSelectedId(item.id)
                          setModalHapus(true)
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
                    <Center py={20}>
                      <Text color="dimmed">Tidak ada data jenjang pendidikan</Text>
                    </Center>
                  </TableTd>
                </TableTr>
              )}
            </TableTbody>
          </Table>
        </Box>
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
        text='Apakah anda yakin ingin menghapus jenjang pendidikan ini?'
      />
    </Box>
  );
}

export default JenjangPendidikan;
