'use client'
import colors from '@/con/colors';
import { Box, Button, Center, Pagination, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconEdit, IconSearch, IconX } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../../_com/header';
import JudulList from '../../../_com/judulList';
import { ModalKonfirmasiHapus } from '../../../_com/modalKonfirmasiHapus';
import pasarDesaState from '../../../_state/ekonomi/pasar-desa/pasar-desa';


function PasarDesa() {
  const [search2, setSearch2] = useState("")
  return (
    <Box>
      <HeaderSearch
        title='Kategori Produk'
        placeholder='pencarian'
        searchIcon={<IconSearch size={20} />}
        value={search2}
        onChange={(e) => setSearch2(e.currentTarget.value)}
      />
      <ListPasarDesa search2={search2} />
    </Box>
  );
}

function ListPasarDesa({ search2 }: { search2: string }) {
  const statePasar = useProxy(pasarDesaState.kategoriProduk)
  const [modalHapus, setModalHapus] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  // const params = useParams()
  const router = useRouter()

  const {
    data,
    page,
    totalPages,
    loading,
    load,
  } = statePasar.findMany

  useShallowEffect(() => {
    load(page, 10, search2)
  }, [page, search2])

  const handleHapus = () => {
    if (selectedId) {
      statePasar.delete.byId(selectedId)
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
      <Paper bg={colors['white-1']} p={'md'}>
        <JudulList
          title='List Produk Pasar Desa'
          href='/admin/ekonomi/pasar-desa/kategori-produk/create'
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
                <TableTd>{item.nama}</TableTd>
                <TableTd>
                  <Button color="green" onClick={() => router.push(`/admin/ekonomi/pasar-desa/kategori-produk/${item.id}`)}>
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
      <Center>
        <Pagination
          value={page}
          onChange={(newPage) => load(newPage)}
          total={totalPages}
          my={"md"}
        />
      </Center>
      {/* Modal Konfirmasi Hapus */}
      <ModalKonfirmasiHapus
        opened={modalHapus}
        onClose={() => setModalHapus(false)}
        onConfirm={handleHapus}
        text='Apakah anda yakin ingin menghapus kategori produk ini?'
      />
    </Box>
  );
}

export default PasarDesa;
