"use client"

import stateFasilitasKesehatan from '@/app/admin/(dashboard)/_state/kesehatan/fasilitasKesehatan';
import colors from '@/con/colors';
import { Box, Button, Center, SimpleGrid, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text, Title } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { useProxy } from 'valtio/utils';
import DokterDanTenagaMedis from './dokterdantenagamedis/page';
import FasilitasPendukung from './fasilitas_pendukung/page';
import InformasiUmum from './informasi_umum/page';
import LayananUnggulan from './layanan_unggulan/page';
import ProsedurPendaftaran from './prosedurpendaftaran/page';
import TarifDanLayanan from './tarifdanlayanan/page';


function FasilitasKesehatan() {
  const allState = useProxy(stateFasilitasKesehatan)
  const submitAllForms = () => {
    if (allState.informasiumum.create.form.fasilitas &&
      allState.informasiumum.create.form.alamat &&
      allState.informasiumum.create.form.jamOperasional) {
      allState.informasiumum.create.create()
    }

    if (allState.layananunggulan.create.form.content) {
      allState.layananunggulan.create.create();
    }

    if (allState.dokterdantenagamedis.create.form.name &&
      allState.dokterdantenagamedis.create.form.specialist &&
      allState.dokterdantenagamedis.create.form.jadwal) {
      allState.dokterdantenagamedis.create.create()
    }

    if (allState.fasilitaspendukung.create.form.content) {
      allState.fasilitaspendukung.create.create();
    }

    if (allState.tarifdanlayanan.create.form.tarif &&
      allState.tarifdanlayanan.create.form.layanan) {
      allState.tarifdanlayanan.create.create()
    }

    if (allState.prosedurpendaftaran.create.form.content) {
      allState.prosedurpendaftaran.create.create();
    }

    // refreshListData();
    // resetAllForms();
  }

  // const refreshListData = () => {
  //   allState.informasiumum.findMany.load();
  //   allState.layananunggulan.findMany.load();
  //   allState.dokterdantenagamedis.findMany.load();
  //   allState.fasilitaspendukung.findMany.load();
  //   allState.tarifdanlayanan.findMany.load();
  //   allState.prosedurpendaftaran.findMany.load();
  // }

  // const resetAllForms = () => {
  //   allState.informasiumum.create.form = {
  //     fasilitas: '',
  //     alamat: '',
  //     jamOperasional: ''
  //   };
  //   allState.layananunggulan.create.form = {
  //     content: ''
  //   };
  //   allState.dokterdantenagamedis.create.form = {
  //     name: '',
  //     specialist: '',
  //     jadwal: ''
  //   };
  //   allState.fasilitaspendukung.create.form = {
  //     content: ''
  //   };
  //   allState.tarifdanlayanan.create.form = {
  //     tarif: '',
  //     layanan: ''
  //   };
  //   allState.prosedurpendaftaran.create.form = {
  //     content: ''
  //   };
  // }

  return (
    <Stack py={10}>
      <SimpleGrid cols={{
        base: 1, md: 2
      }}>
        <Box>
          <Stack gap={'xs'}>
            <Title order={3}>Fasilitas Kesehatan</Title>
            {/* Informasi Umum */}
            <InformasiUmum />
            {/* Layanan Unggulan */}
            <LayananUnggulan />
            {/* Dokter & Tenaga Medis */}
            <DokterDanTenagaMedis />
            {/* Fasilitas Pendukung */}
            <FasilitasPendukung />
            {/* Tarif & Layanan */}
            <TarifDanLayanan />
            {/* Prosedur Pendaftaran */}
            <ProsedurPendaftaran />
            <Button onClick={submitAllForms}>Submit</Button>
          </Stack>
        </Box>

        <Box>
          <Stack gap={"xs"}>
            <Title order={3}>List Fasilitas Kesehatan</Title>
            <AllList />
          </Stack>
        </Box>
      </SimpleGrid>

    </Stack>
  );
}

function AllList() {
  const allListState = useProxy(stateFasilitasKesehatan)
  useShallowEffect(() => {
    allListState.informasiumum.findMany.load();
    allListState.layananunggulan.findMany.load();
    allListState.dokterdantenagamedis.findMany.load();
    allListState.fasilitaspendukung.findMany.load();
    allListState.tarifdanlayanan.findMany.load();
    allListState.prosedurpendaftaran.findMany.load();
  }, [])

  if (!allListState.informasiumum.findMany.data
    || !allListState.layananunggulan.findMany.data
    || !allListState.dokterdantenagamedis.findMany.data
    || !allListState.fasilitaspendukung.findMany.data
    || !allListState.tarifdanlayanan.findMany.data
    || !allListState.prosedurpendaftaran.findMany.data
  ) return <Stack>
    {Array.from({ length: 10 }).map((v, k) => <Skeleton key={k} h={40} />)}
  </Stack>
  return <Stack>
    <Title order={4}>Informasi Umum</Title>
    {allListState.informasiumum.findMany.data?.map((item) => (
      <Box key={item.id}>

        <Text>{item.fasilitas}</Text>
        <Text>{item.alamat}</Text>
        <Text>{item.jamOperasional}</Text>
      </Box>
    ))}

    <Title order={4}>Layanan Unggulan</Title>
    {allListState.layananunggulan.findMany.data?.map((item) => (
      <Box key={item.id}>
        <Text dangerouslySetInnerHTML={{ __html: item.content }} />
      </Box>
    ))}


    <Title order={4}>Dokter & Tenaga Medis</Title>
    
    <Table
      striped
      highlightOnHover
      withTableBorder
      withColumnBorders
      bg={colors['white-1']}
    >
      <TableThead >
        <TableTr >
          <TableTh >
            <Center>Nama</Center>
          </TableTh>
          <TableTh >
            <Center>Specialist</Center>
          </TableTh>
          <TableTh >
            <Center>Jadwal</Center>
          </TableTh>
        </TableTr>
      </TableThead>
      <TableTbody >
        {allListState.dokterdantenagamedis.findMany.data?.map((item) => (
          <TableTr key={item.id}>
            <TableTd ta="center">{item.name}</TableTd>
            <TableTd ta="center">Specialist {item.specialist}</TableTd>
            <TableTd ta="center">{item.jadwal}</TableTd>
          </TableTr>
        ))}
      </TableTbody>
    </Table>

    <Title order={4}>Fasilitas Pendukung</Title>
    {allListState.fasilitaspendukung.findMany.data?.map((item) => (
      <Box key={item.id}>
        <Text dangerouslySetInnerHTML={{ __html: item.content }} />
      </Box>
    ))}

    <Title order={4}>Tarif & Layanan</Title>
    <Table
      suppressHydrationWarning
      striped
      highlightOnHover
      withTableBorder
      withColumnBorders
      bg={colors['white-1']}
    >
      <TableThead>
        <TableTr>
          <TableTh>
            Layanan
          </TableTh>
          <TableTh>
            Tarif
          </TableTh>
        </TableTr>
      </TableThead>
      <TableTbody>
        {allListState.tarifdanlayanan.findMany.data?.map((item) => (
          <TableTr key={item.id}>
            <TableTd>{item.layanan}</TableTd>
            <TableTd>Rp.{item.tarif}</TableTd>
          </TableTr>
        ))}
      </TableTbody>
    </Table>

    <Title order={4}>Prosedur Pendaftaran</Title>
    {allListState.prosedurpendaftaran.findMany.data?.map((item) => (
      <Box key={item.id}>
        <Text dangerouslySetInnerHTML={{__html: item.content}}/>
      </Box>
    ))}

  </Stack>
}

export default FasilitasKesehatan;
