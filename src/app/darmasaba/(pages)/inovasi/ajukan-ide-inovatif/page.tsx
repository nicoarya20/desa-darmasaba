'use client'
import CreateEditor from '@/app/admin/(dashboard)/_com/createEditor';
import ajukanIdeInovatifState from '@/app/admin/(dashboard)/_state/inovasi/ajukan-ide-inovatif';
import colors from '@/con/colors';
import { ActionIcon, Box, Button, Flex, List, ListItem, Modal, Paper, SimpleGrid, Stack, Text, TextInput, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconBulbFilled } from '@tabler/icons-react';
import { useProxy } from 'valtio/utils';
import BackButton from '../../desa/layanan/_com/BackButto';

function Page() {
  const [opened, { open, close }] = useDisclosure(false);
  const ideInovatif = useProxy(ajukanIdeInovatifState);

  const resetForm = () => {
    ideInovatif.create.form = {
      name: "",
      deskripsi: "",
      alamat: "",
      namaIde: "",
      masalah: "",
      benefit: "",
    };
  };

  const handleSubmit = async () => {
    await ideInovatif.create.create();
    resetForm();
    close();
  };

  return (
    <Stack pos="relative" bg={colors.Bg} py="xl" gap="22">
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>

      <Box px={{ base: 'md', md: 100 }}>
        <Title
          order={1}
          ta="center"
          c={colors["blue-button"]}
          fw="bold"
          style={{ fontSize: 'clamp(1.75rem, 4vw, 2.25rem)' }}
        >
          Ajukan Ide Inovatif
        </Title>
        <Text ta="center" fz={{ base: 'sm', md: 'md' }} c="black" lh="1.6">
          Desa Darmasaba percaya bahwa setiap warga memiliki potensi luar biasa untuk menciptakan perubahan positif. Platform &quot;Ajukan Ide Inovatif&quot; hadir sebagai ruang inklusif bagi seluruh masyarakat untuk mengembangkan dan mengusulkan gagasan transformatif.
        </Text>
      </Box>

      <Box px={{ base: 'md', md: 100 }}>
        <Stack gap="lg" p="lg">
          <SimpleGrid cols={{ base: 1, md: 2 }}>
            <Paper p="xl">
              <Stack gap="xs">
                <Title order={2} c={colors['blue-button']} fw="bold">
                  Tujuan Ide Inovatif Ini
                </Title>
                <List>
                  <ListItem ta="justify" fz={{ base: 'sm', md: 'md' }} lh="1.5">
                    Mendorong partisipasi aktif masyarakat
                  </ListItem>
                  <ListItem ta="justify" fz={{ base: 'sm', md: 'md' }} lh="1.5">
                    Memfasilitasi inovasi berbasis lokal
                  </ListItem>
                  <ListItem ta="justify" fz={{ base: 'sm', md: 'md' }} lh="1.5">
                    Memecahkan tantangan komunal
                  </ListItem>
                  <ListItem ta="justify" fz={{ base: 'sm', md: 'md' }} lh="1.5">
                    Mengembangkan potensi kreativitas warga
                  </ListItem>
                </List>
              </Stack>
            </Paper>

            <Paper p="xl">
              <Flex align="center" justify="space-between" direction={{ base: 'column', md: 'row' }} gap="md">
                <Box>
                  <Title order={3} c={colors['blue-button']} fw="bold" ta={{ base: 'center', md: 'start' }}>
                    Apabila Anda Ingin Mengajukan Ide Inovatif Bisa Klik Pada Gambar
                  </Title>
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
        <Paper p="md" withBorder>
          <Stack gap="xs">
            <Title order={3}>Ajukan Ide Inovatif</Title>
            <TextInput
              label={
                <Text fz="sm" fw="bold">
                  Nama
                </Text>
              }
              placeholder="masukkan nama"
              onChange={(val) => {
                ideInovatif.create.form.name = val.target.value;
              }}
            />
            <TextInput
              label={
                <Text fz="sm" fw="bold">
                  Alamat
                </Text>
              }
              placeholder="masukkan alamat"
              onChange={(val) => {
                ideInovatif.create.form.alamat = val.target.value;
              }}
            />
            <TextInput
              label={
                <Text fz="sm" fw="bold">
                  Nama Ide
                </Text>
              }
              placeholder="masukkan nama ide"
              onChange={(val) => {
                ideInovatif.create.form.namaIde = val.target.value;
              }}
            />
            <Box>
              <Text fz="sm" fw="bold">
                Deskripsi
              </Text>
              <CreateEditor
                value={ideInovatif.create.form.deskripsi}
                onChange={(htmlContent) => {
                  ideInovatif.create.form.deskripsi = htmlContent;
                }}
              />
            </Box>
            <TextInput
              label={
                <Text fz="sm" fw="bold">
                  Masalah
                </Text>
              }
              placeholder="masukkan masalah"
              onChange={(val) => {
                ideInovatif.create.form.masalah = val.target.value;
              }}
            />
            <TextInput
              label={
                <Text fz="sm" fw="bold">
                  Benefit
                </Text>
              }
              placeholder="masukkan benefit"
              onChange={(val) => {
                ideInovatif.create.form.benefit = val.target.value;
              }}
            />
            <Button bg={colors['blue-button']} onClick={handleSubmit}>
              Simpan
            </Button>
          </Stack>
        </Paper>
      </Modal>
    </Stack>
  );
}

export default Page;