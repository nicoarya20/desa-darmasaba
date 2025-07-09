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
import strukturorganisasiState from '../../../_state/ekonomi/struktur-organisasi/struktur-organisasi';

function PosisiOrganisasi() {
  const [search, setSearch] = useState("");
  return (
    <Box>
      <HeaderSearch
        title='Posisi Organisasi'
        placeholder='pencarian'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListPosisiOrganisasi search={search} />
    </Box>
  );
}

function ListPosisiOrganisasi({ search }: { search: string }) {
  const stateOrganisasi = useProxy(strukturorganisasiState.posisiOrganisasi)
  const router = useRouter();
  const [modalHapus, setModalHapus] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    stateOrganisasi.findMany.load()
  }, [])

  const handleHapus = async () => {
    if (selectedId) {
      await stateOrganisasi.delete.byId(selectedId);
      setModalHapus(false)
      setSelectedId(null)
    }
  }

  const filteredData = (stateOrganisasi.findMany.data || []).filter(item => {
    const keyword = search.toLowerCase();
    return (
      item.nama?.toLowerCase().includes(keyword) ||
      item.deskripsi?.toLowerCase().includes(keyword) ||
      item.hierarki?.toString().toLowerCase().includes(keyword)
    );
  });

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
          title='List Posisi Organisasi'
          href='/admin/ekonomi/struktur-organisasi-dan-sk-pengurus-bumdesa/posisi-organisasi/create'
        />
        <Table striped withTableBorder withRowBorders>
          <TableThead>
            <TableTr>
              <TableTh>Nama Posisi</TableTh>
              <TableTh>Deskripsi</TableTh>
              <TableTh>Hierarki</TableTh>
              <TableTh>Edit</TableTh>
              <TableTh>Hapus</TableTh>
            </TableTr>
          </TableThead>
          <TableTbody>
            {filteredData.map((item) => (
              <TableTr key={item.id}>
                <TableTd>{item.nama}</TableTd>
                <TableTd>
                  <Text truncate dangerouslySetInnerHTML={{ __html: item.deskripsi ?? "" }} />
                </TableTd>
                <TableTd>{item.hierarki}</TableTd>
                <TableTd>
                  <Button color="green" 
                   onClick={() => {
                    if (item) {
                      router.push(`/admin/ekonomi/struktur-organisasi-dan-sk-pengurus-bumdesa/posisi-organisasi/${item.id}`);
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
        text="Apakah anda yakin ingin menghapus posisi organisasi ini?"
      />
    </Box>
  );
}

export default PosisiOrganisasi;
