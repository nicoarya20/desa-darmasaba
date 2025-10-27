/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import pendaftaranJadwalKegiatanState from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/pendafataranJadwalKegiatan';
import colors from '@/con/colors';
import { Button, Divider, Stack, Text, Textarea, TextInput } from '@mantine/core';
import { useEffect } from 'react';
import { useProxy } from 'valtio/utils';

function CreatePendaftaran() {
  const stateCreate = useProxy(pendaftaranJadwalKegiatanState);


useEffect(() => {
    stateCreate.findMany.load();
  }, []);

  const resetForm = () => {
    stateCreate.create.form = {
      name: '',
      alamat: '',
      tanggal: '',
      namaOrangtua: '',
      nomor: '',
      catatan: '',
    };
  };

  const handleSubmit = async () => {
    await stateCreate.create.submit();
    resetForm();
  };

  return (
    <Stack gap="sm">
      <Text fz="lg" fw="bold">Formulir Pendaftaran</Text>
      <Divider />
      <Stack gap="md">
        <TextInput 
        label="Nama Balita" 
        placeholder="Masukkan nama balita" 
        size="md" 
        value={stateCreate.create.form.name}
        onChange={(e) => stateCreate.create.form.name = e.target.value}
        />
        <TextInput
          type='date'
          label="Tanggal Lahir"
          placeholder="dd/mm/yyyy"
          size="md"
          w={{ base: '100%', md: '85%', lg: '75%', xl: '50%' }}
          value={stateCreate.create.form.tanggal}
          onChange={(e) => stateCreate.create.form.tanggal = e.target.value}
        />
        <TextInput 
        label="Nama Orang Tua / Wali" 
        placeholder="Masukkan nama orang tua / wali" 
        size="md" 
        value={stateCreate.create.form.namaOrangtua}
        onChange={(e) => stateCreate.create.form.namaOrangtua = e.target.value}
        />
        <TextInput 
        label="Nomor Telepon" 
        placeholder="Masukkan nomor telepon" 
        size="md" 
        value={stateCreate.create.form.nomor}
        onChange={(e) => stateCreate.create.form.nomor = e.target.value}
        />
        <TextInput 
        label="Alamat" 
        placeholder="Masukkan alamat lengkap" 
        size="md" 
        value={stateCreate.create.form.alamat}
        onChange={(e) => stateCreate.create.form.alamat = e.target.value}
        />
        <Textarea 
        label="Catatan Khusus (Opsional)" 
        placeholder="Masukkan catatan jika ada" 
        size="md" 
        value={stateCreate.create.form.catatan}
        onChange={(e) => stateCreate.create.form.catatan = e.target.value}
        />
        <Button size="md" radius="lg" bg={colors['blue-button']} onClick={handleSubmit}>
          Daftar Sekarang
        </Button>
      </Stack>
    </Stack>
  );
}

export default CreatePendaftaran;
