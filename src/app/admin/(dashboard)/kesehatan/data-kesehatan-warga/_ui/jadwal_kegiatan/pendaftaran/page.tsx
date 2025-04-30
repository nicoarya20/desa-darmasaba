'use client'
import stateJadwalKegiatan from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/jadwalKegiatan';
import { ActionIcon, Box, Text, Textarea, TextInput } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { IconCalendar } from '@tabler/icons-react';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';

function Pendaftaran() {
    const pendaftaran = useProxy(stateJadwalKegiatan.pendaftaranjadwal)
    const [dateInputOpened, setDateInputOpened] = useState(false);
    const pickerControl = (
      <ActionIcon onClick={() => setDateInputOpened(true)} variant="subtle" color="gray">
        <IconCalendar size={18} />
      </ActionIcon>
    );

    const formatDate = (date: Date | null): string => { if (!date) return ""; return date.toISOString().split('T')[0]; }

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
      <DateInput
      clearable defaultValue={new Date()}
      styles={{label: {fontSize: '14px'}}}
      label='Tanggal Lahir'
      placeholder='dd/mm/yyyy'
      value={pendaftaran.create.form.tanggal ? new Date(pendaftaran.create.form.tanggal) : null}
      popoverProps={{opened: dateInputOpened, onChange: setDateInputOpened}}
      rightSection={pickerControl}
      onChange={(val) => {
        pendaftaran.create.form.tanggal = formatDate(val);
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
