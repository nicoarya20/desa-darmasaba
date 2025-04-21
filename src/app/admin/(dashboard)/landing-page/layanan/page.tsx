'use client'
import colors from '@/con/colors';
import { Box, Button, Group, Stack, Text, Textarea, Title } from '@mantine/core';
import { useState } from 'react';
import CompTextLengh from './_comp_textLengh';
import { maxLength } from './gs_maxLength';

function Page(
) {
  const [value, setValue] = useState("")
  return (
    <Box>
      <Stack gap={"xs"}>
        <Title order={2}>Layanan</Title>
        <Textarea
          label={<Text>Deskripsi</Text>}
          placeholder='tambah deskripsi'
          maxLength={maxLength}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
       <CompTextLengh input={value} maxLength={maxLength}/>
        <Group>
          <Button bg={colors['blue-button']} fz={'md'}>Submit</Button>
        </Group>
      </Stack>
    </Box>
  );
}

export default Page;
