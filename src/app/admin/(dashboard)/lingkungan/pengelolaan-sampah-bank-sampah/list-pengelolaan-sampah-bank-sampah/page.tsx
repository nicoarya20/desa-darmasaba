'use client'
import colors from '@/con/colors';
import { Box, Button, Center, Group, Pagination, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text, Title, Tooltip } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconChartLine, IconClipboardTextFilled, IconEdit, IconLeaf, IconPlus, IconRecycle, IconScale, IconSearch, IconTent, IconTrashFilled, IconTrophy, IconTruckFilled } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../../_com/header';
import { ModalKonfirmasiHapus } from '../../../_com/modalKonfirmasiHapus';
import pengelolaanSampahState from '../../../_state/lingkungan/pengelolaan-sampah';
import React from 'react';


function PengelolaanSampahBankSampah() {
  const [search, setSearch] = useState("");
  return (
    <Box>
      <HeaderSearch
        title='List Pengelolaan Sampah Bank Sampah'
        placeholder='Cari pengelolaan sampah...'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListPengelolaanSampahBankSampah search={search} />
    </Box>
  );
}

function ListPengelolaanSampahBankSampah({ search }: { search: string }) {
  const stateList = useProxy(pengelolaanSampahState.pengelolaanSampah)
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

  useShallowEffect(() => {
    load(page, 10, search)
  }, [page, search])


  const handleHapus = () => {
    if (selectedId) {
      stateList.delete.byId(selectedId)
      setModalHapus(false)
      setSelectedId(null)
    }
  }

  const filteredData = data || []

  const iconMap: Record<string, React.FC<{ size: number; style?: React.CSSProperties }>> = {
    ekowisata: IconLeaf,
    kompetisi: IconTrophy,
    wisata: IconTent,
    ekonomi: IconChartLine,
    sampah: IconRecycle,
    truck: IconTruckFilled,
    scale: IconScale,
    clipboard: IconClipboardTextFilled,
    trash: IconTrashFilled,
  };

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
          <Title order={4}>Daftar Pengelolaan Sampah Bank Sampah</Title>
          <Tooltip label="Tambah Pengelolaan Sampah" withArrow>
            <Button
              leftSection={<IconPlus size={18} />}
              color="blue"
              variant="light"
              onClick={() => router.push('/admin/lingkungan/pengelolaan-sampah-bank-sampah/list-pengelolaan-sampah-bank-sampah/create')}
            >
              Tambah Baru
            </Button>
          </Tooltip>
        </Group>

        <Box style={{ overflowX: 'auto' }}>
          <Table highlightOnHover>
            <TableThead>
              <TableTr>
                <TableTh>Nama Pengelolaan Sampah</TableTh>
                <TableTh>Icon</TableTh>
                <TableTh>Edit</TableTh>
                <TableTh>Delete</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd>
                      <Text lineClamp={1} truncate="end" fw={500}>{item.name}</Text>
                    </TableTd>
                    <TableTd>
                      {iconMap[item.icon] ? (
                        <Tooltip label={item.icon} withArrow>
                          <Box>
                            {React.createElement(iconMap[item.icon], {
                              size: 24,
                              style: { color: colors['blue-button'] }
                            })}
                          </Box>
                        </Tooltip>
                      ) : (
                        <Text c="dimmed" fz="sm">-</Text>
                      )}
                    </TableTd>
                    <TableTd>
                      <Tooltip label="Edit" withArrow>
                        <Button
                          variant="light"
                          color="green"
                          size="sm"
                          onClick={() => router.push(`/admin/lingkungan/pengelolaan-sampah-bank-sampah/list-pengelolaan-sampah-bank-sampah/${item.id}`)}
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

export default PengelolaanSampahBankSampah;
