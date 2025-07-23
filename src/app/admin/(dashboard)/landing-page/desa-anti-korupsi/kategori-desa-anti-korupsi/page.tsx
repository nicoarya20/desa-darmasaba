'use client'
import colors from '@/con/colors';
import { Box, Button, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconEdit, IconSearch, IconX } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../../_com/header';
import JudulList from '../../../_com/judulList';
import { ModalKonfirmasiHapus } from '../../../_com/modalKonfirmasiHapus';
import korupsiState from '../../../_state/landing-page/desa-anti-korupsi';


function KategoriDesaAntiKorupsi() {
  const [search, setSearch] = useState("")
  return (
    <Box>
      <HeaderSearch
        title='Kategori Desa Anti Korupsi'
        placeholder='pencarian'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListKategoriKegiatan search={search} />
    </Box>
  );
}

function ListKategoriKegiatan({ search }: { search: string }) {
  const stateKategori = useProxy(korupsiState.kategoriDesaAntiKorupsi)
  const [modalHapus, setModalHapus] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const router = useRouter()

  const handleHapus = () => {
    if (selectedId) {
      stateKategori.delete.byId(selectedId)
      setModalHapus(false)
      setSelectedId(null)
    }
  }

  useShallowEffect(() => {
    stateKategori.findMany.load()
  }, [])

  const filteredData = (stateKategori.findMany.data || []).filter(item => {
    const keyword = search.toLowerCase();
    return (
      item.name.toLowerCase().includes(keyword)
    );
  });

  if (!stateKategori.findMany.data) {
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
          title='List Kategori Kegiatan'
          href='/admin/landing-page/desa-anti-korupsi/kategori-desa-anti-korupsi/create'
        />
        <Table striped withTableBorder withRowBorders>
          <TableThead>
            <TableTr>
              <TableTh>Nama Kategori</TableTh>
              <TableTh>Edit</TableTh>
              <TableTh>Delete</TableTh>
            </TableTr>
          </TableThead>
          <TableTbody>
            {filteredData.map((item) => (
              <TableTr key={item.id}>
                <TableTd>{item.name}</TableTd>
                <TableTd>
                  <Button color="green" onClick={() => router.push(`/admin/landing-page/desa-anti-korupsi/kategori-desa-anti-korupsi/${item.id}`)}>
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
        text='Apakah anda yakin ingin menghapus kategori kegiatan ini?'
      />
    </Box>
  );
}

export default KategoriDesaAntiKorupsi
