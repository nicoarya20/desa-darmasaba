'use client'
import stateDaftarInformasiPublik from '@/app/admin/(dashboard)/_state/ppid/daftar_informasi_publik/daftarInformasiPublik';
import colors from '@/con/colors';
import { Box, Center, Image, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text, TextInput } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconSearch } from '@tabler/icons-react';
import { useProxy } from 'valtio/utils';
import BackButton from '../../desa/layanan/_com/BackButto';

function Page() {
  const listData = useProxy(stateDaftarInformasiPublik.daftarInformasi)
  useShallowEffect(() => {
    listData.findMany.load()
  }, [])
  if (!listData.findMany.data) return <Stack pos={"relative"} bg={colors.Bg} py={"xl"} gap={"22"}>
    <Box px={{ base: 'md', md: 100 }}>
      <Skeleton h={40} />
    </Box>
    <Skeleton h={40}/>
    <Skeleton h={40}/>
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
              </TableTr>
            </TableThead>
            <TableTbody bg={colors['white-1']}>
              {listData.findMany.data?.map((item) => (
                <TableTr key={item.id}>
                  <TableTd ta={'center'}>{item.nomor}</TableTd>
                  <TableTd>{item.jenisInformasi}</TableTd>
                  <TableTd dangerouslySetInnerHTML={{ __html: item.deskripsi }}></TableTd>
                  <TableTd>{item.tanggal}</TableTd>
                </TableTr>
              ))}
            </TableTbody>
          </Table>
        </Stack>
        <Text pt={20} fz={'h4'} fw={"bold"}>Kontak PPID</Text>
        <Text fz={'sm'}>Email: ppid@desadarmasaba.id  |  WhatsApp: 081-xxx-xxx-xxx</Text>
      </Box>
    </Stack>
  );
}

export default Page;
