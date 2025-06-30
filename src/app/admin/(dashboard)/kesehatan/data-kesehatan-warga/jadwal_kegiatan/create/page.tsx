'use client'
import CreateEditor from '@/app/admin/(dashboard)/_com/createEditor';
import jadwalKegiatanState from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/jadwalKegiatan';
import colors from '@/con/colors';
import { Box, Button, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';


function CreateJadwalKegiatan() {
  const stateJadwalKegiatan = useProxy(jadwalKegiatanState)
  const router = useRouter();


  const resetForm = () => {
    stateJadwalKegiatan.edit.form = {
      content: "",
      informasiJadwalKegiatan: {
        name: "",
        tanggal: "",
        waktu: "",
        lokasi: "",
      },
      deskripsiJadwalKegiatan: {
        deskripsi: "",
      },
      layananJadwalKegiatan: {
        content: "",
      },
      syaratKetentuanJadwalKegiatan: {
        content: "",
      },
      dokumenJadwalKegiatan: {
        content: "",
      },
      pendaftaranJadwalKegiatan: {
        name: "",
        tanggal: "",
        namaOrangtua: "",
        nomor: "",
        alamat: "",
        catatan: "",
      },
    };
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await stateJadwalKegiatan.create.submit();

    toast.success("Data berhasil disimpan");
    resetForm();
    // After successful submission, redirect to the list page
    router.push('/admin/kesehatan/data-kesehatan-warga/jadwal_kegiatan');
  }

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Box mb={10}>
        <Button variant="subtle" onClick={() => router.back()}>
          <IconArrowBack color={colors['blue-button']} size={25} />
        </Button>
      </Box>

      <Paper bg={colors['white-1']} p="md" w={{ base: '100%', md: '50%' }}>
        <Stack gap="xs">
          <Title order={3}>Create Jadwal Kegiatan</Title>
          <TextInput
            label={<Text fz="sm" fw="bold">Nama Jadwal Kegiatan</Text>}
            placeholder="masukkan nama jadwal kegiatan"
            value={stateJadwalKegiatan.create.form.content}
            onChange={(e) => {
              stateJadwalKegiatan.create.form.content = e.target.value;
            }}
          />
         <Box>
         <Text fz="sm" fw="bold">Deskripsi Jadwal Kegiatan</Text>
          <CreateEditor
            value={stateJadwalKegiatan.create.form.deskripsiJadwalKegiatan.deskripsi}
            onChange={(e) => {
              stateJadwalKegiatan.create.form.deskripsiJadwalKegiatan.deskripsi = e;
            }}
          />
         </Box>
          <Box>
            <Text fz="md" fw="bold">Informasi Jadwal Kegiatan</Text>
            <TextInput
              label={<Text fz="sm" fw="bold">Nama</Text>}
              placeholder="masukkan nama"
              value={stateJadwalKegiatan.create.form.informasiJadwalKegiatan.name}
              onChange={(e) => {
                stateJadwalKegiatan.create.form.informasiJadwalKegiatan.name = e.target.value;
              }}
            />
            <TextInput
              label={<Text fz="sm" fw="bold">Tanggal</Text>}
              placeholder="masukkan tanggal"
              value={stateJadwalKegiatan.create.form.informasiJadwalKegiatan.tanggal}
              onChange={(e) => {
                stateJadwalKegiatan.create.form.informasiJadwalKegiatan.tanggal = e.target.value;
              }}
            />
            <TextInput
              label={<Text fz="sm" fw="bold">Waktu</Text>}
              placeholder="masukkan waktu"
              value={stateJadwalKegiatan.create.form.informasiJadwalKegiatan.waktu}
              onChange={(e) => {
                stateJadwalKegiatan.create.form.informasiJadwalKegiatan.waktu = e.target.value;
              }}
            />
            <TextInput
              label={<Text fz="sm" fw="bold">Lokasi</Text>}
              placeholder="masukkan lokasi"
              value={stateJadwalKegiatan.create.form.informasiJadwalKegiatan.lokasi}
              onChange={(e) => {
                stateJadwalKegiatan.create.form.informasiJadwalKegiatan.lokasi = e.target.value;
              }}
            />
          </Box>
          <Box>
            <Text fz="md" fw="bold">Layanan Jadwal Kegiatan</Text>
            <CreateEditor
              value={stateJadwalKegiatan.create.form.layananJadwalKegiatan.content}
              onChange={(e) => {
                stateJadwalKegiatan.create.form.layananJadwalKegiatan.content = e;
              }}
            />
          </Box>
          <Box>
            <Text fz="md" fw="bold">Syarat dan Ketentuan Jadwal Kegiatan</Text>
            <CreateEditor
              value={stateJadwalKegiatan.create.form.syaratKetentuanJadwalKegiatan.content}
              onChange={(e) => {
                stateJadwalKegiatan.create.form.syaratKetentuanJadwalKegiatan.content = e;
              }}
            />
          </Box>
          <Box>
            <Text fz="md" fw="bold">Dokumen Jadwal Kegiatan</Text>
            <CreateEditor
              value={stateJadwalKegiatan.create.form.dokumenJadwalKegiatan.content}
              onChange={(e) => {
                stateJadwalKegiatan.create.form.dokumenJadwalKegiatan.content = e;
              }}
            />
          </Box>
          <Box>
            <Text fz="md" fw="bold">Pendaftaran Jadwal Kegiatan</Text>
            <TextInput
              label={<Text fz="sm" fw="bold">Nama</Text>}
              placeholder="masukkan nama"
              value={stateJadwalKegiatan.create.form.pendaftaranJadwalKegiatan.name}
              onChange={(e) => {
                stateJadwalKegiatan.create.form.pendaftaranJadwalKegiatan.name = e.target.value;
              }}
            />
            <TextInput
              label={<Text fz="sm" fw="bold">Tanggal</Text>}
              placeholder="masukkan tanggal"
              value={stateJadwalKegiatan.create.form.pendaftaranJadwalKegiatan.tanggal}
              onChange={(e) => {
                stateJadwalKegiatan.create.form.pendaftaranJadwalKegiatan.tanggal = e.target.value;
              }}
            />
            <TextInput
              label={<Text fz="sm" fw="bold">Nama Orangtua</Text>}
              placeholder="masukkan nama orangtua"
              value={stateJadwalKegiatan.create.form.pendaftaranJadwalKegiatan.namaOrangtua}
              onChange={(e) => {
                stateJadwalKegiatan.create.form.pendaftaranJadwalKegiatan.namaOrangtua = e.target.value;
              }}
            />
            <TextInput
              label={<Text fz="sm" fw="bold">Nomor</Text>}
              placeholder="masukkan nomor"
              value={stateJadwalKegiatan.create.form.pendaftaranJadwalKegiatan.nomor}
              onChange={(e) => {
                stateJadwalKegiatan.create.form.pendaftaranJadwalKegiatan.nomor = e.target.value;
              }}
            />
            <TextInput
              label={<Text fz="sm" fw="bold">Alamat</Text>}
              placeholder="masukkan alamat"
              value={stateJadwalKegiatan.create.form.pendaftaranJadwalKegiatan.alamat}
              onChange={(e) => {
                stateJadwalKegiatan.create.form.pendaftaranJadwalKegiatan.alamat = e.target.value;
              }}
            />
            <TextInput
              label={<Text fz="sm" fw="bold">Catatan</Text>}
              placeholder="masukkan catatan"
              value={stateJadwalKegiatan.create.form.pendaftaranJadwalKegiatan.catatan}
              onChange={(e) => {
                stateJadwalKegiatan.create.form.pendaftaranJadwalKegiatan.catatan = e.target.value;
              }}
            />
          </Box>

          <Button onClick={handleSubmit} bg={colors['blue-button']}>
            Simpan
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}

export default CreateJadwalKegiatan;
