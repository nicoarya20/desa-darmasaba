'use client'
import CreateEditor from '@/app/admin/(dashboard)/_com/createEditor';
import stateDesaPengumuman from '@/app/admin/(dashboard)/_state/desa/pengumuman';
import colors from '@/con/colors';
import { Box, Button, Group, Paper, Select, Stack, Text, TextInput, Title } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { Prisma } from '@prisma/client';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';


function CreatePengumuman() {
  const pengumumanState = useProxy(stateDesaPengumuman)
  const router = useRouter();

  const handleSubmit = async () => {
    await pengumumanState.pengumuman.create.create()
    resetForm()
    router.push("/admin/desa/pengumuman")
  }

  const resetForm = () => {
    pengumumanState.pengumuman.create.form = {
      judul: "",
      deskripsi: "",
      content: "",
      categoryPengumumanId: "",
    };
  };
  return (
    <Box>
      <Box mb={10}>
        <Button onClick={() => router.back()} variant='subtle' color={'blue'}>
          <IconArrowBack color={colors['blue-button']} size={25} />
        </Button>
      </Box>

      <Paper w={{ base: '100%', md: '50%' }} bg={colors['white-1']} p={'md'}>
        <Stack gap={"xs"}>
          <Title order={4}>Create Pengumuman</Title>
          <TextInput
            label={<Text fw={"bold"} fz={"sm"}>Judul</Text>}
            placeholder='Masukkan judul'
            onChange={(val) => {
              pengumumanState.pengumuman.create.form.judul = val.target.value
            }}
          />
          <SelectCategory
            onChange={(val) => {
              pengumumanState.pengumuman.create.form.categoryPengumumanId = val.id;
            }}
          />
          <TextInput
            label={<Text fw={"bold"} fz={"sm"}>Deskripsi Singkat</Text>}
            placeholder='Masukkan deskripsi singkat'
            onChange={(val) => {
              pengumumanState.pengumuman.create.form.deskripsi = val.target.value
            }}
          />
          <Box>
            <Text fz={"sm"} fw={"bold"}>Deskripsi</Text>
            <CreateEditor
              value={pengumumanState.pengumuman.create.form.content}
              onChange={(htmlContent) => {
                pengumumanState.pengumuman.create.form.content = htmlContent;
              }}
            />
          </Box>

          <Group>
            <Button onClick={handleSubmit} bg={colors['blue-button']}>Submit</Button>
          </Group>
        </Stack>
      </Paper>
    </Box>
  );
}

function SelectCategory({
  onChange,
}: {
  onChange: (value: Prisma.CategoryPengumumanGetPayload<{ select: { name: true; id: true; } }>) => void;
}) {
  const categoryState = useProxy(stateDesaPengumuman.category);

  useShallowEffect(() => {
    categoryState.findMany.load();
  }, []);

  return (
    <Select
      label={<Text fw={"bold"} fz={"sm"}>Kategori</Text>}
      placeholder='Pilih kategori'
      data={categoryState.findMany.data?.map((item) => ({
        label: item.name,
        value: item.id,
      }))}
      onChange={(val) => {
        const selected = categoryState.findMany.data?.find((item) => item.id === val);
        if (selected) {
          onChange(selected);
        }
      }}
      searchable
      nothingFoundMessage="Tidak ditemukan"
    />
  );
}

export default CreatePengumuman;
