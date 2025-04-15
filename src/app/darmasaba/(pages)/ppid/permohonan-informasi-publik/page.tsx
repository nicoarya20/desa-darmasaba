'use client'
import colors from '@/con/colors';
import { ActionIcon, Box, Button, Center, Checkbox, Combobox, ComboboxOption, Group, Input, InputBase, Paper, SimpleGrid, Stack, Text, Textarea, TextInput, useCombobox } from '@mantine/core';
import { IconDownload } from '@tabler/icons-react';
import BackButton from '../../desa/layanan/_com/BackButto';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const data = [
  {
    id: 1,
    number: '1',
    title: "Langkah 1",
    desc: "Pemohon informasi publik mengajukan permohonan informasi kepada badan publik baik langsung maupun melalui surat elektronik",
  },
  {
    id: 2,
    number: '2',
    title: "Langkah 2",
    desc: "Isi formulir permohonan informasi dengan data diri (nama, alamat, telepon), jenis, format, dan cara penyampaian informasi, serta lampiran fotokopi kartu identitas.",
  },
  {
    id: 3,
    number: '3',
    title: "Langkah 3",
    desc: "PPID akan memproses permohonan sesuai dengan ketentuan",
  },
  {
    id: 4,
    number: '4',
    title: "Langkah 4",
    desc: "Petugas PPID menyampaikan informasi sesuai permohonan kepada pemohon informasi.",
  },
]

const jenisInformasi = [
  {
    id: 1,
    jenis: 'Keuangan Desa'
  },
  {
    id: 2,
    jenis: 'Pembangunan Desa'
  },
  {
    id: 3,
    jenis: 'Data Demografi'
  },
  {
    id: 4,
    jenis: 'Lainnya'
  },
]

const memperolehInformasi = [
  {
    id: 1,
    jenis: 'Melihat/Membaca/Mendengarkan/Mencatat'
  },
  {
    id: 2,
    jenis: 'Mendapatkan Salinan Informasi (Hardcopy)'
  },
  {
    id: 3,
    jenis: 'Mendapatkan Salinan Informasi (Softcopy)'
  }
]

const mendapatkanInformasi = [
  {
    id: 1,
    jenis: 'Mengambil Langsung'
  },
  {
    id: 2,
    jenis: 'Dikirim via Post'
  },
  {
    id: 3,
    jenis: 'Dikirim via Email'
  }
]
function Page() {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  const combobox2 = useCombobox({
    onDropdownClose: () => combobox2.resetSelectedOption(),
  });

  const combobox3 = useCombobox({
    onDropdownClose: () => combobox3.resetSelectedOption(),
  });

  const [value, setValue] = useState<string | null>(null);
  const [value2, setValue2] = useState<string | null>(null);
  const [value3, setValue3] = useState<string | null>(null);



  const options = jenisInformasi.map((item) => (
    <ComboboxOption value={item.jenis} key={item.id}>
      {item.jenis}
    </ComboboxOption>
  ))

  const options2 = memperolehInformasi.map((item) => (
    <ComboboxOption value={item.jenis} key={item.id}>
      {item.jenis}
    </ComboboxOption>
  ))

  const options3 = mendapatkanInformasi.map((item) => (
    <ComboboxOption value={item.jenis} key={item.id}>
      {item.jenis}
    </ComboboxOption>
  ))
  const router = useRouter()
  return (
    <Stack pos={"relative"} bg={colors.Bg} py={"xl"} gap={"22"}>
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>
      <Text ta={"center"} fz={{ base: "h1", md: "2.5rem" }} c={colors["blue-button"]} fw={"bold"}>
        Permohonan Informasi Publik
      </Text>
      <Box px={{ base: "md", md: 100 }}>
        <Stack gap={'lg'}>
          <Paper p={"xl"} bg={colors['white-trans-1']}>
            <Text pb={30} ta={'center'} fw={"bold"} fz={{ base: 'h3', md: 'h2' }}>Tata Cara Permohonan</Text>
            <SimpleGrid
              pb={30}
              cols={{
                base: 1,
                md: 2,
                lg: 3,
                xl: 4
              }}>
              {data.map((v, k) => {
                return (
                  <Paper key={k} p={"xl"} bg={colors['blue-button']}>
                    <Stack justify='space-between'>
                      <Center>
                        <ActionIcon bg={colors['white-1']} radius={150} size={50}>
                          <Text c={colors['blue-button']} ta={"center"} fw={"bold"} fz={{ base: "h3", md: "h2" }}>{v.number}</Text>
                        </ActionIcon>
                      </Center>
                      <Text ta={"center"} c={colors['white-1']} fw={"bold"} fz={"h3"}>
                        {v.title}
                      </Text>
                      <Text ta={"center"} c={colors['white-1']} fz={'h4'}>
                        {v.desc}
                      </Text>
                    </Stack>
                  </Paper>
                )
              })}
            </SimpleGrid>
            <Center pb={30}>
              <Button fz={"h5"} bg={colors['blue-button']} leftSection={<IconDownload size={20} color={colors['white-1']} />}>
                Unduh Dokumen
              </Button>
            </Center>
            <Group justify='center'>
              <Paper p={'xl'} bg={colors['white-1']}>
                <Text fw={"bold"} fz={{ base: 'h4', md: 'h3' }} ta={"center"}>Formulir Permohonan Informasi</Text>
                <TextInput
                  styles={{ input: { padding: 20 } }}
                  py={10}
                  placeholder='Nama Lengkap'
                />
                <TextInput
                  styles={{ input: { padding: 20 } }}
                  placeholder='NIK'
                />
                <TextInput
                  styles={{ input: { padding: 20 } }}
                  py={10}
                  placeholder='No.Telepon'
                />
                <TextInput
                  styles={{ input: { padding: 20 } }}
                  placeholder="Alamat"
                />
                <TextInput
                  py={10}
                  styles={{ input: { padding: 20 } }}
                  placeholder="Email"
                />
                <TextInput
                  styles={{ input: { padding: 20 } }}
                  placeholder="Alamat"
                />
                {/* ComboBox */}
                <Box py={10}>
                  <Text fz={'sm'}>Jenis Informasi yang diminta</Text>
                  <Combobox
                    store={combobox}
                    withinPortal={false}
                    onOptionSubmit={(val) => {
                      setValue(val);
                      combobox.closeDropdown();
                    }}
                  >
                    <Combobox.Target>
                      <InputBase
                        component="button"
                        type="button"
                        pointer
                        rightSection={<Combobox.Chevron />}
                        onClick={() => combobox.toggleDropdown()}
                        rightSectionPointerEvents="none"
                      >
                        {value || <Input.Placeholder>--Pilih Jenis Informasi--</Input.Placeholder>}
                      </InputBase>
                    </Combobox.Target>

                    <Combobox.Dropdown>
                      <Combobox.Options>{options}</Combobox.Options>
                    </Combobox.Dropdown>
                  </Combobox>
                </Box>
                <Textarea
                  placeholder='Tujuan Penggunaan Informasi'
                />
                {/* ComboBox2 */}
                <Box py={10}>
                  <Text fz={'sm'}>Cara Memperoleh Informasi</Text>
                  <Combobox
                    store={combobox2}
                    withinPortal={false}
                    onOptionSubmit={(val) => {
                      setValue2(val);
                      combobox2.closeDropdown();
                    }}
                  >
                    <Combobox.Target>
                      <InputBase
                        component="button"
                        type="button"
                        pointer
                        rightSection={<Combobox.Chevron />}
                        onClick={() => combobox2.toggleDropdown()}
                        rightSectionPointerEvents="none"
                      >
                        {value2 || <Input.Placeholder>--Pilih Cara Memperoleh--</Input.Placeholder>}
                      </InputBase>
                    </Combobox.Target>

                    <Combobox.Dropdown>
                      <Combobox.Options>{options2}</Combobox.Options>
                    </Combobox.Dropdown>
                  </Combobox>
                </Box>
                {/* ComboBox3 */}
                <Box pb={10}>
                  <Text fz={'sm'}>Cara Mendapatkan Salinan Informasi</Text>
                  <Combobox
                    store={combobox3}
                    withinPortal={false}
                    onOptionSubmit={(val) => {
                      setValue3(val);
                      combobox3.closeDropdown();
                    }}
                  >
                    <Combobox.Target>
                      <InputBase
                        component="button"
                        type="button"
                        pointer
                        rightSection={<Combobox.Chevron />}
                        onClick={() => combobox3.toggleDropdown()}
                        rightSectionPointerEvents="none"
                      >
                        {value3 || <Input.Placeholder>--Pilih Cara Mendapatkan--</Input.Placeholder>}
                      </InputBase>
                    </Combobox.Target>

                    <Combobox.Dropdown>
                      <Combobox.Options>{options3}</Combobox.Options>
                    </Combobox.Dropdown>
                  </Combobox>
                </Box>
                <Box pb={10}>
                  <Checkbox
                    label="Saya menyatakan bahwa informasi yang saya berikan adalah benar dan akan menggunakan informasi yang diminta"
                  />
                </Box>
                <Button onClick={() => router.push('/darmasaba/permohonan/berhasil')} bg={"green"} fullWidth>
                  Kirim Permohonan
                </Button>
              </Paper>
            </Group>
          </Paper>
        </Stack>
      </Box>
    </Stack>
  );
}

export default Page;
