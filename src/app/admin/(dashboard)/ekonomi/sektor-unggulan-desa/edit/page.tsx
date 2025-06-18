'use client'
import colors from '@/con/colors';
import { Box, Button, Group, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { KeamananEditor } from '../../../keamanan/_com/keamananEditor';


function EditSektorUnggulanDesa() {
  const router = useRouter();
  return (
    <Box>
      <Box mb={10}>
        <Button onClick={() => router.back()} variant='subtle' color={'blue'}>
          <IconArrowBack color={colors['blue-button']} size={25} />
        </Button>
      </Box>

      <Paper w={{ base: '100%', md: '50%' }} bg={colors['white-1']} p={'md'}>
        <Stack gap={"xs"}>
          <Title order={4}>Edit Sektor Unggulan Desa</Title>
          <TextInput
            label={<Text fw={"bold"} fz={"sm"}>Nama Sektor Unggulan</Text>}
            placeholder='Masukkan nama sektor unggulan'
          />
          <Box>
            <Text fw={"bold"} fz={"sm"}>Deskripsi Sektor Unggulan</Text>
            <KeamananEditor
              showSubmit={false}
            />
          </Box>
          <TextInput
            label={<Text fw={"bold"} fz={"sm"}>Jumlah Sektor Unggulan</Text>}
            placeholder='Masukkan jumlah sektor unggulan'
          />
          <Group>
            <Button bg={colors['blue-button']}>Submit</Button>
          </Group>
        </Stack>
      </Paper>
    </Box>
  );
}

export default EditSektorUnggulanDesa;
