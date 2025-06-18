'use client'
import colors from '@/con/colors';
import { Box, Button, Group, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconArrowBack, IconImageInPicture } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { KeamananEditor } from '../../_com/keamananEditor';

function CreateTipsKeamanan() {
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
          <Title order={4}>Create Tips Keamanan</Title>
          <Box>
            <Text fw={"bold"} fz={"sm"}>Masukkan Image</Text>
            <IconImageInPicture size={50} />
          </Box>
          <TextInput
          label={<Text fw={"bold"} fz={"sm"}>Nama Tips Keamanan</Text>}
          placeholder='Masukkan nama tips keamanan'
          />
          <Box>
            <Text fw={"bold"} fz={"sm"}>Deskripsi Tips Keamanan</Text>
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

export default CreateTipsKeamanan;
