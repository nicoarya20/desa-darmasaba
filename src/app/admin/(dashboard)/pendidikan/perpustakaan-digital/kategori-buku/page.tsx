/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import colors from '@/con/colors';
import { Box, Button, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text } from '@mantine/core';
import { IconEdit, IconSearch, IconTrash } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../../_com/header';
import JudulList from '../../../_com/judulList';
import { ModalKonfirmasiHapus } from '../../../_com/modalKonfirmasiHapus';
import perpustakaanDigitalState from '../../../_state/pendidikan/perpustakaan-digital';



function KategoriBuku() {
  const [search, setSearch] = useState('');
  return (
    <Box>
      <HeaderSearch
        title='Kategori Buku'
        placeholder='pencarian'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListKategoriBuku search={search} />
    </Box>
  );
}

function ListKategoriBuku({ search }: { search: string }) {
  const listDataState = useProxy(perpustakaanDigitalState.kategoriBuku)
  const router = useRouter();
  const [modalHapus, setModalHapus] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    listDataState.findMany.load()
  }, [])

  const handleDelete = () => {
    if (selectedId) {
      perpustakaanDigitalState.kategoriBuku.delete.delete(selectedId)
      setModalHapus(false)
      setSelectedId(null)

      perpustakaanDigitalState.kategoriBuku.findMany.load()
    }
  }

  const filteredData = (listDataState.findMany.data || []).filter(item => {
    const keyword = search.toLowerCase();
    return (
      item.name.toLowerCase().includes(keyword)
    );
  });

  if (!listDataState.findMany.data) {
    return (
      <Stack py={10}>
        <Skeleton h={500} />
      </Stack>
    )
  }
  return (
    <Box py={10}>
      <Paper bg={colors['white-1']} p="md">
        <Stack>
        <JudulList
          title='List Kategori Buku'
          href='/admin/pendidikan/perpustakaan-digital/kategori-buku/create'
        />
          <Box style={{ overflowX: 'auto' }}>
            <Table striped withRowBorders withTableBorder style={{ minWidth: '700px' }}>
              <TableThead>
                <TableTr>
                  <TableTh>No</TableTh>
                  <TableTh>Nama</TableTh>
                  <TableTh>Edit</TableTh>
                  <TableTh>Hapus</TableTh>
                </TableTr>
              </TableThead>
              <TableTbody>
                {filteredData.map((item, index) => (
                  <TableTr key={item.id}>
                    <TableTd>
                      <Box w={100}>
                        <Text truncate="end" fz={"sm"}>{index + 1}</Text>
                      </Box>
                    </TableTd>
                    <TableTd>{item.name}</TableTd>
                    <TableTd>
                      <Button color='green' onClick={() => router.push(`/admin/pendidikan/perpustakaan-digital/kategori-buku/${item.id}`)}>
                        <IconEdit size={20} />
                      </Button>
                    </TableTd>
                    <TableTd>
                      <Button
                        color='red'
                        disabled={perpustakaanDigitalState.kategoriBuku.delete.loading}
                        onClick={() => {
                          setSelectedId(item.id)
                          setModalHapus(true)
                        }}>
                        <IconTrash size={20} />
                      </Button>
                    </TableTd>
                  </TableTr>
                ))}
              </TableTbody>
            </Table>
          </Box>
        </Stack>
      </Paper>

      {/* Modal Konfirmasi Hapus */}
      <ModalKonfirmasiHapus
        opened={modalHapus}
        onClose={() => setModalHapus(false)}
        onConfirm={handleDelete}
        text='Apakah anda yakin ingin menghapus kategori buku ini?'
      />
    </Box>
  )
}

export default KategoriBuku;
