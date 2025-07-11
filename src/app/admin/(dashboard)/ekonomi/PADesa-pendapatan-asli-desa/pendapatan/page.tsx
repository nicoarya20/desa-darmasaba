'use client'
import colors from '@/con/colors';
import { Box, Button, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconEdit, IconSearch, IconTrash } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import { ModalKonfirmasiHapus } from '../../../_com/modalKonfirmasiHapus';
import PendapatanAsliDesa from '../../../_state/ekonomi/PADesa';
import HeaderSearch from '../../../_com/header';
import JudulList from '../../../_com/judulList';


function Pendapatan() {
  const [search, setSearch] = useState("");
  return (
    <Box>
      <HeaderSearch
        title='Pendapatan'
        placeholder='pencarian'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListPendapatan search={search} />
    </Box>
  );
}

function ListPendapatan({ search }: { search: string }) {
  const pendapatanState = useProxy(PendapatanAsliDesa.pendapatan)
  const router = useRouter();
  const [modalHapus, setModalHapus] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  
  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };
  

  const handleDelete = () => {
    if (selectedId) {
      pendapatanState.delete.byId(selectedId)
      setModalHapus(false)
      setSelectedId(null)
      pendapatanState.findMany.load()
    }
  }

  useShallowEffect(() => {
    pendapatanState.findMany.load();
  }, [])

  const filteredData = (pendapatanState.findMany.data || []).filter(item => {
    const keyword = search.toLowerCase();
    return (
      item.name.toLowerCase().includes(keyword) ||
      item.value.toString().toLowerCase().includes(keyword)
    );
  });

  if (!pendapatanState.findMany.data) {
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
          title='List Pendapatan'
          href='/admin/ekonomi/PADesa-pendapatan-asli-desa/pendapatan/create'
        />
        <Table striped withTableBorder withRowBorders>
          <TableThead>
            <TableTr>
              <TableTh>Nama</TableTh>
              <TableTh>Nilai</TableTh>
              <TableTh>Edit</TableTh>
              <TableTh>Delete</TableTh>
            </TableTr>
          </TableThead>
          <TableTbody>
            {filteredData.map((item) => (
              <TableTr key={item.id}>
                <TableTd>{item.name}</TableTd>
                <TableTd>{formatRupiah(item.value)}</TableTd>
                <TableTd>
                  <Button color='green' onClick={() => router.push(`/admin/ekonomi/PADesa-pendapatan-asli-desa/pendapatan/${item.id}`)}>
                    <IconEdit size={20} />
                  </Button>
                </TableTd>
                <TableTd>
                  <Button
                    color='red'
                    disabled={pendapatanState.delete.loading}
                    onClick={() => {
                      setSelectedId(item.id)
                      setModalHapus(true)
                    }}>
                    <IconTrash size={20} />
                  </Button>
                </TableTd>
              </TableTr>
            ))}
            <TableTr>
              <TableTd colSpan={4}>
                <Text fw={'bold'}>Total</Text>
              </TableTd>
              <TableTd>
                {formatRupiah(pendapatanState.findMany.data.reduce((total, item) => total + item.value, 0))}
              </TableTd>
            </TableTr>
          </TableTbody>
        </Table>
      </Paper>

      {/* Modal Konfirmasi Hapus */}
      <ModalKonfirmasiHapus
        opened={modalHapus}
        onClose={() => setModalHapus(false)}
        onConfirm={handleDelete}
        text='Apakah anda yakin ingin menghapus pendapatan ini?'
      />
    </Box>
  );
}

export default Pendapatan;
