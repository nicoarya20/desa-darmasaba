'use client'
import ajukanIdeInovatifState from '@/app/admin/(dashboard)/_state/inovasi/ajukan-ide-inovatif';
import colors from '@/con/colors';
import { ActionIcon, Box, Button, Flex, List, ListItem, Modal, Paper, SimpleGrid, Stack, Text, TextInput, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconArrowRight, IconBulbFilled } from '@tabler/icons-react';
import { useProxy } from 'valtio/utils';
import BackButton from '../../desa/layanan/_com/BackButto';
import CreateEditor from '@/app/admin/(dashboard)/_com/createEditor';

function Page() {
  const [opened, { open, close }] = useDisclosure(false);
  const ideInovatif = useProxy(ajukanIdeInovatifState)


  const resetForm = () => {
    // Reset state di valtio
    ideInovatif.create.form = {
      name: "",
      deskripsi: "",
      alamat: "",
      namaIde: "",
      masalah: "",
      benefit: "",
    };

    // Reset state lokal
  };

  const handleSubmit = async () => {
    // Submit data berita
    await ideInovatif.create.create();

    // Reset form setelah submit
    resetForm();
    close();
  };
  return (
    <Stack pos={"relative"} bg={colors.Bg} py={"xl"} gap={"22"}>
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>
      <Box px={{ base: 'md', md: 100 }} >
        <Text ta={"center"} fz={{ base: "h1", md: "2.5rem" }} c={colors["blue-button"]} fw={"bold"}>
          Ajukan Ide Inovatif
        </Text>
        <Text ta={'center'} fz={'h4'}>Desa Darmasaba percaya bahwa setiap warga memiliki potensi luar biasa untuk menciptakan perubahan positif. Platform &quot;Ajukan Ide Inovatif&quot; hadir sebagai ruang inklusif bagi seluruh masyarakat untuk mengembangkan dan mengusulkan gagasan transformatif.</Text>
      </Box>
      <Box px={{ base: "md", md: 100 }}>
        <Stack gap={'lg'} p={'lg'}>
          <SimpleGrid
            cols={{
              base: 1,
              md: 2,
            }}
          >
            <Paper p={'xl'} >
              <Stack gap={"xs"}>
              <Text fz={'h3'} fw={'bold'} c={colors['blue-button']}>Tujuan Ide Inovatif Ini</Text>
              <List>
                <ListItem ta={'justify'} fz={{ base: 'h4', md: 'lg' }}>Mendorong partisipasi aktif masyarakat</ListItem>
                <ListItem ta={'justify'} fz={{ base: 'h4', md: 'lg' }}>Memfasilitasi inovasi berbasis lokal</ListItem>
                <ListItem ta={'justify'} fz={{ base: 'h4', md: 'lg' }}>Memecahkan tantangan komunal</ListItem>
                <ListItem ta={'justify'} fz={{ base: 'h4', md: 'lg' }}>Mengembangkan potensi kreativitas warga</ListItem>
              </List>
              </Stack>
            </Paper>
            <Paper p={'xl'} >
              <Flex align={'center'} justify={'space-between'}>
                <Box>
                  <Text fz={'h4'} fw={'bold'} c={colors['blue-button']}>Apabila Anda Ingin Mengajukan Ide Inovatif Bisa Klik Pada Gambar Di Samping</Text>
                  <IconArrowRight size={30} color={colors['blue-button']} />
                </Box>
                <Box px={{ base: 5, md: 10 }} py={5}>
                  <ActionIcon variant="transparent" size={150} onClick={open}>
                    <IconBulbFilled size={150} color={colors['blue-button']} />
                  </ActionIcon>
                </Box>
              </Flex>
            </Paper>
          </SimpleGrid>
        </Stack>
      </Box>

      <Modal
        opened={opened}
        onClose={close}
        radius={0}
        transitionProps={{ transition: 'fade', duration: 200 }}
      >
        <Paper p={"md"} withBorder>
          <Stack gap={"xs"}>
            <Title order={3}>Ajukan Ide Inovatif</Title>
            <TextInput
              label={<Text fz={"sm"} fw={"bold"}>Nama</Text>}
              placeholder="masukkan nama"
              onChange={(val) => {
                ideInovatif.create.form.name = val.target.value
              }}
            />
            <TextInput
              label={<Text fz={"sm"} fw={"bold"}>Alamat</Text>}
              placeholder="masukkan alamat"
              onChange={(val) => {
                ideInovatif.create.form.alamat = val.target.value
              }}
            />
            <TextInput
              label={<Text fz={"sm"} fw={"bold"}>Nama Ide</Text>}
              placeholder="masukkan nama ide"
              onChange={(val) => {
                ideInovatif.create.form.namaIde = val.target.value
              }}
            />
            <Box>
              <Text fz={"sm"} fw={"bold"}>Deskripsi</Text>
              <CreateEditor
                value={ideInovatif.create.form.deskripsi}
                onChange={(htmlContent) => {
                  ideInovatif.create.form.deskripsi = htmlContent;
                }}
              />
            </Box>
            <TextInput
              label={<Text fz={"sm"} fw={"bold"}>Masalah</Text>}
              placeholder="masukkan masalah"
              onChange={(val) => {
                ideInovatif.create.form.masalah = val.target.value
              }}
            />
            <TextInput
              label={<Text fz={"sm"} fw={"bold"}>Benefit</Text>}
              placeholder="masukkan benefit"
              onChange={(val) => {
                ideInovatif.create.form.benefit = val.target.value
              }}
            />
            <Button bg={colors['blue-button']} onClick={handleSubmit}>Simpan</Button>
          </Stack>
        </Paper>
      </Modal>

    </Stack>
  );
}

export default Page;
