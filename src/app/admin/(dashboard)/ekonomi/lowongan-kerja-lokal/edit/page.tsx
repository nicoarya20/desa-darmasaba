'use client'
import colors from '@/con/colors';
import { Box, Button, Group, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { KeamananEditor } from '../../../keamanan/_com/keamananEditor';


function EditLowonganKerja() {
  const router = useRouter();
  return (
    <Box>
      <Box mb={10}>
        <Button onClick={() => router.back()} variant='subtle' color={'blue'}>
          <IconArrowBack color={colors['blue-button']} size={25}/>
        </Button>
      </Box>

      <Paper w={{base: '100%', md: '50%'}} bg={colors['white-1']} p={'md'}>
        <Stack gap={"xs"}>
          <Title order={4}>Edit Lowongan Kerja Lokal</Title>
          <TextInput
          label={<Text fw={"bold"} fz={"sm"}>Pekerjaan</Text>}
          placeholder='Masukkan pekerjaan'
          />
          <TextInput
          label={<Text fw={"bold"} fz={"sm"}>Nama Usaha</Text>}
          placeholder='Masukkan nama usaha'
          />
          <TextInput
          label={<Text fw={"bold"} fz={"sm"}>Alamat Usaha</Text>}
          placeholder='Masukkan alamat usaha'
          />
          <TextInput
          label={<Text fw={"bold"} fz={"sm"}>Nomor Telepon</Text>}
          placeholder='Masukkan nomor telepon'
          />
          <TextInput
          label={<Text fw={"bold"} fz={"sm"}>Gaji selama 1 bulan</Text>}
          placeholder='Masukkan gaji'
          />
          <Box>
            <Text fw={"bold"} fz={"sm"}>Deskripsi Lowongan Kerja</Text>
            <KeamananEditor
              showSubmit={false}
            />
          </Box>
          <Group>
            <Button bg={colors['blue-button']}>Submit</Button>
          </Group>
       </Stack>
      </Paper>
   </Box>
  );
}

export default EditLowonganKerja;
