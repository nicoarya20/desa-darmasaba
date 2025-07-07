'use client'
import JudulListTab from '@/app/admin/(dashboard)/_com/jusulListTab';
import colors from '@/con/colors';
import { Box, Button, Image, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text } from '@mantine/core';
import { IconDeviceImac, IconSearch } from '@tabler/icons-react';
import { useProxy } from 'valtio/utils';
import stateLayananDesa from '../../../_state/desa/layananDesa';
import { useShallowEffect } from '@mantine/hooks';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import HeaderSearch from '../../../_com/header';

function SuratKeterangan() {
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
      <ListSuratKeterangan search={search} />
    </Box>
  );
}

function ListSuratKeterangan({ search }: { search: string }) {
  const suratKeteranganState = useProxy(stateLayananDesa.suratKeterangan)
  const router = useRouter()

  useShallowEffect(() => {
    suratKeteranganState.findMany.load()
  }, [])

  const filteredData = (suratKeteranganState.findMany.data || []).filter(item => {
    const keyword = search.toLowerCase();
    return (
      item.name.toLowerCase().includes(keyword) ||
      item.deskripsi.toLowerCase().includes(keyword)
    );
  });

  if (!suratKeteranganState.findMany.data) {
    return (
      <Stack py={10}>
        <Skeleton h={500} />
      </Stack>
    )
  }

  return (
    <Box py={10}>
      <Paper bg={colors['white-1']} p={'md'}>
        <JudulListTab
          title='List Surat Keterangan'
          href='/admin/desa/layanan/pelayanan_surat_keterangan/create'
          placeholder='pencarian'
          searchIcon={<IconSearch size={16} />}
        />
        <Table striped withTableBorder withRowBorders>
          <TableThead>
            <TableTr>
              <TableTh>Nama</TableTh>
              <TableTh>Deskripsi</TableTh>
              <TableTh>Image</TableTh>
              <TableTh>Detail</TableTh>
            </TableTr>
          </TableThead>
          <TableTbody>
            {filteredData.map((item) => (
              <TableTr key={item.id}>
                <TableTd>{item.name}</TableTd>
                <TableTd>
                  <Text truncate="end" fz={"sm"} dangerouslySetInnerHTML={{ __html: item.deskripsi }} />
                </TableTd>
                <TableTd>
                  <Image w={100} src={item.image?.link} alt="gambar" />
                </TableTd>  
                <TableTd>
                  <Text>
                    <Button onClick={() => router.push(`/admin/desa/layanan/pelayanan_surat_keterangan/${item.id}`)}>
                    <IconDeviceImac size={20} />
                  </Button>
                </Text>
              </TableTd>
            </TableTr>
          ))}
          </TableTbody>
        </Table>
      </Paper>
    </Box>
  );
}

export default SuratKeterangan;
