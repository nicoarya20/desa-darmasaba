'use client'
import colors from '@/con/colors';
import { Box, Button, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconEdit, IconSearch, IconTrash } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../../_com/header';
import JudulList from '../../../_com/judulList';
import { ModalKonfirmasiHapus } from '../../../_com/modalKonfirmasiHapus';
import layananonlineDesa from '../../../_state/inovasi/layanan-online-desa';



function JenisPengaduan() {
  const [search, setSearch] = useState("")
  return (
    <Box>
      <HeaderSearch
        title='Jenis Pengaduan'
        placeholder='pencarian'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListJenisPengaduan search={search} />
    </Box>
  );
}

function ListJenisPengaduan({ search }: { search: string }) {
  const state = useProxy(layananonlineDesa.jenisPengaduan)
  const router = useRouter()
  const [modalHapus, setModalHapus] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useShallowEffect(() => {
    state.findMany.load()
  }, [])

  const handleHapus = async () => {
    if (selectedId) {
      await state.delete.byId(selectedId);
      setModalHapus(false)
      setSelectedId(null)
    }
  }


  const filteredData = (state.findMany.data || []).filter(item => {
    const keyword = search.toLowerCase();
    return (
      item.nama.toLowerCase().includes(keyword)
    );
  });

  if (!state.findMany.data) {
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
          title='List Jenis Pengaduan'
          href='/admin/inovasi/layanan-online-desa/jenis-pengaduan/create'
        />
        <Table striped withTableBorder withRowBorders>
          <TableThead>
            <TableTr>
              <TableTh>Nama Jenis Pengaduan</TableTh>
              <TableTh>Edit</TableTh>
              <TableTh>Hapus</TableTh>
            </TableTr>
          </TableThead>
          <TableTbody>
            {filteredData.map((item) => (
              <TableTr key={item.id}>
                <TableTd>{item.nama}</TableTd>
                <TableTd>
                  <Button color="green"
                    onClick={() => {
                      if (item) {
                        router.push(`/admin/inovasi/layanan-online-desa/jenis-pengaduan/${item.id}`);
                      }
                    }}
                  >
                    <IconEdit size={20} />
                  </Button>
                </TableTd>
                <TableTd>
                  <Button color="red"
                    onClick={() => {
                      if (item) {
                        setSelectedId(item.id);
                        setModalHapus(true);
                      }
                    }}
                    disabled={!item}
                  >
                    <IconTrash size={20} />
                  </Button>
                </TableTd>
              </TableTr>
            ))}
          </TableTbody>
        </Table>
      </Paper>
      {/* Modal Hapus */}
      <ModalKonfirmasiHapus
        opened={modalHapus}
        onClose={() => setModalHapus(false)}
        onConfirm={handleHapus}
        text="Apakah anda yakin ingin menghapus jenis pengaduan ini?"
      />
    </Box>
  );
}

export default JenisPengaduan;
