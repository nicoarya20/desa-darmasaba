'use client'
import { ActionIcon, Box, Text, Textarea, TextInput } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { IconCalendar } from '@tabler/icons-react';
import { useState } from 'react';

function Pendaftaran() {
    const [dateInputOpened, setDateInputOpened] = useState(false);
    const pickerControl = (
      <ActionIcon onClick={() => setDateInputOpened(true)} variant="subtle" color="gray">
        <IconCalendar size={18} />
      </ActionIcon>
    );
  return (
    <Box>
      <Text pt={10} fw={"bold"}>Pendaftaran</Text>
      <TextInput
      label='Nama Balita'
      placeholder='Masukkan nama balita'
      />
      <DateInput
      styles={{label: {fontSize: '14px'}}}
      label='Tanggal Lahir'
      placeholder='dd/mm/yyyy'
      popoverProps={{opened: dateInputOpened, onChange: setDateInputOpened}}
      rightSection={pickerControl}
      />
      <TextInput
      label='Nama Orang Tua / Wali'
      placeholder='Masukkan nama orang tua / wali'
      />
      <TextInput
      label='No. Telepon'
      placeholder='Masukkan no. telepon'
      />
      <TextInput
      label='Alamat'
      placeholder='Masukkan alamat'
      />
      <Textarea
      label='Catatan Khusus (Opsional)'
      placeholder='Masukkan catatan khusus'
      />
    </Box>
  );
}

export default Pendaftaran;
