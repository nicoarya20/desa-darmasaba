'use client'

import daftarInformasiPublik from '@/app/admin/(dashboard)/_state/ppid/daftar_informasi_publik/daftarInformasiPublik';
import colors from '@/con/colors';
import { Box, Center, Image, Pagination, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text, TextInput } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconSearch } from '@tabler/icons-react';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import BackButton from '../../desa/layanan/_com/BackButto';

function Page() {
  const listData = useProxy(daftarInformasiPublik)
  const [search, setSearch] = useState('')

  const {
    data,
    page,
    totalPages,
    loading,
    load,
  } = listData.findMany


  useShallowEffect(() => {
    load(page, 5, search)
  }, [page, search])

  if (loading || !data) return <Stack pos={"relative"} bg={colors.Bg} py={"xl"} gap={"22"}>
    <Box px={{ base: 'md', md: 100 }}>
      <Skeleton h={40} />
    </Box>
    <Skeleton h={40} />
    <Skeleton h={40} />
    <Box px={{ base: 'md', md: 100 }}>
      <Skeleton h={40} />
    </Box>
  </Stack>
  return (
    <Stack pos={"relative"} bg={colors.Bg} py={"xl"} gap={"22"}>
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>
      <Center>
        <Image src={"/darmasaba-icon.png"} w={{ base: 70, md: 100 }} alt='' />
      </Center>
      <Text ta={"center"} fz={{ base: "h1", md: "2.5rem" }} c={colors["blue-button"]} fw={"bold"}>
        Daftar Informasi Publik Desa Darmasaba
      </Text>
      <Box px={{ base: "md", md: 100 }}>
        <Stack gap={'lmd'}>
          <Text fz={{ base: 'h3', md: 'h2' }} fw={"bold"}>Tentang Informasi Publik</Text>
          <Text fz={{ base: 'md', md: 'h3' }}>Daftar Informasi Publik Desa Darmasaba berupa kumpulan data yang dapat diakses oleh masyarakat sesuai dengan peraturan yang berlaku.</Text>
          <TextInput
            placeholder='Cari Informasi...'
            leftSection={<IconSearch size={20} />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ marginBottom: 16 }}
          />
          <Table withRowBorders withColumnBorders withTableBorder>
            <TableThead bg={colors['blue-button']}>
              <TableTr c={colors['white-1']}>
                <TableTh ta={'center'}>No</TableTh>
                <TableTh ta={'center'}>Jenis Informasi</TableTh>
                <TableTh ta={'center'}>Deskripsi</TableTh>
                <TableTh ta={'center'}>Tanggal Publikasi</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody bg={colors['white-1']}>
              {listData.findMany.data?.map((item, index) => (
                <TableTr key={item.id}>
                  <TableTd ta={'center'}>{index + 1}</TableTd>
                  <TableTd>
                    <Text fz={'md'}>
                      {item.jenisInformasi}
                    </Text>
                  </TableTd>
                  <TableTd>
                    <Text
                      fz={'md'}
                      dangerouslySetInnerHTML={{ __html: item.deskripsi }}
                    />
                  </TableTd>
                  <TableTd style={{ width: '20%', textAlign: 'center' }}>{item.tanggal
                    ? new Date(item.tanggal).toLocaleDateString('id-ID')
                    : '-'}</TableTd>
                </TableTr>
              ))}
            </TableTbody>
          </Table>
        </Stack>
        <Center>
          <Pagination
            value={page}
            onChange={(newPage) => load(newPage)}
            total={totalPages}
            my={"md"}
          />
        </Center>
        <Text pt={20} fz={'h4'} fw={"bold"}>Kontak PPID</Text>
        <Text fz={'sm'}>Email: ppid@desadarmasaba.id  |  WhatsApp: 081-xxx-xxx-xxx</Text>
      </Box>
    </Stack>
  );
}

export default Page;
