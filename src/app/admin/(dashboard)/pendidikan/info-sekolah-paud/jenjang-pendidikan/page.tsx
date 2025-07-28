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
import infoSekolahPaud from '../../../_state/pendidikan/info-sekolah-paud';


function JenjangPendidikan() {
  const [search, setSearch] = useState("")
  return (
    <Box>
      <HeaderSearch
        title='Jenjang Pendidikan'
        placeholder='pencarian'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListJenjangPendidikan search={search} />
    </Box>
  );
}

function ListJenjangPendidikan({ search }: { search: string }) {
  const stateList = useProxy(infoSekolahPaud.jenjangPendidikan)
  const [modalHapus, setModalHapus] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const router = useRouter()

  const handleHapus = () => {
    if (selectedId) {
      stateList.delete.byId(selectedId)
      setModalHapus(false)
      setSelectedId(null)
    }
  }

  useShallowEffect(() => {
    stateList.findMany.load()
  }, [])

  const filteredData = (stateList.findMany.data || []).filter(item => {
    const keyword = search.toLowerCase();
    return (
      item.nama.toLowerCase().includes(keyword)
    );
  });

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
          title='List Jenjang Pendidikan'
          href='/admin/pendidikan/info-sekolah-paud/jenjang-pendidikan/create'
        />
        <Table striped withTableBorder withRowBorders>
          <TableThead>
            <TableTr>
              <TableTh>Nama Jenjang Pendidikan</TableTh>
              <TableTh>Edit</TableTh>
              <TableTh>Delete</TableTh>
            </TableTr>
          </TableThead>
          <TableTbody>
            {filteredData.map((item) => (
              <TableTr key={item.id}>
                <TableTd>{item.nama}</TableTd>
                <TableTd>
                  <Button color="green" onClick={() => router.push(`/admin/pendidikan/info-sekolah-paud/jenjang-pendidikan/${item.id}`)}>
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
        text='Apakah anda yakin ingin menghapus jenjang pendidikan ini?'
      />
    </Box>
  );
}

export default JenjangPendidikan;
