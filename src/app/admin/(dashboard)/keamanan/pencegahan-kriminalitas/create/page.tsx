'use client'
import colors from '@/con/colors';
import { Box, Button, Group, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';
import CreateEditor from '../../../_com/createEditor';
import pencegahanKriminalitasState from '../../../_state/keamanan/pencegahan-kriminalitas';


function CreatePencegahanKriminalitas() {
  const router = useRouter();
  const kriminalitasState = useProxy(pencegahanKriminalitasState)

  const resetForm = () => {
    kriminalitasState.create.form = {
      pencegahanKriminalitas: {
        programKeamanan: {
          nama: "",
          deskripsi: "",
          slug: "",
        },
        tipsKeamanan: {
          judul: "",
          konten: "",
          slug: "",
        },
        videoKeamanan: {
          judul: "",
          deskripsi: "",
          videoUrl: "",
          slug: "",
        },
      },
    }
  }

  const handleSubmit = async () => {
    await kriminalitasState.create.create();
    resetForm();
    router.push('/admin/keamanan/pencegahan-kriminalitas');
  }
  return (
    <Box>
      <Box mb={10}>
        <Button onClick={() => router.back()} variant='subtle' color={'blue'}>
          <IconArrowBack color={colors['blue-button']} size={25} />
        </Button>
      </Box>

      <Paper w={{ base: '100%', md: '50%' }} bg={colors['white-1']} p={'md'}>
        <Stack gap={"xs"}>
          <Title order={4}>Create Pencegahan Kriminalitas</Title>
          <TextInput
            value={kriminalitasState.create.form.pencegahanKriminalitas.programKeamanan.nama}
            onChange={(val) => {
              kriminalitasState.create.form.pencegahanKriminalitas.programKeamanan.nama = val.target.value;
            }}
            label={<Text fw={"bold"} fz={"sm"}>Judul Program Keamanan</Text>}
            placeholder='Masukkan judul Program Keamanan'
          />
          <TextInput
            value={kriminalitasState.create.form.pencegahanKriminalitas.programKeamanan.slug}
            onChange={(val) => {
              kriminalitasState.create.form.pencegahanKriminalitas.programKeamanan.slug = val.target.value;
            }}
            label={<Text fw={"bold"} fz={"sm"}>Slug Program Keamanan</Text>}
            placeholder='Masukkan slug Program Keamanan'
          />
          <Box>
            <Text fw={"bold"} fz={"sm"}>Deskripsi Program Keamanan</Text>
            <CreateEditor
              value={kriminalitasState.create.form.pencegahanKriminalitas.programKeamanan.deskripsi}
              onChange={(val) => {
                kriminalitasState.create.form.pencegahanKriminalitas.programKeamanan.deskripsi = val;
              }}
            />
          </Box>
          <TextInput
            value={kriminalitasState.create.form.pencegahanKriminalitas.tipsKeamanan.judul}
            onChange={(val) => {
              kriminalitasState.create.form.pencegahanKriminalitas.tipsKeamanan.judul = val.target.value;
            }}
            label={<Text fw={"bold"} fz={"sm"}>Judul Tips Keamanan</Text>}
            placeholder='Masukkan judul Tips Keamanan'
          />
          <TextInput
            value={kriminalitasState.create.form.pencegahanKriminalitas.tipsKeamanan.slug}
            onChange={(val) => {
              kriminalitasState.create.form.pencegahanKriminalitas.tipsKeamanan.slug = val.target.value;
            }}
            label={<Text fw={"bold"} fz={"sm"}>Slug Tips Keamanan</Text>}
            placeholder='Masukkan slug Tips Keamanan'
          />
          <Box>
            <Text fw={"bold"} fz={"sm"}>Deskripsi Tips Keamanan</Text>
            <CreateEditor
              value={kriminalitasState.create.form.pencegahanKriminalitas.tipsKeamanan.konten}
              onChange={(val) => {
                kriminalitasState.create.form.pencegahanKriminalitas.tipsKeamanan.konten = val;
              }}
            />
          </Box>
          <TextInput
            value={kriminalitasState.create.form.pencegahanKriminalitas.videoKeamanan.judul}
            onChange={(val) => {
              kriminalitasState.create.form.pencegahanKriminalitas.videoKeamanan.judul = val.target.value;
            }}
            label={<Text fw={"bold"} fz={"sm"}>Judul Video Keamanan</Text>}
            placeholder='Masukkan judul Video Keamanan'
          />
          <TextInput
            value={kriminalitasState.create.form.pencegahanKriminalitas.videoKeamanan.slug}
            onChange={(val) => {
              kriminalitasState.create.form.pencegahanKriminalitas.videoKeamanan.slug = val.target.value;
            }}
            label={<Text fw={"bold"} fz={"sm"}>Slug Video Keamanan</Text>}
            placeholder='Masukkan slug Video Keamanan'
          />
          <Box>
            <Text fw={"bold"} fz={"sm"}>Deskripsi Tips Keamanan</Text>
            <CreateEditor
              value={kriminalitasState.create.form.pencegahanKriminalitas.videoKeamanan.deskripsi}
              onChange={(val) => {
                kriminalitasState.create.form.pencegahanKriminalitas.videoKeamanan.deskripsi = val;
              }}
            />
          </Box>
          <TextInput
            value={kriminalitasState.create.form.pencegahanKriminalitas.videoKeamanan.videoUrl}
            onChange={(val) => {
              kriminalitasState.create.form.pencegahanKriminalitas.videoKeamanan.videoUrl = val.target.value;
            }}
            label={<Text fw={"bold"} fz={"sm"}>Video URL</Text>}
            placeholder='Masukkan video URL'
          />
          <Group>
            <Button onClick={handleSubmit} bg={colors['blue-button']}>Submit</Button>
          </Group>
        </Stack>
      </Paper>
    </Box>
  );
}

export default CreatePencegahanKriminalitas;
