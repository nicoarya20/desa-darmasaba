'use client'
import colors from '@/con/colors';
import { Box, Button, Center, Group, Pagination, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text, Title, Tooltip } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconEdit, IconPlus, IconSearch, IconTrashFilled } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../../_com/header';
import beasiswaDesaState from '../../../_state/pendidikan/beasiswa-desa';
import { ModalKonfirmasiHapus } from '../../../_com/modalKonfirmasiHapus';


function KeunggulanProgram() {
  const [search, setSearch] = useState("");
  return (
    <Box>
      <HeaderSearch
        title='List Keunggulan Program'
        placeholder='Cari keunggulan program...'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListKeunggulanProgram search={search} />
    </Box>
  );
}

function ListKeunggulanProgram({ search }: { search: string }) {
  const stateList = useProxy(beasiswaDesaState.keunggulanProgram)
  const router = useRouter()
  const [modalHapus, setModalHapus] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const {
    data,
    page,
    totalPages,
    loading,
    load,
  } = stateList.findMany

  useShallowEffect(() => {
    load(page, 10, search)
  }, [page, search])

  const handleHapus = () => {
    if (selectedId) {
      stateList.delete.delete(selectedId)
      setModalHapus(false)
      setSelectedId(null)
    }
  }


  const filteredData = data || []

  if (loading || !data) {
    return (
      <Stack py={10}>
        <Skeleton h={500} />
      </Stack>
    )
  }

  return (
    <Box py={10}>
      <Paper bg={colors['white-1']} p="lg" shadow="md" radius="md">
        <Group justify="space-between" mb="md">
          <Title order={4}>Daftar Keunggulan Program</Title>
          <Tooltip label="Tambah Keunggulan Program" withArrow>
            <Button
              leftSection={<IconPlus size={18} />}
              color="blue"
              variant="light"
              onClick={() => router.push('/admin/pendidikan/beasiswa-desa/keunggulan-program/create')}
            >
              Tambah Baru
            </Button>
          </Tooltip>
        </Group>

        <Box style={{ overflowX: 'auto' }}>
          <Table highlightOnHover>
            <TableThead>
              <TableTr>
                <TableTh>Nama Keunggulan Program</TableTh>
                <TableTh>Deskripsi</TableTh>
                <TableTh>Edit</TableTh>
                <TableTh>Delete</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd>
                      <Text lineClamp={1} truncate="end" fw={500}>{item.judul}</Text>
                    </TableTd>
                    <TableTd>
                      <Text lineClamp={1} truncate="end" fw={500} dangerouslySetInnerHTML={{ __html: item.deskripsi }}></Text>
                    </TableTd>
                    <TableTd>
                      <Tooltip label="Edit" withArrow>
                        <Button
                          variant="light"
                          color="blue"
                          size="sm"
                          onClick={() => router.push(`/admin/pendidikan/beasiswa-desa/keunggulan-program/${item.id}`)}
                        >
                          <IconEdit size={18} />
                        </Button>
                      </Tooltip>
                    </TableTd>
                    <TableTd>
                      <Tooltip label="Hapus" withArrow>
                        <Button
                          variant="light"
                          color="red"
                          size="sm"
                          onClick={() => {
                            setSelectedId(item.id);
                            setModalHapus(true);
                          }}
                        >
                          <IconTrashFilled size={18} />
                        </Button>
                      </Tooltip>
                    </TableTd>
                  </TableTr>
                ))
              ) : (
                <TableTr>
                  <TableTd colSpan={3} align="center" py="xl">
                    <Text c="dimmed">Tidak ada data pengelolaan sampah</Text>
                  </TableTd>
                </TableTr>
              )}
            </TableTbody>
          </Table>
        </Box>

        {totalPages > 1 && (
          <Center mt="xl">
            <Pagination
              value={page}
              onChange={(newPage) => load(newPage)}
              total={totalPages}
              siblings={1}
              boundaries={1}
              withEdges
            />
          </Center>
        )}
      </Paper>
      {/* Modal Konfirmasi Hapus */}
      <ModalKonfirmasiHapus
        opened={modalHapus}
        onClose={() => setModalHapus(false)}
        onConfirm={handleHapus}
        text='Apakah anda yakin ingin menghapus pengelolaan sampah bank sampah ini?'
      />
    </Box>
  );
}

export default KeunggulanProgram;
