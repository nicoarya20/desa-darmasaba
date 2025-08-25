/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import colors from '@/con/colors';
import { Box, Button, Center, Image, Pagination, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text } from '@mantine/core';
import { IconEdit, IconSearch, IconX } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../../_com/header';
import JudulList from '../../../_com/judulList';
import mitraKolaborasi from '../../../_state/inovasi/mitra-kolaborasi';
import { ModalKonfirmasiHapus } from '../../../_com/modalKonfirmasiHapus';

function MitraKolaborasi() {
  const [search, setSearch] = useState('');
  return (
    <Box>
      <HeaderSearch
        title='Mitra Kolaborasi'
        placeholder='pencarian'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListMitraKolaborasi search={search} />
    </Box>
  );
}

function ListMitraKolaborasi({ search }: { search: string }) {
  const listState = useProxy(mitraKolaborasi)
  const router = useRouter();
  const [modalHapus, setModalHapus] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const handleHapus = () => {
    if (selectedId) {
      mitraKolaborasi.delete.byId(selectedId)
      setModalHapus(false)
      setSelectedId(null)
      router.push("/admin/inovasi/kolaborasi-inovasi")
    }
  }

  const {
    data,
    loading,
    page,
    totalPages,
    load,
  } = listState.findMany

  useEffect(() => {
    load(page, 10, search)
  }, [page, search])

  const filteredData = data || []

  if (loading || !data) {
    return (
      <Stack py={10}>
        <Skeleton height={650} />
      </Stack>
    );
  }
  if (data.length === 0) {
    return (
      <Box py={10}>
        <Paper p="md" >
          <Stack>
            <JudulList
              title='List Mitra Kolaborasi'
              href='/admin/inovasi/kolaborasi-inovasi/mitra-kolaborasi/create'
            />
            <Table striped withTableBorder withRowBorders>
              <TableThead>
                <TableTr>
                  <TableTh>No</TableTh>
                  <TableTh>Nama Mitra</TableTh>
                  <TableTh>Image</TableTh>
                  <TableTh>Delete</TableTh>
                  <TableTh>Edit</TableTh>
                </TableTr>
              </TableThead>
            </Table>
            <Text ta="center">Tidak ada data mitra kolaborasi yang tersedia</Text>
          </Stack>
        </Paper>
      </Box >
    );
  }

  return (
    <Box py={10}>
      <Paper bg={colors['white-1']} p={'md'}>
        <JudulList
          title='List Mitra Kolaborasi'
          href='/admin/inovasi/kolaborasi-inovasi/mitra-kolaborasi/create'
        />
        <Table striped withTableBorder withRowBorders>
          <TableThead>
            <TableTr>
              <TableTh>No</TableTh>
              <TableTh>Nama Mitra</TableTh>
              <TableTh>Image</TableTh>
              <TableTh>Delete</TableTh>
              <TableTh>Edit</TableTh>
            </TableTr>
          </TableThead>
          <TableTbody>
            {filteredData.map((item, index) => (
              <TableTr key={item.id}>
                <TableTd>{index + 1}</TableTd>
                <TableTd>{item.name}</TableTd>
                <TableTd>
                  <Box style={{
                    width: 100,
                    height: 100,
                    position: 'relative',
                    overflow: 'hidden',
                    borderRadius: 4
                  }}>
                    <Image
                      src={item.image?.link || ''}
                      alt={item.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: 'center'
                      }}
                    />
                  </Box>
                </TableTd>
                <TableTd>
                  <Button
                    onClick={() => {
                      if (item) {
                        setSelectedId(item.id);
                        setModalHapus(true);
                      }
                    }}
                    disabled={mitraKolaborasi.delete.loading || !item}
                    color={"red"}
                  >
                    <IconX size={20} />
                  </Button>
                </TableTd>
                <TableTd>
                  <Button
                    onClick={() => {
                      if (item) {
                        router.push(`/admin/inovasi/kolaborasi-inovasi/mitra-kolaborasi/${item.id}`);
                      }
                    }}
                    disabled={!item}
                    color={"green"}
                  >
                    <IconEdit size={20} />
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
          onChange={(newPage) => load(newPage)} // ini penting!
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
        text='Apakah anda yakin ingin menghapus mitra kolaborasi ini?'
      />
    </Box >
  );
}

export default MitraKolaborasi;
