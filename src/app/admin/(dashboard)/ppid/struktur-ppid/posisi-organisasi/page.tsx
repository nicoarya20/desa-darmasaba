/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import colors from '@/con/colors';
import { Box, Button, Center, Pagination, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text } from '@mantine/core';
import { IconEdit, IconSearch, IconTrash } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../../_com/header';
import JudulList from '../../../_com/judulList';
import { ModalKonfirmasiHapus } from '../../../_com/modalKonfirmasiHapus';
import stateStrukturPPID from '../../../_state/ppid/struktur_ppid/struktur_PPID';

function PosisiOrganisasiPPID() {
  const [search, setSearch] = useState("");
  return (
    <Box>
      <HeaderSearch
        title='Posisi Organisasi PPID'
        placeholder='pencarian'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListPosisiOrganisasiPPID search={search} />
    </Box>
  );
}

function ListPosisiOrganisasiPPID({ search }: { search: string }) {
  const stateOrganisasi = useProxy(stateStrukturPPID.posisiOrganisasi)
  const router = useRouter();
  const [modalHapus, setModalHapus] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const {
    data,
    page,
    totalPages,
    loading,
    load,
  } = stateOrganisasi.findMany;

  useEffect(() => {
    load(page, 10, search);
  }, [page, search]);

  const handleHapus = async () => {
    if (selectedId) {
      await stateOrganisasi.delete.byId(selectedId);
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
          title='List Posisi Organisasi PPID'
          href='/admin/ppid/struktur-ppid/posisi-organisasi/create'
        />
        <Box style={{ overflowY: 'auto', maxHeight: '400px' }}>
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
            <TableTbody >
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
                          router.push(`/admin/ppid/struktur-ppid/posisi-organisasi/${item.id}`);
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
      {/* Modal Hapus */}
      <ModalKonfirmasiHapus
        opened={modalHapus}
        onClose={() => setModalHapus(false)}
        onConfirm={handleHapus}
        text="Apakah anda yakin ingin menghapus posisi organisasi PPID ini?"
      />
    </Box>
  );
}

export default PosisiOrganisasiPPID;
