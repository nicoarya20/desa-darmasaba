import colors from '@/con/colors';
import { Stack, Box, Text, Center, Image, TextInput, TableTd, TableTr, TableTbody, TableTh, TableThead, Table, ActionIcon } from '@mantine/core';
import React from 'react';
import BackButton from '../../desa/layanan/_com/BackButto';
import { IconDownload, IconSearch } from '@tabler/icons-react';

const dataTable = [
  {
    id: 1,
    nomer: '1',
    jenis: "Peraturan Desa",
    deskripsi: "Dokumen yang berisi kebijakan dan regulasi desa",
    tanggal: "15 Januari 2024",
    unduh: <IconDownload size={20} />
  },
  {
    id: 2,
    nomer: '2',
    jenis: "Laporan Keuangan",
    deskripsi: "Laporan Kegunaan anggaran desa secara transparan",
    tanggal: "20 Januari 2024",
    unduh: <IconDownload size={20} />
  },
  {
    id: 3,
    nomer: '3',
    jenis: "Program & Kegiatan",
    deskripsi: "Informasi mengenai program pembangunan & kegiatan desa",
    tanggal: "30 Januari 2024",
    unduh: <IconDownload size={20} />
  },

]
function Page() {
  const rows = dataTable.map((element) => (
    <TableTr key={element.jenis}>
      <TableTd ta={'center'}>{element.nomer}</TableTd>
      <TableTd >{element.jenis}</TableTd>
      <TableTd>{element.deskripsi}</TableTd>
      <TableTd>{element.tanggal}</TableTd>
      <TableTd ta={'center'}>
        <ActionIcon c={colors['blue-button']} variant='transparent'>
          {element.unduh}
        </ActionIcon>
      </TableTd>
    </TableTr>
  ))
  return (
    <Stack pos={"relative"} bg={colors.Bg} py={"xl"} gap={"22"}>
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>
      <Center>
        <Image src={"/api/img/darmasaba-icon.png"} w={{ base: 70, md: 100 }} alt='' />
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
          />
          <Table withRowBorders withColumnBorders withTableBorder>
            <TableThead bg={colors['blue-button']}>
              <TableTr c={colors['white-1']}>
                <TableTh ta={'center'}>No</TableTh>
                <TableTh ta={'center'}>Jenis Informasi</TableTh>
                <TableTh ta={'center'}>Deskripsi</TableTh>
                <TableTh ta={'center'}>Tanggal Publikasi</TableTh>
                <TableTh ta={'center'}>Unduh</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody bg={colors['white-1']}>{rows}</TableTbody>
          </Table>
        </Stack>
        <Text pt={20} fz={'h4'} fw={"bold"}>Kontak PPID</Text>
        <Text fz={'sm'}>Email: ppid@desadarmasaba.id  |  WhatsApp: 081-xxx-xxx-xxx</Text>
      </Box>
    </Stack>
  );
}

export default Page;
