'use client'
import jadwalkegiatanState from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/jadwalKegiatan';
import BackButton from '@/app/darmasaba/(pages)/desa/layanan/_com/BackButto';
import colors from '@/con/colors';
import { ActionIcon, Box, Button, CheckIcon, Combobox, ComboboxChevron, ComboboxOption, ComboboxOptions, ComboboxTarget, Divider, Group, InputBase, InputPlaceholder, Paper, Skeleton, Stack, Text, Textarea, TextInput, useCombobox } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useShallowEffect } from '@mantine/hooks';
import { IconCalendar } from '@tabler/icons-react';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';

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


  const params = useParams()
  const state = useProxy(jadwalkegiatanState)
  useShallowEffect(() => {
    state.findUnique.load(params?.id as string)
  }, [])

  if (!state.findUnique.data) {
    return (
      <Stack py={10}>
        <Skeleton h={500} />
      </Stack>
    )
  }
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
                  Nama Kegiatan : <Text span fz={'h4'}>{state.findUnique.data.informasijadwalkegiatan.name}</Text>
                </Text>
                <Text fz={'h4'} fw={"bold"}>
                  Tanggal : <Text span fz={'h4'}>{state.findUnique.data.informasijadwalkegiatan.tanggal}</Text>
                </Text>
                <Text fz={'h4'} fw={"bold"}>
                  Waktu : <Text span fz={'h4'}>{state.findUnique.data.informasijadwalkegiatan.waktu}</Text>
                </Text>
                <Text pb={10} fz={'h4'} fw={"bold"}>
                  Lokasi : <Text span fz={'h4'}>{state.findUnique.data.informasijadwalkegiatan.lokasi}</Text>
                </Text>
                {/* Deskripsi Kegiatan */}
                <Text fz={'h4'} fw={"bold"}>
                  Deskripsi Kegiatan
                </Text>
                <Divider />
                <Text pb={10} ta={'justify'} fz={'h4'} dangerouslySetInnerHTML={{ __html: state.findUnique.data.deskripsijadwalkegiatan.deskripsi }} />
                {/* Layanan Yang Tersedia */}
                <Text fz={'h4'} fw={"bold"}>
                  Layanan Yang Tersedia
                </Text>
                <Divider />
                <Text pb={10} ta={'justify'} fz={'h4'} dangerouslySetInnerHTML={{ __html: state.findUnique.data.layananjadwalkegiatan.content }} />
                {/* Syarat dan Ketentuan */}
                <Text fz={'h4'} fw={"bold"}>
                  Syarat dan Ketentuan
                </Text>
                <Divider />
                <Text pb={10} ta={'justify'} fz={'h4'} dangerouslySetInnerHTML={{ __html: state.findUnique.data.syaratketentuanjadwalkegiatan.content }} />
                {/* Dokumen yang Perlu Dibawa */}
                <Text fz={'h4'} fw={"bold"}>
                  Dokumen yang Perlu Dibawa
                </Text>
                <Divider />
                <Text pb={10} ta={'justify'} fz={'h4'} dangerouslySetInnerHTML={{ __html: state.findUnique.data.dokumenjadwalkegiatan.content }} />
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
