'use client'
import colors from '@/con/colors';
import { Box, Button, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconEdit, IconSearch, IconTrash } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../../_com/header';
import JudulList from '../../../_com/judulList';
import strukturorganisasiState from '../../../_state/ekonomi/struktur-organisasi/struktur-organisasi';
import { useState } from 'react';
import { ModalKonfirmasiHapus } from '../../../_com/modalKonfirmasiHapus';

function HubunganOrganisasi() {
  return (
    <Box>
      <HeaderSearch
        title='Hubungan Organisasi'
        placeholder='pencarian'
        searchIcon={<IconSearch size={20} />}
      />
      <ListHubunganOrganisasi />
    </Box>
  );
}

function ListHubunganOrganisasi() {
  const stateOrganisasi = useProxy(strukturorganisasiState.hubunganOrganisasi);
  const [modalHapus, setModalHapus] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  // const params = useParams()
  const router = useRouter()

  useShallowEffect(() => {
    stateOrganisasi.findMany.load()
  }, [])

  const handleHapus = () => {
    if (selectedId) {
      stateOrganisasi.delete.byId(selectedId)
      setModalHapus(false)
      setSelectedId(null)
    }
  }

  if (!stateOrganisasi.findMany.data) {
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
          title='List Hubungan Organisasi'
          href='/admin/ekonomi/struktur-organisasi-dan-sk-pengurus-bumdesa/hubungan-organisasi/create'
        />
        <Table striped withTableBorder withRowBorders>
          <TableThead>
            <TableTr>
              <TableTh>Atasan</TableTh>
              <TableTh>Bawahan</TableTh>
              <TableTh>Tipe</TableTh>
              <TableTh>Edit</TableTh>
              <TableTh>Hapus</TableTh>
            </TableTr>
          </TableThead>
          <TableTbody>
            {([...stateOrganisasi.findMany.data || []]
              .sort((a, b) => {
                return a.atasan?.namaLengkap.localeCompare(b.atasan?.namaLengkap); // kalau status sama, urut nama
              }) // Aktif di atas
            ).map((item) => (
              <TableTr key={item.id}>
                <TableTd>{item.atasan?.namaLengkap}</TableTd>
                <TableTd>{item.bawahan?.namaLengkap}</TableTd>
                <TableTd>{item.tipe}</TableTd>
                <TableTd>
                  <Button bg={"green"} onClick={() => router.push(`/admin/ekonomi/struktur-organisasi-dan-sk-pengurus-bumdesa/hubungan-organisasi/${item.id}`)}>
                    <IconEdit size={25} />
                  </Button>
                </TableTd>
                <TableTd>
                  <Button color="red" onClick={() => {
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
      </Paper>
      {/* Modal Konfirmasi Hapus */}
      <ModalKonfirmasiHapus
        opened={modalHapus}
        onClose={() => setModalHapus(false)}
        onConfirm={handleHapus}
        text='Apakah anda yakin ingin menghapus hubungan organisasi ini?'
      />
    </Box>
  );
}

export default HubunganOrganisasi;
