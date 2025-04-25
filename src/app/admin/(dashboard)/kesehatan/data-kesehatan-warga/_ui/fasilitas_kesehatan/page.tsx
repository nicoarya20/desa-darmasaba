"use client"

import stateKesehatan from '@/app/admin/(dashboard)/_state/kesehatan/kesehatan';
import { Box, SimpleGrid, Skeleton, Stack, Text, Title } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { useProxy } from 'valtio/utils';
import DokterdanTenagaMedisList from './dokterdantenagamedis/listData';
import DokterDanTenagaMedis from './dokterdantenagamedis/page';
import FasilitasPendukungList from './fasilitas_pendukung/listData';
import FasilitasPendukung from './fasilitas_pendukung/page';
import InformasiUmum from './informasi_umum/page';
import LayananUnggulanList from './layanan_unggulan/layananUnggulanList';
import LayananUnggulan from './layanan_unggulan/page';
import ProsedurPendaftaran from './prosedurpendaftaran/page';
import TarifDanLayananList from './tarifdanlayanan/listData';
import TarifDanLayanan from './tarifdanlayanan/page';
import ListProsedurPendaftaran from './prosedurpendaftaran/listData';


function FasilitasKesehatan() {



  return (
    <Stack>
      <SimpleGrid cols={{
        base: 1, md: 2
      }}>
        <Box>
          <Stack gap={'xs'}>
            <Title order={3}>Fasilitas Kesehatan</Title>
            {/* Informasi Umum */}
            <InformasiUmum />
            {/* Layanan Unggulan */}
            <LayananUnggulan/>
            {/* Dokter & Tenaga Medis */}
            <DokterDanTenagaMedis/>
            {/* Fasilitas Pendukung */}
            <FasilitasPendukung/>
            {/* Tarif & Layanan */}
            <TarifDanLayanan/>
            {/* Prosedur Pendaftaran */}
            <ProsedurPendaftaran/>
          </Stack>
        </Box>

        <Box>
          <Stack gap={"xs"}>
          <Title order={3}>List Fasilitas Kesehatan</Title>
          <Title order={4}>Informasi Umum</Title>
          <InformasiUmumList/>
          <Title order={4}>Layanan Unggulan</Title>
          <LayananUnggulanList/>
          <Title order={4}>Dokter & Tenaga Medis</Title>
          <DokterdanTenagaMedisList/>
          <Title order={4}>Fasilitas Pendukung</Title>
          <FasilitasPendukungList/>
          <Title order={4}>Tarif & Layanan</Title>
          <TarifDanLayananList/>
          <Title order={4}>Prosedur Pendaftaran</Title>
          <ListProsedurPendaftaran/>
          </Stack>
        </Box>
      </SimpleGrid>

    </Stack>
  );
}

function InformasiUmumList(){
  const infromasiState = useProxy(stateKesehatan)
  useShallowEffect(() => {
    infromasiState.informasiumum.findMany.load()
  }, [])

  if (!infromasiState.informasiumum.findMany.data) return <Stack>
    {Array.from({ length: 10 }).map((v, k) => <Skeleton key={k} h={40} />)}
  </Stack>
  return <Stack>
    {infromasiState.informasiumum.findMany.data?.map((item) => (
      <Box key={item.id}>
        
        <Text>{item.fasilitas}</Text>
        <Text>{item.alamat}</Text>
        <Text>{item.jamOperasional}</Text>
      </Box>
    ))}
  </Stack>
}

export default FasilitasKesehatan;
