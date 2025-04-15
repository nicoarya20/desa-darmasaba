'use client'
import { Box, Flex, Grid, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import React from 'react';

const tx = `
Untuk menambahkan fitur berbagi nomor WhatsApp di kode yang Anda miliki, saya akan menjelaskan beberapa pendekatan yang bisa digunakan. Biasanya ini dilakukan dengan membuat link yang ketika diklik akan membuka aplikasi WhatsApp dengan nomor tujuan yang sudah diatur.
Berikut adalah cara mengimplementasikannya pada kode React Anda:
`

function Page() {
  return (
    <Stack>
      <Grid>
        <Grid.Col span={{
          base: 12,
          sm: 6,
          md: 4,
          xl: 10
        }}>
          <Box h={"200"} bg={"blue"}>1</Box>
        </Grid.Col>
        <Grid.Col span={{
          base: 12,
          sm: 6,
          md: 8,
          xl: 2
        }}>
          <Box h={"200"} bg={"red"}>1</Box>
        </Grid.Col>
      </Grid>
      <SimpleGrid cols={{
        base: 1,
        sm: 2,
        md: 4,
        xl: 20
      }}>
        {Array.from({ length: 10 }).map((_, i) => (
          <Box key={i} h={"60"} bg={"blue"}>1</Box>
        ))}
      </SimpleGrid>
      <Flex >
        <Box w={400} h={"200"} bg={"blue"}>1</Box>
        <Box w={400}  bg={"red"}>
          <Text  fz={"42"} lineClamp={1} >{tx}</Text>
          <Text bg={"blue"} style={{
            fontSize: "2rem"
          }} lineClamp={1} >{tx}</Text>
          <Title order={1}>apa kabar</Title>
        </Box>

      </Flex>

    </Stack>
  );
}

export default Page;
