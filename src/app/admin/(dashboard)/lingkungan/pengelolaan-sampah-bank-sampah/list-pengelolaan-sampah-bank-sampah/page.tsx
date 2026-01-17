'use client'
import colors from '@/con/colors';
import { Box, Button, Center, Group, Pagination, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text, Title } from '@mantine/core';
import { useDebouncedValue, useShallowEffect } from '@mantine/hooks';
import { IconAlertTriangle, IconAmbulance, IconBuilding, IconCash, IconChartLine, IconChristmasTreeFilled, IconClipboardTextFilled, IconDroplet, IconEdit, IconFiretruck, IconHome, IconHomeEco, IconHospital, IconLeaf, IconPlus, IconRecycle, IconScale, IconSchool, IconSearch, IconShieldFilled, IconShoppingCart, IconTent, IconTrashFilled, IconTree, IconTrendingUp, IconTrophy, IconTruckFilled } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../../_com/header';
import { ModalKonfirmasiHapus } from '../../../_com/modalKonfirmasiHapus';
import pengelolaanSampahState from '../../../_state/lingkungan/pengelolaan-sampah';


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
  const [debouncedSearch] = useDebouncedValue(search, 1000); // 500ms delay

  const {
    data,
    page,
    totalPages,
    loading,
    load,
  } = stateList.findMany

  useShallowEffect(() => {
    load(page, 10, debouncedSearch)
  }, [page, debouncedSearch])


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
    lingkunganSehat: IconHomeEco,
    sumberOksigen: IconChristmasTreeFilled,
    ekonomiBerkelanjutan: IconTrendingUp,
    mencegahBencana: IconShieldFilled,
    rumah: IconHome,
    pohon: IconTree,
    air: IconDroplet,
    bantuan: IconCash,
    pelatihan: IconSchool,
    subsidi: IconShoppingCart,
    layananKesehatan: IconHospital,
    polisi: IconShieldFilled,
    ambulans: IconAmbulance,
    pemadam: IconFiretruck,
    rumahSakit: IconHospital,
    bangunan: IconBuilding,
    darurat: IconAlertTriangle,
  };

  if (loading || !data) {
    return (
      <Stack py={10}>
        <Skeleton h={500} />
      </Stack>
    )
  }

  return (
    <Box py={{ base: 'sm', md: 'lg' }}>
      <Paper bg={colors['white-1']} p={{ base: 'md', md: 'lg' }} shadow="md" radius="md">
        <Group justify="space-between" mb={{ base: 'md', md: 'lg' }}>
          <Title
            order={4}
            lh={{ base: 1.2, md: 1.15 }}
          >
            Daftar Pengelolaan Sampah Bank Sampah
          </Title>
          <Button
            leftSection={<IconPlus size={18} />}
            color="blue"
            variant="light"
            onClick={() =>
              router.push(
                '/admin/lingkungan/pengelolaan-sampah-bank-sampah/list-pengelolaan-sampah-bank-sampah/create'
              )
            }
          >
            Tambah Baru
          </Button>
        </Group>

        {/* Desktop Table */}
       <Box visibleFrom="md" style={{ overflowX: 'auto' }}>
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
                <TableTh style={{ width: '50%' }}>Nama Pengelolaan Sampah</TableTh>
                <TableTh style={{ width: '20%' }}>Icon</TableTh>
                <TableTh style={{ width: '15%' }}>Edit</TableTh>
                <TableTh style={{ width: '15%' }}>Delete</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd>
                      <Text fz="md" fw={500} lh={1.5} lineClamp={1} truncate="end">
                        {item.name}
                      </Text>
                    </TableTd>
                    <TableTd>
                      {iconMap[item.icon] ? (
                        <Box>
                          {React.createElement(iconMap[item.icon], {
                            size: 24,
                            style: { color: colors['blue-button'] },
                          })}
                        </Box>
                      ) : (
                        <Text c="dimmed" fz="sm">
                          -
                        </Text>
                      )}
                    </TableTd>
                    <TableTd>
                      <Button
                        variant="light"
                        color="green"
                        size="sm"
                        onClick={() =>
                          router.push(
                            `/admin/lingkungan/pengelolaan-sampah-bank-sampah/list-pengelolaan-sampah-bank-sampah/${item.id}`
                          )
                        }
                      >
                        <IconEdit size={18} />
                      </Button>
                    </TableTd>
                    <TableTd>
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
                    </TableTd>
                  </TableTr>
                ))
              ) : (
                <TableTr>
                  <TableTd colSpan={4} ta="center" py="xl">
                    <Text c="dimmed" fz="sm" lh={1.4}>
                      Tidak ada data pengelolaan sampah
                    </Text>
                  </TableTd>
                </TableTr>
              )}
            </TableTbody>
          </Table>
        </Box>

        {/* Mobile Cards */}
        <Box hiddenFrom="md">
          {filteredData.length > 0 ? (
            <Stack gap="md">
              {filteredData.map((item) => (
                <Paper key={item.id} p="sm" withBorder>
                  <Stack gap={"xs"}>
                    <Text fz="sm" fw={600} lh={1.4}>
                      Nama Pengelolaan Sampah
                    </Text>
                    <Text fz="sm" fw={500} lh={1.45} lineClamp={1}>
                      {item.name}
                    </Text>
                    {iconMap[item.icon] ? (
                      React.createElement(iconMap[item.icon], {
                        size: 20,
                        style: { color: colors['blue-button'] },
                      })
                    ) : (
                      <Text c="dimmed" fz="sm">
                        -
                      </Text>
                    )}
                    <Group justify='right'>
                      <Button
                        variant="light"
                        color="green"
                        size="xs"
                        onClick={() =>
                          router.push(
                            `/admin/lingkungan/pengelolaan-sampah-bank-sampah/list-pengelolaan-sampah-bank-sampah/${item.id}`
                          )
                        }
                        radius="sm"
                        p={4}
                      >
                        <IconEdit size={18} />
                      </Button>
                      <Button
                        variant="light"
                        color="red"
                        size="xs"
                        onClick={() => {
                          setSelectedId(item.id);
                          setModalHapus(true);
                        }}
                        radius="sm"
                        p={4}
                      >
                        <IconTrashFilled size={18} />
                      </Button>
                    </Group>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          ) : (
            <Center py="xl">
              <Text c="dimmed" fz="xs" lh={1.4}>
                Tidak ada data pengelolaan sampah
              </Text>
            </Center>
          )}
        </Box>


        <Center mt={{ base: 'lg', md: 'xl' }}>
          <Pagination
            value={page}
            onChange={(newPage) => load(newPage)}
            total={totalPages}
            siblings={1}
            boundaries={1}
            withEdges
          />
        </Center>
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