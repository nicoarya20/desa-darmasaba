'use client'
import stateJadwalKegiatan from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/jadwalKegiatan';
import { Box, Text, Textarea, TextInput } from '@mantine/core';
import { useProxy } from 'valtio/utils';

function Pendaftaran() {
    const pendaftaran = useProxy(stateJadwalKegiatan.pendaftaranjadwal)

  return (
    <Box>
      <Text pt={10} fw={"bold"}>Pendaftaran</Text>
      <TextInput
      label='Nama Balita'
      placeholder='Masukkan nama balita'
      onChange={(val) => {
        pendaftaran.create.form.name = val.target.value
      }}
      />
      <TextInput
      label='Tanggal'
      placeholder='Masukkan tanggal'
      onChange={(val) => {
        pendaftaran.create.form.tanggal = val.target.value
      }}
      />
      <TextInput
      label='Nama Orang Tua / Wali'
      placeholder='Masukkan nama orang tua / wali'
      onChange={(val) => {
        pendaftaran.create.form.namaOrangtua = val.target.value
      }}
      />
      <TextInput
      label='No. Telepon'
      placeholder='Masukkan no. telepon'
      onChange={(val) => {
        pendaftaran.create.form.nomor = val.target.value
      }}
      />
      <TextInput
      label='Alamat'
      placeholder='Masukkan alamat'
      onChange={(val) => {
        pendaftaran.create.form.alamat = val.target.value
      }}
      />
      <Textarea
      label='Catatan Khusus (Opsional)'
      placeholder='Masukkan catatan khusus'
      onChange={(val) => {
        pendaftaran.create.form.catatan = val.target.value
      }}
      />
    </Box>
  );
}

export default Pendaftaran;
