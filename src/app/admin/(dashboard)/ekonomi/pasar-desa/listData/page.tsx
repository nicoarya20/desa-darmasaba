import colors from '@/con/colors';
import { Box, Paper, Stack, Text, Title } from '@mantine/core';
import { IconImageInPicture } from '@tabler/icons-react';
import React from 'react';

function ListDataUsaha() {
  return (
    <Box>
      <Stack gap={"xs"}>
        <Paper bg={colors['white-1']} p={'md'} radius={10}>
          <Box>
            <Title mb={10} order={4}>List Produk Pasar Desa</Title>
            <Box>
              <Text fz={"sm"} fw={"bold"}>Foto Produk</Text>
              <IconImageInPicture size={24} color={colors['blue-button']} />
            </Box>
            <Text fz={"sm"} fw={"bold"}>Nama Produk</Text> 
            <Text></Text>
            <Text fz={"sm"} fw={"bold"}>Harga Produk</Text>
            <Text></Text>
            <Text fz={"sm"} fw={"bold"}>Rating Produk</Text>
            <Text></Text>
            <Text fz={"sm"} fw={"bold"}>Alamat Usaha</Text>
            <Text></Text>
          </Box>
        </Paper>
      </Stack>
    </Box>
  );
}

export default ListDataUsaha;
