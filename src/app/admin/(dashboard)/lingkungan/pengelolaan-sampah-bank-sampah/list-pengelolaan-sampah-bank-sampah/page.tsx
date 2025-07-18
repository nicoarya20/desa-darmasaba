/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import colors from '@/con/colors';
import { Box, Button, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconChartLine, IconClipboardTextFilled, IconEdit, IconLeaf, IconRecycle, IconScale, IconSearch, IconTent, IconTrashFilled, IconTrophy, IconTruckFilled, IconX } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../../_com/header';
import JudulList from '../../../_com/judulList';
import { ModalKonfirmasiHapus } from '../../../_com/modalKonfirmasiHapus';
import pengelolaanSampahState from '../../../_state/lingkungan/pengelolaan-sampah';
import React from 'react';


function PengelolaanSampahBankSampah() {
  const [search, setSearch] = useState("")
  return (
    <Box>
      <HeaderSearch
        title='List Pengelolaan Sampah Bank Sampah'
        placeholder='pencarian'
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

  useShallowEffect(() => {
    stateList.findMany.load()
  }, [])

  const handleHapus = () => {
    if (selectedId) {
      stateList.delete.byId(selectedId)
      setModalHapus(false)
      setSelectedId(null)
    }
  }

  const filteredData = (stateList.findMany.data || []).filter(item => {
    const keyword = search.toLowerCase();
    return (
      item.name.toLowerCase().includes(keyword)
      || item.icon.toLowerCase().includes(keyword)
    );
  });

  const iconMap: Record<string, React.FC<any>> = {
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

  if (!stateList.findMany.data) {
    return (
      <Stack py={10}>
        <Skeleton h={500} />
      </Stack>
    )
  }

  return (
    <Box py={10}>
      <Paper bg={colors['white-1']} p={'md'}>
        <JudulList
          title='List Pengelolaan Sampah Bank Sampah'
          href='/admin/lingkungan/pengelolaan-sampah-bank-sampah/list-pengelolaan-sampah-bank-sampah/create'
        />
        <Table striped withTableBorder withRowBorders>
          <TableThead>
            <TableTr>
              <TableTh>Nama Pengelolaan Sampah</TableTh>
              <TableTh>Icon</TableTh>
              <TableTh>Edit</TableTh>
              <TableTh>Delete</TableTh>
            </TableTr>
          </TableThead>
          <TableTbody>
            {filteredData.map((item) => (
              <TableTr key={item.id}>
                <TableTd>{item.name}</TableTd>
                <TableTd style={{ width: '10%' }}>
                  {iconMap[item.icon] && (
                    <Box title={item.icon}>
                      {React.createElement(iconMap[item.icon], { size: 24 })}
                    </Box>
                  )}
                </TableTd>
                <TableTd>
                  <Button color="green" onClick={() => router.push(`/admin/lingkungan/pengelolaan-sampah-bank-sampah/list-pengelolaan-sampah-bank-sampah/${item.id}`)}>
                    <IconEdit size={20} />
                  </Button>
                </TableTd>
                <TableTd>
                  <Button color="red" onClick={() => {
                    setSelectedId(item.id)
                    setModalHapus(true)
                  }}>
                    <IconX size={20} />
                  </Button>
                </TableTd>
              </TableTr>
            ))}
          </TableTbody>
        </Table>
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
