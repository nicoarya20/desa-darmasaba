/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import pendaftaranJadwalKegiatanState from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/pendafataranJadwalKegiatan';
import colors from '@/con/colors';
import { Button, Divider, Stack, Text, Textarea, TextInput, Title } from '@mantine/core';
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
      <Title order={2} ta="left">Formulir Pendaftaran</Title>
      <Divider />
      <Stack gap="md">
        <TextInput
          label="Nama Peserta"
          placeholder="Masukkan nama peserta"
          size="md" 
          value={stateCreate.create.form.name}
          onChange={(e) => stateCreate.create.form.name = e.target.value}
          styles={{
            label: { fontSize: '14px', lineHeight: 1.4, fontWeight: 500 },
            input: { fontSize: '16px', lineHeight: 1.5 },
          }}
        />
        <TextInput
          type='date'
          label="Tanggal Lahir"
          placeholder="dd/mm/yyyy"
          size="md"
          w={{ base: '100%', md: '85%', lg: '75%', xl: '50%' }}
          value={stateCreate.create.form.tanggal}
          onChange={(e) => stateCreate.create.form.tanggal = e.target.value}
          styles={{
            label: { fontSize: '14px', lineHeight: 1.4, fontWeight: 500 },
            input: { fontSize: '16px', lineHeight: 1.5 },
          }}
        />
        <TextInput 
          label="Nama Orang Tua / Wali" 
          placeholder="Masukkan nama orang tua / wali" 
          size="md" 
          value={stateCreate.create.form.namaOrangtua}
          onChange={(e) => stateCreate.create.form.namaOrangtua = e.target.value}
          styles={{
            label: { fontSize: '14px', lineHeight: 1.4, fontWeight: 500 },
            input: { fontSize: '16px', lineHeight: 1.5 },
          }}
        />
        <TextInput
          label="Nomor Telepon"
          placeholder="Masukkan nomor telepon"
          size="md"
          inputMode="numeric"
          maxLength={13}
          value={stateCreate.create.form.nomor}
          onChange={(e) => stateCreate.create.form.nomor = e.target.value.replace(/\D/g, '').slice(0, 13)}
          styles={{
            label: { fontSize: '14px', lineHeight: 1.4, fontWeight: 500 },
            input: { fontSize: '16px', lineHeight: 1.5 },
          }}
        />
        <TextInput 
          label="Alamat" 
          placeholder="Masukkan alamat lengkap" 
          size="md" 
          value={stateCreate.create.form.alamat}
          onChange={(e) => stateCreate.create.form.alamat = e.target.value}
          styles={{
            label: { fontSize: '14px', lineHeight: 1.4, fontWeight: 500 },
            input: { fontSize: '16px', lineHeight: 1.5 },
          }}
        />
        <Textarea 
          label="Catatan Khusus (Opsional)" 
          placeholder="Masukkan catatan jika ada" 
          size="md" 
          value={stateCreate.create.form.catatan}
          onChange={(e) => stateCreate.create.form.catatan = e.target.value}
          styles={{
            label: { fontSize: '14px', lineHeight: 1.4, fontWeight: 500 },
            input: { fontSize: '16px', lineHeight: 1.5 },
          }}
        />
        <Button size="md" radius="lg" bg={colors['blue-button']} onClick={handleSubmit}>
          <Text fz={{ base: 'sm', md: 'md' }} fw={600} c="white">
            Daftar Sekarang
          </Text>
        </Button>
      </Stack>
    </Stack>
  );
}

export default CreatePendaftaran;