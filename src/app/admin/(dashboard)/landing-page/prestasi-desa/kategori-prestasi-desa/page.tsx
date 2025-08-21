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
import prestasiState from '../../../_state/landing-page/prestasi-desa';


function KategoriPrestasiDesa() {
  const [search, setSearch] = useState("")
  return (
    <Box>
      <HeaderSearch
        title='Kategori Prestasi Desa'
        placeholder='pencarian'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListKategoriPrestasi search={search} />
    </Box>
  );
}

function ListKategoriPrestasi({ search }: { search: string }) {
  const stateKategori = useProxy(prestasiState.kategoriPrestasi)
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

  const {
    data,
    page,
    totalPages,
    loading,
    load,
  } = stateKategori.findMany

  useShallowEffect(() => {
    load(page, 10, search)
  }, [page, search])

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
          title='List Kategori Prestasi Desa'
          href='/admin/landing-page/prestasi-desa/kategori-prestasi-desa/create'
        />
        <Box style={{ overflowY: "auto" }}>
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
                    <Button color="green" onClick={() => router.push(`/admin/landing-page/prestasi-desa/kategori-prestasi-desa/${item.id}`)}>
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
        </Box>
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
        text='Apakah anda yakin ingin menghapus kategori prestasi desa ini?'
      />
    </Box>
  );
}

export default KategoriPrestasiDesa
