'use client'
import jadwalkegiatanState from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/jadwalKegiatan';
import BackButton from '@/app/darmasaba/(pages)/desa/layanan/_com/BackButto';
import colors from '@/con/colors';
import {
  ActionIcon,
  Box,
  Button,
  Combobox,
  ComboboxChevron,
  ComboboxOption,
  ComboboxOptions,
  ComboboxTarget,
  Divider,
  Group,
  InputBase,
  InputPlaceholder,
  Paper,
  Skeleton,
  Stack,
  Text,
  Textarea,
  TextInput,
  useCombobox
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useShallowEffect } from '@mantine/hooks';
import { IconCalendar, IconDownload, IconPhone, IconMail, IconUser } from '@tabler/icons-react';
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
  const [dateInputOpened, setDateInputOpened] = useState(false);
  const params = useParams();
  const state = useProxy(jadwalkegiatanState);

  useShallowEffect(() => {
    state.findUnique.load(params?.id as string);
  }, []);

  const options = layanan.map((item) => (
    <ComboboxOption value={item} key={item} active={item === value}>
      <Group gap="xs">
        {item === value && <IconUser size={14} stroke={2} />}
        <span>{item}</span>
      </Group>
    </ComboboxOption>
  ));

  const pickerControl = (
    <ActionIcon onClick={() => setDateInputOpened(true)} variant="light" color="blue">
      <IconCalendar size={18} />
    </ActionIcon>
  );

  if (!state.findUnique.data) {
    return (
      <Stack py="xl" px="lg">
        <Skeleton h={500} radius="lg" />
      </Stack>
    );
  }

  return (
    <Stack pos="relative" bg={colors.Bg} py="xl" gap="lg">
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>
      <Box px={{ base: "md", md: 100 }}>
        <Stack gap="lg">
          <Paper radius="xl" shadow="md">
            <Box
              style={{ borderTopLeftRadius: 16, borderTopRightRadius: 16 }}
              bg={colors['blue-button']}
            >
              <Text p="md" fz={{ base: "h3", md: "h2" }} c={colors['white-1']} fw="bold">
                Detail & Pendaftaran Kegiatan
              </Text>
            </Box>
            <Box p="lg">
              <Stack gap="xl">
                <Stack gap="sm">
                  <Text fz="lg" fw="bold">Informasi Kegiatan</Text>
                  <Divider />
                  <Text fz="md" fw="bold">Nama Kegiatan: <Text span>{state.findUnique.data.informasijadwalkegiatan.name}</Text></Text>
                  <Text fz="md" fw="bold">Tanggal: <Text span>{state.findUnique.data.informasijadwalkegiatan.tanggal}</Text></Text>
                  <Text fz="md" fw="bold">Waktu: <Text span>{state.findUnique.data.informasijadwalkegiatan.waktu}</Text></Text>
                  <Text fz="md" fw="bold">Lokasi: <Text span>{state.findUnique.data.informasijadwalkegiatan.lokasi}</Text></Text>
                </Stack>

                <Stack gap="sm">
                  <Text fz="lg" fw="bold">Deskripsi Kegiatan</Text>
                  <Divider />
                  <Text ta="justify" fz="md" dangerouslySetInnerHTML={{ __html: state.findUnique.data.deskripsijadwalkegiatan.deskripsi }} />
                </Stack>

                <Stack gap="sm">
                  <Text fz="lg" fw="bold">Layanan yang Tersedia</Text>
                  <Divider />
                  <Text ta="justify" fz="md" dangerouslySetInnerHTML={{ __html: state.findUnique.data.layananjadwalkegiatan.content }} />
                </Stack>

                <Stack gap="sm">
                  <Text fz="lg" fw="bold">Syarat & Ketentuan</Text>
                  <Divider />
                  <Text ta="justify" fz="md" dangerouslySetInnerHTML={{ __html: state.findUnique.data.syaratketentuanjadwalkegiatan.content }} />
                </Stack>

                <Stack gap="sm">
                  <Text fz="lg" fw="bold">Dokumen yang Perlu Dibawa</Text>
                  <Divider />
                  <Text ta="justify" fz="md" dangerouslySetInnerHTML={{ __html: state.findUnique.data.dokumenjadwalkegiatan.content }} />
                </Stack>

                <Stack gap="sm">
                  <Text fz="lg" fw="bold">Formulir Pendaftaran</Text>
                  <Divider />
                  <Stack gap="md">
                    <TextInput label="Nama Balita" placeholder="Masukkan nama balita" size="md" />
                    <DateInput
                      label="Tanggal Lahir"
                      placeholder="dd/mm/yyyy"
                      size="md"
                      w={{ base: '100%', md: '85%', lg: '75%', xl: '50%' }}
                      popoverProps={{ opened: dateInputOpened, onChange: setDateInputOpened }}
                      rightSection={pickerControl}
                    />
                    <TextInput label="Nama Orang Tua / Wali" placeholder="Masukkan nama orang tua / wali" size="md" />
                    <TextInput label="Nomor Telepon" placeholder="Masukkan nomor telepon" size="md" />
                    <TextInput label="Alamat" placeholder="Masukkan alamat lengkap" size="md" />
                    <Box w={{ base: '100%', md: '85%', lg: '75%', xl: '50%' }}>
                      <Text fz="sm" fw="bold" pb={4}>Pilih Layanan</Text>
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
                            {value || <InputPlaceholder>Pilih layanan</InputPlaceholder>}
                          </InputBase>
                        </ComboboxTarget>
                        <Combobox.Dropdown>
                          <ComboboxOptions>{options}</ComboboxOptions>
                        </Combobox.Dropdown>
                      </Combobox>
                    </Box>
                    <Textarea label="Catatan Khusus (Opsional)" placeholder="Masukkan catatan jika ada" size="md" />
                    <Button size="md" radius="lg" bg={colors['blue-button']}>
                      Daftar Sekarang
                    </Button>
                  </Stack>
                </Stack>

                <Paper p="lg" radius="md" bg={colors['blue-button-trans']} shadow="sm">
                  <Stack gap="xs">
                    <Text fz="lg" c={colors['white-1']} fw="bold">Informasi Kontak</Text>
                    <Group gap="xs">
                      <IconUser size={18} color="white" />
                      <Text fz="md" c={colors['white-1']}>Penanggung Jawab: <Text span fw="bold">Bidan Komang Ayu</Text></Text>
                    </Group>
                    <Group gap="xs">
                      <IconPhone size={18} color="white" />
                      <Text fz="md" c={colors['white-1']}>081234567890</Text>
                    </Group>
                    <Group gap="xs">
                      <IconMail size={18} color="white" />
                      <Text fz="md" c={colors['white-1']}>puskesmasabiansemal3@gmail.com</Text>
                    </Group>
                  </Stack>
                </Paper>

                <Group>
                  <Button size="md" radius="lg" leftSection={<IconDownload size={18} />} color="green">
                    Unduh Jadwal Posyandu 2025 (PDF)
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
