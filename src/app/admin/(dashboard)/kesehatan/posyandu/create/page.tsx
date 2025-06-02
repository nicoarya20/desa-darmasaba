'use client'
import colors from '@/con/colors';
import { Box, Button, Group, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconArrowBack, IconImageInPicture } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import React from 'react';
import { KesehatanEditor } from '../../_com/kesehatanEditor';

function CreatePosyandu() {
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
          <Title order={4}>Create Posyandu</Title>
          <Box>
            <Text fw={"bold"} fz={"sm"}>Masukkan Image</Text>
            <IconImageInPicture size={50} />
          </Box>
          <TextInput
          label={<Text fw={"bold"} fz={"sm"}>Nama Posyandu</Text>}
          placeholder='Masukkan nama posyandu'
          />
          <Box>
            <Text fw={"bold"} fz={"sm"}>Deskripsi Posyandu</Text>
            <KesehatanEditor
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

export default CreatePosyandu;
