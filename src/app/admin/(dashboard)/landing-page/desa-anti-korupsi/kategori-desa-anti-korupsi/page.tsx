/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import colors from '@/con/colors';
import { Box, Button, Center, Pagination, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr } from '@mantine/core';
import { IconEdit, IconSearch, IconX } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
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

  const {
    data,
    page,
    totalPages,
    loading,
    load,
  } = stateKategori.findMany;

  const handleHapus = () => {
    if (selectedId) {
      stateKategori.delete.byId(selectedId)
      setModalHapus(false)
      setSelectedId(null)
    }
  }

  useEffect(() => {
    load(page, 10)
  }, [page])

  const filteredData = useMemo(() => {
    if (!data) return [];
    return data.filter(item => {
      const keyword = search.toLowerCase();
      return (
        item.name?.toLowerCase().includes(keyword)
      );
    })
  }, [data, search]);

  // Handle loading state
  if (loading || !data) {
    return (
      <Stack py={10}>
        <Skeleton height={550} />
      </Stack>
    );
  }

  if (data.length === 0) {
    return (
      <Box py={10}>
        <Paper bg={colors['white-1']} p={'md'}>
          <JudulList
            title='List Kategori Kegiatan'
            href='/admin/landing-page/desa-anti-korupsi/kategori-desa-anti-korupsi/create'
          />
          <Box style={{ overflowX: "auto" }}>
            <Table striped withTableBorder withRowBorders>
              <TableThead>
                <TableTr>
                  <TableTh>Nama</TableTh>
                  <TableTh>Edit</TableTh>
                  <TableTh>Delete</TableTh>
                </TableTr>
              </TableThead>
            </Table>
          </Box>
        </Paper>
      </Box>
    );
  }

  return (
    <Box py={10}>
      <Paper bg={colors['white-1']} p={'md'}>
        <JudulList
          title='List Kategori Kegiatan'
          href='/admin/landing-page/desa-anti-korupsi/kategori-desa-anti-korupsi/create'
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
        </Box>
      </Paper>
      <Center>
        <Pagination
          value={page}
          onChange={(newPage) => {
            load(newPage, 10);
            window.scrollTo(0, 0);
          }}
          total={totalPages}
          mt="md"
          mb="md"
        />
      </Center>
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
