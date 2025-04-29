'use client'
import stateJadwalKegiatan from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/jadwalKegiatan';
import { Box, Button, SimpleGrid, Skeleton, Stack, Text, Title } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { useProxy } from 'valtio/utils';
import DeskripsiKegiatan from './deskripsi_kegiatan/page';
import DokumenYangDiperlukan from './dokumen_yang_diperlukan/page';
import InformasiKegiatan from './informasi_kegiatan/page';
import LayananTersedia from './layanan_yang_tersedia/page';
import Pendaftaran from './pendaftaran/page';
import SyaratDanKetentuan from './syarat_dan_ketentuan/page';

function JadwalKegiatan() {
  const allState = useProxy(stateJadwalKegiatan)
  const submitAllForms = () => {

    if (allState.informasiKegiatan.create.form.name &&
      allState.informasiKegiatan.create.form.tanggal &&
      allState.informasiKegiatan.create.form.waktu &&
      allState.informasiKegiatan.create.form.lokasi) {
      allState.informasiKegiatan.create.create()
    }
    if (allState.deskripsiKegiatan.create.form.deskripsi) {
      allState.deskripsiKegiatan.create.create();
    }

    if (allState.layanantersedia.create.form.content) {
      allState.layanantersedia.create.create();
    }

    if (allState.syaratketentuan.create.form.content) {
      allState.syaratketentuan.create.create();
    }

    if (allState.dokumenjadwalkegiatan.create.form.content) {
      allState.dokumenjadwalkegiatan.create.create();
    }

    if (allState.pendaftaranjadwal.create.form.name &&
      allState.pendaftaranjadwal.create.form.tanggal &&
      allState.pendaftaranjadwal.create.form.namaOrangtua &&
      allState.pendaftaranjadwal.create.form.nomor &&
      allState.pendaftaranjadwal.create.form.alamat &&
      allState.pendaftaranjadwal.create.form.catatan
    ) {
      allState.pendaftaranjadwal.create.create();
    }
  }


  return (
    <Stack py={10}>
      <SimpleGrid cols={{
        base: 1, md: 2
      }}>
        <Box>
          <Title order={3}>Jadwal Kegiatan</Title>
          <InformasiKegiatan />
          <DeskripsiKegiatan />
          <LayananTersedia />
          <SyaratDanKetentuan />
          <DokumenYangDiperlukan />
          <Pendaftaran />
          <Button onClick={submitAllForms}>
            Submit
          </Button>
        </Box>

        <Box>
          <Title order={3}>List Jadwal Kegiatan</Title>
          <AllList />
        </Box>
      </SimpleGrid>
    </Stack>
  );
}

function AllList() {
  const allList = useProxy(stateJadwalKegiatan)

  useShallowEffect(() => {
    allList.informasiKegiatan.findMany.load()
    allList.deskripsiKegiatan.findMany.load()
    allList.layanantersedia.findMany.load()
    allList.syaratketentuan.findMany.load()
    allList.dokumenjadwalkegiatan.findMany.load()
  })

  const isLoading = !allList.informasiKegiatan.findMany.data ||
    !allList.deskripsiKegiatan.findMany.data ||
    !allList.layanantersedia.findMany.data ||
    !allList.syaratketentuan.findMany.data ||
    !allList.dokumenjadwalkegiatan.findMany.data

  if (isLoading) {
    return (
      <Stack>
        <Title order={4}>Informasi Kegiatan</Title>
        {Array.from({ length: 10 }).map((_, k) => <Skeleton key={k} h={40} />)}
      </Stack>
    );
  }
  return (
    <Stack>
      <Title order={4}>Informasi Kegiatan</Title>
      {allList.informasiKegiatan.findMany.data?.map((item) => {
        return (
          <Box key={item.id}>
            <Text>{item.name}</Text>
            <Text>{item.tanggal}</Text>
            <Text>{item.waktu}</Text>
            <Text>{item.lokasi}</Text>
          </Box>
        )
      })}

      <Title order={4}>Deskripsi Kegiatan</Title>
      {allList.deskripsiKegiatan.findMany.data?.map((item) => {
        return (
          <Box key={item.id}>
            <Text dangerouslySetInnerHTML={{ __html: item.deskripsi }} />
          </Box>
        )
      })}

      <Title order={4}>Layanan Yang Tersedia</Title>
      {allList.layanantersedia.findMany.data?.map((item) => {
        return (
          <Box key={item.id}>
            <Text dangerouslySetInnerHTML={{ __html: item.content }} />
          </Box>
        )
      })}

      <Title order={4}>Syarat dan Ketentuan</Title>
      {allList.syaratketentuan.findMany.data?.map((item) => {
        return (
          <Box key={item.id}>
            <Text dangerouslySetInnerHTML={{ __html: item.content }} />
          </Box>
        )
      })}

      <Title order={4}>Dokumen Yang Diperlukan</Title>
      {allList.dokumenjadwalkegiatan.findMany.data?.map((item) => {
        return (
          <Box key={item.id}>
            <Text dangerouslySetInnerHTML={{ __html: item.content }} />
          </Box>
        )
      })}

      <Title order={4}>Pendaftaran</Title>
      {allList.pendaftaranjadwal.findMany.data?.map((item) => {
        return (
          <Box key={item.id}>
            <Text>{item.name}</Text>
            <Text>{item.tanggal}</Text>
            <Text>{item.namaOrangtua}</Text>
            <Text>{item.nomor}</Text>
            <Text>{item.alamat}</Text>
            <Text>{item.catatan}</Text>
          </Box>
        )
      })}
    </Stack>
  )
}


export default JadwalKegiatan;
