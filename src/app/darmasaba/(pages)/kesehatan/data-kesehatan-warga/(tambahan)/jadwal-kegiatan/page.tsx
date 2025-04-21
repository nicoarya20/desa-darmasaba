'use client'
import BackButton from '@/app/darmasaba/(pages)/desa/layanan/_com/BackButto';
import colors from '@/con/colors';
import { ActionIcon, Box, Button, CheckIcon, Combobox, ComboboxChevron, ComboboxOption, ComboboxOptions, ComboboxTarget, Divider, Group, InputBase, InputPlaceholder, List, ListItem, Paper, Stack, Text, Textarea, TextInput, useCombobox } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { IconCalendar } from '@tabler/icons-react';
import { useState } from 'react';

const layanan = [
  'Penimbangan',
  'Imunisasi',
  'Vitamin A',
  'Konsultasi Gizi',
  'Pemeriksaan Kesehatan'
];
function Page() {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
    onDropdownOpen: (eventSource) => {
      if (eventSource === 'keyboard') {
        combobox.selectActiveOption();
      } else {
        combobox.updateSelectedOptionIndex('active');
      }
    },
  });

  const [value, setValue] = useState<string | null>('');

  const options = layanan.map((item) => (
    <ComboboxOption value={item} key={item} active={item === value}>
      <Group gap="xs">
        {item === value && <CheckIcon size={12} />}
        <span>{item}</span>
      </Group>
    </ComboboxOption>
  ));
  const [dateInputOpened, setDateInputOpened] = useState(false);

  const pickerControl = (
    <ActionIcon onClick={() => setDateInputOpened(true)} variant="subtle" color="gray">
      <IconCalendar size={18} />
    </ActionIcon>
  );
  return (
    <Stack pos={"relative"} bg={colors.Bg} py={"xl"} gap={"22"}>
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>
      <Box px={{ base: "md", md: 100 }}>
        <Stack gap={'lg'}>
          <Paper radius={10}>
            <Box style={{ borderTopLeftRadius: 10, borderTopRightRadius: 10 }} bg={colors['blue-button']}>
              <Text p={'md'} fz={{ base: "h3", md: "h2" }} c={colors['white-1']} fw={"bold"}>
                Detail & Pendaftaran Kegiatan
              </Text>
            </Box>
            <Box p={'md'} >
              <Stack gap={'xs'}>
                {/* Informasi Kegiatan */}
                <Text fz={'h4'} fw={"bold"}>
                  Informasi Kegiatan
                </Text>
                <Divider />
                <Text fz={'h4'} fw={"bold"}>
                  Nama Kegiatan : <Text span fz={'h4'}>Posyandu Balita</Text>
                </Text>
                <Text fz={'h4'} fw={"bold"}>
                  Tanggal : <Text span fz={'h4'}>21 Februari 2025</Text>
                </Text>
                <Text fz={'h4'} fw={"bold"}>
                  Waktu : <Text span fz={'h4'}>08:00-12:00 WITA</Text>
                </Text>
                <Text pb={10} fz={'h4'} fw={"bold"}>
                  Lokasi : <Text span fz={'h4'}>Banjar Gulingan</Text>
                </Text>
                {/* Deskripsi Kegiatan */}
                <Text fz={'h4'} fw={"bold"}>
                  Deskripsi Kegiatan
                </Text>
                <Divider />
                <Text pb={10} ta={'justify'} fz={'h4'}>
                  Posyandu balita adalah program kesehatan rutin untuk memantau tumbuh kembang balita. Kegiatan ini meliputi penimbangan berat badan, pengukuran tinggi badan, pemeriksaan kesehatan dasar, imunisasi, dan konsultasi gizi.
                </Text>
                {/* Layanan Yang Tersedia */}
                <Text fz={'h4'} fw={"bold"}>
                  Layanan Yang Tersedia
                </Text>
                <Divider />
                <List pb={10}>
                  <ListItem fz={'h4'}>Penimbangan berat badan</ListItem>
                  <ListItem fz={'h4'}>Pengukuran tinggi badan</ListItem>
                  <ListItem fz={'h4'}>Imunisasi rutin</ListItem>
                  <ListItem fz={'h4'}>Pemberian vitamin A</ListItem>
                  <ListItem fz={'h4'}>Konsultasi pertumbuhan dan gizi</ListItem>
                  <ListItem fz={'h4'}>Pemeriksaan kesehatan dasar</ListItem>
                </List>
                {/* Syarat dan Ketentuan */}
                <Text fz={'h4'} fw={"bold"}>
                  Syarat dan Ketentuan
                </Text>
                <Divider />
                <List pb={10}>
                  <ListItem fz={'h4'}>Balita berusia 0-5 tahun</ListItem>
                  <ListItem fz={'h4'}>Membawa KMS (Kartu Menuju Sehat)</ListItem>
                  <ListItem fz={'h4'}>Membawa buku KIA (Kesehatan Ibu dan Anak)</ListItem>
                  <ListItem fz={'h4'}>Orang tua/wali wajib mendampingi</ListItem>
                  <ListItem fz={'h4'}>Balita dalam kondisi sehat (tidak demam)</ListItem>
                </List>
                {/* Dokumen yang Perlu Dibawa */}
                <Text fz={'h4'} fw={"bold"}>
                  Dokumen yang Perlu Dibawa
                </Text>
                <Divider />
                <List pb={10}>
                  <ListItem fz={'h4'}>KMS (Kartu Menuju Sehat)</ListItem>
                  <ListItem fz={'h4'}>Buku KIA (Kesehatan Ibu dan Anak)</ListItem>
                  <ListItem fz={'h4'}>KTP orang tua/wali</ListItem>
                  <ListItem fz={'h4'}>Kartu Keluarga</ListItem>
                  <ListItem fz={'h4'}>Kartu BPJS (jika ada)</ListItem>
                </List>
                {/* Pendaftaran */}
                <Text fz={'h4'} fw={"bold"}>
                  Pendaftaran
                </Text>
                <Divider />
                <Stack gap={'xs'} pb={20}>
                  <TextInput
                    styles={{ label: { fontSize: '16px', fontWeight: 'bold' }, }}
                    w={{ base: '100%', md: '85%', lg: '75%', xl: '50%' }}
                    label="Nama Balita"
                    placeholder='Masukkan nama balita'
                  />
                  <DateInput
                    styles={{ label: { fontSize: '16px', fontWeight: 'bold' }, }}
                    placeholder='dd/mm/yyyy'
                    w={{ base: '100%', md: '85%', lg: '75%', xl: '50%' }}
                    label="Tanggal Lahir"
                    popoverProps={{ opened: dateInputOpened, onChange: setDateInputOpened }}
                    rightSection={pickerControl}
                  />
                  <TextInput
                    styles={{ label: { fontSize: '16px', fontWeight: 'bold' }, }}
                    w={{ base: '100%', md: '85%', lg: '75%', xl: '50%' }}
                    label="Nama Orang Tua / Wali"
                    placeholder='Masukkan nama orang tua / wali'
                  />
                  <TextInput
                    styles={{ label: { fontSize: '16px', fontWeight: 'bold' }, }}
                    w={{ base: '100%', md: '85%', lg: '75%', xl: '50%' }}
                    label="No. Telepon"
                    placeholder='Masukkan no. telepon'
                  />
                  <TextInput
                    styles={{ label: { fontSize: '16px', fontWeight: 'bold' }, }}
                    w={{ base: '100%', md: '85%', lg: '75%', xl: '50%' }}
                    label="Alamat"
                    placeholder='Masukkan alamat lengkap'
                  />
                  {/* Layanan */}
                  <Text fz={'16px'} fw={"bold"}>
                    Layananan Yang Dibutuhkan
                  </Text>
                  <Box
                    w={{ base: '100%', md: '85%', lg: '75%', xl: '50%' }}
                  >
                    <Combobox
                      store={combobox}
                      resetSelectionOnOptionHover
                      withinPortal={false}
                      onOptionSubmit={(val) => {
                        setValue(val);
                        combobox.updateSelectedOptionIndex('active');
                      }}
                    >
                      <ComboboxTarget targetType="button">
                        <InputBase
                          component="button"
                          type="button"
                          pointer
                          rightSection={<ComboboxChevron />}
                          rightSectionPointerEvents="none"
                          onClick={() => combobox.toggleDropdown()}
                        >
                          {value || <InputPlaceholder>Layanan</InputPlaceholder>}
                        </InputBase>
                      </ComboboxTarget>

                      <Combobox.Dropdown>
                        <ComboboxOptions>{options}</ComboboxOptions>
                      </Combobox.Dropdown>
                    </Combobox>
                  </Box>
                  <Textarea
                    pb={10}
                    styles={{ label: { fontSize: '16px', fontWeight: 'bold' }, }} w={{ base: '100%', md: '85%', lg: '75%', xl: '50%' }}
                    label="Catatan Khusus (Opsional)"
                    placeholder='Masukkan catatan jika ada'
                  />
                  <Button
                    w={{ base: '100%', md: '85%', lg: '75%', xl: '50%' }}
                    fz={'md'} bg={colors['blue-button']}>
                    Daftar Sekarang
                  </Button>
                </Stack>
                <Paper p={'lg'} bg={colors['blue-button-trans']}>
                  <Text fz={'h3'} c={colors['white-1']} fw={'bold'}>Informasi Kontak</Text>
                  <Text fz={'h4'} c={colors['white-1']} fw={"bold"}>
                    Penanggung Jawab : <Text span fz={'h4'}>Bidan Komang Ayu</Text>
                  </Text>
                  <Text fz={'h4'} c={colors['white-1']} fw={"bold"}>
                    Telepon : <Text span fz={'h4'}>081234567890</Text>
                  </Text>
                  <Text fz={'h4'} c={colors['white-1']} fw={"bold"}>
                    Email : <Text span fz={'h4'}>puskesmasabiansemal3@gmail.com</Text>
                  </Text>
                </Paper>
                <Group>
                  <Button fz={'lg'} bg={'green'}>
                    Download Jadwal Posyandu 2025 (PDF)
                  </Button>
                </Group>
              </Stack>
            </Box>
          </Paper>
        </Stack>
      </Box>
    </Stack>
  );
}


export default Page;
